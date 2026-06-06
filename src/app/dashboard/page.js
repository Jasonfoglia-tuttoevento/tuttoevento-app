"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

// Aree ruolo
import ArtistArea    from "@/components/dashboard/ArtistArea";
import OrganizerArea from "@/components/dashboard/OrganizerArea";
import PromoterArea  from "@/components/dashboard/PromoterArea";
import AdminArea     from "@/components/dashboard/AdminArea";
import ReferentArea  from "@/components/dashboard/ReferentArea";
import AccountSettings from "@/components/dashboard/AccountSettings";

// Booking views
import ArtistBookings    from "@/components/dashboard/ArtistBookings";
import ArtistEstratto   from "@/components/dashboard/ArtistEstratto";
import PromoterCommissions from "@/components/dashboard/PromoterCommissions";
import OrganizerBookings from "@/components/dashboard/OrganizerBookings";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Dati globali
  const [users,    setUsers]    = useState([]);
  const [events,   setEvents]   = useState([]);
  const [artists,  setArtists]  = useState([]);
  const [bookings, setBookings] = useState([]);

  // Profilo artista
  const [artistProfile, setArtistProfile] = useState({});
  const [artistMessage, setArtistMessage] = useState("");

  const parseArray  = v => { try { return Array.isArray(v) ? v : JSON.parse(v || "[]"); } catch { return []; } };
  const parseObject = v => { try { return v && typeof v === "object" ? v : JSON.parse(v || "{}"); } catch { return {}; } };

  const loadUsers    = useCallback(async () => { try { const r = await fetch("/api/users");   const d = await r.json(); setUsers(Array.isArray(d)?d:[]); } catch {} }, []);
  const loadEvents   = useCallback(async (uid) => { try { const r = await fetch("/api/events"+(uid?`?userId=${uid}`:"")); const d = await r.json(); setEvents(Array.isArray(d)?d:[]); } catch {} }, []);
  const loadArtists  = useCallback(async () => { try { const r = await fetch("/api/artists");  const d = await r.json(); setArtists(Array.isArray(d)?d:[]); } catch {} }, []);
  const loadBookings = useCallback(async (params="") => { try { const r = await fetch("/api/bookings"+params); const d = await r.json(); setBookings(Array.isArray(d)?d:[]); } catch {} }, []);

  const loadArtistProfile = useCallback(async (uid) => {
    try {
      const r = await fetch("/api/artist-profile?userId="+uid);
      const d = await r.json();
      if (!d) return;
      setArtistProfile({
        cachet: d.baseCachet||"", stageName: d.stageName||"", artistType: d.artistType||"",
        membersCount: d.membersCount||"", musicGenres: parseArray(d.musicGenres),
        eventTypes: parseArray(d.eventTypes), pricing: parseObject(d.pricing),
        bio: d.bio||"", availability: d.availability||"", photo: d.photo||"",
        instagram: d.instagram||"", spotify: d.spotify||"", youtube: d.youtube||"",
        soundcloud: d.soundcloud||"", tiktok: d.tiktok||"",
        city: d.city||"", rider: d.rider||"",
        availableDates: parseArray(d.availableDates),
        bookedDates: parseArray(d.bookedDates),
        bookedSlots: parseArray(d.bookedSlots),
      });
    } catch {}
  }, []);

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/me");
      if (!res.ok) { router.push("/login"); return; }
      const u = await res.json();
      setUser(u);

      if (u.role === "admin" || u.role === "referent") {
        await Promise.all([loadUsers(), loadEvents(), loadArtists(), loadBookings()]);
      } else if (u.role === "promoter") {
        await Promise.all([loadUsers(), loadEvents(), loadArtists(), loadBookings()]);
      } else if (u.role === "artist") {
        await Promise.all([loadArtists(), loadArtistProfile(u.id), loadBookings(`?artistId=${u.id}`)]);
      } else if (u.role === "organizer") {
        await Promise.all([loadArtists(), loadEvents(u.id), loadBookings(`?organizerId=${u.id}`)]);
      }
      setLoading(false);
    }
    init();
  }, [router, loadUsers, loadEvents, loadArtists, loadBookings, loadArtistProfile]);

  async function saveArtistProfile(e) {
    e.preventDefault();
    setArtistMessage("Salvataggio...");
    const p = artistProfile;
    const res = await fetch("/api/artist-profile", {
      method: "POST", headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        userId: user.id, baseCachet: p.cachet, stageName: p.stageName,
        artistType: p.artistType, membersCount: p.membersCount,
        musicGenres: p.musicGenres, eventTypes: p.eventTypes, pricing: p.pricing,
        bio: p.bio, availability: p.availability, photo: p.photo,
        instagram: p.instagram, spotify: p.spotify, youtube: p.youtube,
        soundcloud: p.soundcloud, tiktok: p.tiktok, city: p.city, rider: p.rider,
        availableDates: p.availableDates, bookedDates: p.bookedDates, bookedSlots: p.bookedSlots,
      }),
    });
    setArtistMessage(res.ok ? "✓ Salvato" : "Errore salvataggio");
    if (res.ok) { await loadArtists(); await loadArtistProfile(user.id); }
  }

  async function updateBookingStatus(id, status) {
    await fetch("/api/bookings", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id,status}) });
    await loadBookings(`?artistId=${user.id}`);
    await loadArtistProfile(user.id);
  }

  // ── Render contenuto tab ──
  function renderTab() {
    if (activeTab === "settings") return <AccountSettings user={user} />;

    const role = user?.role;

    if (role === "artist") {
      const p = artistProfile;
      const setP = (key) => (val) => setArtistProfile(prev => ({ ...prev, [key]: val }));
      switch(activeTab) {
        case "overview":  return <ArtistArea currentUser={user} tab="mediakit"   {...p} {...Object.fromEntries(Object.keys(p).map(k=>[`set${k.charAt(0).toUpperCase()+k.slice(1)}`, setP(k)]))} saveArtistProfile={saveArtistProfile} artistMessage={artistMessage} bookings={bookings} />;
        case "profile":   return <ArtistArea currentUser={user} tab="mediakit"   {...p} {...Object.fromEntries(Object.keys(p).map(k=>[`set${k.charAt(0).toUpperCase()+k.slice(1)}`, setP(k)]))} saveArtistProfile={saveArtistProfile} artistMessage={artistMessage} bookings={bookings} />;
        case "calendar":  return <ArtistArea currentUser={user} tab="calendario" {...p} {...Object.fromEntries(Object.keys(p).map(k=>[`set${k.charAt(0).toUpperCase()+k.slice(1)}`, setP(k)]))} saveArtistProfile={saveArtistProfile} artistMessage={artistMessage} bookings={bookings} />;
        case "analytics": return <ArtistArea currentUser={user} tab="analitiche" {...p} {...Object.fromEntries(Object.keys(p).map(k=>[`set${k.charAt(0).toUpperCase()+k.slice(1)}`, setP(k)]))} saveArtistProfile={saveArtistProfile} artistMessage={artistMessage} bookings={bookings} />;
        case "earnings":  return <ArtistEstratto bookings={bookings} onRefresh={() => loadBookings(`?artistId=${user.id}`)} />; // eslint-disable-next-line no-unreachable
        case "_earnings_old":  return <ArtistArea currentUser={user} tab="estratto"   {...p} {...Object.fromEntries(Object.keys(p).map(k=>[`set${k.charAt(0).toUpperCase()+k.slice(1)}`, setP(k)]))} saveArtistProfile={saveArtistProfile} artistMessage={artistMessage} bookings={bookings} />;
        default: return null;
      }
    }

    if (role === "organizer") {
      switch(activeTab) {
        case "overview":    return <OrganizerArea currentUser={user} tab="overview"    events={events} artists={artists} bookings={bookings} />;
        case "marketplace": return <OrganizerArea currentUser={user} tab="marketplace" events={events} artists={artists} bookings={bookings} />;
        case "bookings":    return <OrganizerBookings bookings={bookings} onRefresh={() => loadBookings(`?organizerId=${user.id}`)} />;
        case "analytics":   return <OrganizerArea currentUser={user} tab="analitiche"  events={events} artists={artists} bookings={bookings} />;
        case "earnings":    return <OrganizerArea currentUser={user} tab="estratto"    events={events} artists={artists} bookings={bookings} />;
        default: return null;
      }
    }

    if (role === "promoter") {
      switch(activeTab) {
        case "overview":     return <PromoterArea currentUser={user} tab="overview"    events={events} artists={artists} bookings={bookings} users={users} />;
        case "roster":       return <PromoterArea currentUser={user} tab="roster"      events={events} artists={artists} bookings={bookings} users={users} />;
        case "deals":        return <PromoterArea currentUser={user} tab="trattative"  events={events} artists={artists} bookings={bookings} users={users} />;
        case "commissions":  return <PromoterCommissions bookings={bookings} onRefresh={() => loadBookings()} />; // eslint-disable-next-line no-unreachable
        case "_commissions_old":  return <PromoterArea currentUser={user} tab="commissioni" events={events} artists={artists} bookings={bookings} users={users} />;
        case "agency":       return <PromoterArea currentUser={user} tab="agenzia"     events={events} artists={artists} bookings={bookings} users={users} />;
        default: return null;
      }
    }

    if (role === "admin") {
      switch(activeTab) {
        case "overview":  return <AdminArea users={users} events={events} bookings={bookings} tab="overview"  />;
        case "users":     return <AdminArea users={users} events={events} bookings={bookings} tab="users"     />;
        case "artists":   return <AdminArea users={users} events={events} bookings={bookings} tab="artists"   />;
        case "finance":   return <AdminArea users={users} events={events} bookings={bookings} tab="finance"   />;
        case "crm":       return <AdminArea users={users} events={events} bookings={bookings} tab="crm"       />;
        case "requests":  return <AdminArea users={users} events={events} bookings={bookings} tab="requests"  />;
        default: return null;
      }
    }

    if (role === "referent") {
      return <ReferentArea user={user} users={users} events={events} bookings={bookings} />;
    }

    return null;
  }

  if (loading) return (
    <main style={{ minHeight:"100vh", background:"#0a0a0b", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:"3px solid rgba(255,90,0,.2)", borderTopColor:"#ff5a00", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 16px" }} />
        <p style={{ color:"rgba(255,255,255,.4)", fontSize:14, fontFamily:"'Manrope',system-ui,sans-serif" }}>Caricamento...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );

  if (!user) return null;

  return (
    <DashboardShell user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTab()}
    </DashboardShell>
  );
}