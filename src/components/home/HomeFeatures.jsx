"use client";
import { useEffect, useRef } from "react";

const FEATURES = [
  { icon: "🛒", title: "Marketplace artisti", desc: "Roster di artisti verificati filtrabili per genere, città e budget. Solo richieste qualificate.", tag: "Per i locali", color: "#ff5a00" },
  { icon: "💬", title: "Chat in tempo reale", desc: "Messaggistica istantanea tra artisti, locali e il team TuttoEvento. Notifiche push immediati.", tag: "Per tutti", color: "#3b82f6" },
  { icon: "📅", title: "Gestione booking", desc: "Crea eventi, invia richieste, accetta o rifiuta. Il calendario si aggiorna in automatico.", tag: "Per tutti", color: "#16a34a" },
  { icon: "📊", title: "CRM e analitiche", desc: "Storico completo, estratto conto e analisi delle performance. I tuoi dati sempre a portata.", tag: "Per tutti", color: "#8b5cf6" },
  { icon: "🔔", title: "Notifiche push native", desc: "Ogni booking, messaggio o richiesta arriva sul telefono come una vera app nativa.", tag: "Mobile first", color: "#d97706" },
  { icon: "🎯", title: "Pipeline CRM", desc: "Il team TuttoEvento gestisce ogni trattativa con strumenti professionali. Zero richieste perse.", tag: "Team interno", color: "#14b8a6" },
];

export default function HomeFeatures() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll(".hf-card");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    cards.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .hf-root { background:#0a0a0b; padding:100px 20px; overflow:hidden; }
        .hf-inner { max-width:1100px; margin:0 auto; }
        .hf-label { text-align:center; font-size:.75rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:12px; display:block; }
        .hf-title { text-align:center; font-family:'Sora',sans-serif; font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff; letter-spacing:-.04em; margin-bottom:12px; line-height:1.1; }
        .hf-sub { text-align:center; color:rgba(255,255,255,.5); font-size:1rem; max-width:480px; margin:0 auto 56px; line-height:1.7; font-family:'Manrope',sans-serif; }
        .hf-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .hf-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:24px; padding:28px 26px; opacity:0; transform:translateY(24px); transition:opacity .6s cubic-bezier(.4,0,.2,1), transform .6s cubic-bezier(.4,0,.2,1), background .2s, border-color .2s; }
        .hf-card.visible { opacity:1; transform:translateY(0); }
        .hf-card:nth-child(1){transition-delay:.05s}
        .hf-card:nth-child(2){transition-delay:.12s}
        .hf-card:nth-child(3){transition-delay:.19s}
        .hf-card:nth-child(4){transition-delay:.26s}
        .hf-card:nth-child(5){transition-delay:.33s}
        .hf-card:nth-child(6){transition-delay:.40s}
        .hf-card:hover { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.14); transform:translateY(-4px) !important; }
        .hf-icon { width:50px; height:50px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; margin-bottom:14px; }
        .hf-tag { display:inline-block; font-size:.7rem; font-weight:700; padding:3px 10px; border-radius:100px; margin-bottom:10px; letter-spacing:.05em; font-family:'Manrope',sans-serif; }
        .hf-title-card { font-size:1rem; font-weight:800; color:#fff; margin-bottom:8px; font-family:'Sora',sans-serif; }
        .hf-desc { font-size:.875rem; color:rgba(255,255,255,.45); line-height:1.6; font-family:'Manrope',sans-serif; }
        @media(max-width:768px) { .hf-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:480px) { .hf-grid{grid-template-columns:1fr} }
      `}</style>
      <section className="hf-root" id="features" ref={ref}>
        <div className="hf-inner">
          <span className="hf-label te-reveal">Funzionalità</span>
          <h2 className="hf-title te-reveal">Tutto quello che ti serve.</h2>
          <p className="hf-sub te-reveal">Costruito per il mondo degli eventi dal vivo. Non uno strumento generico.</p>
          <div className="hf-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="hf-card">
                <div className="hf-icon" style={{ background:`${f.color}18`, border:`1px solid ${f.color}30` }}>{f.icon}</div>
                <span className="hf-tag" style={{ background:`${f.color}15`, color:f.color }}>{f.tag}</span>
                <p className="hf-title-card">{f.title}</p>
                <p className="hf-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}