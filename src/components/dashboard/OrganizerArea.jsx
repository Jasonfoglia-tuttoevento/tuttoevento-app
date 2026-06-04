"use client";

import { useRef, useState, useEffect } from "react";
import Input from "./Input";
import EventsTable from "./EventsTable";
import ArtistMarketplace from "./ArtistMarketplace";
import OrganizerAnalytics from "./OrganizerAnalytics";
import OrganizerStatement from "./OrganizerStatement";

const TABS = [
  { id: "booking", label: "Nuovo booking" },
  { id: "events", label: "I miei eventi" },
  { id: "marketplace", label: "Marketplace" },
  { id: "mediakit", label: "Media Kit locale" },
  { id: "analytics", label: "Analitiche" },
];

export default function OrganizerArea({
  currentUser,
  events,
  artists,
  bookings = [],
  title, setTitle,
  date, setDate,
  artist, setArtist,
  promoter, setPromoter,
}) {
  const defaultMode = currentUser?.businessMode === "managed" ? "managed" : "self_service";
  const formRef = useRef(null);
  const [activeTab, setActiveTab] = useState("booking");

  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventMode, setEventMode] = useState(defaultMode);

  // Media kit locale
  const [venueName, setVenueName] = useState(currentUser?.name || "");
  const [venueCity, setVenueCity] = useState("");
  const [venueType, setVenueType] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("");
  const [venueDescription, setVenueDescription] = useState("");
  const [venueInstagram, setVenueInstagram] = useState("");
  const [venueSaving, setVenueSaving] = useState(false);
  const [venueMsg, setVenueMsg] = useState("");
  const [eventBudget, setEventBudget] = useState("");
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetMsg, setBudgetMsg] = useState("");

  function handleSelectArtist(selectedArtist) {
    setSelectedArtistId(String(selectedArtist.id));
    setArtist(selectedArtist.name || "");
    setBookingMessage(m => m || `Ciao ${selectedArtist.name}, vorrei verificare la tua disponibilità.`);
    setActiveTab("booking");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveVenueProfile(e) {
    e.preventDefault();
    setVenueSaving(true); setVenueMsg("");
    try {
      const res = await fetch("/api/venue-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueName, city: venueCity, venueType,
          capacity: venueCapacity ? Number(venueCapacity) : null,
          description: venueDescription, instagram: venueInstagram,
        }),
      });
      if (res.ok) setVenueMsg("Profilo locale salvato ✓");
      else setVenueMsg("Errore salvataggio");
    } catch { setVenueMsg("Errore tecnico"); }
    finally { setVenueSaving(false); }
  }

  async function createEventWithBooking(e) {
    e.preventDefault();
    const sel = artists.find(a => String(a.id) === String(selectedArtistId));
    if (!title || !date || !startTime || !endTime || !sel) {
      alert("Inserisci nome evento, data, orario e artista."); return;
    }
    const evRes = await fetch("/api/events", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, startTime, endTime, artist: sel.name, artistId: sel.id,
        artistName: sel.name, artistCachet: sel.cachet || "", cachet: sel.cachet || "",
        promoter, organizer: currentUser.name, userId: currentUser.id, status: "draft", eventMode }),
    });
    if (!evRes.ok) { alert("Errore creazione evento"); return; }
    const evData = await evRes.json();
    const bkRes = await fetch("/api/bookings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizerId: currentUser.id, organizerName: currentUser.name,
        artistId: sel.id, artistName: sel.name, artistCachet: sel.cachet || "",
        cachet: sel.cachet || "", eventId: evData.id, eventTitle: title, eventDate: date,
        startTime, endTime, message: bookingMessage || `Richiesta booking per ${title}` }),
    });
    const bkData = await bkRes.json();
    if (!bkRes.ok) { alert(bkData.error || "Evento creato, errore richiesta artista"); return; }
    window.dispatchEvent(new CustomEvent("tuttoevento:open-chat", {
      detail: { participantUserId: Number(sel.id), bookingId: bkData.id, eventId: evData.id, title: `Booking · ${sel.name}` },
    }));
    setTitle(""); setDate(""); setArtist(""); setPromoter("");
    setSelectedArtistId(""); setBookingMessage(""); setStartTime(""); setEndTime("");
    setEventMode(defaultMode);
    alert("Evento creato, richiesta inviata e chat aperta.");
  }

  // Carica profilo venue esistente all'avvio
  useEffect(() => {
    fetch("/api/venue-profile").then(r => r.json()).then(d => {
      if (!d || d.error) return;
      if (d.venue_name) setVenueName(d.venue_name);
      if (d.city) setVenueCity(d.city);
      if (d.venue_type) setVenueType(d.venue_type);
      if (d.capacity) setVenueCapacity(String(d.capacity));
      if (d.description) setVenueDescription(d.description);
      if (d.instagram) setVenueInstagram(d.instagram);
    }).catch(() => {});
  }, []);

  async function saveBudget(e) {
    e.preventDefault();
    setBudgetSaving(true);
    setBudgetMsg("");
    try {
      const res = await fetch("/api/users/update-budget", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventBudget: eventBudget ? Number(eventBudget) : null }),
      });
      if (res.ok) setBudgetMsg("Budget salvato ✓");
      else setBudgetMsg("Errore salvataggio");
    } catch { setBudgetMsg("Errore tecnico"); }
    finally { setBudgetSaving(false); }
  }

  return (
    <div className="te-area w-full max-w-full overflow-hidden space-y-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-area { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); }
        .te-area .te-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-area input, .te-area textarea, .te-area select { font-family:inherit; }
        .te-area input:focus, .te-area textarea:focus, .te-area select:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,0,.12); outline:none; }
      `}</style>

      {/* Tab nav */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`shrink-0 text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition ${activeTab === t.id ? "bg-[var(--ink)] text-white" : "bg-white border border-black/10 text-[var(--muted)] hover:border-[var(--orange)]/40"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* BOOKING */}
      {activeTab === "booking" && (
        <section ref={formRef} className="bg-white border border-black/5 rounded-3xl p-5 sm:p-7 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--orange)] mb-1">Nuovo booking</p>
          <h2 className="te-display text-xl sm:text-2xl font-extrabold mb-4">Crea Evento</h2>
          <form onSubmit={createEventWithBooking} className="space-y-3">
            <Input placeholder="Nome evento" value={title} onChange={setTitle} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input type="date" value={date} onChange={setDate} />
              <Input type="time" value={startTime} onChange={setStartTime} />
              <Input type="time" value={endTime} onChange={setEndTime} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setEventMode("self_service")}
                className={`rounded-2xl p-3 text-left text-sm transition ${eventMode === "self_service" ? "bg-[var(--ink)] text-white" : "bg-[var(--paper)] border border-black/10 hover:border-[var(--orange)]/40"}`}>
                <p className="font-bold">Autonoma</p>
                <p className="text-xs opacity-60 mt-0.5">Gestisci tu l'evento.</p>
              </button>
              <button type="button" onClick={() => setEventMode("managed")}
                className={`rounded-2xl p-3 text-left text-sm transition ${eventMode === "managed" ? "bg-[var(--orange)] text-white" : "bg-[var(--paper)] border border-black/10 hover:border-[var(--orange)]/40"}`}>
                <p className="font-bold">TuttoEvento</p>
                <p className="text-xs opacity-60 mt-0.5">Seguita da noi.</p>
              </button>
            </div>
            <select value={selectedArtistId} onChange={e => { setSelectedArtistId(e.target.value); const s = artists.find(a => String(a.id) === String(e.target.value)); setArtist(s?.name || ""); }}
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition">
              <option value="">Seleziona artista</option>
              {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {artist && <div className="bg-[var(--ink)] text-white rounded-2xl px-4 py-3 text-sm"><span className="opacity-50 text-xs">Artista: </span><span className="font-bold">{artist}</span></div>}
            <Input placeholder="Promoter (opzionale)" value={promoter} onChange={setPromoter} />
            <textarea placeholder="Messaggio per l'artista" value={bookingMessage} onChange={e => setBookingMessage(e.target.value)}
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm min-h-[90px] transition resize-none" />
            <button className="w-full bg-[var(--orange)] text-white rounded-2xl py-3.5 font-bold text-sm hover:bg-[#e85100] transition shadow-[0_10px_24px_-10px_rgba(255,90,0,.6)]">
              Crea evento e invia richiesta
            </button>
          </form>
        </section>
      )}

      {/* EVENTI */}
      {activeTab === "events" && <EventsTable events={events} />}

      {/* MARKETPLACE */}
      {activeTab === "marketplace" && (
        <ArtistMarketplace artists={artists} currentUser={currentUser} onSelectArtist={handleSelectArtist} />
      )}

      {/* MEDIA KIT LOCALE */}
      {activeTab === "mediakit" && (
        <div className="space-y-4">
          {/* Budget evento */}
          <section className="bg-white border border-black/5 rounded-3xl p-5 sm:p-7 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--orange)] mb-1">Budget</p>
            <h2 className="te-display text-lg sm:text-xl font-extrabold mb-1">Budget per evento</h2>
            <p className="text-xs text-[var(--muted)] mb-4">Imposta il tuo budget indicativo per serata. È riservato e visibile solo al nostro team per proporti gli artisti giusti.</p>
            <form onSubmit={saveBudget} className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-bold mb-1.5">Budget massimo per evento (€)</label>
                <input type="number" min="0" placeholder="es. 500" value={eventBudget} onChange={e => setEventBudget(e.target.value)}
                  className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition" />
              </div>
              <button disabled={budgetSaving} className="bg-[var(--orange)] text-white rounded-2xl px-6 py-3 font-bold text-sm hover:bg-[#e85100] transition disabled:opacity-50">
                {budgetSaving ? "Salvo..." : "Salva budget"}
              </button>
              {budgetMsg && <p className="w-full text-xs font-bold text-green-600">{budgetMsg}</p>}
            </form>
          </section>

          {/* Media kit */}
          <section className="bg-white border border-black/5 rounded-3xl p-5 sm:p-7 shadow-sm">
            <form onSubmit={saveVenueProfile}>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--orange)] mb-1">Media Kit</p>
            <h2 className="te-display text-lg sm:text-xl font-extrabold mb-1">Profilo del locale</h2>
            <p className="text-xs text-[var(--muted)] mb-4">Queste informazioni sono visibili agli artisti nel marketplace. Completa il profilo per aumentare le richieste.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5">Nome locale</label>
                <input value={venueName} onChange={e => setVenueName(e.target.value)} placeholder="es. Club Aurora"
                  className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">Città</label>
                <input value={venueCity} onChange={e => setVenueCity(e.target.value)} placeholder="es. Napoli"
                  className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">Tipologia</label>
                <select value={venueType} onChange={e => setVenueType(e.target.value)}
                  className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition">
                  <option value="">Seleziona...</option>
                  <option>Club / Discoteca</option>
                  <option>Bar / Pub</option>
                  <option>Ristorante</option>
                  <option>Venue eventi</option>
                  <option>Festival / Arena</option>
                  <option>Privato</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">Capienza (persone)</label>
                <input type="number" min="0" value={venueCapacity} onChange={e => setVenueCapacity(e.target.value)} placeholder="es. 300"
                  className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1.5">Descrizione</label>
                <textarea value={venueDescription} onChange={e => setVenueDescription(e.target.value)} rows={3} resize="none"
                  placeholder="Descrivi il locale, il tipo di pubblico, l'atmosfera..."
                  className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">Instagram</label>
                <input value={venueInstagram} onChange={e => setVenueInstagram(e.target.value)} placeholder="@nomeprofilo"
                  className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition" />
              </div>
            </div>
            <button type="submit" disabled={venueSaving} className="mt-4 bg-[var(--ink)] text-white rounded-2xl px-6 py-3 font-bold text-sm hover:scale-[1.01] transition disabled:opacity-50">
              {venueSaving ? "Salvo..." : "Salva profilo locale"}
            </button>
            {venueMsg && <p style={{ marginTop:8, fontSize:12, fontWeight:700, color:"#16a34a" }}>{venueMsg}</p>}
            </form>
          </section>
        </div>
      )}

      {/* ANALITICHE */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <OrganizerAnalytics events={events} bookings={bookings} />
          <OrganizerStatement events={events} bookings={bookings} />
        </div>
      )}
    </div>
  );
}
