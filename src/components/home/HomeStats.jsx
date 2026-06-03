"use client";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 100, suffix: "%", label: "Gratuito per iniziare", desc: "Nessuna carta richiesta" },
  { value: 3, suffix: "", label: "Categorie coperte", desc: "Artisti, Locali, Promoter" },
  { value: 48, suffix: "h", label: "Risposta garantita", desc: "Dal team TuttoEvento" },
  { value: 1, suffix: " posto", label: "Per gestire tutto", desc: "Chat, booking, analitiche" },
];

export default function HomeStats() {
  const ref = useRef(null);
  const [counts, setCounts] = useState(STATS.map(() => 0));
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const startTime = performance.now();
    const targets = STATS.map(s => s.value);

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts(targets.map(t => Math.floor(ease * t)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started]);

  return (
    <>
      <style>{`
        .hs-root { background:linear-gradient(180deg,#0a0a0b 0%,#0f0a08 50%,#0a0a0b 100%); padding:80px 20px; }
        .hs-inner { max-width:1100px; margin:0 auto; }
        .hs-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; background:rgba(255,255,255,.06); border-radius:24px; overflow:hidden; }
        .hs-item { background:#0a0a0b; padding:48px 32px; text-align:center; }
        .hs-num { font-family:'Sora',sans-serif; font-size:3.5rem; font-weight:900; color:#ff5a00; letter-spacing:-.04em; line-height:1; }
        .hs-label { font-size:.95rem; font-weight:800; color:#fff; margin-top:12px; }
        .hs-desc { font-size:.8rem; color:rgba(255,255,255,.35); margin-top:4px; }
        @media(max-width:700px) { .hs-grid{grid-template-columns:repeat(2,1fr)} .hs-item{padding:32px 20px} .hs-num{font-size:2.5rem} }
      `}</style>
      <section className="hs-root" ref={ref}>
        <div className="hs-inner">
          <div className="hs-grid">
            {STATS.map((s, i) => (
              <div key={s.label} className="hs-item">
                <p className="hs-num">{counts[i]}{s.suffix}</p>
                <p className="hs-label">{s.label}</p>
                <p className="hs-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}