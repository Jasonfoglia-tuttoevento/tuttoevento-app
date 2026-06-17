"use client";
import { useState, useEffect } from "react";
import { O, INK, MUTED, Card, STitle, Inp, KpiCard } from "./shared";

function Badge({ label, color }) {
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:100,
      background:`${color}18`, color }}>
      {label}
    </span>
  );
}

function SubCard({ sub, onRemove, onUpdateCommission }) {
  const [editing, setEditing] = useState(false);
  const [pct, setPct]         = useState(String(sub.commission_pct ?? 10));
  const [saving, setSaving]   = useState(false);

  async function save() {
    setSaving(true);
    await onUpdateCommission(sub.id, Number(pct));
    setSaving(false); setEditing(false);
  }

  return (
    <div style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.06)", borderRadius:18, padding:"14px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:`${O}15`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:O, flexShrink:0 }}>
          {(sub.name||"?")[0].toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:800, fontSize:14, margin:0, color:INK,
            fontFamily:"'Sora',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {sub.name || sub.email}
          </p>
          <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>
            {sub.email} · entrato {new Date(sub.created_at).toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric"})}
          </p>
        </div>
        <Badge label={sub.status === "active" ? "Attivo" : "In attesa"}
          color={sub.status === "active" ? "#16a34a" : "#d97706"} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
        {[
          ["Booking", sub.bookingCount ?? 0, INK],
          ["Guadagnato", `€${sub.totalEarned ?? 0}`, O],
        ].map(([lbl, val, clr]) => (
          <div key={lbl} style={{ background:"white", borderRadius:12, padding:"10px 12px", border:"1px solid rgba(0,0,0,.06)" }}>
            <p style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:MUTED, margin:"0 0 3px" }}>{lbl}</p>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:clr, margin:0 }}>{val}</p>
          </div>
        ))}
        <div style={{ background:"white", borderRadius:12, padding:"10px 12px", border:"1px solid rgba(0,0,0,.06)" }}>
          <p style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:MUTED, margin:"0 0 3px" }}>Comm. %</p>
          {editing ? (
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <input type="number" value={pct} onChange={e=>setPct(e.target.value)} min={1} max={50}
                style={{ width:44, background:"#f0f0f2", border:"1px solid rgba(0,0,0,.1)",
                  borderRadius:6, padding:"2px 6px", fontSize:13, fontWeight:700,
                  fontFamily:"'Sora',sans-serif", outline:"none" }} />
              <span style={{ fontSize:11, color:MUTED }}>%</span>
            </div>
          ) : (
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:INK, margin:0 }}>{pct}%</p>
          )}
        </div>
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {editing ? (
          <>
            <button onClick={save} disabled={saving}
              style={{ fontSize:12, fontWeight:700, padding:"7px 16px", borderRadius:100,
                border:"none", background:O, color:"white", cursor:"pointer",
                fontFamily:"inherit", opacity:saving?.6:1 }}>
              {saving ? "Salvo..." : "✓ Salva"}
            </button>
            <button onClick={()=>{ setEditing(false); setPct(String(sub.commission_pct??10)); }}
              style={{ fontSize:12, fontWeight:700, padding:"7px 16px", borderRadius:100,
                border:"1px solid rgba(0,0,0,.1)", background:"white", color:MUTED,
                cursor:"pointer", fontFamily:"inherit" }}>
              Annulla
            </button>
          </>
        ) : (
          <>
            <button onClick={()=>setEditing(true)}
              style={{ fontSize:12, fontWeight:700, padding:"7px 16px", borderRadius:100,
                border:"1px solid rgba(0,0,0,.1)", background:"white", color:INK,
                cursor:"pointer", fontFamily:"inherit" }}>
              Modifica %
            </button>
            <button onClick={()=>onRemove(sub.id)}
              style={{ fontSize:12, fontWeight:700, padding:"7px 16px", borderRadius:100,
                border:"1px solid rgba(220,38,38,.2)", background:"rgba(220,38,38,.06)",
                color:"#dc2626", cursor:"pointer", fontFamily:"inherit" }}>
              Rimuovi
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PromoterSubNetwork({ currentUser, plan }) {
  const [subs, setSubs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [email, setEmail]           = useState("");
  const [defaultPct, setDefaultPct] = useState("10");
  const [inviting, setInviting]     = useState(false);
  const [msg, setMsg]               = useState("");

  useEffect(() => { loadSubs(); }, []);

  async function loadSubs() {
    setLoading(true);
    try {
      const res = await fetch("/api/promoter-network/subs");
      const d   = await res.json();
      setSubs(Array.isArray(d) ? d : []);
    } catch {} finally { setLoading(false); }
  }

  async function invite() {
    if (!email.trim()) { setMsg("Inserisci un'email"); return; }
    setInviting(true); setMsg("");
    try {
      const res = await fetch("/api/promoter-network/subs", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email: email.trim(), commission_pct: Number(defaultPct) }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg("✓ Invito inviato! Il promoter riceverà un'email per accettare.");
        setEmail(""); loadSubs();
      } else {
        setMsg(d.error || "Errore invio invito");
      }
    } catch { setMsg("Errore di rete"); }
    setInviting(false);
  }

  async function handleRemove(id) {
    if (!confirm("Rimuovere questo promoter dal tuo network?")) return;
    await fetch(`/api/promoter-network/subs?id=${id}`, { method:"DELETE" });
    setSubs(prev => prev.filter(s => s.id !== id));
  }

  async function handleUpdateCommission(id, pct) {
    const res = await fetch("/api/promoter-network/subs", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, commission_pct: pct }),
    });
    if (res.ok) setSubs(prev => prev.map(s => s.id === id ? { ...s, commission_pct: pct } : s));
  }

  const totalSubs     = subs.length;
  const activeSubs    = subs.filter(s => s.status === "active").length;
  const totalBookings = subs.reduce((t, s) => t + Number(s.bookingCount || 0), 0);
  const totalEarned   = subs.reduce((t, s) => t + Number(s.totalEarned  || 0), 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
        <KpiCard label="Nel network" value={totalSubs} />
        <KpiCard label="Attivi" value={activeSubs} orange />
        <KpiCard label="Booking network" value={totalBookings} />
        <KpiCard label="Comm. distribuite" value={`€${totalEarned}`} accent />
      </div>

      <Card>
        <STitle>Aggiungi promoter al network</STitle>
        <p style={{ fontSize:13, color:MUTED, margin:"0 0 14px", lineHeight:1.6 }}>
          Invita un altro promoter nel tuo network. Lui avrà la sua dashboard normale — internamente il sistema
          distribuirà le commissioni tra te e lui secondo la percentuale che imposti qui.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 80px auto", gap:10, alignItems:"flex-end" }}>
          <Inp label="Email promoter" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="collega@email.com" type="email" />
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase",
              letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>Sua %</label>
            <input type="number" value={defaultPct} onChange={e=>setDefaultPct(e.target.value)}
              min={1} max={50}
              style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12,
                padding:"10px 12px", fontSize:13, outline:"none",
                fontFamily:"'Manrope',system-ui,sans-serif", textAlign:"center", width:"100%",
                boxSizing:"border-box" }} />
          </div>
          <button onClick={invite} disabled={inviting}
            style={{ background:O, color:"white", border:"none", borderRadius:12,
              padding:"10px 20px", fontWeight:800, fontSize:13, cursor:"pointer",
              fontFamily:"'Manrope',system-ui,sans-serif", opacity:inviting?.6:1,
              whiteSpace:"nowrap", height:44 }}>
            {inviting ? "..." : "+ Invita"}
          </button>
        </div>
        {msg && (
          <p style={{ fontSize:13, fontWeight:700, margin:"10px 0 0",
            color: msg.startsWith("✓") ? "#16a34a" : "#dc2626" }}>
            {msg}
          </p>
        )}
      </Card>

      <Card>
        <STitle>Il tuo network ({activeSubs} attivi)</STitle>
        {loading ? (
          <p style={{ fontSize:13, color:MUTED }}>Caricamento...</p>
        ) : subs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <p style={{ fontSize:28, margin:"0 0 8px" }}>🤝</p>
            <p style={{ fontSize:14, fontWeight:700, color:INK, margin:"0 0 4px" }}>Nessun promoter nel network</p>
            <p style={{ fontSize:12, color:MUTED, margin:0 }}>Invita un collega qui sopra per iniziare.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {subs.map(s => (
              <SubCard key={s.id} sub={s} onRemove={handleRemove} onUpdateCommission={handleUpdateCommission} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <STitle>Come funzionano le commissioni</STitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
          {[
            ["🏦", "TuttoEvento", "Trattiene la commissione piattaforma su ogni booking (es. 15%)"],
            ["👑", "Tu", "Ricevi la tua percentuale sui booking degli artisti del network"],
            ["🤝", "Promoter nel network", "Riceve la % che gli hai assegnato, scalata dalla tua quota — la sua dashboard è identica alla tua"],
          ].map(([ico, title, desc]) => (
            <div key={title} style={{ background:"#fbfaf8", borderRadius:14, padding:"14px 16px" }}>
              <p style={{ fontSize:22, margin:"0 0 6px" }}>{ico}</p>
              <p style={{ fontWeight:800, fontSize:13, color:INK, margin:"0 0 4px", fontFamily:"'Sora',sans-serif" }}>{title}</p>
              <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}