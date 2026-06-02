"use client";

export default function DashboardSidebar({ user }) {
  const role = user?.role;

  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${sectionId}`);
  }

  const commonItems = [
    { label: "Overview", sectionId: "dashboard-overview" },
  ];

  const organizerItems = [
    { label: "Nuovo booking", sectionId: "organizer-booking" },
    { label: "Analitiche", sectionId: "organizer-analytics" },
    { label: "Estratto conto", sectionId: "organizer-statement" },
    { label: "Eventi", sectionId: "organizer-events" },
    { label: "Artisti", sectionId: "artist-marketplace" },
    { label: "Richieste inviate", sectionId: "organizer-bookings" },
  ];

  const artistItems = [
    { label: "Media kit", sectionId: "artist-media-kit" },
    { label: "Analitiche", sectionId: "artist-analytics" },
    { label: "Estratto conto", sectionId: "artist-statement" },
    { label: "Calendario", sectionId: "artist-calendar" },
    { label: "Booking ricevuti", sectionId: "artist-bookings" },
  ];

  const promoterItems = [
    { label: "Area promoter", sectionId: "promoter-area" },
  ];

  function getRoleItems() {
    if (role === "organizer") return organizerItems;
    if (role === "artist") return artistItems;
    if (role === "promoter") return promoterItems;
    return [];
  }

  const items = [...commonItems, ...getRoleItems()];

  return (
    <aside className="hidden lg:flex lg:w-[280px] shrink-0 min-h-screen border-r border-black/5 bg-white px-5 py-6 flex-col sticky top-0">
      <div className="mb-10">
        {/* Logo wordmark al posto del "TE" */}
        <button
          type="button"
          onClick={() => scrollToSection("dashboard-overview")}
          className="inline-flex items-center"
        >
          <span
            style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em", lineHeight: 1 }}
          >
            TUTTO<span style={{ color: "#ff5a00" }}>EVENTO</span>
          </span>
        </button>

        <div className="mt-5">
          <p className="text-sm text-black/40 font-bold uppercase tracking-[3px]">
            TuttoEvento
          </p>
          <h2 className="text-xl font-black tracking-[-0.03em] mt-1">
            Dashboard
          </h2>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.sectionId}
            type="button"
            onClick={() => scrollToSection(item.sectionId)}
            className="px-4 py-3 rounded-2xl text-sm font-bold text-black/60 hover:text-black hover:bg-black/[0.04] transition text-left"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("tuttoevento:open-chat-button"))}
        className="mt-6 px-4 py-3 rounded-2xl text-sm font-bold text-black/60 hover:text-black hover:bg-black/[0.04] transition text-left"
      >
        Chat
      </button>

      <div className="mt-auto rounded-3xl border border-black/5 bg-[#f7f7f8] p-4">
        <p className="text-xs text-black/40 font-bold uppercase tracking-[2px]">Account</p>
        <p className="font-black mt-2">{user?.name}</p>
        <p className="text-sm text-black/50 mt-1 capitalize">{user?.role}</p>
      </div>
    </aside>
  );
}