"use client";
import Link from "next/link";

export default function HomeCTA() {
  return (
    <>
      <style>{`
        .hct-root { background:#0a0a0b; padding:80px 20px; }
        .hct-inner { max-width:1000px; margin:0 auto; }
        .hct-box { background:#0f0a08; border:1px solid rgba(255,90,0,.2); border-radius:32px; padding:80px 48px; text-align:center; position:relative; overflow:hidden; }
        .hct-glow { position:absolute; top:-100px; left:50%; transform:translateX(-50%); width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(255,90,0,.25),transparent 70%); filter:blur(60px); pointer-events:none; }
        .hct-label { font-size:.75rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:16px; position:relative; }
        .hct-title { font-family:'Sora',sans-serif; font-size:clamp(2.2rem,5vw,4rem); font-weight:900; color:#fff; letter-spacing:-.04em; line-height:1.05; margin-bottom:20px; position:relative; }
        .hct-sub { color:rgba(255,255,255,.55); font-size:1.1rem; max-width:520px; margin:0 auto 40px; line-height:1.7; position:relative; }
        .hct-ctas { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; position:relative; }
        .hct-primary { background:#ff5a00; color:#fff; font-weight:800; font-size:1.05rem; padding:16px 36px; border-radius:100px; text-decoration:none; transition:all .25s; box-shadow:0 16px 40px rgba(255,90,0,.4); display:inline-flex; align-items:center; gap:8px; }
        .hct-primary:hover { background:#e85100; transform:translateY(-2px) scale(1.02); box-shadow:0 20px 50px rgba(255,90,0,.5); }
        .hct-ghost { background:rgba(255,255,255,.06); color:#fff; font-weight:700; font-size:1rem; padding:16px 32px; border-radius:100px; text-decoration:none; border:1px solid rgba(255,255,255,.15); transition:all .25s; }
        .hct-ghost:hover { background:rgba(255,255,255,.12); }
        .hct-trust { display:flex; gap:20px; justify-content:center; margin-top:36px; flex-wrap:wrap; position:relative; }
        .hct-trust-item { display:flex; align-items:center; gap:6px; color:rgba(255,255,255,.35); font-size:.8rem; font-weight:600; }
        .hct-trust-item span:first-child { color:#16a34a; }
      `}</style>
      <section className="hct-root">
        <div className="hct-inner">
          <div className="hct-box">
            <div className="hct-glow" />
            <p className="hct-label">Inizia oggi</p>
            <h2 className="hct-title">Il tuo prossimo<br/><span style={{color:"#ff5a00"}}>show</span> inizia qui.</h2>
            <p className="hct-sub">Registrati gratis in 2 minuti. Nessuna carta, nessun impegno. Solo musica.</p>
            <div className="hct-ctas">
              <Link href="/register" className="hct-primary">
                🎤 Crea il tuo account gratis
              </Link>
              <Link href="/login" className="hct-ghost">Hai già un account?</Link>
            </div>
            <div className="hct-trust">
              {["100% gratuito","Nessuna carta richiesta","Dati protetti GDPR","Supporto in italiano"].map(t => (
                <div key={t} className="hct-trust-item"><span>✓</span><span>{t}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}