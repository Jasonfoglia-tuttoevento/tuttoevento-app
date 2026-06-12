// src/components/dashboard/PromoterNetwork.jsx
"use client";
import { useState, useEffect } from "react";

const O    = "#ff5a00";
const INK  = "#0a0a0b";
const MUTED= "#6b6b73";
const CARD = "#ffffff";
const BORDER = "rgba(0,0,0,.07)";

function fmt(n) {
  return new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0);
}
function SCard({children,style={}}) {
  return <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:20,padding:"18px 20px",...style}}>{children}</div>;
}
function STitle({children,sub}) {
  return (
    <div style={{marginBottom:14}}>
      <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:INK,margin:0,letterSpacing:"-.02em"}}>{children}</h3>
      {sub&&<p style={{fontSize:12,color:MUTED,margin:"3px 0 0",lineHeight:1.5}}>{sub}</p>}
    </div>
  );
}
function Kpi({label,value,accent=false,orange=false}) {
  return (
    <div style={{background:accent?INK:orange?`${O}08`:"#f8f8f9",border:`1px solid ${accent||orange?"transparent":"rgba(0,0,0,.06)"}`,borderRadius:16,padding:"14px 16px"}}>
      <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",color:accent?"rgba(255,255,255,.5)":orange?O:MUTED,margin:"0 0 5px",fontFamily:"'Manrope',system-ui,sans-serif"}}>{label}</p>
      <p style={{fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:20,letterSpacing:"-.04em",color:accent?"white":orange?O:INK,margin:0}}>{value}</p>
    </div>
  );
}

function StatusBadge({status}) {
  const map = {
    pending:   {label:"In attesa",  color:"#d97706",bg:"rgba(217,119,6,.1)"},
    accepted:  {label:"Accettato",  color:"#16a34a",bg:"rgba(22,163,74,.1)"},
    confirmed: {label:"Confermato", color:"#16a34a",bg:"rgba(22,163,74,.1)"},
    completed: {label:"Completato", color:"#16a34a",bg:"rgba(22,163,74,.1)"},
    rejected:  {label:"Rifiutato",  color:"#dc2626",bg:"rgba(220,38,38,.1)"},
    cancelled: {label:"Cancellato", color:MUTED,    bg:"rgba(0,0,0,.07)"},
  };
  const c = map[(status||"").toLowerCase()] || {label:status||"—",color:MUTED,bg:"rgba(0,0,0,.06)"};
  return <span style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:100,background:c.bg,color:c.color,whiteSpace:"nowrap"}}>{c.label}</span>;
}

export default function PromoterNetwork({ currentUser }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("overview");
  const [code,    setCode]    = useState("");
  const [addMsg,  setAddMsg]  = useState("");
  const [adding,  setAdding]  = useState(false);

  useEffect(()=>{ load(); },[]);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/promoter-network");
    const d = await r.json();
    setData(r.ok ? d : null);
    setLoading(false);
  }

  async function addSubPromoter() {
    if (!code.trim()) return;
    setAdding(true); setAddMsg("");
    const res = await fetch("/api/promoter-network",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({referralCode:code.trim()}),
    });
    const d = await res.json();
    if (!res.ok) setAddMsg(d.error||"Errore");
    else { setAddMsg(`✓ ${d.subPromoter?.name} aggiunto al tuo network!`); setCode(""); load(); }
    setAdding(false);
  }

  async function removeSubPromoter(subId) {
    if (!confirm("Rimuovere questo sub-promoter dalla tua rete?")) return;
    await fetch(`/api/promoter-network?subId=${subId}`,{method:"DELETE"});
    load();
  }

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"40px",gap:10}}>
      <div style={{width:18,height:18,border:`2px solid rgba(255,90,0,.2)`,borderTopColor:O,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <p style={{fontSize:13,color:MUTED,margin:0}}>Caricamento rete...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return <p style={{color:"#dc2626",fontSize:13}}>Errore caricamento dati rete.</p>;

  const { summary, subPromoters, myVenues, subVenues, myBookings, subBookings, referralCode } = data;

  const TABS = [
    { key:"overview",    label:"Panoramica" },
    { key:"network",     label:`Rete (${summary.subPromoterCount})` },
    { key:"venues",      label:`Locali (${summary.totalVenues})` },
    { key:"bookings",    label:"Booking miei" },
    { key:"subbookings", label:"Booking rete" },
    { key:"commissioni", label:"Commissioni" },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,fontFamily:"'Manrope',system-ui,sans-serif"}}>

      {/* Tab bar */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{padding:"7px 14px",borderRadius:100,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Manrope',system-ui,sans-serif",border:tab===t.key?"none":"1px solid rgba(0,0,0,.1)",background:tab===t.key?INK:"white",color:tab===t.key?"white":MUTED,transition:"all .15s",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PANORAMICA ── */}
      {tab==="overview" && (
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
            <Kpi label="Miei locali"         value={summary.myVenueCount} />
            <Kpi label="Sub-promoter"         value={summary.subPromoterCount} />
            <Kpi label="Locali rete"          value={summary.subVenueCount} />
            <Kpi label="Commissioni dirette"  value={fmt(summary.myCommission)} orange />
            <Kpi label="Commissioni rete"     value={fmt(summary.subCommission)} orange />
            <Kpi label="Totale commissioni"   value={fmt(summary.totalCommission)} accent />
          </div>

          {/* Come funziona */}
          <SCard>
            <STitle sub="Come vengono calcolate le commissioni">Struttura commissioni</STitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {/* Senza sub */}
              <div style={{background:"#f8f8f9",borderRadius:14,padding:"14px 16px"}}>
                <p style={{fontSize:11,fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:".1em",margin:"0 0 10px"}}>Booking diretto (senza sub)</p>
                {[
                  {label:"Artista",      pct:"60%", color:INK},
                  {label:"TuttoEvento",  pct:"20%", color:"#6b6b73"},
                  {label:"Tu",           pct:"20%", color:O},
                ].map(r=>(
                  <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:12,color:r.color,fontWeight:r.color===O?800:400}}>{r.label}</span>
                    <span style={{fontSize:13,fontWeight:700,color:r.color}}>{r.pct}</span>
                  </div>
                ))}
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(0,0,0,.06)"}}>
                  <p style={{fontSize:11,color:MUTED,margin:0}}>Es. su €100: tu guadagni <strong style={{color:O}}>€20</strong></p>
                </div>
              </div>
              {/* Con sub */}
              <div style={{background:`${O}06`,border:`1px solid ${O}20`,borderRadius:14,padding:"14px 16px"}}>
                <p style={{fontSize:11,fontWeight:700,color:O,textTransform:"uppercase",letterSpacing:".1em",margin:"0 0 10px"}}>Booking dalla tua rete</p>
                {[
                  {label:"Artista",      pct:"60%", color:INK},
                  {label:"TuttoEvento",  pct:"20%", color:"#6b6b73"},
                  {label:"Sub-promoter", pct:"10%", color:"#2563eb"},
                  {label:"Tu (padre)",   pct:"10%", color:O},
                ].map(r=>(
                  <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:12,color:r.color,fontWeight:r.color===O?800:400}}>{r.label}</span>
                    <span style={{fontSize:13,fontWeight:700,color:r.color}}>{r.pct}</span>
                  </div>
                ))}
                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${O}20`}}>
                  <p style={{fontSize:11,color:MUTED,margin:0}}>Es. su €100: tu guadagni <strong style={{color:O}}>€10 passivi</strong> per ogni booking del tuo sub-promoter</p>
                </div>
              </div>
            </div>
          </SCard>

          {/* Il tuo codice referral */}
          <SCard>
            <STitle sub="Condividi questo codice con altri promoter per aggiungerli alla tua rete">Il tuo codice referral</STitle>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{background:"#f8f8f9",border:`1px solid ${BORDER}`,borderRadius:12,padding:"10px 16px",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:20,letterSpacing:".1em",color:INK}}>
                {referralCode||"—"}
              </div>
              <button onClick={()=>{navigator.clipboard.writeText(referralCode||""); alert("Codice copiato!");}}
                style={{background:INK,color:"white",border:"none",borderRadius:100,padding:"10px 18px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Manrope',system-ui,sans-serif",display:"flex",alignItems:"center",gap:6}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copia codice
              </button>
            </div>
          </SCard>
        </>
      )}

      {/* ── GESTIONE RETE ── */}
      {tab==="network" && (
        <>
          {/* Aggiungi sub-promoter */}
          <SCard>
            <STitle sub="Inserisci il codice referral del promoter che vuoi aggiungere alla tua rete">Aggiungi sub-promoter</STitle>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:addMsg?10:0}}>
              <input
                value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
                placeholder="Es. AB12CD34"
                style={{flex:1,minWidth:160,background:"#fbfaf8",border:"1px solid rgba(0,0,0,.1)",borderRadius:12,padding:"10px 14px",fontSize:13,color:INK,fontFamily:"'Manrope',system-ui,sans-serif",outline:"none"}}
                onKeyDown={e=>e.key==="Enter"&&addSubPromoter()}
              />
              <button onClick={addSubPromoter} disabled={adding||!code.trim()}
                style={{background:O,color:"white",border:"none",borderRadius:100,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:adding||!code.trim()?"not-allowed":"pointer",fontFamily:"'Manrope',system-ui,sans-serif",opacity:adding||!code.trim()?.6:1,transition:"all .2s",boxShadow:`0 4px 14px ${O}30`}}>
                {adding?"Aggiunta...":"+ Aggiungi"}
              </button>
            </div>
            {addMsg && <p style={{fontSize:13,fontWeight:700,color:addMsg.startsWith("✓")?"#16a34a":"#dc2626",margin:0}}>{addMsg}</p>}
            <p style={{fontSize:11,color:MUTED,margin:"10px 0 0",lineHeight:1.6}}>
              Il sub-promoter ti cede metà della sua commissione (10%) su ogni booking che porta. Il suo guadagno passa da 20% a 10% — deve sapere e accettare prima di condividere il codice.
            </p>
          </SCard>

          {/* Lista sub-promoter */}
          <SCard>
            <STitle sub={`${summary.subPromoterCount} promoter nella tua rete`}>La tua rete</STitle>
            {subPromoters.length===0 ? (
              <div style={{padding:"20px 0",textAlign:"center"}}>
                <p style={{fontSize:13,color:MUTED,margin:0}}>Nessun sub-promoter ancora.</p>
                <p style={{fontSize:12,color:"rgba(0,0,0,.25)",margin:"4px 0 0"}}>Condividi il tuo codice referral per iniziare a costruire la tua rete.</p>
              </div>
            ) : subPromoters.map(sp=>(
              <div key={sp.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(0,0,0,.05)",flexWrap:"wrap"}}>
                <div>
                  <p style={{fontWeight:700,fontSize:14,color:INK,margin:"0 0 2px"}}>{sp.name}</p>
                  <p style={{fontSize:12,color:MUTED,margin:0}}>
                    {sp.email} ·
                    <span style={{color:O,fontWeight:700}}> codice: {sp.referral_code||"—"}</span>
                  </p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {/* Locali portati da questo sub */}
                  <span style={{fontSize:12,color:MUTED}}>
                    {subVenues.filter(v=>v.referred_by===sp.referral_code).length} locali
                  </span>
                  <span style={{fontSize:12,fontWeight:700,color:O}}>
                    {fmt((subBookings||[]).filter(b=>b.promoter_id===sp.id||Number(b.promoter_id)===Number(sp.id)).reduce((s,b)=>s+(Number(b.sub_promoter_fee)||0),0))}
                  </span>
                  <button onClick={()=>removeSubPromoter(sp.id)}
                    style={{background:"transparent",border:"1px solid rgba(220,38,38,.25)",color:"#dc2626",borderRadius:100,padding:"5px 12px",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"'Manrope',system-ui,sans-serif"}}>
                    Rimuovi
                  </button>
                </div>
              </div>
            ))}
          </SCard>
        </>
      )}

      {/* ── LOCALI ── */}
      {tab==="venues" && (
        <>
          <SCard>
            <STitle sub={`${summary.myVenueCount} locali portati direttamente da te`}>I miei locali</STitle>
            {myVenues.length===0 ? (
              <p style={{fontSize:13,color:MUTED}}>Nessun locale ancora. Condividi il tuo codice referral con i locali.</p>
            ) : myVenues.map(v=>(
              <div key={v.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(0,0,0,.05)"}}>
                <div>
                  <p style={{fontWeight:700,fontSize:13,color:INK,margin:"0 0 2px"}}>{v.name}</p>
                  <p style={{fontSize:11,color:MUTED,margin:0}}>{v.email}</p>
                </div>
                <span style={{fontSize:11,color:MUTED}}>{new Date(v.created_at).toLocaleDateString("it-IT")}</span>
              </div>
            ))}
          </SCard>

          {subVenues.length>0 && (
            <SCard>
              <STitle sub={`${summary.subVenueCount} locali portati dalla tua rete`}>Locali della rete</STitle>
              {subVenues.map(v=>(
                <div key={v.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(0,0,0,.05)"}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:13,color:INK,margin:"0 0 2px"}}>{v.name}</p>
                    <p style={{fontSize:11,color:MUTED,margin:0}}>via sub-promoter</p>
                  </div>
                  <span style={{fontSize:11,color:MUTED}}>{new Date(v.created_at).toLocaleDateString("it-IT")}</span>
                </div>
              ))}
            </SCard>
          )}
        </>
      )}

      {/* ── BOOKING DIRETTI ── */}
      {tab==="bookings" && (
        <SCard>
          <STitle sub="Booking generati dai tuoi locali diretti">I miei booking</STitle>
          {!myBookings?.length ? (
            <p style={{fontSize:13,color:MUTED}}>Nessun booking ancora.</p>
          ) : myBookings.map(b=>(
            <div key={b.id} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid rgba(0,0,0,.05)",gap:12,flexWrap:"wrap"}}>
              <div style={{minWidth:0}}>
                <p style={{fontWeight:700,fontSize:13,color:INK,margin:"0 0 3px"}}>{b.artist_name||b.artistName||"—"}</p>
                <p style={{fontSize:12,color:MUTED,margin:0}}>
                  {b.event_date||b.eventDate||"—"}
                  {(b.event_title||b.eventTitle)&&` · ${b.event_title||b.eventTitle}`}
                </p>
                <p style={{fontSize:12,color:MUTED,margin:"2px 0 0"}}>{b.organizer_name||b.organizerName||"—"}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <StatusBadge status={b.status} />
                {b.public_price&&<span style={{fontSize:13,fontWeight:700,color:O}}>€{b.public_price}</span>}
                {b.promoter_fee>0&&(
                  <span style={{fontSize:12,fontWeight:700,color:"#16a34a",background:"rgba(22,163,74,.08)",borderRadius:100,padding:"2px 10px"}}>+{fmt(b.promoter_fee)}</span>
                )}
              </div>
            </div>
          ))}
        </SCard>
      )}

      {/* ── BOOKING RETE ── */}
      {tab==="subbookings" && (
        <SCard>
          <STitle sub="Booking generati dai locali della tua rete — guadagni 10% su ognuno">Booking dalla rete</STitle>
          {!subBookings?.length ? (
            <p style={{fontSize:13,color:MUTED}}>Nessun booking dalla rete ancora. Aggiungi sub-promoter per iniziare a guadagnare passivamente.</p>
          ) : subBookings.map(b=>(
            <div key={b.id} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid rgba(0,0,0,.05)",gap:12,flexWrap:"wrap"}}>
              <div style={{minWidth:0}}>
                <p style={{fontWeight:700,fontSize:13,color:INK,margin:"0 0 3px"}}>{b.artist_name||b.artistName||"—"}</p>
                <p style={{fontSize:12,color:MUTED,margin:0}}>
                  {b.event_date||b.eventDate||"—"}
                  {(b.event_title||b.eventTitle)&&` · ${b.event_title||b.eventTitle}`}
                </p>
                <p style={{fontSize:12,color:"#2563eb",fontWeight:600,margin:"2px 0 0"}}>via sub-promoter</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <StatusBadge status={b.status} />
                {b.public_price&&<span style={{fontSize:13,fontWeight:700,color:MUTED}}>€{b.public_price}</span>}
                {b.sub_promoter_fee>0&&(
                  <span style={{fontSize:12,fontWeight:700,color:O,background:`${O}10`,borderRadius:100,padding:"2px 10px"}}>+{fmt(b.sub_promoter_fee)} tue</span>
                )}
              </div>
            </div>
          ))}
        </SCard>
      )}

      {/* ── COMMISSIONI ── */}
      {tab==="commissioni" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
            <Kpi label="Commissioni dirette" value={fmt(summary.myCommission)} orange />
            <Kpi label="Commissioni rete"    value={fmt(summary.subCommission)} orange />
            <Kpi label="Totale"              value={fmt(summary.totalCommission)} accent />
          </div>

          <SCard>
            <STitle sub="Dettaglio per booking">Storico commissioni</STitle>
            {[...(myBookings||[]).map(b=>({...b,_type:"direct"})), ...(subBookings||[]).map(b=>({...b,_type:"network"}))].length===0 ? (
              <p style={{fontSize:13,color:MUTED}}>Nessuna commissione ancora.</p>
            ) : [...(myBookings||[]).map(b=>({...b,_type:"direct"})), ...(subBookings||[]).map(b=>({...b,_type:"network"}))]
              .sort((a,b)=>new Date(b.event_date||0)-new Date(a.event_date||0))
              .map((b,i)=>{
                const fee = b._type==="direct"?b.promoter_fee:b.sub_promoter_fee;
                if (!fee || fee<=0) return null;
                return (
                  <div key={b.id||i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(0,0,0,.05)",gap:10,flexWrap:"wrap"}}>
                    <div style={{minWidth:0}}>
                      <p style={{fontWeight:700,fontSize:13,color:INK,margin:"0 0 2px"}}>{b.artist_name||b.artistName||"—"}</p>
                      <p style={{fontSize:12,color:MUTED,margin:0}}>{b.event_date||b.eventDate||"—"} · {b.organizer_name||"—"}</p>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:100,background:b._type==="direct"?`${O}10`:"rgba(37,99,235,.1)",color:b._type==="direct"?O:"#2563eb",fontWeight:700}}>
                        {b._type==="direct"?"Diretto":"Rete"}
                      </span>
                      <StatusBadge status={b.status} />
                      <span style={{fontSize:14,fontWeight:800,color:O}}>{fmt(fee)}</span>
                    </div>
                  </div>
                );
              })
            }
          </SCard>
        </div>
      )}
    </div>
  );
}