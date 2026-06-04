"use client";
import Link from "next/link";

export default function HomeTestimonials() {
  return (
    <>
      <style>{`
        .htc-root { background:#0a0a0b; padding:100px 20px; }
        .htc-inner { max-width:900px; margin:0 auto; text-align:center; }
        .htc-label { font-size:.75rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:12px; display:block; }
        .htc-title { font-family:'Sora',sans-serif; font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff; letter-spacing:-.04em; margin-bottom:20px; }
        .htc-box { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:28px; padding:56px 48px; }
        .htc-icon { font-size:3rem; margin-bottom:20px; }
        .htc-text { font-family:'Manrope',sans-serif; font-size:1.15rem; color:rgba(255,255,255,.65); line-height:1.7; margin-bottom:32px; max-width:620px; margin-left:auto; margin-right:auto; }
        .htc-text strong { color:#fff; }
        .htc-cta { display:inline-flex; align-items:center; gap:8px; background:#ff5a00; color:#fff; text-decoration:none; padding:14px 28px; border-radius:100px; font-weight:800; font-size:.95rem; font-family:'Manrope',sans-serif; transition:all .2s; box-shadow:0 12px 30px rgba(255,90,0,.35); }
        .htc-cta:hover { background:#e85100; transform:translateY(-2px); }
        .htc-sub { margin-top:20px; font-family:'Manrope',sans-serif; font-size:.85rem; color:rgba(255,255,255,.3); }
      `}</style>
      <section className="htc-root">
        <div className="htc-inner">
          <span className="htc-label">Storie di successo</span>
          <h2 className="htc-title">Le prime storie arriveranno presto.</h2>
          <div className="htc-box">
            <div className="htc-icon">🎤</div>
            <p className="htc-text">
              TuttoEvento è appena lanciata. Stiamo onboardando i <strong>primi artisti e locali</strong> in Italia.<br/>
              Se sei tra i primi a registrarti, la tua storia sarà qui.
            </p>
            <Link href="/register" className="htc-cta">
              Diventa uno dei primi →
            </Link>
            <p className="htc-sub">Gratis · Nessuna carta richiesta · GDPR compliant</p>
          </div>
        </div>
      </section>
    </>
  );
}