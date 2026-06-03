"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "La piattaforma", href: "#features" },
  { label: "Artisti", href: "#marketplace" },
  { label: "Come funziona", href: "#how" },
  { label: "FAQ", href: "#faq" },
  { label: "Chi siamo", href: "/chi-siamo" },
];

export default function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        .hn-root { position:fixed; top:0; left:0; right:0; z-index:100; transition:all .3s; }
        .hn-root.scrolled { background:rgba(10,10,11,.85); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,.06); }
        .hn-inner { max-width:1200px; margin:0 auto; padding:0 20px; height:64px; display:flex; align-items:center; justify-content:space-between; }
        .hn-logo { font-family:'Sora',sans-serif; font-weight:800; font-size:1.1rem; letter-spacing:-.03em; text-decoration:none; color:#fff; }
        .hn-logo span { color:#ff5a00; }
        .hn-links { display:flex; align-items:center; gap:28px; }
        .hn-links a { color:rgba(255,255,255,.7); font-size:.875rem; font-weight:600; text-decoration:none; transition:color .2s; }
        .hn-links a:hover { color:#fff; }
        .hn-cta { display:flex; gap:10px; align-items:center; }
        .hn-btn-ghost { color:rgba(255,255,255,.8); font-size:.875rem; font-weight:700; text-decoration:none; padding:8px 16px; border-radius:100px; border:1px solid rgba(255,255,255,.15); transition:all .2s; }
        .hn-btn-ghost:hover { border-color:rgba(255,255,255,.4); color:#fff; }
        .hn-btn-primary { background:#ff5a00; color:#fff; font-size:.875rem; font-weight:700; text-decoration:none; padding:9px 20px; border-radius:100px; transition:all .2s; }
        .hn-btn-primary:hover { background:#e85100; transform:scale(1.02); }
        .hn-hamburger { display:none; background:none; border:none; cursor:pointer; padding:8px; }
        .hn-hamburger span { display:block; width:22px; height:2px; background:#fff; margin:4px 0; border-radius:2px; transition:all .3s; }
        @media(max-width:768px) {
          .hn-links, .hn-cta { display:none; }
          .hn-hamburger { display:block; }
        }
        .hn-mobile { position:fixed; inset:0; background:#0a0a0b; z-index:99; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:32px; transform:translateY(-100%); transition:transform .4s cubic-bezier(.4,0,.2,1); }
        .hn-mobile.open { transform:translateY(0); }
        .hn-mobile a { color:#fff; font-size:1.5rem; font-weight:800; text-decoration:none; font-family:'Sora',sans-serif; }
        .hn-mobile-close { position:absolute; top:20px; right:20px; background:none; border:none; color:#fff; font-size:2rem; cursor:pointer; }
      `}</style>
      <nav className={`hn-root${scrolled ? " scrolled" : ""}`}>
        <div className="hn-inner">
          <Link href="/" className="hn-logo">TUTTO<span>EVENTO</span></Link>
          <div className="hn-links">
            {NAV_LINKS.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
          </div>
          <div className="hn-cta">
            <Link href="/login" className="hn-btn-ghost">Accedi</Link>
            <Link href="/register" className="hn-btn-primary">Inizia gratis</Link>
          </div>
          <button className="hn-hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </nav>
      <div className={`hn-mobile${menuOpen ? " open" : ""}`}>
        <button className="hn-mobile-close" onClick={() => setMenuOpen(false)}>×</button>
        {NAV_LINKS.map(l => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>)}
        <Link href="/login" style={{color:"rgba(255,255,255,.6)",fontSize:"1rem"}} onClick={() => setMenuOpen(false)}>Accedi</Link>
        <Link href="/register" className="hn-btn-primary" onClick={() => setMenuOpen(false)}>Inizia gratis →</Link>
      </div>
    </>
  );
}