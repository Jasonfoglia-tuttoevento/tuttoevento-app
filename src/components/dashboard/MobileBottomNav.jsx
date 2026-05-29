"use client";

export default function MobileBottomNav({ user }) {
  const role = user?.role;

  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);

    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", `#${sectionId}`);
  }

  function openChat() {
    window.dispatchEvent(new CustomEvent("tuttoevento:open-chat-button"));
  }

  const organizerItems = [
    { label: "Home", short: "H", sectionId: "dashboard-overview" },
    { label: "Analisi", short: "A", sectionId: "organizer-analytics" },
    { label: "Conto", short: "€", sectionId: "organizer-statement" },
    { label: "Booking", short: "B", sectionId: "organizer-booking" },
    { label: "Chat", short: "C", action: openChat },
  ];

  const artistItems = [
    { label: "Home", short: "H", sectionId: "dashboard-overview" },
    { label: "Analisi", short: "A", sectionId: "artist-analytics" },
    { label: "Conto", short: "€", sectionId: "artist-statement" },
    { label: "Booking", short: "B", sectionId: "artist-bookings" },
    { label: "Chat", short: "C", action: openChat },
  ];

  const promoterItems = [
    { label: "Home", short: "H", sectionId: "dashboard-overview" },
    { label: "Area", short: "A", sectionId: "promoter-area" },
    { label: "Chat", short: "C", action: openChat },
  ];

  function getItems() {
    if (role === "organizer") return organizerItems;
    if (role === "artist") return artistItems;
    if (role === "promoter") return promoterItems;

    return [
      { label: "Home", short: "H", sectionId: "dashboard-overview" },
      { label: "Chat", short: "C", action: openChat },
    ];
  }

  const items = getItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur-xl px-2 pt-2 pb-[calc(0.65rem+env(safe-area-inset-bottom))]">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.action) {
                item.action();
                return;
              }

              scrollToSection(item.sectionId);
            }}
            className="h-[58px] flex flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-black text-black/55 active:bg-black/[0.04] overflow-hidden"
          >
            <span className="w-7 h-7 rounded-2xl bg-[#f5f5f6] border border-black/5 flex items-center justify-center text-[11px] text-[#ff5a00] font-black mb-1 shrink-0">
              {item.short}
            </span>

            <span className="block w-full text-center leading-none whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}