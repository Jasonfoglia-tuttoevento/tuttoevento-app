"use client";

import { useRef, useState } from "react";
import Input from "./Input";
import EventsTable from "./EventsTable";
import ArtistMarketplace from "./ArtistMarketplace";
import OrganizerAnalytics from "./OrganizerAnalytics";
import OrganizerStatement from "./OrganizerStatement";

export default function OrganizerArea({
  currentUser,
  events,
  artists,
  bookings = [],
  title,
  setTitle,
  date,
  setDate,
  artist,
  setArtist,
  promoter,
  setPromoter,
}) {
  const defaultMode = currentUser?.businessMode === "managed" ? "managed" : "self_service";
  const formRef = useRef(null);

  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventMode, setEventMode] = useState(defaultMode);

  function handleSelectArtist(selectedArtist) {
    setSelectedArtistId(String(selectedArtist.id));
    setArtist(selectedArtist.name || "");
    setBookingMessage((currentMessage) => {
      if (currentMessage) return currentMessage;
      return `Ciao ${selectedArtist.name}, vorrei verificare la tua disponibilità per un evento.`;
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function createEventWithBooking(e) {
    e.preventDefault();
    const selectedArtist = artists.find((a) => String(a.id) === String(selectedArtistId));
    if (!title || !date || !startTime || !endTime || !selectedArtist) {
      alert("Inserisci nome evento, data, orario e artista.");
      return;
    }

    const eventRes = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, date, startTime, endTime,
        artist: selectedArtist.name,
        artistId: selectedArtist.id,
        artistName: selectedArtist.name,
        artistCachet: selectedArtist.cachet || "",
        cachet: selectedArtist.cachet || "",
        promoter,
        organizer: currentUser.name,
        userId: currentUser.id,
        status: "draft",
        eventMode,
      }),
    });

    if (!eventRes.ok) {
      alert("Errore creazione evento");
      return;
    }

    const eventData = await eventRes.json();

    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        artistId: selectedArtist.id,
        artistName: selectedArtist.name,
        artistCachet: selectedArtist.cachet || "",
        cachet: selectedArtist.cachet || "",
        eventId: eventData.id,
        eventTitle: title,
        eventDate: date,
        startTime, endTime,
        message: bookingMessage || `Richiesta booking per ${title} del ${date} dalle ${startTime} alle ${endTime}`,
      }),
    });

    const bookingData = await bookingRes.json();

    if (!bookingRes.ok) {
      alert(bookingData.error || "Evento creato, ma errore invio richiesta artista.");
      return;
    }

    window.dispatchEvent(
      new CustomEvent("tuttoevento:open-chat", {
        detail: {
          participantUserId: Number(selectedArtist.id),
          bookingId: bookingData.id,
          eventId: eventData.id,
          title: `Booking · ${selectedArtist.name}`,
        },
      })
    );

    setTitle(""); setDate(""); setArtist(""); setPromoter("");
    setSelectedArtistId(""); setBookingMessage(""); setStartTime(""); setEndTime("");
    setEventMode(defaultMode);

    alert("Evento creato, richiesta inviata e chat aperta con l'artista.");
  }

  return (
    <div className="te-area w-full max-w-full overflow-hidden space-y-6 sm:space-y-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-area { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); }
        .te-area .te-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-area input, .te-area textarea, .te-area select { font-family:inherit; }
        .te-area input:focus, .te-area textarea:focus, .te-area select:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,0,.12); outline:none; }
      `}</style>

      <div className="grid grid-cols-1 xl:grid-cols-[500px_1fr] gap-6 sm:gap-8 w-full max-w-full">
        <section
          id="organizer-booking"
          ref={formRef}
          className="bg-white border border-black/5 rounded-3xl sm:rounded-[28px] p-5 md:p-7 shadow-sm scroll-mt-8 overflow-hidden"
        >
          <div className="mb-6 sm:mb-7">
            <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-2">Nuovo booking</p>
            <h2 className="te-display text-2xl sm:text-3xl font-extrabold leading-tight">Crea Evento</h2>
            <p className="text-[var(--muted)] mt-2">Crea l'evento, scegli artista e modalità di gestione.</p>
          </div>

          <form onSubmit={createEventWithBooking} className="space-y-4">
            <Input placeholder="Nome evento" value={title} onChange={setTitle} />
            <Input type="date" value={date} onChange={setDate} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input type="time" value={startTime} onChange={setStartTime} />
              <Input type="time" value={endTime} onChange={setEndTime} />
            </div>

            <div className="bg-[var(--paper)] border border-black/10 rounded-2xl p-4 overflow-hidden">
              <p className="text-sm font-bold mb-3">Modalità evento</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEventMode("self_service")}
                  className={
                    eventMode === "self_service"
                      ? "bg-[var(--ink)] text-white rounded-2xl p-4 text-left transition"
                      : "bg-white border border-black/10 rounded-2xl p-4 text-left hover:border-[var(--orange)]/40 transition"
                  }
                >
                  <p className="font-bold">Gestione Autonoma</p>
                  <p className="text-xs opacity-70 mt-1">Il locale gestisce direttamente evento e artista.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setEventMode("managed")}
                  className={
                    eventMode === "managed"
                      ? "bg-[var(--orange)] text-white rounded-2xl p-4 text-left transition"
                      : "bg-white border border-black/10 rounded-2xl p-4 text-left hover:border-[var(--orange)]/40 transition"
                  }
                >
                  <p className="font-bold">Gestione TuttoEvento</p>
                  <p className="text-xs opacity-70 mt-1">Evento seguito da un referente TuttoEvento.</p>
                </button>
              </div>

              {eventMode === "managed" && (
                <div className="mt-4 bg-[var(--orange)]/10 border border-[var(--orange)]/20 rounded-2xl p-4">
                  <p className="font-bold text-[var(--orange)]">Evento Managed</p>
                  <p className="text-sm text-black/60 mt-1">
                    Questo evento entrerà nella pipeline interna TuttoEvento per gestione completa, referente e supporto.
                  </p>
                </div>
              )}
            </div>

            <select
              value={selectedArtistId}
              onChange={(e) => {
                setSelectedArtistId(e.target.value);
                const selected = artists.find((a) => String(a.id) === String(e.target.value));
                setArtist(selected?.name || "");
              }}
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 transition"
            >
              <option value="">Seleziona artista</option>
              {artists.map((artistItem) => (
                <option key={artistItem.id} value={artistItem.id}>
                  {artistItem.name} · {artistItem.cachet || "Cachet non inserito"}
                </option>
              ))}
            </select>

            {artist && (
              <div className="bg-[var(--ink)] text-white rounded-2xl p-4 overflow-hidden">
                <p className="text-xs uppercase tracking-[0.15em] text-white/45 font-bold">Artista selezionato</p>
                <p className="font-bold mt-1 break-words">{artist}</p>
              </div>
            )}

            <Input placeholder="Promoter" value={promoter} onChange={setPromoter} />

            <textarea
              placeholder="Messaggio per l'artista"
              value={bookingMessage}
              onChange={(e) => setBookingMessage(e.target.value)}
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl p-4 min-h-[120px] transition"
            />

            <button className="w-full bg-[var(--orange)] text-white rounded-2xl py-4 font-bold hover:bg-[#e85100] transition shadow-[0_14px_30px_-12px_rgba(255,90,0,.6)]">
              Crea evento e invia richiesta
            </button>
          </form>
        </section>

        <section id="organizer-events" className="scroll-mt-8 w-full max-w-full overflow-hidden">
          <EventsTable events={events} />
        </section>
      </div>

      <OrganizerAnalytics events={events} bookings={bookings} />
      <OrganizerStatement events={events} bookings={bookings} />

      <section id="artist-marketplace" className="scroll-mt-8 w-full max-w-full overflow-hidden">
        <ArtistMarketplace artists={artists} currentUser={currentUser} onSelectArtist={handleSelectArtist} />
      </section>
    </div>
  );
}