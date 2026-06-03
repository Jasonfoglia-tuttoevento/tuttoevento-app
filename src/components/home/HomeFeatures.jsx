"use client";
import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: "🛒",
    title: "Marketplace artisti",
    desc: "Un roster di artisti verificati, filtrabili per genere, città e fascia di budget. Nessun prezzo esposto: solo richieste qualificate.",
    tag: "Per i locali",
    color: "#ff5a00",
  },
  {
    icon: "💬",
    title: "Chat in tempo reale",
    desc: "Messaggistica istantanea tra artisti, locali e il team TuttoEvento. Notifiche push su tutti i dispositivi.",
    tag: "Per tutti",
    color: "#3b82f6",
  },
  {
    icon: "📅",
    title: "Gestione booking",
    desc: "Crea eventi, invia richieste, gestisci accettazioni e rifiuti. Il calendario si aggiorna in automatico.",
    tag: "Per tutti",
    color: "#16a34a",
  },
  {
    icon: "📊",
    title: "CRM e analitiche",
    desc: "Storico completo, estratto conto, analisi delle performance. I tuoi dati sempre a portata di mano.",
    tag: "Per tutti",
    color: "#8b5cf6",
  },
  {
    icon: "🔔",
    title: "Notifiche push native",
    desc: "Ogni booking, messaggio o richiesta ti arriva direttamente sul telefono come una vera app.",
    tag: "Mobile first",
    color: "#d97706",
  },
  {
    icon: "🏛️",
    title: "Media kit digitale",
    desc: "Artisti e locali hanno una pagina professionale sempre aggiornata. Zero PDF, zero email.",
    tag: "Branding",
    color: "#ec4899",
  },
  {
    icon: "🎯",
    title: "Pipeline CRM",
    desc: "Il team TuttoEvento gestisce ogni trattativa con strumenti professionali. Nessuna richiesta si perde.",
    tag: "Team interno",
    color: "#14b8a6",
  },
  {
    icon: "📱",
    title: "PWA installabile",
    desc: "Installa TuttoEvento sul tuo telefono come una vera app. Funziona anche offline.",
    tag: "Mobile",
    color: "#f97316",
  },
];

function FeatureCard({ f, delay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="hf-card" style={{ transitionDelay: `${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}>
      <div className="hf-icon" style={{ background: f.color + "18", border: `1px solid ${f.color}30` }}>
        <span>{f.icon}</span>
      </div>
      <span className="hf-tag" style={{ background: f.color + "15", color: f.color }}>{f.tag}</span>
      <h3 className="hf-title">{f.title}</h3>
      <p className="hf-desc">{f.desc}</p>
    </div>
  );
}

export default function HomeFeatures() {
  return (
    <>
      <style>{`
        .hf-root { background:#0a0a0b; padding:100px 20px; }
        .hf-inner { max-width:1200px; margin:0 auto; }
        .hf-label { text-align:center; font-size:.75rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:12px; }
        .hf-title-main { text-align:center; font-family:'Sora',sans-serif; font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff; letter-spacing:-.04em; margin-bottom:16px; line-height:1.1; }
        .hf-sub-main { text-align:center; color:rgba(255,255,255,.5); font-size:1rem; max-width:520px; margin:0 auto 64px; line-height:1.7; }
        .hf-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .hf-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:24px; padding:28px; transition:all .6s cubic-bezier(.4,0,.2,1); }
        .hf-card:hover { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.15); transform:translateY(-4px); }
        .hf-icon { width:52px; height:52px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin-bottom:14px; }
        .hf-tag { display:inline-block; font-size:.7rem; font-weight:700; padding:3px 10px; border-radius:100px; margin-bottom:10px; letter-spacing:.06em; }
        .hf-title { font-size:1rem; font-weight:800; color:#fff; margin-bottom:8px; font-family:'Sora',sans-serif; }
        .hf-desc { font-size:.85rem; color:rgba(255,255,255,.45); line-height:1.6; }
        @media(max-width:1024px) { .hf-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:600px) { .hf-grid{grid-template-columns:1fr} }
      `}</style>
      <section className="hf-root" id="features">
        <div className="hf-inner">
          <p className="hf-label">Funzionalità</p>
          <h2 className="hf-title-main">Tutto quello che ti serve.<br/>Niente di più.</h2>
          <p className="hf-sub-main">Costruito per il mondo degli eventi dal vivo. Non uno strumento generico.</p>
          <div className="hf-grid">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} delay={i * 60} />)}
          </div>
        </div>
      </section>
    </>
  );
}