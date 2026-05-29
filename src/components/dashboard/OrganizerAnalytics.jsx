"use client";

export default function OrganizerAnalytics({ events = [], bookings = [] }) {
  const acceptedBookings = bookings.filter(
    (booking) => booking.status === "accepted"
  );

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );

  const rejectedBookings = bookings.filter(
    (booking) => booking.status === "rejected"
  );

  const totalEvents = events.length;
  const confirmedEvents = events.filter(
    (event) => event.status === "accepted" || event.status === "confirmed"
  ).length;

  const estimatedArtistCost = acceptedBookings.reduce((total, booking) => {
    return total + getBookingCost(booking);
  }, 0);

  const totalRevenue = events.reduce((total, event) => {
    return total + getStoredEventRevenue(event.id);
  }, 0);

  const estimatedProfit = totalRevenue - estimatedArtistCost;

  const averageRevenue =
    totalEvents > 0 ? Math.round(totalRevenue / totalEvents) : 0;

  const lastSixEvents = [...events]
    .sort((a, b) => {
      const dateA = new Date(a.date || a.eventDate || a.createdAt || 0);
      const dateB = new Date(b.date || b.eventDate || b.createdAt || 0);

      return dateB - dateA;
    })
    .slice(0, 6)
    .reverse();

  const maxRevenue = Math.max(
    1,
    ...lastSixEvents.map((event) => getStoredEventRevenue(event.id))
  );

  return (
    <section
      id="organizer-analytics"
      className="bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm mt-8 scroll-mt-8 overflow-hidden"
    >
      <div className="mb-7">
        <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
          Analitiche
        </p>

        <h2 className="text-3xl font-black tracking-[-0.04em] leading-tight">
          Performance locale
        </h2>

        <p className="text-black/50 mt-2">
          Monitora eventi, costi artisti, incassi inseriti e utile stimato.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Eventi creati"
          value={totalEvents}
          description={`${confirmedEvents} confermati`}
        />

        <AnalyticsCard
          title="Booking accettati"
          value={acceptedBookings.length}
          description={`${pendingBookings.length} in attesa`}
        />

        <AnalyticsCard
          title="Costo artisti"
          value={`€ ${estimatedArtistCost.toLocaleString("it-IT")}`}
          description="Stima compensi accettati"
        />

        <AnalyticsCard
          title="Utile stimato"
          value={`€ ${estimatedProfit.toLocaleString("it-IT")}`}
          description="Incassi meno costi artisti"
          highlight={estimatedProfit >= 0}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5 mt-6">
        <div className="rounded-3xl border border-black/5 bg-[#f7f7f8] p-5 overflow-hidden">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[2px] text-black/35 font-black">
              Incassi
            </p>

            <h3 className="text-xl font-black tracking-[-0.03em] mt-1">
              Ultimi eventi
            </h3>
          </div>

          {lastSixEvents.length === 0 ? (
            <p className="text-black/45">
              Nessun evento disponibile.
            </p>
          ) : (
            <div className="space-y-4">
              {lastSixEvents.map((event) => {
                const revenue = getStoredEventRevenue(event.id);
                const width = Math.max(6, (revenue / maxRevenue) * 100);

                return (
                  <div key={event.id}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-black text-black/60 break-words">
                        {event.title || "Evento"}
                      </p>

                      <p className="text-sm font-black text-[#ff5a00] whitespace-nowrap">
                        € {revenue.toLocaleString("it-IT")}
                      </p>
                    </div>

                    <div className="h-3 rounded-full bg-white border border-black/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#ff5a00]"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-black/5 bg-[#111] text-white p-5 overflow-hidden">
          <p className="text-xs uppercase tracking-[2px] text-white/40 font-black">
            Riepilogo economico
          </p>

          <h3 className="text-4xl font-black tracking-[-0.05em] mt-4">
            € {totalRevenue.toLocaleString("it-IT")}
          </h3>

          <p className="text-white/50 mt-3 leading-relaxed">
            Incasso totale inserito dal locale per gli eventi registrati.
          </p>

          <div className="grid grid-cols-1 gap-3 mt-6">
            <MiniRow label="Costo artisti" value={estimatedArtistCost} />
            <MiniRow label="Utile stimato" value={estimatedProfit} />
            <MiniRow label="Incasso medio" value={averageRevenue} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <StatusCard label="In attesa" value={pendingBookings.length} tone="yellow" />
        <StatusCard label="Accettati" value={acceptedBookings.length} tone="green" />
        <StatusCard label="Rifiutati" value={rejectedBookings.length} tone="red" />
      </div>
    </section>
  );
}

function AnalyticsCard({ title, value, description, highlight = false }) {
  return (
    <div
      className={
        highlight
          ? "rounded-3xl border border-green-500/15 bg-green-50 p-5 overflow-hidden"
          : "rounded-3xl border border-black/5 bg-[#f7f7f8] p-5 overflow-hidden"
      }
    >
      <p className="text-sm text-black/45 font-black">
        {title}
      </p>

      <p className="text-3xl md:text-4xl font-black text-[#ff5a00] tracking-[-0.05em] mt-4 break-words">
        {value}
      </p>

      <p className="text-sm text-black/45 mt-2">
        {description}
      </p>
    </div>
  );
}

function MiniRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs uppercase tracking-[2px] text-white/40 font-black">
        {label}
      </p>

      <p className="text-xl font-black mt-1">
        € {value.toLocaleString("it-IT")}
      </p>
    </div>
  );
}

function StatusCard({ label, value, tone }) {
  const toneClass =
    tone === "green"
      ? "bg-green-100 text-green-700"
      : tone === "red"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className={`rounded-3xl p-4 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[2px] font-black">
        {label}
      </p>

      <p className="text-2xl font-black mt-1">
        {value}
      </p>
    </div>
  );
}

function getBookingCost(booking) {
  const rawValue =
    booking.artistCachet ||
    booking.cachet ||
    booking.amount ||
    booking.fee ||
    booking.price ||
    0;

  const value = Number(
    String(rawValue)
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );

  return Number.isFinite(value) ? value : 0;
}

function getStoredEventRevenue(eventId) {
  if (typeof window === "undefined") return 0;

  const rawValue = localStorage.getItem(`tuttoevento-event-revenue-${eventId}`);

  const value = Number(rawValue || 0);

  return Number.isFinite(value) ? value : 0;
}