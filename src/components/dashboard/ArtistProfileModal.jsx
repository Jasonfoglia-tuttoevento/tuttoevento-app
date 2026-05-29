"use client";

export default function ArtistProfileModal({
  artist,
  currentUser,
  onClose,
  onSelectArtist,
}) {
  if (!artist) return null;

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

  function handleRequestBooking() {
    onSelectArtist(artist);
    onClose();
  }

  function getListFromText(value) {
    if (!value) return [];

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function parseJsonArray(value) {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  const genres = getListFromText(artist.genres);
  const languages = getListFromText(artist.languages);
  const availableDates = parseJsonArray(artist.availableDates);
  const bookedSlots = parseJsonArray(artist.bookedSlots);

  const socials = [
    {
      label: "Instagram",
      value: artist.instagram,
    },
    {
      label: "Spotify",
      value: artist.spotify,
    },
    {
      label: "YouTube",
      value: artist.youtube,
    },
    {
      label: "SoundCloud",
      value: artist.soundcloud,
    },
  ].filter((item) => item.value);

  return (
    <div className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-[#f5f5f6] border border-black/10 rounded-[32px] shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-black/5 px-5 md:px-7 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-1">
              Profilo artista
            </p>

            <h2 className="text-2xl md:text-3xl font-black tracking-[-0.04em]">
              {artist.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-[#f5f5f6] border border-black/5 font-black text-xl hover:bg-black hover:text-white transition"
          >
            ×
          </button>
        </div>

        <div className="p-5 md:p-7">
          <div className="grid lg:grid-cols-[420px_1fr] gap-6">
            <aside className="space-y-5">
              <div className="bg-white border border-black/5 rounded-[28px] p-5 shadow-sm">
                <div className="w-full aspect-[4/5] rounded-[24px] bg-[#f5f5f6] border border-black/5 overflow-hidden">
                  {artist.photo ? (
                    <img
                      src={artist.photo}
                      alt={artist.name || "Artista TuttoEvento"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/35 font-bold">
                      Nessuna foto
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-[3px] text-[#ff5a00] font-black mb-2">
                    Artista
                  </p>

                  <h3 className="text-3xl font-black tracking-[-0.04em]">
                    {artist.name}
                  </h3>

                  <p className="text-black/50 mt-2">
                    {artist.city || "Città non indicata"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    type="button"
                    onClick={handleRequestBooking}
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
              </div>

              <div className="bg-white border border-black/5 rounded-[28px] p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black">
                  Cachet indicativo
                </p>

                <p className="text-2xl font-black mt-2">
                  {artist.cachet || "Non inserito"}
                </p>
              </div>

              <div className="bg-white border border-black/5 rounded-[28px] p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black mb-3">
                  Stato
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs font-black">
                    Disponibile
                  </span>

                  {bookedSlots.length > 0 && (
                    <span className="bg-[#fff7ed] text-[#ff5a00] px-3 py-2 rounded-full text-xs font-black">
                      {bookedSlots.length} eventi confermati
                    </span>
                  )}
                </div>
              </div>
            </aside>

            <main className="space-y-5">
              <section className="bg-white border border-black/5 rounded-[28px] p-5 md:p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black mb-3">
                  Bio
                </p>

                <p className="text-black/70 leading-relaxed whitespace-pre-wrap">
                  {artist.bio || "Bio non inserita."}
                </p>
              </section>

              <div className="grid md:grid-cols-2 gap-5">
                <section className="bg-white border border-black/5 rounded-[28px] p-5 md:p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[2px] text-black/40 font-black mb-3">
                    Generi musicali
                  </p>

                  {genres.length === 0 ? (
                    <p className="text-black/45">
                      Generi non indicati.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <span
                          key={genre}
                          className="bg-[#f7f7f8] border border-black/5 px-3 py-2 rounded-full text-sm font-bold text-black/70"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                <section className="bg-white border border-black/5 rounded-[28px] p-5 md:p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[2px] text-black/40 font-black mb-3">
                    Lingue
                  </p>

                  {languages.length === 0 ? (
                    <p className="text-black/45">
                      Lingue non indicate.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {languages.map((language) => (
                        <span
                          key={language}
                          className="bg-[#f7f7f8] border border-black/5 px-3 py-2 rounded-full text-sm font-bold text-black/70"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <section className="bg-white border border-black/5 rounded-[28px] p-5 md:p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black mb-3">
                  Disponibilità / note booking
                </p>

                <p className="text-black/70 leading-relaxed whitespace-pre-wrap">
                  {artist.availability || "Disponibilità non indicata."}
                </p>
              </section>

              <section className="bg-white border border-black/5 rounded-[28px] p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <p className="text-xs uppercase tracking-[2px] text-black/40 font-black">
                    Calendario
                  </p>

                  <span className="text-xs font-black text-black/35">
                    Preview
                  </span>
                </div>

                {availableDates.length === 0 && bookedSlots.length === 0 ? (
                  <p className="text-black/45">
                    Nessuna disponibilità pubblica indicata.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#f7f7f8] border border-black/5 rounded-3xl p-4">
                      <p className="text-sm font-black mb-3">
                        Date disponibili
                      </p>

                      {availableDates.length === 0 ? (
                        <p className="text-sm text-black/45">
                          Nessuna data disponibile indicata.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableDates.slice(0, 8).map((date) => (
                            <span
                              key={date}
                              className="bg-white border border-black/5 px-3 py-2 rounded-full text-xs font-black"
                            >
                              {date}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#f7f7f8] border border-black/5 rounded-3xl p-4">
                      <p className="text-sm font-black mb-3">
                        Eventi confermati
                      </p>

                      {bookedSlots.length === 0 ? (
                        <p className="text-sm text-black/45">
                          Nessun evento confermato.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {bookedSlots.slice(0, 4).map((slot) => (
                            <div
                              key={slot.bookingId || `${slot.date}-${slot.startTime}`}
                              className="bg-white border border-black/5 rounded-2xl p-3"
                            >
                              <p className="text-sm font-black">
                                {slot.eventTitle || "Evento confermato"}
                              </p>

                              <p className="text-xs text-black/45 mt-1">
                                {slot.date} · {slot.startTime} - {slot.endTime}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className="bg-white border border-black/5 rounded-[28px] p-5 md:p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black mb-3">
                  Rider tecnico
                </p>

                <p className="text-black/70 leading-relaxed whitespace-pre-wrap">
                  {artist.rider || "Rider tecnico non inserito."}
                </p>
              </section>

              <section className="bg-white border border-black/5 rounded-[28px] p-5 md:p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black mb-3">
                  Social & streaming
                </p>

                {socials.length === 0 ? (
                  <p className="text-black/45">
                    Nessun link social inserito.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.value}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#f7f7f8] border border-black/5 rounded-2xl p-4 font-black hover:bg-black hover:text-white transition"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}