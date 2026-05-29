"use client";

export default function ArtistAnalytics({ bookings = [], bookedSlots = [] }) {
  const totalRequests = bookings.length;

  const pendingRequests = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const acceptedRequests = bookings.filter(
    (booking) => booking.status === "accepted"
  ).length;

  const rejectedRequests = bookings.filter(
    (booking) => booking.status === "rejected"
  ).length;

  const conversionRate =
    totalRequests > 0
      ? Math.round((acceptedRequests / totalRequests) * 100)
      : 0;

  const upcomingEvents = bookedSlots.filter((slot) => {
    if (!slot.date && !slot.eventDate) return false;

    const eventDate = new Date(slot.date || slot.eventDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return eventDate >= today;
  }).length;

  const estimatedRevenue = bookings
    .filter((booking) => booking.status === "accepted")
    .reduce((total, booking) => {
      const rawValue =
        booking.cachet ||
        booking.artistCachet ||
        booking.fee ||
        booking.price ||
        booking.amount ||
        0;

      const value = Number(String(rawValue).replace(/[^\d.]/g, ""));

      return total + (Number.isFinite(value) ? value : 0);
    }, 0);

  const lastSixMonths = getLastSixMonths();

  const monthlyAccepted = lastSixMonths.map((month) => {
    const count = bookings.filter((booking) => {
      if (booking.status !== "accepted") return false;

      const rawDate =
        booking.eventDate || booking.date || booking.createdAt || null;

      if (!rawDate) return false;

      const bookingDate = new Date(rawDate);

      return (
        bookingDate.getFullYear() === month.year &&
        bookingDate.getMonth() === month.month
      );
    }).length;

    return {
      ...month,
      count,
    };
  });

  const maxMonthlyValue = Math.max(
    1,
    ...monthlyAccepted.map((item) => item.count)
  );

  return (
    <section
      id="artist-analytics"
      className="bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm mt-8 scroll-mt-8 overflow-hidden"
    >
      <div className="mb-7">
        <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
          Analitiche
        </p>

        <h2 className="text-3xl font-black tracking-[-0.04em] leading-tight">
          Performance artista
        </h2>

        <p className="text-black/50 mt-2">
          Panoramica delle richieste booking, conversioni ed eventi confermati.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Richieste totali"
          value={totalRequests}
          description="Booking ricevuti"
        />

        <AnalyticsCard
          title="Accettate"
          value={acceptedRequests}
          description={`${conversionRate}% conversione`}
        />

        <AnalyticsCard
          title="In attesa"
          value={pendingRequests}
          description="Da valutare"
        />

        <AnalyticsCard
          title="Prossimi eventi"
          value={upcomingEvents}
          description="Date future confermate"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5 mt-6">
        <div className="rounded-3xl border border-black/5 bg-[#f7f7f8] p-5 overflow-hidden">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-black/35 font-black">
                Andamento
              </p>

              <h3 className="text-xl font-black tracking-[-0.03em] mt-1">
                Booking accettati negli ultimi 6 mesi
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {monthlyAccepted.map((item) => {
              const width = Math.max(6, (item.count / maxMonthlyValue) * 100);

              return (
                <div key={`${item.year}-${item.month}`}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-black text-black/60">
                      {item.label}
                    </p>

                    <p className="text-sm font-black text-[#ff5a00]">
                      {item.count}
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
        </div>

        <div className="rounded-3xl border border-black/5 bg-[#111] text-white p-5 overflow-hidden">
          <p className="text-xs uppercase tracking-[2px] text-white/40 font-black">
            Valore stimato
          </p>

          <h3 className="text-4xl font-black tracking-[-0.05em] mt-4">
            € {estimatedRevenue.toLocaleString("it-IT")}
          </h3>

          <p className="text-white/50 mt-3 leading-relaxed">
            Totale stimato dai booking accettati che hanno un cachet o importo
            associato.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <MiniStatusCard
              label="Pending"
              value={pendingRequests}
              tone="yellow"
            />

            <MiniStatusCard
              label="Ok"
              value={acceptedRequests}
              tone="green"
            />

            <MiniStatusCard
              label="No"
              value={rejectedRequests}
              tone="red"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalyticsCard({ title, value, description }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-[#f7f7f8] p-5 overflow-hidden">
      <p className="text-sm text-black/45 font-black">
        {title}
      </p>

      <p className="text-4xl font-black text-[#ff5a00] tracking-[-0.05em] mt-4">
        {value}
      </p>

      <p className="text-sm text-black/45 mt-2">
        {description}
      </p>
    </div>
  );
}

function MiniStatusCard({ label, value, tone }) {
  const toneClass =
    tone === "green"
      ? "bg-green-500/15 text-green-300"
      : tone === "red"
      ? "bg-red-500/15 text-red-300"
      : "bg-yellow-500/15 text-yellow-300";

  return (
    <div className={`rounded-2xl p-3 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[2px] font-black">
        {label}
      </p>

      <p className="text-2xl font-black mt-1">
        {value}
      </p>
    </div>
  );
}

function getLastSixMonths() {
  const formatter = new Intl.DateTimeFormat("it-IT", {
    month: "short",
  });

  const today = new Date();

  return Array.from({ length: 6 })
    .map((_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - index, 1);

      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        label: formatter.format(date),
      };
    })
    .reverse();
}