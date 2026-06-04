"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const HEADLINES = [
  "Il tuo prossimo show\ninizia qui.",
  "Artisti reali.\nLocali veri.\nBooking semplice.",
  "Smetti di cercare.\nInizia a suonare.",
];

export default function HomeHero() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % HEADLINES.length); setVisible(true); }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        .hh-root { position:relative; min-height:100vh; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#0a0a0b; width:100%; }
        .hh-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.3; }
        .hh-poster { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.3; }
        .hh-overlay { position:absolute; inset:0; background:linear-gradient(180deg,rgba(10,10,11,.4) 0%,rgba(10,10,11,.5) 60%,#0a0a0b 100%); }
        .hh-glow { position:absolute; top:-200px; left:50%; transform:translateX(-50%); width:800px; height:800px; border-radius:50%; background:radial-gradient(circle,rgba(255,90,0,.35),transparent 70%); filter:blur(80px); pointer-events:none; }
        .hh-content { position:relative; z-index:2; text-align:center; padding:120px 20px 80px; max-width:900px; width:100%; }
        .hh-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,90,0,.12); border:1px solid rgba(255,90,0,.3); border-radius:100px; padding:6px 16px; margin-bottom:28px; }
        .hh-badge-dot { width:7px; height:7px; border-radius:50%; background:#ff5a00; animation:pulse 2s infinite; }
        .hh-badge p { font-size:.8rem; font-weight:700; color:rgba(255,255,255,.8); letter-spacing:.08em; text-transform:uppercase; font-family:'Manrope',sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
        .hh-headline { font-family:'Sora',sans-serif; font-size:clamp(2.8rem,7vw,5.5rem); font-weight:900; line-height:1.05; letter-spacing:-.04em; color:#fff; white-space:pre-line; transition:opacity .4s,transform .4s; }
        .hh-headline.hidden { opacity:0; transform:translateY(10px); }
        .hh-headline em { color:#ff5a00; font-style:normal; }
        .hh-sub { font-family:'Manrope',sans-serif; font-size:clamp(1rem,2.5vw,1.2rem); color:rgba(255,255,255,.55); margin:24px auto 40px; max-width:580px; line-height:1.7; }
        .hh-ctas { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:40px; }
        .hh-cta-primary { background:#ff5a00; color:#fff; font-family:'Manrope',sans-serif; font-weight:800; font-size:1rem; padding:15px 32px; border-radius:100px; text-decoration:none; transition:all .25s; box-shadow:0 16px 40px rgba(255,90,0,.4); }
        .hh-cta-primary:hover { background:#e85100; transform:translateY(-2px) scale(1.02); }
        .hh-cta-ghost { background:rgba(255,255,255,.06); color:#fff; font-family:'Manrope',sans-serif; font-weight:700; font-size:1rem; padding:15px 32px; border-radius:100px; text-decoration:none; border:1px solid rgba(255,255,255,.15); transition:all .25s; }
        .hh-cta-ghost:hover { background:rgba(255,255,255,.12); }
        .hh-trust { display:flex; gap:20px; justify-content:center; flex-wrap:wrap; }
        .hh-trust-item { display:flex; align-items:center; gap:6px; color:rgba(255,255,255,.35); font-size:.78rem; font-weight:600; font-family:'Manrope',sans-serif; }
        .hh-trust-item span:first-child { color:#16a34a; }
        .hh-scroll { position:absolute; bottom:32px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; z-index:2; }
        .hh-scroll-dot { width:6px; height:6px; border-radius:50%; background:#ff5a00; animation:scrollBounce 1.5s infinite; }
        @keyframes scrollBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        .hh-scroll p { font-size:.7rem; color:rgba(255,255,255,.3); font-weight:600; letter-spacing:.12em; text-transform:uppercase; font-family:'Manrope',sans-serif; }
      `}</style>

      <section className="hh-root">
        {!videoError ? (
          <video className="hh-video" autoPlay loop muted playsInline
            poster="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=60"
            onError={() => setVideoError(true)}>
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <img className="hh-poster" src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=60" alt="" aria-hidden="true" />
        )}
        <div className="hh-overlay" />
        <div className="hh-glow" />

        <div className="hh-content">
          <div className="hh-badge te-animate-up te-d1">
            <span className="hh-badge-dot" /><p>Marketplace eventi dal vivo · Italia</p>
          </div>
          <h1
            className={`hh-headline te-animate-up te-d2${visible?"":" hidden"}`}
            dangerouslySetInnerHTML={{ __html: HEADLINES[idx]
              .replace(/\n/g,"<br/>")
              .replace("reali","<em>reali</em>")
              .replace("veri","<em>veri</em>")
              .replace("qui","<em>qui</em>")
              .replace("suonare","<em>suonare</em>")
            }}
          />
          <p className="hh-sub te-animate-up te-d3">
            La piattaforma che connette artisti, locali e promoter.<br/>
            Chat, booking, CRM e molto altro — tutto in un posto solo.
          </p>
          <div className="hh-ctas te-animate-up te-d4">
            <Link href="/register?role=artist" className="hh-cta-primary">Sono un artista →</Link>
            <Link href="/register?role=organizer" className="hh-cta-ghost">Sono un locale</Link>
          </div>
          <div className="hh-trust te-animate-up te-d5">
            {["100% gratuito","Nessuna carta richiesta","GDPR compliant","🇮🇹 Made in Italy"].map(t => (
              <div key={t} className="hh-trust-item"><span>✓</span><span>{t}</span></div>
            ))}
          </div>
        </div>

        <div className="hh-scroll">
          <div className="hh-scroll-dot" />
          <p>Scorri</p>
        </div>
      </section>
    </>
  );
}