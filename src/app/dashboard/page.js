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
import AccountSettings from "@/components/dashboard/AccountSettings";

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
      const res = await fetch("/api/me");
      if (!res.ok) { router.push("/login"); return; }
      const parsedUser = await res.json();
      setUser(parsedUser);

      if (parsedUser.role === "admin" || parsedUser.role === "referent") {
        await loadGlobalData();
        setLoading(false);
        return;
      }

      if (parsedUser.role === "promoter") {
        await Promise.all([loadUsers(), loadAllEvents(), loadAllBookings(), loadArtists()]);
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
    await Promise.all([loadUsers(), loadAllEvents(), loadArtists(), loadAllBookings()]);
  }

  async function loadUsers() {
    try { const r = await fetch("/api/users"); const d = await r.json(); setUsers(Array.isArray(d) ? d : []); } catch { setUsers([]); }
  }
  async function loadAllEvents() {
    try { const r = await fetch("/api/events"); const d = await r.json(); setEvents(Array.isArray(d) ? d : []); } catch { setEvents([]); }
  }
  async function loadAllBookings() {
    try { const r = await fetch("/api/bookings"); const d = await r.json(); setBookings(Array.isArray(d) ? d : []); } catch { setBookings([]); }
  }
  async function loadEvents(userId) {
    try { const r = await fetch("/api/events?userId=" + userId); const d = await r.json(); setEvents(Array.isArray(d) ? d : []); } catch { setEvents([]); }
  }
  async function loadArtists() {
    try { const r = await fetch("/api/artists"); const d = await r.json(); setArtists(Array.isArray(d) ? d : []); } catch { setArtists([]); }
  }

  function parseArray(v) { try { return Array.isArray(v) ? v : JSON.parse(v || "[]"); } catch { return []; } }
  function parseObject(v) { try { return v && typeof v === "object" ? v : JSON.parse(v || "{}"); } catch { return {}; } }

  async function loadArtistProfile(userId) {
    try {
      const r = await fetch("/api/artist-profile?userId=" + userId);
      const d = await r.json();
      if (!d) return;
      setCachet(d.baseCachet || ""); setStageName(d.stageName || ""); setArtistType(d.artistType || "");
      setMembersCount(d.membersCount || ""); setMusicGenres(parseArray(d.musicGenres));
      setEventTypes(parseArray(d.eventTypes)); setPricing(parseObject(d.pricing));
      setBio(d.bio || ""); setAvailability(d.availability || ""); setPhoto(d.photo || "");
      setInstagram(d.instagram || ""); setSpotify(d.spotify || ""); setYoutube(d.youtube || "");
      setSoundcloud(d.soundcloud || ""); setTiktok(d.tiktok || ""); setCity(d.city || ""); setRider(d.rider || "");
      setAvailableDates(parseArray(d.availableDates)); setBookedDates(parseArray(d.bookedDates)); setBookedSlots(parseArray(d.bookedSlots));
    } catch {}
  }

  async function loadArtistBookings(artistId) {
    try { const r = await fetch("/api/bookings?artistId=" + artistId); const d = await r.json(); setBookings(Array.isArray(d) ? d : []); } catch { setBookings([]); }
  }
  async function loadOrganizerBookings(organizerId) {
    try { const r = await fetch("/api/bookings?organizerId=" + organizerId); const d = await r.json(); setBookings(Array.isArray(d) ? d : []); } catch { setBookings([]); }
  }

  async function updateBookingStatus(id, status) {
    const res = await fetch("/api/bookings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Errore"); return; }
    await loadArtistBookings(user.id);
    await loadArtistProfile(user.id);
  }

  async function saveArtistProfile(e) {
    e.preventDefault();
    setArtistMessage("Salvataggio in corso...");
    const res = await fetch("/api/artist-profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id, baseCachet: cachet, stageName, artistType, membersCount,
        musicGenres, eventTypes, pricing, bio, availability, photo,
        instagram, spotify, youtube, soundcloud, tiktok, city, rider,
        availableDates, bookedDates, bookedSlots,
      }),
    });
    if (!res.ok) { setArtistMessage("Errore salvataggio profilo"); return; }
    setArtistMessage("Profilo artista salvato correttamente");
    await loadArtists();
    await loadArtistProfile(user.id);
  }

  // Loading screen — stili inline, zero Tailwind
  if (loading) {
    return (
      <main style={{ minHeight:"100vh", background:"#f5f5f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{
            width:44, height:44, border:"4px solid rgba(0,0,0,.1)",
            borderBottomColor:"#ff5a00", borderRadius:"50%",
            animation:"spin .7s linear infinite", margin:"0 auto 16px"
          }} />
          <p style={{ fontFamily:"'Manrope',system-ui,sans-serif", fontSize:14, color:"#6b6b73", fontWeight:600 }}>
            Caricamento...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
        <ReferentArea user={user} users={users} events={events} bookings={bookings} />
      )}
      {user.role === "organizer" && (
        <>
          <OrganizerArea
            currentUser={user} events={events} artists={artists}
            title={title} setTitle={setTitle} date={date} setDate={setDate}
            artist={artist} setArtist={setArtist} promoter={promoter} setPromoter={setPromoter}
          />
          <OrganizerBookings bookings={bookings} />
        </>
      )}
      {user.role === "artist" && (
        <>
          <ArtistArea
            currentUser={user}
            cachet={cachet} setCachet={setCachet} stageName={stageName} setStageName={setStageName}
            artistType={artistType} setArtistType={setArtistType} membersCount={membersCount} setMembersCount={setMembersCount}
            musicGenres={musicGenres} setMusicGenres={setMusicGenres} eventTypes={eventTypes} setEventTypes={setEventTypes}
            pricing={pricing} setPricing={setPricing} bio={bio} setBio={setBio}
            availability={availability} setAvailability={setAvailability} photo={photo} setPhoto={setPhoto}
            instagram={instagram} setInstagram={setInstagram} spotify={spotify} setSpotify={setSpotify}
            youtube={youtube} setYoutube={setYoutube} soundcloud={soundcloud} setSoundcloud={setSoundcloud}
            tiktok={tiktok} setTiktok={setTiktok} city={city} setCity={setCity} rider={rider} setRider={setRider}
            availableDates={availableDates} setAvailableDates={setAvailableDates}
            bookedDates={bookedDates} bookedSlots={bookedSlots} bookings={bookings}
            saveArtistProfile={saveArtistProfile} artistMessage={artistMessage}
          />
          <ArtistBookings bookings={bookings} updateBookingStatus={updateBookingStatus} />
        </>
      )}
      {user.role === "promoter" && (
        <PromoterArea
          currentUser={user}
          events={events}
          artists={artists}
          bookings={bookings}
          users={users}
        />
      )}
      {/* Impostazioni account — visibile a tutti i ruoli */}
      <AccountSettings user={user} />
    </DashboardShell>
  );
}