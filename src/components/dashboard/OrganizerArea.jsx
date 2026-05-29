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
  const defaultMode =
    currentUser?.businessMode === "managed" ? "managed" : "self_service";

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

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function createEventWithBooking(e) {
    e.preventDefault();

    const selectedArtist = artists.find(
      (a) => String(a.id) === String(selectedArtistId)
    );

    if (!title || !date || !startTime || !endTime || !selectedArtist) {
      alert("Inserisci nome evento, data, orario e artista.");
      return;
    }

    const eventRes = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        date,
        startTime,
        endTime,
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
      headers: {
        "Content-Type": "application/json",
      },
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
        startTime,
        endTime,
        message:
          bookingMessage ||
          `Richiesta booking per ${title} del ${date} dalle ${startTime} alle ${endTime}`,
      }),
    });

    const bookingData = await bookingRes.json();

    if (!bookingRes.ok) {
      alert(
        bookingData.error ||
          "Evento creato, ma errore invio richiesta artista."
      );
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

    setTitle("");
    setDate("");
    setArtist("");
    setPromoter("");
    setSelectedArtistId("");
    setBookingMessage("");
    setStartTime("");
    setEndTime("");
    setEventMode(defaultMode);

    alert("Evento creato, richiesta inviata e chat aperta con l'artista.");
  }

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-[500px_1fr] gap-8 w-full max-w-full">
        <section
          id="organizer-booking"
          ref={formRef}
          className="bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm scroll-mt-8 overflow-hidden"
        >
          <div className="mb-7">
            <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
              Nuovo booking
            </p>

            <h2 className="text-3xl font-black tracking-[-0.04em] leading-tight">
              Crea Evento
            </h2>

            <p className="text-black/50 mt-2">
              Crea l’evento, scegli artista e modalità di gestione.
            </p>
          </div>

          <form onSubmit={createEventWithBooking} className="space-y-4">
            <Input
              placeholder="Nome evento"
              value={title}
              onChange={setTitle}
            />

            <Input
              type="date"
              value={date}
              onChange={setDate}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="time"
                value={startTime}
                onChange={setStartTime}
              />

              <Input
                type="time"
                value={endTime}
                onChange={setEndTime}
              />
            </div>

            <div className="bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 overflow-hidden">
              <p className="text-sm font-black mb-3">
                Modalità evento
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEventMode("self_service")}
                  className={
                    eventMode === "self_service"
                      ? "bg-[#111] text-white rounded-2xl p-4 text-left"
                      : "bg-white border border-black/10 rounded-2xl p-4 text-left"
                  }
                >
                  <p className="font-black">
                    Gestione Autonoma
                  </p>

                  <p className="text-xs opacity-70 mt-1">
                    Il locale gestisce direttamente evento e artista.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEventMode("managed")}
                  className={
                    eventMode === "managed"
                      ? "bg-[#ff5a00] text-white rounded-2xl p-4 text-left"
                      : "bg-white border border-black/10 rounded-2xl p-4 text-left"
                  }
                >
                  <p className="font-black">
                    Gestione TuttoEvento
                  </p>

                  <p className="text-xs opacity-70 mt-1">
                    Evento seguito da un referente TuttoEvento.
                  </p>
                </button>
              </div>

              {eventMode === "managed" && (
                <div className="mt-4 bg-[#ff5a00]/10 border border-[#ff5a00]/20 rounded-2xl p-4">
                  <p className="font-black text-[#ff5a00]">
                    Evento Managed
                  </p>

                  <p className="text-sm text-black/60 mt-1">
                    Questo evento entrerà nella futura pipeline interna
                    TuttoEvento per gestione completa, referente e supporto.
                  </p>
                </div>
              )}
            </div>

            <select
              value={selectedArtistId}
              onChange={(e) => {
                setSelectedArtistId(e.target.value);

                const selected = artists.find(
                  (a) => String(a.id) === String(e.target.value)
                );

                setArtist(selected?.name || "");
              }}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none focus:border-[#ff5a00]"
            >
              <option value="">Seleziona artista</option>

              {artists.map((artistItem) => (
                <option key={artistItem.id} value={artistItem.id}>
                  {artistItem.name} ·{" "}
                  {artistItem.cachet || "Cachet non inserito"}
                </option>
              ))}
            </select>

            {artist && (
              <div className="bg-[#111] text-white rounded-2xl p-4 overflow-hidden">
                <p className="text-xs uppercase tracking-[2px] text-white/45 font-black">
                  Artista selezionato
                </p>

                <p className="font-black mt-1 break-words">
                  {artist}
                </p>
              </div>
            )}

            <Input
              placeholder="Promoter"
              value={promoter}
              onChange={setPromoter}
            />

            <textarea
              placeholder="Messaggio per l'artista"
              value={bookingMessage}
              onChange={(e) => setBookingMessage(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none focus:border-[#ff5a00] min-h-[120px]"
            />

            <button className="w-full bg-[#ff5a00] text-white rounded-2xl py-4 font-black shadow-lg shadow-orange-500/20">
              CREA EVENTO E INVIA RICHIESTA
            </button>
          </form>
        </section>

        <section id="organizer-events" className="scroll-mt-8 w-full max-w-full overflow-hidden">
          <EventsTable events={events} />
        </section>
      </div>

      <OrganizerAnalytics
        events={events}
        bookings={bookings}
      />

      <OrganizerStatement
        events={events}
        bookings={bookings}
      />

      <section id="artist-marketplace" className="scroll-mt-8 w-full max-w-full overflow-hidden">
        <ArtistMarketplace
          artists={artists}
          currentUser={currentUser}
          onSelectArtist={handleSelectArtist}
        />
      </section>
    </div>
  );
}