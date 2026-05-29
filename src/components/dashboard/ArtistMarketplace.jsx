"use client";

import { useMemo, useState } from "react";
import ArtistCard from "./ArtistCard";
import ArtistProfileModal from "./ArtistProfileModal";

export default function ArtistMarketplace({
  artists,
  currentUser,
  onSelectArtist,
}) {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [selectedProfileArtist, setSelectedProfileArtist] = useState(null);

  const cities = useMemo(() => {
    const uniqueCities = artists
      .map((artist) => artist.city)
      .filter(Boolean);

    return [...new Set(uniqueCities)];
  }, [artists]);

  const genres = useMemo(() => {
    const allGenres = artists
      .flatMap((artist) =>
        artist.genres
          ? artist.genres.split(",").map((genre) => genre.trim())
          : []
      )
      .filter(Boolean);

    return [...new Set(allGenres)];
  }, [artists]);

  const filteredArtists = useMemo(() => {
    return artists.filter((artist) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        !searchValue ||
        artist.name?.toLowerCase().includes(searchValue) ||
        artist.bio?.toLowerCase().includes(searchValue) ||
        artist.genres?.toLowerCase().includes(searchValue) ||
        artist.city?.toLowerCase().includes(searchValue);

      const matchesCity =
        !cityFilter || artist.city === cityFilter;

      const matchesGenre =
        !genreFilter ||
        artist.genres
          ?.toLowerCase()
          .includes(genreFilter.toLowerCase());

      return matchesSearch && matchesCity && matchesGenre;
    });
  }, [artists, search, cityFilter, genreFilter]);

  return (
    <>
      <section className="mt-8 bg-white border border-black/5 rounded-[28px] p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
          <div>
            <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
              Marketplace
            </p>

            <h2 className="text-3xl font-black tracking-[-0.04em]">
              Roster Artisti
            </h2>

            <p className="text-black/50 mt-2 max-w-2xl">
              Scopri gli artisti disponibili, consulta media kit, cachet e apri una richiesta booking.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca artista, genere, città..."
              className="w-full lg:w-[280px] bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none focus:border-[#ff5a00]"
            />

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none focus:border-[#ff5a00]"
            >
              <option value="">Tutte le città</option>

              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none focus:border-[#ff5a00]"
            >
              <option value="">Tutti i generi</option>

              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredArtists.length === 0 ? (
          <div className="bg-[#f7f7f8] border border-black/5 rounded-3xl p-8 text-center">
            <p className="font-black text-xl">
              Nessun artista trovato
            </p>

            <p className="text-black/45 mt-2">
              Modifica i filtri o prova una ricerca diversa.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                currentUser={currentUser}
                onSelectArtist={onSelectArtist}
                onViewProfile={setSelectedProfileArtist}
              />
            ))}
          </div>
        )}
      </section>

      {selectedProfileArtist && (
        <ArtistProfileModal
          artist={selectedProfileArtist}
          currentUser={currentUser}
          onClose={() => setSelectedProfileArtist(null)}
          onSelectArtist={onSelectArtist}
        />
      )}
    </>
  );
}