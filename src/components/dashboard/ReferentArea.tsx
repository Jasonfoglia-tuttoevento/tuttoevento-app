"use client";

import { useMemo } from "react";

// ── Tipi ────────────────────────────────────────────────────────
interface ReferentUser {
  id: number | string;
  name?: string;
  [key: string]: unknown;
}

interface Organizer {
  id: number | string;
  name?: string;
  referentId?: number | string;
  [key: string]: unknown;
}

interface Booking {
  id?: string;
  organizerId?: number | string;
  eventTitle?: string;
  organizerName?: string;
  cachet?: number | string;
  commission?: number | string;
  status?: string;
  confirmed?: boolean;
  [key: string]: unknown;
}

interface EventItem {
  id?: string;
  userId?: number | string;
  organizerId?: number | string;
  title?: string;
  eventTitle?: string;
  date?: string;
  eventDate?: string;
  organizer?: string;
  organizerName?: string;
  artistName?: string;
  artist?: string;
  [key: string]: unknown;
}

interface ReferentAreaProps {
  currentUser: ReferentUser | null;
  organizers?: Organizer[];
  events?: EventItem[];
  bookings?: Booking[];
}

interface Stats {
  volume: number;
  commission: number;
  confirmedCount: number;
}

// ── Helpers ─────────────────────────────────────────────────────
const toNum = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(/[^0-9.-]/g, "")) || 0;
  return 0;
};

const formatEuro = (n: number): string =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

const isConfirmed = (b: Booking): boolean =>
  b.confirmed === true || String(b.status).toLowerCase() === "confirmed";

const cachetOf = (b: Booking): number => toNum(b.cachet);
const commissionOf = (b: Booking): number => toNum(b.commission);

const aggregate = (bookings: Booking[]): Stats =>
  bookings.reduce<Stats>(
    (acc, b) => ({
      volume: acc.volume + cachetOf(b),
      commission: acc.commission + commissionOf(b),
      confirmedCount: acc.confirmedCount + (isConfirmed(b) ? 1 : 0),
    }),
    { volume: 0, commission: 0, confirmedCount: 0 }
  );

// ── Componente ──────────────────────────────────────────────────
export default function ReferentArea({
  currentUser,
  organizers = [],
  events = [],
  bookings = [],
}: ReferentAreaProps) {
  const refId = String(currentUser?.id ?? "");

  const myOrganizers = useMemo(
    () => organizers.filter((o) => String(o.referentId ?? "") === refId),
    [organizers, refId]
  );

  const myOrgIds = useMemo(
    () => new Set(myOrganizers.map((o) => String(o.id))),
    [myOrganizers]
  );

  const myBookings = useMemo(
    () => bookings.filter((b) => myOrgIds.has(String(b.organizerId ?? ""))),
    [bookings, myOrgIds]
  );

  const myEvents = useMemo(
    () => events.filter((e) => myOrgIds.has(String(e.userId ?? e.organizerId ?? ""))),
    [events, myOrgIds]
  );

  const stats = useMemo(() => aggregate(myBookings), [myBookings]);

  const calendar = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...myEvents]
      .filter((e) => (e.date || e.eventDate || "") >= today)
      .sort((a, b) =>
        (a.date || a.eventDate || "").localeCompare(b.date || b.eventDate || "")
      );
  }, [myEvents]);

  const cards = [
    { label: "Locali assegnati", value: myOrganizers.length, hint: "in gestione" },
    { label: "Eventi gestiti", value: myEvents.length, hint: `${calendar.length} in arrivo` },
    { label: "Volume confermato", value: formatEuro(stats.volume), hint: `${stats.confirmedCount} booking` },
    { label: "Le mie commissioni", value: formatEuro(stats.commission), hint: "stima 8%" },
  ];

  return (
    <div className="te-area w-full max-w-full overflow-hidden space-y-6 sm:space-y-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-area { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); }
        .te-area .te-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
      `}</style>

      {/* Header + Stats Cards */}
      <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
        <div className="mb-6">
          <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-2">Referente</p>
          <h2 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">
            Area referente{currentUser?.name ? ` · ${currentUser.name}` : ""}
          </h2>
          <p className="text-[var(--muted)] mt-2">I tuoi locali, gli eventi in calendario e le commissioni maturate.</p>
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
      </section>

      {/* Locali + Calendario */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Locali assegnati</h3>
          {myOrganizers.length === 0 ? (
            <p className="text-black/45">Nessun locale associato al tuo profilo.</p>
          ) : (
            <div className="space-y-3">
              {myOrganizers.map((o, i) => {
                const orgBookings = myBookings.filter((b) => String(b.organizerId) === String(o.id));
                const s = aggregate(orgBookings);
                return (
                  <div key={String(o.id) || i} className="border border-black/10 rounded-2xl p-4 bg-[var(--paper)] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold break-words">{o.name || "Locale"}</p>
                      <p className="text-sm text-[var(--muted)] mt-0.5">{orgBookings.length} booking · {formatEuro(s.volume)} volume</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--orange)]/10 text-[var(--orange)]">
                      {formatEuro(s.commission)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
          <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Eventi in calendario</h3>
          {calendar.length === 0 ? (
            <p className="text-black/45">Nessun evento in programma.</p>
          ) : (
            <div className="space-y-3">
              {calendar.slice(0, 8).map((e, i) => (
                <div key={e.id || i} className="border border-black/10 rounded-2xl p-4 bg-[var(--paper)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold break-words">{e.title || e.eventTitle || "Evento"}</p>
                    <span className="shrink-0 text-xs font-bold text-[var(--muted)]">{e.date || e.eventDate}</span>
                  </div>
                  <p className="text-sm text-[var(--muted)] mt-1 break-words">
                    {e.organizer || e.organizerName || "Locale"}
                    {e.artistName ? ` · ${e.artistName}` : e.artist ? ` · ${e.artist}` : ""}
                  </p>
                </div>
              ))}
              {calendar.length > 8 && (
                <p className="text-sm text-black/40 font-bold">+ {calendar.length - 8} altri eventi</p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Estratto commissioni */}
      <section className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
        <h3 className="te-display text-lg sm:text-xl font-extrabold mb-4">Estratto commissioni</h3>
        {myBookings.length === 0 ? (
          <p className="text-black/45">Nessuna commissione registrata.</p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm border-collapse min-w-[560px]">
              <thead>
                <tr className="text-left text-[var(--muted)]">
                  <th className="py-2 font-bold">Evento</th>
                  <th className="py-2 font-bold">Locale</th>
                  <th className="py-2 font-bold">Cachet</th>
                  <th className="py-2 font-bold">Commissione</th>
                  <th className="py-2 font-bold">Stato</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map((b, i) => (
                  <tr key={b.id ? String(b.id) : `booking-${i}`} className="border-t border-black/5">
                    <td className="py-3 pr-3 font-medium break-words">{b.eventTitle || "—"}</td>
                    <td className="py-3 pr-3 break-words">{b.organizerName || "—"}</td>
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