"use client";
import { useState, useEffect, useRef } from "react";
import { Card, INK, MUTED, O, SectionTitle } from "./shared.jsx";

const Inp = {
  width:"100%", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)",
  borderRadius:12, padding:"10px 14px", fontSize:13, color:INK,
  fontFamily:"'Manrope',system-ui,sans-serif", outline:"none",
  transition:"border-color .15s", boxSizing:"border-box",
};

const Label = ({ children }) => (
  <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase",
    letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>
    {children}
  </label>
);

// ── Autocomplete indirizzo con Photon (OpenStreetMap) ──
function AddressAutocomplete({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => setQuery(value || ""), [value]);

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(v) {
    setQuery(v);
    onChange(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!v || v.length < 2) { setSuggestions([]); setOpen(false); return; }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(v)}&limit=6&lang=it`);
        const d = await res.json();
        setSuggestions(d.features || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function pick(feat) {
    const p = feat.properties || {};
    const addr = [p.street, p.housenumber].filter(Boolean).join(" ");
    const full = {
      address: addr || p.name || "",
      city: p.city || p.district || p.locality || "",
      zip: p.postcode || "",
      region: p.state || p.county || "",
      country: p.country || "",
      lat: feat.geometry?.coordinates?.[1] || null,
      lng: feat.geometry?.coordinates?.[0] || null,
    };
    setQuery(feat.properties.name || addr);
    onSelect(full);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      <Label>Cerca indirizzo (autocomplete)</Label>
      <input
        value={query}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Inizia a scrivere: es. Via Roma 1, Napoli..."
        style={{ ...Inp, borderColor: open ? O : "rgba(0,0,0,.1)" }}
      />
      {loading && (
        <p style={{ fontSize:11, color:MUTED, margin:"6px 0 0" }}>🔍 Ricerca...</p>
      )}
      {open && suggestions.length > 0 && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0, zIndex:100,
          background:"white", border:"1px solid rgba(0,0,0,.1)",
          borderRadius:12, marginTop:4, overflow:"hidden",
          boxShadow:"0 12px 24px -8px rgba(0,0,0,.15)", maxHeight:260, overflowY:"auto"
        }}>
          {suggestions.map((f, i) => {
            const p = f.properties || {};
            const main = [p.street, p.housenumber].filter(Boolean).join(" ") || p.name || "—";
            const sub = [p.city, p.postcode, p.state].filter(Boolean).join(", ");
            return (
              <button key={i} type="button" onClick={() => pick(f)}
                style={{
                  width:"100%", textAlign:"left", background:"white", border:"none",
                  borderBottom: i < suggestions.length - 1 ? "1px solid rgba(0,0,0,.05)" : "none",
                  padding:"10px 14px", cursor:"pointer", fontFamily:"inherit",
                  display:"flex", flexDirection:"column", gap:2
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#fbfaf8"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <span style={{ fontSize:13, fontWeight:700, color:INK }}>{main}</span>
                <span style={{ fontSize:11, color:MUTED }}>{sub}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrganizerPublicProfile({ userId }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/organizer/profile?userId=${userId}`)
      .then(r => r.json())
      .then(d => setForm(d || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Chiamato quando l'utente seleziona un indirizzo dal dropdown
  function handleAddressSelect(data) {
    setForm(p => ({
      ...p,
      address: data.address,
      city: data.city,
      zip: data.zip,
      region: data.region,
      lat: data.lat,
      lng: data.lng,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/organizer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { setMsg(d.error || "Errore salvataggio"); return; }
      setMsg("✓ Profilo pubblico aggiornato");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Errore tecnico. Riprova.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card><p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Caricamento...</p></Card>;

  const mapUrl = form.lat && form.lng ? `https://www.google.com/maps?q=${form.lat},${form.lng}` : null;

  return (
    <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Geolocalizzazione con autocomplete */}
      <Card>
        <SectionTitle>📍 Posizione del locale</SectionTitle>
        <p style={{ fontSize:12, color:MUTED, margin:"0 0 14px", lineHeight:1.5 }}>
          Inizia a digitare l'indirizzo e seleziona un risultato dal menu. Città, CAP, coordinate e mappa si compileranno automaticamente.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <AddressAutocomplete
            value={form.address}
            onChange={v => upd("address", v)}
            onSelect={handleAddressSelect}
          />

          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10 }}>
            <div>
              <Label>Città</Label>
              <input value={form.city || ""} onChange={e => upd("city", e.target.value)}
                placeholder="Napoli" style={Inp} />
            </div>
            <div>
              <Label>CAP</Label>
              <input value={form.zip || ""} onChange={e => upd("zip", e.target.value)}
                placeholder="80100" style={Inp} />
            </div>
            <div>
              <Label>Provincia</Label>
              <input value={form.region || ""} onChange={e => upd("region", e.target.value)}
                placeholder="NA" style={Inp} />
            </div>
          </div>

          {form.lat && form.lng && (
            <div style={{ background:`${O}08`, border:`1px solid ${O}30`, borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:INK, fontWeight:600 }}>
                📍 Coordinate: {Number(form.lat).toFixed(5)}, {Number(form.lng).toFixed(5)}
              </span>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:12, color:O, fontWeight:700, textDecoration:"none" }}>
                Apri mappa →
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* Contatti pubblici */}
      <Card>
        <SectionTitle>📞 Contatti pubblici</SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <Label>Telefono pubblico</Label>
            <input value={form.phone || ""} onChange={e => upd("phone", e.target.value)}
              placeholder="+39 081 1234567" style={Inp} />
          </div>
          <div>
            <Label>Email pubblica</Label>
            <input type="email" value={form.public_email || ""}
              onChange={e => upd("public_email", e.target.value)}
              placeholder="info@locale.it" style={Inp} />
          </div>
          <div>
            <Label>Sito web</Label>
            <input value={form.website || ""} onChange={e => upd("website", e.target.value)}
              placeholder="https://www.locale.it" style={Inp} />
          </div>
        </div>
      </Card>

      {/* Social */}
      <Card>
        <SectionTitle>📱 Social media</SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <Label>Instagram</Label>
            <input value={form.instagram || ""} onChange={e => upd("instagram", e.target.value)}
              placeholder="@nome_locale" style={Inp} />
          </div>
          <div>
            <Label>Facebook</Label>
            <input value={form.facebook || ""} onChange={e => upd("facebook", e.target.value)}
              placeholder="facebook.com/nome_locale" style={Inp} />
          </div>
          <div>
            <Label>TikTok</Label>
            <input value={form.tiktok || ""} onChange={e => upd("tiktok", e.target.value)}
              placeholder="@nome_locale" style={Inp} />
          </div>
        </div>
      </Card>

      {/* Descrizione */}
      <Card>
        <SectionTitle>✨ Descrizione del locale</SectionTitle>
        <textarea value={form.description || ""}
          onChange={e => upd("description", e.target.value)}
          rows={4}
          placeholder="Racconta com'è il tuo locale: capienza, atmosfera, genere musicale..."
          style={{ ...Inp, resize:"vertical", lineHeight:1.6 }} />
      </Card>

      {/* Submit */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button type="submit" disabled={saving}
          style={{ background:O, color:"white", border:"none", borderRadius:100,
            padding:"12px 28px", fontWeight:800, fontSize:14, cursor: saving ? "not-allowed" : "pointer",
            fontFamily:"'Manrope',system-ui,sans-serif", opacity: saving ? .7 : 1,
            boxShadow:`0 10px 24px -10px ${O}80` }}>
          {saving ? "Salvataggio..." : "Salva profilo pubblico"}
        </button>
        {msg && (
          <p style={{ fontSize:12, fontWeight:700, margin:0,
            color: msg.startsWith("✓") ? "#16a34a" : "#dc2626" }}>{msg}</p>
        )}
      </div>
    </form>
  );
}