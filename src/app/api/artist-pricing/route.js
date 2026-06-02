import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

// GET: prezzi di un artista (solo admin)
export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get("artistId");
    if (!artistId) return NextResponse.json({ error: "artistId mancante" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("artist_pricing")
      .select("*")
      .eq("artist_id", Number(artistId))
      .order("event_type");

    if (error) return NextResponse.json({ error: "Errore lettura prezzi" }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

// POST: salva/aggiorna prezzi per tipo evento + approva artista (solo admin)
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const body = await request.json();
    // body.artistId, body.pricing = [{ eventType, publicPrice }], body.approve = bool

    if (!body.artistId) return NextResponse.json({ error: "artistId mancante" }, { status: 400 });

    // Salva i prezzi per tipo evento
    if (Array.isArray(body.pricing) && body.pricing.length > 0) {
      for (const p of body.pricing) {
        if (!p.eventType || !p.publicPrice) continue;
        await supabaseAdmin.from("artist_pricing").upsert({
          artist_id: Number(body.artistId),
          event_type: p.eventType,
          public_price: Number(p.publicPrice),
          updated_at: new Date().toISOString(),
        }, { onConflict: "artist_id,event_type" });
      }
    }

    // Approva/disapprova l'artista nel marketplace
    if (typeof body.approve === "boolean") {
      await supabaseAdmin.from("artist_profiles").update({
        approved: body.approve,
        approved_at: body.approve ? new Date().toISOString() : null,
        // public_price = prezzo base (minimo tra i tipi evento, per il filtro range)
        public_price: body.basePubPrice ? Number(body.basePubPrice) : null,
      }).eq("user_id", Number(body.artistId));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Errore API artist-pricing:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
