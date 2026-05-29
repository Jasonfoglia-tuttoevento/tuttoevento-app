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
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    loadEvents(parsedUser.id);
    loadArtists();

    if (parsedUser.role === "artist") {
      loadArtistProfile(parsedUser.id);
      loadArtistBookings(parsedUser.id);
    }

    if (parsedUser.role === "organizer") {
      loadOrganizerBookings(parsedUser.id);
    }
  }, []);

  async function loadEvents(userId) {
    const res = await fetch("/api/events?userId=" + userId);
    const data = await res.json();
    setEvents(data);
  }

  async function loadArtists() {
    const res = await fetch("/api/artists");
    const data = await res.json();
    setArtists(data);
  }

  async function loadArtistProfile(userId) {
    const res = await fetch("/api/artist-profile?userId=" + userId);
    const data = await res.json();

    if (data) {
      setCachet(data.cachet || "");
      setBio(data.bio || "");
      setAvailability(data.availability || "");
      setPhoto(data.photo || "");

      setInstagram(data.instagram || "");
      setSpotify(data.spotify || "");
      setYoutube(data.youtube || "");
      setSoundcloud(data.soundcloud || "");

      setGenres(data.genres || "");
      setCity(data.city || "");
      setLanguages(data.languages || "");
      setRider(data.rider || "");

      try {
        setAvailableDates(JSON.parse(data.availableDates || "[]"));
      } catch {
        setAvailableDates([]);
      }

      try {
        setBookedDates(JSON.parse(data.bookedDates || "[]"));
      } catch {
        setBookedDates([]);
      }

      try {
        setBookedSlots(JSON.parse(data.bookedSlots || "[]"));
      } catch {
        setBookedSlots([]);
      }
    }
  }

  async function loadArtistBookings(artistId) {
    const res = await fetch("/api/bookings?artistId=" + artistId);
    const data = await res.json();
    setBookings(data);
  }

  async function loadOrganizerBookings(organizerId) {
    const res = await fetch("/api/bookings?organizerId=" + organizerId);
    const data = await res.json();
    setBookings(data);
  }

  async function sendBookingStatusSystemMessage(bookingId, status) {
    if (!user?.id) return;

    const booking = bookings.find(
      (item) => String(item.id) === String(bookingId)
    );

    if (!booking) return;

    const organizerUserId =
      booking.organizerId ||
      booking.organizerUserId ||
      booking.organizer_user_id ||
      booking.organizerUserID;

    if (!organizerUserId) return;

    const statusLabel =
      status === "accepted"
        ? "ha accettato"
        : status === "rejected"
        ? "ha rifiutato"
        : "ha aggiornato";

    const eventLabel = booking.eventTitle
      ? ` per l’evento “${booking.eventTitle}”`
      : "";

    const systemMessage = `${user.name} ${statusLabel} la richiesta booking${eventLabel}.`;

    try {
      const conversationRes = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUserId: user.id,
          participantUserId: Number(organizerUserId),
          bookingId: booking.id,
          eventId: booking.eventId || null,
          title: `Booking · ${booking.organizerName || "Organizer"}`,
        }),
      });

      const conversationData = await conversationRes.json();

      if (!conversationRes.ok || !conversationData.id) return;

      await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversationData.id,
          senderId: user.id,
          message: systemMessage,
        }),
      });
    } catch (error) {
      console.error("Errore messaggio automatico booking:", error);
    }
  }

  async function updateBookingStatus(id, status) {
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      alert("Errore aggiornamento richiesta");
      return;
    }

    await sendBookingStatusSystemMessage(id, status);

    if (user.role === "artist") {
      await loadArtistBookings(user.id);
      await loadArtistProfile(user.id);
    }

    if (user.role === "organizer") {
      await loadOrganizerBookings(user.id);
    }
  }

  async function saveArtistProfile(e) {
    e.preventDefault();

    setArtistMessage("Salvataggio in corso...");

    const res = await fetch("/api/artist-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,

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
      }),
    });

    if (!res.ok) {
      setArtistMessage("Errore salvataggio profilo");
      return;
    }

    setArtistMessage("Profilo artista salvato correttamente");

    await loadArtists();
    await loadArtistProfile(user.id);
  }

  function logout() {
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  function getNextEventDate() {
    if (bookedSlots.length === 0) return "-";

    return bookedSlots[0].date || "-";
  }

  return {
    user,

    events,
    artists,
    bookings,

    title,
    setTitle,
    date,
    setDate,
    artist,
    setArtist,
    promoter,
    setPromoter,

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
    bookedDates,
    setBookedDates,
    bookedSlots,
    setBookedSlots,

    artistMessage,

    saveArtistProfile,
    updateBookingStatus,
    logout,
    getNextEventDate,
  };
}