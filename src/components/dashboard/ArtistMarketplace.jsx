"use client";

import { useMemo, useState } from "react";
import ArtistCard from "./ArtistCard";
import ArtistProfileModal from "./ArtistProfileModal";
import ContactRequestModal from "./ContactRequestModal";

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

export default function ArtistMarketplace({ artists, currentUser, onSelectArtist }) {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [budgetRange, setBudgetRange] = useState(0); // indice di BUDGET_RANGES
  const [selectedProfileArtist, setSelectedProfileArtist] = useState(null);
  const [contactArtist, setContactArtist] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Solo artisti approvati dall'admin
  const approvedArtists = useMemo(() => artists.filter(a => a.approved), [artists]);

  const cities = useMemo(() => [...new Set(approvedArtists.map(a => a.city).filter(Boolean))], [approvedArtists]);
  const genres = useMemo(() => {
    const all = approvedArtists.flatMap(a => a.genres ? a.genres.split(",").map(g => g.trim()) : []).filter(Boolean);
    return [...new Set(all)];
  }, [approvedArtists]);

  const filtered = useMemo(() => {
    const range = BUDGET_RANGES[budgetRange];
    return approvedArtists.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.name?.toLowerCase().includes(q) || a.bio?.toLowerCase().includes(q) ||
        a.genres?.toLowerCase().includes(q) || a.city?.toLowerCase().includes(q);
      const matchCity = !cityFilter || a.city === cityFilter;
      const matchGenre = !genreFilter || a.genres?.toLowerCase().includes(genreFilter.toLowerCase());
      // Confronta public_price (impostato dall'admin) col range selezionato
      const price = Number(a.publicPrice || a.public_price || 0);
      const matchBudget = budgetRange === 0 || (price >= range.min && price <= range.max);
      return matchSearch && matchCity && matchGenre && matchBudget;
    });
  }, [approvedArtists, search, cityFilter, genreFilter, budgetRange]);

  function handleSuccess() {
    setSuccessMsg("Richiesta inviata! Il nostro team ti contatterà a breve.");
    setTimeout(() => setSuccessMsg(""), 6000);
  }

  return (
    <>
      <section className="bg-white border border-black/5 rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="mb-4">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--orange)] mb-1">Marketplace</p>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Roster Artisti</h2>
          <p className="text-xs text-[var(--muted)] mt-1">Scopri gli artisti disponibili e richiedi un contatto riservato.</p>
        </div>

        {/* Filtri */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca..."
            className="col-span-2 sm:col-span-1 bg-[var(--paper)] border border-black/10 rounded-2xl px-3 py-2.5 text-sm outline-none focus:border-[var(--orange)] transition" />
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
            className="bg-[var(--paper)] border border-black/10 rounded-2xl px-3 py-2.5 text-sm outline-none focus:border-[var(--orange)] transition">
            <option value="">Tutte le città</option>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}
            className="bg-[var(--paper)] border border-black/10 rounded-2xl px-3 py-2.5 text-sm outline-none focus:border-[var(--orange)] transition">
            <option value="">Tutti i generi</option>
            {genres.map(g => <option key={g}>{g}</option>)}
          </select>
          <select value={budgetRange} onChange={e => setBudgetRange(Number(e.target.value))}
            className="bg-[var(--paper)] border border-black/10 rounded-2xl px-3 py-2.5 text-sm outline-none focus:border-[var(--orange)] transition">
            {BUDGET_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
          </select>
        </div>

        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3 text-sm font-bold">
            ✓ {successMsg}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="bg-[var(--paper)] border border-black/5 rounded-2xl p-8 text-center">
            <p className="font-bold text-sm">Nessun artista trovato</p>
            <p className="text-xs text-[var(--muted)] mt-1">
              {approvedArtists.length === 0
                ? "Nessun artista disponibile al momento. Torna presto!"
                : "Modifica i filtri o prova un range di budget diverso."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(a => (
              <ArtistCard key={a.id} artist={a} currentUser={currentUser}
                onRequestContact={setContactArtist}
                onViewProfile={setSelectedProfileArtist} />
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