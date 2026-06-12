// src/app/api/artists/[slug]/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request, { params }) {
  const { slug } = params;
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("artist_profiles")
      .select(`
        id, user_id, stage_name, artist_type, bio, city,
        music_genres, event_types, photo, photo_status,
        instagram, spotify, youtube, soundcloud, tiktok,
        slug, approval_status, available_dates, public_pricing,
        users!inner(id, name, plan, verified, role)
      `)
      .eq("slug", slug)
      .eq("approval_status", "approved")
      .eq("users.role", "artist")
      .maybeSingle();

    if (error || !profile)
      return NextResponse.json({ error: "Artista non trovato" }, { status: 404 });

    // Incrementa contatore visite
    await supabaseAdmin.rpc("increment_profile_views", { profile_id: profile.id })
      .catch(() => {}); // silenzioso se la funzione non esiste

    return NextResponse.json({
      id:            profile.users?.id,
      profileId:     profile.id,
      name:          profile.users?.name || "",
      stageName:     profile.stage_name || "",
      artistType:    profile.artist_type || "",
      bio:           profile.bio || "",
      city:          profile.city || "",
      musicGenres:   (() => { try { return Array.isArray(profile.music_genres)?profile.music_genres:JSON.parse(profile.music_genres||"[]"); } catch { return []; }})(),
      eventTypes:    (() => { try { return Array.isArray(profile.event_types)?profile.event_types:JSON.parse(profile.event_types||"[]"); } catch { return []; }})(),
      photo:         profile.photo_status === "approved" ? profile.photo : null,
      instagram:     profile.instagram || "",
      spotify:       profile.spotify || "",
      youtube:       profile.youtube || "",
      soundcloud:    profile.soundcloud || "",
      tiktok:        profile.tiktok || "",
      slug:          profile.slug || "",
      verified:      profile.users?.verified || false,
      availableDates:(() => { try { return Array.isArray(profile.available_dates)?profile.available_dates:JSON.parse(profile.available_dates||"[]"); } catch { return []; }})(),
      publicPricing: profile.public_pricing || null,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}