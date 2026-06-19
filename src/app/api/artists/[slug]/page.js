// src/app/artisti/[slug]/page.js
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReviewList, RatingSummary } from "@/components/ReviewWidget";

async function getArtist(slug) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tuttoevento.it";
  const res = await fetch(`${baseUrl}/api/artists/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const a = await getArtist(params.slug);
  if (!a) return { title: "Artista non trovato" };
  return {
    title:       `${a.stageName || a.name} — TuttoEvento`,
    description: a.bio ? a.bio.slice(0, 155) : `Profilo artista di ${a.stageName} su TuttoEvento`,
    openGraph: {
      title:  `${a.stageName || a.name} su TuttoEvento`,
      description: a.bio?.slice(0, 155) || "",
      images: a.photo ? [{ url: a.photo }] : [],
    },
  };
}

const O    = "#ff5a00";
const INK  = "#0a0a0b";
const MUTED= "#6b6b73";
const BG   = "#f5f5f6";

export default async function ArtistPublicPage({ params }) {
  const a = await getArtist(params.slug);
  if (!a) notFound();

  const genres   = Array.isArray(a.musicGenres)  ? a.musicGenres  : [];
  const events   = Array.isArray(a.eventTypes)   ? a.eventTypes   : [];
  const avail    = Array.isArray(a.availableDates)? a.availableDates: [];
  const socials  = [
    { label:"Instagram",  url: a.instagram?.startsWith("http")?a.instagram:`https://instagram.com/${a.instagram?.replace("@","")}`, show:!!a.instagram },
    { label:"Spotify",    url: a.spotify,                                                                                            show:!!a.spotify    },
    { label:"YouTube",    url: a.youtube,                                                                                            show:!!a.youtube    },
    { label:"SoundCloud", url: a.soundcloud,                                                                                         show:!!a.soundcloud },
    { label:"TikTok",     url: a.tiktok?.startsWith("http")?a.tiktok:`https://tiktok.com/@${a.tiktok?.replace("@","")}`,            show:!!a.tiktok     },
  ].filter(s=>s.show);

  return (
    <main style={{ minHeight:"100vh", background:BG, fontFamily:"'Manrope',system-ui,sans-serif" }}>
      <style>{`
        * { box-sizing:border-box; }
        body { margin:0; }
        @media(max-width:640px){ .ap-grid{grid-template-columns:1fr!important} }
      `}</style>

      {/* Navbar */}
      <nav style={{ background:INK, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Link href="/" style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1rem", letterSpacing:"-.04em", color:"white", textDecoration:"none" }}>
          TUTTO<span style={{ color:O }}>EVENTO</span>
        </Link>
        <Link href="/register?role=organizer" style={{ background:O, color:"white", borderRadius:100, padding:"8px 18px", fontSize:13, fontWeight:700, textDecoration:"none" }}>
          Contatta questo artista
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ background:INK, padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", gap:28, alignItems:"flex-start", flexWrap:"wrap" }}>
          {a.photo ? (
            <img src={a.photo} alt={a.stageName||a.name} style={{ width:120, height:120, borderRadius:20, objectFit:"cover", border:"3px solid rgba(255,255,255,.1)", flexShrink:0 }} />
          ) : (
            <div style={{ width:120, height:120, borderRadius:20, background:`${O}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:48, fontFamily:"'Sora',sans-serif", fontWeight:900, color:O }}>{(a.stageName||a.name||"?")[0].toUpperCase()}</span>
            </div>
          )}
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"clamp(1.8rem,5vw,2.8rem)", letterSpacing:"-.04em", color:"white", margin:0 }}>
                {a.stageName || a.name}
              </h1>
              {a.verified && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#1877F2"/>
                  <path d="M9.5 16.5L5.5 12.5L6.91 11.09L9.5 13.67L17.09 6.08L18.5 7.5L9.5 16.5Z" fill="white"/>
                </svg>
              )}
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
              {a.artistType && <span style={{ background:"rgba(255,255,255,.1)", color:"rgba(255,255,255,.7)", borderRadius:100, padding:"4px 12px", fontSize:12, fontWeight:700 }}>{a.artistType}</span>}
              {a.city && <span style={{ color:"rgba(255,255,255,.5)", fontSize:13 }}>📍 {a.city}</span>}
              {a.ratingCount > 0 && (
                <span style={{ background:"rgba(255,255,255,.1)", borderRadius:100, padding:"4px 12px", display:"inline-flex", alignItems:"center", gap:6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff5a00" stroke="#ff5a00"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ color:"white", fontWeight:800, fontSize:13 }}>{Number(a.ratingAvg).toFixed(1)}</span>
                  <span style={{ color:"rgba(255,255,255,.5)", fontSize:12 }}>({a.ratingCount})</span>
                </span>
              )}
            </div>
            {a.bio && <p style={{ fontSize:15, color:"rgba(255,255,255,.65)", lineHeight:1.7, margin:"0 0 16px", maxWidth:600 }}>{a.bio}</p>}
            {socials.length > 0 && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {socials.map(s=>(
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.7)", borderRadius:100, padding:"6px 14px", fontSize:12, fontWeight:700, textDecoration:"none", border:"1px solid rgba(255,255,255,.1)" }}>
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div style={{ maxWidth:900, margin:"-24px auto 0", padding:"0 24px 60px" }}>
        <div className="ap-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          {/* Generi musicali */}
          {genres.length > 0 && (
            <div style={{ background:"white", borderRadius:20, padding:"20px 22px", border:"1px solid rgba(0,0,0,.06)" }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:MUTED, margin:"0 0 12px" }}>Generi musicali</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {genres.map(g=><span key={g} style={{ background:`${O}10`, color:O, borderRadius:100, padding:"4px 12px", fontSize:13, fontWeight:700 }}>{g}</span>)}
              </div>
            </div>
          )}

          {/* Tipi evento */}
          {events.length > 0 && (
            <div style={{ background:"white", borderRadius:20, padding:"20px 22px", border:"1px solid rgba(0,0,0,.06)" }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:MUTED, margin:"0 0 12px" }}>Tipi di evento</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {events.map(e=><span key={e} style={{ background:"rgba(0,0,0,.05)", color:INK, borderRadius:100, padding:"4px 12px", fontSize:13, fontWeight:600 }}>{e}</span>)}
              </div>
            </div>
          )}

          {/* Disponibilità */}
          {avail.length > 0 && (
            <div style={{ background:"white", borderRadius:20, padding:"20px 22px", border:"1px solid rgba(0,0,0,.06)" }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:MUTED, margin:"0 0 12px" }}>Date disponibili</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {avail.slice(0,12).map(d=><span key={d} style={{ background:"rgba(22,163,74,.08)", color:"#16a34a", border:"1px solid rgba(22,163,74,.2)", borderRadius:10, padding:"4px 10px", fontSize:12, fontWeight:700 }}>{d}</span>)}
                {avail.length>12 && <span style={{ color:MUTED, fontSize:12 }}>+{avail.length-12} altre</span>}
              </div>
            </div>
          )}

          {/* CTA contatto */}
          <div style={{ background:INK, borderRadius:20, padding:"24px 22px", display:"flex", flexDirection:"column", gap:12, justifyContent:"center" }}>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:"white", margin:0, letterSpacing:"-.02em" }}>
              Vuoi prenotare {a.stageName||a.name}?
            </p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.5)", margin:0, lineHeight:1.6 }}>
              Registrati e invia una richiesta. Il team TuttoEvento gestirà tutto.
            </p>
            <Link href={`/register?role=organizer`}
              style={{ background:O, color:"white", borderRadius:100, padding:"12px 24px", fontWeight:800, fontSize:14, textDecoration:"none", textAlign:"center", boxShadow:`0 8px 24px ${O}40` }}>
              Richiedi disponibilità →
            </Link>
            <Link href="/artisti"
              style={{ color:"rgba(255,255,255,.4)", fontSize:12, textAlign:"center", textDecoration:"none" }}>
              ← Tutti gli artisti
            </Link>
          </div>
        </div>

        {/* Recensioni */}
        <div style={{ background:"white", borderRadius:20, padding:"22px 24px", border:"1px solid rgba(0,0,0,.06)", marginTop:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:16, flexWrap:"wrap" }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:INK, margin:0, letterSpacing:"-.02em" }}>Recensioni</h2>
            <RatingSummary avg={a.ratingAvg} count={a.ratingCount} />
          </div>
          <ReviewList targetId={a.id} />
        </div>
      </div>
    </main>
  );
}