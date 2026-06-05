"use client";

import { useMemo, useState } from "react";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

const BOOKINGS_PER_PAGE = 4;

function statusConfig(status) {
  if (status === "accepted" || status === "confirmed" || status === "accettato")
    return { label: "Accettata", bg: "rgba(22,163,74,.1)", color: "#16a34a" };
  if (status === "rejected")
    return { label: "Rifiutata", bg: "rgba(220,38,38,.1)", color: "#dc2626" };
  return { label: "In attesa", bg: "rgba(217,119,6,.1)", color: "#d97706" };
}

export default function OrganizerBookings({ bookings = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  function openBookingChat(booking) {
    const artistUserId =
      booking.artistId || booking.artistUserId ||
      booking.artist_user_id || booking.artistUserID;
    if (!artistUserId) { alert("ID artista mancante nel booking."); return; }
    window.dispatchEvent(new CustomEvent("tuttoevento:open-chat", {
      detail: {
        participantUserId: Number(artistUserId),
        bookingId: booking.id,
        eventId: booking.eventId || null,
        title: `Booking · ${booking.artistName || "Artista"}`,
      },
    }));
  }

  function changeFilter(f) { setStatusFilter(f); setCurrentPage(1); }

  const filtered = useMemo(() => {
    if (statusFilter === "all") return bookings;
    if (statusFilter === "accepted") return bookings.filter(b => ["accepted","confirmed","accettato"].includes(b.status));
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / BOOKINGS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * BOOKINGS_PER_PAGE, currentPage * BOOKINGS_PER_PAGE);

  const FILTERS = [
    { key: "all",      label: "Tutte" },
    { key: "pending",  label: "In attesa" },
    { key: "accepted", label: "Accettate" },
    { key: "rejected", label: "Rifiutate" },
  ];

  return (
    <section id="organizer-bookings" style={{ marginTop: 16, scrollMarginTop: 32 }}>
      <div style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "20px 22px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".16em", color: ORANGE, margin: "0 0 4px", fontFamily: "'Manrope',system-ui,sans-serif" }}>Booking</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-.03em", margin: 0, color: INK }}>Richieste inviate</h2>
            <p style={{ fontSize: 13, color: MUTED, margin: "4px 0 0", fontFamily: "'Manrope',system-ui,sans-serif" }}>Stato delle richieste inviate agli artisti.</p>
          </div>
          {/* Filtri */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map(f => {
              const active = statusFilter === f.key;
              return (
                <button key={f.key} type="button" onClick={() => changeFilter(f.key)}
                  style={{ padding: "6px 14px", borderRadius: 100, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif", transition: "all .15s", border: active ? "none" : "1px solid rgba(0,0,0,.1)", background: active ? INK : "white", color: active ? "white" : MUTED }}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div style={{ background: "#fbfaf8", border: "1px solid rgba(0,0,0,.06)", borderRadius: 18, padding: "28px 22px", textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: INK, margin: "0 0 6px", fontFamily: "'Sora',sans-serif" }}>Nessuna richiesta trovata.</p>
            <p style={{ fontSize: 13, color: MUTED, margin: 0, fontFamily: "'Manrope',system-ui,sans-serif" }}>Cambia filtro oppure invia una nuova richiesta dal marketplace artisti.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {paginated.map((booking) => {
                const sc = statusConfig(booking.status);
                const artistUserId = booking.artistId || booking.artistUserId || booking.artist_user_id || booking.artistUserID;
                return (
                  <div key={booking.id} style={{ border: "1px solid rgba(0,0,0,.07)", borderRadius: 20, padding: "16px 18px", background: "#fbfaf8" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, margin: 0, color: INK }}>{booking.artistName || "—"}</h3>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: sc.bg, color: sc.color, flexShrink: 0 }}>
                            {sc.label}
                          </span>
                        </div>
                        {booking.eventTitle && (
                          <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: "0 0 4px", fontFamily: "'Manrope',system-ui,sans-serif" }}>{booking.eventTitle}</p>
                        )}
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                          {booking.eventDate && (
                            <span style={{ fontSize: 12, color: ORANGE, fontWeight: 700, fontFamily: "'Manrope',system-ui,sans-serif" }}>📅 {booking.eventDate}</span>
                          )}
                          {(booking.startTime || booking.endTime) && (
                            <span style={{ fontSize: 12, color: MUTED, fontFamily: "'Manrope',system-ui,sans-serif" }}>🕐 {booking.startTime || "--:--"} – {booking.endTime || "--:--"}</span>
                          )}
                        </div>
                        {booking.message && (
                          <p style={{ fontSize: 12, color: MUTED, margin: "8px 0 0", lineHeight: 1.6, fontFamily: "'Manrope',system-ui,sans-serif", fontStyle: "italic" }}>
                            "{booking.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => openBookingChat(booking)} disabled={!artistUserId}
                      style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "8px 20px", fontWeight: 700, fontSize: 12, cursor: artistUserId ? "pointer" : "not-allowed", fontFamily: "'Manrope',system-ui,sans-serif", opacity: artistUserId ? 1 : .4, transition: "all .2s" }}>
                      💬 Apri chat
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Paginazione */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,.06)", gap: 10 }}>
                <p style={{ fontSize: 12, color: MUTED, fontFamily: "'Manrope',system-ui,sans-serif", margin: 0 }}>
                  Pagina {currentPage} di {totalPages} · {filtered.length} richieste
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    style={{ padding: "7px 16px", borderRadius: 100, border: "1px solid rgba(0,0,0,.1)", background: "white", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif", opacity: currentPage === 1 ? .4 : 1 }}>
                    ← Indietro
                  </button>
                  <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    style={{ padding: "7px 16px", borderRadius: 100, border: "none", background: INK, color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif", opacity: currentPage === totalPages ? .4 : 1 }}>
                    Avanti →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}