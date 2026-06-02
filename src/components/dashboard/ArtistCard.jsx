"use client";

export default function ArtistCard({ artist, currentUser, onRequestContact, onViewProfile }) {
  return (
    <article className="bg-white border border-black/5 rounded-3xl p-4 shadow-sm hover:shadow-md transition flex flex-col">
      {/* Foto */}
      <div className="w-full h-44 rounded-2xl bg-[#f5f5f6] border border-black/5 overflow-hidden mb-4 shrink-0">
        {artist.photo ? (
          <img src={artist.photo} alt={artist.name || "Artista"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/30 text-sm font-bold">Nessuna foto</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-lg font-extrabold tracking-tight leading-tight">{artist.name}</h3>
          <span className="shrink-0 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Disponibile</span>
        </div>

        <p className="text-[var(--muted)] text-xs font-semibold mb-1">{artist.city || "—"}</p>
        <p className="text-xs font-bold text-[var(--orange)] mb-2">{artist.genres || "—"}</p>
        <p className="text-xs text-black/50 leading-relaxed line-clamp-2 mb-4">{artist.bio || "Bio non inserita"}</p>

        {/* Prezzo nascosto — solo hint */}
        <div className="bg-[var(--paper)] border border-black/5 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Prezzo</p>
          <p className="text-xs font-bold text-[var(--ink)]">Su richiesta</p>
        </div>

        {/* Azioni */}
        <div className="flex flex-col gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onRequestContact(artist)}
            className="w-full bg-[var(--orange)] text-white rounded-2xl py-3 font-bold text-sm hover:bg-[#e85100] transition shadow-[0_8px_20px_-8px_rgba(255,90,0,.5)]"
          >
            Richiedi contatto
          </button>
          <button
            type="button"
            onClick={() => onViewProfile(artist)}
            className="w-full bg-[var(--paper)] border border-black/10 text-[var(--ink)] rounded-2xl py-3 font-bold text-sm hover:border-[var(--orange)]/40 transition"
          >
            Vedi media kit
          </button>
        </div>
      </div>
    </article>
  );
}