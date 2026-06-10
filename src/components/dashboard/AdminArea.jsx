"use client";
import AdminPricingApprovals from "@/components/dashboard/AdminPricingApprovals";
import VerifiedBadge from "@/components/VerifiedBadge";

import { useMemo, useState, useEffect } from "react";
import { aggregate, financials } from "./commissions";
import AdminFinance from "./admin/AdminFinance";
import AdminCRM from "./admin/AdminCRM";
import AdminCalendar from "./admin/AdminCalendar";
import AdminGrowth from "./admin/AdminGrowth";
import AdminAudit from "./admin/AdminAudit";

const ORANGE = "#ff5a00";
const INK    = "#0a0a0b";
const MUTED  = "#6b6b73";

function fmt(n) { return new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0); }
function pct(n) { return `${Number.isFinite(n)?n.toFixed(1):"0.0"}%`; }

const EVENT_TYPES = ["Serata in club","Festival","Evento privato","Concerto","Opening","Altro"];
const MARKET_BENCHMARKS = {
  "Serata in club":{ min:80,avg:150,max:400 },"Festival":{ min:200,avg:500,max:2000 },
  "Evento privato":{ min:150,avg:300,max:1000 },"Concerto":{ min:200,avg:600,max:3000 },
  "Opening":{ min:50,avg:100,max:250 },"Altro":{ min:80,avg:200,max:500 },
};
const CITY_MULT  = { "milano":1.3,"roma":1.2,"torino":1.1,"bologna":1.1,"firenze":1.1,"napoli":1.0,"palermo":0.95,"bari":0.95 };
const GENRE_MULT = { "techno":1.2,"house":1.15,"tech house":1.2,"dj":1.1,"jazz":1.1,"classica":1.2,"orchestra":1.4,"pop":1.0,"rock":1.05,"indie":1.0,"hip hop":1.1,"rap":1.1 };
const SEASON_MULT = [1.0,0.9,0.95,1.0,1.05,1.2,1.3,1.2,1.1,1.05,1.1,1.3];

function suggestPrice(cachet, eventType, city, genres) {
  if (!cachet || !eventType) return null;
  const net = Number(cachet);
  const bench = MARKET_BENCHMARKS[eventType] || MARKET_BENCHMARKS["Altro"];
  const cityMult  = Object.entries(CITY_MULT).find(([k])=>(city||"").toLowerCase().includes(k))?.[1] || 1.0;
  const genreMult = Object.entries(GENRE_MULT).find(([k])=>(genres||"").toLowerCase().includes(k))?.[1] || 1.0;
  const seasonMult = SEASON_MULT[new Date().getMonth()];
  let suggested = net / (1 - 0.45);
  suggested = Math.max(suggested, bench.min * cityMult * genreMult);
  suggested = Math.min(suggested, bench.max * cityMult * genreMult);
  suggested = Math.round(suggested * cityMult * genreMult * seasonMult / 10) * 10;
  const markup = ((suggested - net) / net * 100).toFixed(0);
  return { suggested, net, margin: suggested - net, markup: Number(markup), bench, cityMult, genreMult, seasonMult };
}

function Card({ children, style={} }) {
  return <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:20, padding:"20px 22px", ...style }}>{children}</div>;
}
function KPI({ label, value, accent }) {
  return (
    <div style={{ background:accent?INK:"white", border:`1px solid ${accent?"transparent":"rgba(0,0,0,.06)"}`, borderRadius:16, padding:"14px 16px" }}>
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:accent?"rgba(255,255,255,.45)":MUTED, margin:"0 0 4px" }}>{label}</p>
      <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, color:accent?"white":INK, margin:0, letterSpacing:"-.02em" }}>{value}</p>
    </div>
  );
}

/* ── Sezione Overview ── */
function SectionOverview({ fin, stats, byRole, eventModes }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10 }}>
        <KPI label="Ricavi" value={fmt(fin.revenue)} accent />
        <KPI label="EBITDA" value={fmt(fin.ebitda)} />
        <KPI label="Utile netto" value={fmt(fin.netProfit)} />
        <KPI label="ROS" value={pct(fin.ros)} />
        <KPI label="Booking conf." value={stats.confirmedCount} />
        <KPI label="Volume" value={fmt(stats.volume)} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:15, margin:"0 0 14px" }}>Conto economico</h3>
          {[["Ricavi",fmt(fin.revenue)],["− Costi op.",fmt(fin.totalOpCosts)],["= EBITDA",fmt(fin.ebitda)],["− Ammort.",fmt(fin.depreciation)],["= EBIT",fmt(fin.ebit)],["− Imposte",fmt(fin.taxes)],["= Utile netto",fmt(fin.netProfit)]].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(0,0,0,.05)", fontSize:13 }}>
              <span style={{ color:k.startsWith("=")?INK:MUTED, fontWeight:k.startsWith("=")?700:400 }}>{k}</span>
              <span style={{ fontWeight:700, color:k.includes("Utile")||k.includes("EBIT")?(fin.ebit>=0?"#16a34a":"#dc2626"):INK }}>{v}</span>
            </div>
          ))}
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card>
            <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:15, margin:"0 0 12px" }}>Utenti</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(70px,1fr))", gap:8 }}>
              {[["Locali",byRole.organizer?.length||0],["Artisti",byRole.artist?.length||0],["Promoter",byRole.promoter?.length||0],["Admin",byRole.admin?.length||0]].map(([k,v]) => (
                <div key={k} style={{ background:"#f5f5f6", borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                  <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:20, margin:0 }}>{v}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:"3px 0 0", fontWeight:600 }}>{k}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:15, margin:"0 0 12px" }}>Modalità eventi</h3>
            <div style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1, background:`${ORANGE}12`, border:`1px solid ${ORANGE}25`, borderRadius:14, padding:"12px", textAlign:"center" }}>
                <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:22, color:ORANGE, margin:0 }}>{eventModes.managed}</p>
                <p style={{ fontSize:12, fontWeight:700, color:ORANGE, margin:"4px 0 0" }}>Managed</p>
              </div>
              <div style={{ flex:1, background:"#f5f5f6", border:"1px solid rgba(0,0,0,.06)", borderRadius:14, padding:"12px", textAlign:"center" }}>
                <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:22, margin:0 }}>{eventModes.self}</p>
                <p style={{ fontSize:12, fontWeight:700, color:MUTED, margin:"4px 0 0" }}>Autonomi</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Sezione Artisti con pricing ── */
function SectionArtists({ users, bookings }) {
  const artists = (users||[]).filter(u => u.role === "artist");
  const [selected, setSelected]   = useState(null);
  const [pricing, setPricing]     = useState([]);
  const [basePubPrice, setBase]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState("");
  const [artistProfile, setProfile] = useState(null);
  const [pricingTab, setPricingTab] = useState("manual");

  const inp = { background:"#f5f5f6", border:"1px solid rgba(0,0,0,.08)", borderRadius:10, padding:"8px 11px", fontSize:13, fontFamily:"inherit", outline:"none" };

  async function selectArtist(a) {
    setSelected(a); setMsg(""); setBase(""); setProfile(null); setPricingTab("manual");
    const res = await fetch(`/api/artist-pricing?artistId=${a.id}`);
    const data = await res.json();
    const map = {};
    (Array.isArray(data)?data:[]).forEach(p => { map[p.event_type] = p.public_price; });
    setPricing(EVENT_TYPES.map(t => ({ eventType:t, publicPrice:map[t]||"" })));
    try { const r2 = await fetch(`/api/artist-profile?userId=${a.id}`); setProfile((await r2.json())||null); } catch {}
  }

  async function save(approve) {
    if (!selected) return;
    setSaving(true); setMsg("");
    const res = await fetch("/api/artist-pricing", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ artistId:selected.id, pricing:pricing.filter(p=>p.publicPrice), approve, basePubPrice:basePubPrice||null }),
    });
    setMsg(res.ok ? (approve?"✓ Pubblicato nel marketplace":"✓ Rimosso dal marketplace") : "Errore salvataggio");
    setSaving(false);
  }

  const cachet = artistProfile?.baseCachet || artistProfile?.base_cachet;
  const city   = artistProfile?.city;
  const genres = artistProfile?.genres || artistProfile?.musicGenres;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:14 }}>
      <Card>
        <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:14, margin:"0 0 12px" }}>Artisti registrati</h3>
        {artists.length === 0 ? <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun artista.</p> : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {artists.map(a => (
              <button key={a.id} onClick={() => selectArtist(a)} style={{ textAlign:"left", borderRadius:12, padding:"9px 11px", border:"1px solid rgba(0,0,0,.07)", background:selected?.id===a.id?INK:"#f5f5f6", color:selected?.id===a.id?"white":INK, cursor:"pointer", fontFamily:"inherit" }}>
                <p style={{ fontWeight:700, fontSize:13, margin:0 }}>{a.name}</p>
                <p style={{ fontSize:11, color:selected?.id===a.id?"rgba(255,255,255,.45)":MUTED, margin:"2px 0 0" }}>{a.email}</p>
              </button>
            ))}
          </div>
        )}
      </Card>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {!selected ? (
          <Card style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:200 }}>
            <p style={{ color:"rgba(0,0,0,.3)", fontSize:13 }}>Seleziona un artista</p>
          </Card>
        ) : (
          <>
            <Card>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10, marginBottom:12 }}>
                <div>
                  <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, margin:0 }}>{selected.name}</h3>
                  <p style={{ fontSize:12, color:MUTED, margin:"4px 0 0" }}>
                    {city && `${city} · `}{genres && `${genres} · `}
                    Cachet: <strong style={{ color:cachet?INK:"#dc2626" }}>{cachet?`€${cachet}`:"non inserito"}</strong>
                  </p>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {[["manual","Manuale"],["dynamic","Dinamico"]].map(([id,label]) => (
                    <button key={id} onClick={()=>setPricingTab(id)} style={{ padding:"6px 14px", borderRadius:100, fontWeight:700, fontSize:12, cursor:"pointer", border:pricingTab===id?"none":"1px solid rgba(0,0,0,.1)", background:pricingTab===id?INK:"white", color:pricingTab===id?"white":MUTED, fontFamily:"inherit" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {pricingTab === "manual" && (
                <>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
                    {pricing.map((p,i) => {
                      const sug = cachet ? suggestPrice(cachet, p.eventType, city, genres) : null;
                      return (
                        <div key={p.eventType} style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <span style={{ fontSize:12, fontWeight:600, minWidth:140, flexShrink:0 }}>{p.eventType}</span>
                          <input type="number" min="0" value={p.publicPrice} placeholder="Prezzo pubblico €"
                            onChange={e => setPricing(prev=>prev.map((x,j)=>j===i?{...x,publicPrice:e.target.value}:x))}
                            style={{ ...inp, width:130, textAlign:"right" }} />
                          {sug && (
                            <button onClick={()=>setPricing(prev=>prev.map((x,j)=>j===i?{...x,publicPrice:sug.suggested}:x))}
                              style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:8, background:`${ORANGE}15`, border:`1px solid ${ORANGE}30`, color:ORANGE, cursor:"pointer", fontFamily:"inherit" }}>
                              €{sug.suggested} (+{sug.markup}%)
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:MUTED, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".08em" }}>Prezzo base marketplace (€)</label>
                    <input type="number" min="0" value={basePubPrice} onChange={e=>setBase(e.target.value)} placeholder="es. 150" style={{ ...inp, width:180 }} />
                  </div>
                  {msg && <p style={{ fontSize:12, fontWeight:700, color:msg.startsWith("✓")?"#16a34a":"#dc2626", marginBottom:10 }}>{msg}</p>}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button disabled={saving} onClick={()=>save(true)} style={{ background:ORANGE, color:"white", border:"none", borderRadius:100, padding:"9px 20px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                      {saving?"Salvo...":"Pubblica nel marketplace"}
                    </button>
                    <button disabled={saving} onClick={()=>save(false)} style={{ background:"white", border:"1px solid #fca5a5", color:"#dc2626", borderRadius:100, padding:"9px 18px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                      Rimuovi
                    </button>
                  </div>
                </>
              )}

              {pricingTab === "dynamic" && (
                !cachet ? (
                  <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:14, padding:"14px 16px" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#c2410c", margin:0 }}>L'artista non ha inserito il cachet netto. Chiedigli di completare il profilo.</p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {EVENT_TYPES.map(tipo => {
                      const s2 = suggestPrice(cachet, tipo, city, genres);
                      if (!s2) return null;
                      const minM = Math.round(s2.bench.min * s2.cityMult);
                      const maxM = Math.round(s2.bench.max * s2.cityMult);
                      const bar  = Math.max(0, Math.min(100, ((s2.suggested-minM)/(maxM-minM))*100));
                      return (
                        <div key={tipo} style={{ background:"#f5f5f6", borderRadius:14, padding:"12px 14px", border:"1px solid rgba(0,0,0,.06)" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                            <span style={{ fontWeight:700, fontSize:13 }}>{tipo}</span>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <div style={{ textAlign:"right" }}>
                                <p style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:18, color:ORANGE, margin:0 }}>€{s2.suggested}</p>
                                <p style={{ fontSize:10, color:"#16a34a", fontWeight:700, margin:0 }}>+{s2.markup}% markup</p>
                              </div>
                              <button onClick={()=>{setPricing(prev=>prev.map(p=>p.eventType===tipo?{...p,publicPrice:s2.suggested}:p));setPricingTab("manual");}}
                                style={{ background:ORANGE, color:"white", border:"none", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                                Applica
                              </button>
                            </div>
                          </div>
                          <div style={{ height:4, background:"rgba(0,0,0,.07)", borderRadius:2, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${bar}%`, background:`linear-gradient(90deg,#bbf7d0,${ORANGE})`, borderRadius:2, transition:"width .4s" }} />
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:MUTED, marginTop:3 }}>
                            <span>€{minM}</span><span>€{maxM}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Sezione Richieste ── */
function SectionRequests({ requests, onUpdate }) {
  const STATUS_COLORS = { pending:"#d97706", reviewed:"#2563eb", connected:"#16a34a", rejected:"#dc2626" };
  const STATUS_LABELS = { pending:"In attesa", reviewed:"In revisione", connected:"Connessi", rejected:"Rifiutata" };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {requests.length === 0 ? <Card><p style={{ color:"rgba(0,0,0,.3)", fontSize:13 }}>Nessuna richiesta.</p></Card> :
        requests.map(r => (
          <div key={r.id} style={{ background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:18, padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, flexWrap:"wrap", marginBottom:10 }}>
              <div>
                <p style={{ fontWeight:700, fontSize:14, margin:0 }}>{r.organizer_name} <span style={{ color:MUTED, fontWeight:400 }}>cerca</span> {r.artist_name}</p>
                <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" }}>
                  {r.event_date && <span style={{ fontSize:12, color:MUTED }}>{r.event_date}</span>}
                  {r.event_type && <span style={{ fontSize:12, color:MUTED }}>{r.event_type}</span>}
                  {r.budget     && <span style={{ fontSize:12, fontWeight:700, color:ORANGE }}>€{r.budget}</span>}
                </div>
                {r.notes && <p style={{ fontSize:12, color:MUTED, margin:"6px 0 0", fontStyle:"italic" }}>"{r.notes}"</p>}
              </div>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, background:`${STATUS_COLORS[r.status]||"#6b7280"}18`, color:STATUS_COLORS[r.status]||"#6b7280", flexShrink:0 }}>
                {STATUS_LABELS[r.status]||r.status}
              </span>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {r.status==="pending" && <button onClick={()=>onUpdate(r.id,"reviewed")} style={{ fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, border:"none", background:INK, color:"white", cursor:"pointer", fontFamily:"inherit" }}>Prendi in carico</button>}
              {["pending","reviewed"].includes(r.status) && <>
                <button onClick={()=>onUpdate(r.id,"connected")} style={{ fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, border:"none", background:"#16a34a", color:"white", cursor:"pointer", fontFamily:"inherit" }}>Connetti</button>
                <button onClick={()=>onUpdate(r.id,"rejected")}  style={{ fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, border:"1px solid #fca5a5", background:"transparent", color:"#dc2626", cursor:"pointer", fontFamily:"inherit" }}>Rifiuta</button>
              </>}
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ── Sezione Contatti ── */
function SectionContacts({ contacts, setContacts }) {
  const [contact, setContact] = useState({ name:"", role:"", email:"", phone:"", notes:"" });
  const inp = { background:"#f5f5f6", border:"1px solid rgba(0,0,0,.08)", borderRadius:12, padding:"9px 12px", fontSize:13, fontFamily:"inherit", outline:"none", width:"100%" };

  async function addContact(e) {
    e.preventDefault();
    if (!contact.name) return;
    const res = await fetch("/api/contacts",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(contact) });
    const d = await res.json();
    if (res.ok) { setContacts(prev=>[d,...prev]); setContact({name:"",role:"",email:"",phone:"",notes:""}); }
  }
  async function del(id) {
    const res = await fetch(`/api/contacts?id=${id}`,{method:"DELETE"});
    if (res.ok) setContacts(prev=>prev.filter(c=>c.id!==id));
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:15, margin:"0 0 14px" }}>Aggiungi contatto</h3>
        <form onSubmit={addContact} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
          <input placeholder="Nome *" value={contact.name} onChange={e=>setContact(p=>({...p,name:e.target.value}))} style={inp} />
          <input placeholder="Ruolo" value={contact.role} onChange={e=>setContact(p=>({...p,role:e.target.value}))} style={inp} />
          <input placeholder="Email" value={contact.email} onChange={e=>setContact(p=>({...p,email:e.target.value}))} style={inp} />
          <input placeholder="Telefono" value={contact.phone} onChange={e=>setContact(p=>({...p,phone:e.target.value}))} style={inp} />
          <input placeholder="Note" value={contact.notes} onChange={e=>setContact(p=>({...p,notes:e.target.value}))} style={{ ...inp, gridColumn:"1/-1" }} />
          <button style={{ gridColumn:"1/-1", background:INK, color:"white", border:"none", borderRadius:100, padding:"9px 22px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", alignSelf:"flex-start" }}>Aggiungi</button>
        </form>
      </Card>
      <Card>
        <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:15, margin:"0 0 14px" }}>Rubrica aziendale</h3>
        {contacts.length === 0 ? <p style={{ color:"rgba(0,0,0,.3)", fontSize:13 }}>Nessun contatto.</p> :
          contacts.map(c => (
            <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", background:"#f5f5f6", borderRadius:14, padding:"11px 14px", marginBottom:8, gap:10 }}>
              <div>
                <p style={{ fontWeight:700, fontSize:13, margin:0 }}>{c.name}{c.role&&<span style={{color:MUTED,fontWeight:400}}> · {c.role}</span>}</p>
                <p style={{ fontSize:12, color:MUTED, margin:"2px 0 0" }}>{c.email}{c.phone&&` · ${c.phone}`}</p>
                {c.notes&&<p style={{ fontSize:12, color:MUTED, margin:"2px 0 0", fontStyle:"italic" }}>{c.notes}</p>}
              </div>
              <button onClick={()=>del(c.id)} style={{ background:"none", border:"none", color:"#dc2626", fontWeight:700, fontSize:13, cursor:"pointer" }}>Elimina</button>
            </div>
          ))
        }
      </Card>
    </div>
  );
}


/* ── Sezione Utenti ── */
function SectionUsers({ users }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editPlan, setEditPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const ROLES = ["all", "organizer", "artist", "promoter", "admin"];
  const ROLE_LABELS = { organizer:"Locale", artist:"Artista", promoter:"Promoter", admin:"Admin", referent:"Referente" };
  const ROLE_COLORS = { organizer:"#2563eb", artist:"#7c3aed", promoter:"#d97706", admin:"#ff5a00", referent:"#16a34a" };

  const filtered = users.filter(u => {
    const matchRole   = filter === "all" || u.role === filter;
    const matchSearch = !search || (u.name||"").toLowerCase().includes(search.toLowerCase()) || (u.email||"").toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  async function savePlan(userId) {
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/admin/user-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: editPlan }),
      });
      if (res.ok) { setMsg("✓ Piano aggiornato"); setEditingId(null); }
      else setMsg("Errore aggiornamento");
    } catch { setMsg("Errore di rete"); }
    setSaving(false);
  }

  const byRole = { organizer:0, artist:0, promoter:0, admin:0 };
  users.forEach(u => { if (byRole[u.role] !== undefined) byRole[u.role]++; });

  const inp = { background:"#f5f5f6", border:"1px solid rgba(0,0,0,.08)", borderRadius:10, padding:"8px 12px", fontSize:13, fontFamily:"inherit", outline:"none" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* KPI utenti */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>
        {[["Totale",users.length,"#0a0a0b"],["Locali",byRole.organizer,"#2563eb"],["Artisti",byRole.artist,"#7c3aed"],["Promoter",byRole.promoter,"#d97706"],["Admin",byRole.admin,"#ff5a00"]].map(([label,val,color]) => (
          <div key={label} style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:14, padding:"12px 14px" }}>
            <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:"#6b6b73", margin:"0 0 4px" }}>{label}</p>
            <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:20, color, margin:0 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Filtri + ricerca */}
      <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:18, padding:"16px 18px", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca per nome o email..."
          style={{ ...inp, flex:1, minWidth:200 }} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {ROLES.map(r => (
            <button key={r} onClick={()=>setFilter(r)}
              style={{ padding:"6px 14px", borderRadius:100, fontWeight:700, fontSize:12, cursor:"pointer", border:filter===r?"none":"1px solid rgba(0,0,0,.1)", background:filter===r?"#0a0a0b":"white", color:filter===r?"white":"#6b6b73", fontFamily:"inherit" }}>
              {r === "all" ? "Tutti" : (ROLE_LABELS[r]||r)}
            </button>
          ))}
        </div>
      </div>

      {msg && <p style={{ fontSize:12, fontWeight:700, color:msg.startsWith("✓")?"#16a34a":"#dc2626" }}>{msg}</p>}

      {/* Lista utenti */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length === 0 ? (
          <Card><p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun utente trovato.</p></Card>
        ) : filtered.map(u => (
          <div key={u.id} style={{ background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:16, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
            {/* Avatar */}
            <div style={{ width:38, height:38, borderRadius:"50%", background:`${ROLE_COLORS[u.role]||"#6b7280"}20`, border:`1px solid ${ROLE_COLORS[u.role]||"#6b7280"}30`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:14, color:ROLE_COLORS[u.role]||"#6b7280", flexShrink:0 }}>
              {(u.name||"?").charAt(0).toUpperCase()}
            </div>
            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <p style={{ fontWeight:700, fontSize:14, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name||"—"}</p>
                  {u.verified && <VerifiedBadge size={15} />}
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100, background:`${ROLE_COLORS[u.role]||"#6b7280"}15`, color:ROLE_COLORS[u.role]||"#6b7280" }}>
                  {ROLE_LABELS[u.role]||u.role}
                </span>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100, background: u.plan==="pro"?"rgba(255,90,0,.1)":"rgba(0,0,0,.05)", color: u.plan==="pro"?"#ff5a00":"#6b6b73" }}>
                  {u.plan==="pro"?"PRO":"Free"}
                </span>
              </div>
              <p style={{ fontSize:12, color:"#6b6b73", margin:"3px 0 0" }}>{u.email||"—"} · ID #{u.id}</p>
              {u.createdAt && <p style={{ fontSize:11, color:"rgba(0,0,0,.3)", margin:"2px 0 0" }}>Iscritto il {new Date(u.createdAt).toLocaleDateString("it-IT")}</p>}
            </div>
            {/* Piano edit */}
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              {editingId === u.id ? (
                <>
                  <select value={editPlan} onChange={e=>setEditPlan(e.target.value)} style={{ ...inp, padding:"6px 10px" }}>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                  <button onClick={()=>savePlan(u.id)} disabled={saving}
                    style={{ background:"#ff5a00", color:"white", border:"none", borderRadius:100, padding:"6px 14px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                    {saving?"...":"Salva"}
                  </button>
                  <button onClick={()=>setEditingId(null)}
                    style={{ background:"none", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"6px 12px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                    ×
                  </button>
                </>
              ) : (
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {!u.verified && (u.role==="artist"||u.role==="organizer"||u.role==="promoter") && (
                    <button onClick={async()=>{
                      const res = await fetch("/api/admin/user-plan",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:u.id,verified:true})});
                      if(res.ok) setMsg("✓ Utente verificato");
                    }}
                      style={{ background:"#1877F2", color:"white", border:"none", borderRadius:100, padding:"6px 14px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
                      <VerifiedBadge size={13} /> Verifica
                    </button>
                  )}
                  {u.verified && <VerifiedBadge size={18} />}
                  <button onClick={()=>{ setEditingId(u.id); setEditPlan(u.plan||"free"); }}
                    style={{ background:"none", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"6px 14px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit", color:"#6b6b73" }}>
                    Piano
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function AdminArea({ users=[], events=[], bookings=[], tab: initialTab }) {
  const [finance, setFinance]               = useState({});
  const [contacts, setContacts]             = useState([]);
  const [contactRequests, setContactRequests] = useState([]);

  useEffect(() => {
    fetch("/api/finance").then(r=>r.json()).then(d=>setFinance(d||{})).catch(()=>{});
    fetch("/api/contacts").then(r=>r.json()).then(d=>setContacts(Array.isArray(d)?d:[])).catch(()=>{});
    fetch("/api/contact-request").then(r=>r.json()).then(d=>setContactRequests(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  const rate  = Number(finance.commission_rate) || 0.08;
  const stats = useMemo(() => { try { return aggregate(bookings, rate); } catch { return { confirmedCount:0, volume:0, commission:0 }; } }, [bookings, rate]);
  const fin   = useMemo(() => { try { return financials(finance, stats); } catch { return { revenue:0,ebitda:0,ebit:0,netProfit:0,ros:0,roi:0,totalOpCosts:0,depreciation:0,interest:0,taxes:0 }; } }, [finance, stats]);

  const byRole = useMemo(() => {
    const r = { organizer:[], artist:[], promoter:[], referent:[], admin:[] };
    (users||[]).forEach(u => { if (r[u.role]) r[u.role].push(u); });
    return r;
  }, [users]);

  const eventModes = useMemo(() => {
    let managed=0, self=0;
    (events||[]).forEach(e => { if((e.eventMode||e.event_mode)==="managed") managed++; else self++; });
    return { managed, self };
  }, [events]);

  async function updateRequestStatus(id, status) {
    const res = await fetch("/api/contact-request",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id,status}) });
    if (res.ok) setContactRequests(prev=>prev.map(r=>r.id===id?{...r,status}:r));
  }

  const tab = initialTab || "overview";

  return (
    <div style={{ fontFamily:"'Manrope',system-ui,sans-serif", color:INK }}>
      {tab === "overview"  && <SectionOverview fin={fin} stats={stats} byRole={byRole} eventModes={eventModes} />}
      {tab === "users"     && <SectionUsers users={users} />}
      {tab === "finance"   && <AdminFinance bookings={bookings} finance={finance} />}
      {tab === "crm"       && <AdminCRM users={users} bookings={bookings} contactRequests={contactRequests} />}
      {tab === "calendar"  && <AdminCalendar events={events} bookings={bookings} />}
      {tab === "growth"    && <AdminGrowth users={users} bookings={bookings} events={events} />}
      {tab === "audit"     && <AdminAudit users={users} />}
      {tab === "artists"   && <SectionArtists users={users} bookings={bookings} />}
      {tab === "requests"  && <SectionRequests requests={contactRequests} onUpdate={updateRequestStatus} />}
      {tab === "contacts"  && <SectionContacts contacts={contacts} setContacts={setContacts} />}
    </div>
  );
}