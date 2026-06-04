"use client";

export default function DashboardSidebar({ user }) {
  const role = user?.role;

  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior:"smooth", block:"start" });
    window.history.replaceState(null, "", `#${sectionId}`);
  }

  const commonItems = [
    { label:"Overview", sectionId:"dashboard-overview" },
  ];

  const organizerItems = [
    { label:"Nuovo booking",    sectionId:"organizer-booking" },
    { label:"Analitiche",       sectionId:"organizer-analytics" },
    { label:"Estratto conto",   sectionId:"organizer-statement" },
    { label:"Eventi",           sectionId:"organizer-events" },
    { label:"Artisti",          sectionId:"artist-marketplace" },
    { label:"Richieste inviate",sectionId:"organizer-bookings" },
  ];

  const artistItems = [
    { label:"Media kit",      sectionId:"artist-media-kit" },
    { label:"Analitiche",     sectionId:"artist-analytics" },
    { label:"Estratto conto", sectionId:"artist-statement" },
    { label:"Calendario",     sectionId:"artist-calendar" },
    { label:"Booking ricevuti",sectionId:"artist-bookings" },
  ];

  const promoterItems = [
    { label:"Area promoter", sectionId:"promoter-area" },
  ];

  function getRoleItems() {
    if (role === "organizer") return organizerItems;
    if (role === "artist")    return artistItems;
    if (role === "promoter")  return promoterItems;
    return [];
  }

  const items = [...commonItems, ...getRoleItems()];

  return (
    <>
      <style>{`
        .ds-sidebar {
          width: 260px;
          flex-shrink: 0;
          min-height: 100vh;
          border-right: 1px solid rgba(0,0,0,.06);
          background: white;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }
        .ds-nav-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          border-radius: 14px;
          padding: 10px 14px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: rgba(0,0,0,.5);
          cursor: pointer;
          transition: background .15s, color .15s;
          margin-bottom: 2px;
        }
        .ds-nav-btn:hover {
          background: rgba(0,0,0,.04);
          color: #0a0a0b;
        }
        @media(max-width:1024px) {
          .ds-sidebar { display: none; }
        }
      `}</style>

      <aside className="ds-sidebar">
        {/* Logo */}
        <div style={{ marginBottom:36 }}>
          <button type="button" onClick={() => scrollToSection("dashboard-overview")}
            style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"inline-block" }}>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.1rem", letterSpacing:"-.03em", lineHeight:1, color:"#0a0a0b" }}>
              TUTTO<span style={{ color:"#ff5a00" }}>EVENTO</span>
            </span>
          </button>
          <div style={{ marginTop:20 }}>
            <p style={{ fontFamily:"'Manrope',system-ui,sans-serif", fontSize:11, color:"rgba(0,0,0,.35)", fontWeight:700, textTransform:"uppercase", letterSpacing:"3px", margin:0 }}>
              TuttoEvento
            </p>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.2rem", fontWeight:900, letterSpacing:"-.03em", margin:"4px 0 0" }}>
              Dashboard
            </h2>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ display:"flex", flexDirection:"column", flex:1 }}>
          {items.map(item => (
            <button key={item.sectionId} type="button"
              onClick={() => scrollToSection(item.sectionId)}
              className="ds-nav-btn">
              {item.label}
            </button>
          ))}

          <button type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("tuttoevento:open-chat-button"))}
            className="ds-nav-btn"
            style={{ marginTop:8 }}>
            💬 Chat
          </button>
        </nav>

        {/* Account badge */}
        <div style={{ marginTop:"auto", paddingTop:16, borderTop:"1px solid rgba(0,0,0,.06)" }}>
          <div style={{ background:"#f7f7f8", borderRadius:18, padding:"14px 16px" }}>
            <p style={{ fontFamily:"'Manrope',system-ui,sans-serif", fontSize:10, color:"rgba(0,0,0,.35)", fontWeight:700, textTransform:"uppercase", letterSpacing:"2px", margin:0 }}>Account</p>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1rem", margin:"6px 0 0", letterSpacing:"-.02em" }}>{user?.name}</p>
            <p style={{ fontFamily:"'Manrope',system-ui,sans-serif", fontSize:12, color:"rgba(0,0,0,.45)", margin:"2px 0 0", textTransform:"capitalize" }}>{user?.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
}