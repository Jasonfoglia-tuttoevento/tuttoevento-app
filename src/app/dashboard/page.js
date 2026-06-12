"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

// Aree ruolo
import ArtistArea    from "@/components/dashboard/ArtistArea";
import OrganizerArea from "@/components/dashboard/OrganizerArea";
import PromoterArea  from "@/components/dashboard/PromoterArea";
import AdminArea     from "@/components/dashboard/AdminArea";
import ReferentArea  from "@/components/dashboard/ReferentArea";
import AccountSettings from "@/components/dashboard/AccountSettings";
import ChatPanel from "@/components/ChatPanel";

// Booking views
import ArtistEstratto        from "@/components/dashboard/ArtistEstratto";
import PromoterCommissions   from "@/components/dashboard/PromoterCommissions";
import OrganizerBookings     from "@/components/dashboard/OrganizerBookings";

export default function DashboardPage() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Dati globali
  const [users,    setUsers]    = useState([]);
  const [events,   setEvents]   = useState([]);
  const [artists,  setArtists]  = useState([]);
  const [bookings, setBookings] = useState([]);

  // Profilo artista — stato piatto, setter stabili
  const [artistProfile, setArtistProfile] = useState({});
  const [artistMessage, setArtistMessage] = useState("");

  const parseArray  = v => { try { return Array.isArray(v)?v:JSON.parse(v||"[]"); } catch { return []; } };
  const parseObject = v => { try { return v&&typeof v==="object"?v:JSON.parse(v||"{}"); } catch { return {}; } };

  // ── Setter stabili — definiti una volta, non cambiano mai ──────
  // Ognuno aggiorna un campo specifico di artistProfile
  const setStageName     = useCallback(v => setArtistProfile(p=>({...p, stageName:     v})), []);
  const setArtistType    = useCallback(v => setArtistProfile(p=>({...p, artistType:    v})), []);
  const setMembersCount  = useCallback(v => setArtistProfile(p=>({...p, membersCount:  v})), []);
  const setBio           = useCallback(v => setArtistProfile(p=>({...p, bio:           v})), []);
  const setCity          = useCallback(v => setArtistProfile(p=>({...p, city:          v})), []);
  const setPhoto         = useCallback(v => setArtistProfile(p=>({...p, photo:         v})), []);
  const setInstagram     = useCallback(v => setArtistProfile(p=>({...p, instagram:     v})), []);
  const setSpotify       = useCallback(v => setArtistProfile(p=>({...p, spotify:       v})), []);
  const setYoutube       = useCallback(v => setArtistProfile(p=>({...p, youtube:       v})), []);
  const setSoundcloud    = useCallback(v => setArtistProfile(p=>({...p, soundcloud:    v})), []);
  const setTiktok        = useCallback(v => setArtistProfile(p=>({...p, tiktok:        v})), []);
  const setRider         = useCallback(v => setArtistProfile(p=>({...p, rider:         v})), []);
  const setAvailability  = useCallback(v => setArtistProfile(p=>({...p, availability:  v})), []);
  const setCachet        = useCallback(v => setArtistProfile(p=>({...p, cachet:        v})), []);
  const setMusicGenres   = useCallback(v => setArtistProfile(p=>({...p, musicGenres:   v})), []);
  const setEventTypes    = useCallback(v => setArtistProfile(p=>({...p, eventTypes:    v})), []);
  const setPricing       = useCallback(v => setArtistProfile(p=>({...p, pricing:       v})), []);
  const setAvailableDates= useCallback(v => setArtistProfile(p=>({...p, availableDates:v})), []);
  const setBookedDates   = useCallback(v => setArtistProfile(p=>({...p, bookedDates:   v})), []);
  const setBookedSlots   = useCallback(v => setArtistProfile(p=>({...p, bookedSlots:   v})), []);

  // ── Caricamento dati ──────────────────────────────────────────
  const loadUsers    = useCallback(async()=>{ try{const r=await fetch("/api/users");  const d=await r.json();setUsers(Array.isArray(d)?d:[]);}catch{} },[]);
  const loadEvents   = useCallback(async(uid)=>{ try{const r=await fetch("/api/events"+(uid?`?userId=${uid}`:""));const d=await r.json();setEvents(Array.isArray(d)?d:[]);}catch{} },[]);
  const loadArtists  = useCallback(async()=>{ try{const r=await fetch("/api/artists");const d=await r.json();setArtists(Array.isArray(d)?d:[]);}catch{} },[]);
  const loadBookings = useCallback(async(params="")=>{ try{const r=await fetch("/api/bookings"+params);const d=await r.json();setBookings(Array.isArray(d)?d:[]);}catch{} },[]);

  const loadArtistProfile = useCallback(async(uid)=>{
    try {
      const r=await fetch("/api/artist-profile?userId="+uid);
      const d=await r.json();
      if(!d) return;
      setArtistProfile({
        cachet:       d.baseCachet||"",
        stageName:    d.stageName||"",
        artistType:   d.artistType||"",
        membersCount: d.membersCount||"",
        musicGenres:  parseArray(d.musicGenres),
        eventTypes:   parseArray(d.eventTypes),
        pricing:      parseObject(d.pricing),
        bio:          d.bio||"",
        availability: d.availability||"",
        photo:        d.photo||"",
        instagram:    d.instagram||"",
        spotify:      d.spotify||"",
        youtube:      d.youtube||"",
        soundcloud:   d.soundcloud||"",
        tiktok:       d.tiktok||"",
        city:         d.city||"",
        rider:        d.rider||"",
        availableDates: parseArray(d.availableDates),
        bookedDates:    parseArray(d.bookedDates),
        bookedSlots:    parseArray(d.bookedSlots),
      });
    } catch {}
  }, []);

  useEffect(()=>{
    async function init(){
      const res=await fetch("/api/me");
      if(!res.ok){router.push("/login");return;}
      const u=await res.json();
      setUser(u);
      if(u.role==="admin"||u.role==="referent"){
        await Promise.all([loadUsers(),loadEvents(),loadArtists(),loadBookings()]);
      } else if(u.role==="promoter"){
        await Promise.all([loadUsers(),loadEvents(),loadArtists(),loadBookings()]);
      } else if(u.role==="artist"){
        await Promise.all([loadArtists(),loadArtistProfile(u.id),loadBookings(`?artistId=${u.id}`)]);
      } else if(u.role==="organizer"){
        await Promise.all([loadArtists(),loadEvents(u.id),loadBookings(`?organizerId=${u.id}`)]);
      }
      setLoading(false);
    }
    init();
  },[router,loadUsers,loadEvents,loadArtists,loadBookings,loadArtistProfile]);

  const saveArtistProfile = useCallback(async(e)=>{
    e.preventDefault();
    setArtistMessage("Salvataggio...");
    const p=artistProfile;
    const res=await fetch("/api/artist-profile",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        userId:user.id, baseCachet:p.cachet, stageName:p.stageName,
        artistType:p.artistType, membersCount:p.membersCount,
        musicGenres:p.musicGenres, eventTypes:p.eventTypes, pricing:p.pricing,
        bio:p.bio, availability:p.availability, photo:p.photo,
        instagram:p.instagram, spotify:p.spotify, youtube:p.youtube,
        soundcloud:p.soundcloud, tiktok:p.tiktok, city:p.city, rider:p.rider,
        availableDates:p.availableDates, bookedDates:p.bookedDates, bookedSlots:p.bookedSlots,
      }),
    });
    setArtistMessage(res.ok?"✓ Salvato":"Errore salvataggio");
    if(res.ok){await loadArtists();await loadArtistProfile(user.id);}
  },[artistProfile, user, loadArtists, loadArtistProfile]);

  // ── Props artista stabili — useMemo evita oggetto nuovo ad ogni render ──
  const artistProps = useMemo(()=>({
    ...artistProfile,
    setStageName, setArtistType, setMembersCount, setBio, setCity,
    setPhoto, setInstagram, setSpotify, setYoutube, setSoundcloud,
    setTiktok, setRider, setAvailability, setCachet,
    setMusicGenres, setEventTypes, setPricing,
    setAvailableDates, setBookedDates, setBookedSlots,
  }),[
    artistProfile,
    setStageName, setArtistType, setMembersCount, setBio, setCity,
    setPhoto, setInstagram, setSpotify, setYoutube, setSoundcloud,
    setTiktok, setRider, setAvailability, setCachet,
    setMusicGenres, setEventTypes, setPricing,
    setAvailableDates, setBookedDates, setBookedSlots,
  ]);

  // ── Render contenuto tab ──────────────────────────────────────
  function renderTab(){
    if(activeTab==="settings") return <AccountSettings user={user} />;
    const role=user?.role;

    if(role==="artist"){
      const commonArtistProps={
        currentUser: user,
        ...artistProps,
        saveArtistProfile,
        artistMessage,
        bookings,
      };
      switch(activeTab){
        case "overview":   return <ArtistArea {...commonArtistProps} tab="mediakit"   />;
        case "profile":    return <ArtistArea {...commonArtistProps} tab="mediakit"   />;
        case "video":      return <ArtistArea {...commonArtistProps} tab="video"      />;
        case "calendar":   return <ArtistArea {...commonArtistProps} tab="calendario" />;
        case "analytics":  return <ArtistArea {...commonArtistProps} tab="analitiche" />;
        case "earnings":   return <ArtistEstratto bookings={bookings} onRefresh={()=>loadBookings(`?artistId=${user.id}`)} />;
        default:           return null;
      }
    }

    if(role==="organizer"){
      switch(activeTab){
        case "overview":    return <OrganizerArea currentUser={user} tab="overview"    events={events} artists={artists} bookings={bookings} />;
        case "marketplace": return <OrganizerArea currentUser={user} tab="marketplace" events={events} artists={artists} bookings={bookings} />;
        case "bookings":    return <OrganizerBookings bookings={bookings} onRefresh={()=>loadBookings(`?organizerId=${user.id}`)} />;
        case "analytics":   return <OrganizerArea currentUser={user} tab="analitiche"  events={events} artists={artists} bookings={bookings} />;
        case "earnings":    return <OrganizerArea currentUser={user} tab="estratto"    events={events} artists={artists} bookings={bookings} />;
        default: return null;
      }
    }

    if(role==="promoter"){
      switch(activeTab){
        case "overview":    return <PromoterArea currentUser={user} tab="overview"    events={events} artists={artists} bookings={bookings} users={users} />;
        case "network":     return <PromoterArea currentUser={user} tab="network"    events={events} artists={artists} bookings={bookings} users={users} />;
        case "roster":      return <PromoterArea currentUser={user} tab="roster"      events={events} artists={artists} bookings={bookings} users={users} />;
        case "deals":       return <PromoterArea currentUser={user} tab="trattative"  events={events} artists={artists} bookings={bookings} users={users} />;
        case "commissions": return <PromoterCommissions bookings={bookings} onRefresh={()=>loadBookings()} />;
        case "agency":      return <PromoterArea currentUser={user} tab="agenzia"     events={events} artists={artists} bookings={bookings} users={users} />;
        default: return null;
      }
    }

    if(role==="admin"){
      switch(activeTab){
        case "overview":     return <AdminArea users={users} events={events} bookings={bookings} tab="overview"     />;
        case "users":        return <AdminArea users={users} events={events} bookings={bookings} tab="users"        />;
        case "artists":      return <AdminArea users={users} events={events} bookings={bookings} tab="artists"      />;
        case "finance":      return <AdminArea users={users} events={events} bookings={bookings} tab="finance"      />;
        case "crm":          return <AdminArea users={users} events={events} bookings={bookings} tab="crm"          />;
        case "requests":     return <AdminArea users={users} events={events} bookings={bookings} tab="requests"     />;
        case "moderazione":  return <AdminArea users={users} events={events} bookings={bookings} tab="moderazione"  />;
        case "pricing":      return <AdminArea users={users} events={events} bookings={bookings} tab="pricing"      />;
        default: return null;
      }
    }

    if(role==="referent"){
      return <ReferentArea user={user} users={users} events={events} bookings={bookings} />;
    }

    return null;
  }

  if(loading) return (
    <main style={{minHeight:"100vh",background:"#0a0a0b",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,border:"3px solid rgba(255,90,0,.2)",borderTopColor:"#ff5a00",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 16px"}}/>
        <p style={{color:"rgba(255,255,255,.4)",fontSize:14,fontFamily:"'Manrope',system-ui,sans-serif"}}>Caricamento...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );

  if(!user) return null;

  return (
    <DashboardShell user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTab()}
      <ChatPanel user={user} />
    </DashboardShell>
  );
}