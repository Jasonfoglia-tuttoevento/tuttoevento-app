"use client";
import Link from "next/link";

const MOCK_ARTISTS = [
  { name: "Marco DJ", genre: "House · Tech House", city: "Milano", photo: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&w=400&q=70", tag: "Disponibile" },
  { name: "The Lumens", genre: "Indie Rock · Alternative", city: "Roma", photo: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=70", tag: "Disponibile" },
  { name: "Sara Vox", genre: "Jazz · Soul · R&B", city: "Napoli", photo: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=70", tag: "In tour" },
  { name: "Nova Crew", genre: "Hip Hop · Rap", city: "Torino", photo: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?auto=format&fit=crop&w=400&q=70", tag: "Disponibile" },
];

export default function HomeMarketplace() {
  return (
    <>
      <style>{`
        .hmp-root { background:#0a0a0b; padding:100px 20px; }
        .hmp-inner { max-width:1200px; margin:0 auto; }
        .hmp-top { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:48px; flex-wrap:wrap; gap:20px; }
        .hmp-label { font-size:.75rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:10px; }
        .hmp-title { font-family:'Sora',sans-serif; font-size:clamp(2rem,4vw,3rem); font-weight:900; color:#fff; letter-spacing:-.04em; line-height:1.1; }
        .hmp-sub { color:rgba(255,255,255,.5); font-size:.95rem; margin-top:10px; max-width:420px; line-height:1.6; }
        .hmp-see-all { color:rgba(255,255,255,.6); font-size:.9rem; font-weight:700; text-decoration:none; border:1px solid rgba(255,255,255,.12); padding:10px 20px; border-radius:100px; transition:all .2s; white-space:nowrap; }
        .hmp-see-all:hover { color:#fff; border-color:rgba(255,255,255,.3); }
        .hmp-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .hmp-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:24px; overflow:hidden; transition:all .3s; }
        .hmp-card:hover { transform:translateY(-6px); border-color:rgba(255,90,0,.3); box-shadow:0 20px 60px rgba(0,0,0,.5); }
        .hmp-img { aspect-ratio:1; overflow:hidden; position:relative; }
        .hmp-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
        .hmp-card:hover .hmp-img img { transform:scale(1.05); }
        .hmp-badge { position:absolute; top:12px; right:12px; background:rgba(10,10,11,.8); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,.1); border-radius:100px; padding:4px 10px; font-size:.7rem; font-weight:700; color:#fff; }
        .hmp-info { padding:16px; }
        .hmp-name { font-family:'Sora',sans-serif; font-size:1rem; font-weight:800; color:#fff; margin-bottom:4px; }
        .hmp-genre { font-size:.78rem; font-weight:600; color:#ff5a00; margin-bottom:4px; }
        .hmp-city { font-size:.78rem; color:rgba(255,255,255,.4); margin-bottom:14px; }
        .hmp-price { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .hmp-price-label { font-size:.7rem; color:rgba(255,255,255,.4); font-weight:600; }
        .hmp-price-val { font-size:.78rem; font-weight:800; color:rgba(255,255,255,.7); }
        .hmp-btn { width:100%; background:#ff5a00; color:#fff; border:none; border-radius:12px; padding:10px; font-size:.82rem; font-weight:800; cursor:pointer; font-family:'Manrope',sans-serif; transition:all .2s; }
        .hmp-btn:hover { background:#e85100; }
        .hmp-bottom { text-align:center; margin-top:48px; }
        .hmp-cta { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:#fff; text-decoration:none; padding:14px 28px; border-radius:100px; font-weight:700; font-size:.95rem; transition:all .2s; }
        .hmp-cta:hover { background:rgba(255,255,255,.1); }
        @media(max-width:900px) { .hmp-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:500px) { .hmp-grid{grid-template-columns:1fr} }
      `}</style>
      <section className="hmp-root" id="marketplace">
        <div className="hmp-inner">
          <div className="hmp-top">
            <div>
              <p className="hmp-label">Marketplace</p>
              <h2 className="hmp-title">Il roster.<br/>Solo il meglio.</h2>
              <p className="hmp-sub">Artisti verificati dal team TuttoEvento. Prezzi su richiesta, qualità garantita.</p>
            </div>
            <Link href="/register" className="hmp-see-all">Vedi tutto il roster →</Link>
          </div>
          <div className="hmp-grid">
            {MOCK_ARTISTS.map((a, i) => (
              <div key={i} className="hmp-card">
                <div className="hmp-img">
                  <img src={a.photo} alt={a.name} loading="lazy" />
                  <span className="hmp-badge">{a.tag}</span>
                </div>
                <div className="hmp-info">
                  <p className="hmp-name">{a.name}</p>
                  <p className="hmp-genre">{a.genre}</p>
                  <p className="hmp-city">📍 {a.city}</p>
                  <div className="hmp-price">
                    <span className="hmp-price-label">Prezzo</span>
                    <span className="hmp-price-val">Su richiesta</span>
                  </div>
                  <button className="hmp-btn" onClick={() => window.location.href = "/register"}>
                    Richiedi contatto →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="hmp-bottom">
            <Link href="/register" className="hmp-cta">
              🎤 Registrati per vedere tutti gli artisti
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}