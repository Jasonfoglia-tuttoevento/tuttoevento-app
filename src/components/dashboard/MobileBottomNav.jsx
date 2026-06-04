"use client";

export default function MobileBottomNav({ user }) {
  const role = user?.role;

  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior:"smooth", block:"start" });
    window.history.replaceState(null, "", `#${sectionId}`);
  }

  function openChat() {
    window.dispatchEvent(new CustomEvent("tuttoevento:open-chat-button"));
  }

  const organizerItems = [
    { label:"Home",    short:"🏠", sectionId:"dashboard-overview" },
    { label:"Analisi", short:"📊", sectionId:"organizer-analytics" },
    { label:"Conto",   short:"€",  sectionId:"organizer-statement" },
    { label:"Booking", short:"📋", sectionId:"organizer-booking" },
    { label:"Chat",    short:"💬", action:openChat },
  ];

  const artistItems = [
    { label:"Home",    short:"🏠", sectionId:"dashboard-overview" },
    { label:"Analisi", short:"📊", sectionId:"artist-analytics" },
    { label:"Conto",   short:"€",  sectionId:"artist-statement" },
    { label:"Booking", short:"📋", sectionId:"artist-bookings" },
    { label:"Chat",    short:"💬", action:openChat },
  ];

  const promoterItems = [
    { label:"Home", short:"🏠", sectionId:"dashboard-overview" },
    { label:"Area", short:"🎯", sectionId:"promoter-area" },
    { label:"Chat", short:"💬", action:openChat },
  ];

  function getItems() {
    if (role === "organizer") return organizerItems;
    if (role === "artist")    return artistItems;
    if (role === "promoter")  return promoterItems;
    return [
      { label:"Home", short:"🏠", sectionId:"dashboard-overview" },
      { label:"Chat", short:"💬", action:openChat },
    ];
  }

  const items = getItems();

  return (
    <>
      <style>{`
        .mbn-root {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 40;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(16px);
          border-top: 1px solid rgba(0,0,0,.08);
          padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
        }
        @media(max-width:1023px) { .mbn-root { display:block; } }
        .mbn-grid {
          display: grid;
          gap: 4px;
        }
        .mbn-btn {
          height: 56px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: none;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          padding: 4px;
          transition: background .15s;
          font-family: 'Manrope', system-ui, sans-serif;
        }
        .mbn-btn:active { background: rgba(0,0,0,.05); }
        .mbn-icon {
          width: 28px; height: 28px;
          border-radius: 10px;
          background: #f5f5f6;
          border: 1px solid rgba(0,0,0,.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 900;
          color: #ff5a00;
          flex-shrink: 0;
          font-family: 'Manrope', system-ui, sans-serif;
        }
        .mbn-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(0,0,0,.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-align: center;
          line-height: 1;
        }
      `}</style>

      <nav className="mbn-root">
        <div
          className="mbn-grid"
          style={{ gridTemplateColumns:`repeat(${items.length},minmax(0,1fr))` }}
        >
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              className="mbn-btn"
              onClick={() => item.action ? item.action() : scrollToSection(item.sectionId)}
            >
              <span className="mbn-icon">{item.short}</span>
              <span className="mbn-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}