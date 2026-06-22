"use client";
import { useState, useEffect } from "react";
import { O, INK, MUTED, Card, STitle, Inp, KpiCard } from "./shared";

const STATUS_LABEL = { sent:"Inviata", viewed:"Vista", interested:"Interessato", declined:"Rifiutata", converted:"Convertita" };
const STATUS_COLOR = { sent:"#6b7280", viewed:"#2563eb", interested:"#16a34a", declined:"#dc2626", converted:"#ff5a00" };

function OutreachCard({ o }) {
  return (
    <div style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.06)", borderRadius:16, padding:"14px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:6 }}>
        <p style={{ fontWeight:800, fontSize:14, margin:0, color:INK, fontFamily:"'Sora',sans-serif" }}>{o.otherName}</p>
        <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:100,
          background:`${STATUS_COLOR[o.status]||MUTED}18`, color:STATUS_COLOR[o.status]||MUTED }}>
          {STATUS_LABEL[o.status] || o.status}
        </span>
      </div>
      <p style={{ fontSize:12, color:MUTED, margin:"0 0 6px" }}>
        {o.artistNames.join(", ")}{o.event_date ? ` · ${new Date(o.event_date).toLocaleDateString("it-IT")}` : ""}
      </p>
      <p style={{ fontSize:12.5, color:"#333", margin:0, lineHeight:1.5 }}>{o.message}</p>
      <p style={{ fontSize:10.5, color:MUTED, margin:"8px 0 0" }}>
        {new Date(o.created_at).toLocaleDateString("it-IT", { day:"2-digit", month:"short", year:"numeric" })}
      </p>
    </div>
  );
}

export default function PromoterOutreach({ currentUser, portfolio=[] }) {
  const [outreach, setOutreach] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [venues, setVenues]     = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [venueId, setVenueId]     = useState("");
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage]     = useState("");
  const [sending, setSending]     = useState(false);
  const [msg, setMsg]             = useState("");

  const myArtists = portfolio.filter(p => p.entity_type === "artist");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/promoter-outreach");
      const d = await res.json();
      setOutreach(Array.isArray(d) ? d : []);
    } catch {} finally { setLoading(false); }
  }

  function toggleArtist(id) {
    setSelectedArtists(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  async function send() {
    if (!venueId || selectedArtists.length === 0 || !message.trim()) {
      setMsg("Compila locale, almeno un artista e il messaggio"); return;
    }
    setSending(true); setMsg("");
    try {
      const res = await fetch("/api/promoter-outreach", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ venueId: Number(venueId), artistIds: selectedArtists, eventDate: eventDate || undefined, message: message.trim() }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg("✓ Proposta inviata!");
        setVenueId(""); setSelectedArtists([]); setEventDate(""); setMessage(""); setShowForm(false);
        load();
      } else setMsg(d.error || "Errore");
    } catch { setMsg("Errore di rete"); }
    setSending(false);
  }

  const stats = {
    total: outreach.length,
    interested: outreach.filter(o => o.status === "interested").length,
    converted: outreach.filter(o => o.status === "converted").length,
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
        <KpiCard label="Proposte inviate" value={stats.total} />
        <KpiCard label="Interessati" value={stats.interested} orange />
        <KpiCard label="Convertite" value={stats.converted} accent />
      </div>

      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:showForm?14:0 }}>
          <STitle>Proponi i tuoi artisti a un locale</STitle>
          <button onClick={()=>setShowForm(p=>!p)}
            style={{ background: showForm ? "rgba(0,0,0,.06)" : O, color: showForm ? INK : "white", border:"none",
              borderRadius:100, padding:"8px 16px", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
            {showForm ? "✕ Annulla" : "+ Nuova proposta"}
          </button>
        </div>

        {showForm && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Inp label="ID locale (organizer)" value={venueId} onChange={e=>setVenueId(e.target.value)}
              placeholder="ID utente del locale" type="number" />

            <div>
              <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:6, fontFamily:"'Manrope',system-ui,sans-serif" }}>
                Artisti da proporre (dal tuo roster)
              </label>
              {myArtists.length === 0 ? (
                <p style={{ fontSize:12, color:MUTED }}>Nessun artista nel tuo roster ancora.</p>
              ) : (
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {myArtists.map(p => (
                    <button key={p.entity_id} type="button" onClick={()=>toggleArtist(p.entity_id)}
                      style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100,
                        border:`1px solid ${selectedArtists.includes(p.entity_id)?O:"rgba(0,0,0,.1)"}`,
                        background: selectedArtists.includes(p.entity_id)?`${O}12`:"white",
                        color: selectedArtists.includes(p.entity_id)?O:MUTED, cursor:"pointer", fontFamily:"inherit" }}>
                      {p.entity_name || `Artista #${p.entity_id}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Inp label="Data evento (opzionale)" value={eventDate} onChange={e=>setEventDate(e.target.value)} type="date" />

            <div>
              <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>Messaggio</label>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
                placeholder="Es. Ho 2 artisti liberi venerdì sera, ti interessano per la vostra serata?"
                style={{ width:"100%", boxSizing:"border-box", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 14px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", resize:"vertical" }} />
            </div>

            {msg && <p style={{ fontSize:12, fontWeight:700, color: msg.startsWith("✓")?"#16a34a":"#dc2626", margin:0 }}>{msg}</p>}

            <button onClick={send} disabled={sending}
              style={{ background:O, color:"white", border:"none", borderRadius:100, padding:"11px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:sending?.6:1 }}>
              {sending ? "Invio…" : "Invia proposta →"}
            </button>
          </div>
        )}
      </Card>

      <Card>
        <STitle>Proposte inviate</STitle>
        {loading ? (
          <p style={{ fontSize:13, color:MUTED }}>Caricamento…</p>
        ) : outreach.length === 0 ? (
          <p style={{ fontSize:13, color:MUTED }}>Nessuna proposta inviata ancora.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {outreach.map(o => <OutreachCard key={o.id} o={o} />)}
          </div>
        )}
      </Card>
    </div>
  );
}