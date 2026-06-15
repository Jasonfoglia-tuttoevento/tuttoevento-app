import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q         = searchParams.get("q") || "";
    const city      = searchParams.get("city") || "";
    const genre     = searchParams.get("genre") || "";
    const artistType= searchParams.get("type") || "";
    const approved  = searchParams.get("approved") !== "false"; // default: solo approvati

    let query = supabaseAdmin
      .from("artist_profiles")
      .select(`
        id, user_id, stage_name, artist_type, bio, city,
        music_genres, event_types, photo, photo_status,
        instagram, spotify, slug, approval_status,
        available_dates, public_pricing,
        users!inner(id, name, email, plan, verified, role)
      `)
      .eq("users.role", "artist");

    // Solo artisti approvati nel marketplace pubblico
    // NOTA: photo_status NON è un filtro di esclusione — un artista approvato
    // deve apparire anche senza foto (placeholder iniziali nel front-end).
    // La foto viene comunque nascosta se non approvata (vedi mapping sotto).
    if (approved) {
      query = query.eq("approval_status", "approved");
    }

    // Full-text search
    if (q.trim()) {
      query = query.textSearch("search_vector", q.trim(), {
        type: "websearch",
        config: "italian",
      });
    }

    // Filtri aggiuntivi
    if (city)       query = query.ilike("city", `%${city}%`);
    if (artistType) query = query.eq("artist_type", artistType);
    if (genre)      query = query.contains("music_genres", [genre]);

    query = query.order("approval_status").order("user_id");

    const { data, error } = await query;
    if (error) {
      console.error("Errore artisti:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data || []).map(p => ({
      id:            p.users?.id || p.user_id,
      profileId:     p.id,
      name:          p.users?.name || "",
      stageName:     p.stage_name || "",
      artistType:    p.artist_type || "",
      bio:           p.bio || "",
      city:          p.city || "",
      musicGenres:   (() => { try { return Array.isArray(p.music_genres)?p.music_genres:JSON.parse(p.music_genres||"[]"); } catch { return []; }})(),
      eventTypes:    (() => { try { return Array.isArray(p.event_types)?p.event_types:JSON.parse(p.event_types||"[]"); } catch { return []; }})(),
      photo:         p.photo_status === "approved" ? p.photo : null,
      instagram:     p.instagram || "",
      spotify:       p.spotify || "",
      slug:          p.slug || "",
      plan:          p.users?.plan || "free",
      verified:      p.users?.verified || false,
      approvalStatus:p.approval_status || "pending",
      availableDates:(() => { try { return Array.isArray(p.available_dates)?p.available_dates:JSON.parse(p.available_dates||"[]"); } catch { return []; }})(),
      publicPricing: p.public_pricing || null,
    })));
  } catch (e) {
    console.error("GET artisti:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}