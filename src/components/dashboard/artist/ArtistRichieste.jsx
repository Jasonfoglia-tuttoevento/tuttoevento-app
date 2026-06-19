"use client";
import { useState, useEffect } from "react";
import { SCard, STitle, O, INK, MUTED, inp } from "./shared";
import ContractWidget from "@/components/ContractWidget";

/* ── Carta conferma presenza booking ── */
function BookingConfirmCard({ booking, onRefresh }) {
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendConfirm(action) {
    if (action === "decline" && declineReason.trim().length < 5) {
      setError("Inserisci un breve motivo (almeno 5 caratteri)");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          confirmAction: action,
          declineReason: action === "decline" ? declineReason.trim() : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Errore"); setLoading(false); return; }
      if (onRefresh) onRefresh();
    } catch {
      setError("Errore di rete. Riprova.");
    }
    setLoading(false);
  }

  return (
    <div style={{ background:"rgba(255,90,0,.04)", border:"1px solid rgba(255,90,0,.2)", borderRadius:16, padding:"14px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:6 }}>
        <p style={{ fontWeight:800, fontSize:14, margin:0, fontFamily:"'Sora',sans-serif", color:INK }}>{booking.eventTitle || "Evento"}</p>
        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, background:"rgba(255,90,0,.12)", color:O }}>
          Conferma richiesta
        </span>
      </div>
      <p style={{ fontSize:12, color:MUTED, margin:"0 0 10px", lineHeight:1.6 }}>
        {booking.eventDate}{booking.startTime ? ` · ${booking.startTime}–${booking.endTime}` : ""} · {booking.organizerName}
      </p>
      <p style={{ fontSize:12, color:INK, margin:"0 0 12px", lineHeight:1.6 }}>
        Confermi la tua presenza per questa data? Se non sei disponibile, segnalalo subito.
      </p>

      {!showDecline ? (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button type="button" disabled={loading} onClick={()=>sendConfirm("confirm")}
            style={{ fontSize:12, fontWeight:700, padding:"8px 18px", borderRadius:100, border:"none",
              background:"#16a34a", color:"white", cursor:loading?"not-allowed":"pointer",
              fontFamily:"inherit", opacity:loading?.6:1 }}>
            ✓ Confermo presenza
          </button>
          <button type="button" disabled={loading} onClick={()=>setShowDecline(true)}
            style={{ fontSize:12, fontWeight:700, padding:"8px 18px", borderRadius:100,
              border:"1px solid #fca5a5", background:"transparent", color:"#dc2626",
              cursor:loading?"not-allowed":"pointer", fontFamily:"inherit" }}>
            Non sono disponibile
          </button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <textarea value={declineReason} onChange={e=>setDeclineReason(e.target.value)} rows={2}
            placeholder="Motivo (es. impegno già preso per quella data)..."
            style={{ ...inp, resize:"vertical" }} />
          <div style={{ display:"flex", gap:8 }}>
            <button type="button" disabled={loading} onClick={()=>sendConfirm("decline")}
              style={{ fontSize:12, fontWeight:700, padding:"8px 18px", borderRadius:100, border:"none",
                background:"#dc2626", color:"white", cursor:loading?"not-allowed":"pointer",
                fontFamily:"inherit", opacity:loading?.6:1 }}>
              Invia indisponibilità
            </button>
            <button type="button" onClick={()=>{setShowDecline(false);setError("");}}
              style={{ fontSize:12, fontWeight:700, padding:"8px 18px", borderRadius:100,
                border:"1px solid rgba(0,0,0,.12)", background:"transparent", color:MUTED,
                cursor:"pointer", fontFamily:"inherit" }}>
              Annulla
            </button>
          </div>
        </div>
      )}
      {error && <p style={{ fontSize:12, color:"#dc2626", fontWeight:600, margin:"8px 0 0" }}>{error}</p>}

      {/* Contratto digitale del booking */}
      <div style={{ marginTop:12 }}>
        <ContractWidget bookingId={booking.id} currentUserRole="artist" />
      </div>
    </div>
  );
}

/* ── Componente principale ── */
export default function ArtistRichieste({ bookings=[], onRefreshBookings }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  const STATUS_LABEL = { pending:"In attesa", contacted:"Contattato", connected:"Connesso", rejected:"Rifiutato" };
  const STATUS_COLOR = { pending:"#d97706", contacted:"#2563eb", connected:"#16a34a", rejected:"#dc2626" };

  useEffect(() => {
    fetch("/api/contact-requests")
      .then(r => r.json())
      .then(d => setRequests(Array.isArray(d) ? d : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  // Booking che richiedono conferma presenza
  const toConfirm = (Array.isArray(bookings) ? bookings : []).filter(b =>
    ["pending","accepted","confirmed"].includes(b.status) &&
    (b.artistConfirmation === "pending" || !b.artistConfirmation)
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Booking da confermare — priorità */}
      {toConfirm.length > 0 && (
        <SCard>
          <STitle sub="Booking creati dal team — confirma la tua presenza">
            Da confermare
          </STitle>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {toConfirm.map(b => (
              <BookingConfirmCard key={b.id} booking={b} onRefresh={onRefreshBookings} />
            ))}
          </div>
        </SCard>
      )}

      {/* Richieste dai locali */}
      <SCard>
        <STitle sub="Richieste di contatto ricevute dai locali tramite il marketplace">
          Richieste
        </STitle>
        {loading ? (
          <p style={{ fontSize:13, color:MUTED }}>Caricamento...</p>
        ) : requests.length === 0 ? (
          <p style={{ fontSize:13, color:MUTED }}>
            Nessuna richiesta ricevuta ancora. Quando un locale ti contatta dal marketplace, la richiesta apparirà qui.
          </p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {requests.map(r => (
              <div key={r.id} style={{ background:"#fbfaf8", borderRadius:16, padding:"14px 16px", border:"1px solid rgba(0,0,0,.06)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:6 }}>
                  <p style={{ fontWeight:800, fontSize:14, margin:0, fontFamily:"'Sora',sans-serif", color:INK }}>{r.organizer_name || "Locale"}</p>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, flexShrink:0,
                    background:(STATUS_COLOR[r.status]||"#6b7280")+"18",
                    color:STATUS_COLOR[r.status]||"#6b7280" }}>
                    {STATUS_LABEL[r.status] || r.status || "—"}
                  </span>
                </div>
                <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.6 }}>
                  {r.event_date || "—"}
                  {r.start_time && r.end_time ? ` · ${r.start_time}–${r.end_time}` : ""}
                  {r.event_type ? ` · ${r.event_type}` : ""}
                  {r.duration ? ` · ${r.duration}` : ""}
                </p>
                {r.notes && <p style={{ fontSize:12, color:INK, margin:"8px 0 0", lineHeight:1.6 }}>{r.notes}</p>}
                <p style={{ fontSize:11, color:MUTED, margin:"8px 0 0", fontStyle:"italic" }}>
                  {r.status === "connected"
                    ? "Booking creato — controlla la sezione \"Da confermare\" qui sopra."
                    : "Il team TuttoEvento gestirà la trattativa e ti aggiornerà via chat."}
                </p>
              </div>
            ))}
          </div>
        )}
      </SCard>
    </div>
  );
}