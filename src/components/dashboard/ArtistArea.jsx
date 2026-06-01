"use client";

import Input from "./Input";
import CalendarPicker from "./CalendarPicker";
import ArtistAnalytics from "./ArtistAnalytics";
import ArtistStatement from "./ArtistStatement";

/* Stile condiviso TuttoEvento: font Sora/Manrope, arancio #ff5a00, card morbide, mobile-first */

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
    reader.onloadend = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  const artistProfile = {
    cachet, bio, availability, photo, instagram, spotify, youtube, soundcloud,
    genres, city, languages, rider, availableDates, bookedDates, bookedSlots,
  };

  return (
    <div className="te-area w-full max-w-full overflow-hidden space-y-6 sm:space-y-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-area { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); }
        .te-area .te-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-area input, .te-area textarea, .te-area select { font-family:inherit; }
        .te-area textarea:focus, .te-area input:focus, .te-area select:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,0,.12); outline:none; }
      `}</style>

      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6 sm:gap-8 w-full max-w-full">
        {/* MEDIA KIT */}
        <section
          id="artist-media-kit"
          className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden scroll-mt-8"
        >
          <div className="mb-6 sm:mb-7">
            <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-2">Media Kit</p>
            <h2 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">Profilo Artista</h2>
            <p className="text-[var(--muted)] mt-2">Crea il tuo profilo professionale TuttoEvento.</p>
          </div>

          <form onSubmit={saveArtistProfile} className="space-y-4">
            <div className="bg-[var(--paper)] border border-black/5 rounded-3xl p-4 overflow-hidden">
              <p className="text-sm font-bold mb-3">Foto profilo</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-28 h-28 rounded-3xl bg-white border border-black/10 overflow-hidden flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                  {photo ? (
                    <img src={photo} alt="Foto profilo artista" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-black/35 font-bold text-center px-3">Nessuna foto</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    Carica una foto profilo in formato JPG. Verrà usata nel media kit e nel marketplace artisti.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <label className="cursor-pointer bg-[var(--ink)] text-white px-4 py-3 rounded-2xl font-bold text-sm hover:scale-[1.02] transition inline-block">
                      Carica JPG
                      <input type="file" accept="image/jpeg,image/jpg" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                    {photo && (
                      <button type="button" onClick={() => setPhoto("")} className="text-sm font-bold text-black/45 hover:text-black">
                        Rimuovi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Input placeholder="Cachet es. € 800" value={cachet} onChange={setCachet} />

            <textarea
              placeholder="Bio artista"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 min-h-[140px] transition"
            />

            <textarea
              placeholder="Disponibilità / note booking"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 min-h-[100px] transition"
            />

            <div className="pt-3">
              <p className="text-sm font-bold mb-3">Social &amp; Streaming</p>
              <div className="space-y-3">
                <Input placeholder="Instagram URL" value={instagram} onChange={setInstagram} />
                <Input placeholder="Spotify URL" value={spotify} onChange={setSpotify} />
                <Input placeholder="YouTube URL" value={youtube} onChange={setYoutube} />
                <Input placeholder="SoundCloud URL" value={soundcloud} onChange={setSoundcloud} />
              </div>
            </div>

            <div className="pt-3">
              <p className="text-sm font-bold mb-3">Informazioni artistiche</p>
              <div className="space-y-3">
                <Input placeholder="Generi musicali" value={genres} onChange={setGenres} />
                <Input placeholder="Città base" value={city} onChange={setCity} />
                <Input placeholder="Lingue parlate" value={languages} onChange={setLanguages} />
              </div>
            </div>

            <div className="pt-3">
              <p className="text-sm font-bold mb-3">Rider tecnico</p>
              <textarea
                placeholder="Mixer, CDJ, microfoni, impianto, richieste tecniche..."
                value={rider}
                onChange={(e) => setRider(e.target.value)}
                className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 min-h-[160px] transition"
              />
            </div>

            <button className="w-full bg-[var(--orange)] text-white rounded-2xl py-4 font-bold mt-2 hover:bg-[#e85100] transition shadow-[0_14px_30px_-12px_rgba(255,90,0,.6)]">
              Salva media kit
            </button>
          </form>

          {artistMessage && <p className="text-[var(--orange)] font-bold mt-5">{artistMessage}</p>}
        </section>

        {/* CALENDARIO */}
        <section
          id="artist-calendar"
          className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden scroll-mt-8"
        >
          <div className="mb-6 sm:mb-7">
            <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-2">Calendario</p>
            <h2 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">Disponibilità artista</h2>
            <p className="text-[var(--muted)] mt-2">Gestisci date disponibili, eventi confermati e sovrapposizioni.</p>
          </div>

          <CalendarPicker
            availableDates={availableDates}
            setAvailableDates={setAvailableDates}
            bookedDates={bookedDates}
            bookedSlots={bookedSlots}
          />

          <div className="mt-8">
            <h3 className="te-display text-lg sm:text-xl font-extrabold mb-3">Eventi confermati</h3>
            {bookedSlots.length === 0 ? (
              <p className="text-black/45">Nessun evento confermato.</p>
            ) : (
              <div className="space-y-3">
                {bookedSlots.slice(0, 6).map((slot) => (
                  <div
                    key={slot.bookingId || `${slot.date}-${slot.eventTitle}`}
                    className="border border-black/10 rounded-2xl p-4 bg-[var(--paper)] overflow-hidden"
                  >
                    <p className="font-bold break-words">{slot.eventTitle || "Evento confermato"}</p>
                    <p className="text-sm text-[var(--muted)] mt-1">{slot.date} · {slot.startTime} - {slot.endTime}</p>
                    <p className="text-sm text-[var(--muted)] mt-1 break-words">Locale: {slot.organizerName || "Non indicato"}</p>
                  </div>
                ))}
                {bookedSlots.length > 6 && (
                  <p className="text-sm text-black/40 font-bold">+ {bookedSlots.length - 6} altri eventi confermati</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <ArtistAnalytics bookings={bookings} bookedSlots={bookedSlots} />
      <ArtistStatement bookings={bookings} artistProfile={artistProfile} />
    </div>
  );
}