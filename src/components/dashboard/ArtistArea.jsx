"use client";

import { useState } from "react";
import CalendarPicker from "./CalendarPicker";
import ArtistCalendar from "./ArtistCalendar";
import ArtistAnalytics from "./ArtistAnalytics";
import ArtistStatement from "./ArtistStatement";

const ARTIST_TYPES = [
  "DJ","Band","Cantante","Musicista","Duo","Performer","Intrattenitore",
];

const MUSIC_GENRES = [
  "Pop","Rock","House","Tech House","Techno","Commerciale","Reggaeton",
  "Acustico","Cover Band","Tribute Band","Piano Bar",
];

const EVENT_TYPES = [
  { id: "serata_locale_1h", label: "Serata Locale (1H)" },
  { id: "serata_locale_2h", label: "Serata Locale (2H)" },
  { id: "matrimonio", label: "Matrimonio" },
  { id: "festa_di_piazza", label: "Festa di Piazza" },
];

export default function ArtistArea({
  stageName = "",
  setStageName,
  artistType = "",
  setArtistType,
  membersCount = "",
  setMembersCount,
  musicGenres = [],
  setMusicGenres,
  eventTypes = [],
  setEventTypes,
  pricing = {},
  setPricing,
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
  tiktok = "",
  setTiktok,
  city,
  setCity,
  rider,
  setRider,
  availableDates,
  setAvailableDates,
  bookedDates = [],
  bookedSlots = [],
  bookings = [],
  saveArtistProfile,
  artistMessage,
  currentUser,
}) {
  const [activeTab, setActiveTab] = useState("profile");

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

  function toggleArrayValue(value, list, setter) {
    if (!setter) return;
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  }

  function updatePricing(eventTypeId, field, value) {
    if (!setPricing) return;
    setPricing({
      ...pricing,
      [eventTypeId]: { ...(pricing[eventTypeId] || {}), [field]: value },
    });
  }

  function getEventLabel(id) {
    return EVENT_TYPES.find((item) => item.id === id)?.label || id;
  }

  const artistProfile = {
    cachet, stageName, artistType, membersCount, musicGenres, eventTypes,
    pricing, bio, availability, photo, instagram, spotify, youtube,
    soundcloud, tiktok, city, rider, availableDates, bookedDates, bookedSlots,
  };

  return (
    <div className="te-area w-full max-w-full overflow-hidden space-y-6 sm:space-y-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-area { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); }
        .te-area .te-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-area input,.te-area textarea,.te-area select { font-family:inherit; }
        .te-area textarea:focus,.te-area input:focus,.te-area select:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,0,.12); outline:none; }
        .te-area .te-compact-input { min-height:54px; }
        .te-area .te-scroll-thin { scrollbar-width:thin; }
        @media(max-width:640px){
          .te-area { overflow-x:hidden; }
          .te-area input,.te-area textarea,.te-area select { font-size:16px; }
          .te-area .te-mobile-card { border-radius:22px; padding:18px; }
        }
      `}</style>

      {/* ── Tab navigation ── */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {[
          { id:"profile",   label:"🎤 Media Kit"  },
          { id:"calendar",  label:"📅 Calendario" },
          { id:"analytics", label:"📊 Analitiche" },
          { id:"statement", label:"💰 Estratto"   },
        ].map(t => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
            style={{ padding:"7px 16px", borderRadius:100, fontWeight:700, fontSize:13,
              cursor:"pointer", fontFamily:"inherit", border:"none",
              background: activeTab===t.id ? "#0a0a0b" : "rgba(0,0,0,.07)",
              color: activeTab===t.id ? "white" : "#6b6b73", transition:"all .2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Calendario avanzato ── */}
      {activeTab === "calendar" && (
        <ArtistCalendar
          bookings={bookings}
          availableDates={availableDates}
          bookedDates={bookedDates}
        />
      )}

      {/* ── Tab: Analitiche ── */}
      {activeTab === "analytics" && (
        <ArtistAnalytics currentUser={currentUser} bookings={bookings} />
      )}

      {/* ── Tab: Estratto conto ── */}
      {activeTab === "statement" && (
        <ArtistStatement bookings={bookings} artistProfile={artistProfile} />
      )}

      {/* ── Tab: Media Kit (contenuto originale completo) ── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_430px] gap-6 sm:gap-8 w-full max-w-full items-start">
          <section
            id="artist-media-kit"
            className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden scroll-mt-8 te-mobile-card"
          >
            <div className="mb-5 sm:mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-2">Media Kit</p>
                <h2 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">Profilo Artista</h2>
                <p className="text-[var(--muted)] mt-2 max-w-2xl">
                  Compila le informazioni principali del tuo progetto artistico.
                  Su desktop i campi sono ottimizzati per occupare meno spazio verticale.
                </p>
              </div>
              <button
                form="artist-profile-form"
                className="hidden lg:inline-flex bg-[var(--orange)] text-white rounded-2xl px-6 py-3 font-bold hover:bg-[#e85100] transition shadow-[0_14px_30px_-12px_rgba(255,90,0,.6)]"
              >
                Salva media kit
              </button>
            </div>

            <form id="artist-profile-form" onSubmit={saveArtistProfile} className="space-y-5">
              {/* Foto profilo */}
              <div className="bg-[var(--paper)] border border-black/5 rounded-3xl p-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-black/10 overflow-hidden flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                    {photo ? (
                      <img src={photo} alt="Foto profilo artista" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-black/35 font-bold text-center px-3">Nessuna foto</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold mb-1">Foto profilo</p>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      Carica una foto JPG. Verrà usata nel media kit e nel marketplace artisti.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Field label="Nome artistico / progetto">
                  <input value={stageName} onChange={(e) => setStageName?.(e.target.value)}
                    placeholder="Es. DJ Mario, The Black Notes"
                    className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 transition te-compact-input" />
                </Field>

                <Field label="Città base">
                  <input value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="Es. Napoli"
                    className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 transition te-compact-input" />
                </Field>

                <Field label="Tipologia">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ARTIST_TYPES.map((type) => (
                      <ChoiceButton key={type} active={artistType === type}
                        onClick={() => { setArtistType?.(type); if (type !== "Band") setMembersCount?.(""); }}>
                        {type}
                      </ChoiceButton>
                    ))}
                  </div>
                </Field>

                {artistType === "Band" ? (
                  <Field label="Numero componenti">
                    <select value={membersCount} onChange={(e) => setMembersCount?.(e.target.value)}
                      className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 transition te-compact-input">
                      <option value="">Seleziona numero componenti</option>
                      {Array.from({ length: 9 }).map((_, index) => {
                        const value = index + 4;
                        return <option key={value} value={value}>{value}</option>;
                      })}
                    </select>
                  </Field>
                ) : (
                  <Field label="Tipologie eventi">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {EVENT_TYPES.map((eventType) => (
                        <ChoiceButton key={eventType.id} active={eventTypes.includes(eventType.id)} full
                          onClick={() => toggleArrayValue(eventType.id, eventTypes, setEventTypes)}>
                          {eventType.label}
                        </ChoiceButton>
                      ))}
                    </div>
                  </Field>
                )}

                {artistType === "Band" && (
                  <div className="lg:col-span-2">
                    <Field label="Tipologie eventi">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {EVENT_TYPES.map((eventType) => (
                          <ChoiceButton key={eventType.id} active={eventTypes.includes(eventType.id)} full
                            onClick={() => toggleArrayValue(eventType.id, eventTypes, setEventTypes)}>
                            {eventType.label}
                          </ChoiceButton>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                <div className="lg:col-span-2">
                  <Field label="Bio artista">
                    <textarea placeholder="Racconta chi sei, cosa proponi e che tipo di esperienza porti sul palco."
                      value={bio} onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 min-h-[100px] sm:min-h-[110px] transition" />
                  </Field>
                </div>

                <Field label="Disponibilità / note booking">
                  <textarea placeholder="Preferenze, limitazioni o note utili per le richieste booking."
                    value={availability} onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 min-h-[92px] transition" />
                </Field>

                <Field label="Service">
                  <textarea placeholder="Impianto audio, luci, backline, hospitality o altre esigenze."
                    value={rider} onChange={(e) => setRider(e.target.value)}
                    className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 min-h-[92px] transition" />
                </Field>

                <div className="lg:col-span-2">
                  <Field label="Social & Streaming">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                      <input placeholder="Instagram URL" value={instagram} onChange={(e) => setInstagram(e.target.value)}
                        className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 transition te-compact-input" />
                      <input placeholder="Spotify URL" value={spotify} onChange={(e) => setSpotify(e.target.value)}
                        className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 transition te-compact-input" />
                      <input placeholder="YouTube URL" value={youtube} onChange={(e) => setYoutube(e.target.value)}
                        className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 transition te-compact-input" />
                      <input placeholder="SoundCloud URL" value={soundcloud} onChange={(e) => setSoundcloud(e.target.value)}
                        className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 transition te-compact-input" />
                      <input placeholder="TikTok URL" value={tiktok} onChange={(e) => setTiktok?.(e.target.value)}
                        className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 transition te-compact-input" />
                    </div>
                  </Field>
                </div>

                <div className="lg:col-span-2">
                  <Field label="Generi musicali">
                    <div className="flex flex-wrap gap-2">
                      {MUSIC_GENRES.map((genre) => (
                        <ChoiceButton key={genre} active={musicGenres.includes(genre)}
                          onClick={() => toggleArrayValue(genre, musicGenres, setMusicGenres)}>
                          {genre}
                        </ChoiceButton>
                      ))}
                    </div>
                  </Field>
                </div>

                {eventTypes.length > 0 && (
                  <div className="lg:col-span-2">
                    <Field label="Compensi indicativi">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {eventTypes.map((eventTypeId) => (
                          <div key={eventTypeId} className="bg-[var(--paper)] border border-black/5 rounded-3xl p-4">
                            <p className="font-extrabold mb-3 text-sm">{getEventLabel(eventTypeId)}</p>
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <p className="text-xs font-bold text-black/45 mb-2">Cachet minimo</p>
                                <input type="number" min="0" placeholder="Es. 150"
                                  value={pricing?.[eventTypeId]?.min || ""}
                                  onChange={(e) => updatePricing(eventTypeId, "min", e.target.value)}
                                  className="w-full bg-white border border-black/10 rounded-2xl p-3 transition" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-black/45 mb-2">Cachet ideale</p>
                                <input type="number" min="0" placeholder="Es. 250"
                                  value={pricing?.[eventTypeId]?.ideal || ""}
                                  onChange={(e) => updatePricing(eventTypeId, "ideal", e.target.value)}
                                  className="w-full bg-white border border-black/10 rounded-2xl p-3 transition" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-black/45 leading-relaxed mt-3">
                        I compensi indicati aiutano TuttoEvento a proporre l'artista
                        in modo corretto in base alla tipologia di evento e ai servizi richiesti.
                      </p>
                    </Field>
                  </div>
                )}
              </div>

              <button className="w-full lg:hidden bg-[var(--orange)] text-white rounded-2xl py-4 font-bold mt-2 hover:bg-[#e85100] transition shadow-[0_14px_30px_-12px_rgba(255,90,0,.6)]">
                Salva media kit
              </button>
            </form>

            {artistMessage && (
              <p className="text-[var(--orange)] font-bold mt-5">{artistMessage}</p>
            )}
          </section>

          {/* Sidebar: CalendarPicker compatto + eventi confermati */}
          <aside className="space-y-6 xl:sticky xl:top-24">
            <section
              id="artist-calendar"
              className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden scroll-mt-8 te-mobile-card"
            >
              <div className="mb-6 sm:mb-7">
                <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-2">Calendario</p>
                <h2 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">Date occupate</h2>
                <p className="text-[var(--muted)] mt-2">Indicaci le date in cui sei già occupato/a.</p>
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
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 te-scroll-thin">
                    {bookedSlots.slice(0, 8).map((slot) => (
                      <div
                        key={slot.bookingId || `${slot.date}-${slot.eventTitle}`}
                        className="border border-black/10 rounded-2xl p-4 bg-[var(--paper)] overflow-hidden"
                      >
                        <p className="font-bold break-words">{slot.eventTitle || "Evento confermato"}</p>
                        <p className="text-sm text-[var(--muted)] mt-1">{slot.date} · {slot.startTime} - {slot.endTime}</p>
                        <p className="text-sm text-[var(--muted)] mt-1 break-words">Locale: {slot.organizerName || "Non indicato"}</p>
                      </div>
                    ))}
                    {bookedSlots.length > 8 && (
                      <p className="text-sm text-black/40 font-bold">+ {bookedSlots.length - 8} altri eventi confermati</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm font-bold mb-3">{label}</p>
      {children}
    </div>
  );
}

function ChoiceButton({ active, onClick, children, full = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? `${full ? "w-full text-left" : ""} bg-[#ff5a00] text-white border border-[#ff5a00] rounded-2xl px-4 py-3 font-bold text-sm transition`
          : `${full ? "w-full text-left" : ""} bg-[#fbfaf8] text-black/65 border border-black/10 rounded-2xl px-4 py-3 font-bold text-sm hover:border-[#ff5a00]/40 transition`
      }
    >
      {children}
    </button>
  );
}