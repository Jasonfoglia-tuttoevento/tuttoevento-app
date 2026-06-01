"use client";

import { useMemo, useState } from "react";
import { aggregate, commissionOf, cachetOf, isConfirmed, formatEuro } from "./Commissions";

/* AdminArea — pannello di controllo globale (un solo utente admin).
   Vede tutto: utenti, referenti, locali, eventi, booking, commissioni totali.

   Props (tutte opzionali):
   - users:    tutti gli utenti { id, name, email, role, referentId }
   - events:   tutti gli eventi
   - bookings: tutti i booking
*/

export default function AdminArea({ users = [], events = [], bookings = [] }) {
  const [tab, setTab] = useState("overview");

  const byRole = useMemo(() => {
    const r = { organizer: [], artist: [], promoter: [], referent: [], admin: [], other: [] };
    users.forEach((u) => (r[u.role] ? r[u.role] : r.other).push(u));
    return r;
  }, [users]);

  const stats = useMemo(() => aggregate(bookings), [bookings]);

  // referenti con i propri locali e commissioni
  const referents = useMemo(() => {
    return byRole.referent.map((ref) => {
      const locali = byRole.organizer.filter((o) => String(o.referentId ?? "") === String(ref.id));
      const orgIds = new Set(locali.map((o) => String(o.id)));
      const refBookings = bookings.filter((b) => orgIds.has(String(b.organizerId ?? "")));
      const s = aggregate(refBookings);
      return { ...ref, localiCount: locali.length, ...s };
    });
  }, [byRole, bookings]);

  const cards = [
    { label: "Utenti totali", value: users.length, hint: `${byRole.organizer.length} locali · ${byRole.artist.length} artisti` },
    { label: "Eventi totali", value: events.length, hint: `${bookings.length} booking` },
    { label: "Volume confermato", value: formatEuro(stats.volume), hint: `${stats.confirmedCount} confermati` },
    { label: "Commissioni totali", value: formatEuro(stats.commission), hint: "ricavi piattaforma" },
  ];

  const tabs = [
    { id: "overview", label: "Panoramica" },
    { id: "referents", label: "Referenti" },
    { id: "users", label: "Utenti" },
    { id: "bookings", label: "Booking" },
  ];

  return (
    <div className="te-area w-full max-w-full overflow-hidden space-y-6 sm:space-y-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-area { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); }
        .te-area .te-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
      `}</style>

      {/* header + tabs */}
      <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
        <div className="mb-6">
          <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-2">Admin</p>
          <h2 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">Pannello di controllo</h2>
          <p className="text-[var(--muted)] mt-2">Vista completa su utenti, eventi, referenti e ricavi della piattaforma.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-3xl bg-[var(--paper)] border border-black/5 p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-[var(--muted)] font-bold">{c.label}</p>
              <p className="te-display text-xl sm:text-3xl font-extrabold mt-1.5 sm:mt-2">{c.value}</p>
              <p className="text-[11px] sm:text-xs font-bold text-[var(--orange)] mt-1">{c.hint}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm font-bold px-4 py-2 rounded-full transition ${
                tab === t.id ? "bg-[var(--ink)] text-white" : "bg-[var(--paper)] border border-black/10 text-[var(--muted)] hover:border-[var(--orange)]/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Distribuzione utenti</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { k: "Locali", v: byRole.organizer.length },
              { k: "Artisti", v: byRole.artist.length },
              { k: "Promoter", v: byRole.promoter.length },
              { k: "Referenti", v: byRole.referent.length },
              { k: "Admin", v: byRole.admin.length },
            ].map((x) => (
              <div key={x.k} className="rounded-2xl bg-[var(--paper)] border border-black/5 p-4 text-center">
                <p className="te-display text-2xl font-extrabold">{x.v}</p>
                <p className="text-xs text-[var(--muted)] font-bold mt-1">{x.k}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-[var(--paper)] border border-black/5 p-5">
            <p className="text-sm font-bold text-[var(--muted)] mb-3">Ripartizione economica (confermati)</p>
            <div className="flex items-center justify-between text-sm py-1.5">
              <span className="text-[var(--muted)]">Volume cachet</span>
              <span className="font-bold">{formatEuro(stats.volume)}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1.5">
              <span className="text-[var(--muted)]">Netto agli artisti</span>
              <span className="font-bold">{formatEuro(stats.netToArtists)}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1.5 border-t border-black/5 mt-1 pt-2">
              <span className="font-bold">Commissioni piattaforma</span>
              <span className="font-bold text-[var(--orange)]">{formatEuro(stats.commission)}</span>
            </div>
          </div>
        </section>
      )}

      {/* REFERENTI */}
      {tab === "referents" && (
        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Referenti</h3>
          {referents.length === 0 ? (
            <p className="text-black/45">Nessun referente registrato.</p>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm border-collapse min-w-[560px]">
                <thead>
                  <tr className="text-left text-[var(--muted)]">
                    <th className="py-2 font-bold">Referente</th>
                    <th className="py-2 font-bold">Locali</th>
                    <th className="py-2 font-bold">Booking conf.</th>
                    <th className="py-2 font-bold">Volume</th>
                    <th className="py-2 font-bold">Commissioni</th>
                  </tr>
                </thead>
                <tbody>
                  {referents.map((r, i) => (
                    <tr key={r.id || i} className="border-t border-black/5">
                      <td className="py-3 pr-3 font-medium break-words">{r.name || "—"}</td>
                      <td className="py-3 pr-3">{r.localiCount}</td>
                      <td className="py-3 pr-3">{r.confirmedCount}</td>
                      <td className="py-3 pr-3">{formatEuro(r.volume)}</td>
                      <td className="py-3 font-bold text-[var(--orange)]">{formatEuro(r.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* UTENTI */}
      {tab === "users" && (
        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Tutti gli utenti</h3>
          {users.length === 0 ? (
            <p className="text-black/45">Nessun utente.</p>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm border-collapse min-w-[520px]">
                <thead>
                  <tr className="text-left text-[var(--muted)]">
                    <th className="py-2 font-bold">Nome</th>
                    <th className="py-2 font-bold">Email</th>
                    <th className="py-2 font-bold">Ruolo</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id || i} className="border-t border-black/5">
                      <td className="py-3 pr-3 font-medium break-words">{u.name || "—"}</td>
                      <td className="py-3 pr-3 break-words text-[var(--muted)]">{u.email || "—"}</td>
                      <td className="py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--paper)] border border-black/10 capitalize">
                          {u.role || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* BOOKING */}
      {tab === "bookings" && (
        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Tutti i booking</h3>
          {bookings.length === 0 ? (
            <p className="text-black/45">Nessun booking.</p>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr className="text-left text-[var(--muted)]">
                    <th className="py-2 font-bold">Evento</th>
                    <th className="py-2 font-bold">Locale</th>
                    <th className="py-2 font-bold">Artista</th>
                    <th className="py-2 font-bold">Cachet</th>
                    <th className="py-2 font-bold">Comm.</th>
                    <th className="py-2 font-bold">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id || i} className="border-t border-black/5">
                      <td className="py-3 pr-3 font-medium break-words">{b.eventTitle || "—"}</td>
                      <td className="py-3 pr-3 break-words">{b.organizerName || "—"}</td>
                      <td className="py-3 pr-3 break-words">{b.artistName || "—"}</td>
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
      )}
    </div>
  );
}