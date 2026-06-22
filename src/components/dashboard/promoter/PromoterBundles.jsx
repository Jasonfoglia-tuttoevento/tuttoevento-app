"use client";
import { useState, useEffect } from "react";
import { O, INK, MUTED, Card, STitle, Inp } from "./shared";

function BundleCard({ b, onToggle, onDelete }) {
  return (
    <div style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.06)", borderRadius:16, padding:"14px 16px", opacity: b.active?1:.55 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:8 }}>
        <p style={{ fontWeight:800, fontSize:14, margin:0, color:INK, fontFamily:"'Sora',sans-serif" }}>{b.title}</p>
        {b.bundle_price && (
          <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:16, color:O }}>€{b.bundle_price}</span>
        )}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
        {b.artists.map(a => (
          <span key={a.id} style={{ fontSize:11.5, fontWeight:700, color:INK, background:"white", border:"1px solid rgba(0,0,0,.08)", borderRadius:100, padding:"3px 10px" }}>
            {a.name}
          </span>
        ))}
      </div>
      {b.description && <p style={{ fontSize:12, color:"#333", margin:"0 0 10px", lineHeight:1.5 }}>{b.description}</p>}
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={()=>onToggle(b.id, !b.active)}
          style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100, border:"1px solid rgba(0,0,0,.1)",
            background:"white", color:INK, cursor:"pointer", fontFamily:"inherit" }}>
          {b.active ? "Disattiva" : "Riattiva"}
        </button>
        <button onClick={()=>onDelete(b.id)}
          style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100, border:"1px solid rgba(220,38,38,.2)",
            background:"rgba(220,38,38,.06)", color:"#dc2626", cursor:"pointer", fontFamily:"inherit" }}>
          Elimina
        </button>
      </div>
    </div>
  );
}

export default function PromoterBundles({ portfolio=[] }) {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle]         = useState("");
  const [selected, setSelected]   = useState([]);
  const [price, setPrice]         = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState("");

  const myArtists = portfolio.filter(p => p.entity_type === "artist");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/promoter-bundles");
      const d = await res.json();
      setBundles(Array.isArray(d) ? d : []);
    } catch {} finally { setLoading(false); }
  }

  function toggleArtist(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  async function create() {
    if (!title.trim() || selected.length < 2) { setMsg("Serve un titolo e almeno 2 artisti"); return; }
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/promoter-bundles", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ title: title.trim(), artistIds: selected, bundlePrice: price || undefined, description: description.trim() }),
      });
      const d = await res.json();
      if (res.ok) {
        setTitle(""); setSelected([]); setPrice(""); setDescription(""); setShowForm(false);
        load();
      } else setMsg(d.error || "Errore");
    } catch { setMsg("Errore di rete"); }
    setSaving(false);
  }

  async function toggleActive(id, active) {
    await fetch("/api/promoter-bundles", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, active }),
    });
    setBundles(prev => prev.map(b => b.id === id ? { ...b, active } : b));
  }

  async function remove(id) {
    if (!confirm("Eliminare questo pacchetto?")) return;
    await fetch(`/api/promoter-bundles?id=${id}`, { method:"DELETE" });
    setBundles(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:showForm?14:0 }}>
          <STitle sub="Proponi più artisti insieme per uno stesso evento, con un prezzo unico">Pacchetti artisti</STitle>
          <button onClick={()=>setShowForm(p=>!p)}
            style={{ background: showForm ? "rgba(0,0,0,.06)" : O, color: showForm ? INK : "white", border:"none",
              borderRadius:100, padding:"8px 16px", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", flexShrink:0 }}>
            {showForm ? "✕ Annulla" : "+ Crea pacchetto"}
          </button>
        </div>

        {showForm && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Inp label="Nome pacchetto" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Es. Resident + Ospite weekend" />

            <div>
              <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:6, fontFamily:"'Manrope',system-ui,sans-serif" }}>
                Artisti inclusi (min. 2)
              </label>
              {myArtists.length < 2 ? (
                <p style={{ fontSize:12, color:MUTED }}>Servono almeno 2 artisti nel roster per creare un pacchetto.</p>
              ) : (
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {myArtists.map(p => (
                    <button key={p.entity_id} type="button" onClick={()=>toggleArtist(p.entity_id)}
                      style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100,
                        border:`1px solid ${selected.includes(p.entity_id)?O:"rgba(0,0,0,.1)"}`,
                        background: selected.includes(p.entity_id)?`${O}12`:"white",
                        color: selected.includes(p.entity_id)?O:MUTED, cursor:"pointer", fontFamily:"inherit" }}>
                      {p.entity_name || `Artista #${p.entity_id}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Inp label="Prezzo pacchetto (opzionale, €)" value={price} onChange={e=>setPrice(e.target.value)} type="number" placeholder="Lascia vuoto per somma automatica" />

            <div>
              <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>Descrizione</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={2}
                placeholder="Cosa rende speciale questo abbinamento..."
                style={{ width:"100%", boxSizing:"border-box", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 14px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", resize:"vertical" }} />
            </div>

            {msg && <p style={{ fontSize:12, fontWeight:700, color:"#dc2626", margin:0 }}>{msg}</p>}

            <button onClick={create} disabled={saving}
              style={{ background:O, color:"white", border:"none", borderRadius:100, padding:"11px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:saving?.6:1 }}>
              {saving ? "Creazione…" : "Crea pacchetto"}
            </button>
          </div>
        )}
      </Card>

      <Card>
        <STitle>I tuoi pacchetti</STitle>
        {loading ? (
          <p style={{ fontSize:13, color:MUTED }}>Caricamento…</p>
        ) : bundles.length === 0 ? (
          <p style={{ fontSize:13, color:MUTED }}>Nessun pacchetto creato ancora.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {bundles.map(b => <BundleCard key={b.id} b={b} onToggle={toggleActive} onDelete={remove} />)}
          </div>
        )}
      </Card>
    </div>
  );
}