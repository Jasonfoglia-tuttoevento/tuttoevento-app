"use client";

import { useState, useEffect } from "react";

const ORANGE = "#ff5a00";

export default function LandingNav({ links = [], ctaHref = "#registrati", ctaLabel = "Inizia gratis" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20); }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Chiudi menu quando si clicca un link
  function handleLink() { setOpen(false); }

  return (
    <>
      <style>{`
        .ln-root {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 12px 16px;
          transition: padding .3s;
        }
        .ln-root.scrolled { padding: 8px 16px; }

        .ln-bar {
          max-width: 1100px; margin: 0 auto;
          background: rgba(255,255,255,.07);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 100px;
          height: 52px;
          padding: 0 20px;
          display: flex; align-items: center; justify-content: space-between;
          transition: background .3s;
        }
        .ln-root.scrolled .ln-bar {
          background: rgba(10,10,11,.85);
          border-color: rgba(255,255,255,.08);
        }

        /* Logo */
        .ln-logo {
          font-family: 'Sora', sans-serif; font-weight: 900;
          font-size: 1.05rem; letter-spacing: -.04em;
          text-decoration: none; color: white; flex-shrink: 0;
        }

        /* Link centrali — desktop */
        .ln-links {
          display: flex; gap: 24px; align-items: center;
        }
        .ln-link {
          font-size: .875rem; font-weight: 600;
          color: rgba(255,255,255,.6); text-decoration: none;
          transition: color .15s; white-space: nowrap;
        }
        .ln-link:hover { color: white; }

        /* Destra — desktop */
        .ln-right {
          display: flex; gap: 8px; align-items: center; flex-shrink: 0;
        }
        .ln-login {
          font-size: .875rem; font-weight: 700;
          color: rgba(255,255,255,.7); text-decoration: none;
          padding: 7px 14px; border-radius: 100px;
          transition: color .15s;
        }
        .ln-login:hover { color: white; }
        .ln-cta {
          background: ${ORANGE}; color: white; border: none;
          border-radius: 100px; padding: 8px 18px;
          font-weight: 800; font-size: .85rem;
          cursor: pointer; font-family: 'Manrope', system-ui, sans-serif;
          text-decoration: none; transition: all .2s; white-space: nowrap;
        }
        .ln-cta:hover { background: #e85100; transform: scale(1.03); }

        /* Hamburger — mobile */
        .ln-burger {
          display: none;
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px; width: 40px; height: 40px;
          cursor: pointer; flex-direction: column;
          align-items: center; justify-content: center; gap: 5px;
          flex-shrink: 0;
        }
        .ln-burger-line {
          width: 18px; height: 2px; background: white; border-radius: 2px;
          transition: transform .25s, opacity .25s;
        }
        .ln-burger.open .ln-burger-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .ln-burger.open .ln-burger-line:nth-child(2) { opacity: 0; }
        .ln-burger.open .ln-burger-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Dropdown mobile */
        .ln-dropdown {
          position: fixed; top: 76px; left: 12px; right: 12px;
          background: rgba(10,10,11,.96);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 24px;
          padding: 20px;
          z-index: 99;
          display: flex; flex-direction: column; gap: 4px;
          animation: ln-drop .2s cubic-bezier(.2,.7,.2,1);
        }
        @keyframes ln-drop {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ln-drop-link {
          display: block; padding: 13px 16px;
          font-size: 1rem; font-weight: 700; color: white;
          text-decoration: none; border-radius: 14px;
          transition: background .15s;
        }
        .ln-drop-link:hover { background: rgba(255,255,255,.07); }
        .ln-drop-divider {
          height: 1px; background: rgba(255,255,255,.07);
          margin: 8px 0;
        }
        .ln-drop-cta {
          display: block; text-align: center;
          background: ${ORANGE}; color: white;
          border-radius: 14px; padding: 13px;
          font-weight: 800; font-size: 1rem;
          text-decoration: none; margin-top: 4px;
          transition: background .2s;
        }
        .ln-drop-cta:hover { background: #e85100; }
        .ln-drop-login {
          display: block; text-align: center;
          color: rgba(255,255,255,.6); font-weight: 700;
          text-decoration: none; padding: 10px;
          font-size: .9rem;
        }

        /* Responsive */
        @media(max-width: 900px) {
          .ln-links { display: none; }
          .ln-login { display: none; }
          .ln-cta { display: none; }
          .ln-burger { display: flex; }
        }

        /* Overlay backdrop */
        .ln-backdrop {
          position: fixed; inset: 0; z-index: 98;
          background: rgba(0,0,0,.4);
          backdrop-filter: blur(4px);
        }
      `}</style>

      <nav className={`ln-root${scrolled ? " scrolled" : ""}`}>
        <div className="ln-bar">
          {/* Logo */}
          <a href="/" className="ln-logo">
            TUTTO<span style={{ color: ORANGE }}>EVENTO</span>
          </a>

          {/* Link centrali — solo desktop */}
          <div className="ln-links">
            {links.map(([href, label]) => (
              <a key={href} href={href} className="ln-link">{label}</a>
            ))}
          </div>

          {/* Destra — desktop */}
          <div className="ln-right">
            <a href="/login" className="ln-login">Accedi</a>
            <a href={ctaHref} className="ln-cta">{ctaLabel}</a>
          </div>

          {/* Hamburger — mobile */}
          <button
            className={`ln-burger${open ? " open" : ""}`}
            onClick={() => setOpen(p => !p)}
            aria-label="Menu"
          >
            <span className="ln-burger-line" />
            <span className="ln-burger-line" />
            <span className="ln-burger-line" />
          </button>
        </div>
      </nav>

      {/* Dropdown mobile */}
      {open && (
        <>
          <div className="ln-backdrop" onClick={() => setOpen(false)} />
          <div className="ln-dropdown">
            {links.map(([href, label]) => (
              <a key={href} href={href} className="ln-drop-link" onClick={handleLink}>{label}</a>
            ))}
            <div className="ln-drop-divider" />
            <a href={ctaHref} className="ln-drop-cta" onClick={handleLink}>{ctaLabel}</a>
            <a href="/login" className="ln-drop-login" onClick={handleLink}>Hai già un account? Accedi →</a>
          </div>
        </>
      )}
    </>
  );
}