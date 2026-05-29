"use client";

export default function ArtistCard({
  artist,
  currentUser,
  onSelectArtist,
  onViewProfile,
}) {
  function openArtistChat() {
    if (!artist?.id || !currentUser?.id) {
      alert("Impossibile aprire la chat con questo artista.");
      return;
    }

    window.dispatchEvent(
      new CustomEvent("tuttoevento:open-chat", {
        detail: {
          participantUserId: Number(artist.id),
          bookingId: null,
          eventId: null,
          title: `${currentUser.name} · ${artist.name}`,
        },
      })
    );
  }

  return (
    <article className="bg-white border border-black/5 rounded-[28px] p-5 shadow-sm hover:shadow-md transition">
      <div className="w-full h-56 rounded-3xl bg-[#f5f5f6] border border-black/5 overflow-hidden mb-5">
        {artist.photo ? (
          <img
            src={artist.photo}
            alt={artist.name || "Artista TuttoEvento"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/35 text-sm font-bold">
            Nessuna foto
          </div>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-[#ff5a00] font-black mb-2">
              Artista
            </p>

            <h3 className="text-2xl font-black tracking-[-0.04em]">
              {artist.name}
            </h3>
          </div>

          <span className="shrink-0 bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs font-black">
            Disponibile
          </span>
        </div>

        <p className="text-black/50 text-sm mt-3">
          {artist.city || "Città non indicata"}
        </p>

        <p className="text-black/70 font-bold mt-4">
          {artist.genres || "Generi non indicati"}
        </p>

        <p className="text-black/50 text-sm leading-relaxed mt-3 line-clamp-3">
          {artist.bio || "Bio non inserita"}
        </p>

        <div className="mt-5 rounded-2xl bg-[#f7f7f8] border border-black/5 p-4">
          <p className="text-xs text-black/40 font-bold uppercase tracking-[2px]">
            Cachet indicativo
          </p>

          <p className="font-black mt-1">
            {artist.cachet || "Non inserito"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            type="button"
            onClick={() => onSelectArtist(artist)}
            className="bg-[#ff5a00] text-white rounded-2xl py-3 px-4 font-black text-sm"
          >
            Richiedi booking
          </button>

          <button
            type="button"
            onClick={openArtistChat}
            className="bg-[#111] text-white rounded-2xl py-3 px-4 font-black text-sm"
          >
            Apri chat
          </button>
        </div>

        <button
          type="button"
          onClick={() => onViewProfile(artist)}
          className="w-full mt-3 bg-white border border-black/10 text-black rounded-2xl py-3 px-4 font-black text-sm hover:bg-black hover:text-white transition"
        >
          Vedi profilo completo
        </button>
      </div>
    </article>
  );
}