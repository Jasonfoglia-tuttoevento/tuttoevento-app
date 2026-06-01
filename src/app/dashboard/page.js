// src/app/dashboard/page.js (CORRETTO)
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import OrganizerArea from "@/components/dashboard/OrganizerArea";
import ArtistArea from "@/components/dashboard/ArtistArea";
import PromoterArea from "@/components/dashboard/PromoterArea";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState({ events: [], artists: [], bookings: [] });
  const [loading, setLoading] = useState(true);

  // Organizer state
  const [title, setTitle] = useState(""); const [date, setDate] = useState("");
  const [artist, setArtist] = useState(""); const [promoter, setPromoter] = useState("");

  // Artist state
  const [cachet, setCachet] = useState(""); const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState(""); const [photo, setPhoto] = useState("");
  const [instagram, setInstagram] = useState(""); const [spotify, setSpotify] = useState("");
  const [youtube, setYoutube] = useState(""); const [soundcloud, setSoundcloud] = useState("");
  const [genres, setGenres] = useState(""); const [city, setCity] = useState("");
  const [languages, setLanguages] = useState(""); const [rider, setRider] = useState("");
  const [availableDates, setAvailableDates] = useState([]); const [artistMessage, setArtistMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (!token || !userData) { router.push("/login"); return; }
      setUser(JSON.parse(userData));
      setData({ events: [], artists: [], bookings: [] }); // TODO: fetch API
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-12 w-12 border-b-2 border-[#ff5a00] rounded-full"/></div>;
  if (!user) return null;

  const saveArtistProfile = (e) => { e.preventDefault(); setArtistMessage("Salvato."); };

  return (
    <DashboardShell user={user}>
      {user.role === "organizer" && <OrganizerArea currentUser={user} {...data} title={title} setTitle={setTitle} date={date} setDate={setDate} artist={artist} setArtist={setArtist} promoter={promoter} setPromoter={setPromoter} />}
      {user.role === "artist" && <ArtistArea cachet={cachet} setCachet={setCachet} bio={bio} setBio={setBio} availability={availability} setAvailability={setAvailability} photo={photo} setPhoto={setPhoto} instagram={instagram} setInstagram={setInstagram} spotify={spotify} setSpotify={setSpotify} youtube={youtube} setYoutube={setYoutube} soundcloud={soundcloud} setSoundcloud={setSoundcloud} genres={genres} setGenres={setGenres} city={city} setCity={setCity} languages={languages} setLanguages={setLanguages} rider={rider} setRider={setRider} availableDates={availableDates} setAvailableDates={setAvailableDates} bookings={data.bookings} saveArtistProfile={saveArtistProfile} artistMessage={artistMessage} />}
      {user.role === "promoter" && <PromoterArea user={user} {...data} />}
    </DashboardShell>
  );
}