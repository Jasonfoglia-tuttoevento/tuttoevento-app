"use client";
import VerifiedBadge from "@/components/VerifiedBadge";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";

import { useState, useEffect, useRef } from "react";

function ProLock({ feature = "questa funzionalità", children, plan, collapsedLabel }) {
  const isPro = plan === "pro";
  const [open, setOpen] = useState(false);
  if (isPro) return children ?? null;

  // Versione collassata: piccolo banner cliccabile, non occupa spazio in prima vista
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,90,0,.04)", border:"1px dashed rgba(255,90,0,.25)", borderRadius:100, padding:"8px 16px", cursor:"pointer", width:"fit-content", fontFamily:"Manrope,system-ui,sans-serif" }}>
        <span style={{ fontSize:13 }}>🔒</span>
        <span style={{ fontSize:12, fontWeight:700, color:"#ff5a00" }}>{collapsedLabel || "Filtri avanzati + AI matching"}</span>
        <ProBadge />
      </button>
    );
  }

  return (
    <div style={{ background:"rgba(255,90,0,.04)", border:"1px dashed rgba(255,90,0,.25)", borderRadius:18, padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:12, position:"relative" }}>
      <button type="button" onClick={() => setOpen(false)}
        style={{ position:"absolute", top:10, right:10, background:"none", border:"none", cursor:"pointer", color:"#6b6b73", fontSize:16, lineHeight:1, padding:4 }}>
        ×
      </button>
      <div style={{ width:36, height:36, borderRadius:10, background:"#0a0a0b", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="7" width="12" height="9" rx="2" fill="white"/>
          <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:14, color:"#0a0a0b", margin:"0 0 4px", letterSpacing:"-.02em" }}>Funzione Piano Pro</p>
        <p style={{ fontFamily:"Manrope,system-ui,sans-serif", fontSize:12, color:"#6b6b73", margin:0, lineHeight:1.5 }}>{feature} è disponibile nel piano Pro.</p>
      </div>
      <div style={{ background:"rgba(255,90,0,.08)", border:"1px solid rgba(255,90,0,.2)", borderRadius:100, padding:"7px 16px", fontSize:11, color:"#ff5a00", fontWeight:700, fontFamily:"Manrope,system-ui,sans-serif" }}>
        Disponibile a breve · €19,90/mese
      </div>
    </div>
  );
}

function ProBadge() {
  return <span style={{ display:"inline-flex", alignItems:"center", background:"rgba(255,90,0,.12)", border:"1px solid rgba(255,90,0,.25)", borderRadius:100, padding:"1px 8px", fontSize:10, fontWeight:800, color:"#ff5a00", verticalAlign:"middle", marginLeft:6 }}>PRO</span>;
}


const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "20px 22px", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "-.02em", color: INK, marginBottom: 14, marginTop: 0 }}>{children}</h3>;
}

function Inp({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "'Manrope',system-ui,sans-serif" }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none", width: "100%" }} />
    </div>
  );
}


/* ─── VenuePhotoUploader ─────────────────────────────────────── */
function VenuePhotoUploader({ photo, onPhotoChange }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [preview, setPreview] = useState(photo || "");
  const fileRef   = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => { setPreview(photo || ""); }, [photo]);

  async function handleFile(file) {
    if (!file) return;
    const allowed = ["image/jpeg","image/jpg","image/png","image/webp","application/pdf"];
    if (!allowed.includes(file.type)) {
      setError("Formato non supportato. Usa JPG, PNG, WebP o PDF."); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File troppo grande. Massimo 10MB."); return;
    }
    setError(""); setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "venue");
    try {
      const res = await fetch("/api/venue-profile/upload-photo", { method:"POST", body:fd });
      const d   = await res.json();
      if (!res.ok) { setError(d.error || "Errore upload"); }
      else { setPreview(d.url); onPhotoChange(d.url); }
    } catch { setError("Errore di rete"); }
    setLoading(false);
  }

  return (
    <div>
      <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:8, fontFamily:"'Manrope',system-ui,sans-serif" }}>
        Foto locale
      </label>
      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        {/* Anteprima */}
        <div style={{ position:"relative", flexShrink:0 }}>
          {preview ? (
            <img src={preview} alt="Foto locale"
              style={{ width:72, height:72, borderRadius:14, objectFit:"cover", border:"1px solid rgba(0,0,0,.1)" }} />
          ) : (
            <div style={{ width:72, height:72, borderRadius:14, background:"rgba(255,90,0,.08)", border:"1.5px dashed rgba(255,90,0,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          )}
          {loading && (
            <div style={{ position:"absolute", inset:0, borderRadius:14, background:"rgba(255,255,255,.8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:18, height:18, border:"2px solid rgba(0,0,0,.1)", borderTopColor:ORANGE, borderRadius:"50%", animation:"spin .7s linear infinite" }} />
            </div>
          )}
        </div>

        {/* Bottoni */}
        <div style={{ display:"flex", flexDirection:"column", gap:7, flex:1 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button type="button" onClick={()=>cameraRef.current?.click()}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 13px", borderRadius:100, background:"white", border:"1px solid rgba(0,0,0,.1)", fontSize:12, fontWeight:700, color:INK, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Scatta foto
            </button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment"
              style={{ display:"none" }} onChange={e=>handleFile(e.target.files?.[0])} />

            <button type="button" onClick={()=>fileRef.current?.click()}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 13px", borderRadius:100, background:"white", border:"1px solid rgba(0,0,0,.1)", fontSize:12, fontWeight:700, color:INK, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Galleria / File
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              style={{ display:"none" }} onChange={e=>handleFile(e.target.files?.[0])} />
          </div>
          <p style={{ fontSize:11, color:MUTED, margin:0, fontFamily:"'Manrope',system-ui,sans-serif" }}>JPG, PNG, WebP o PDF · max 10MB</p>
          {error && <p style={{ fontSize:11, fontWeight:700, color:"#dc2626", margin:0 }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Overview ──────────────────────────────────────────────
function TabOverview({ currentUser, bookings, plan }) {
  const pending   = bookings.filter(b => ["pending","in_attesa"].includes((b.status||"").toLowerCase())).length;
  const confirmed = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase())).length;
  const fmt = n => new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);
  const spent = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()))
    .reduce((s, b) => s + (Number(b.publicPrice) || Number(b.cachet) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
        {[["Richieste inviate", bookings.length, false],["Booking confermati", confirmed, false],["Budget speso", fmt(spent), true]].map(([label, val, accent]) => (
          <div key={label} style={{ background: accent ? INK : "white", border: `1px solid ${accent ? "transparent" : "rgba(0,0,0,.06)"}`, borderRadius: 20, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: accent ? "rgba(255,255,255,.5)" : MUTED, margin: "0 0 6px" }}>{label}</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-.03em", color: accent ? "white" : INK, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {bookings.length > 0 && (
        <Card>
          <SectionTitle>Ultime richieste</SectionTitle>
          {bookings.slice(0, 5).map((b, i) => (
            <div key={b.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)", gap: 10 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{b.artistName || "—"}</p>
                <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{b.eventDate || b.date || "—"}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                background: ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()) ? "rgba(22,163,74,.1)" : "rgba(217,119,6,.1)",
                color: ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()) ? "#16a34a" : "#d97706" }}>
                {b.status || "—"}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── Tab: Marketplace ───────────────────────────────────────────
const DURATIONS = [
  { key:"1h",      label:"1 ora"  },
  { key:"2h",      label:"2 ore"  },
  { key:"3h",      label:"3 ore"  },
  { key:"fullday", label:"Full day" },
];

function ContactRequestModal({ artist, onClose }) {
  const eventTypes = Array.isArray(artist.eventTypes) ? artist.eventTypes : [];
  const publicPricing = artist.publicPricing || {};

  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [duration, setDuration]   = useState("");
  const [notes, setNotes]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);

  // Prezzo pubblico per la combinazione tipo evento + durata selezionata
  const price = (eventType && duration) ? (publicPricing?.[eventType]?.[duration] || null) : null;
  const canSubmit = !!(eventDate && eventType && duration && price);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          eventDate, eventType,
          duration,
          budget: price,
          notes,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Errore invio richiesta"); setLoading(false); return; }
      setDone(true);
    } catch {
      setError("Errore di rete. Riprova.");
    }
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.5)" }} onClick={onClose} />
      <div style={{ position:"relative", background:"white", borderRadius:20, padding:24, maxWidth:420, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
        <button type="button" onClick={onClose}
          style={{ position:"absolute", top:14, right:14, background:"rgba(0,0,0,.05)", border:"none", borderRadius:100, width:28, height:28, cursor:"pointer", fontSize:15, color:"#6b6b73" }}>
          ×
        </button>

        {done ? (
          <div style={{ textAlign:"center", padding:"12px 0" }}>
            <div style={{ width:54, height:54, borderRadius:"50%", background:"rgba(22,163,74,.1)", border:"2px solid rgba(22,163,74,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, margin:"0 0 8px" }}>Richiesta inviata!</p>
            <p style={{ fontSize:13, color:"#6b6b73", margin:"0 0 20px", lineHeight:1.6 }}>
              Il team TuttoEvento ti contatterà a breve per i dettagli su {artist.stageName || artist.name}.
            </p>
            <button type="button" onClick={onClose}
              style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"11px 28px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
              Chiudi
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, margin:"0 0 4px" }}>Richiedi contatto</p>
            <p style={{ fontSize:13, color:"#6b6b73", margin:"0 0 18px" }}>
              Per <strong style={{color:INK}}>{artist.stageName || artist.name}</strong> — seleziona tipo evento e durata per vedere il prezzo.
            </p>

            {eventTypes.length === 0 ? (
              <div style={{ background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.2)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"#dc2626", margin:0 }}>
                  Questo artista non ha ancora impostato i tipi di evento. Riprova più tardi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <Inp label="Data evento" type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} />

                {/* Tipo evento — checkbox tra quelli offerti dall'artista */}
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#6b6b73", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:8 }}>Tipo evento</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {eventTypes.map(et => {
                      const active = eventType === et;
                      return (
                        <button key={et} type="button" onClick={() => setEventType(et)}
                          style={{
                            padding:"7px 14px", borderRadius:100, fontSize:12, fontWeight:700, cursor:"pointer",
                            fontFamily:"'Manrope',system-ui,sans-serif",
                            border: active ? `1px solid ${ORANGE}` : "1px solid rgba(0,0,0,.12)",
                            background: active ? "rgba(255,90,0,.08)" : "white",
                            color: active ? ORANGE : "#6b6b73",
                          }}>
                          {et}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Durata */}
                {eventType && (
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:"#6b6b73", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:8 }}>Durata</label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {DURATIONS.map(d => {
                        const active = duration === d.key;
                        const hasPrice = !!(publicPricing?.[eventType]?.[d.key]);
                        return (
                          <button key={d.key} type="button" disabled={!hasPrice} onClick={() => setDuration(d.key)}
                            style={{
                              padding:"7px 14px", borderRadius:100, fontSize:12, fontWeight:700,
                              cursor: hasPrice ? "pointer" : "not-allowed",
                              fontFamily:"'Manrope',system-ui,sans-serif",
                              border: active ? `1px solid ${ORANGE}` : "1px solid rgba(0,0,0,.12)",
                              background: active ? "rgba(255,90,0,.08)" : "white",
                              color: !hasPrice ? "rgba(0,0,0,.25)" : (active ? ORANGE : "#6b6b73"),
                              opacity: hasPrice ? 1 : .5,
                            }}>
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Prezzo pubblico */}
                {eventType && duration && (
                  price ? (
                    <div style={{ background:"rgba(22,163,74,.06)", border:"1px solid rgba(22,163,74,.2)", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#16a34a" }}>Prezzo per questa fascia</span>
                      <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:"#16a34a" }}>€{price}</span>
                    </div>
                  ) : (
                    <div style={{ background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.2)", borderRadius:12, padding:"12px 14px" }}>
                      <p style={{ fontSize:12, fontWeight:600, color:"#dc2626", margin:0 }}>
                        Prezzo non ancora disponibile per questa combinazione. Scegli un'altra durata.
                      </p>
                    </div>
                  )
                )}

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#6b6b73", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:6 }}>Note</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Dettagli aggiuntivi sull'evento..."
                    style={{ width:"100%", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:"'Manrope',system-ui,sans-serif", resize:"vertical", boxSizing:"border-box" }} />
                </div>

                {error && <p style={{ fontSize:12, color:"#dc2626", fontWeight:600, margin:0 }}>{error}</p>}

                <button type="submit" disabled={loading || !canSubmit}
                  style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"12px", fontWeight:800, fontSize:14, cursor:(loading||!canSubmit)?"not-allowed":"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:(loading||!canSubmit)?.5:1 }}>
                  {loading ? "Invio..." : canSubmit ? `Invia richiesta — €${price} →` : "Seleziona tipo evento e durata"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TabMarketplace({ artists, plan }) {
  const [search, setSearch]     = useState("");
  const [genreFilter, setGenre] = useState("");
  const [contactArtist, setContactArtist] = useState(null);

  const filtered = artists.filter(a => {
    const name = (a.stageName || a.name || "").toLowerCase();
    // musicGenres è un array — uniscilo in stringa prima di confrontare
    const genresArr = Array.isArray(a.musicGenres) ? a.musicGenres : (Array.isArray(a.genres) ? a.genres : []);
    const genre = genresArr.join(" ").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchGenre  = !genreFilter || genre.includes(genreFilter.toLowerCase());
    return matchSearch && matchGenre;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Filtri base */}
      <Card>
        <SectionTitle>Cerca artisti</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label="Nome / stile" value={search} onChange={e => setSearch(e.target.value)} placeholder="Es. DJ, cantante..." />
          <Inp label="Genere" value={genreFilter} onChange={e => setGenre(e.target.value)} placeholder="Es. House, Jazz..." />
        </div>
      </Card>

      {/* Filtri avanzati + AI matching — solo PRO, collassato di default */}
      <ProLock feature="I filtri avanzati e l'AI matching" plan={plan} collapsedLabel="Filtri avanzati + AI matching">
        <Card>
          <SectionTitle>Filtri avanzati + AI matching <ProBadge /></SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
            <Inp label="Budget max (€)" placeholder="Es. 500" />
            <Inp label="Distanza (km)" placeholder="Es. 50" />
            <Inp label="Disponibilità" type="date" placeholder="" />
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,90,0,.06)", borderRadius: 12, fontSize: 13, color: ORANGE, fontWeight: 700 }}>
            🤖 AI matching: suggerisce i 3 artisti più adatti in base a storico, budget e tipo evento
          </div>
        </Card>
      </ProLock>

      {/* Grid artisti */}
      {filtered.length === 0 ? (
        <Card><p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun artista trovato.</p></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {filtered.map(a => (
            <div key={a.id} style={{ background: "white", border: "1px solid rgba(0,0,0,.07)", borderRadius: 22, overflow: "hidden", transition: "box-shadow .2s" }}>
              {a.photo && <img src={a.photo} alt={a.stageName || a.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, margin: 0 }}>{a.stageName || a.name}</p>
                {a.verified && <VerifiedBadge size={15} />}
              </div>
                </div>
                <p style={{ fontSize: 12, color: ORANGE, fontWeight: 700, margin: "0 0 4px" }}>{(Array.isArray(a.musicGenres) && a.musicGenres.length) ? a.musicGenres.join(", ") : (Array.isArray(a.genres) && a.genres.length) ? a.genres.join(", ") : "—"}</p>
                <p style={{ fontSize: 12, color: MUTED, margin: "0 0 12px" }}>📍 {a.city || "Italia"}</p>
                <button type="button" onClick={() => setContactArtist(a)}
                  style={{ width: "100%", background: INK, color: "white", border: "none", borderRadius: 12, padding: "10px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif" }}>
                  Richiedi contatto
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {contactArtist && <ContactRequestModal artist={contactArtist} onClose={() => setContactArtist(null)} />}
    </div>
  );
}

// ── Tab: CRM ───────────────────────────────────────────────────
function TabCRM({ bookings, plan }) {
  const [notes, setNotes] = useState({});

  const STATI = ["pending","reviewed","confirmed","rejected"];
  const STATUS_LABEL = { pending:"In attesa", reviewed:"In revisione", confirmed:"Confermato", rejected:"Rifiutato" };
  const STATUS_COLOR = { pending:"#d97706", reviewed:"#2563eb", confirmed:"#16a34a", rejected:"#dc2626" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Pipeline base */}
      <Card>
        <SectionTitle>Pipeline richieste</SectionTitle>
        {bookings.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessuna richiesta inviata ancora.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bookings.slice(0, 8).map((b, i) => (
              <div key={b.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fbfaf8", borderRadius: 16, padding: "12px 16px", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.artistName || "Artista"}</p>
                  <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{b.eventDate || "—"} {b.eventTitle ? `· ${b.eventTitle}` : ""}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, flexShrink: 0,
                  background: (STATUS_COLOR[b.status] || "#6b7280") + "18",
                  color: STATUS_COLOR[b.status] || "#6b7280" }}>
                  {STATUS_LABEL[b.status] || b.status || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* CRM avanzato — solo PRO */}
      <ProLock feature="Il CRM completo con note, rating e storico" plan={plan}>
        <Card>
          <SectionTitle>CRM avanzato — Note & Rating <ProBadge /></SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(bookings.slice(0, 3)).map((b, i) => (
              <div key={b.id || i} style={{ background: "#fbfaf8", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(0,0,0,.07)" }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 8px" }}>{b.artistName || "Artista"}</p>
                <textarea placeholder="Aggiungi note private su questo artista..." rows={2}
                  style={{ width: "100%", background: "white", border: "1px solid rgba(0,0,0,.1)", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none", resize: "none" }} />
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#fbbf24" }}>★</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </ProLock>

      {/* Export CSV — solo PRO */}
      <ProLock feature="L'export CSV dei dati" plan={plan}>
        <Card>
          <SectionTitle>Export dati <ProBadge /></SectionTitle>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>Esporta tutto lo storico booking e contatti in formato CSV.</p>
          <button disabled style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "not-allowed", fontFamily: "'Manrope',system-ui,sans-serif", opacity: .5 }}>
            Esporta CSV
          </button>
        </Card>
      </ProLock>
    </div>
  );
}

// ── Tab: Analitiche ────────────────────────────────────────────
function TabAnalitiche({ bookings, plan }) {
  const fmt = n => new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);
  const confirmed = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const spent = confirmed.reduce((s, b) => s + (Number(b.publicPrice) || Number(b.cachet) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
        {[["Booking totali", bookings.length],["Confermati", confirmed.length],["Budget totale", fmt(spent)]].map(([label, val]) => (
          <div key={label} style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 20, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: MUTED, margin: "0 0 6px" }}>{label}</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: INK, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Analitiche avanzate — solo PRO */}
      <ProLock feature="Le analitiche avanzate e il benchmark di zona" plan={plan}>
        <Card>
          <SectionTitle>Analitiche avanzate + benchmark zona <ProBadge /></SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: 14 }}>
            {["Trend serate","Generi più prenotati","Benchmark budget zona"].map(label => (
              <div key={label} style={{ background: "#fbfaf8", borderRadius: 14, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: INK, margin: 0 }}>—</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: MUTED }}>Confronta le tue performance con altri locali nella tua zona.</p>
        </Card>
      </ProLock>

      {/* Multi-utente staff — solo PRO */}
      <ProLock feature="La gestione multi-utente dello staff" plan={plan}>
        <Card>
          <SectionTitle>Multi-utente staff <ProBadge /></SectionTitle>
          <p style={{ fontSize: 13, color: MUTED }}>Aggiungi fino a 5 membri del tuo staff con accesso alla dashboard. Ognuno ha le proprie credenziali e permessi.</p>
          <button disabled style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "not-allowed", fontFamily: "'Manrope',system-ui,sans-serif", opacity: .5, marginTop: 12 }}>
            + Aggiungi membro staff
          </button>
        </Card>
      </ProLock>
    </div>
  );
}

// ── Tab: Estratto conto ────────────────────────────────────────
function TabEstratto({ bookings }) {
  const fmt = n => new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);
  const confirmed = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const total = confirmed.reduce((s, b) => s + (Number(b.publicPrice) || Number(b.cachet) || 0), 0);

  return (
    <Card>
      <SectionTitle>Estratto conto</SectionTitle>
      {confirmed.length === 0 ? (
        <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun booking confermato ancora.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(0,0,0,.07)" }}>
                {["Artista","Evento","Data","Importo"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confirmed.map((b, i) => (
                <tr key={b.id || i} style={{ borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{b.artistName || "—"}</td>
                  <td style={{ padding: "10px 12px", color: MUTED }}>{b.eventTitle || "—"}</td>
                  <td style={{ padding: "10px 12px", color: MUTED }}>{b.eventDate || "—"}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: ORANGE }}>{fmt(Number(b.publicPrice) || Number(b.cachet) || 0)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(0,0,0,.1)", background: "#fbfaf8" }}>
                <td colSpan={3} style={{ padding: "12px", fontWeight: 800 }}>TOTALE SPESO</td>
                <td style={{ padding: "12px", fontWeight: 800, color: ORANGE, fontSize: 15 }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function OrganizerArea({ currentUser, events = [], artists = [], bookings = [], title, setTitle, date, setDate, artist, setArtist, promoter, setPromoter, tab: initialTab }) {
  const plan = currentUser?.plan || "free";
  const tabMap = { bookings:"crm", analytics:"analitiche", earnings:"estratto" };
  const [tab, setTab] = useState(tabMap[initialTab] || initialTab || "overview");

  const [venueName, setVenueName]   = useState("");
  const [venueCity, setVenueCity]   = useState("");
  const [venueType, setVenueType]   = useState("");
  const [venuePhoto, setVenuePhoto] = useState("");
  const [saveMsg, setSaveMsg]       = useState("");

  useEffect(() => {
    fetch("/api/venue-profile")
      .then(r => r.json())
      .then(d => {
        if (!d) return;
        setVenueName(d.name || "");
        setVenueCity(d.city || "");
        setVenueType(d.type || "");
        setVenuePhoto(d.photo || "");
      }).catch(() => {});
  }, []);

  async function saveVenueProfile(e) {
    e.preventDefault();
    setSaveMsg("Salvataggio...");
    const res = await fetch("/api/venue-profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: venueName, city: venueCity, type: venueType, photo: venuePhoto }),
    });
    setSaveMsg(res.ok ? "✓ Salvato" : "Errore salvataggio");
  }

  const s = {
  };

  return (
    <div id="organizer-area" style={{ fontFamily: "'Manrope',system-ui,sans-serif", color: INK, display: "flex", flexDirection: "column", gap: 16 }}>

        

      {/* Profilo locale — badge verificato PRO */}
      {tab === "overview" && (
        <>
          <TabOverview currentUser={currentUser} bookings={bookings} plan={plan} />

          <Card>
            <SectionTitle>Profilo locale</SectionTitle>
            <form onSubmit={saveVenueProfile} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12 }}>
                <Inp label="Nome locale" value={venueName} onChange={e => setVenueName(e.target.value)} placeholder="Es. Club Aurora" />
                <Inp label="Città" value={venueCity} onChange={e => setVenueCity(e.target.value)} placeholder="Es. Napoli" />
                <Inp label="Tipo locale" value={venueType} onChange={e => setVenueType(e.target.value)} placeholder="Es. Disco, Bar, Ristorante" />
              </div>
              <VenuePhotoUploader photo={venuePhoto} onPhotoChange={setVenuePhoto} />
              {saveMsg && <p style={{ fontSize:13, fontWeight:700, color:saveMsg.includes("✓")?"#16a34a":"#dc2626", margin:0 }}>{saveMsg}</p>}
              <button type="submit" style={{ alignSelf:"flex-start", background:INK, color:"white", border:"none", borderRadius:100, padding:"11px 28px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
                Salva profilo
              </button>
            </form>

            {/* Badge verificato — PRO */}
            {plan === "free" && (
              <div style={{ marginTop: 16, background: "rgba(255,90,0,.04)", border: "1px solid rgba(255,90,0,.15)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>Badge verificato <ProBadge /></p>
                  <p style={{ fontSize: 12, color: MUTED, margin: "3px 0 0" }}>Il badge aumenta la fiducia degli artisti e la tua posizione nel marketplace.</p>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === "marketplace" && <TabMarketplace artists={artists} plan={plan} />}
      {tab === "crm"         && <TabCRM bookings={bookings} plan={plan} />}
      {tab === "analitiche"  && <AnalyticsWidget role="organizer" userId={currentUser?.id} />}
      {tab === "estratto"    && <TabEstratto bookings={bookings} />}
    </div>
  );
}