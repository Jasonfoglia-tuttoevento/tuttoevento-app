"use client";

import { useEffect, useState } from "react";

export function useDashboardData() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [artists, setArtists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [artist, setArtist] = useState("");
  const [promoter, setPromoter] = useState("");
  const [cachet, setCachet] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");
  const [photo, setPhoto] = useState("");
  const [instagram, setInstagram] = useState("");
  const [spotify, setSpotify] = useState("");
  const [youtube, setYoutube] = useState("");
  const [soundcloud, setSoundcloud] = useState("");
  const [genres, setGenres] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState("");
  const [rider, setRider] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [artistMessage, setArtistMessage] = useState("");

  useEffect(() => {
    async function init() {
      // Legge l'utente dalla sessione server, non da localStorage
      const res = await fetch("/api/me");
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const parsedUser = await res.json();
      setUser(parsedUser);

      await loadEvents(parsedUser.id);
      await loadArtists();

      if (parsedUser.role === "artist") {
        await loadArtistProfile(parsedUser.id);
        await loadArtistBookings(parsedUser.id);
      }
      if (parsedUser.role === "organizer") {
        await loadOrganizerBookings(parsedUser.id);
      }
    }
    init();
  }, []);

  async function loadEvents(userId) {
    try { const r = await fetch("/api/events?userId=" + userId); const d = await r.json(); setEvents(Array.isArray(d) ? d : []); }
    catch { setEvents([]); }
  }

  async function loadArtists() {
    try { const r = await fetch("/api/artists"); const d = await r.json(); setArtists(Array.isArray(d) ? d : []); }
    catch { setArtists([]); }
  }

  async function loadArtistProfile(userId) {
    try {
      const r = await fetch("/api/artist-profile?userId=" + userId);
      const d = await r.json();
      if (!d) return;
      setCachet(d.cachet || ""); setBio(d.bio || ""); setAvailability(d.availability || ""); setPhoto(d.photo || "");
      setInstagram(d.instagram || ""); setSpotify(d.spotify || ""); setYoutube(d.youtube || ""); setSoundcloud(d.soundcloud || "");
      setGenres(d.genres || ""); setCity(d.city || ""); setLanguages(d.languages || ""); setRider(d.rider || "");
      try { setAvailableDates(JSON.parse(d.availableDates || "[]")); } catch { setAvailableDates([]); }
      try { setBookedDates(JSON.parse(d.bookedDates || "[]")); } catch { setBookedDates([]); }
      try { setBookedSlots(JSON.parse(d.bookedSlots || "[]")); } catch { setBookedSlots([]); }
    } catch {}
  }

  async function loadArtistBookings(artistId) {
    try { const r = await fetch("/api/bookings?artistId=" + artistId); const d = await r.json(); setBookings(Array.isArray(d) ? d : []); }
    catch { setBookings([]); }
  }

  async function loadOrganizerBookings(organizerId) {
    try { const r = await fetch("/api/bookings?organizerId=" + organizerId); const d = await r.json(); setBookings(Array.isArray(d) ? d : []); }
    catch { setBookings([]); }
  }

  async function sendBookingStatusSystemMessage(bookingId, status) {
    if (!user?.id) return;
    const booking = bookings.find((b) => String(b.id) === String(bookingId));
    if (!booking) return;
    const organizerUserId = booking.organizerId || booking.organizerUserId || booking.organizer_user_id;
    if (!organizerUserId) return;
    const statusLabel = status === "accepted" ? "ha accettato" : status === "rejected" ? "ha rifiutato" : "ha aggiornato";
    const eventLabel = booking.eventTitle ? ` per l'evento "${booking.eventTitle}"` : "";
    const systemMessage = `${user.name} ${statusLabel} la richiesta booking${eventLabel}.`;
    try {
      // currentUserId rimosso: la sessione lo gestisce lato server
      const convRes = await fetch("/api/chat/conversations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantUserId: Number(organizerUserId),
          bookingId: booking.id, eventId: booking.eventId || null,
          title: `Booking · ${booking.organizerName || "Organizer"}`,
        }),
      });
      const convData = await convRes.json();
      if (!convRes.ok || !convData.id) return;
      // senderId rimosso: la sessione lo gestisce lato server
      await fetch("/api/chat/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convData.id, message: systemMessage }),
      });
    } catch (e) {
      console.error("Errore messaggio automatico booking:", e);
    }
  }

  async function updateBookingStatus(id, status) {
    const res = await fetch("/api/bookings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) { alert("Errore aggiornamento richiesta"); return; }
    await sendBookingStatusSystemMessage(id, status);
    if (user?.role === "artist") { await loadArtistBookings(user.id); await loadArtistProfile(user.id); }
    if (user?.role === "organizer") await loadOrganizerBookings(user.id);
  }

  async function saveArtistProfile(e) {
    e.preventDefault();
    setArtistMessage("Salvataggio in corso...");
    const res = await fetch("/api/artist-profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id, cachet, bio, availability, photo,
        instagram, spotify, youtube, soundcloud,
        genres, city, languages, rider,
        availableDates, bookedDates, bookedSlots,
      }),
    });
    if (!res.ok) { setArtistMessage("Errore salvataggio profilo"); return; }
    setArtistMessage("Profilo artista salvato correttamente");
    await loadArtists();
    await loadArtistProfile(user.id);
  }

  async function logout() {
    try { await fetch("/api/logout", { method: "POST" }); } catch {}
    window.location.href = "/login";
  }

  function getNextEventDate() {
    if (bookedSlots.length === 0) return "-";
    return bookedSlots[0].date || "-";
  }

  return {
    user, events, artists, bookings,
    title, setTitle, date, setDate, artist, setArtist, promoter, setPromoter,
    cachet, setCachet, bio, setBio, availability, setAvailability, photo, setPhoto,
    instagram, setInstagram, spotify, setSpotify, youtube, setYoutube, soundcloud, setSoundcloud,
    genres, setGenres, city, setCity, languages, setLanguages, rider, setRider,
    availableDates, setAvailableDates, bookedDates, setBookedDates, bookedSlots, setBookedSlots,
    artistMessage, saveArtistProfile, updateBookingStatus, logout, getNextEventDate,
  };
}