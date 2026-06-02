import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized } from "@/lib/auth";

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let query = supabaseAdmin.from("events").select("*").order("date", { ascending: false });

    // admin e referent vedono tutto; gli altri solo i propri eventi
    if (user.role !== "admin" && user.role !== "referent") {
      query = query.eq("user_id", Number(userId || user.id));
    }

    const { data, error } = await query;
    if (error) {
      console.error("Errore GET events:", error);
      return NextResponse.json({ error: "Errore lettura eventi" }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (e) {
    console.error("Errore API events GET:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();

    if (!body.title || !body.date) {
      return NextResponse.json({ error: "Titolo e data obbligatori" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert({
        title: body.title,
        date: body.date,
        start_time: body.startTime || "",
        end_time: body.endTime || "",
        artist: body.artist || "",
        artist_id: body.artistId ? Number(body.artistId) : null,
        artist_name: body.artistName || "",
        artist_cachet: body.artistCachet || "",
        cachet: body.cachet || "",
        promoter: body.promoter || "",
        organizer: body.organizer || "",
        user_id: Number(body.userId || user.id),
        status: body.status || "pending",
        event_mode: body.eventMode || "self_service",
        revenue: body.revenue ? Number(body.revenue) : null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Errore POST events:", error);
      return NextResponse.json({ error: "Errore creazione evento" }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("Errore API events POST:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID evento mancante" }, { status: 400 });
    }

    // Verifica che l'evento appartenga all'utente (a meno che non sia admin)
    if (user.role !== "admin") {
      const { data: existing } = await supabaseAdmin
        .from("events")
        .select("user_id")
        .eq("id", body.id)
        .maybeSingle();

      if (!existing || existing.user_id !== user.id) {
        return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
      }
    }

    const payload = {};
    if (body.title !== undefined) payload.title = body.title;
    if (body.date !== undefined) payload.date = body.date;
    if (body.startTime !== undefined) payload.start_time = body.startTime;
    if (body.endTime !== undefined) payload.end_time = body.endTime;
    if (body.status !== undefined) payload.status = body.status;
    if (body.artist !== undefined) payload.artist = body.artist;
    if (body.artistId !== undefined) payload.artist_id = Number(body.artistId);
    if (body.artistName !== undefined) payload.artist_name = body.artistName;
    if (body.cachet !== undefined) payload.cachet = body.cachet;
    if (body.eventMode !== undefined) payload.event_mode = body.eventMode;
    if (body.revenue !== undefined) payload.revenue = Number(body.revenue);

    const { data, error } = await supabaseAdmin
      .from("events")
      .update(payload)
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) {
      console.error("Errore PATCH events:", error);
      return NextResponse.json({ error: "Errore aggiornamento evento" }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("Errore API events PATCH:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

    // Solo admin o proprietario può eliminare
    if (user.role !== "admin") {
      const { data: existing } = await supabaseAdmin
        .from("events")
        .select("user_id")
        .eq("id", id)
        .maybeSingle();

      if (!existing || existing.user_id !== user.id) {
        return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
      }
    }

    const { error } = await supabaseAdmin.from("events").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Errore eliminazione evento" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Errore API events DELETE:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}