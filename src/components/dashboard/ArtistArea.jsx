"use client";

import Input from "./Input";
import CalendarPicker from "./CalendarPicker";
import ArtistAnalytics from "./ArtistAnalytics";
import ArtistStatement from "./ArtistStatement";

export default function ArtistArea({
  cachet,
  setCachet,
  bio,
  setBio,
  availability,
  setAvailability,

  photo,
  setPhoto,

  instagram,
  setInstagram,

  spotify,
  setSpotify,

  youtube,
  setYoutube,

  soundcloud,
  setSoundcloud,

  genres,
  setGenres,

  city,
  setCity,

  languages,
  setLanguages,

  rider,
  setRider,

  availableDates,
  setAvailableDates,

  bookedDates = [],
  bookedSlots = [],

  bookings = [],

  saveArtistProfile,
  artistMessage,
}) {
  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const isJpg =
      file.type === "image/jpeg" ||
      file.name.toLowerCase().endsWith(".jpg") ||
      file.name.toLowerCase().endsWith(".jpeg");

    if (!isJpg) {
      alert("Carica solo immagini in formato JPG.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  }

  const artistProfile = {
    cachet,
    bio,
    availability,
    photo,
    instagram,
    spotify,
    youtube,
    soundcloud,
    genres,
    city,
    languages,
    rider,
    availableDates,
    bookedDates,
    bookedSlots,
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-8 w-full max-w-full">
        <section
          id="artist-media-kit"
          className="bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden scroll-mt-8"
        >
          <div className="mb-7">
            <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
              Media Kit
            </p>

            <h2 className="text-3xl font-black tracking-[-0.04em] leading-tight">
              Profilo Artista
            </h2>

            <p className="text-black/50 mt-2">
              Crea il tuo profilo professionale TuttoEvento.
            </p>
          </div>

          <form onSubmit={saveArtistProfile} className="space-y-4">
            <div className="bg-[#fafafa] border border-black/5 rounded-[24px] p-4 overflow-hidden">
              <p className="text-sm font-black mb-3">Foto profilo</p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-28 h-28 rounded-3xl bg-white border border-black/10 overflow-hidden flex items-center justify-center shrink-0">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Foto profilo artista"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-black/35 font-bold text-center px-3">
                      Nessuna foto
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-black/50 leading-relaxed">
                    Carica una foto profilo in formato JPG. Verrà usata nel
                    media kit e nel marketplace artisti.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <label className="cursor-pointer bg-[#111] text-white px-4 py-3 rounded-2xl font-black text-sm">
                      Carica JPG
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>

                    {photo && (
                      <button
                        type="button"
                        onClick={() => setPhoto("")}
                        className="text-sm font-bold text-black/45 hover:text-black"
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Input
              placeholder="Cachet es. € 800"
              value={cachet}
              onChange={setCachet}
            />

            <textarea
              placeholder="Bio artista"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none min-h-[140px]"
            />

            <textarea
              placeholder="Disponibilità / note booking"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none min-h-[100px]"
            />

            <div className="pt-4">
              <p className="text-sm font-black mb-3">Social & Streaming</p>

              <div className="space-y-3">
                <Input
                  placeholder="Instagram URL"
                  value={instagram}
                  onChange={setInstagram}
                />

                <Input
                  placeholder="Spotify URL"
                  value={spotify}
                  onChange={setSpotify}
                />

                <Input
                  placeholder="YouTube URL"
                  value={youtube}
                  onChange={setYoutube}
                />

                <Input
                  placeholder="SoundCloud URL"
                  value={soundcloud}
                  onChange={setSoundcloud}
                />
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm font-black mb-3">
                Informazioni artistiche
              </p>

              <div className="space-y-3">
                <Input
                  placeholder="Generi musicali"
                  value={genres}
                  onChange={setGenres}
                />

                <Input
                  placeholder="Città base"
                  value={city}
                  onChange={setCity}
                />

                <Input
                  placeholder="Lingue parlate"
                  value={languages}
                  onChange={setLanguages}
                />
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm font-black mb-3">Rider tecnico</p>

              <textarea
                placeholder="Mixer, CDJ, microfoni, impianto, richieste tecniche..."
                value={rider}
                onChange={(e) => setRider(e.target.value)}
                className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none min-h-[160px]"
              />
            </div>

            <button className="w-full bg-[#ff5a00] text-white rounded-2xl py-4 font-black mt-4">
              SALVA MEDIA KIT
            </button>
          </form>

          {artistMessage && (
            <p className="text-[#ff5a00] font-bold mt-5">
              {artistMessage}
            </p>
          )}
        </section>

        <section
          id="artist-calendar"
          className="bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden scroll-mt-8"
        >
          <div className="mb-7">
            <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
              Calendario
            </p>

            <h2 className="text-3xl font-black tracking-[-0.04em] leading-tight">
              Disponibilità artista
            </h2>

            <p className="text-black/50 mt-2">
              Gestisci date disponibili, eventi confermati e sovrapposizioni.
            </p>
          </div>

          <CalendarPicker
            availableDates={availableDates}
            setAvailableDates={setAvailableDates}
            bookedDates={bookedDates}
            bookedSlots={bookedSlots}
          />

          <div className="mt-8">
            <h3 className="text-xl font-black mb-3">
              Eventi confermati
            </h3>

            {bookedSlots.length === 0 ? (
              <p className="text-black/45">
                Nessun evento confermato.
              </p>
            ) : (
              <div className="space-y-3">
                {bookedSlots.slice(0, 6).map((slot) => (
                  <div
                    key={slot.bookingId || `${slot.date}-${slot.eventTitle}`}
                    className="border border-black/10 rounded-2xl p-4 bg-[#fafafa] overflow-hidden"
                  >
                    <p className="font-black break-words">
                      {slot.eventTitle || "Evento confermato"}
                    </p>

                    <p className="text-sm text-black/50 mt-1">
                      {slot.date} · {slot.startTime} - {slot.endTime}
                    </p>

                    <p className="text-sm text-black/50 mt-1 break-words">
                      Locale: {slot.organizerName || "Non indicato"}
                    </p>
                  </div>
                ))}

                {bookedSlots.length > 6 && (
                  <p className="text-sm text-black/40 font-bold">
                    + {bookedSlots.length - 6} altri eventi confermati
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <ArtistAnalytics
        bookings={bookings}
        bookedSlots={bookedSlots}
      />

      <ArtistStatement
        bookings={bookings}
        artistProfile={artistProfile}
      />
    </div>
  );
}