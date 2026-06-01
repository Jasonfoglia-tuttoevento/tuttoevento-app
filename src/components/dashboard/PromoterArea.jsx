"use client";

import { useMemo } from "react";
import { aggregate, commissionOf, cachetOf, isConfirmed, formatEuro } from "./Commissions";

/* PromoterArea — dashboard operativa del promoter.
   Props (tutte opzionali, fallback a vuoto):
   - currentUser: { id, name }
   - events:   eventi in cui il promoter è coinvolto
   - bookings: booking collegati al promoter (per commissioni)
*/

export default function PromoterArea({ currentUser, events = [], bookings = [] }) {
  const stats = useMemo(() => aggregate(bookings), [bookings]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...events]
      .filter((e) => (e.date || e.eventDate || "") >= today)
      .sort((a, b) => (a.date || a.eventDate || "").localeCompare(b.date || b.eventDate || ""))
      .slice(0, 6);
  }, [events]);

  const cards = [
    { label: "Eventi totali", value: events.length, hint: `${upcoming.length} in arrivo` },
    { label: "Volume confermato", value: formatEuro(stats.volume), hint: `${stats.confirmedCount} booking` },
    { label: "Le tue commissioni", value: formatEuro(stats.commission), hint: "stima 8%" },
  ];

  return (
    <div className="te-area w-full max-w-full overflow-hidden space-y-6 sm:space-y-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-area { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); }
        .te-area .te-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
      `}</style>

      <section
        id="promoter-area"
        className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm scroll-mt-8 overflow-hidden"
      >
        <div className="mb-6">
          <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-2">Promoter</p>
          <h2 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">
            Ciao{currentUser?.name ? ` ${currentUser.name}` : ""}, ecco la tua area
          </h2>
          <p className="text-[var(--muted)] mt-2">Eventi, commissioni e attività di promozione in un colpo d'occhio.</p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-3xl bg-[var(--paper)] border border-black/5 p-5">
              <p className="text-sm text-[var(--muted)] font-bold">{c.label}</p>
              <p className="te-display text-2xl sm:text-3xl font-extrabold mt-2">{c.value}</p>
              <p className="text-xs font-bold text-[var(--orange)] mt-1">{c.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* prossimi eventi */}
      <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
        <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Prossimi eventi</h3>
        {upcoming.length === 0 ? (
          <p className="text-black/45">Nessun evento in programma.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((e, i) => (
              <div key={e.id || i} className="border border-black/10 rounded-2xl p-4 bg-[var(--paper)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold break-words">{e.title || e.eventTitle || "Evento"}</p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">
                    {(e.date || e.eventDate) || "data da definire"}
                    {e.artistName ? ` · ${e.artistName}` : e.artist ? ` · ${e.artist}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-black/10 self-start sm:self-auto">
                  {e.organizer || e.organizerName || "Locale"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* estratto commissioni */}
      <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
        <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Estratto commissioni</h3>
        {bookings.length === 0 ? (
          <p className="text-black/45">Nessuna commissione registrata.</p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm border-collapse min-w-[480px]">
              <thead>
                <tr className="text-left text-[var(--muted)]">
                  <th className="py-2 font-bold">Evento</th>
                  <th className="py-2 font-bold">Cachet</th>
                  <th className="py-2 font-bold">Commissione</th>
                  <th className="py-2 font-bold">Stato</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id || i} className="border-t border-black/5">
                    <td className="py-3 pr-3 font-medium break-words">{b.eventTitle || "—"}</td>
                    <td className="py-3 pr-3">{formatEuro(cachetOf(b))}</td>
                    <td className="py-3 pr-3 font-bold text-[var(--orange)]">{formatEuro(commissionOf(b))}</td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isConfirmed(b) ? "bg-green-50 text-green-600" : "bg-black/5 text-[var(--muted)]"}`}>
                        {isConfirmed(b) ? "Confermato" : "In attesa"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}