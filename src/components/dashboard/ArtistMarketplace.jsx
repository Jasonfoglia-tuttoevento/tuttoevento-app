"use client";

import { useMemo, useState, useEffect } from "react";
import ArtistCard from "./ArtistCard";
import ArtistProfileModal from "./ArtistProfileModal";
import ContactRequestModal from "./ContactRequestModal";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

const BUDGET_RANGES = [
  { label: "Tutti i budget", min: 0, max: Infinity },
  { label: "Fino a €100", min: 0, max: 100 },
  { label: "€100 – €200", min: 100, max: 200 },
  { label: "€200 – €350", min: 200, max: 350 },
  { label: "€350 – €500", min: 350, max: 500 },
  { label: "€500 – €750", min: 500, max: 750 },
  { label: "€750 – €1.000", min: 750, max: 1000 },
  { label: "Oltre €1.000", min: 1000, max: Infinity },
];

// Algoritmo matching: punteggio di compatibilità artista/locale
function scoreMatch(artist, venue) {
  let score = 0;
  // Genere musicale vs tipo locale
  const venueType = (venue?.venueType || venue?.venue_type || "").toLowerCase();
  const genres = (artist.genres || "").toLowerCase();
  if (venueType.includes("club") && (genres.includes("house")||genres.includes("tech")||genres.includes("dj")||genres.includes("electronic"))) score += 40;
  if (venueType.includes("jazz") && genres.includes("jazz")) score += 50;
  if (venueType.includes("bar") && (genres.includes("acustic")||genres.includes("pop")||genres.includes("folk")||genres.includes("jazz"))) score += 30;
  if (venueType.includes("ristorante") && (genres.includes("jazz")||genres.includes("soul")||genres.includes("acustic")||genres.includes("lounge"))) score += 35;
  if (venueType.includes("festival") && (genres.includes("rock")||genres.includes("pop")||genres.includes("indie")||genres.includes("hip"))) score += 30;
  // Stessa città
  const venueCity = (venue?.city || "").toLowerCase();
  const artistCity = (artist.city || "").toLowerCase();
  if (venueCity && artistCity && venueCity === artistCity) score += 25;
  // Budget compatibile
  const budget = Number(venue?.eventBudget || venue?.event_budget || 0);
  const price = Number(artist.publicPrice || artist.public_price || 0);
  if (budget > 0 && price > 0 && price <= budget) score += 20;
  // Artista disponibile (approvato)
  if (artist.approved) score += 15;
  return score;
}

export default function ArtistMarketplace({ artists, currentUser, onSelectArtist }) {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [budgetRange, setBudgetRange] = useState(0);
  const [selectedProfileArtist, setSelectedProfileArtist] = useState(null);
  const [contactArtist, setContactArtist] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [venueProfile, setVenueProfile] = useState(null);
  const [showMatching, setShowMatching] = useState(true);

  // Carica profilo venue per il matching
  useEffect(() => {
    if (currentUser?.role !== "organizer") return;
    fetch("/api/venue-profile")
      .then(r => r.json())
      .then(d => setVenueProfile(d || null))
      .catch(() => {});
  }, [currentUser?.id]);

  // Solo artisti approvati
  const approvedArtists = useMemo(() => artists.filter(a => a.approved), [artists]);

  const cities = useMemo(() => [...new Set(approvedArtists.map(a => a.city).filter(Boolean))], [approvedArtists]);
  const genres = useMemo(() => {
    const all = approvedArtists.flatMap(a => a.genres ? a.genres.split(",").map(g => g.trim()) : []).filter(Boolean);
    return [...new Set(all)];
  }, [approvedArtists]);

  // Artisti con punteggio matching
  const artistsWithScore = useMemo(() => {
    if (!venueProfile) return approvedArtists.map(a => ({ ...a, matchScore: 0 }));
    return approvedArtists.map(a => ({ ...a, matchScore: scoreMatch(a, { ...venueProfile, eventBudget: currentUser?.event_budget }) }));
  }, [approvedArtists, venueProfile, currentUser]);

  // Top 3 match
  const topMatches = useMemo(() => {
    if (!venueProfile) return [];
    return [...artistsWithScore].filter(a => a.matchScore > 0).sort((a,b) => b.matchScore - a.matchScore).slice(0,3);
  }, [artistsWithScore, venueProfile]);

  // Filtro standard
  const filtered = useMemo(() => {
    const range = BUDGET_RANGES[budgetRange];
    return artistsWithScore.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.name?.toLowerCase().includes(q) || a.bio?.toLowerCase().includes(q) ||
        a.genres?.toLowerCase().includes(q) || a.city?.toLowerCase().includes(q);
      const matchCity = !cityFilter || a.city === cityFilter;
      const matchGenre = !genreFilter || a.genres?.toLowerCase().includes(genreFilter.toLowerCase());
      const price = Number(a.publicPrice || a.public_price || 0);
      const matchBudget = budgetRange === 0 || (price >= range.min && price <= range.max);
      return matchSearch && matchCity && matchGenre && matchBudget;
    });
  }, [artistsWithScore, search, cityFilter, genreFilter, budgetRange]);

  function handleSuccess() {
    setSuccessMsg("Richiesta inviata! Il nostro team ti contatterà a breve.");
    setTimeout(() => setSuccessMsg(""), 6000);
    // Traccia visualizzazione
    if (contactArtist?.id) {
      fetch("/api/artist-profile-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: contactArtist.id }),
      }).catch(() => {});
    }
  }

  return (
    <>
      <section style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" }}>
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:ORANGE, marginBottom:4 }}>Marketplace</p>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-.03em", marginBottom:4 }}>Roster Artisti</h2>
          <p style={{ fontSize:12, color:MUTED }}>Scopri gli artisti disponibili e richiedi un contatto riservato.</p>
        </div>

        {/* SEZIONE MATCHING — solo se il locale ha un profilo */}
        {topMatches.length > 0 && showMatching && (
          <div style={{ background:"linear-gradient(135deg,rgba(255,90,0,.06),rgba(255,90,0,.02))", border:"1px solid rgba(255,90,0,.15)", borderRadius:20, padding:"16px 18px", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".14em", color:ORANGE, marginBottom:2 }}>✨ Selezionati per te</p>
                <p style={{ fontSize:12, color:MUTED }}>In base al tuo profilo locale, genere e budget</p>
              </div>
              <button onClick={() => setShowMatching(false)}
                style={{ fontSize:11, fontWeight:700, color:MUTED, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                Nascondi
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
              {topMatches.map((a,i) => (
                <div key={a.id} style={{ background:"white", borderRadius:16, padding:"12px", border:"1px solid rgba(255,90,0,.15)", position:"relative" }}>
                  {i === 0 && (
                    <div style={{ position:"absolute", top:-8, left:12, background:ORANGE, color:"white", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:100 }}>
                      🎯 TOP MATCH
                    </div>
                  )}
                  <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
                    {a.photo ? (
                      <img src={a.photo} alt={a.name} style={{ width:40, height:40, borderRadius:10, objectFit:"cover" }} />
                    ) : (
                      <div style={{ width:40, height:40, borderRadius:10, background:"#f5f5f6", display:"grid", placeItems:"center", fontSize:16 }}>🎤</div>
                    )}
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontWeight:800, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.name}</p>
                      <p style={{ fontSize:11, color:ORANGE, fontWeight:700 }}>{a.genres?.split(",")[0]||"—"}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:11, color:MUTED, marginBottom:10 }}>📍 {a.city||"—"}</p>
                  {/* Barra compatibilità */}
                  <div style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:MUTED }}>Compatibilità</span>
                      <span style={{ fontSize:10, fontWeight:800, color:ORANGE }}>{Math.min(a.matchScore,100)}%</span>
                    </div>
                    <div style={{ height:4, background:"rgba(0,0,0,.07)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${Math.min(a.matchScore,100)}%`, background:ORANGE, borderRadius:2, transition:"width .6s" }} />
                    </div>
                  </div>
                  <button onClick={() => setContactArtist(a)}
                    style={{ width:"100%", background:ORANGE, color:"white", border:"none", borderRadius:10, padding:"8px", fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                    Richiedi contatto
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtri */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:8, marginBottom:16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca artista, genere, città..."
            style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:14, padding:"9px 13px", fontSize:13, outline:"none", fontFamily:"inherit" }} />
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
            style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:14, padding:"9px 13px", fontSize:13, outline:"none", fontFamily:"inherit" }}>
            <option value="">Tutte le città</option>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}
            style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:14, padding:"9px 13px", fontSize:13, outline:"none", fontFamily:"inherit" }}>
            <option value="">Tutti i generi</option>
            {genres.map(g => <option key={g}>{g}</option>)}
          </select>
          <select value={budgetRange} onChange={e => setBudgetRange(Number(e.target.value))}
            style={{ background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:14, padding:"9px 13px", fontSize:13, outline:"none", fontFamily:"inherit" }}>
            {BUDGET_RANGES.map((r,i) => <option key={i} value={i}>{r.label}</option>)}
          </select>
        </div>

        {successMsg && (
          <div style={{ marginBottom:14, background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#16a34a", borderRadius:14, padding:"10px 14px", fontSize:13, fontWeight:700 }}>
            ✓ {successMsg}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ background:"#fbfaf8", borderRadius:16, padding:32, textAlign:"center" }}>
            <p style={{ fontWeight:700, fontSize:13 }}>Nessun artista trovato</p>
            <p style={{ fontSize:12, color:MUTED, marginTop:4 }}>
              {approvedArtists.length === 0 ? "Nessun artista disponibile al momento." : "Prova a modificare i filtri."}
            </p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
            {filtered.map(a => (
              <ArtistCard key={a.id} artist={a} currentUser={currentUser}
                onRequestContact={setContactArtist}
                onViewProfile={(artist) => {
                  setSelectedProfileArtist(artist);
                  // Traccia visualizzazione profilo
                  fetch("/api/artist-profile-views", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ artistId: artist.id }),
                  }).catch(() => {});
                }} />
            ))}
          </div>
        )}
      </section>

      {selectedProfileArtist && (
        <ArtistProfileModal artist={selectedProfileArtist} currentUser={currentUser}
          onClose={() => setSelectedProfileArtist(null)} onSelectArtist={onSelectArtist} />
      )}
      {contactArtist && (
        <ContactRequestModal artist={contactArtist} currentUser={currentUser}
          onClose={() => setContactArtist(null)} onSuccess={handleSuccess} />
      )}
    </>
  );
}