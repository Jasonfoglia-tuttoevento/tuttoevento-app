"use client";

import { useMemo, useState } from "react";

const ORANGE = "#ff5a00";
const INK    = "#0a0a0b";
const MUTED  = "#6b6b73";
const PER_PAGE = 5;

/* ─── Helpers ────────────────────────────────────────────── */
function paymentLabel(ps) {
  const map = {
    pending:          { label:"In attesa",          color:"#d97706", bg:"rgba(217,119,6,.1)"   },
    paid_by_venue:    { label:"Pagamento inviato",   color:"#2563eb", bg:"rgba(37,99,235,.1)"   },
    paid_to_artist:   { label:"Artista confermato",  color:"#7c3aed", bg:"rgba(124,58,237,.1)"  },
    paid_to_promoter: { label:"Promoter confermato", color:"#7c3aed", bg:"rgba(124,58,237,.1)"  },
    completed:        { label:"Completato",           color:"#16a34a", bg:"rgba(22,163,74,.1)"  },
  };
  return map[ps] || { label: ps||"—", color:MUTED, bg:"rgba(0,0,0,.06)" };
}

function statusLabel(s) {
  const map = {
    pending:   { label:"In attesa",  color:"#d97706", bg:"rgba(217,119,6,.1)"  },
    accepted:  { label:"Accettato",  color:"#16a34a", bg:"rgba(22,163,74,.1)"  },
    confirmed: { label:"Confermato", color:"#16a34a", bg:"rgba(22,163,74,.1)"  },
    rejected:  { label:"Rifiutato",  color:"#dc2626", bg:"rgba(220,38,38,.1)"  },
    completed:  { label:"Completato",  color:"#16a34a", bg:"rgba(22,163,74,.1)"  },
    cancelled:  { label:"Cancellato",  color:"#6b6b73", bg:"rgba(0,0,0,.07)"       },
  };
  return map[s] || { label:s||"—", color:MUTED, bg:"rgba(0,0,0,.06)" };
}

function Badge({ label, color, bg }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, background:bg, color, whiteSpace:"nowrap", flexShrink:0 }}>
      {label}
    </span>
  );
}

/* ─── Componente ─────────────────────────────────────────── */
export default function OrganizerBookings({ bookings = [], onRefresh }) {
  const [filter, setFilter]   = useState("all");
  const [page, setPage]       = useState(1);
  const [loading, setLoading]       = useState({});
  const [msg, setMsg]               = useState("");
  const [cancelModal, setCancelModal] = useState(null); // bookingId
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling]   = useState(false);

  function openChat(booking) {
    const uid = booking.artistId || booking.artistUserId || booking.artist_user_id;
    if (!uid) { alert("ID artista mancante"); return; }
    window.dispatchEvent(new CustomEvent("tuttoevento:open-chat", {
      detail: { participantUserId:Number(uid), bookingId:booking.id, title:`Booking · ${booking.artistName}` },
    }));
  }

  async function doPaymentAction(bookingId, action) {
    setLoading(p => ({ ...p, [bookingId]:true }));
    setMsg("");
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ id:bookingId, paymentAction:action }),
    });
    const d = await res.json();
    if (!res.ok) setMsg(d.error || "Errore");
    else { setMsg("✓ Aggiornato"); onRefresh?.(); }
    setLoading(p => ({ ...p, [bookingId]:false }));
  }

  async function doCancel(bookingId) {
    if (!cancelReason || cancelReason.trim().length < 10) {
      setMsg("Inserisci una motivazione di almeno 10 caratteri"); return;
    }
    setCancelling(true);
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ id: bookingId, cancelAction: true, cancelReason }),
    });
    const d = await res.json();
    if (!res.ok) setMsg(d.error || "Errore cancellazione");
    else { setMsg("✓ Booking cancellato"); setCancelModal(null); setCancelReason(""); onRefresh?.(); }
    setCancelling(false);
  }

  const FILTERS = [
    { key:"all",        label:"Tutti"          },
    { key:"pending",    label:"In attesa"      },
    { key:"accepted",   label:"Accettati"      },
    { key:"completed",  label:"Completati"     },
    { key:"payment",    label:"Da pagare"      },
    { key:"cancelled",  label:"Cancellati"     },
  ];

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (filter === "all")      return true;
      if (filter === "payment")   return ["accepted","confirmed"].includes(b.status) && b.paymentStatus === "pending";
      if (filter === "completed") return b.paymentStatus === "completed";
      if (filter === "cancelled") return b.status === "cancelled";
      return b.status === filter;
    });
  }, [bookings, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Header filtri */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
        <div>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-.03em", margin:0, color:INK }}>Booking</h2>
          <p style={{ fontSize:13, color:MUTED, margin:"3px 0 0" }}>{bookings.length} richieste totali</p>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
              style={{ padding:"6px 14px", borderRadius:100, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", border:filter===f.key?"none":"1px solid rgba(0,0,0,.1)", background:filter===f.key?INK:"white", color:filter===f.key?"white":MUTED, transition:"all .15s" }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {msg && <p style={{ fontSize:12, fontWeight:700, color:msg.startsWith("✓")?"#16a34a":"#dc2626", margin:0 }}>{msg}</p>}

      {/* Lista booking */}
      {filtered.length === 0 ? (
        <div style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:18, padding:"28px", textAlign:"center" }}>
          <p style={{ color:"rgba(0,0,0,.3)", fontSize:13, margin:0 }}>Nessun booking con questo filtro.</p>
        </div>
      ) : paginated.map(b => {
        const sl  = statusLabel(b.status);
        const pl  = paymentLabel(b.paymentStatus);
        const canPay = ["accepted","confirmed"].includes(b.status) && b.paymentStatus === "pending";
        const isLoad = loading[b.id];

        return (
          <div key={b.id} style={{ background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:20, padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>

            {/* Riga principale */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
              <div style={{ minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, margin:0, color:INK }}>{b.artistName||"—"}</h3>
                  <Badge {...sl} />
                  <Badge {...pl} />
                </div>
                {b.eventTitle && <p style={{ fontSize:13, fontWeight:600, color:INK, margin:"0 0 3px" }}>{b.eventTitle}</p>}
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {b.eventDate  && <span style={{ fontSize:12, color:ORANGE, fontWeight:700 }}>📅 {b.eventDate}</span>}
                  {b.startTime  && <span style={{ fontSize:12, color:MUTED }}>🕐 {b.startTime}–{b.endTime}</span>}
                  {b.publicPrice && <span style={{ fontSize:12, fontWeight:700, color:INK }}>💶 €{b.publicPrice}</span>}
                </div>
                {b.message && <p style={{ fontSize:12, color:MUTED, margin:"6px 0 0", fontStyle:"italic" }}>"{b.message}"</p>}
              </div>
            </div>

            {/* Tracker stati pagamento */}
            {(b.status === "accepted" || b.status === "confirmed" || b.paymentStatus !== "pending") && (
              <div style={{ background:"#f5f5f6", borderRadius:14, padding:"12px 14px", display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                {[
                  { label:"Trattativa chiusa",    done: ["accepted","confirmed","completed"].includes(b.status) },
                  { label:"Pagamento inviato",     done: !!b.paidVenueAt   },
                  { label:"Artista confermato",    done: !!b.paidArtistAt  },
                  ...(b.promoterId ? [{ label:"Promoter confermato", done: !!b.paidPromoterAt }] : []),
                  { label:"Completato",            done: b.paymentStatus === "completed" },
                ].map((step, i, arr) => (
                  <div key={step.label} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <div style={{ width:16, height:16, borderRadius:"50%", background:step.done?"#16a34a":"rgba(0,0,0,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {step.done && <svg width="8" height="8" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:step.done?INK:MUTED, whiteSpace:"nowrap" }}>{step.label}</span>
                    </div>
                    {i < arr.length-1 && <span style={{ color:"rgba(0,0,0,.2)", fontSize:12, marginLeft:2 }}>›</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Azioni */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              {/* Bottone principale: conferma pagamento */}
              {canPay && (
                <button onClick={() => doPaymentAction(b.id, "venue_paid")} disabled={isLoad}
                  style={{ background:ORANGE, color:"white", border:"none", borderRadius:100, padding:"9px 20px", fontWeight:800, fontSize:13, cursor:isLoad?"not-allowed":"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:isLoad?.5:1, transition:"all .2s" }}>
                  {isLoad ? "..." : "✓ Confermo di aver pagato"}
                </button>
              )}
              {b.paymentStatus === "completed" && (
                <span style={{ fontSize:12, fontWeight:700, color:"#16a34a", padding:"9px 0" }}>✓ Pagamento completato</span>
              )}
              {/* Chat */}
              <button onClick={() => openChat(b)}
                style={{ background:"none", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"8px 16px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", color:MUTED, transition:"all .15s" }}
                onMouseEnter={e=>e.target.style.borderColor=ORANGE}
                onMouseLeave={e=>e.target.style.borderColor="rgba(0,0,0,.1)"}>
                Apri chat
              </button>
              {/* Cancella — solo se non completato/già cancellato */}
              {!["completed","cancelled"].includes(b.status) && (
                <button onClick={()=>{ setCancelModal(b.id); setCancelReason(""); }}
                  style={{ background:"none", border:"1px solid rgba(220,38,38,.25)", color:"#dc2626", borderRadius:100, padding:"8px 14px", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
                  Cancella
                </button>
              )}
              {b.status === "cancelled" && b.cancelReason && (
                <span style={{ fontSize:11, color:MUTED, fontStyle:"italic", padding:"8px 0" }}>
                  Motivo: {b.cancelReason}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Modal cancellazione */}
      {cancelModal && (
        <div style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,.5)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e=>{if(e.target===e.currentTarget){setCancelModal(null);setCancelReason("");}}}>
          <div style={{ background:"white", borderRadius:24, padding:"24px", width:"100%", maxWidth:440 }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:INK, margin:"0 0 8px" }}>Cancella booking</h3>
            <p style={{ fontSize:13, color:MUTED, margin:"0 0 16px", lineHeight:1.6 }}>
              Questa azione è irreversibile. Il booking verrà segnalato come cancellato e l'artista verrà notificato.
            </p>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>
                Motivazione *
              </label>
              <textarea
                value={cancelReason}
                onChange={e=>setCancelReason(e.target.value)}
                rows={3}
                placeholder="Es. Evento annullato per maltempo, cambio di data, problema tecnico..."
                style={{ width:"100%", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"10px 14px", fontSize:13, color:INK, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", resize:"vertical", lineHeight:1.6, boxSizing:"border-box" }}
              />
              <p style={{ fontSize:11, color:cancelReason.length<10&&cancelReason.length>0?"#dc2626":MUTED, margin:"4px 0 0", fontFamily:"'Manrope',system-ui,sans-serif" }}>
                {cancelReason.length}/10 caratteri minimi
              </p>
            </div>
            {msg && !msg.startsWith("✓") && <p style={{ fontSize:12, fontWeight:700, color:"#dc2626", margin:"0 0 10px" }}>{msg}</p>}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>doCancel(cancelModal)} disabled={cancelling || cancelReason.trim().length < 10}
                style={{ flex:1, background:"#dc2626", color:"white", border:"none", borderRadius:100, padding:"11px", fontWeight:800, fontSize:14, cursor:cancelling||cancelReason.trim().length<10?"not-allowed":"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:cancelling||cancelReason.trim().length<10?.5:1 }}>
                {cancelling ? "Cancellazione..." : "Conferma cancellazione"}
              </button>
              <button onClick={()=>{setCancelModal(null);setCancelReason("");}}
                style={{ padding:"11px 20px", borderRadius:100, border:"1px solid rgba(0,0,0,.1)", background:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", color:MUTED }}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginazione */}
      {totalPages > 1 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <p style={{ fontSize:12, color:MUTED, margin:0 }}>Pagina {page} di {totalPages} · {filtered.length} booking</p>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ padding:"7px 16px", borderRadius:100, border:"1px solid rgba(0,0,0,.1)", background:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:page===1?.4:1 }}>
              ← Indietro
            </button>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ padding:"7px 16px", borderRadius:100, border:"none", background:INK, color:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:page===totalPages?.4:1 }}>
              Avanti →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}