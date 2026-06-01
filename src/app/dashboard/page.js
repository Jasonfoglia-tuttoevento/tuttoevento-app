"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import OrganizerArea from "@/components/dashboard/OrganizerArea";
import ArtistArea from "@/components/dashboard/ArtistArea";
import PromoterArea from "@/components/dashboard/PromoterArea";
import AdminArea from "@/components/dashboard/AdminArea";
import ReferentArea from "@/components/dashboard/ReferentArea";
import ArtistBookings from "@/components/dashboard/ArtistBookings";
import OrganizerBookings from "@/components/dashboard/OrganizerBookings";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [artists, setArtists] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [artist, setArtist] = useState("");
  const [promoter, setPromoter] = useState("");

  const [cachet, setCachet] = useState("");
  const [stageName, setStageName] = useState("");
  const [artistType, setArtistType] = useState("");
  const [membersCount, setMembersCount] = useState("");
  const [musicGenres, setMusicGenres] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [pricing, setPricing] = useState({});

  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");
  const [photo, setPhoto] = useState("");

  const [instagram, setInstagram] = useState("");
  const [spotify, setSpotify] = useState("");
  const [youtube, setYoutube] = useState("");
  const [soundcloud, setSoundcloud] = useState("");
  const [tiktok, setTiktok] = useState("");

  const [city, setCity] = useState("");
  const [rider, setRider] = useState("");

  const [availableDates, setAvailableDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  const [artistMessage, setArtistMessage] = useState("");

  useEffect(() => {
    async function init() {
      const userData = localStorage.getItem("user");

      if (!userData) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser.role === "admin" || parsedUser.role === "referent") {
        await loadGlobalData();
        setLoading(false);
        return;
      }

      await loadEvents(parsedUser.id);
      await loadArtists();

      if (parsedUser.role === "artist") {
        await loadArtistProfile(parsedUser.id);
        await loadArtistBookings(parsedUser.id);
      }

      if (parsedUser.role === "organizer") {
        await loadOrganizerBookings(parsedUser.id);
      }

      setLoading(false);
    }

    init();
  }, [router]);

  async function loadGlobalData() {
    await Promise.all([
      loadUsers(),
      loadAllEvents(),
      loadArtists(),
      loadAllBookings(),
    ]);
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  }

  async function loadAllEvents() {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    }
  }

  async function loadAllBookings() {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    }
  }

  async function loadEvents(userId) {
    try {
      const res = await fetch("/api/events?userId=" + userId);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    }
  }

  async function loadArtists() {
    try {
      const res = await fetch("/api/artists");
      const data = await res.json();
      setArtists(Array.isArray(data) ? data : []);
    } catch {
      setArtists([]);
    }
  }

  function parseArray(value) {
    try {
      if (Array.isArray(value)) return value;
      return JSON.parse(value || "[]");
    } catch {
      return [];
    }
  }

  function parseObject(value) {
    try {
      if (value && typeof value === "object") return value;
      return JSON.parse(value || "{}");
    } catch {
      return {};
    }
  }

  async function loadArtistProfile(userId) {
    try {
      const res = await fetch("/api/artist-profile?userId=" + userId);
      const data = await res.json();

      if (!data) return;

      setCachet(data.baseCachet || "");
      setStageName(data.stageName || "");
      setArtistType(data.artistType || "");
      setMembersCount(data.membersCount || "");
      setMusicGenres(parseArray(data.musicGenres));
      setEventTypes(parseArray(data.eventTypes));
      setPricing(parseObject(data.pricing));

      setBio(data.bio || "");
      setAvailability(data.availability || "");
      setPhoto(data.photo || "");

      setInstagram(data.instagram || "");
      setSpotify(data.spotify || "");
      setYoutube(data.youtube || "");
      setSoundcloud(data.soundcloud || "");
      setTiktok(data.tiktok || "");

      setCity(data.city || "");
      setRider(data.rider || "");

      setAvailableDates(parseArray(data.availableDates));
      setBookedDates(parseArray(data.bookedDates));
      setBookedSlots(parseArray(data.bookedSlots));
    } catch {
      return;
    }
  }

  async function loadArtistBookings(artistId) {
    try {
      const res = await fetch("/api/bookings?artistId=" + artistId);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    }
  }

  async function loadOrganizerBookings(organizerId) {
    try {
      const res = await fetch("/api/bookings?organizerId=" + organizerId);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
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
      const data = await res.json();
      alert(data.error || "Errore aggiornamento richiesta");
      return;
    }

    await loadArtistBookings(user.id);
    await loadArtistProfile(user.id);
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

        baseCachet: cachet,
        stageName,
        artistType,
        membersCount,
        musicGenres,
        eventTypes,
        pricing,

        bio,
        availability,
        photo,

        instagram,
        spotify,
        youtube,
        soundcloud,
        tiktok,

        city,
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f6] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-b-[#ff5a00]" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell user={user}>
      {user.role === "admin" && (
        <AdminArea users={users} events={events} bookings={bookings} />
      )}

      {user.role === "referent" && (
        <ReferentArea
          user={user}
          users={users}
          events={events}
          bookings={bookings}
        />
      )}

      {user.role === "organizer" && (
        <>
          <OrganizerArea
            currentUser={user}
            events={events}
            artists={artists}
            title={title}
            setTitle={setTitle}
            date={date}
            setDate={setDate}
            artist={artist}
            setArtist={setArtist}
            promoter={promoter}
            setPromoter={setPromoter}
          />

          <OrganizerBookings bookings={bookings} />
        </>
      )}

      {user.role === "artist" && (
        <>
          <ArtistArea
            cachet={cachet}
            setCachet={setCachet}
            stageName={stageName}
            setStageName={setStageName}
            artistType={artistType}
            setArtistType={setArtistType}
            membersCount={membersCount}
            setMembersCount={setMembersCount}
            musicGenres={musicGenres}
            setMusicGenres={setMusicGenres}
            eventTypes={eventTypes}
            setEventTypes={setEventTypes}
            pricing={pricing}
            setPricing={setPricing}
            bio={bio}
            setBio={setBio}
            availability={availability}
            setAvailability={setAvailability}
            photo={photo}
            setPhoto={setPhoto}
            instagram={instagram}
            setInstagram={setInstagram}
            spotify={spotify}
            setSpotify={setSpotify}
            youtube={youtube}
            setYoutube={setYoutube}
            soundcloud={soundcloud}
            setSoundcloud={setSoundcloud}
            tiktok={tiktok}
            setTiktok={setTiktok}
            city={city}
            setCity={setCity}
            rider={rider}
            setRider={setRider}
            availableDates={availableDates}
            setAvailableDates={setAvailableDates}
            bookedDates={bookedDates}
            bookedSlots={bookedSlots}
            bookings={bookings}
            saveArtistProfile={saveArtistProfile}
            artistMessage={artistMessage}
          />

          <ArtistBookings
            bookings={bookings}
            updateBookingStatus={updateBookingStatus}
          />
        </>
      )}

      {user.role === "promoter" && (
        <PromoterArea
          user={user}
          events={events}
          artists={artists}
          bookings={bookings}
        />
      )}
    </DashboardShell>
  );
}