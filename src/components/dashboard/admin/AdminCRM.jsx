"use client";

import { useState, useEffect, useMemo } from "react";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

const PIPELINE_COLS = [
  { id: "lead", label: "Lead", color: "#6b7280", bg: "#f9fafb" },
  { id: "contatto", label: "Contatto", color: "#2563eb", bg: "#eff6ff" },
  { id: "trattativa", label: "Trattativa", color: "#d97706", bg: "#fffbeb" },
  { id: "offerta", label: "Offerta inviata", color: ORANGE, bg: "#fff7ed" },
  { id: "chiuso", label: "Chiuso ✓", color: "#16a34a", bg: "#f0fdf4" },
  { id: "perso", label: "Perso ✗", color: "#dc2626", bg: "#fef2f2" },
];

const SCORE_LABELS = { gold: "🥇 Gold", silver: "🥈 Silver", bronze: "🥉 Bronze", new: "🆕 Nuovo" };

function scoreVenue(bookings, userId) {
  const vb = bookings.filter(b => Number(b.organizerId) === Number(userId) &&
    ["confirmed","accepted","paid"].includes(String(b.status||"").toLowerCase()));
  const vol = vb.reduce((s, b) => s + Number(b.cachet || 0), 0);
  if (vol >= 5000 || vb.length >= 10) return "gold";
  if (vol >= 2000 || vb.length >= 5) return "silver";
  if (vol >= 500 || vb.length >= 2) return "bronze";
  return "new";
}

function fmt(n) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
}

export default function AdminCRM({ users = [], bookings = [], contactRequests = [] }) {
  const [pipeline, setPipeline] = useState({});
  const [dragItem, setDragItem] = useState(null);
  const [dragCol, setDragCol] = useState(null);
  const [noteMap, setNoteMap] = useState({});
  const [noteInput, setNoteInput] = useState({});
  const [savingNote, setSavingNote] = useState(null);
  const [activeTab, setActiveTab] = useState("pipeline");
  const [search, setSearch] = useState("");

  const venues = useMemo(() => users.filter(u => u.role === "organizer"), [users]);
  const artists = useMemo(() => users.filter(u => u.role === "artist"), [users]);

  // Inizializza pipeline dai contact requests
  useEffect(() => {
    const init = {};
    PIPELINE_COLS.forEach(c => { init[c.id] = []; });
    contactRequests.forEach(r => {
      const col = r.status === "pending" ? "contatto"
        : r.status === "reviewed" ? "trattativa"
        : r.status === "connected" ? "chiuso"
        : r.status === "rejected" ? "perso" : "lead";
      if (!init[col]) init[col] = [];
      init[col].push({
        id: r.id,
        title: r.artist_name || "Artista",
        sub: r.organizer_name || "Locale",
        budget: r.budget,
        date: r.event_date,
        type: r.event_type,
      });
    });
    // Aggiungi lead puri (locali senza richieste)
    venues.forEach(v => {
      const hasReq = contactRequests.some(r => Number(r.organizer_id) === Number(v.id));
      if (!hasReq) init.lead.push({ id: `v-${v.id}`, title: v.name, sub: v.email, isVenue: true });
    });
    setPipeline(init);
  }, [contactRequests, venues]);

  // Carica note
  useEffect(() => {
    fetch("/api/admin-notes").then(r => r.json()).then(d => {
      if (!Array.isArray(d)) return;
      const m = {};
      d.forEach(n => {
        if (!m[`${n.entity_type}-${n.entity_id}`]) m[`${n.entity_type}-${n.entity_id}`] = [];
        m[`${n.entity_type}-${n.entity_id}`].push(n);
      });
      setNoteMap(m);
    }).catch(() => {});
  }, []);

  function onDragStart(item, fromCol) { setDragItem(item); setDragCol(fromCol); }
  function onDrop(toCol) {
    if (!dragItem || dragCol === toCol) return;
    setPipeline(prev => {
      const next = { ...prev };
      next[dragCol] = (next[dragCol] || []).filter(i => i.id !== dragItem.id);
      next[toCol] = [...(next[toCol] || []), dragItem];
      return next;
    });
    setDragItem(null); setDragCol(null);
  }

  async function saveNote(entityType, entityId, entityName) {
    const body = noteInput[`${entityType}-${entityId}`];
    if (!body?.trim()) return;
    setSavingNote(`${entityType}-${entityId}`);
    try {
      const res = await fetch("/api/admin-notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, entityName, body }),
      });
      const d = await res.json();
      if (res.ok) {
        const key = `${entityType}-${entityId}`;
        setNoteMap(prev => ({ ...prev, [key]: [...(prev[key] || []), d] }));
        setNoteInput(prev => ({ ...prev, [key]: "" }));
      }
    } catch {}
    setSavingNote(null);
  }

  const scoredVenues = useMemo(() =>
    venues.filter(v => !search || v.name?.toLowerCase().includes(search.toLowerCase()))
      .map(v => {
        const vb = bookings.filter(b => Number(b.organizerId) === Number(v.id));
        const confirmed = vb.filter(b => ["confirmed","accepted","paid"].includes(String(b.status||"").toLowerCase()));
        const vol = confirmed.reduce((s, b) => s + Number(b.cachet || 0), 0);
        const last = vb.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
        return { ...v, score: scoreVenue(bookings, v.id), totalBookings: vb.length, confirmedBookings: confirmed.length, volume: vol, lastActivity: last?.createdAt };
      })
      .sort((a, b) => ["gold","silver","bronze","new"].indexOf(a.score) - ["gold","silver","bronze","new"].indexOf(b.score)),
    [venues, bookings, search]
  );

  const s = {
    card: { background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "20px 22px" },
    tab: (active) => ({ padding: "7px 16px", borderRadius: 100, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none", fontFamily: "inherit", background: active ? INK : "white", color: active ? "white" : MUTED, border: active ? "none" : "1px solid rgba(0,0,0,.1)" }),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700&display=swap');`}</style>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[["pipeline","Pipeline CRM"],["scoring","Scoring clienti"],["artisti","Artisti"],["note","Note interne"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={s.tab(activeTab === id)}>{label}</button>
        ))}
      </div>

      {/* PIPELINE KANBAN */}
      {activeTab === "pipeline" && (
        <div style={s.card}>
          <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-0.03em", marginBottom:16 }}>Pipeline commerciale</h2>
          <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:8 }}>
            {PIPELINE_COLS.map(col => (
              <div key={col.id}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(col.id)}
                style={{ minWidth:200, background:col.bg, borderRadius:18, padding:"14px 12px", flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <p style={{ fontWeight:800, fontSize:13, color:col.color }}>{col.label}</p>
                  <span style={{ background:col.color, color:"white", borderRadius:100, fontSize:11, fontWeight:700, padding:"2px 8px" }}>{(pipeline[col.id]||[]).length}</span>
                </div>
                {(pipeline[col.id]||[]).map(item => (
                  <div key={item.id} draggable
                    onDragStart={() => onDragStart(item, col.id)}
                    style={{ background:"white", borderRadius:14, padding:"10px 12px", marginBottom:8, cursor:"grab", border:"1px solid rgba(0,0,0,.06)", boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
                    <p style={{ fontWeight:700, fontSize:13 }}>{item.title}</p>
                    <p style={{ fontSize:11, color:MUTED, marginTop:2 }}>{item.sub}</p>
                    {item.budget && <p style={{ fontSize:11, fontWeight:700, color:ORANGE, marginTop:4 }}>€{item.budget}</p>}
                    {item.date && <p style={{ fontSize:11, color:MUTED }}>{item.date}</p>}
                  </div>
                ))}
                {(pipeline[col.id]||[]).length === 0 && (
                  <p style={{ fontSize:12, color:"rgba(0,0,0,.25)", textAlign:"center", padding:"20px 0" }}>Trascina qui</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCORING CLIENTI */}
      {activeTab === "scoring" && (
        <div style={s.card}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-0.03em" }}>Scoring clienti (locali)</h2>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca locale..."
              style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"8px 14px", fontSize:13, outline:"none", width:200 }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:14 }}>
            {scoredVenues.map(v => (
              <div key={v.id} style={{ background:"#fbfaf8", borderRadius:20, padding:"16px 18px", border:"1px solid rgba(0,0,0,.06)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <p style={{ fontWeight:800, fontSize:15 }}>{v.name}</p>
                  <span style={{ fontSize:13, fontWeight:700 }}>{SCORE_LABELS[v.score]}</span>
                </div>
                <p style={{ fontSize:12, color:MUTED, marginBottom:10 }}>{v.email}</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[["Booking tot.", v.totalBookings], ["Confermati", v.confirmedBookings], ["Volume", fmt(v.volume)]].map(([k, val]) => (
                    <div key={k} style={{ background:"white", borderRadius:12, padding:"8px 10px", textAlign:"center" }}>
                      <p style={{ fontSize:10, color:MUTED, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>{k}</p>
                      <p style={{ fontWeight:800, fontSize:14, marginTop:2 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTISTI */}
      {activeTab === "artisti" && (
        <div style={s.card}>
          <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-0.03em", marginBottom:16 }}>Performance artisti</h2>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid rgba(0,0,0,.07)" }}>
                  {["Artista","Email","Booking tot.","Confermati","Volume cachet","Richieste"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:700, color:MUTED, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {artists.map(a => {
                  const ab = bookings.filter(b => Number(b.artistId) === Number(a.id));
                  const conf = ab.filter(b => ["confirmed","accepted","paid"].includes(String(b.status||"").toLowerCase()));
                  const vol = conf.reduce((s, b) => s + Number(b.cachet || 0), 0);
                  const reqs = contactRequests.filter(r => Number(r.artist_id) === Number(a.id)).length;
                  return (
                    <tr key={a.id} style={{ borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                      <td style={{ padding:"10px 12px", fontWeight:700 }}>{a.name}</td>
                      <td style={{ padding:"10px 12px", color:MUTED }}>{a.email}</td>
                      <td style={{ padding:"10px 12px" }}>{ab.length}</td>
                      <td style={{ padding:"10px 12px" }}><span style={{ background:"#f0fdf4", color:"#16a34a", borderRadius:8, padding:"2px 8px", fontWeight:700 }}>{conf.length}</span></td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:ORANGE }}>{fmt(vol)}</td>
                      <td style={{ padding:"10px 12px" }}>{reqs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NOTE INTERNE */}
      {activeTab === "note" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[...venues.slice(0,6), ...artists.slice(0,6)].map(u => {
            const key = `${u.role === "organizer" ? "venue" : "artist"}-${u.id}`;
            const notes = noteMap[key] || [];
            return (
              <div key={u.id} style={{ ...s.card, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <p style={{ fontWeight:800, fontSize:14 }}>{u.name}</p>
                  <span style={{ fontSize:10, fontWeight:700, color:MUTED, textTransform:"uppercase" }}>{u.role === "organizer" ? "Locale" : "Artista"}</span>
                </div>
                <div style={{ maxHeight:120, overflowY:"auto", marginBottom:10 }}>
                  {notes.length === 0 ? <p style={{ fontSize:12, color:"rgba(0,0,0,.3)" }}>Nessuna nota.</p> :
                    notes.map(n => (
                      <div key={n.id} style={{ background:"#fbfaf8", borderRadius:10, padding:"8px 10px", marginBottom:6, fontSize:12 }}>
                        <p>{n.body}</p>
                        <p style={{ color:MUTED, fontSize:10, marginTop:4 }}>{new Date(n.created_at).toLocaleDateString("it-IT")}</p>
                      </div>
                    ))
                  }
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input placeholder="Aggiungi nota..." value={noteInput[key] || ""}
                    onChange={e => setNoteInput(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ flex:1, background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:10, padding:"7px 10px", fontSize:12, outline:"none", fontFamily:"inherit" }} />
                  <button disabled={savingNote === key}
                    onClick={() => saveNote(u.role === "organizer" ? "venue" : "artist", u.id, u.name)}
                    style={{ background:INK, color:"white", border:"none", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    {savingNote === key ? "..." : "Salva"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}