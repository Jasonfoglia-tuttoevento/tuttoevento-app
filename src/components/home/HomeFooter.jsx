"use client";
import Link from "next/link";

const SOCIAL = [
  { icon: "instagram", href: "https://instagram.com/tuttoevento", label: "Instagram" },
  { icon: "tiktok", href: "https://tiktok.com/@tuttoevento", label: "TikTok" },
  { icon: "linkedin", href: "https://linkedin.com/company/tuttoevento", label: "LinkedIn" },
];

const LINKS = {
  "Piattaforma": [
    { label: "Come funziona", href: "#how" },
    { label: "Marketplace artisti", href: "#marketplace" },
    { label: "Funzionalità", href: "#features" },
    { label: "Prezzi", href: "#pricing" },
  ],
  "Risorse": [
    { label: "Chi siamo", href: "/chi-siamo" },
    { label: "FAQ", href: "#faq" },
    { label: "Blog", href: "#" },
    { label: "Contatti", href: "mailto:info@tuttoevento.it" },
  ],
  "Legale": [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "Termini Artisti", href: "/termini/artisti" },
    { label: "Termini Locali", href: "/termini/locali" },
  ],
};

function SocialIcon({ icon }) {
  const icons = {
    instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    tiktok: <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.53V6.76a4.85 4.85 0 01-1-.07z"/></svg>,
    linkedin: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  };
  return icons[icon] || null;
}

export default function HomeFooter() {
  return (
    <>
      <style>{`
        .hft-root { background:#080808; border-top:1px solid rgba(255,255,255,.06); padding:64px 20px 32px; }
        .hft-inner { max-width:1200px; margin:0 auto; }
        .hft-top { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; margin-bottom:56px; }
        .hft-brand-logo { font-family:'Sora',sans-serif; font-weight:900; font-size:1.3rem; letter-spacing:-.04em; color:#fff; text-decoration:none; display:inline-block; margin-bottom:14px; }
        .hft-brand-logo span { color:#ff5a00; }
        .hft-brand-desc { color:rgba(255,255,255,.4); font-size:.875rem; line-height:1.7; max-width:280px; margin-bottom:20px; }
        .hft-social { display:flex; gap:10px; }
        .hft-social-btn { width:38px; height:38px; border-radius:12px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.5); text-decoration:none; transition:all .2s; }
        .hft-social-btn:hover { background:rgba(255,90,0,.15); border-color:rgba(255,90,0,.3); color:#ff5a00; }
        .hft-col-title { font-size:.8rem; font-weight:800; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:.15em; margin-bottom:16px; }
        .hft-col a { display:block; color:rgba(255,255,255,.5); font-size:.875rem; text-decoration:none; margin-bottom:10px; transition:color .2s; }
        .hft-col a:hover { color:#fff; }
        .hft-bottom { border-top:1px solid rgba(255,255,255,.06); padding-top:28px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
        .hft-copy { color:rgba(255,255,255,.3); font-size:.8rem; }
        .hft-copy span { color:#ff5a00; }
        .hft-bottom-links { display:flex; gap:20px; }
        .hft-bottom-links a { color:rgba(255,255,255,.3); font-size:.8rem; text-decoration:none; transition:color .2s; }
        .hft-bottom-links a:hover { color:#fff; }
        @media(max-width:900px) { .hft-top{grid-template-columns:1fr 1fr;gap:32px} }
        @media(max-width:560px) { .hft-top{grid-template-columns:1fr} .hft-bottom{flex-direction:column;text-align:center} }
      `}</style>
      <footer className="hft-root">
        <div className="hft-inner">
          <div className="hft-top">
            <div>
              <Link href="/" className="hft-brand-logo">TUTTO<span>EVENTO</span></Link>
              <p className="hft-brand-desc">Il marketplace italiano per artisti, locali e promoter. Booking semplice, chat realtime, CRM completo.</p>
              <div className="hft-social">
                {SOCIAL.map(s => (
                  <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" className="hft-social-btn" aria-label={s.label}>
                    <SocialIcon icon={s.icon} />
                  </a>
                ))}
              </div>
            </div>
            {Object.entries(LINKS).map(([title, links]) => (
              <div key={title} className="hft-col">
                <p className="hft-col-title">{title}</p>
                {links.map(l => <Link key={l.label} href={l.href}>{l.label}</Link>)}
              </div>
            ))}
          </div>
          <div className="hft-bottom">
            <p className="hft-copy">© 2026 <span>TuttoEvento</span>. Tutti i diritti riservati. Made with ❤️ in Italy.</p>
            <div className="hft-bottom-links">
              <Link href="/privacy">Privacy</Link>
              <Link href="/cookie-policy">Cookie</Link>
              <a href="mailto:info@tuttoevento.it">info@tuttoevento.it</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}