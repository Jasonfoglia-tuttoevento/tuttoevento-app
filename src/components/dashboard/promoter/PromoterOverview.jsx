"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, INK, Inp, KpiCard, MUTED, O, ProBadge, ProLock, SCard, STitle, StatusBadge, fmt } from "./shared";
export default function PromoterOverview({ currentUser, bookings, portfolio, contactRequests, plan, commissions }) {
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
            <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:O, margin:"0 0 4px", fontFamily:"'Manrope',system-ui,sans-serif" }}>Area Promoter</p>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:22, letterSpacing:"-.03em", margin:"0 0 4px" }}>
              Ciao{currentUser?.name ? ` ${currentUser.name}` : ""}
            </h2>
            <p style={{ fontSize:13, color:MUTED, margin:0, fontFamily:"'Manrope',system-ui,sans-serif" }}>
              Gestisci il tuo roster, monitora le trattative e guadagna commissioni sui booking.
            </p>
          </div>
          <a href="/pricing" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10,
            background: plan==="pro" ? `${O}10` : "white",
            border: `1px solid ${plan==="pro" ? `${O}25` : "rgba(0,0,0,.1)"}`,
            borderRadius:100, padding:"9px 18px", transition:"all .2s",
            boxShadow:"0 1px 4px rgba(0,0,0,.06)"
          }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background: plan==="pro" ? O : "#6b6b73", display:"inline-block", flexShrink:0 }} />
            <span style={{ fontSize:13, fontWeight:700, color: plan==="pro" ? O : INK, fontFamily:"'Manrope',system-ui,sans-serif" }}>
              Piano {plan==="pro" ? "Pro" : "Free"}
            </span>
            {plan==="free" && (
              <span style={{ fontSize:12, fontWeight:700, color:O, display:"flex", alignItems:"center", gap:3 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                Upgrade
              </span>
            )}
            {plan==="pro" && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </a>
        </div>
      </Card>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
        <KpiCard label="Artisti in roster" value={portfolioArtists.length} hint="nel tuo portfolio" />
        <KpiCard label="Locali in roster"  value={portfolioVenues.length}  hint="partner attivi" />
        <KpiCard label="Richieste attive"  value={myRequests.filter(r=>r.status==="pending"||r.status==="reviewed").length} hint="in corso" />
        <KpiCard label="Booking chiusi"    value={confirmed} hint="confermati" />
        <KpiCard label="Volume gestito"    value={fmt(totalVolume)} hint="sui tuoi artisti" accent />
        <KpiCard label="Commissioni maturate" value={fmt(totalShare)} hint="~50% del margine TE" orange />
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