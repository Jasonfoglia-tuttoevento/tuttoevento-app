"use client";

import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

function fmt(n) { return new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0); }

function CustomTooltip({ active, payload, label }) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"white", border:"1px solid #e5e5e7", borderRadius:12, padding:"10px 14px", fontSize:13 }}>
      <p style={{ fontWeight:700, marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
}

function KpiCard({ label, value, sub, color = INK, trend }) {
  return (
    <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:20, padding:"16px 18px" }}>
      <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:MUTED, marginBottom:6 }}>{label}</p>
      <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-.03em", color }}>{value}</p>
      {sub && <p style={{ fontSize:11, color:MUTED, marginTop:3 }}>{sub}</p>}
      {trend !== undefined && (
        <p style={{ fontSize:11, fontWeight:700, color:trend>=0?"#16a34a":"#dc2626", marginTop:3 }}>
          {trend>=0?"▲":"▼"} {Math.abs(trend).toFixed(1)}% vs mese prec.
        </p>
      )}
    </div>
  );
}

export default function ArtistAnalytics({ currentUser, bookings = [] }) {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`/api/artist-profile-views?artistId=${currentUser.id}`)
      .then(r => r.json())
      .then(d => { setViews(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentUser?.id]);

  const isConf = b => ["confirmed","accepted","paid"].includes(String(b?.status||"").toLowerCase());

  const confirmedBookings = useMemo(() => bookings.filter(isConf), [bookings]);
  const pendingBookings = useMemo(() => bookings.filter(b => b.status === "pending"), [bookings]);
  const totalCachet = useMemo(() => confirmedBookings.reduce((s,b) => s + Number(b.cachet||0), 0), [confirmedBookings]);
  const avgCachet = confirmedBookings.length ? totalCachet / confirmedBookings.length : 0;
  const convRate = bookings.length ? (confirmedBookings.length / bookings.length * 100).toFixed(1) : "0.0";

  // Visualizzazioni per mese
  const viewsByMonth = useMemo(() => {
    const map = {};
    views.forEach(v => {
      const k = String(v.created_at||"").slice(0,7);
      if (!k) return;
      map[k] = (map[k]||0) + 1;
    });
    return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([m,n]) => ({ mese: m.slice(5)+"/"+m.slice(2,4), visite:n }));
  }, [views]);

  // Booking per mese
  const bookingsByMonth = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const k = String(b.eventDate||b.createdAt||"").slice(0,7);
      if (!k) return;
      if (!map[k]) map[k] = { confermati:0, totali:0 };
      map[k].totali++;
      if (isConf(b)) map[k].confermati++;
    });
    return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([m,v]) => ({ mese:m.slice(5)+"/"+m.slice(2,4), ...v }));
  }, [bookings]);

  // Distribuzione per tipo evento
  const byEventType = useMemo(() => {
    const map = {};
    confirmedBookings.forEach(b => {
      const k = b.eventType || b.event_type || "Non specificato";
      map[k] = (map[k]||0) + 1;
    });
    return Object.entries(map).map(([tipo,n]) => ({ tipo, n })).sort((a,b)=>b.n-a.n).slice(0,5);
  }, [confirmedBookings]);

  // Provenienza visualizzazioni per città
  const byCity = useMemo(() => {
    const map = {};
    views.forEach(v => { if(v.viewer_city) map[v.viewer_city] = (map[v.viewer_city]||0)+1; });
    return Object.entries(map).map(([city,n]) => ({ city, n })).sort((a,b)=>b.n-a.n).slice(0,5);
  }, [views]);

  // Cachet mensile
  const cachetByMonth = useMemo(() => {
    const map = {};
    confirmedBookings.forEach(b => {
      const k = String(b.eventDate||"").slice(0,7);
      if (!k) return;
      map[k] = (map[k]||0) + Number(b.cachet||0);
    });
    return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0]))
      .slice(-6).map(([m,v]) => ({ mese:m.slice(5)+"/"+m.slice(2,4), cachet:v }));
  }, [confirmedBookings]);

  const s = {
    card: { background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" },
    h3: { fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, marginBottom:14, letterSpacing:"-.02em" },
  };

  if (loading) return <div style={{ textAlign:"center", padding:40, color:MUTED }}>Caricamento analitiche...</div>;

  return (
    <div style={{ fontFamily:"'Manrope',system-ui,sans-serif", display:"flex", flexDirection:"column", gap:16 }} id="artist-analytics">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700&display=swap');`}</style>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
        <KpiCard label="Visite profilo" value={views.length} sub="totali nel marketplace" color={ORANGE} />
        <KpiCard label="Booking totali" value={bookings.length} sub={`${pendingBookings.length} in attesa`} />
        <KpiCard label="Confermati" value={confirmedBookings.length} sub="booking confermati" color="#16a34a" />
        <KpiCard label="Conversion rate" value={`${convRate}%`} sub="richieste → confermate" />
        <KpiCard label="Cachet totale" value={fmt(totalCachet)} sub="da booking confermati" color={ORANGE} />
        <KpiCard label="Cachet medio" value={fmt(avgCachet)} sub="per booking confermato" />
      </div>

      {/* Visite profilo */}
      <div style={s.card}>
        <h3 style={s.h3}>Visite al profilo nel marketplace</h3>
        {viewsByMonth.length === 0 ? (
          <p style={{ color:"rgba(0,0,0,.3)", fontSize:13 }}>Nessuna visita registrata ancora. Le visite aumenteranno man mano che il marketplace cresce.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={viewsByMonth}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={ORANGE} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" />
              <XAxis dataKey="mese" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="visite" name="Visite" stroke={ORANGE} fill="url(#viewsGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        )}
        {byCity.length > 0 && (
          <div style={{ marginTop:14 }}>
            <p style={{ fontSize:12, fontWeight:700, color:MUTED, marginBottom:8 }}>Top città che visitano il tuo profilo</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {byCity.map((c,i) => (
                <div key={c.city} style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.07)", borderRadius:100, padding:"4px 12px", fontSize:12, fontWeight:700 }}>
                  {c.city} <span style={{ color:ORANGE }}>{c.n}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking per mese */}
      <div style={s.card}>
        <h3 style={s.h3}>Booking per mese</h3>
        {bookingsByMonth.length === 0 ? (
          <p style={{ color:"rgba(0,0,0,.3)", fontSize:13 }}>Nessun booking ancora.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bookingsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" />
              <XAxis dataKey="mese" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totali" name="Totali" fill="rgba(0,0,0,.08)" radius={[6,6,0,0]} />
              <Bar dataKey="confermati" name="Confermati" fill="#16a34a" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Cachet mensile + tipo evento */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={s.card}>
          <h3 style={s.h3}>Cachet mensile</h3>
          {cachetByMonth.length === 0 ? <p style={{ color:"rgba(0,0,0,.3)", fontSize:13 }}>Nessun dato.</p> : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={cachetByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" />
                <XAxis dataKey="mese" tick={{ fontSize:11 }} />
                <YAxis tick={{ fontSize:11 }} tickFormatter={v=>`€${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cachet" name="Cachet" radius={[6,6,0,0]}>
                  {cachetByMonth.map((_,i) => <Cell key={i} fill={i===cachetByMonth.length-1?ORANGE:"#ffe0cc"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={s.card}>
          <h3 style={s.h3}>Tipo evento più frequente</h3>
          {byEventType.length === 0 ? <p style={{ color:"rgba(0,0,0,.3)", fontSize:13 }}>Nessun dato.</p> : (
            byEventType.map((e,i) => (
              <div key={e.tipo} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:12, fontWeight:700 }}>{e.tipo}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:ORANGE }}>{e.n}</span>
                </div>
                <div style={{ height:6, background:"rgba(0,0,0,.06)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(e.n/byEventType[0].n)*100}%`, background:i===0?ORANGE:"#ffe0cc", borderRadius:3 }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Consigli */}
      <div style={{ ...s.card, background:"#0a0a0b", color:"white" }}>
        <h3 style={{ ...s.h3, color:"white" }}>💡 Consigli per migliorare le performance</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
          {[
            ["📸","Aggiungi foto di qualità","I profili con almeno 3 foto ricevono il 60% in più di visite."],
            ["🎵","Inserisci link Spotify","I locali ascoltano prima di contattare. È il tuo biglietto da visita."],
            ["📍","Specifica la città","I filtri per città sono i più usati. Assicurati di averla inserita."],
            ["📅","Aggiorna la disponibilità","I profili con disponibilità aggiornata convertono 3x di più."],
          ].map(([icon,title,desc]) => (
            <div key={title} style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:"14px" }}>
              <p style={{ fontSize:"1.3rem", marginBottom:6 }}>{icon}</p>
              <p style={{ fontWeight:700, fontSize:13, color:"white", marginBottom:4 }}>{title}</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,.45)", lineHeight:1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}