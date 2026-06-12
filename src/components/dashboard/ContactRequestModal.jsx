"use client";
import { useState, useEffect } from "react";

const O     = "#ff5a00";
const INK   = "#0a0a0b";
const MUTED = "#6b6b73";

const inp = {
  width:"100%", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)",
  borderRadius:12, padding:"10px 14px", fontSize:13, color:INK,
  fontFamily:"'Manrope',system-ui,sans-serif", outline:"none",
  transition:"border-color .15s", boxSizing:"border-box",
};

const REASON_ICONS = {
  calendar_busy:   "📅",
  not_available:   "🔒",
  booking_overlap: "⏰",
};

export default function ContactRequestModal({ artist, currentUser, onClose, onSuccess }) {
  const [eventDate,  setEventDate]  = useState("");
  const [startTime,  setStartTime]  = useState("");
  const [endTime,    setEndTime]    = useState("");
  const [eventType,  setEventType]  = useState("");
  const [budget,     setBudget]     = useState("");
  const [notes,      setNotes]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  // Stato disponibilità artista
  const [availability, setAvailability] = useState(null); // null | { available, message, reason }
  const [checkingAvail, setCheckingAvail] = useState(false);

  // Controlla disponibilità ogni volta che cambia data o orario
  useEffect(() => {
    if (!eventDate || !artist?.id) { setAvailability(null); return; }
    const timer = setTimeout(async () => {
      setCheckingAvail(true);
      try {
        const params = new URLSearchParams({
          checkArtistId:  artist.id,
          checkDate:      eventDate,
          checkStartTime: startTime || "00:00",
          checkEndTime:   endTime   || "23:59",
        });
        const res = await fetch(`/api/bookings?${params}`);
        const d   = await res.json();
        setAvailability(d);
      } catch {
        setAvailability(null);
      }
      setCheckingAvail(false);
    }, 500); // debounce 500ms
    return () => clearTimeout(timer);
  }, [eventDate, startTime, endTime, artist?.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    // Blocca se artista non disponibile
    if (availability && !availability.available) {
      setError(availability.message);
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/contact-request", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          artistId:  artist.id,
          eventDate,
          startTime: startTime || undefined,
          endTime:   endTime   || undefined,
          eventType,
          budget: budget ? Number(budget) : null,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Errore invio richiesta"); return; }
      onSuccess?.();
      onClose();
    } catch {
      setError("Errore tecnico. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  const isBlocked = availability && !availability.available;
  const isAvailable = availability && availability.available;

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}}
      style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,.45)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:440, background:"white", borderRadius:24, padding:"24px 24px 20px", boxShadow:"0 40px 80px -20px rgba(0,0,0,.3)", maxHeight:"90vh", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:".18em", color:O, margin:"0 0 4px", fontFamily:"'Manrope',system-ui,sans-serif" }}>Richiesta contatto</p>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:18, letterSpacing:"-.03em", color:INK, margin:"0 0 3px" }}>{artist.stageName || artist.name}</h2>
            <p style={{ fontSize:12, color:MUTED, margin:0 }}>Il nostro team ti ricontatterà con tutti i dettagli.</p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(0,0,0,.06)", border:"none", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:18, color:MUTED, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>

          {/* Data evento */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>
              Data evento *
            </label>
            <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} required
              style={{ ...inp, borderColor: isBlocked?"#dc2626": isAvailable?"#16a34a":"rgba(0,0,0,.1)" }} />

            {/* Feedback disponibilità */}
            {checkingAvail && (
              <p style={{ fontSize:11, color:MUTED, margin:"5px 0 0", fontFamily:"'Manrope',system-ui,sans-serif" }}>
                ⏳ Controllo disponibilità...
              </p>
            )}
            {!checkingAvail && isBlocked && (
              <div style={{ marginTop:8, background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.2)", borderRadius:12, padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{REASON_ICONS[availability.reason] || "⚠️"}</span>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:"#dc2626", margin:"0 0 2px", fontFamily:"'Manrope',system-ui,sans-serif" }}>Artista non disponibile</p>
                  <p style={{ fontSize:12, color:"#dc2626", margin:0, lineHeight:1.5, fontFamily:"'Manrope',system-ui,sans-serif" }}>{availability.message}</p>
                </div>
              </div>
            )}
            {!checkingAvail && isAvailable && eventDate && (
              <p style={{ fontSize:11, fontWeight:700, color:"#16a34a", margin:"5px 0 0", fontFamily:"'Manrope',system-ui,sans-serif" }}>
                ✓ Artista disponibile in questa data
              </p>
            )}
          </div>

          {/* Orario — mostra solo se disponibile o non controllato */}
          {!isBlocked && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>Ora inizio</label>
                <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>Ora fine</label>
                <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} style={inp} />
              </div>
            </div>
          )}

          {/* Tipo evento */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>Tipo evento</label>
            <div style={{ position:"relative" }}>
              <select value={eventType} onChange={e=>setEventType(e.target.value)}
                style={{ ...inp, appearance:"none", WebkitAppearance:"none", cursor:"pointer" }}>
                <option value="">Seleziona...</option>
                {["Serata in club","Festival","Evento privato","Concerto","Opening","Matrimonio","Evento aziendale","Altro"].map(t=>(
                  <option key={t}>{t}</option>
                ))}
              </select>
              <svg style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 4l4 4 4-4" stroke={MUTED} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>Budget indicativo (€)</label>
            <input type="number" min="0" placeholder="es. 300" value={budget} onChange={e=>setBudget(e.target.value)} style={inp} />
            <p style={{ fontSize:10, color:MUTED, margin:"4px 0 0", fontFamily:"'Manrope',system-ui,sans-serif" }}>Il budget è riservato e visibile solo al nostro team.</p>
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:5, fontFamily:"'Manrope',system-ui,sans-serif" }}>Note aggiuntive</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
              placeholder="Descrivi l'evento, il pubblico atteso, le tue aspettative..."
              style={{ ...inp, resize:"vertical", lineHeight:1.6 }} />
          </div>

          {/* Errore generico */}
          {error && (
            <div style={{ background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.2)", borderRadius:12, padding:"10px 14px" }}>
              <p style={{ fontSize:12, fontWeight:700, color:"#dc2626", margin:0 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button type="submit"
            disabled={loading || isBlocked || checkingAvail}
            style={{
              width:"100%", borderRadius:14, padding:"13px",
              fontWeight:800, fontSize:14, cursor: (loading||isBlocked||checkingAvail) ? "not-allowed":"pointer",
              fontFamily:"'Manrope',system-ui,sans-serif", border:"none",
              background: isBlocked ? "rgba(0,0,0,.08)" : O,
              color: isBlocked ? MUTED : "white",
              opacity: (loading||checkingAvail) ? .7 : 1,
              transition:"all .2s",
              boxShadow: isBlocked ? "none" : `0 10px 24px -10px rgba(255,90,0,.5)`,
            }}>
            {loading ? "Invio in corso..." :
             checkingAvail ? "Controllo disponibilità..." :
             isBlocked ? "⚠️ Artista non disponibile" :
             "Invia richiesta →"}
          </button>

          {isBlocked && (
            <p style={{ fontSize:12, color:MUTED, textAlign:"center", margin:0, fontFamily:"'Manrope',system-ui,sans-serif" }}>
              Modifica la data o l'orario per procedere con la richiesta.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}