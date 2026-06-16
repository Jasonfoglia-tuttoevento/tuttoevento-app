"use client";
import VerifiedBadge from "@/components/VerifiedBadge";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";

/* ─── Icone SVG inline ───────────────────────────────────── */
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  mic:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  calendar:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chart:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  wallet:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>,
  search:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  briefcase: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  building:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  settings:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  chat:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  logout:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  shield:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  link:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
};

/* ─── Configurazione tab per ruolo ───────────────────────── */
function getNavItems(role) {
  const common = [
    { id: "overview",    label: "Dashboard",   icon: Icons.dashboard },
    { id: "settings",    label: "Impostazioni", icon: Icons.settings  },
  ];

  if (role === "artist") return [
    { id: "overview",    label: "Dashboard",      icon: Icons.dashboard },
    { id: "profile",     label: "Profilo",         icon: Icons.mic       },
    { id: "cachet",      label: "Cachet",           icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 9h4.5a1.5 1.5 0 010 3H10.5a1.5 1.5 0 000 3H15"/></svg> },
    { id: "richieste",   label: "Richieste",        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> },
    { id: "scalette",    label: "Scalette",          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { id: "video",       label: "Video",            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
    { id: "calendar",    label: "Calendario",      icon: Icons.calendar  },
    { id: "analytics",   label: "Analitiche",      icon: Icons.chart     },
    { id: "earnings",    label: "Guadagni",        icon: Icons.wallet    },
    { id: "settings",    label: "Impostazioni",    icon: Icons.settings  },
  ];

  if (role === "organizer") return [
    { id: "overview",    label: "Dashboard",      icon: Icons.dashboard },
    { id: "marketplace", label: "Trova artisti",  icon: Icons.search    },
    { id: "richieste",   label: "Richieste",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id: "bookings",    label: "Booking",        icon: Icons.calendar  },
    { id: "analytics",   label: "Analitiche",     icon: Icons.chart     },
    { id: "earnings",    label: "Estratto conto", icon: Icons.wallet    },
    { id: "settings",    label: "Impostazioni",   icon: Icons.settings  },
  ];

  if (role === "promoter") return [
    { id: "overview",    label: "Dashboard",      icon: Icons.dashboard  },
    { id: "roster",      label: "Roster",         icon: Icons.users      },
    { id: "network",     label: "La mia rete",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v4M5 17l5.5-4M19 17l-5.5-4"/></svg> },
    { id: "deals",       label: "Trattative",     icon: Icons.briefcase  },
    { id: "commissions", label: "Commissioni",    icon: Icons.wallet     },
    { id: "agency",      label: "Agenzia",        icon: Icons.link       },
    { id: "settings",    label: "Impostazioni",   icon: Icons.settings   },
  ];

  if (role === "admin" || role === "referent") return [
    { id: "overview",    label: "Panoramica",     icon: Icons.dashboard  },
    { id: "users",       label: "Utenti",         icon: Icons.users      },
    { id: "artists",     label: "Artisti",        icon: Icons.mic        },
    { id: "finance",     label: "Finanza",        icon: Icons.wallet     },
    { id: "crm",         label: "CRM",            icon: Icons.briefcase  },
    { id: "requests",    label: "Richieste",      icon: Icons.shield     },
    { id: "moderazione", label: "Moderazione",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg> },
    { id: "pricing",     label: "Prezzi",         icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 9h4.5a1.5 1.5 0 010 3H10.5a1.5 1.5 0 000 3H15"/></svg> },
    { id: "settings",    label: "Impostazioni",   icon: Icons.settings   },
  ];

  return common;
}

/* ─── Avatar iniziali ────────────────────────────────────── */
function Avatar({ name, size = 36 }) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${ORANGE}, #ff8246)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.36, color: "white",
      flexShrink: 0, fontFamily: "'Sora',sans-serif",
    }}>
      {initials}
    </div>
  );
}

/* ─── Main Shell ─────────────────────────────────────────── */
export default function DashboardShell({ user, activeTab, onTabChange, children }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = getNavItems(user?.role);

  async function handleLogout() {
    setLoggingOut(true);
    try { await fetch("/api/logout", { method: "POST" }); } catch {}
    router.push("/login");
  }

  function openChat() {
    window.dispatchEvent(new CustomEvent("tuttoevento:open-chat-button"));
  }

  const roleLabel = {
    artist: "Artista", organizer: "Locale",
    promoter: "Promoter", admin: "Admin", referent: "Referente",
  }[user?.role] || user?.role;

  return (
    <>
      <style>{`
        .ds-root {
          display: flex; min-height: 100vh;
          background: #f5f5f6;
          font-family: 'Manrope', system-ui, sans-serif;
        }

        /* ── Sidebar ── */
        .ds-sidebar {
          width: 240px; flex-shrink: 0;
          background: #0a0a0b;
          display: flex; flex-direction: column;
          height: 100vh; position: sticky; top: 0;
          overflow: hidden;
          transition: width .25s cubic-bezier(.4,0,.2,1);
          z-index: 30;
        }

        .ds-logo {
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,.06);
          flex-shrink: 0;
        }
        .ds-logo-text {
          font-family: 'Sora', sans-serif; font-weight: 900;
          font-size: 1.1rem; letter-spacing: -.04em; color: white;
          text-decoration: none; display: block;
        }
        .ds-logo-text span { color: #ff5a00; }

        .ds-nav {
          flex: 1; padding: 12px 10px;
          overflow-y: auto; overflow-x: hidden;
        }
        .ds-nav::-webkit-scrollbar { display: none; }

        .ds-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 12px;
          cursor: pointer; border: none; background: none;
          width: 100%; text-align: left;
          color: rgba(255,255,255,.45);
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: .875rem; font-weight: 600;
          transition: all .15s; margin-bottom: 2px;
          white-space: nowrap;
        }
        .ds-nav-item:hover {
          background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.85);
        }
        .ds-nav-item.active {
          background: rgba(255,90,0,.15);
          color: #ff5a00;
          font-weight: 700;
        }
        .ds-nav-item.active svg { stroke: #ff5a00; }

        .ds-nav-section {
          font-size: 10px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: rgba(255,255,255,.2);
          padding: 14px 12px 6px; margin-top: 4px;
        }

        .ds-chat-btn {
          margin: 0 10px 8px;
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 12px;
          cursor: pointer; border: 1px solid rgba(255,255,255,.08);
          background: none; width: calc(100% - 20px);
          color: rgba(255,255,255,.45);
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: .875rem; font-weight: 600;
          transition: all .15s;
        }
        .ds-chat-btn:hover {
          background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.85);
          border-color: rgba(255,255,255,.14);
        }

        .ds-user-card {
          padding: 14px 16px;
          border-top: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0;
        }
        .ds-user-info { flex: 1; min-width: 0; }
        .ds-user-name {
          font-weight: 700; font-size: .875rem; color: white;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ds-user-role {
          font-size: .75rem; color: rgba(255,255,255,.35);
          margin-top: 1px;
        }
        .ds-logout-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,.3); padding: 6px;
          border-radius: 8px; transition: all .15s;
          display: flex; align-items: center;
          flex-shrink: 0;
        }
        .ds-logout-btn:hover { color: #ff5a00; background: rgba(255,90,0,.1); }

        /* ── Main area ── */
        .ds-main {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          height: 100vh; overflow: hidden;
        }

        .ds-topbar {
          background: white;
          border-bottom: 1px solid rgba(0,0,0,.06);
          padding: 0 24px;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .ds-page-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800; font-size: 1.1rem;
          letter-spacing: -.02em; color: #0a0a0b;
        }
        .ds-topbar-actions {
          display: flex; align-items: center; gap: 8px;
        }

        .ds-content {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          padding: 24px;
        }
        .ds-content::-webkit-scrollbar { width: 4px; }
        .ds-content::-webkit-scrollbar-thumb { background: rgba(0,0,0,.1); border-radius: 2px; }

        /* ── Mobile ── */
        .ds-mobile-header {
          display: none;
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: #0a0a0b;
          height: 56px; padding: 0 16px;
          align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .ds-mobile-bottom {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          background: #0a0a0b;
          border-top: 1px solid rgba(255,255,255,.06);
          padding: 8px 4px calc(12px + env(safe-area-inset-bottom));
          /* Fix Safari: compensa la barra di navigazione */
          padding-bottom: max(12px, calc(12px + env(safe-area-inset-bottom)));
        }
        /* Fix contenuto non oscurato dalla bottom nav Safari */
        @supports (-webkit-touch-callout: none) {
          .ds-mobile-bottom {
            padding-bottom: max(20px, calc(8px + env(safe-area-inset-bottom)));
          }
          .ds-content {
            padding-bottom: calc(100px + env(safe-area-inset-bottom)) !important;
          }
        }
        .ds-mobile-nav {
          display: flex; justify-content: space-around;
        }
        .ds-mobile-nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 6px 10px; border-radius: 12px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,.35);
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 10px; font-weight: 600;
          transition: all .15s; min-width: 52px;
        }
        .ds-mobile-nav-item.active { color: #ff5a00; }
        .ds-mobile-nav-item.active svg { stroke: #ff5a00; }

        .ds-hamburger {
          background: none; border: none; cursor: pointer;
          color: white; padding: 6px; display: flex; flex-direction: column; gap: 4px;
        }
        .ds-hamburger span {
          display: block; width: 20px; height: 2px;
          background: currentColor; border-radius: 1px;
          transition: all .2s;
        }

        /* Mobile overlay menu */
        .ds-mobile-menu {
          display: none;
          position: fixed; inset: 0; z-index: 60;
        }
        .ds-mobile-menu.open { display: flex; flex-direction: column; }
        .ds-mobile-menu-backdrop {
          position: absolute; inset: 0; background: rgba(0,0,0,.6);
          backdrop-filter: blur(4px);
        }
        .ds-mobile-menu-panel {
          position: absolute; top: 0; left: 0; bottom: 0; width: 280px;
          background: #0a0a0b;
          display: flex; flex-direction: column;
          animation: ds-slide-in .25s cubic-bezier(.4,0,.2,1);
        }
        @keyframes ds-slide-in { from{transform:translateX(-100%)} to{transform:translateX(0)} }

        @media(max-width: 1023px) {
          .ds-sidebar { display: none; }
          .ds-mobile-header { display: flex; }
          .ds-mobile-bottom { display: block; }
          .ds-topbar { display: none; }
          .ds-main { height: calc(100vh - 56px); margin-top: 56px; }
          .ds-content { padding: 16px 16px calc(90px + env(safe-area-inset-bottom)); }
        }

        /* Animazione contenuto */
        @keyframes ds-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ds-content-inner {
          animation: ds-fade-up .3s cubic-bezier(.4,0,.2,1);
        }
      `}</style>

      <div className="ds-root">

        {/* ══ SIDEBAR DESKTOP ══ */}
        <aside className="ds-sidebar">
          <div className="ds-logo">
            <a href="/" className="ds-logo-text">TUTTO<span>EVENTO</span></a>
          </div>

          <nav className="ds-nav">
            <div className="ds-nav-section">Menu</div>
            {navItems.filter(i => i.id !== "settings").map(item => (
              <button key={item.id}
                className={`ds-nav-item${activeTab === item.id ? " active" : ""}`}
                onClick={() => onTabChange(item.id)}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <div className="ds-nav-section">Altro</div>
            <button className="ds-chat-btn" onClick={openChat}>
              {Icons.chat}
              <span>Chat</span>
            </button>
            <button
              className={`ds-nav-item${activeTab === "settings" ? " active" : ""}`}
              onClick={() => onTabChange("settings")}>
              {Icons.settings}
              <span>Impostazioni</span>
            </button>
          </nav>

          <div className="ds-user-card">
            <Avatar name={user?.name} size={34} />
            <div className="ds-user-info">
              <div className="ds-user-name">{user?.name || "Utente"}</div>
              <div className="ds-user-role">{roleLabel}</div>
            </div>
            <button className="ds-logout-btn" onClick={handleLogout} disabled={loggingOut} title="Esci">
              {Icons.logout}
            </button>
          </div>
        </aside>

        {/* ══ HEADER MOBILE ══ */}
        <div className="ds-mobile-header">
          <a href="/" style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1rem", letterSpacing:"-.04em", textDecoration:"none", color:"white" }}>
            TUTTO<span style={{ color:ORANGE }}>EVENTO</span>
          </a>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={openChat}
              style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.5)", padding:6, display:"flex" }}>
              {Icons.chat}
            </button>
            <button className="ds-hamburger" onClick={() => setMobileMenuOpen(true)}>
              <span/><span/><span/>
            </button>
          </div>
        </div>

        {/* ══ MENU MOBILE OVERLAY ══ */}
        <div className={`ds-mobile-menu${mobileMenuOpen ? " open" : ""}`}>
          <div className="ds-mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="ds-mobile-menu-panel">
            <div className="ds-logo" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1rem", color:"white", letterSpacing:"-.04em" }}>
                TUTTO<span style={{ color:ORANGE }}>EVENTO</span>
              </span>
              <button onClick={() => setMobileMenuOpen(false)}
                style={{ background:"rgba(255,255,255,.08)", border:"none", borderRadius:10, width:32, height:32, cursor:"pointer", color:"white", fontSize:"1.1rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
                ×
              </button>
            </div>
            <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
              {navItems.map(item => (
                <button key={item.id}
                  className={`ds-nav-item${activeTab === item.id ? " active" : ""}`}
                  onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}>
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <button className="ds-chat-btn" style={{ marginTop:8 }} onClick={() => { openChat(); setMobileMenuOpen(false); }}>
                {Icons.chat}<span>Chat</span>
              </button>
            </nav>
            <div className="ds-user-card">
              <Avatar name={user?.name} size={34} />
              <div className="ds-user-info">
                <div className="ds-user-name">{user?.name}</div>
                <div className="ds-user-role">{roleLabel}</div>
              </div>
              <button className="ds-logout-btn" onClick={handleLogout}>
                {Icons.logout}
              </button>
            </div>
          </div>
        </div>

        {/* ══ AREA PRINCIPALE ══ */}
        <main className="ds-main">
          {/* Topbar desktop */}
          <div className="ds-topbar">
            <span className="ds-page-title">
              {navItems.find(i => i.id === activeTab)?.label || "Dashboard"}
            </span>
            <div className="ds-topbar-actions">
              {user?.role !== "artist" && (
                <a href="/pricing" style={{ fontSize:11, fontWeight:700, textDecoration:"none",
                  color: user?.plan==="pro" ? ORANGE : "rgba(0,0,0,.4)",
                  background: user?.plan==="pro" ? "rgba(255,90,0,.1)" : "rgba(0,0,0,.06)",
                  border: user?.plan==="pro" ? "1px solid rgba(255,90,0,.2)" : "1px solid rgba(0,0,0,.08)",
                  borderRadius:100, padding:"3px 10px" }}>
                  {user?.plan === "pro" ? "PRO" : "Free →"}
                </a>
              )}
              <Avatar name={user?.name} size={32} />
            </div>
          </div>

          {/* Contenuto tab */}
          <div className="ds-content">
            <div className="ds-content-inner" key={activeTab}>
              {children}
            </div>
          </div>
        </main>

        {/* ══ BOTTOM NAV MOBILE ══ */}
        <div className="ds-mobile-bottom">
          <div className="ds-mobile-nav">
            {navItems.filter(i => i.id !== "settings").slice(0, 4).map(item => (
              <button key={item.id}
                className={`ds-mobile-nav-item${activeTab === item.id ? " active" : ""}`}
                onClick={() => onTabChange(item.id)}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            {/* "Altro" apre il menu completo — dà accesso a TUTTE le voci, incluse quelle oltre la 4a */}
            <button
              className={`ds-mobile-nav-item${mobileMenuOpen ? " active" : ""}`}
              onClick={() => setMobileMenuOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              <span>Altro</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}