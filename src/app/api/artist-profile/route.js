import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function normalizeArrayValue(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "string") return value || "[]";
  return "[]";
}

function normalizeJsonValue(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function mapProfileToFrontend(profile) {
  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.user_id,

    cachet: profile.base_cachet ? String(profile.base_cachet) : "",
    baseCachet: toNumber(profile.base_cachet),
    publicPrice: toNumber(profile.public_price),

    stageName: profile.stage_name || "",
    artistType: profile.artist_type || "",
    membersCount: profile.members_count || "",
    eventTypes: profile.event_types || "[]",
    pricing: profile.pricing || {},

    bio: profile.bio || "",
    availability: profile.availability || "",

    availableDates: profile.available_dates || "[]",
    bookedDates: profile.booked_dates || "[]",
    bookedSlots: profile.booked_slots || "[]",

    photo: profile.photo || "",
    instagram: profile.instagram || "",
    spotify: profile.spotify || "",
    youtube: profile.youtube || "",
    soundcloud: profile.soundcloud || "",
    tiktok: profile.tiktok || "",

    musicGenres: profile.music_genres || "[]",
    genres: profile.genres || "",
    city: profile.city || "",
    rider: profile.rider || "",

    updatedAt: profile.updated_at,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId mancante" },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabaseAdmin
      .from("artist_profiles")
      .select("*")
      .eq("user_id", Number(userId))
      .maybeSingle();

    if (error) {
      console.error("Errore Supabase GET artist-profile:", error);

      return NextResponse.json(
        { error: "Errore caricamento profilo artista" },
        { status: 500 }
      );
    }

    return NextResponse.json(mapProfileToFrontend(profile));
  } catch (error) {
    console.error("Errore API GET artist-profile:", error);

    return NextResponse.json(
      { error: "Errore server profilo artista" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId mancante" },
        { status: 400 }
      );
    }

    const payload = {
      user_id: Number(body.userId),

      base_cachet: toNumber(body.baseCachet ?? body.cachet),
      public_price: body.publicPrice ? toNumber(body.publicPrice) : null,

      stage_name: body.stageName || "",
      artist_type: body.artistType || "",
      members_count: body.membersCount ? Number(body.membersCount) : null,
      event_types: normalizeArrayValue(body.eventTypes),
      pricing: normalizeJsonValue(body.pricing),

      bio: body.bio || "",
      availability: body.availability || "",

      available_dates: normalizeArrayValue(body.availableDates),
      booked_dates: normalizeArrayValue(body.bookedDates),
      booked_slots: normalizeArrayValue(body.bookedSlots),

      photo: body.photo || "",
      instagram: body.instagram || "",
      spotify: body.spotify || "",
      youtube: body.youtube || "",
      soundcloud: body.soundcloud || "",
      tiktok: body.tiktok || "",

      music_genres: normalizeArrayValue(body.musicGenres),
      genres: body.genres || "",
      city: body.city || "",
      rider: body.rider || "",

      updated_at: new Date().toISOString(),
    };

    const { data: profile, error } = await supabaseAdmin
      .from("artist_profiles")
      .upsert(payload, {
        onConflict: "user_id",
      })
      .select("*")
      .single();

    if (error) {
      console.error("Errore Supabase POST artist-profile:", error);

      return NextResponse.json(
        { error: "Errore salvataggio profilo artista" },
        { status: 500 }
      );
    }

    return NextResponse.json(mapProfileToFrontend(profile));
  } catch (error) {
    console.error("Errore API POST artist-profile:", error);

    return NextResponse.json(
      { error: "Errore server salvataggio profilo artista" },
      { status: 500 }
    );
  }
}