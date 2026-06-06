"use client";

import { useState } from "react";

const ORANGE = "#ff5a00";
const INK    = "#0a0a0b";
const MUTED  = "#6b6b73";
const PROMOTER_SHARE = 0.50;

function fmt(n) {
  return new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n||0);
}

function calcCommission(b) {
  const pub    = Number(b.publicPrice) || 0;
  const cachet = Number(b.artistCachet) || Number(b.cachet) || 0;
  if (pub > cachet && cachet > 0) return (pub - cachet) * PROMOTER_SHARE;
  if (pub > 0) return pub * 0.225; // stima: 45% margine × 50%
  return 0;
}

export default function PromoterCommissions({ bookings = [], onRefresh }) {
  const [loading, setLoading] = useState({});
  const [msg, setMsg]         = useState("");

  const myBookings = bookings.filter(b =>
    ["accepted","confirmed","completed"].includes(b.status)
  );

  const toConfirm = myBookings.filter(b =>
    ["paid_by_venue","paid_to_artist"].includes(b.paymentStatus)
  );

  const completed = myBookings.filter(b => b.paymentStatus === "completed");

  const totalEarned  = completed.reduce((s, b) => s + calcCommission(b), 0);
  const totalPending = toConfirm.reduce((s, b) => s + calcCommission(b), 0);

  async function confirmPayment(bookingId) {
    setLoading(p => ({ ...p, [bookingId]: true }));
    setMsg("");
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, paymentAction: "promoter_confirm" }),
    });
    const d = await res.json();
    if (!res.ok) setMsg(d.error || "Errore");
    else { setMsg("✓ Commissione confermata"); onRefresh?.(); }
    setLoading(p => ({ ...p, [bookingId]: false }));
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
        {[
          ["Commissioni ricevute", fmt(totalEarned),  "#0a0a0b", true ],
          ["In arrivo",            fmt(totalPending),  ORANGE,   false],
          ["Booking gestiti",      myBookings.length,  "#0a0a0b", false],
        ].map(([label, val, color, accent]) => (
          <div key={label} style={{ background:accent?INK:"white", border:`1px solid ${accent?"transparent":"rgba(0,0,0,.06)"}`, borderRadius:18, padding:"16px 18px" }}>
            <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:accent?"rgba(255,255,255,.45)":MUTED, margin:"0 0 6px" }}>{label}</p>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:accent?"white":color, margin:0, letterSpacing:"-.02em" }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Info modello commissioni */}
      <div style={{ background:"rgba(255,90,0,.04)", border:"1px solid rgba(255,90,0,.15)", borderRadius:16, padding:"12px 16px", fontSize:12, color:MUTED, lineHeight:1.6 }}>
        <strong style={{ color:INK }}>Come funziona:</strong> ricevi il 50% del margine TuttoEvento su ogni booking (prezzo pubblico − cachet artista). Il tuo cachet è sempre protetto — la commissione viene dalla quota TE, non dall'artista.
      </div>

      {msg && <p style={{ fontSize:12, fontWeight:700, color:msg.startsWith("✓")?"#16a34a":"#dc2626", margin:0 }}>{msg}</p>}

      {/* Da confermare */}
      {toConfirm.length > 0 && (
        <div style={{ background:"rgba(37,99,235,.04)", border:"1px solid rgba(37,99,235,.15)", borderRadius:20, padding:"16px 20px" }}>
          <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:"#1d4ed8", margin:"0 0 12px" }}>
            Conferma ricezione commissione ({toConfirm.length})
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {toConfirm.map(b => {
              const comm = calcCommission(b);
              return (
                <div key={b.id} style={{ background:"white", borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14, margin:0 }}>{b.artistName} — {b.eventTitle || b.organizerName || "Evento"}</p>
                    <p style={{ fontSize:12, color:MUTED, margin:"3px 0 0" }}>
                      {b.eventDate && `📅 ${b.eventDate} · `}
                      La tua commissione: <strong style={{ color:ORANGE }}>~{fmt(comm)}</strong>
                    </p>
                  </div>
                  <button onClick={() => confirmPayment(b.id)} disabled={loading[b.id]}
                    style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"9px 20px", fontWeight:800, fontSize:13, cursor:loading[b.id]?"not-allowed":"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:loading[b.id]?.5:1, whiteSpace:"nowrap" }}>
                    {loading[b.id] ? "..." : "✓ Ho ricevuto la commissione"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Storico */}
      <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:20, padding:"18px 20px" }}>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:INK, margin:"0 0 14px" }}>Storico commissioni</h3>
        {myBookings.length === 0 ? (
          <p style={{ fontSize:13, color:"rgba(0,0,0,.3)" }}>Nessun booking ancora.</p>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid rgba(0,0,0,.07)" }}>
                  {["Artista","Evento","Data","Prezzo pub.","Tua quota (~50%)","Stato"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:700, color:MUTED, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myBookings.map(b => {
                  const comm = calcCommission(b);
                  const isPaid = b.paymentStatus === "completed";
                  return (
                    <tr key={b.id} style={{ borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                      <td style={{ padding:"10px 12px", fontWeight:600 }}>{b.artistName||"—"}</td>
                      <td style={{ padding:"10px 12px", color:MUTED }}>{b.eventTitle||"—"}</td>
                      <td style={{ padding:"10px 12px", color:MUTED, whiteSpace:"nowrap" }}>{b.eventDate||"—"}</td>
                      <td style={{ padding:"10px 12px", fontWeight:700 }}>{b.publicPrice?fmt(b.publicPrice):"—"}</td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:isPaid?"#16a34a":ORANGE }}>
                        ~{fmt(comm)}
                        {isPaid && " ✓"}
                      </td>
                      <td style={{ padding:"10px 12px" }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:100,
                          background: isPaid?"rgba(22,163,74,.1)":"rgba(217,119,6,.1)",
                          color: isPaid?"#16a34a":"#d97706" }}>
                          {isPaid ? "Ricevuta" : "In attesa"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop:"2px solid rgba(0,0,0,.08)", background:"#fbfaf8" }}>
                  <td colSpan={4} style={{ padding:"12px", fontWeight:800 }}>TOTALE RICEVUTO</td>
                  <td style={{ padding:"12px", fontWeight:800, color:ORANGE, fontSize:15 }}>{fmt(totalEarned)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}