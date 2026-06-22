// src/app/pitch/[slug]/page.js
// Scheda artista "pitch-ready" — pagina stampabile/condivisibile, generata dal promoter.
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";

async function getArtist(slug) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tuttoevento.it";
  const res = await fetch(`${baseUrl}/api/artists/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

const O = "#ff5a00", INK = "#0a0a0b", MUTED = "#6b6b73";

export default async function PitchSheetPage({ params, searchParams }) {
  const a = await getArtist(params.slug);
  if (!a) notFound();

  const promoterName = searchParams?.via ? decodeURIComponent(searchParams.via) : null;

  return (
    <main style={{ minHeight:"100vh", background:"white", fontFamily:"'Manrope',system-ui,sans-serif", padding:"32px 20px" }}>
      <style>{`
        @media print {
          .no-print { display:none !important; }
          body { padding: 0 !important; }
        }
      `}</style>

      <div className="no-print" style={{ maxWidth:680, margin:"0 auto 20px", display:"flex", justifyContent:"flex-end", gap:10 }}>
        <PrintButton />
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", border:"1px solid rgba(0,0,0,.08)", borderRadius:24, overflow:"hidden" }}>
        {/* Header con foto */}
        <div style={{ background:INK, padding:"32px 28px", display:"flex", gap:20, alignItems:"center" }}>
          {a.photo ? (
            <img src={a.photo} alt={a.stageName} style={{ width:96, height:96, borderRadius:18, objectFit:"cover", border:"3px solid rgba(255,255,255,.1)" }} />
          ) : (
            <div style={{ width:96, height:96, borderRadius:18, background:`${O}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:36, fontFamily:"'Sora',sans-serif", fontWeight:900, color:O }}>{(a.stageName||"?")[0]}</span>
            </div>
          )}
          <div>
            <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:".2em", color:O, margin:"0 0 4px" }}>TuttoEvento</p>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:28, color:"white", margin:0, letterSpacing:"-.03em" }}>{a.stageName}</h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.5)", margin:"4px 0 0" }}>{a.artistType} {a.city ? `· ${a.city}` : ""}</p>
          </div>
        </div>

        {/* Corpo */}
        <div style={{ padding:"28px" }}>
          {a.bio && <p style={{ fontSize:14, color:"#333", lineHeight:1.7, margin:"0 0 20px" }}>{a.bio}</p>}

          {/* Generi */}
          {a.musicGenres?.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:MUTED, margin:"0 0 8px" }}>Generi</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {a.musicGenres.map(g => (
                  <span key={g} style={{ fontSize:12, fontWeight:700, color:O, background:`${O}10`, borderRadius:100, padding:"4px 12px" }}>{g}</span>
                ))}
              </div>
            </div>
          )}

          {/* Prezzi */}
          {a.publicPricing && Object.keys(a.publicPricing).length > 0 && (
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:MUTED, margin:"0 0 8px" }}>Tariffe</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
                {Object.entries(a.publicPricing).flatMap(([eventType, durations]) =>
                  Object.entries(durations || {}).map(([dur, price]) => (
                    <div key={`${eventType}-${dur}`} style={{ background:"#fbfaf8", borderRadius:12, padding:"10px 12px", border:"1px solid rgba(0,0,0,.06)" }}>
                      <p style={{ fontSize:10, color:MUTED, margin:"0 0 2px" }}>{eventType} · {dur}</p>
                      <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:INK, margin:0 }}>€{price}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          {a.ratingCount > 0 && (
            <div style={{ marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={O} stroke={O}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ fontWeight:800, fontSize:15, color:INK, fontFamily:"'Sora',sans-serif" }}>{Number(a.ratingAvg).toFixed(1)}</span>
              <span style={{ fontSize:13, color:MUTED }}>({a.ratingCount} recensioni)</span>
            </div>
          )}

          {/* Social */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
            {a.instagram && <a href={a.instagram} style={{ fontSize:12, fontWeight:700, color:INK, textDecoration:"none", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"6px 14px" }}>Instagram</a>}
            {a.spotify && <a href={a.spotify} style={{ fontSize:12, fontWeight:700, color:INK, textDecoration:"none", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"6px 14px" }}>Spotify</a>}
            {a.youtube && <a href={a.youtube} style={{ fontSize:12, fontWeight:700, color:INK, textDecoration:"none", border:"1px solid rgba(0,0,0,.1)", borderRadius:100, padding:"6px 14px" }}>YouTube</a>}
          </div>

          {/* Footer */}
          <div style={{ borderTop:"1px solid rgba(0,0,0,.08)", paddingTop:16, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
            <p style={{ fontSize:11, color:MUTED, margin:0 }}>
              {promoterName ? `Proposto da ${promoterName} tramite ` : ""}TuttoEvento.it
            </p>
            <a href={`https://tuttoevento.it/artisti/${a.slug}`}
              style={{ fontSize:12, fontWeight:800, color:O, textDecoration:"none" }}>
              Vedi profilo completo →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}