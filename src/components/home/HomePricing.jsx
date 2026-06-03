"use client";
import Link from "next/link";

const ROWS = [
  { feature: "Registrazione e profilo", artist: true, venue: true, promoter: true },
  { feature: "Pubblicazione nel marketplace", artist: "Dopo approvazione", venue: "—", promoter: "—" },
  { feature: "Chat in tempo reale", artist: true, venue: true, promoter: true },
  { feature: "Notifiche push", artist: true, venue: true, promoter: true },
  { feature: "Gestione booking", artist: true, venue: true, promoter: true },
  { feature: "Analitiche e estratto conto", artist: true, venue: true, promoter: true },
  { feature: "Commissioni di piattaforma", artist: "0% per te", venue: "Prezzo trasparente", promoter: "% sul confermato" },
  { feature: "Supporto del team TuttoEvento", artist: true, venue: true, promoter: true },
];

function Check({ val }) {
  if (val === true) return <span style={{color:"#16a34a",fontWeight:800,fontSize:"1.1rem"}}>✓</span>;
  if (val === "—") return <span style={{color:"rgba(255,255,255,.2)"}}>—</span>;
  return <span style={{color:"#ff5a00",fontWeight:700,fontSize:".8rem"}}>{val}</span>;
}

export default function HomePricing() {
  return (
    <>
      <style>{`
        .hpr-root { background:#080808; padding:100px 20px; }
        .hpr-inner { max-width:1000px; margin:0 auto; }
        .hpr-label { text-align:center; font-size:.75rem; font-weight:700; color:#ff5a00; text-transform:uppercase; letter-spacing:.2em; margin-bottom:12px; }
        .hpr-title { text-align:center; font-family:'Sora',sans-serif; font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff; letter-spacing:-.04em; margin-bottom:12px; }
        .hpr-sub { text-align:center; color:rgba(255,255,255,.5); font-size:1rem; max-width:520px; margin:0 auto 24px; line-height:1.7; }
        .hpr-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(22,163,74,.1); border:1px solid rgba(22,163,74,.3); border-radius:100px; padding:7px 18px; margin-bottom:48px; }
        .hpr-badge p { font-size:.85rem; font-weight:700; color:#4ade80; }
        .hpr-badge-wrap { text-align:center; }
        .hpr-note { background:rgba(255,90,0,.06); border:1px solid rgba(255,90,0,.15); border-radius:20px; padding:24px 28px; margin-bottom:40px; }
        .hpr-note-title { font-size:1rem; font-weight:800; color:#ff5a00; margin-bottom:6px; }
        .hpr-note-text { font-size:.9rem; color:rgba(255,255,255,.6); line-height:1.6; }
        .hpr-table { width:100%; border-collapse:separate; border-spacing:0; overflow:hidden; border-radius:20px; border:1px solid rgba(255,255,255,.07); }
        .hpr-thead th { background:rgba(255,255,255,.04); padding:16px 20px; text-align:center; font-family:'Sora',sans-serif; font-size:.9rem; font-weight:800; color:#fff; border-bottom:1px solid rgba(255,255,255,.07); }
        .hpr-thead th:first-child { text-align:left; }
        .hpr-tr td { padding:14px 20px; text-align:center; font-size:.875rem; color:rgba(255,255,255,.7); border-bottom:1px solid rgba(255,255,255,.05); }
        .hpr-tr td:first-child { text-align:left; color:rgba(255,255,255,.5); }
        .hpr-tr:last-child td { border-bottom:none; }
        .hpr-tr:hover td { background:rgba(255,255,255,.02); }
        .hpr-ctas { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:40px; }
        .hpr-cta { padding:13px; border-radius:16px; text-align:center; text-decoration:none; font-weight:800; font-size:.9rem; transition:all .2s; }
        .hpr-cta:hover { transform:translateY(-2px); }
        @media(max-width:600px) { .hpr-ctas{grid-template-columns:1fr} .hpr-table{font-size:.78rem} }
      `}</style>
      <section className="hpr-root" id="pricing">
        <div className="hpr-inner">
          <p className="hpr-label">Prezzi</p>
          <h2 className="hpr-title">Gratis per iniziare.<br/>Sempre.</h2>
          <p className="hpr-sub">Nessuna carta di credito. Nessun abbonamento. Registrati e inizia a lavorare.</p>
          <div className="hpr-badge-wrap">
            <div className="hpr-badge">
              <span>🎉</span>
              <p>Zero costi di registrazione per artisti e locali</p>
            </div>
          </div>

          <div className="hpr-note">
            <p className="hpr-note-title">💡 Come guadagniamo</p>
            <p className="hpr-note-text">TuttoEvento funziona come un'agenzia: gestiamo la trattativa tra locale e artista e applichiamo un markup sul prezzo dell'artista che rimane completamente riservato. Tu vedi solo il prezzo finale, netto e concordato.</p>
          </div>

          <table className="hpr-table">
            <thead className="hpr-thead">
              <tr>
                <th>Funzionalità</th>
                <th>🎤 Artista</th>
                <th>🏛️ Locale</th>
                <th>📣 Promoter</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i} className="hpr-tr">
                  <td>{r.feature}</td>
                  <td><Check val={r.artist} /></td>
                  <td><Check val={r.venue} /></td>
                  <td><Check val={r.promoter} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="hpr-ctas">
            <Link href="/register?role=artist" className="hpr-cta" style={{ background:"#ff5a00", color:"#fff" }}>
              🎤 Sono un artista
            </Link>
            <Link href="/register?role=organizer" className="hpr-cta" style={{ background:"rgba(59,130,246,.15)", color:"#60a5fa", border:"1px solid rgba(59,130,246,.3)" }}>
              🏛️ Sono un locale
            </Link>
            <Link href="/register?role=promoter" className="hpr-cta" style={{ background:"rgba(139,92,246,.15)", color:"#a78bfa", border:"1px solid rgba(139,92,246,.3)" }}>
              📣 Sono un promoter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}