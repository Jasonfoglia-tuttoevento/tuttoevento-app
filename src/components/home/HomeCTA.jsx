"use client";
import Link from "next/link";

export default function HomeCTA() {
  return (
    <>
      <style>{`
        .hct-root { background:#0a0a0b; padding:60px 20px 80px; overflow:hidden; }
        .hct-inner { max-width:960px; margin:0 auto; }
        .hct-box { background:#0f0a08; border:1px solid rgba(255,90,0,.2); border-radius:28px; padding:72px 48px; text-align:center; position:relative; overflow:hidden; }
        .hct-glow { position:absolute; top:-100px; left:50%; transform:translateX(-50%); width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(255,90,0,.22),transparent 70%); filter:blur(60px); pointer-events:none; }
        .hct-label { font-size:.72rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:14px; position:relative; font-family:'Manrope',sans-serif; }
        .hct-title { font-family:'Sora',sans-serif; font-size:clamp(2rem,5vw,3.5rem); font-weight:900; color:#fff; letter-spacing:-.04em; line-height:1.05; margin-bottom:16px; position:relative; }
        .hct-sub { color:rgba(255,255,255,.5); font-size:1rem; max-width:460px; margin:0 auto 36px; line-height:1.7; position:relative; font-family:'Manrope',sans-serif; }
        .hct-ctas { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; position:relative; }
        .hct-primary { background:#ff5a00; color:#fff; font-weight:800; font-size:1rem; padding:15px 32px; border-radius:100px; text-decoration:none; transition:all .25s; box-shadow:0 14px 36px rgba(255,90,0,.4); font-family:'Manrope',sans-serif; white-space:nowrap; }
        .hct-primary:hover { background:#e85100; transform:translateY(-2px) scale(1.02); }
        .hct-ghost { background:rgba(255,255,255,.06); color:#fff; font-weight:700; font-size:1rem; padding:15px 28px; border-radius:100px; text-decoration:none; border:1px solid rgba(255,255,255,.15); transition:all .25s; font-family:'Manrope',sans-serif; white-space:nowrap; }
        .hct-ghost:hover { background:rgba(255,255,255,.11); }
        @media(max-width:600px) {
          .hct-box { padding:48px 20px; }
          .hct-ctas { flex-direction:column; align-items:center; }
          .hct-primary, .hct-ghost { width:100%; max-width:300px; text-align:center; }
        }
      `}</style>
      <section className="hct-root">
        <div className="hct-inner">
          <div className="hct-box te-reveal">
            <div className="hct-glow" />
            <p className="hct-label">Inizia oggi</p>
            <h2 className="hct-title">
              Pronto a far crescere<br/>
              <span style={{ color:"#ff5a00" }}>il tuo business?</span>
            </h2>
            <p className="hct-sub">Registrati gratis in 2 minuti. Nessuna carta, nessun impegno.</p>
            <div className="hct-ctas">
              <Link href="/register" className="hct-primary">Crea il tuo account gratis →</Link>
              <Link href="/login" className="hct-ghost">Hai già un account?</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}