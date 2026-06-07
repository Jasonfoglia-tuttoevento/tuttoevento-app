"use client";
import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "artist",
    icon: "🎤",
    label: "Artisti",
    headline: "Fatti trovare dai locali giusti.",
    sub: "Pubblica il tuo profilo, mostra la tua musica e ricevi richieste di booking direttamente sul tuo pannello. Zero email, zero chaos.",
    color: "#ff5a00",
    features: [
      { icon: "👤", title: "Profilo professionale", desc: "Media kit digitale con bio, foto, generi, cachet e disponibilità." },
      { icon: "📅", title: "Calendario disponibilità", desc: "Gestisci le tue date libere e bloccate in tempo reale." },
      { icon: "💬", title: "Chat diretta", desc: "Comunica con i locali senza intermediari, in modo sicuro." },
      { icon: "📊", title: "Analitiche", desc: "Vedi quante visualizzazioni ha il tuo profilo e quante richieste ricevi." },
      { icon: "🔔", title: "Notifiche push", desc: "Ricevi ogni richiesta di booking in tempo reale sul telefono." },
      { icon: "📋", title: "Estratto conto", desc: "Storico completo di tutti i booking e i pagamenti." },
    ],
    cta: "Crea il tuo profilo gratis",
    href: "/register?role=artist",
    img: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&w=800&q=70",
    badge: "Profilo artista",
  },
  {
    id: "venue",
    icon: "🏛️",
    label: "Locali",
    headline: "Trova l'artista perfetto per ogni serata.",
    sub: "Sfoglia il roster di artisti verificati, richiedi un contatto riservato e lascia che il nostro team gestisca tutto.",
    color: "#3b82f6",
    features: [
      { icon: "🔍", title: "Marketplace artisti", desc: "Filtra per genere, città e fascia di budget. Solo artisti verificati." },
      { icon: "📬", title: "Richiesta contatto", desc: "Indica data, tipo evento e budget. Il team TuttoEvento ti risponde." },
      { icon: "📅", title: "Gestione eventi", desc: "Crea e monitora tutti i tuoi eventi in un unico pannello." },
      { icon: "📊", title: "Analitiche avanzate", desc: "ROI degli eventi, artisti più performanti, trend stagionali." },
      { icon: "💬", title: "Chat integrata", desc: "Comunicazione diretta con artisti e con il team TuttoEvento." },
      { icon: "🏛️", title: "Media kit locale", desc: "Presenta il tuo locale agli artisti con tutti i dettagli." },
    ],
    cta: "Registra il tuo locale",
    href: "/register?role=organizer",
    img: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=70",
    badge: "Locale verificato",
  },
  {
    id: "promoter",
    icon: "📣",
    label: "Promoter",
    headline: "Il tuo portfolio. La tua rete. Il tuo business.",
    sub: "Gestisci artisti e locali nel tuo roster, monitora i booking che ti coinvolgono e guadagna commissioni su ogni serata confermata.",
    color: "#8b5cf6",
    features: [
      { icon: "🎯", title: "Portfolio artisti e locali", desc: "Aggiungi al tuo roster sia artisti che locali partner." },
      { icon: "💰", title: "Commissioni automatiche", desc: "Ricevi il 50% del margine TuttoEvento su ogni booking confermato." },
      { icon: "📬", title: "Notifiche rilevanti", desc: "Ricevi avvisi solo per le trattative del tuo portfolio." },
      { icon: "📊", title: "Dashboard operativa", desc: "Panoramica completa di eventi, booking e performance." },
      { icon: "💬", title: "Chat multi-parte", desc: "Coordinati con artisti, locali e il team TuttoEvento." },
      { icon: "🔗", title: "Link referral", desc: "Invita i tuoi artisti con un link personalizzato." },
    ],
    cta: "Inizia come promoter",
    href: "/register?role=promoter",
    img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=70",
    badge: "Promoter certificato",
  },
];

export default function HomeForWho() {
  const [active, setActive] = useState("artist");
  const cat = CATEGORIES.find(c => c.id === active);

  return (
    <>
      <style>{`
        .hfw-root { background:#0a0a0b; padding:80px 20px; }
        .hfw-inner { max-width:1100px; margin:0 auto; }
        .hfw-label { text-align:center; font-size:.72rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:10px; font-family:'Manrope',sans-serif; }
        .hfw-title { text-align:center; font-family:'Sora',sans-serif; font-size:clamp(1.9rem,5vw,3.2rem); font-weight:900; color:#fff; letter-spacing:-.04em; margin-bottom:14px; line-height:1.1; }
        .hfw-sub { text-align:center; color:rgba(255,255,255,.5); font-size:1rem; max-width:520px; margin:0 auto 40px; line-height:1.7; font-family:'Manrope',sans-serif; }

        /* Tab pills */
        .hfw-tabs { display:flex; justify-content:center; gap:8px; margin-bottom:48px; flex-wrap:wrap; }
        .hfw-tab { display:flex; align-items:center; gap:7px; padding:9px 22px; border-radius:100px; border:1px solid rgba(255,255,255,.1); background:transparent; color:rgba(255,255,255,.5); font-size:.875rem; font-weight:700; cursor:pointer; transition:all .2s; font-family:'Manrope',sans-serif; }
        .hfw-tab:hover { border-color:rgba(255,255,255,.25); color:#fff; }
        .hfw-tab.active { color:#fff; }

        /* Content grid */
        .hfw-content { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; }
        .hfw-headline { font-family:'Sora',sans-serif; font-size:clamp(1.6rem,3vw,2.4rem); font-weight:900; color:#fff; letter-spacing:-.04em; margin-bottom:16px; line-height:1.1; }
        .hfw-desc { color:rgba(255,255,255,.55); font-size:.95rem; line-height:1.8; margin-bottom:28px; font-family:'Manrope',sans-serif; }

        /* Features grid */
        .hfw-features { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:32px; }
        .hfw-feature { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:12px 14px; transition:border-color .2s; }
        .hfw-feature:hover { border-color:rgba(255,255,255,.14); }
        .hfw-feature-icon { font-size:1.2rem; margin-bottom:5px; }
        .hfw-feature-title { font-size:.82rem; font-weight:700; color:#fff; margin-bottom:3px; font-family:'Manrope',sans-serif; }
        .hfw-feature-desc { font-size:.75rem; color:rgba(255,255,255,.4); line-height:1.5; font-family:'Manrope',sans-serif; }

        /* CTA */
        .hfw-cta { display:inline-block; padding:12px 26px; border-radius:100px; color:#fff; font-weight:800; font-size:.9rem; text-decoration:none; transition:all .2s; font-family:'Manrope',sans-serif; }
        .hfw-cta:hover { transform:translateY(-2px); filter:brightness(1.1); }

        /* Immagine */
        .hfw-img-wrap { position:relative; border-radius:24px; overflow:hidden; aspect-ratio:4/3; }
        .hfw-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
        .hfw-img-wrap:hover img { transform:scale(1.03); }
        .hfw-img-overlay { position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,0,0,.2),transparent); }
        .hfw-img-badge { position:absolute; bottom:16px; left:16px; background:rgba(10,10,11,.85); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:10px 14px; }
        .hfw-img-badge p:first-child { font-size:1rem; font-weight:800; color:#fff; font-family:'Sora',sans-serif; margin:0; }
        .hfw-img-badge p:last-child { font-size:.72rem; color:rgba(255,255,255,.45); margin:2px 0 0; font-family:'Manrope',sans-serif; }

        /* Mobile */
        @media(max-width:860px) {
          .hfw-root { padding:60px 16px; }
          .hfw-content { grid-template-columns:1fr; gap:32px; }
          .hfw-img-wrap { order:-1; aspect-ratio:16/9; }
          .hfw-features { grid-template-columns:1fr 1fr; gap:8px; }
        }
        @media(max-width:480px) {
          .hfw-features { grid-template-columns:1fr; }
          .hfw-tabs { gap:6px; }
          .hfw-tab { padding:8px 16px; font-size:.8rem; }
        }
      `}</style>

      <section className="hfw-root" id="for-who">
        <div className="hfw-inner">
          <p className="hfw-label">Per tutti</p>
          <h2 className="hfw-title">Una piattaforma,<br/>tre universi.</h2>
          <p className="hfw-sub">Che tu sia un artista, un locale o un promoter, TuttoEvento ha quello che ti serve.</p>

          <div className="hfw-tabs">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActive(c.id)}
                className={`hfw-tab${active === c.id ? " active" : ""}`}
                style={active === c.id ? { background:`${c.color}20`, borderColor:`${c.color}60`, color:"#fff" } : {}}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          <div className="hfw-content">
            <div>
              <h3 className="hfw-headline">{cat.headline}</h3>
              <p className="hfw-desc">{cat.sub}</p>
              <div className="hfw-features">
                {cat.features.map(f => (
                  <div key={f.title} className="hfw-feature">
                    <div className="hfw-feature-icon">{f.icon}</div>
                    <p className="hfw-feature-title">{f.title}</p>
                    <p className="hfw-feature-desc">{f.desc}</p>
                  </div>
                ))}
              </div>
              <Link href={cat.href} className="hfw-cta"
                style={{ background:cat.color, boxShadow:`0 12px 32px ${cat.color}40` }}>
                {cat.cta} →
              </Link>
            </div>
            <div className="hfw-img-wrap">
              <img src={cat.img} alt={cat.label} loading="lazy" />
              <div className="hfw-img-overlay" />
              <div className="hfw-img-badge">
                <p>✓ {cat.badge}</p>
                <p>TuttoEvento Partner</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}