"use client";
import { useState, useEffect, useRef } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { O, INK, MUTED, SCard, STitle, ProBadge, ProLock, Inp, fmt } from "./shared";

export default function OrganizerOverview({ currentUser, bookings, plan }) {
  const pending   = bookings.filter(b => ["pending","in_attesa"].includes((b.status||"").toLowerCase())).length;
  const confirmed = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase())).length;
  const fmt = n => new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);
  const spent = bookings.filter(b => ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()))
    .reduce((s, b) => s + (Number(b.publicPrice) || Number(b.cachet) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
        {[["Richieste inviate", bookings.length, false],["Booking confermati", confirmed, false],["Budget speso", fmt(spent), true]].map(([label, val, accent]) => (
          <div key={label} style={{ background: accent ? INK : "white", border: `1px solid ${accent ? "transparent" : "rgba(0,0,0,.06)"}`, borderRadius: 20, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: accent ? "rgba(255,255,255,.5)" : MUTED, margin: "0 0 6px" }}>{label}</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-.03em", color: accent ? "white" : INK, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {bookings.length > 0 && (
        <Card>
          <SectionTitle>Ultime richieste</SectionTitle>
          {bookings.slice(0, 5).map((b, i) => (
            <div key={b.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)", gap: 10 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{b.artistName || "—"}</p>
                <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{b.eventDate || b.date || "—"}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                background: ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()) ? "rgba(22,163,74,.1)" : "rgba(217,119,6,.1)",
                color: ["confirmed","accettato","accepted"].includes((b.status||"").toLowerCase()) ? "#16a34a" : "#d97706" }}>
                {b.status || "—"}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── Tab: Marketplace ───────────────────────────────────────────
const DURATIONS = [
  { key:"1h",      label:"1 ora"  },
  { key:"2h",      label:"2 ore"  },
  { key:"3h",      label:"3 ore"  },
  { key:"fullday", label:"Full day" },
];

function ContactRequestModal({ artist, onClose }) {
  const eventTypes = Array.isArray(artist.eventTypes) ? artist.eventTypes : [];
  const publicPricing = artist.publicPricing || {};

  const [eventDate, setEventDate]   = useState("");
  const [eventType, setEventType]   = useState("");
  const [duration, setDuration]     = useState("");
  const [startTime, setStartTime]   = useState("");
  const [endTime, setEndTime]       = useState("");
  const [notes, setNotes]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [done, setDone]             = useState(false);

  // Quando cambia la durata, precompila l'orario suggerito
  function onDurationChange(dk) {
    setDuration(dk);
    const defaults = {
      "1h":      { start:"22:00", end:"23:00" },
      "2h":      { start:"22:00", end:"00:00" },
      "3h":      { start:"22:00", end:"01:00" },
      "fullday": { start:"10:00", end:"23:59" },
    };
    if (defaults[dk] && !startTime) {
      setStartTime(defaults[dk].start);
      setEndTime(defaults[dk].end);
    }
  }

  // Prezzo pubblico per la combinazione tipo evento + durata selezionata
  const price = (eventType && duration) ? (publicPricing?.[eventType]?.[duration] || null) : null;
  const canSubmit = !!(eventDate && eventType && duration && price && startTime && endTime);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    // Validazione: fine non deve essere uguale a inizio (orari identici = durata 0)
    if (startTime && endTime && startTime === endTime) {
      setError("L'orario di fine deve essere diverso dall'inizio.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          eventDate, eventType,
          duration,
          startTime,
          endTime,
          budget: price,
          notes,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Errore invio richiesta"); setLoading(false); return; }
      setDone(true);
    } catch {
      setError("Errore di rete. Riprova.");
    }
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.5)" }} onClick={onClose} />
      <div style={{ position:"relative", background:"white", borderRadius:20, padding:24, maxWidth:420, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
        <button type="button" onClick={onClose}
          style={{ position:"absolute", top:14, right:14, background:"rgba(0,0,0,.05)", border:"none", borderRadius:100, width:28, height:28, cursor:"pointer", fontSize:15, color:"#6b6b73" }}>
          ×
        </button>

        {done ? (
          <div style={{ textAlign:"center", padding:"12px 0" }}>
            <div style={{ width:54, height:54, borderRadius:"50%", background:"rgba(22,163,74,.1)", border:"2px solid rgba(22,163,74,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, margin:"0 0 8px" }}>Richiesta inviata!</p>
            <p style={{ fontSize:13, color:"#6b6b73", margin:"0 0 20px", lineHeight:1.6 }}>
              Il team TuttoEvento ti contatterà a breve per i dettagli su {artist.stageName || artist.name}.
            </p>
            <button type="button" onClick={onClose}
              style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"11px 28px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
              Chiudi
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, margin:"0 0 4px" }}>Richiedi contatto</p>
            <p style={{ fontSize:13, color:"#6b6b73", margin:"0 0 18px" }}>
              Per <strong style={{color:INK}}>{artist.stageName || artist.name}</strong> — seleziona tipo evento e durata per vedere il prezzo.
            </p>

            {eventTypes.length === 0 ? (
              <div style={{ background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.2)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"#dc2626", margin:0 }}>
                  Questo artista non ha ancora impostato i tipi di evento. Riprova più tardi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <Inp label="Data evento" type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} />

                {/* Tipo evento — checkbox tra quelli offerti dall'artista */}
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#6b6b73", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:8 }}>Tipo evento</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {eventTypes.map(et => {
                      const active = eventType === et;
                      return (
                        <button key={et} type="button" onClick={() => setEventType(et)}
                          style={{
                            padding:"7px 14px", borderRadius:100, fontSize:12, fontWeight:700, cursor:"pointer",
                            fontFamily:"'Manrope',system-ui,sans-serif",
                            border: active ? `1px solid ${ORANGE}` : "1px solid rgba(0,0,0,.12)",
                            background: active ? "rgba(255,90,0,.08)" : "white",
                            color: active ? ORANGE : "#6b6b73",
                          }}>
                          {et}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Durata */}
                {eventType && (
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:"#6b6b73", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:8 }}>Durata</label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {DURATIONS.map(d => {
                        const active = duration === d.key;
                        const hasPrice = !!(publicPricing?.[eventType]?.[d.key]);
                        return (
                          <button key={d.key} type="button" disabled={!hasPrice} onClick={() => onDurationChange(d.key)}
                            style={{
                              padding:"7px 14px", borderRadius:100, fontSize:12, fontWeight:700,
                              cursor: hasPrice ? "pointer" : "not-allowed",
                              fontFamily:"'Manrope',system-ui,sans-serif",
                              border: active ? `1px solid ${ORANGE}` : "1px solid rgba(0,0,0,.12)",
                              background: active ? "rgba(255,90,0,.08)" : "white",
                              color: !hasPrice ? "rgba(0,0,0,.25)" : (active ? ORANGE : "#6b6b73"),
                              opacity: hasPrice ? 1 : .5,
                            }}>
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Prezzo pubblico */}
                {eventType && duration && (
                  price ? (
                    <div style={{ background:"rgba(22,163,74,.06)", border:"1px solid rgba(22,163,74,.2)", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#16a34a" }}>Prezzo per questa fascia</span>
                      <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:"#16a34a" }}>€{price}</span>
                    </div>
                  ) : (
                    <div style={{ background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.2)", borderRadius:12, padding:"12px 14px" }}>
                      <p style={{ fontSize:12, fontWeight:600, color:"#dc2626", margin:0 }}>
                        Prezzo non ancora disponibile per questa combinazione. Scegli un'altra durata.
                      </p>
                    </div>
                  )
                )}

                {/* Orario evento */}
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#6b6b73", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:8 }}>Orario evento</label>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ flex:1 }}>
                      <label style={{ fontSize:11, color:"#6b6b73", display:"block", marginBottom:4 }}>Inizio</label>
                      <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)}
                        style={{ width:"100%", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:10, padding:"9px 12px", fontSize:14, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", boxSizing:"border-box" }} />
                    </div>
                    <span style={{ fontSize:13, color:"#6b6b73", marginTop:18 }}>→</span>
                    <div style={{ flex:1 }}>
                      <label style={{ fontSize:11, color:"#6b6b73", display:"block", marginBottom:4 }}>Fine</label>
                      <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)}
                        style={{ width:"100%", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:10, padding:"9px 12px", fontSize:14, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", boxSizing:"border-box" }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#6b6b73", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:6 }}>Note</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Dettagli aggiuntivi sull'evento..."
                    style={{ width:"100%", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:"'Manrope',system-ui,sans-serif", resize:"vertical", boxSizing:"border-box" }} />
                </div>

                {error && <p style={{ fontSize:12, color:"#dc2626", fontWeight:600, margin:0 }}>{error}</p>}

                <button type="submit" disabled={loading || !canSubmit}
                  style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"12px", fontWeight:800, fontSize:14, cursor:(loading||!canSubmit)?"not-allowed":"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:(loading||!canSubmit)?.5:1 }}>
                  {loading ? "Invio..." : canSubmit ? `Invia richiesta — €${price} →` : "Completa tutti i campi"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}