"use client";
import { useState } from "react";
import Link from "next/link";

const FLOWS = {
  artist: {
    color: "#ff5a00",
    steps: [
      { n: "01", icon: "📝", title: "Crea il profilo", desc: "Registrati come artista, inserisci bio, generi, cachet netto e disponibilità. Carica foto e link social." },
      { n: "02", icon: "⏳", title: "Il team approva", desc: "TuttoEvento verifica il tuo profilo e imposta il prezzo pubblico. Vieni pubblicato nel marketplace." },
      { n: "03", icon: "📬", title: "Ricevi richieste", desc: "I locali ti scoprono nel marketplace e inviano richieste di contatto. Ricevi notifiche in tempo reale." },
      { n: "04", icon: "🤝", title: "Confermi il booking", desc: "Accetti o rifiuti dal tuo pannello. Il calendario si aggiorna, la chat si apre automaticamente." },
    ],
    cta: "Crea il tuo profilo",
    href: "/register?role=artist",
  },
  venue: {
    color: "#3b82f6",
    steps: [
      { n: "01", icon: "🏛️", title: "Registra il locale", desc: "Crea il profilo del tuo locale con tipologia, capienza, città e budget per evento." },
      { n: "02", icon: "🔍", title: "Esplora il marketplace", desc: "Filtra gli artisti per genere, città e fascia di budget. Tutti verificati, nessun prezzo esposto." },
      { n: "03", icon: "📬", title: "Richiedi contatto", desc: "Indica data, tipo evento e budget riservato. Il team TuttoEvento gestisce la trattativa per te." },
      { n: "04", icon: "🎉", title: "Serata confermata", desc: "L'artista è confermato, tutto è organizzato. Tu pensi solo alla serata." },
    ],
    cta: "Registra il tuo locale",
    href: "/register?role=organizer",
  },
  promoter: {
    color: "#8b5cf6",
    steps: [
      { n: "01", icon: "📣", title: "Crea il tuo account", desc: "Registrati come promoter e accedi alla tua dashboard operativa." },
      { n: "02", icon: "🎯", title: "Costruisci il portfolio", desc: "Aggiungi artisti e locali al tuo roster. Diventi il punto di riferimento per le trattative." },
      { n: "03", icon: "🔔", title: "Ricevi notifiche mirate", desc: "Vieni avvisato solo per le richieste che coinvolgono il tuo portfolio." },
      { n: "04", icon: "💰", title: "Monitora le commissioni", desc: "Storico completo dei booking confermati e delle tue commissioni." },
    ],
    cta: "Inizia come promoter",
    href: "/register?role=promoter",
  },
};

const TABS = [
  { id: "artist", label: "🎤 Artista" },
  { id: "venue", label: "🏛️ Locale" },
  { id: "promoter", label: "📣 Promoter" },
];

export default function HomeHowItWorks() {
  const [active, setActive] = useState("artist");
  const flow = FLOWS[active];

  return (
    <>
      <style>{`
        .hhw-root { background:#080808; padding:100px 20px; }
        .hhw-inner { max-width:1100px; margin:0 auto; }
        .hhw-label { text-align:center; font-size:.75rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:12px; }
        .hhw-title { text-align:center; font-family:'Sora',sans-serif; font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff; letter-spacing:-.04em; margin-bottom:48px; }
        .hhw-tabs { display:flex; justify-content:center; gap:8px; margin-bottom:56px; flex-wrap:wrap; }
        .hhw-tab { padding:10px 24px; border-radius:100px; border:1px solid rgba(255,255,255,.1); background:transparent; color:rgba(255,255,255,.5); font-size:.9rem; font-weight:700; cursor:pointer; transition:all .2s; font-family:'Manrope',sans-serif; }
        .hhw-tab.active { color:#fff; }
        .hhw-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:0; position:relative; }
        .hhw-step { position:relative; padding:32px 24px; }
        .hhw-step:not(:last-child)::after { content:''; position:absolute; top:48px; right:0; width:1px; height:40%; background:linear-gradient(transparent,rgba(255,255,255,.1),transparent); }
        .hhw-num { font-family:'Sora',sans-serif; font-size:3.5rem; font-weight:900; opacity:.08; color:#fff; margin-bottom:16px; line-height:1; }
        .hhw-icon { font-size:2rem; margin-bottom:12px; }
        .hhw-step-title { font-size:1.05rem; font-weight:800; color:#fff; margin-bottom:8px; font-family:'Sora',sans-serif; }
        .hhw-step-desc { font-size:.85rem; color:rgba(255,255,255,.45); line-height:1.6; }
        .hhw-cta-wrap { text-align:center; margin-top:56px; }
        .hhw-cta { display:inline-block; padding:14px 32px; border-radius:100px; color:#fff; font-weight:800; font-size:1rem; text-decoration:none; transition:all .25s; }
        .hhw-cta:hover { transform:translateY(-2px) scale(1.02); }
        @media(max-width:900px) { .hhw-steps{grid-template-columns:repeat(2,1fr)} .hhw-step::after{display:none} }
        @media(max-width:560px) { .hhw-steps{grid-template-columns:1fr} }
      `}</style>
      <section className="hhw-root" id="how">
        <div className="hhw-inner">
          <p className="hhw-label">Come funziona</p>
          <h2 className="hhw-title">Da zero a booking<br/>in 4 passi.</h2>
          <div className="hhw-tabs">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)}
                className={`hhw-tab${active === t.id ? " active" : ""}`}
                style={active === t.id ? { background: FLOWS[t.id].color + "20", borderColor: FLOWS[t.id].color + "60" } : {}}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="hhw-steps">
            {flow.steps.map((s, i) => (
              <div key={i} className="hhw-step">
                <p className="hhw-num">{s.n}</p>
                <p className="hhw-icon">{s.icon}</p>
                <p className="hhw-step-title">{s.title}</p>
                <p className="hhw-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="hhw-cta-wrap">
            <Link href={flow.href} className="hhw-cta"
              style={{ background: flow.color, boxShadow: `0 16px 40px ${flow.color}40` }}>
              {flow.cta} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}