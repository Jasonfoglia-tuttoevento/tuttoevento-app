import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function normalizeArrayValue(value) {
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === "string") {
    return value || "[]";
  }

  return "[]";
}

function mapProfileToFrontend(profile) {
  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.user_id,
    cachet: profile.cachet || "",
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
    genres: profile.genres || "",
    city: profile.city || "",
    languages: profile.languages || "",
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
      cachet: body.cachet || "",
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
      genres: body.genres || "",
      city: body.city || "",
      languages: body.languages || "",
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