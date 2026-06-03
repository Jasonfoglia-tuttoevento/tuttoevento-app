"use client";

import Link from "next/link";

const TEAM = [
  { name: "Jason Foglia", role: "Founder & CEO", desc: "Visionario dietro TuttoEvento. Appassionato di musica dal vivo e tecnologia.", emoji: "🚀" },
  { name: "Team TuttoEvento", role: "Operations", desc: "Gestiamo ogni trattativa, verifichiamo gli artisti e supportiamo locali e promoter.", emoji: "🎯" },
];

const VALUES = [
  { icon: "🎵", title: "Musica prima di tutto", desc: "Siamo appassionati di eventi dal vivo. Costruiamo strumenti che amiamo usare noi stessi." },
  { icon: "🤝", title: "Relazioni reali", desc: "Non siamo solo una piattaforma. Gestiamo ogni trattativa con cura e attenzione." },
  { icon: "🔒", title: "Trasparenza", desc: "Nessuna commissione nascosta. Il modello è chiaro: noi gestiamo, tu ti esibisci." },
  { icon: "🇮🇹", title: "Made in Italy", desc: "Costruito da italiani per il mercato italiano. Supporto in italiano, sempre." },
];

export default function ChiSiamoPage() {
  const s = {
    root: { minHeight: "100vh", background: "#0a0a0b", fontFamily: "'Manrope',system-ui,sans-serif", color: "#fff" },
    header: { position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,11,.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-.04em", color: "#fff", textDecoration: "none" },
    nav: { display: "flex", gap: 20, alignItems: "center" },
    navLink: { fontSize: ".875rem", fontWeight: 700, color: "rgba(255,255,255,.6)", textDecoration: "none" },
    navBtn: { background: "#ff5a00", color: "#fff", padding: "8px 18px", borderRadius: 100, fontWeight: 700, fontSize: ".875rem", textDecoration: "none" },
    hero: { maxWidth: 1100, margin: "0 auto", padding: "100px 24px 60px", textAlign: "center" },
    heroLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".2em", color: "#ff5a00", marginBottom: 16, display: "block" },
    heroTitle: { fontFamily: "'Sora',sans-serif", fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.05, marginBottom: 20 },
    heroSub: { color: "rgba(255,255,255,.55)", fontSize: "1.15rem", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 40px" },
    section: { maxWidth: 1100, margin: "0 auto", padding: "60px 24px" },
    sectionLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".2em", color: "#ff5a00", marginBottom: 12, display: "block" },
    sectionTitle: { fontFamily: "'Sora',sans-serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-.04em", marginBottom: 16, lineHeight: 1.1 },
    sectionSub: { color: "rgba(255,255,255,.5)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 560, marginBottom: 48 },
    grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 },
    card: { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 24, padding: "28px" },
    valIcon: { fontSize: "1.8rem", marginBottom: 12 },
    valTitle: { fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1rem", marginBottom: 8 },
    valDesc: { color: "rgba(255,255,255,.5)", fontSize: ".875rem", lineHeight: 1.6 },
    teamCard: { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 24, padding: "28px", display: "flex", gap: 20, alignItems: "flex-start" },
    teamEmoji: { fontSize: "2.5rem", width: 60, height: 60, background: "rgba(255,90,0,.15)", border: "1px solid rgba(255,90,0,.25)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    teamName: { fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1rem", marginBottom: 2 },
    teamRole: { fontSize: ".78rem", fontWeight: 700, color: "#ff5a00", marginBottom: 8 },
    teamDesc: { color: "rgba(255,255,255,.5)", fontSize: ".875rem", lineHeight: 1.6 },
    cta: { background: "linear-gradient(135deg,rgba(255,90,0,.15),rgba(255,90,0,.05))", border: "1px solid rgba(255,90,0,.2)", borderRadius: 32, padding: "64px 40px", textAlign: "center", margin: "0 24px 80px" },
    ctaTitle: { fontFamily: "'Sora',sans-serif", fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-.04em", marginBottom: 16, lineHeight: 1.1 },
    ctaSub: { color: "rgba(255,255,255,.5)", fontSize: "1rem", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" },
    ctaRow: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
    ctaPrimary: { background: "#ff5a00", color: "#fff", padding: "13px 28px", borderRadius: 100, fontWeight: 800, fontSize: ".95rem", textDecoration: "none" },
    ctaGhost: { background: "rgba(255,255,255,.07)", color: "#fff", border: "1px solid rgba(255,255,255,.15)", padding: "13px 28px", borderRadius: 100, fontWeight: 700, fontSize: ".95rem", textDecoration: "none" },
    footer: { borderTop: "1px solid rgba(255,255,255,.06)", padding: "24px", textAlign: "center" },
    footerText: { color: "rgba(255,255,255,.3)", fontSize: ".8rem" },
    sep: { borderTop: "1px solid rgba(255,255,255,.06)", margin: "0 24px" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=Manrope:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes chiFloat { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-20px)} }
      `}</style>
      <div style={s.root}>
        {/* HEADER */}
        <header style={s.header}>
          <Link href="/" style={s.logo}>TUTTO<span style={{ color: "#ff5a00" }}>EVENTO</span></Link>
          <div style={s.nav}>
            <Link href="/#faq" style={s.navLink}>FAQ</Link>
            <Link href="/login" style={s.navLink}>Accedi</Link>
            <Link href="/register" style={s.navBtn}>Inizia gratis</Link>
          </div>
        </header>

        {/* HERO */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -150, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,90,0,.3),transparent 70%)", filter: "blur(80px)", animation: "chiFloat 8s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={s.hero}>
            <span style={s.heroLabel}>Chi siamo</span>
            <h1 style={s.heroTitle}>Siamo TuttoEvento.<br/><span style={{ color: "#ff5a00" }}>La musica dal vivo</span><br/>è il nostro mestiere.</h1>
            <p style={s.heroSub}>Nati dalla passione per la musica e dalla frustrazione di un mercato caotico. Costruiamo strumenti che semplificano la vita di artisti, locali e promoter italiani.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{ background: "#ff5a00", color: "#fff", padding: "13px 28px", borderRadius: 100, fontWeight: 800, fontSize: ".95rem", textDecoration: "none" }}>
                Inizia gratis →
              </Link>
              <a href="mailto:info@tuttoevento.it" style={{ background: "rgba(255,255,255,.07)", color: "#fff", border: "1px solid rgba(255,255,255,.15)", padding: "13px 28px", borderRadius: 100, fontWeight: 700, fontSize: ".95rem", textDecoration: "none" }}>
                Contattaci
              </a>
            </div>
          </div>
        </div>

        <div style={s.sep} />

        {/* MISSION */}
        <div style={s.section}>
          <span style={s.sectionLabel}>La nostra missione</span>
          <h2 style={s.sectionTitle}>Connettere l'industria<br/>musicale italiana.</h2>
          <p style={{ ...s.sectionSub, marginBottom: 0 }}>
            Ogni anno migliaia di eventi saltano perché artisti e locali non si trovano, o perché le trattative sono caotiche e dispersive. TuttoEvento nasce per risolvere questo problema: un'unica piattaforma dove tutto avviene in modo ordinato, professionale e trasparente.
          </p>
        </div>

        <div style={s.sep} />

        {/* VALORI */}
        <div style={s.section}>
          <span style={s.sectionLabel}>I nostri valori</span>
          <h2 style={s.sectionTitle}>Cosa ci guida.</h2>
          <div style={s.grid2}>
            {VALUES.map(v => (
              <div key={v.title} style={s.card}>
                <div style={s.valIcon}>{v.icon}</div>
                <p style={s.valTitle}>{v.title}</p>
                <p style={s.valDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={s.sep} />

        {/* TEAM */}
        <div style={s.section}>
          <span style={s.sectionLabel}>Il team</span>
          <h2 style={s.sectionTitle}>Le persone dietro TuttoEvento.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {TEAM.map(t => (
              <div key={t.name} style={s.teamCard}>
                <div style={s.teamEmoji}>{t.emoji}</div>
                <div>
                  <p style={s.teamName}>{t.name}</p>
                  <p style={s.teamRole}>{t.role}</p>
                  <p style={s.teamDesc}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.sep} />

        {/* NUMERI */}
        <div style={s.section}>
          <span style={s.sectionLabel}>TuttoEvento in numeri</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 2, background: "rgba(255,255,255,.06)", borderRadius: 24, overflow: "hidden" }}>
            {[["100%","Gratuito per iniziare"],["3","Categorie coperte"],["48h","Risposta garantita"],["🇮🇹","Made in Italy"]].map(([val, label]) => (
              <div key={label} style={{ background: "#0a0a0b", padding: "36px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "2.5rem", fontWeight: 900, color: "#ff5a00", letterSpacing: "-.04em", lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: ".8rem", fontWeight: 700, color: "rgba(255,255,255,.5)", marginTop: 8 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
          <div style={s.cta}>
            <h2 style={s.ctaTitle}>Unisciti a TuttoEvento.<br/><span style={{ color: "#ff5a00" }}>Gratis, sempre.</span></h2>
            <p style={s.ctaSub}>Registrati in 2 minuti. Nessuna carta richiesta.</p>
            <div style={s.ctaRow}>
              <Link href="/register?role=artist" style={s.ctaPrimary}>🎤 Sono un artista</Link>
              <Link href="/register?role=organizer" style={s.ctaGhost}>🏛️ Sono un locale</Link>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={s.footer}>
          <p style={s.footerText}>© 2026 TuttoEvento · <a href="mailto:info@tuttoevento.it" style={{ color: "#ff5a00", textDecoration: "none" }}>info@tuttoevento.it</a> · <Link href="/privacy" style={{ color: "rgba(255,255,255,.3)", textDecoration: "none" }}>Privacy</Link></p>
        </footer>
      </div>
    </>
  );
}