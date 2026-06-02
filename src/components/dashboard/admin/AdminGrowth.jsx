"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";
import * as XLSX from "xlsx";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";
const COLORS = [ORANGE, "#3b82f6", "#16a34a", "#d97706", "#8b5cf6", "#ec4899"];

function fmt(n) { return new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n||0); }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"white", border:"1px solid #e5e5e7", borderRadius:12, padding:"10px 14px", fontSize:13 }}>
      <p style={{ fontWeight:700, marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {typeof p.value === "number" && p.value > 100 ? fmt(p.value) : p.value}</p>)}
    </div>
  );
}

export default function AdminGrowth({ users = [], bookings = [], events = [] }) {
  const isConf = b => ["confirmed","accepted","paid"].includes(String(b?.status||"").toLowerCase());

  // Crescita utenti per mese
  const userGrowth = useMemo(() => {
    const map = {};
    users.forEach(u => {
      const k = String(u.createdAt || u.created_at || "").slice(0,7);
      if (!k) return;
      map[k] = (map[k] || 0) + 1;
    });
    let cum = 0;
    return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0])).map(([m, n]) => {
      cum += n;
      return { mese: m.slice(5)+"/"+m.slice(2,4), nuovi: n, totale: cum };
    });
  }, [users]);

  // Ricavi mensili
  const revenueGrowth = useMemo(() => {
    const map = {};
    bookings.filter(isConf).forEach(b => {
      const k = String(b.eventDate || b.event_date || b.createdAt || "").slice(0,7);
      if (!k) return;
      map[k] = (map[k] || 0) + Number(b.cachet || 0) * 0.08;
    });
    return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0])).map(([m, v]) => ({ mese: m.slice(5)+"/"+m.slice(2,4), ricavi: Math.round(v) }));
  }, [bookings]);

  // Top artisti
  const topArtists = useMemo(() => {
    const map = {};
    bookings.filter(isConf).forEach(b => {
      const k = b.artistName || "—";
      if (!map[k]) map[k] = { nome: k, booking: 0, volume: 0, requests: 0 };
      map[k].booking += 1;
      map[k].volume += Number(b.cachet || 0);
    });
    return Object.values(map).sort((a,b) => b.volume - a.volume).slice(0,8);
  }, [bookings]);

  // Top locali
  const topVenues = useMemo(() => {
    const map = {};
    bookings.filter(isConf).forEach(b => {
      const k = b.organizerName || "—";
      if (!map[k]) map[k] = { nome: k, booking: 0, volume: 0 };
      map[k].booking += 1;
      map[k].volume += Number(b.cachet || 0);
    });
    return Object.values(map).sort((a,b) => b.volume - a.volume).slice(0,8);
  }, [bookings]);

  // Stagionalità booking per mese dell'anno (aggregato)
  const seasonality = useMemo(() => {
    const map = Array.from({ length: 12 }, (_, i) => ({ mese: ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"][i], booking: 0, volume: 0 }));
    bookings.filter(isConf).forEach(b => {
      const d = new Date(b.eventDate || b.event_date || "");
      if (isNaN(d)) return;
      map[d.getMonth()].booking += 1;
      map[d.getMonth()].volume += Number(b.cachet || 0);
    });
    return map;
  }, [bookings]);

  // Distribuzione ruoli utenti
  const roleDistrib = useMemo(() => {
    const map = {};
    users.forEach(u => { map[u.role || "other"] = (map[u.role || "other"] || 0) + 1; });
    return Object.entries(map).map(([role, count]) => ({ role, count }));
  }, [users]);

  // Conversion rate: richieste contatto → booking confermati
  const convRate = useMemo(() => {
    const total = bookings.length;
    const conf = bookings.filter(isConf).length;
    return total ? ((conf / total) * 100).toFixed(1) : "0.0";
  }, [bookings]);

  // Valore medio booking
  const avgBooking = useMemo(() => {
    const conf = bookings.filter(isConf);
    return conf.length ? conf.reduce((s,b) => s + Number(b.cachet||0), 0) / conf.length : 0;
  }, [bookings]);

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Mese","Nuovi utenti","Totale cumulativo"],...userGrowth.map(r=>[r.mese,r.nuovi,r.totale])]), "Crescita Utenti");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Mese","Ricavi"],...revenueGrowth.map(r=>[r.mese,r.ricavi])]), "Ricavi Mensili");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Artista","Booking","Volume"],...topArtists.map(a=>[a.nome,a.booking,a.volume])]), "Top Artisti");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Locale","Booking","Volume"],...topVenues.map(v=>[v.nome,v.booking,v.volume])]), "Top Locali");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Mese","Booking","Volume"],...seasonality.map(s=>[s.mese,s.booking,s.volume])]), "Stagionalità");
    XLSX.writeFile(wb, `TuttoEvento_Growth_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const s = {
    card: { background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" },
    h2: { fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.03em", marginBottom:14 },
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700&display=swap');`}</style>

      {/* KPI crescita */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14 }}>
        {[
          ["Utenti totali", users.length, ""],
          ["Artisti", users.filter(u=>u.role==="artist").length, ""],
          ["Locali", users.filter(u=>u.role==="organizer").length, ""],
          ["Booking totali", bookings.length, ""],
          ["Confermati", bookings.filter(isConf).length, ""],
          ["Conversion rate", `${convRate}%`, "booking confermati"],
          ["Cachet medio", fmt(avgBooking), "per booking confermato"],
        ].map(([label, val, sub]) => (
          <div key={label} style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:20, padding:"16px 18px" }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:MUTED, marginBottom:6 }}>{label}</p>
            <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.03em" }}>{val}</p>
            {sub && <p style={{ fontSize:11, color:MUTED, marginTop:3 }}>{sub}</p>}
          </div>
        ))}
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={exportExcel} style={{ background:"white", border:"1px solid rgba(0,0,0,.12)", borderRadius:100, padding:"8px 18px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>📊 Esporta Excel</button>
      </div>

      {/* Crescita utenti */}
      <div style={s.card}>
        <h2 style={s.h2}>Crescita utenti</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={userGrowth}>
            <defs><linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={ORANGE} stopOpacity={0.3}/><stop offset="95%" stopColor={ORANGE} stopOpacity={0.02}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
            <XAxis dataKey="mese" tick={{ fontSize:12 }} />
            <YAxis tick={{ fontSize:12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="totale" name="Totale cumulativo" stroke={ORANGE} fill="url(#ugGrad)" strokeWidth={2.5} />
            <Bar dataKey="nuovi" name="Nuovi/mese" fill={INK} radius={[4,4,0,0]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Ricavi mensili */}
      <div style={s.card}>
        <h2 style={s.h2}>Ricavi mensili (commissioni)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
            <XAxis dataKey="mese" tick={{ fontSize:12 }} />
            <YAxis tick={{ fontSize:12 }} tickFormatter={v=>`€${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="ricavi" name="Ricavi" radius={[8,8,0,0]}>
              {revenueGrowth.map((_, i) => <Cell key={i} fill={i === revenueGrowth.length-1 ? ORANGE : "#ffe0cc"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stagionalità */}
      <div style={s.card}>
        <h2 style={s.h2}>Stagionalità booking (per mese dell'anno)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={seasonality}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
            <XAxis dataKey="mese" tick={{ fontSize:12 }} />
            <YAxis tick={{ fontSize:12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="booking" name="Booking" fill={ORANGE} radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top artisti e locali */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={s.card}>
          <h2 style={s.h2}>Top artisti per volume</h2>
          {topArtists.length === 0 ? <p style={{ color:"rgba(0,0,0,.3)", fontSize:14 }}>Nessun dato.</p> :
            topArtists.map((a, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, color:"rgba(0,0,0,.15)", width:28, flexShrink:0 }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.nome}</p>
                  <p style={{ fontSize:11, color:MUTED }}>{a.booking} booking</p>
                </div>
                <span style={{ fontWeight:800, color:ORANGE, fontSize:14, flexShrink:0 }}>{fmt(a.volume)}</span>
              </div>
            ))
          }
        </div>
        <div style={s.card}>
          <h2 style={s.h2}>Top locali per volume</h2>
          {topVenues.length === 0 ? <p style={{ color:"rgba(0,0,0,.3)", fontSize:14 }}>Nessun dato.</p> :
            topVenues.map((v, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, color:"rgba(0,0,0,.15)", width:28, flexShrink:0 }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.nome}</p>
                  <p style={{ fontSize:11, color:MUTED }}>{v.booking} booking</p>
                </div>
                <span style={{ fontWeight:800, color:ORANGE, fontSize:14, flexShrink:0 }}>{fmt(v.volume)}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Distribuzione ruoli */}
      <div style={s.card}>
        <h2 style={s.h2}>Distribuzione utenti per ruolo</h2>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {roleDistrib.map((r, i) => (
            <div key={r.role} style={{ background:COLORS[i%COLORS.length]+"18", border:`1px solid ${COLORS[i%COLORS.length]}30`, borderRadius:16, padding:"12px 20px", textAlign:"center" }}>
              <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:28, color:COLORS[i%COLORS.length] }}>{r.count}</p>
              <p style={{ fontSize:12, fontWeight:700, color:COLORS[i%COLORS.length], marginTop:4, textTransform:"capitalize" }}>{r.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}