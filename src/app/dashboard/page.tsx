"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Skeleton from "@/components/ui/Skeleton";
import ChatPanel from "@/components/ChatPanel";

// Aree ruolo
import ArtistArea from "@/components/dashboard/ArtistArea";
import OrganizerArea from "@/components/dashboard/OrganizerArea";
import PromoterArea from "@/components/dashboard/PromoterArea";
import AdminArea from "@/components/dashboard/AdminArea";
import ReferentArea from "@/components/dashboard/ReferentArea";
import AccountSettings from "@/components/dashboard/AccountSettings";

// Booking views
import ArtistEstratto from "@/components/dashboard/ArtistEstratto";
import PromoterCommissions from "@/components/dashboard/PromoterCommissions";
import OrganizerBookings from "@/components/dashboard/OrganizerBookings";

// Tour Management
import TourHub from "@/modules/tour-management/TourHub";

// ── Tipi ────────────────────────────────────────────────────────
interface User {
  id: number;
  role: "artist" | "organizer" | "promoter" | "admin" | "referent";
  name?: string;
  plan?: string;
  [key: string]: unknown;
}

interface ArtistProfile {
  cachet: string;
  stageName: string;
  artistType: string;
  membersCount: string;
  musicGenres: string[];
  eventTypes: string[];
  pricing: Record<string, unknown>;
  bio: string;
  availability: string;
  photo: string;
  instagram: string;
  spotify: string;
  youtube: string;
  soundcloud: string;
  tiktok: string;
  city: string;
  rider: string;
  availableDates: string[];
  bookedDates: string[];
  bookedSlots: string[];
}

// ── Helpers ─────────────────────────────────────────────────────
const parseArray = <T,>(v: unknown): T[] => {
  try {
    return Array.isArray(v) ? v : JSON.parse((v as string) || "[]");
  } catch {
    return [];
  }
};

const parseObject = <T,>(v: unknown): T => {
  try {
    return v && typeof v === "object" ? (v as T) : JSON.parse((v as string) || "{}");
  } catch {
    return {} as T;
  }
};

// ── Componente ──────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTourManager, setIsTourManager] = useState(false);

  // Dati globali
  const [users, setUsers] = useState<unknown[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);
  const [artists, setArtists] = useState<unknown[]>([]);
  const [bookings, setBookings] = useState<unknown[]>([]);

  // Profilo artista
  const [artistProfile, setArtistProfile] = useState<ArtistProfile>({
    cachet: "",
    stageName: "",
    artistType: "",
    membersCount: "",
    musicGenres: [],
    eventTypes: [],
    pricing: {},
    bio: "",
    availability: "",
    photo: "",
    instagram: "",
    spotify: "",
    youtube: "",
    soundcloud: "",
    tiktok: "",
    city: "",
    rider: "",
    availableDates: [],
    bookedDates: [],
    bookedSlots: [],
  });
  const [artistMessage, setArtistMessage] = useState("");

  // ── Setter stabili profilo artista ────────────────────────────
  const upd = useCallback(
    (key: keyof ArtistProfile, v: unknown) => {
      setArtistProfile((p) => ({
        ...p,
        [key]: typeof v === "function" ? (v as (prev: unknown) => unknown)(p[key]) : v,
      }));
    },
    []
  );

  const setters = useMemo(
    () => ({
      setStageName: (v: string) => upd("stageName", v),
      setArtistType: (v: string) => upd("artistType", v),
      setMembersCount: (v: string) => upd("membersCount", v),
      setBio: (v: string) => upd("bio", v),
      setCity: (v: string) => upd("city", v),
      setPhoto: (v: string) => upd("photo", v),
      setInstagram: (v: string) => upd("instagram", v),
      setSpotify: (v: string) => upd("spotify", v),
      setYoutube: (v: string) => upd("youtube", v),
      setSoundcloud: (v: string) => upd("soundcloud", v),
      setTiktok: (v: string) => upd("tiktok", v),
      setRider: (v: string) => upd("rider", v),
      setAvailability: (v: string) => upd("availability", v),
      setCachet: (v: string) => upd("cachet", v),
      setMusicGenres: (v: string[]) => upd("musicGenres", v),
      setEventTypes: (v: string[]) => upd("eventTypes", v),
      setPricing: (v: Record<string, unknown>) => upd("pricing", v),
      setAvailableDates: (v: string[]) => upd("availableDates", v),
      setBookedDates: (v: string[]) => upd("bookedDates", v),
      setBookedSlots: (v: string[]) => upd("bookedSlots", v),
    }),
    [upd]
  );

  // ── Fetch functions ───────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      const r = await fetch("/api/users");
      setUsers(await r.json());
    } catch {}
  }, []);

  const loadEvents = useCallback(async (uid?: number) => {
    try {
      const r = await fetch(`/api/events${uid ? `?userId=${uid}` : ""}`);
      setEvents(await r.json());
    } catch {}
  }, []);

  const loadArtists = useCallback(async () => {
    try {
      const r = await fetch("/api/artists");
      setArtists(await r.json());
    } catch {}
  }, []);

  const loadBookings = useCallback(async (params = "") => {
    try {
      const r = await fetch(`/api/bookings${params}`);
      setBookings(await r.json());
    } catch {}
  }, []);

  const loadArtistProfile = useCallback(async (uid: number) => {
    try {
      const d = await (await fetch(`/api/artist-profile?userId=${uid}`)).json();
      if (!d) return;
      setArtistProfile({
        cachet: d.baseCachet || "",
        stageName: d.stageName || "",
        artistType: d.artistType || "",
        membersCount: d.membersCount || "",
        musicGenres: parseArray(d.musicGenres),
        eventTypes: parseArray(d.eventTypes),
        pricing: parseObject(d.pricing),
        bio: d.bio || "",
        availability: d.availability || "",
        photo: d.photo || "",
        instagram: d.instagram || "",
        spotify: d.spotify || "",
        youtube: d.youtube || "",
        soundcloud: d.soundcloud || "",
        tiktok: d.tiktok || "",
        city: d.city || "",
        rider: d.rider || "",
        availableDates: parseArray(d.availableDates),
        bookedDates: parseArray(d.bookedDates),
        bookedSlots: parseArray(d.bookedSlots),
      });
    } catch {}
  }, []);

  // ── Init ──────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const res = await fetch("/api/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const u: User = await res.json();
      setUser(u);

      // Check se è Tour Manager
      try {
        const tmRes = await fetch(`/api/tour/is-tm?userId=${u.id}`);
        const tmData = await tmRes.json();
        setIsTourManager(tmData.isTM === true);
      } catch {
        setIsTourManager(false);
      }

      const loaders: Promise<void>[] = [];
      switch (u.role) {
        case "admin":
        case "referent":
        case "promoter":
          loaders.push(loadUsers(), loadEvents(), loadArtists(), loadBookings());
          break;
        case "artist":
          loaders.push(loadArtists(), loadArtistProfile(u.id), loadBookings(`?artistId=${u.id}`));
          break;
        case "organizer":
          loaders.push(loadArtists(), loadEvents(u.id), loadBookings(`?organizerId=${u.id}`));
          break;
      }
      await Promise.all(loaders);
      setLoading(false);
    }
    init();
  }, [router, loadUsers, loadEvents, loadArtists, loadBookings, loadArtistProfile]);

  // ── Save artist profile ───────────────────────────────────────
  const saveArtistProfile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setArtistMessage("Salvataggio...");
      const p = artistProfile;
      const res = await fetch("/api/artist-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          baseCachet: p.cachet,
          stageName: p.stageName,
          artistType: p.artistType,
          membersCount: p.membersCount,
          musicGenres: p.musicGenres,
          eventTypes: p.eventTypes,
          pricing: p.pricing,
          bio: p.bio,
          availability: p.availability,
          photo: p.photo,
          instagram: p.instagram,
          spotify: p.spotify,
          youtube: p.youtube,
          soundcloud: p.soundcloud,
          tiktok: p.tiktok,
          city: p.city,
          rider: p.rider,
          availableDates: p.availableDates,
          bookedDates: p.bookedDates,
          bookedSlots: p.bookedSlots,
        }),
      });
      setArtistMessage(res.ok ? "✓ Salvato" : "Errore salvataggio");
      if (res.ok && user) {
        await loadArtists();
        await loadArtistProfile(user.id);
      }
    },
    [artistProfile, user, loadArtists, loadArtistProfile]
  );

  // ── Props artista memoizzate ──────────────────────────────────
  const artistProps = useMemo(
    () => ({
      ...artistProfile,
      ...setters,
      saveArtistProfile,
      artistMessage,
      bookings,
      onRefreshBookings: () => user && loadBookings(`?artistId=${user.id}`),
    }),
    [artistProfile, setters, saveArtistProfile, artistMessage, bookings, user, loadBookings]
  );

  // ── Render tab content ────────────────────────────────────────
  const renderTab = () => {
    if (activeTab === "settings") return <AccountSettings user={user} />;

    // Tour Hub — visibile solo ai TM
    if (activeTab === "tour_hub" && isTourManager && user) {
      return <TourHub currentUser={{ id: String(user.id), name: user.name }} />;
    }

    const role = user?.role;

    if (role === "artist") {
      const props = { currentUser: user, ...artistProps };
      const tabMap: Record<string, React.ReactNode> = {
        overview: <ArtistArea {...props} tab="mediakit" />,
        profile: <ArtistArea {...props} tab="mediakit" />,
        cachet: <ArtistArea {...props} tab="cachet" />,
        contatti: <ArtistArea {...props} tab="contatti" />,
        richieste: <ArtistArea {...props} tab="richieste" />,
        scalette: <ArtistArea {...props} tab="scalette" />,
        video: <ArtistArea {...props} tab="video" />,
        calendar: <ArtistArea {...props} tab="calendario" />,
        analytics: <ArtistArea {...props} tab="analitiche" />,
        earnings: (
          <ArtistEstratto
            bookings={bookings}
            onRefresh={() => user && loadBookings(`?artistId=${user.id}`)}
          />
        ),
      };
      return tabMap[activeTab] ?? null;
    }

    if (role === "organizer") {
      const orgProps = { currentUser: user, events, artists, bookings };
      const tabMap: Record<string, React.ReactNode> = {
        overview: <OrganizerArea {...orgProps} tab="overview" />,
        marketplace: <OrganizerArea {...orgProps} tab="marketplace" />,
        richieste: <OrganizerArea {...orgProps} tab="crm" />,
        bookings: (
          <OrganizerBookings
            bookings={bookings}
            onRefresh={() => user && loadBookings(`?organizerId=${user.id}`)}
          />
        ),
        preferiti: <OrganizerArea {...orgProps} tab="preferiti" />,
        analytics: <OrganizerArea {...orgProps} tab="analitiche" />,
        profilo: <OrganizerArea {...orgProps} tab="profilo" />,
      };
      return tabMap[activeTab] ?? null;
    }

    if (role === "promoter") {
      const proProps = { currentUser: user, events, artists, bookings, users };
      const tabMap: Record<string, React.ReactNode> = {
        overview: <PromoterArea {...proProps} tab="overview" />,
        roster: <PromoterArea {...proProps} tab="roster" />,
        deals: <PromoterArea {...proProps} tab="trattative" />,
        commissions: <PromoterCommissions bookings={bookings} onRefresh={() => loadBookings()} />,
        calendario: <PromoterArea {...proProps} tab="calendario" />,
        outreach: <PromoterArea {...proProps} tab="outreach" />,
        bundles: <PromoterArea {...proProps} tab="bundles" />,
        subnetwork: <PromoterArea {...proProps} tab="subnetwork" />,
        agency: <PromoterArea {...proProps} tab="agenzia" />,
      };
      return tabMap[activeTab] ?? null;
    }

    if (role === "admin") {
      const admProps = { users, events, bookings };
      const tabMap: Record<string, React.ReactNode> = {
        overview: <AdminArea {...admProps} tab="overview" />,
        users: <AdminArea {...admProps} tab="users" />,
        artists: <AdminArea {...admProps} tab="artists" />,
        finance: <AdminArea {...admProps} tab="finance" />,
        crm: <AdminArea {...admProps} tab="crm" />,
        requests: <AdminArea {...admProps} tab="requests" />,
        moderazione: <AdminArea {...admProps} tab="moderazione" />,
        pricing: <AdminArea {...admProps} tab="pricing" />,
        tour_managers: <AdminArea {...admProps} tab="tour_managers" />,
      };
      return tabMap[activeTab] ?? null;
    }

    if (role === "referent") {
      return (
        <ReferentArea
          currentUser={user}
          organizers={users as never[]}
          events={events as never[]}
          bookings={bookings as never[]}
        />
      );
    }

    return null;
  };

  // ── Skeleton Loading State ────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] p-6 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="w-48 h-8 bg-gray-800" />
          <Skeleton className="w-32 h-10 rounded-full bg-gray-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full bg-gray-800" />
          <Skeleton className="h-32 w-full bg-gray-800" />
          <Skeleton className="h-32 w-full bg-gray-800" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full bg-gray-800" />
          <Skeleton className="h-16 w-full bg-gray-800" />
          <Skeleton className="h-16 w-full bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTab()}
      <ChatPanel user={user} />
    </DashboardShell>
  );
}