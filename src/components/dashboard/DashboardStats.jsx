import StatCard from "./StatCard";

export default function DashboardStats({
  user,
  events,
  artists,
  bookings,
  bookedSlots,
  nextEventDate,
}) {
  if (user.role === "artist") {
    return (
      <section id="dashboard-overview" className="scroll-mt-8 w-full max-w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8 w-full max-w-full">
          <StatCard
            title="Eventi confermati"
            value={bookedSlots.length}
          />

          <StatCard
            title="Richieste ricevute"
            value={bookings.length}
          />

          <StatCard
            title="Prossimo evento"
            value={nextEventDate}
          />
        </div>
      </section>
    );
  }

  return (
    <section id="dashboard-overview" className="scroll-mt-8 w-full max-w-full overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8 w-full max-w-full">
        <StatCard title="Eventi" value={events.length} />
        <StatCard title="Artisti" value={artists.length} />
        <StatCard title="Account" value={user.role} />
      </div>
    </section>
  );
}