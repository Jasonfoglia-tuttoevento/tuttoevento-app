// src/app/locali/[slug]/page.js
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReviewList, RatingSummary } from "@/components/ReviewWidget";

async function getVenue(slug) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tuttoevento.it";
  const res = await fetch(`${baseUrl}/api/venues/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const v = await getVenue(params.slug);
  if (!v) return { title: "Locale non trovato" };
  return {
    title: `${v.name} — TuttoEvento`,
    description: v.description ? v.description.slice(0, 155) : `Profilo locale di ${v.name} su TuttoEvento`,
    openGraph: {
      title: `${v.name} su TuttoEvento`,
      description: v.description?.slice(0, 155) || "",
      images: v.photo ? [{ url: v.photo }] : [],
    },
  };
}

const O = "#ff5a00", INK = "#0a0a0b", MUTED = "#6b6b73";

export default async function VenuePublicPage({ params }) {
  const v = await getVenue(params.slug);
  if (!v) notFound();

  return (
    <main style={{ minHeight:"100vh", background:"#f5f5f6", fontFamily:"'Manrope',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background:INK, padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", gap:28, alignItems:"flex-start", flexWrap:"wrap" }}>
          {v.photo ? (
            <img src={v.photo} alt={v.name} style={{ width:120, height:120, borderRadius:20, objectFit:"cover", border:"3px solid rgba(255,255,255,.1)", flexShrink:0 }} />
          ) : (
            <div style={{ width:120, height:120, borderRadius:20, background:`${O}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:48, fontFamily:"'Sora',sans-serif", fontWeight:900, color:O }}>{(v.name||"?")[0].toUpperCase()}</span>
            </div>
          )}
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"clamp(1.8rem,5vw,2.8rem)", letterSpacing:"-.04em", color:"white", margin:0 }}>
                {v.name}
              </h1>
              {v.verified && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#1877F2"/>
                  <path d="M9.5 16.5L5.5 12.5L6.91 11.09L9.5 13.67L17.09 6.08L18.5 7.5L9.5 16.5Z" fill="white"/>
                </svg>
              )}
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
              {v.venueType && <span style={{ background:"rgba(255,255,255,.1)", color:"rgba(255,255,255,.7)", borderRadius:100, padding:"4px 12px", fontSize:12, fontWeight:700 }}>{v.venueType}</span>}
              {v.city && <span style={{ color:"rgba(255,255,255,.5)", fontSize:13 }}>📍 {v.city}</span>}
              {v.capacity && <span style={{ color:"rgba(255,255,255,.5)", fontSize:13 }}>👥 {v.capacity} posti</span>}
              {v.ratingCount > 0 && (
                <span style={{ background:"rgba(255,255,255,.1)", borderRadius:100, padding:"4px 12px", display:"inline-flex", alignItems:"center", gap:6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff5a00" stroke="#ff5a00"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ color:"white", fontWeight:800, fontSize:13 }}>{Number(v.ratingAvg).toFixed(1)}</span>
                  <span style={{ color:"rgba(255,255,255,.5)", fontSize:12 }}>({v.ratingCount})</span>
                </span>
              )}
            </div>
            {v.description && <p style={{ fontSize:15, color:"rgba(255,255,255,.65)", lineHeight:1.7, margin:"0 0 16px", maxWidth:600 }}>{v.description}</p>}
            {v.instagram && (
              <a href={v.instagram} target="_blank" rel="noopener noreferrer"
                style={{ background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.7)", borderRadius:100, padding:"6px 14px", fontSize:12, fontWeight:700, textDecoration:"none", border:"1px solid rgba(255,255,255,.1)", display:"inline-block" }}>
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div style={{ maxWidth:900, margin:"-24px auto 0", padding:"0 24px 60px" }}>
        <div style={{ background:INK, borderRadius:20, padding:"24px 22px", display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
          <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:"white", margin:0, letterSpacing:"-.02em" }}>
            Sei un artista? Proponiti a {v.name}
          </p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.5)", margin:0, lineHeight:1.6 }}>
            Registrati su TuttoEvento e candidati per le serate di questo locale.
          </p>
          <Link href={`/register?role=artist`}
            style={{ background:O, color:"white", borderRadius:100, padding:"12px 24px", fontWeight:800, fontSize:14, textDecoration:"none", textAlign:"center", boxShadow:`0 8px 24px ${O}40` }}>
            Crea il tuo profilo artista →
          </Link>
        </div>

        {/* Localizzazione */}
        {(v.address || (v.latitude && v.longitude)) && (
          <div style={{ background:"white", borderRadius:20, padding:"22px 24px", border:"1px solid rgba(0,0,0,.06)", marginBottom:16 }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:INK, margin:"0 0 12px", letterSpacing:"-.02em" }}>Dove si trova</h2>
            {v.address && (
              <p style={{ fontSize:14, color:"#333", margin:"0 0 14px", display:"flex", alignItems:"center", gap:8 }}>
                <span>📍</span> {v.address}{v.city ? `, ${v.city}` : ""}
              </p>
            )}
            {v.latitude && v.longitude ? (
              <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid rgba(0,0,0,.08)" }}>
                <iframe
                  title={`Mappa ${v.name}`}
                  width="100%" height="280" style={{ border:0, display:"block" }}
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${v.latitude},${v.longitude}&z=15&output=embed`}
                />
              </div>
            ) : v.address ? (
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(v.address + " " + (v.city||""))}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-block", fontSize:13, fontWeight:700, color:O, textDecoration:"none" }}>
                Apri in Google Maps →
              </a>
            ) : null}
          </div>
        )}

        {/* Recensioni */}
        <div style={{ background:"white", borderRadius:20, padding:"22px 24px", border:"1px solid rgba(0,0,0,.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:16, flexWrap:"wrap" }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:INK, margin:0, letterSpacing:"-.02em" }}>Recensioni dagli artisti</h2>
            <RatingSummary avg={v.ratingAvg} count={v.ratingCount} />
          </div>
          <ReviewList targetId={v.id} />
        </div>
      </div>
    </main>
  );
}