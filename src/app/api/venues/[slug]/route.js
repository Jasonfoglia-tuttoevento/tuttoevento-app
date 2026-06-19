// src/app/api/venues/[slug]/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req, { params }) {
  const { slug } = params;
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("venue_profiles")
      .select(`
        id, user_id, venue_name, venue_type, city, capacity,
        description, instagram, photo, slug, approval_status,
        rating_avg, rating_count,
        users!inner(id, name, verified, role)
      `)
      .eq("slug", slug)
      .eq("approval_status", "approved")
      .eq("users.role", "organizer")
      .maybeSingle();

    if (error || !profile)
      return NextResponse.json({ error: "Locale non trovato" }, { status: 404 });

    return NextResponse.json({
      id:          profile.users?.id,
      profileId:   profile.id,
      name:        profile.venue_name || profile.users?.name || "",
      venueType:   profile.venue_type || "",
      city:        profile.city || "",
      capacity:    profile.capacity || null,
      description: profile.description || "",
      instagram:   profile.instagram || "",
      photo:       profile.photo || null,
      slug:        profile.slug || "",
      verified:    profile.users?.verified || false,
      ratingAvg:   Number(profile.rating_avg) || 0,
      ratingCount: Number(profile.rating_count) || 0,
    });
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}