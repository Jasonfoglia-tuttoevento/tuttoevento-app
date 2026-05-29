"use client";

export default function ArtistsGrid({ artists, currentUser }) {
  return (
    <section className="bg-white border border-black/5 rounded-[28px] p-7 shadow-sm mt-8">
      <div className="mb-8">
        <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
          Artist Marketplace
        </p>

        <h2 className="text-3xl font-black tracking-[-0.04em]">
          Artisti registrati
        </h2>

        <p className="text-black/50 mt-2">
          Esplora media kit, cachet, generi e profili professionali.
        </p>
      </div>

      {artists.length === 0 ? (
        <p className="text-black/45">
          Nessun artista registrato.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {artists.map((artist) => {
            const socialLinks = [
              { label: "Instagram", value: artist.instagram },
              { label: "Spotify", value: artist.spotify },
              { label: "YouTube", value: artist.youtube },
              { label: "SoundCloud", value: artist.soundcloud },
            ].filter((item) => item.value);

            return (
              <article
                key={artist.id}
                className="bg-[#fafafa] border border-black/5 rounded-[30px] overflow-hidden shadow-sm"
              >
                <div className="h-44 bg-black/5 relative">
                  {artist.photo ? (
                    <img
                      src={artist.photo}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/30 font-black">
                      Foto artista
                    </div>
                  )}

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-black text-[#ff5a00]">
                    {artist.cachet || "Cachet n.d."}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-5">
                    <h3 className="text-3xl font-black tracking-[-0.04em]">
                      {artist.name}
                    </h3>

                    <p className="text-black/40 text-sm mt-1">
                      {artist.city || "Città non inserita"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {(artist.genres || "Genere non inserito")
                      .split(",")
                      .map((genre) => (
                        <span
                          key={genre}
                          className="bg-white border border-black/10 px-3 py-1 rounded-full text-xs font-black text-black/60"
                        >
                          {genre.trim()}
                        </span>
                      ))}
                  </div>

                  <p className="text-black/55 text-sm leading-relaxed line-clamp-4 mb-5">
                    {artist.bio || "Bio non inserita."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <InfoBox
                      label="Lingue"
                      value={artist.languages || "Non inserite"}
                    />

                    <InfoBox
                      label="Disponibilità"
                      value={artist.availability || "Non inserita"}
                    />
                  </div>

                  {socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {socialLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.value}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#111] text-white px-3 py-2 rounded-full text-xs font-black"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}

                  {artist.rider && (
                    <details className="mb-5 bg-white border border-black/10 rounded-2xl p-4">
                      <summary className="font-black cursor-pointer">
                        Rider tecnico
                      </summary>

                      <p className="text-black/55 text-sm mt-3 whitespace-pre-line">
                        {artist.rider}
                      </p>
                    </details>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Chat in sviluppo: qui apriremo la conversazione con " +
                          artist.name
                      )
                    }
                    className="w-full bg-[#111] text-white py-4 rounded-2xl font-black"
                  >
                    CONTATTA ARTISTA
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-3">
      <p className="text-[11px] uppercase tracking-[2px] text-black/35 font-black">
        {label}
      </p>

      <p className="text-sm font-bold text-black/65 mt-1 line-clamp-2">
        {value}
      </p>
    </div>
  );
}