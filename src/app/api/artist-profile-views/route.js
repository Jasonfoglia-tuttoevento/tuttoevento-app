import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized } from "@/lib/auth";

// GET: visualizzazioni di un artista (solo l'artista stesso o admin)
export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId") || user.id;

  if (user.role !== "admin" && String(user.id) !== String(artistId)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("artist_profile_views")
    .select("id, viewer_city, created_at")
    .eq("artist_id", Number(artistId))
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: "Errore lettura visite" }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST: registra visualizzazione profilo
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    if (!body.artistId) return NextResponse.json({ error: "artistId mancante" }, { status: 400 });

    // Non tracciare auto-visite
    if (String(user.id) === String(body.artistId)) return NextResponse.json({ ok: true });

    // Recupera città del viewer dal profilo
    let viewerCity = "";
    if (user.role === "organizer") {
      const { data: vp } = await supabaseAdmin
        .from("venue_profiles").select("city").eq("user_id", user.id).maybeSingle();
      viewerCity = vp?.city || "";
    }

    await supabaseAdmin.from("artist_profile_views").insert({
      artist_id: Number(body.artistId),
      viewer_id: Number(user.id),
      viewer_city: viewerCity,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}