"use client";

import { useMemo, useState, useEffect } from "react";

function ProLock({ feature = "questa funzionalità", children, plan }) {
  const isPro = plan === "pro";
  if (isPro) return children ?? null;
  return (
    <div style={{ position:"relative", borderRadius:18, overflow:"hidden", border:"1px solid rgba(255,90,0,.2)" }}>
      <div style={{ filter:"blur(3px)", pointerEvents:"none", userSelect:"none", opacity:.4 }}>{children}</div>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(255,90,0,.06),rgba(10,10,11,.85))", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:20, textAlign:"center" }}>
        <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,90,0,.15)", border:"1px solid rgba(255,90,0,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔒</div>
        <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:14, color:"white", margin:0 }}>Funzione PRO</p>
        <p style={{ fontFamily:"Manrope,system-ui,sans-serif", fontSize:12, color:"rgba(255,255,255,.55)", margin:0, maxWidth:220, lineHeight:1.5 }}>{feature} è disponibile nel piano Pro.</p>
        <div style={{ background:"#ff5a00", color:"white", borderRadius:100, padding:"8px 20px", fontSize:12, fontWeight:800, opacity:.85, cursor:"default" }}>🚀 Disponibile presto</div>
      </div>
    </div>
  );
}

function ProBadge() {
  return <span style={{ display:"inline-flex", alignItems:"center", background:"rgba(255,90,0,.12)", border:"1px solid rgba(255,90,0,.25)", borderRadius:100, padding:"1px 8px", fontSize:10, fontWeight:800, color:"#ff5a00", verticalAlign:"middle", marginLeft:6 }}>PRO</span>;
}


const ORANGE = "#ff5a00";
const INK    = "#0a0a0b";
const MUTED  = "#6b6b73";

/* ─── helpers ─────────────────────────────────────────────── */
function fmt(n) {
  return new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0);
}
function pct(n,d) {
  if (!d) return "0%";
  return `${((n/d)*100).toFixed(1)}%`;
}

/* ─── sub-components ──────────────────────────────────────── */
function Card({ children, style={} }) {
  return (
    <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px", ...style }}>
      {children}
    </div>
  );
}

function STitle({ children }) {
  return (
    <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, letterSpacing:"-.02em", color:INK, margin:"0 0 14px" }}>
      {children}
    </h3>
  );
}

function Inp({ label, value, onChange, placeholder, type="text", disabled }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 13px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", opacity:disabled?.5:1, width:"100%" }} />
    </div>
  );
}

function KpiCard({ label, value, hint, accent, orange }) {
  return (
    <div style={{ background:accent?INK:orange?`${ORANGE}10`:"white", border:`1px solid ${accent?"transparent":orange?`${ORANGE}25`:"rgba(0,0,0,.06)"}`, borderRadius:22, padding:"16px 18px" }}>
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:accent?"rgba(255,255,255,.45)":MUTED, margin:"0 0 5px", fontFamily:"'Manrope',system-ui,sans-serif" }}>{label}</p>
      <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-.03em", color:accent?"white":orange?ORANGE:INK, margin:0 }}>{value}</p>
      {hint && <p style={{ fontSize:11, fontWeight:700, color:accent?"rgba(255,255,255,.4)":orange?ORANGE:MUTED, margin:"4px 0 0", fontFamily:"'Manrope',system-ui,sans-serif" }}>{hint}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:  { label:"In attesa",   color:"#d97706" },
    reviewed: { label:"In revisione",color:"#2563eb" },
    connected:{ label:"Connessi",    color:"#16a34a" },
    rejected: { label:"Rifiutata",   color:"#dc2626" },
  };
  const s = map[status] || { label: status||"—", color: MUTED };
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:100, background:`${s.color}18`, color:s.color, fontFamily:"'Manrope',system-ui,sans-serif" }}>
      {s.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 1 — OVERVIEW
═══════════════════════════════════════════════════════════ */
function TabOverview({ currentUser, bookings, portfolio, contactRequests, plan, commissions }) {
  const portfolioArtists = portfolio.filter(p => p.entity_type === "artist");
  const portfolioVenues  = portfolio.filter(p => p.entity_type === "venue");
  const myIds = portfolio.map(p => Number(p.entity_id));

  const myRequests = contactRequests.filter(r =>
    myIds.includes(Number(r.artist_id)) || myIds.includes(Number(r.organizer_id))
  );

  const totalVolume = commissions.reduce((s,c) => s + (Number(c.public_price)||0), 0);
  const totalShare  = commissions.reduce((s,c) => s + (Number(c.promoter_share_amount)||0), 0);
  const confirmed   = commissions.filter(c => c.status === "confirmed").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Benvenuto */}
      <Card>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:ORANGE, margin:"0 0 4px", fontFamily:"'Manrope',system-ui,sans-serif" }}>Area Promoter</p>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:22, letterSpacing:"-.03em", margin:"0 0 4px" }}>
              Ciao{currentUser?.name ? ` ${currentUser.name}` : ""}
            </h2>
            <p style={{ fontSize:13, color:MUTED, margin:0, fontFamily:"'Manrope',system-ui,sans-serif" }}>
              Gestisci il tuo roster, monitora le trattative e guadagna commissioni sui booking.
            </p>
          </div>
          <div style={{ background: plan==="pro"?`${ORANGE}10`:"#fbfaf8", border:`1px solid ${plan==="pro"?`${ORANGE}25`:"rgba(0,0,0,.1)"}`, borderRadius:100, padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14 }}>{plan==="pro"?"⭐":"🆓"}</span>
            <span style={{ fontSize:13, fontWeight:700, color:plan==="pro"?ORANGE:MUTED, fontFamily:"'Manrope',system-ui,sans-serif" }}>
              Piano {plan==="pro"?"Pro":"Free"}
            </span>
            {plan==="free" && <span style={{ fontSize:11, fontWeight:800, color:ORANGE, marginLeft:4 }}>→ €19,90/mese</span>}
          </div>
        </div>
      </Card>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
        <KpiCard label="Artisti in roster" value={portfolioArtists.length} hint="nel tuo portfolio" />
        <KpiCard label="Locali in roster"  value={portfolioVenues.length}  hint="partner attivi" />
        <KpiCard label="Richieste attive"  value={myRequests.filter(r=>r.status==="pending"||r.status==="reviewed").length} hint="in corso" />
        <KpiCard label="Booking chiusi"    value={confirmed} hint="confermati" />
        <KpiCard label="Volume gestito"    value={fmt(totalVolume)} hint="sui tuoi artisti" accent />
        <KpiCard label="Commissioni maturate" value={fmt(totalShare)} hint="~30% del margine TE" orange />
      </div>

      {/* Ultime richieste rapide */}
      {myRequests.length > 0 && (
        <Card>
          <STitle>Richieste recenti che ti coinvolgono</STitle>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {myRequests.slice(0,5).map((r,i) => (
              <div key={r.id||i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fbfaf8", borderRadius:14, padding:"10px 14px", gap:10 }}>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {r.organizer_name} → {r.artist_name}
                  </p>
                  <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>{r.event_date||"—"} {r.event_type?`· ${r.event_type}`:""}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 2 — ROSTER
═══════════════════════════════════════════════════════════ */
function TabRoster({ portfolio, users, plan, onAdd, onRemove, addingEntry, addMsg }) {
  const [newEntry, setNewEntry] = useState({ entityType:"artist", entityId:"" });
  const availableArtists = users.filter(u => u.role==="artist");
  const availableVenues  = users.filter(u => u.role==="organizer");
  const portfolioArtists = portfolio.filter(p => p.entity_type==="artist");
  const portfolioVenues  = portfolio.filter(p => p.entity_type==="venue");

  const maxArtists = plan==="pro" ? Infinity : 5;
  const maxVenues  = plan==="pro" ? Infinity : 3;
  const atMaxArtists = portfolioArtists.length >= maxArtists;
  const atMaxVenues  = portfolioVenues.length  >= maxVenues;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Aggiungi al roster */}
      <Card>
        <STitle>Aggiungi al roster</STitle>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>Tipo</label>
            <select value={newEntry.entityType} onChange={e => setNewEntry(p=>({...p,entityType:e.target.value,entityId:""}))}
              style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 13px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none" }}>
              <option value="artist">Artista</option>
              <option value="venue">Locale</option>
            </select>
          </div>
          <div style={{ flex:1, minWidth:180 }}>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>
              {newEntry.entityType==="artist"?"Artista":"Locale"}
            </label>
            <select value={newEntry.entityId} onChange={e => setNewEntry(p=>({...p,entityId:e.target.value}))}
              style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 13px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", width:"100%" }}>
              <option value="">Seleziona...</option>
              {(newEntry.entityType==="artist"?availableArtists:availableVenues).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <button
            disabled={addingEntry || !newEntry.entityId || (newEntry.entityType==="artist"&&atMaxArtists&&plan!=="pro") || (newEntry.entityType==="venue"&&atMaxVenues&&plan!=="pro")}
            onClick={() => onAdd(newEntry)}
            style={{ background:ORANGE, color:"white", border:"none", borderRadius:100, padding:"11px 22px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:addingEntry?.5:1 }}>
            {addingEntry?"...":"+ Aggiungi"}
          </button>
        </div>
        {addMsg && <p style={{ fontSize:12, fontWeight:700, color:addMsg.includes("✓")?"#16a34a":"#dc2626", marginTop:8, fontFamily:"'Manrope',system-ui,sans-serif" }}>{addMsg}</p>}

        {/* Limiti piano Free */}
        {plan==="free" && (
          <div style={{ marginTop:14, background:"rgba(255,90,0,.05)", border:"1px solid rgba(255,90,0,.15)", borderRadius:14, padding:"10px 14px", fontSize:12, color:ORANGE, fontWeight:700, fontFamily:"'Manrope',system-ui,sans-serif" }}>
            🔒 Piano Free: max 5 artisti e 3 locali nel roster. <span style={{ color:INK }}>Con PRO: illimitati.</span>
          </div>
        )}
      </Card>

      {/* Griglia roster */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Artisti */}
        <Card>
          <STitle>🎤 Artisti ({portfolioArtists.length}{plan==="free"?"/5":""})</STitle>
          {portfolioArtists.length===0 ? (
            <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun artista nel roster.</p>
          ) : portfolioArtists.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
              <div>
                <p style={{ fontWeight:700, fontSize:13, margin:0 }}>{p.entity_name||"—"}</p>
                {p.notes && <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>{p.notes}</p>}
              </div>
              <button onClick={()=>onRemove(p.id)}
                style={{ background:"transparent", border:"none", color:"#dc2626", fontWeight:700, fontSize:15, cursor:"pointer" }}>×</button>
            </div>
          ))}
        </Card>

        {/* Locali */}
        <Card>
          <STitle>🏛️ Locali ({portfolioVenues.length}{plan==="free"?"/3":""})</STitle>
          {portfolioVenues.length===0 ? (
            <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun locale nel roster.</p>
          ) : portfolioVenues.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
              <div>
                <p style={{ fontWeight:700, fontSize:13, margin:0 }}>{p.entity_name||"—"}</p>
                {p.notes && <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>{p.notes}</p>}
              </div>
              <button onClick={()=>onRemove(p.id)}
                style={{ background:"transparent", border:"none", color:"#dc2626", fontWeight:700, fontSize:15, cursor:"pointer" }}>×</button>
            </div>
          ))}
        </Card>
      </div>

      {/* Commissione per artista — solo PRO */}
      <ProLock feature="La commissione personalizzabile per artista" plan={plan}>
        <Card>
          <STitle>Commissione per artista <ProBadge /></STitle>
          <p style={{ fontSize:13, color:MUTED, marginBottom:14 }}>Imposta una % di commissione diversa per ogni artista che gestisci. Default: 30% del margine TuttoEvento.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {portfolioArtists.slice(0,3).map((a,i) => (
              <div key={a.id||i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fbfaf8", borderRadius:14, padding:"10px 14px", gap:10 }}>
                <p style={{ fontWeight:700, fontSize:13, margin:0, flex:1 }}>{a.entity_name||"—"}</p>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <input type="number" min="0" max="50" defaultValue="30"
                    style={{ width:60, background:"white", border:"1px solid rgba(0,0,0,.1)", borderRadius:8, padding:"6px 8px", fontSize:13, textAlign:"right", fontFamily:"'Manrope',system-ui,sans-serif", outline:"none" }} />
                  <span style={{ fontSize:13, color:MUTED, fontWeight:700 }}>%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </ProLock>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 3 — TRATTATIVE
═══════════════════════════════════════════════════════════ */
function TabTrattative({ contactRequests, portfolio, plan, onUpdateStatus }) {
  const myIds = portfolio.map(p => Number(p.entity_id));
  const myRequests = contactRequests.filter(r =>
    myIds.includes(Number(r.artist_id)) || myIds.includes(Number(r.organizer_id))
  );

  const [filterStatus, setFilterStatus] = useState("all");
  const filtered = filterStatus==="all" ? myRequests : myRequests.filter(r=>r.status===filterStatus);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Filtri */}
      <Card>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[["all","Tutte"],["pending","In attesa"],["reviewed","In revisione"],["connected","Connesse"],["rejected","Rifiutate"]].map(([val,label]) => (
            <button key={val} onClick={()=>setFilterStatus(val)}
              style={{ padding:"6px 14px", borderRadius:100, fontWeight:700, fontSize:12, cursor:"pointer", border:filterStatus===val?"none":"1px solid rgba(0,0,0,.1)", background:filterStatus===val?INK:"white", color:filterStatus===val?"white":MUTED, fontFamily:"'Manrope',system-ui,sans-serif" }}>
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Lista trattative */}
      <Card>
        <STitle>Richieste del tuo roster ({filtered.length})</STitle>
        {filtered.length===0 ? (
          <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessuna richiesta con questi filtri.</p>
        ) : filtered.map((r,i) => (
          <div key={r.id||i} style={{ border:"1px solid rgba(0,0,0,.07)", borderRadius:18, padding:"14px 16px", background:"#fbfaf8", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, flexWrap:"wrap", marginBottom:10 }}>
              <div>
                <p style={{ fontWeight:700, fontSize:14, margin:0 }}>
                  <span style={{ color:MUTED, fontWeight:400 }}>{r.organizer_name}</span>
                  {" → "}
                  <span style={{ color:INK }}>{r.artist_name}</span>
                </p>
                <div style={{ display:"flex", gap:12, marginTop:5, flexWrap:"wrap" }}>
                  {r.event_date && <span style={{ fontSize:12, color:MUTED }}>📅 {r.event_date}</span>}
                  {r.event_type && <span style={{ fontSize:12, color:MUTED }}>🎪 {r.event_type}</span>}
                  {r.budget     && <span style={{ fontSize:12, fontWeight:700, color:ORANGE }}>💶 €{r.budget}</span>}
                </div>
                {r.notes && <p style={{ fontSize:12, color:MUTED, margin:"6px 0 0", fontStyle:"italic" }}>"{r.notes}"</p>}
              </div>
              <StatusBadge status={r.status} />
            </div>

            {/* Azioni — gestione attiva solo PRO */}
            {plan==="pro" ? (
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {r.status==="pending" && (
                  <button onClick={()=>onUpdateStatus(r.id,"reviewed")}
                    style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100, border:"none", background:INK, color:"white", cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
                    Prendi in carico
                  </button>
                )}
                {["pending","reviewed"].includes(r.status) && <>
                  <button onClick={()=>onUpdateStatus(r.id,"connected")}
                    style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100, border:"none", background:"#16a34a", color:"white", cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
                    Connetti ✓
                  </button>
                  <button onClick={()=>onUpdateStatus(r.id,"rejected")}
                    style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:100, border:"1px solid #fca5a5", background:"transparent", color:"#dc2626", cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
                    Rifiuta
                  </button>
                </>}
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                <span style={{ fontSize:11, color:MUTED, fontStyle:"italic" }}>Vista in sola lettura</span>
                <ProBadge />
                <span style={{ fontSize:11, color:MUTED }}>— Con PRO puoi gestire attivamente le trattative</span>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 4 — COMMISSIONI
═══════════════════════════════════════════════════════════ */
function TabCommissioni({ commissions, bookings, portfolio, plan }) {
  const myIds = portfolio.map(p => Number(p.entity_id));

  // Calcolo basato su bookings confermati dei miei artisti
  const myBookings = bookings.filter(b =>
    myIds.includes(Number(b.artist_id)) &&
    ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase())
  );

  const SHARE_PCT = 30; // % del margine ceduta da TuttoEvento al promoter
  const TE_MARGIN_PCT = 0.45; // margine medio TuttoEvento (stimato)

  const rows = myBookings.map(b => {
    const public_price = Number(b.publicPrice||b.public_price||b.cachet||0);
    const artist_cachet = Number(b.artistCachet||b.artist_cachet||b.cachet||0);
    const te_margin = public_price - artist_cachet;
    const promoter_share = te_margin * (SHARE_PCT/100);
    return { ...b, public_price, artist_cachet, te_margin, promoter_share };
  });

  const totalVolume  = rows.reduce((s,r)=>s+r.public_price,0);
  const totalMargin  = rows.reduce((s,r)=>s+r.te_margin,0);
  const totalShare   = rows.reduce((s,r)=>s+r.promoter_share,0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* KPI commissioni */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
        <KpiCard label="Volume sui tuoi artisti" value={fmt(totalVolume)} hint="booking confermati" />
        <KpiCard label="Margine TuttoEvento"     value={fmt(totalMargin)} hint="stimato" />
        <KpiCard label="Tua quota (30%)"          value={fmt(totalShare)}  hint="del margine TE" orange />
        <KpiCard label="Booking coinvolti"         value={rows.length}      accent />
      </div>

      {/* Nota modello commissioni */}
      <div style={{ background:"rgba(255,90,0,.04)", border:"1px solid rgba(255,90,0,.15)", borderRadius:18, padding:"14px 18px", display:"flex", gap:14, alignItems:"flex-start" }}>
        <span style={{ fontSize:22, flexShrink:0 }}>ℹ️</span>
        <div>
          <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:INK, margin:"0 0 4px" }}>Come funzionano le commissioni</p>
          <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.6, fontFamily:"'Manrope',system-ui,sans-serif" }}>
            TuttoEvento trattiene la differenza tra il prezzo pubblico pagato dal locale e il cachet netto dell'artista.
            Come promoter che porta un artista sulla piattaforma, ricevi il <strong>30% di questo margine</strong> per ogni booking confermato del tuo roster.
            I pagamenti vengono elaborati mensilmente una volta aperta la struttura societaria.
          </p>
        </div>
      </div>

      {/* Estratto base */}
      {rows.length===0 ? (
        <Card><p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun booking confermato per i tuoi artisti.</p></Card>
      ) : (
        <Card>
          <STitle>Estratto commissioni</STitle>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid rgba(0,0,0,.07)" }}>
                  {["Artista","Evento","Data","Prezzo pub.","Margine TE","Tua quota (30%)"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:700, color:MUTED, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i) => (
                  <tr key={r.id||i} style={{ borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                    <td style={{ padding:"10px 12px", fontWeight:700 }}>{r.artistName||"—"}</td>
                    <td style={{ padding:"10px 12px", color:MUTED }}>{r.eventTitle||"—"}</td>
                    <td style={{ padding:"10px 12px", color:MUTED }}>{r.eventDate||"—"}</td>
                    <td style={{ padding:"10px 12px", fontWeight:700 }}>{fmt(r.public_price)}</td>
                    <td style={{ padding:"10px 12px", color:MUTED }}>{fmt(r.te_margin)}</td>
                    <td style={{ padding:"10px 12px", fontWeight:800, color:ORANGE }}>{fmt(r.promoter_share)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop:"2px solid rgba(0,0,0,.1)", background:"#fbfaf8" }}>
                  <td colSpan={4} style={{ padding:"12px", fontWeight:800 }}>TOTALE</td>
                  <td style={{ padding:"12px", fontWeight:700 }}>{fmt(totalMargin)}</td>
                  <td style={{ padding:"12px", fontWeight:800, color:ORANGE, fontSize:15 }}>{fmt(totalShare)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Commissione personalizzata + Export — solo PRO */}
      <ProLock feature="La commissione personalizzabile per artista e l'export CSV" plan={plan}>
        <Card>
          <STitle>Commissione personalizzata per artista <ProBadge /></STitle>
          <p style={{ fontSize:13, color:MUTED, marginBottom:12 }}>Imposta percentuali diverse per ogni artista del roster. Es. artisti top al 35%, emerging al 25%.</p>
          <div style={{ display:"flex", gap:10 }}>
            <button disabled style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"10px 22px", fontWeight:700, fontSize:13, cursor:"not-allowed", fontFamily:"'Manrope',system-ui,sans-serif", opacity:.5 }}>
              Configura percentuali
            </button>
            <button disabled style={{ background:"white", border:"1px solid rgba(0,0,0,.1)", color:MUTED, borderRadius:100, padding:"10px 22px", fontWeight:700, fontSize:13, cursor:"not-allowed", fontFamily:"'Manrope',system-ui,sans-serif", opacity:.5 }}>
              Esporta CSV
            </button>
          </div>
        </Card>
      </ProLock>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   REFERRAL SECTION
═══════════════════════════════════════════════════════════ */
function ReferralSection({ currentUser, plan }) {
  const [code, setCode]       = useState("");
  const [link, setLink]       = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);
  const [regen, setRegen]     = useState(false);

  useEffect(() => {
    fetch("/api/referral/code")
      .then(r => r.json())
      .then(d => { if (d.code) { setCode(d.code); setLink(d.link); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function regenerate() {
    setRegen(true);
    const res = await fetch("/api/referral/code", { method:"POST" });
    const d = await res.json();
    if (d.code) { setCode(d.code); setLink(d.link); }
    setRegen(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" }}>
      <div style={{ marginBottom:16 }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", margin:"0 0 4px", fontFamily:"Manrope,system-ui,sans-serif" }}>Link referral</p>
        <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, color:"#0a0a0b", margin:"0 0 4px" }}>Invita i tuoi artisti</h3>
        <p style={{ fontSize:13, color:"#6b6b73", margin:0, fontFamily:"Manrope,system-ui,sans-serif" }}>
          Condividi questo link con i tuoi artisti. Quando si registrano tramite il tuo link, vengono automaticamente collegati al tuo profilo promoter.
        </p>
      </div>

      {loading ? (
        <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Caricamento...</p>
      ) : (
        <>
          {/* Codice */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
            <div style={{ background:"#0a0a0b", borderRadius:12, padding:"8px 16px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:18, color:"white", letterSpacing:"3px" }}>{code}</span>
            </div>
            <span style={{ fontSize:12, color:"#6b6b73" }}>Il tuo codice personale</span>
          </div>

          {/* Link */}
          <div style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.08)", borderRadius:14, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:12, flexWrap:"wrap" }}>
            <p style={{ fontSize:12, color:"#6b6b73", margin:0, fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{link}</p>
            <button onClick={copyLink}
              style={{ background: copied?"#16a34a":"#0a0a0b", color:"white", border:"none", borderRadius:10, padding:"7px 16px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Manrope,system-ui,sans-serif", flexShrink:0, transition:"background .2s" }}>
              {copied ? "✓ Copiato!" : "Copia link"}
            </button>
          </div>

          {/* Come funziona */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
            {[["1","Condividi","Invia il link ai tuoi artisti via WhatsApp, email o Instagram"],["2","Si registrano","L'artista clicca il link e crea l'account — viene collegato a te automaticamente"],["3","Gestisci","L'artista appare nel tuo roster e puoi gestire i suoi booking"]].map(([n,title,desc]) => (
              <div key={n} style={{ background:"#fbfaf8", borderRadius:14, padding:"12px 14px" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"#ff5a00", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:11, color:"white", marginBottom:8 }}>{n}</div>
                <p style={{ fontWeight:700, fontSize:12, color:"#0a0a0b", margin:"0 0 4px" }}>{title}</p>
                <p style={{ fontSize:11, color:"#6b6b73", margin:0, lineHeight:1.5 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Rigenera */}
          <button onClick={regenerate} disabled={regen}
            style={{ background:"none", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"6px 16px", fontSize:11, fontWeight:700, color:"#6b6b73", cursor:"pointer", fontFamily:"Manrope,system-ui,sans-serif", opacity:regen?.5:1 }}>
            {regen ? "Rigenerazione..." : "↻ Rigenera codice"}
          </button>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 5 — AGENZIA (pagina pubblica)
═══════════════════════════════════════════════════════════ */
function TabAgenzia({ currentUser, portfolio, plan }) {
  const [agencyName, setAgencyName] = useState(currentUser?.name||"");
  const [bio, setBio]               = useState("");
  const [logo, setLogo]             = useState("");
  const [website, setWebsite]       = useState("");
  const [instagram, setInstagram]   = useState("");
  const [saveMsg, setSaveMsg]       = useState("");

  useEffect(() => {
    fetch("/api/promoter-agency")
      .then(r=>r.json())
      .then(d=>{
        if (!d) return;
        setAgencyName(d.agency_name||"");
        setBio(d.bio||"");
        setLogo(d.logo_url||"");
        setWebsite(d.website||"");
        setInstagram(d.instagram||"");
      }).catch(()=>{});
  },[]);

  async function save(e) {
    e.preventDefault();
    setSaveMsg("Salvataggio...");
    const res = await fetch("/api/promoter-agency",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ agency_name:agencyName, bio, logo_url:logo, website, instagram }),
    });
    setSaveMsg(res.ok?"✓ Salvato":"Errore salvataggio");
  }

  const portfolioArtists = portfolio.filter(p=>p.entity_type==="artist");
  const isPro = plan==="pro";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Sezione referral */}
      <ReferralSection currentUser={currentUser} plan={plan} />

      {/* Preview pagina pubblica base */}
      <Card>
        <STitle>Pagina pubblica agenzia</STitle>
        <p style={{ fontSize:13, color:MUTED, marginBottom:16 }}>
          Questa pagina sarà visibile agli artisti e ai locali nel marketplace.
          {!isPro && <span style={{ color:ORANGE, fontWeight:700 }}> Con PRO sblocchi la versione brandizzata completa.</span>}
        </p>

        {/* Preview card */}
        <div style={{ border:"1px solid rgba(0,0,0,.08)", borderRadius:20, overflow:"hidden", marginBottom:16 }}>
          <div style={{ background:INK, padding:"24px", display:"flex", alignItems:"center", gap:16 }}>
            {logo ? (
              <img src={logo} alt="Logo" style={{ width:56, height:56, borderRadius:14, objectFit:"cover", border:"2px solid rgba(255,255,255,.1)" }} />
            ) : (
              <div style={{ width:56, height:56, borderRadius:14, background:ORANGE, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:20, color:"white" }}>
                {(agencyName||"A").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:"white", margin:0 }}>{agencyName||"Nome agenzia"}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.45)", margin:"3px 0 0" }}>
                {portfolioArtists.length} artisti · Promoter
                {isPro && <span style={{ marginLeft:8, background:ORANGE, color:"white", borderRadius:100, padding:"1px 8px", fontSize:10, fontWeight:800 }}>✓ Verificato</span>}
              </p>
            </div>
          </div>
          <div style={{ padding:"16px 20px", background:"#fbfaf8" }}>
            <p style={{ fontSize:13, color:MUTED, margin:0, lineHeight:1.6 }}>
              {bio||"Nessuna bio inserita."}
            </p>
            {portfolioArtists.length > 0 && (
              <div style={{ marginTop:12 }}>
                <p style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 8px" }}>Artisti rappresentati</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {portfolioArtists.map(a => (
                    <span key={a.id} style={{ background:"white", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"4px 12px", fontSize:12, fontWeight:600, color:INK }}>
                      {a.entity_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Form base — visibile a tutti */}
      <Card>
        <STitle>Dati agenzia</STitle>
        <form onSubmit={save} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Inp label="Nome agenzia *" value={agencyName} onChange={e=>setAgencyName(e.target.value)} placeholder="Es. Sound Management" />
            <Inp label="Logo (URL)" value={logo} onChange={e=>setLogo(e.target.value)} placeholder="https://..." disabled={!isPro} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3}
              placeholder="Descrivi la tua agenzia e i servizi che offri..."
              style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 13px", fontSize:13, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", resize:"vertical" }} />
          </div>

          {/* Campi PRO */}
          <ProLock feature="I link pubblici e il sito web dell'agenzia" plan={plan}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Inp label="Sito web" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://..." />
              <Inp label="Instagram" value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="@nomeagenzia" />
            </div>
          </ProLock>

          {saveMsg && <p style={{ fontSize:13, fontWeight:700, color:saveMsg.includes("✓")?"#16a34a":"#dc2626" }}>{saveMsg}</p>}
          <button type="submit" style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"12px 28px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", alignSelf:"flex-start" }}>
            Salva
          </button>
        </form>
      </Card>

      {/* Badge verificato + upgrade — solo PRO */}
      {!isPro && (
        <div style={{ background:"rgba(255,90,0,.04)", border:"1px solid rgba(255,90,0,.15)", borderRadius:18, padding:"16px 20px", display:"flex", gap:14, alignItems:"flex-start" }}>
          <span style={{ fontSize:28 }}>⭐</span>
          <div>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:INK, margin:"0 0 4px" }}>
              Agenzia verificata + pagina brandizzata <ProBadge />
            </p>
            <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.6 }}>
              Con il piano Pro ottieni il badge di agenzia verificata, logo personalizzato, link social pubblici e posizione prioritaria nel marketplace. I tuoi artisti vengono presentati come "gestiti da [nome agenzia]".
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
const TABS = [
  { id:"overview",    label:"Overview",    icon:"📊" },
  { id:"roster",      label:"Roster",      icon:"🎤" },
  { id:"trattative",  label:"Trattative",  icon:"🎯" },
  { id:"commissioni", label:"Commissioni", icon:"💰" },
  { id:"agenzia",     label:"Agenzia",     icon:"🏢" },
];

export default function PromoterArea({ currentUser, events=[], bookings=[], users=[], artists=[] }) {
  const plan = currentUser?.plan || "free";
  const [tab, setTab]              = useState("overview");
  const [portfolio, setPortfolio]  = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [addingEntry, setAddingEntry] = useState(false);
  const [addMsg, setAddMsg]        = useState("");

  useEffect(() => {
    fetch("/api/promoter-portfolio")
      .then(r=>r.json()).then(d=>{ setPortfolio(Array.isArray(d)?d:[]); setLoadingPortfolio(false); }).catch(()=>setLoadingPortfolio(false));
    fetch("/api/contact-request")
      .then(r=>r.json()).then(d=>setContactRequests(Array.isArray(d)?d:[])).catch(()=>{});
    fetch("/api/promoter-commissions")
      .then(r=>r.json()).then(d=>setCommissions(Array.isArray(d)?d:[])).catch(()=>{});
  },[]);

  async function handleAdd(entry) {
    if (!entry.entityId) { setAddMsg("Seleziona un elemento"); return; }
    setAddingEntry(true); setAddMsg("");
    try {
      const res = await fetch("/api/promoter-portfolio",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ entityType:entry.entityType, entityId:Number(entry.entityId) }),
      });
      const d = await res.json();
      if (res.ok) { setPortfolio(prev=>[d,...prev]); setAddMsg("✓ Aggiunto al roster"); }
      else setAddMsg(d.error||"Errore");
    } catch { setAddMsg("Errore tecnico"); }
    setAddingEntry(false);
  }

  async function handleRemove(id) {
    await fetch(`/api/promoter-portfolio?id=${id}`,{method:"DELETE"});
    setPortfolio(prev=>prev.filter(p=>p.id!==id));
  }

  async function handleUpdateStatus(id, status) {
    const res = await fetch("/api/contact-request",{
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id,status}),
    });
    if (res.ok) setContactRequests(prev=>prev.map(r=>r.id===id?{...r,status}:r));
  }

  const s = {
    tabBtn: (active) => ({
      display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
      borderRadius:100, fontWeight:700, fontSize:13, cursor:"pointer",
      border: active?"none":"1px solid rgba(0,0,0,.1)",
      background: active?INK:"white", color: active?"white":MUTED,
      fontFamily:"'Manrope',system-ui,sans-serif", whiteSpace:"nowrap",
    }),
  };

  return (
    <div id="promoter-area" style={{ fontFamily:"'Manrope',system-ui,sans-serif", color:INK, display:"flex", flexDirection:"column", gap:16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700;800&display=swap');`}</style>

      {/* Header + Tabs */}
      <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" }}>
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:ORANGE, margin:"0 0 4px" }}>Promoter</p>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:22, letterSpacing:"-.03em", margin:"0 0 4px" }}>
            {currentUser?.name||"Area Promoter"}
          </h2>
          <p style={{ fontSize:13, color:MUTED, margin:0 }}>Roster, trattative, commissioni e pagina pubblica agenzia.</p>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {TABS.map(t => (
            <button key={t.id} type="button" onClick={()=>setTab(t.id)} style={s.tabBtn(tab===t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {tab==="overview"    && <TabOverview currentUser={currentUser} bookings={bookings} portfolio={portfolio} contactRequests={contactRequests} plan={plan} commissions={commissions} />}
      {tab==="roster"      && <TabRoster portfolio={portfolio} users={[...users,...artists]} plan={plan} onAdd={handleAdd} onRemove={handleRemove} addingEntry={addingEntry} addMsg={addMsg} />}
      {tab==="trattative"  && <TabTrattative contactRequests={contactRequests} portfolio={portfolio} plan={plan} onUpdateStatus={handleUpdateStatus} />}
      {tab==="commissioni" && <TabCommissioni commissions={commissions} bookings={bookings} portfolio={portfolio} plan={plan} />}
      {tab==="agenzia"     && <TabAgenzia currentUser={currentUser} portfolio={portfolio} plan={plan} />}
    </div>
  );
}