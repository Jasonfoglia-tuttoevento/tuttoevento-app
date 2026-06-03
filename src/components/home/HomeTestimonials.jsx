"use client";
import { useState } from "react";

const TESTIMONIALS = [
  { name: "Marco Bianchi", role: "DJ · Milano", text: "Finalmente una piattaforma italiana pensata per noi artisti. Ho ricevuto la prima richiesta di booking in 3 giorni dall'iscrizione.", stars: 5, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=70" },
  { name: "Club Aurora", role: "Locale · Napoli", text: "Abbiamo smesso di cercare artisti su Instagram. TuttoEvento ci ha fatto risparmiare ore ogni settimana.", stars: 5, img: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=100&q=70" },
  { name: "Giulia Romano", role: "Live Band · Roma", text: "Il profilo professionale che ho creato su TuttoEvento è diventato il mio biglietto da visita principale. I locali mi trovano loro.", stars: 5, img: "https://images.unsplash.com/photo-1494790108755-2616b332c1ce?auto=format&fit=crop&w=100&q=70" },
  { name: "Luca Ferretti", role: "Promoter · Torino", text: "Come promoter riesco a tenere tutto sotto controllo da un'unica dashboard. Booking, commissioni, artisti e locali in un posto.", stars: 5, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=70" },
  { name: "Jazz Club Milano", role: "Locale · Milano", text: "Il sistema di richiesta contatto è geniale: diciamo il nostro budget riservato e il team ci propone l'artista giusto.", stars: 5, img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=100&q=70" },
  { name: "Elena Costa", role: "Cantante · Firenze", text: "Non devo più mandare email a freddo. I locali vengono da me, già interessati. Questo cambia tutto.", stars: 5, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=70" },
];

export default function HomeTestimonials() {
  const [active, setActive] = useState(0);

  return (
    <>
      <style>{`
        .ht-root { background:#0a0a0b; padding:100px 20px; }
        .ht-inner { max-width:1100px; margin:0 auto; }
        .ht-label { text-align:center; font-size:.75rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:12px; }
        .ht-title { text-align:center; font-family:'Sora',sans-serif; font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff; letter-spacing:-.04em; margin-bottom:64px; }
        .ht-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .ht-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:24px; padding:28px; transition:all .3s; }
        .ht-card:hover { background:rgba(255,255,255,.06); transform:translateY(-4px); }
        .ht-stars { color:#ff5a00; font-size:1rem; margin-bottom:14px; letter-spacing:2px; }
        .ht-text { color:rgba(255,255,255,.7); font-size:.9rem; line-height:1.7; margin-bottom:20px; font-style:italic; }
        .ht-author { display:flex; align-items:center; gap:12px; }
        .ht-avatar { width:40px; height:40px; border-radius:50%; object-fit:cover; flex-shrink:0; }
        .ht-name { font-size:.9rem; font-weight:800; color:#fff; }
        .ht-role { font-size:.78rem; color:rgba(255,255,255,.4); }
        .ht-quote { font-size:3rem; color:rgba(255,90,0,.2); font-family:Georgia,serif; line-height:1; margin-bottom:8px; }
        @media(max-width:900px) { .ht-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:560px) { .ht-grid{grid-template-columns:1fr} }
      `}</style>
      <section className="ht-root">
        <div className="ht-inner">
          <p className="ht-label">Testimonianze</p>
          <h2 className="ht-title">Chi ha già iniziato.</h2>
          <div className="ht-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="ht-card">
                <div className="ht-quote">"</div>
                <div className="ht-stars">{"★".repeat(t.stars)}</div>
                <p className="ht-text">{t.text}</p>
                <div className="ht-author">
                  <img src={t.img} alt={t.name} className="ht-avatar" loading="lazy" />
                  <div>
                    <p className="ht-name">{t.name}</p>
                    <p className="ht-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}