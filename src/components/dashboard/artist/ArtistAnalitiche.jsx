"use client";
import { useState, useEffect, useRef } from "react";
import { SCard, STitle, ProBadge, ProLock, KpiCard, O, INK, BORDER, MUTED, MUTED2, inp, DURATIONS } from "./shared";

export default function ArtistAnalitiche({ bookings=[], plan }) {
  const safe = Array.isArray(bookings)?bookings:[];
  const confirmed = safe.filter(b=>["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()));
  const pending   = safe.filter(b=>["pending"].includes((b.status||"").toLowerCase()));
  const revenue   = confirmed.reduce((s,b)=>s+(Number(b.cachet)||Number(b.artistCachet)||0),0);
  const fmt = n => new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);

  // Distribuzione per tipo evento
  const byType = {};
  confirmed.forEach(b=>{ const t=b.eventType||b.event_type||"Altro"; byType[t]=(byType[t]||0)+1; });
  const topTypes = Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0,4);

  // Mesi ultimi 6 (placeholder dati)
  const months = ["Gen","Feb","Mar","Apr","Mag","Giu"];
  const barData = months.map(()=>Math.floor(Math.random()*5));
  const maxBar  = Math.max(...barData,1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10 }}>
        <KpiCard label="Booking totali"   value={safe.length} />
        <KpiCard label="Confermati"        value={confirmed.length} orange />
        <KpiCard label="In attesa"         value={pending.length} />
        <KpiCard label="Cachet maturato"  value={fmt(revenue)} accent />
      </div>

      {/* Grafico booking per mese — placeholder */}
      <SCard>
        <STitle sub="Ultimi 6 mesi — dati di esempio">Andamento booking</STitle>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:100, paddingBottom:20, position:"relative" }}>
          {barData.map((v,i)=>(
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:10, color:MUTED, fontWeight:700 }}>{v}</span>
              <div style={{
                width:"100%", borderRadius:"6px 6px 0 0",
                background: i===barData.length-1?O:"rgba(255,90,0,.15)",
                height:`${(v/maxBar)*70}px`, minHeight:4,
                transition:"height .3s",
              }} />
              <span style={{ fontSize:10, color:MUTED, position:"absolute", bottom:0 }}>{months[i]}</span>
            </div>
          ))}
        </div>
      </SCard>

      {/* Distribuzione tipi */}
      {topTypes.length>0 && (
        <SCard>
          <STitle sub="Dove suoni di più">Per tipo di evento</STitle>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {topTypes.map(([type,count])=>(
              <div key={type} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:12, fontWeight:700, color:INK, minWidth:130 }}>{type}</span>
                <div style={{ flex:1, background:"rgba(0,0,0,.06)", borderRadius:4, height:8, overflow:"hidden" }}>
                  <div style={{ width:`${(count/confirmed.length)*100}%`, height:"100%", background:O, borderRadius:4 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:MUTED, minWidth:24, textAlign:"right" }}>{count}</span>
              </div>
            ))}
          </div>
        </SCard>
      )}

      {/* Analitiche PRO */}
      {plan!=="pro" && (
        <SCard style={{ opacity:.65 }}>
          <STitle>Analitiche avanzate <ProBadge /></STitle>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
            {["Visite profilo","Chi ha guardato","Da dove"].map(l=>(
              <div key={l} style={{ background:"#fbfaf8", borderRadius:12, padding:"12px 14px" }}>
                <p style={{ fontSize:11, color:MUTED, margin:"0 0 4px", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>{l}</p>
                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:INK, margin:0 }}>—</p>
              </div>
            ))}
          </div>
          <ProLock feature="Le analitiche avanzate del profilo" plan={plan} />
        </SCard>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB: GUADAGNI
───────────────────────────────────────────────────────────────── */