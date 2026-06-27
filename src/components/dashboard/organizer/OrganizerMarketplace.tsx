"use client";
import { useState, useEffect, useRef } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";
import ContactRequestModal from "@/components/dashboard/ContactRequestModal";
import { Card, INK, Inp, MUTED, O, ProBadge, ProLock, SCard, STitle, SectionTitle } from "./shared";
interface OrganizerMarketplaceProps {
  artists: any[];
  plan: string;
  currentUser?: any;
}

export default function OrganizerMarketplace({ artists = [], plan, currentUser }: OrganizerMarketplaceProps) {
  const [search, setSearch]     = useState("");
  const [genreFilter, setGenre] = useState("");
  const [contactArtist, setContactArtist] = useState(null);

  const filtered = artists.filter(a => {
    const name = (a.stageName || a.name || "").toLowerCase();
    // musicGenres è un array — uniscilo in stringa prima di confrontare
    const genresArr = Array.isArray(a.musicGenres) ? a.musicGenres : (Array.isArray(a.genres) ? a.genres : []);
    const genre = genresArr.join(" ").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchGenre  = !genreFilter || genre.includes(genreFilter.toLowerCase());
    return matchSearch && matchGenre;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Filtri base */}
      <Card>
        <SectionTitle>Cerca artisti</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label="Nome / stile" value={search} onChange={e => setSearch(e.target.value)} placeholder="Es. DJ, cantante..." />
          <Inp label="Genere" value={genreFilter} onChange={e => setGenre(e.target.value)} placeholder="Es. House, Jazz..." />
        </div>
      </Card>

      {/* Filtri avanzati + AI matching — solo PRO, collassato di default */}
      <ProLock feature="I filtri avanzati e l'AI matching" plan={plan} collapsedLabel="Filtri avanzati + AI matching">
        <Card>
          <SectionTitle>Filtri avanzati + AI matching <ProBadge /></SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
            <Inp label="Budget max (€)" placeholder="Es. 500" />
            <Inp label="Distanza (km)" placeholder="Es. 50" />
            <Inp label="Disponibilità" type="date" placeholder="" />
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,90,0,.06)", borderRadius: 12, fontSize: 13, color: O, fontWeight: 700 }}>
            🤖 AI matching: suggerisce i 3 artisti più adatti in base a storico, budget e tipo evento
          </div>
        </Card>
      </ProLock>

      {/* Grid artisti */}
      {filtered.length === 0 ? (
        <Card><p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun artista trovato.</p></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {filtered.map(a => (
            <div key={a.id} style={{ background: "white", border: "1px solid rgba(0,0,0,.07)", borderRadius: 22, overflow: "hidden", transition: "box-shadow .2s" }}>
              {a.photo && <img src={a.photo} alt={a.stageName || a.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, margin: 0 }}>{a.stageName || a.name}</p>
                {a.verified && <VerifiedBadge size={15} />}
              </div>
                </div>
                <p style={{ fontSize: 12, color: O, fontWeight: 700, margin: "0 0 4px" }}>{(Array.isArray(a.musicGenres) && a.musicGenres.length) ? a.musicGenres.join(", ") : (Array.isArray(a.genres) && a.genres.length) ? a.genres.join(", ") : "—"}</p>
                <p style={{ fontSize: 12, color: MUTED, margin: "0 0 12px" }}>📍 {a.city || "Italia"}</p>
                <button type="button" onClick={() => setContactArtist(a)}
                  style={{ width: "100%", background: INK, color: "white", border: "none", borderRadius: 12, padding: "10px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif" }}>
                  Richiedi contatto
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {contactArtist && <ContactRequestModal artist={contactArtist} currentUser={currentUser} onClose={() => setContactArtist(null)} onSuccess={() => setContactArtist(null)} />}
    </div>
  );
}

// ── Tab: CRM ───────────────────────────────────────────────────