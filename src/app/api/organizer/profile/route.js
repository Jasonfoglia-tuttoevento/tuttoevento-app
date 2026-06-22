import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId richiesto" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("organizer_profiles")
      .select("*")
      .eq("user_id", Number(userId))
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Errore caricamento" }, { status: 500 });
    return NextResponse.json(data || {});
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function PUT(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "organizer") return NextResponse.json({ error: "Solo organizer" }, { status: 403 });

  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin
      .from("organizer_profiles")
      .upsert({
        user_id:       Number(user.id),
        address:       body.address       || null,
        city:          body.city          || null,
        zip:           body.zip           || null,
        region:        body.region        || null,
        lat:           body.lat != null ? Number(body.lat) : null,
        lng:           body.lng != null ? Number(body.lng) : null,
        phone:         body.phone         || null,
        public_email:  body.public_email  || null,
        website:       body.website       || null,
        instagram:     body.instagram     || null,
        facebook:      body.facebook      || null,
        tiktok:        body.tiktok        || null,
        description:   body.description   || null,
        updated_at:    new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select("*").single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}