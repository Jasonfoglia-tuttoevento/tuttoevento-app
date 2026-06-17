"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, INK, Inp, KpiCard, MUTED, O, ProBadge, ProLock, SCard, STitle, StatusBadge } from "./shared";
export default function PromoterTrattative({ contactRequests, portfolio, plan, onUpdateStatus }) {
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
                  {r.budget     && <span style={{ fontSize:12, fontWeight:700, color:O }}>💶 €{r.budget}</span>}
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