"use client";

import { useMemo, useState, useEffect } from "react";
import { aggregate, commissionOf, cachetOf, isConfirmed, formatEuro, financials, formatPct, monthlySeries, topBy } from "./commissions";
import AdminFinance from "./admin/AdminFinance";
import AdminCRM from "./admin/AdminCRM";
import AdminCalendar from "./admin/AdminCalendar";
import AdminGrowth from "./admin/AdminGrowth";
import AdminAudit from "./admin/AdminAudit";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

function fmt(n) { return new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0); }
function pct(n) { return `${Number.isFinite(n)?n.toFixed(1):"0.0"}%`; }

const TABS = [
  { id:"overview", label:"Panoramica", icon:"📊" },
  { id:"finance", label:"Finanza", icon:"💰" },
  { id:"crm", label:"CRM", icon:"🎯" },
  { id:"calendar", label:"Calendario", icon:"📅" },
  { id:"growth", label:"Crescita", icon:"📈" },
  { id:"artists", label:"Artisti", icon:"🎤" },
  { id:"requests", label:"Richieste", icon:"📬" },
  { id:"contacts", label:"Contatti", icon:"👥" },
  { id:"audit", label:"Task & Log", icon:"✅" },
];

const EVENT_TYPES = ["Serata in club","Festival","Evento privato","Concerto","Opening","Altro"];

// ── Pricing dinamico ──
const MARKET_BENCHMARKS = {
  "Serata in club":  { min:80,  avg:150, max:400  },
  "Festival":        { min:200, avg:500, max:2000 },
  "Evento privato":  { min:150, avg:300, max:1000 },
  "Concerto":        { min:200, avg:600, max:3000 },
  "Opening":         { min:50,  avg:100, max:250  },
  "Altro":           { min:80,  avg:200, max:500  },
};
const CITY_MULT = { "milano":1.3,"roma":1.2,"torino":1.1,"bologna":1.1,"firenze":1.1,"napoli":1.0,"palermo":0.95,"bari":0.95 };
const GENRE_MULT = { "techno":1.2,"house":1.15,"tech house":1.2,"dj":1.1,"jazz":1.1,"classica":1.2,"orchestra":1.4,"pop":1.0,"rock":1.05,"indie":1.0,"hip hop":1.1,"rap":1.1 };
const SEASON_MULT = [1.0,0.9,0.95,1.0,1.05,1.2,1.3,1.2,1.1,1.05,1.1,1.3];

function suggestPrice(cachet, eventType, city, genres) {
  if (!cachet || !eventType) return null;
  const net = Number(cachet);
  const bench = MARKET_BENCHMARKS[eventType] || MARKET_BENCHMARKS["Altro"];
  const cityKey = (city||"").toLowerCase();
  const cityMult = Object.entries(CITY_MULT).find(([k])=>cityKey.includes(k))?.[1] || 1.0;
  const genresLower = (genres||"").toLowerCase();
  const genreMult = Object.entries(GENRE_MULT).find(([k])=>genresLower.includes(k))?.[1] || 1.0;
  const seasonMult = SEASON_MULT[new Date().getMonth()];
  let suggested = net / (1 - 0.45);
  suggested = Math.max(suggested, bench.min * cityMult * genreMult);
  suggested = Math.min(suggested, bench.max * cityMult * genreMult);
  suggested = suggested * cityMult * genreMult * seasonMult;
  suggested = Math.round(suggested / 10) * 10;
  const markup = ((suggested - net) / net * 100).toFixed(0);
  return { suggested, net, margin: suggested - net, markup: Number(markup), bench, cityMult, genreMult, seasonMult };
}

export default function AdminArea({ users = [], events = [], bookings = [] }) {
  const [tab, setTab] = useState("overview");
  const [finance, setFinance] = useState({});
  const [contacts, setContacts] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [contact, setContact] = useState({ name:"", role:"", email:"", phone:"", notes:"" });

  useEffect(() => {
    fetch("/api/finance").then(r=>r.json()).then(d=>setFinance(d||{})).catch(()=>{});
    fetch("/api/contacts").then(r=>r.json()).then(d=>setContacts(Array.isArray(d)?d:[])).catch(()=>{});
    fetch("/api/contact-request").then(r=>r.json()).then(d=>setContactRequests(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  const rate = Number(finance.commission_rate) || 0.08;
  const stats = useMemo(() => aggregate(bookings, rate), [bookings, rate]);
  const fin = useMemo(() => financials(finance, stats), [finance, stats]);

  const byRole = useMemo(() => {
    const r = { organizer:[], artist:[], promoter:[], referent:[], admin:[], other:[] };
    users.forEach(u => (r[u.role]||r.other).push(u));
    return r;
  }, [users]);

  const eventModes = useMemo(() => {
    let managed=0, self=0;
    events.forEach(e => { if((e.eventMode||e.event_mode)==="managed") managed++; else self++; });
    return { managed, self };
  }, [events]);

  async function deleteContact(id) {
    const res = await fetch(`/api/contacts?id=${id}`, { method:"DELETE" });
    if (res.ok) setContacts(contacts.filter(c=>c.id!==id));
  }
  async function addContact(e) {
    e.preventDefault();
    if (!contact.name) return;
    const res = await fetch("/api/contacts",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(contact) });
    const d = await res.json();
    if (res.ok) { setContacts([d,...contacts]); setContact({name:"",role:"",email:"",phone:"",notes:""}); }
  }
  async function updateRequestStatus(id, status) {
    const res = await fetch("/api/contact-request",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id,status}) });
    if (res.ok) setContactRequests(prev=>prev.map(r=>r.id===id?{...r,status}:r));
  }

  const s = {
    card: { background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px", marginBottom:0 },
    kpi: (accent) => ({ background: accent?INK:"white", border:`1px solid ${accent?"transparent":"rgba(0,0,0,.06)"}`, borderRadius:24, padding:"18px 20px" }),
    tabBtn: (active) => ({ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:100, fontWeight:700, fontSize:13, cursor:"pointer", border: active?"none":"1px solid rgba(0,0,0,.1)", background: active?INK:"white", color: active?"white":MUTED, fontFamily:"inherit", whiteSpace:"nowrap" }),
    input: { background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:14, padding:"9px 13px", fontSize:13, fontFamily:"inherit", outline:"none" },
  };

  return (
    <div style={{ fontFamily:"'Manrope',system-ui,sans-serif", color:INK, display:"flex", flexDirection:"column", gap:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={s.card}>
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.16em", color:ORANGE, marginBottom:4 }}>Admin</p>
          <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em" }}>Pannello di controllo aziendale</h2>
          <p style={{ fontSize:13, color:MUTED, marginTop:4 }}>KPI finanziari, CRM, calendario, crescita e gestione completa.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:18 }}>
          {[
            ["Ricavi (comm.)", fmt(fin.revenue), true],
            ["EBITDA", fmt(fin.ebitda), false],
            ["EBIT", fmt(fin.ebit), false],
            ["Utile netto", fmt(fin.netProfit), false],
            ["ROS", pct(fin.ros), false],
            ["ROI", pct(fin.roi), false],
            ["Booking conf.", stats.confirmedCount, false],
            ["Volume transato", fmt(stats.volume), false],
          ].map(([label, val, accent]) => (
            <div key={label} style={s.kpi(accent)}>
              <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color: accent?"rgba(255,255,255,.5)":MUTED, marginBottom:4 }}>{label}</p>
              <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.02em", color: accent?"white":INK }}>{val}</p>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={s.tabBtn(tab===t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={s.card}>
            <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, marginBottom:14 }}>Conto economico sintetico</h3>
            {[
              ["Ricavi", fmt(fin.revenue)],
              ["− Costi operativi", fmt(fin.totalOpCosts)],
              ["= EBITDA", fmt(fin.ebitda)],
              ["− Ammortamenti", fmt(fin.depreciation)],
              ["= EBIT", fmt(fin.ebit)],
              ["− Oneri finanziari", fmt(fin.interest)],
              ["− Imposte", fmt(fin.taxes)],
              ["= Utile netto", fmt(fin.netProfit)],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(0,0,0,.05)", fontSize:13 }}>
                <span style={{ color: k.startsWith("=")?INK:MUTED, fontWeight: k.startsWith("=")?700:400 }}>{k}</span>
                <span style={{ fontWeight:700, color: k.includes("Utile")||k.includes("EBITDA")||k.includes("EBIT") ? (fin.ebit>=0?"#16a34a":"#dc2626") : INK }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={s.card}>
              <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, marginBottom:12 }}>Utenti per categoria</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {[["Locali",byRole.organizer.length],["Artisti",byRole.artist.length],["Promoter",byRole.promoter.length],["Referenti",byRole.referent.length],["Admin",byRole.admin.length]].map(([k,v])=>(
                  <div key={k} style={{ background:"#fbfaf8", borderRadius:14, padding:"10px 12px", textAlign:"center" }}>
                    <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:22 }}>{v}</p>
                    <p style={{ fontSize:11, fontWeight:700, color:MUTED, marginTop:2 }}>{k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, marginBottom:12 }}>Modalità eventi</h3>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1, background:ORANGE+"15", border:`1px solid ${ORANGE}30`, borderRadius:16, padding:"12px", textAlign:"center" }}>
                  <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:24, color:ORANGE }}>{eventModes.managed}</p>
                  <p style={{ fontSize:12, fontWeight:700, color:ORANGE, marginTop:4 }}>Managed</p>
                </div>
                <div style={{ flex:1, background:"#fbfaf8", border:"1px solid rgba(0,0,0,.06)", borderRadius:16, padding:"12px", textAlign:"center" }}>
                  <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:24 }}>{eventModes.self}</p>
                  <p style={{ fontSize:12, fontWeight:700, color:MUTED, marginTop:4 }}>Autonomi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "finance"  && <AdminFinance bookings={bookings} finance={finance} />}
      {tab === "crm"      && <AdminCRM users={users} bookings={bookings} contactRequests={contactRequests} />}
      {tab === "calendar" && <AdminCalendar events={events} bookings={bookings} />}
      {tab === "growth"   && <AdminGrowth users={users} bookings={bookings} events={events} />}
      {tab === "audit"    && <AdminAudit users={users} />}
      {tab === "artists"  && <AdminArtistiSection users={users} bookings={bookings} />}
      {tab === "requests" && <AdminRichiesteSection requests={contactRequests} onUpdate={updateRequestStatus} />}

      {/* CONTATTI */}
      {tab === "contacts" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={s.card}>
            <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, marginBottom:14 }}>Aggiungi contatto aziendale</h3>
            <form onSubmit={addContact} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <input placeholder="Nome *" value={contact.name} onChange={e=>setContact(p=>({...p,name:e.target.value}))} style={{ ...s.input, width:"100%" }} />
              <input placeholder="Ruolo (es. commercialista)" value={contact.role} onChange={e=>setContact(p=>({...p,role:e.target.value}))} style={{ ...s.input, width:"100%" }} />
              <input placeholder="Email" value={contact.email} onChange={e=>setContact(p=>({...p,email:e.target.value}))} style={{ ...s.input, width:"100%" }} />
              <input placeholder="Telefono" value={contact.phone} onChange={e=>setContact(p=>({...p,phone:e.target.value}))} style={{ ...s.input, width:"100%" }} />
              <input placeholder="Note" value={contact.notes} onChange={e=>setContact(p=>({...p,notes:e.target.value}))} style={{ ...s.input, width:"100%", gridColumn:"1/-1" }} />
              <button style={{ gridColumn:"1/-1", background:INK, color:"white", border:"none", borderRadius:100, padding:"10px 24px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", alignSelf:"flex-start" }}>Aggiungi</button>
            </form>
          </div>
          <div style={s.card}>
            <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, marginBottom:14 }}>Rubrica aziendale</h3>
            {contacts.length === 0 ? <p style={{ color:"rgba(0,0,0,.3)", fontSize:14 }}>Nessun contatto.</p> :
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {contacts.map(c => (
                  <div key={c.id} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", background:"#fbfaf8", borderRadius:16, padding:"12px 14px", gap:10 }}>
                    <div>
                      <p style={{ fontWeight:700, fontSize:14 }}>{c.name} {c.role&&<span style={{color:MUTED,fontWeight:400}}>· {c.role}</span>}</p>
                      <p style={{ fontSize:12, color:MUTED, marginTop:2 }}>{c.email}{c.phone&&` · ${c.phone}`}</p>
                      {c.notes&&<p style={{ fontSize:12, color:MUTED, marginTop:2, fontStyle:"italic" }}>{c.notes}</p>}
                    </div>
                    <button onClick={()=>deleteContact(c.id)} style={{ background:"transparent", border:"none", color:"#dc2626", fontWeight:700, fontSize:13, cursor:"pointer" }}>Elimina</button>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   AdminArtistiSection — con pricing dinamico
   ════════════════════════════════════════════ */
function AdminArtistiSection({ users, bookings = [] }) {
  const artists = (users||[]).filter(u => u.role === "artist");
  const [selected, setSelected]       = useState(null);
  const [pricing, setPricing]         = useState([]);
  const [basePubPrice, setBasePubPrice] = useState("");
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState("");
  const [artistProfile, setArtistProfile] = useState(null);
  const [activeTab, setActiveTab]     = useState("manual"); // "manual" | "dynamic"

  async function selectArtist(a) {
    setSelected(a); setMsg(""); setBasePubPrice(""); setArtistProfile(null); setActiveTab("manual");
    // Carica prezzi esistenti
    const res = await fetch(`/api/artist-pricing?artistId=${a.id}`);
    const data = await res.json();
    const map = {};
    (Array.isArray(data)?data:[]).forEach(p => { map[p.event_type] = p.public_price; });
    setPricing(EVENT_TYPES.map(t => ({ eventType:t, publicPrice: map[t] || "" })));
    // Carica profilo artista per il pricing dinamico
    try {
      const res2 = await fetch(`/api/artist-profile?userId=${a.id}`);
      const profile = await res2.json();
      setArtistProfile(profile || null);
    } catch {}
  }

  function updatePrice(idx, val) {
    setPricing(prev => prev.map((p,i) => i===idx ? {...p, publicPrice:val} : p));
  }

  function applyDynamic(eventType, suggestedPrice) {
    setPricing(prev => prev.map(p => p.eventType===eventType ? {...p, publicPrice: suggestedPrice} : p));
    setActiveTab("manual");
  }

  async function save(approve) {
    if (!selected) return;
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/artist-pricing", {
        method: "POST", headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          artistId: selected.id,
          pricing: pricing.filter(p => p.publicPrice),
          approve,
          basePubPrice: basePubPrice || pricing.find(p=>p.publicPrice)?.publicPrice || null,
        }),
      });
      setMsg(res.ok ? (approve ? "✓ Artista pubblicato nel marketplace" : "✓ Artista rimosso dal marketplace") : "Errore salvataggio");
    } catch { setMsg("Errore tecnico"); }
    setSaving(false);
  }

  const s = {
    card: { background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" },
    inp: { background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"9px 12px", fontSize:13, fontFamily:"inherit", outline:"none" },
    tabBtn: (a) => ({ padding:"7px 16px", borderRadius:100, fontWeight:700, fontSize:13, cursor:"pointer", border:a?"none":"1px solid rgba(0,0,0,.1)", background:a?INK:"white", color:a?"white":MUTED, fontFamily:"inherit" }),
  };

  const cachet = artistProfile?.baseCachet || artistProfile?.base_cachet;
  const city   = artistProfile?.city;
  const genres = artistProfile?.genres || artistProfile?.musicGenres;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:16 }}>

      {/* ── Lista artisti ── */}
      <div style={s.card}>
        <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, marginBottom:12 }}>Artisti registrati</h3>
        {artists.length === 0
          ? <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun artista ancora.</p>
          : <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {artists.map(a => (
                <button key={a.id} onClick={() => selectArtist(a)}
                  style={{ textAlign:"left", borderRadius:14, padding:"10px 12px", border:"1px solid rgba(0,0,0,.08)", background:selected?.id===a.id?INK:"#fbfaf8", color:selected?.id===a.id?"white":INK, cursor:"pointer", fontFamily:"inherit" }}>
                  <p style={{ fontWeight:700, fontSize:13 }}>{a.name}</p>
                  <p style={{ fontSize:11, color:selected?.id===a.id?"rgba(255,255,255,.5)":MUTED, marginTop:2 }}>{a.email}</p>
                </button>
              ))}
            </div>
        }
      </div>

      {/* ── Pannello destra ── */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {!selected ? (
          <div style={{ ...s.card, display:"flex", alignItems:"center", justifyContent:"center", minHeight:300 }}>
            <p style={{ color:"rgba(0,0,0,.3)", fontSize:14 }}>Seleziona un artista dalla lista.</p>
          </div>
        ) : (
          <>
            {/* Header artista */}
            <div style={s.card}>
              <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:20, marginBottom:4 }}>{selected.name}</h3>
              <p style={{ fontSize:12, color:MUTED, marginBottom:14 }}>
                {city && `📍 ${city}  ·  `}
                {genres && `🎵 ${genres}  ·  `}
                Cachet netto: <strong style={{ color: cachet ? INK : "#dc2626" }}>{cachet ? `€${cachet}` : "non inserito"}</strong>
              </p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setActiveTab("manual")}  style={s.tabBtn(activeTab==="manual")}>✏️ Prezzi manuali</button>
                <button onClick={() => setActiveTab("dynamic")} style={s.tabBtn(activeTab==="dynamic")}>💡 Pricing dinamico</button>
              </div>
            </div>

            {/* ── TAB MANUALE ── */}
            {activeTab === "manual" && (
              <div style={s.card}>
                <h4 style={{ fontWeight:800, fontSize:14, marginBottom:4 }}>Prezzi pubblici per tipo evento</h4>
                <p style={{ fontSize:12, color:MUTED, marginBottom:16 }}>
                  Il cachet netto dell'artista non è mai visibile ai locali.
                  {cachet && <span style={{ color:ORANGE, fontWeight:700 }}> Cachet netto: €{cachet}</span>}
                </p>

                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
                  {pricing.map((p, i) => {
                    const suggestion = cachet ? suggestPrice(cachet, p.eventType, city, genres) : null;
                    return (
                      <div key={p.eventType} style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                        <span style={{ fontSize:13, fontWeight:600, minWidth:150, flexShrink:0 }}>{p.eventType}</span>
                        <span style={{ color:MUTED, fontWeight:700 }}>€</span>
                        <input type="number" min="0" value={p.publicPrice}
                          onChange={e => updatePrice(i, e.target.value)}
                          placeholder="Prezzo pubblico"
                          style={{ ...s.inp, width:130, textAlign:"right" }} />
                        {suggestion && (
                          <button onClick={() => updatePrice(i, suggestion.suggested)}
                            style={{ fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:8, background:"rgba(255,90,0,.1)", border:"1px solid rgba(255,90,0,.25)", color:ORANGE, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                            💡 €{suggestion.suggested} (+{suggestion.markup}%)
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Prezzo base marketplace */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:MUTED, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".1em" }}>
                    Prezzo base per filtro range marketplace (€)
                  </label>
                  <input type="number" min="0" value={basePubPrice}
                    onChange={e => setBasePubPrice(e.target.value)}
                    placeholder="es. 150 → range €100–200"
                    style={{ ...s.inp, width:240 }} />
                  <p style={{ fontSize:11, color:MUTED, marginTop:4 }}>Determina in quale fascia di budget appare l'artista nel marketplace.</p>
                </div>

                {msg && <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", marginBottom:12 }}>{msg}</p>}

                <div style={{ display:"flex", gap:10 }}>
                  <button disabled={saving} onClick={() => save(true)}
                    style={{ background:ORANGE, color:"white", border:"none", borderRadius:100, padding:"11px 24px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    {saving ? "Salvo..." : "Salva e pubblica nel marketplace"}
                  </button>
                  <button disabled={saving} onClick={() => save(false)}
                    style={{ background:"white", border:"1px solid #fca5a5", color:"#dc2626", borderRadius:100, padding:"11px 22px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    Rimuovi dal marketplace
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB PRICING DINAMICO ── */}
            {activeTab === "dynamic" && (
              <div style={s.card}>
                <h4 style={{ fontWeight:800, fontSize:14, marginBottom:4 }}>💡 Prezzi suggeriti dal sistema</h4>
                <p style={{ fontSize:12, color:MUTED, marginBottom:16 }}>
                  Calcolati su: cachet netto, benchmark di mercato per tipo evento, moltiplicatore città, genere musicale e stagionalità mensile.
                </p>

                {!cachet ? (
                  <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:16, padding:"16px 18px" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#c2410c" }}>
                      ⚠️ L'artista non ha ancora inserito il suo cachet netto. Chiedigli di completare il profilo prima di impostare i prezzi.
                    </p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {EVENT_TYPES.map(tipo => {
                      const s2 = suggestPrice(cachet, tipo, city, genres);
                      if (!s2) return null;
                      const bench = s2.bench;
                      const minM = Math.round(bench.min * s2.cityMult);
                      const maxM = Math.round(bench.max * s2.cityMult);
                      const pctBar = Math.max(0, Math.min(100, ((s2.suggested - minM) / (maxM - minM)) * 100));
                      return (
                        <div key={tipo} style={{ background:"#fbfaf8", borderRadius:18, padding:"16px 18px", border:"1px solid rgba(0,0,0,.07)" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:10 }}>
                            <p style={{ fontWeight:700, fontSize:15 }}>{tipo}</p>
                            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                              <div style={{ textAlign:"right" }}>
                                <p style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:22, color:ORANGE, lineHeight:1 }}>€{s2.suggested}</p>
                                <p style={{ fontSize:11, color:"#16a34a", fontWeight:700, marginTop:2 }}>
                                  +{s2.markup}% markup · margine €{s2.margin}
                                </p>
                              </div>
                              <button onClick={() => applyDynamic(tipo, s2.suggested)}
                                style={{ background:ORANGE, color:"white", border:"none", borderRadius:12, padding:"9px 16px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                                Applica →
                              </button>
                            </div>
                          </div>

                          {/* Barra range di mercato */}
                          <div style={{ marginBottom:8 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:MUTED, marginBottom:3 }}>
                              <span>Min mercato: €{minM}</span>
                              <span>Media: €{Math.round(bench.avg * s2.cityMult)}</span>
                              <span>Max: €{maxM}</span>
                            </div>
                            <div style={{ height:6, background:"rgba(0,0,0,.08)", borderRadius:3, position:"relative", overflow:"hidden" }}>
                              <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${pctBar}%`, background:`linear-gradient(90deg,#bbf7d0,${ORANGE})`, borderRadius:3, transition:"width .5s" }} />
                            </div>
                          </div>

                          {/* Fattori applicati */}
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {s2.cityMult !== 1 && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100, background:"rgba(255,90,0,.1)", color:ORANGE }}>🏙️ {city} ×{s2.cityMult}</span>}
                            {s2.genreMult !== 1 && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100, background:"rgba(255,90,0,.1)", color:ORANGE }}>🎵 Genere ×{s2.genreMult}</span>}
                            {s2.seasonMult !== 1 && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100, background:"rgba(59,130,246,.1)", color:"#2563eb" }}>📅 Stagione ×{s2.seasonMult.toFixed(1)}</span>}
                            <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100, background:"rgba(22,163,74,.1)", color:"#16a34a" }}>✓ Margine min 20% garantito</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Legenda */}
                    <div style={{ background:"rgba(0,0,0,.03)", borderRadius:14, padding:"12px 14px", fontSize:12, color:MUTED }}>
                      <strong>Come funziona il pricing dinamico:</strong> il sistema calcola il prezzo ottimale partendo dal cachet netto, aggiunge un markup target del 45%, poi aggiusta in base a benchmark di mercato (dati medi per tipo evento in Italia), moltiplicatore città (Milano +30%, Roma +20%...), moltiplicatore genere musicale (techno +20%, orchestra +40%...) e stagionalità mensile (luglio e dicembre +30%). Il risultato è arrotondato al multiplo di €10 più vicino.
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════
   AdminRichiesteSection
   ════════════════════════════════ */
function AdminRichiesteSection({ requests, onUpdate }) {
  const STATUS_COLORS = { pending:"#d97706", reviewed:"#2563eb", connected:"#16a34a", rejected:"#dc2626" };
  const STATUS_LABELS = { pending:"In attesa", reviewed:"In revisione", connected:"Connessi", rejected:"Rifiutata" };

  return (
    <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" }}>
      <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.03em", marginBottom:16 }}>Richieste di contatto</h3>
      {requests.length === 0 ? <p style={{ color:"rgba(0,0,0,.3)", fontSize:14 }}>Nessuna richiesta.</p> : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {requests.map(r => (
            <div key={r.id} style={{ border:"1px solid rgba(0,0,0,.07)", borderRadius:18, padding:"14px 16px", background:"#fbfaf8" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:8 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:14 }}>{r.organizer_name} <span style={{ color:MUTED, fontWeight:400 }}>cerca</span> {r.artist_name}</p>
                  <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" }}>
                    {r.event_date && <span style={{ fontSize:12, color:MUTED }}>📅 {r.event_date}</span>}
                    {r.event_type && <span style={{ fontSize:12, color:MUTED }}>🎪 {r.event_type}</span>}
                    {r.budget    && <span style={{ fontSize:12, fontWeight:700, color:ORANGE }}>💶 Budget: €{r.budget}</span>}
                  </div>
                  {r.notes && <p style={{ fontSize:12, color:MUTED, marginTop:6, fontStyle:"italic" }}>"{r.notes}"</p>}
                </div>
                <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:100, background:(STATUS_COLORS[r.status]||"#6b7280")+"18", color:STATUS_COLORS[r.status]||"#6b7280", flexShrink:0 }}>
                  {STATUS_LABELS[r.status] || r.status}
                </span>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {r.status === "pending" && (
                  <button onClick={() => onUpdate(r.id,"reviewed")} style={{ fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, border:"none", background:INK, color:"white", cursor:"pointer", fontFamily:"inherit" }}>
                    Prendi in carico
                  </button>
                )}
                {["pending","reviewed"].includes(r.status) && <>
                  <button onClick={() => onUpdate(r.id,"connected")} style={{ fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, border:"none", background:"#16a34a", color:"white", cursor:"pointer", fontFamily:"inherit" }}>Connetti</button>
                  <button onClick={() => onUpdate(r.id,"rejected")}  style={{ fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, border:"1px solid #fca5a5", background:"transparent", color:"#dc2626", cursor:"pointer", fontFamily:"inherit" }}>Rifiuta</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}