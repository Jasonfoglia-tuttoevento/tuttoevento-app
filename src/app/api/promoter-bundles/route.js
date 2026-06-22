// src/app/api/promoter-bundles/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

// GET — lista bundle del promoter (proprietario) o tutti attivi (?all=true, per uso futuro pubblico)
export async function GET(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { data, error } = await supabaseAdmin
    .from("promoter_bundles")
    .select("*")
    .eq("promoter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const allArtistIds = [...new Set((data || []).flatMap(b => b.artist_ids || []))];
  const { data: artists } = allArtistIds.length
    ? await supabaseAdmin.from("artist_profiles").select("user_id, stage_name, photo").in("user_id", allArtistIds)
    : { data: [] };
  const artistMap = Object.fromEntries((artists||[]).map(a => [a.user_id, a]));

  const result = (data || []).map(b => ({
    ...b,
    artists: (b.artist_ids||[]).map(id => ({ id, name: artistMap[id]?.stage_name || "Artista", photo: artistMap[id]?.photo || null })),
  }));

  return NextResponse.json(result);
}

// POST — crea bundle
export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "promoter" && user.role !== "admin") return forbidden();

  const { title, artistIds, bundlePrice, description } = await req.json();
  if (!title || !Array.isArray(artistIds) || artistIds.length < 2)
    return NextResponse.json({ error: "Un bundle richiede almeno 2 artisti" }, { status: 400 });

  // Verifica che siano tutti nel roster
  const { data: portfolio } = await supabaseAdmin
    .from("promoter_portfolio").select("entity_id")
    .eq("promoter_id", user.id).eq("entity_type", "artist").in("entity_id", artistIds);
  const allowedIds = (portfolio || []).map(p => p.entity_id);
  const validIds = artistIds.filter(id => allowedIds.includes(Number(id)));
  if (validIds.length < 2)
    return NextResponse.json({ error: "Gli artisti devono essere nel tuo roster" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("promoter_bundles")
    .insert({
      promoter_id: user.id,
      title: title.slice(0, 100),
      artist_ids: validIds,
      bundle_price: bundlePrice ? Number(bundlePrice) : null,
      description: (description || "").slice(0, 500),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH — modifica/disattiva bundle
export async function PATCH(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id, ...updates } = await req.json();
  const allowed = {};
  if ("title" in updates) allowed.title = updates.title;
  if ("bundlePrice" in updates) allowed.bundle_price = updates.bundlePrice;
  if ("description" in updates) allowed.description = updates.description;
  if ("active" in updates) allowed.active = updates.active;

  const { data, error } = await supabaseAdmin
    .from("promoter_bundles").update(allowed)
    .eq("id", id).eq("promoter_id", user.id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE
export async function DELETE(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { searchParams } = new URL(req.url);
  await supabaseAdmin.from("promoter_bundles").delete()
    .eq("id", searchParams.get("id")).eq("promoter_id", user.id);
  return NextResponse.json({ ok: true });
}