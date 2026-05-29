import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function mapEventToFrontend(event) {
  if (!event) return null;

  return {
    id: event.id,
    title: event.title || "",
    date: event.date || "",
    startTime: event.start_time || "",
    endTime: event.end_time || "",
    artist: event.artist || "",
    promoter: event.promoter || "",
    organizer: event.organizer || "",
    userId: event.user_id || null,
    artistId: event.artist_id || null,
    artistName: event.artist_name || "",
    artistCachet: event.artist_cachet || "",
    cachet: event.cachet || "",
    status: event.status || "draft",
    eventMode: event.event_mode || "self_service",
    revenue: Number(event.revenue || 0),
    createdAt: event.created_at,
  };
}

function parseMoney(value) {
  const parsed = Number(
    String(value || 0)
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let query = supabaseAdmin
      .from("events")
      .select("*")
      .order("id", { ascending: false });

    if (userId) {
      query = query.eq("user_id", Number(userId));
    }

    const { data: events, error } = await query;

    if (error) {
      console.error("Errore Supabase GET events:", error);

      return NextResponse.json(
        { error: "Errore caricamento eventi" },
        { status: 500 }
      );
    }

    return NextResponse.json(events.map(mapEventToFrontend));
  } catch (error) {
    console.error("Errore API GET events:", error);

    return NextResponse.json(
      { error: "Errore server eventi" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const payload = {
      title: body.title || "",
      date: body.date || "",
      start_time: body.startTime || "",
      end_time: body.endTime || "",
      artist: body.artist || "",
      artist_id: body.artistId || null,
      artist_name: body.artistName || "",
      artist_cachet: body.artistCachet || body.cachet || "",
      cachet: body.cachet || body.artistCachet || "",
      promoter: body.promoter || "",
      organizer: body.organizer || "",
      user_id: body.userId || null,
      status: body.status || "draft",
      event_mode: body.eventMode || "self_service",
      revenue: parseMoney(body.revenue),
    };

    const { data: event, error } = await supabaseAdmin
      .from("events")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("Errore Supabase POST events:", error);

      return NextResponse.json(
        { error: "Errore creazione evento" },
        { status: 500 }
      );
    }

    return NextResponse.json(mapEventToFrontend(event));
  } catch (error) {
    console.error("Errore API POST events:", error);

    return NextResponse.json(
      { error: "Errore server creazione evento" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "id evento mancante" },
        { status: 400 }
      );
    }

    const payload = {};

    if (body.revenue !== undefined) {
      payload.revenue = parseMoney(body.revenue);
    }

    if (body.status !== undefined) {
      payload.status = body.status;
    }

    if (body.title !== undefined) {
      payload.title = body.title || "";
    }

    if (body.date !== undefined) {
      payload.date = body.date || "";
    }

    if (body.startTime !== undefined) {
      payload.start_time = body.startTime || "";
    }

    if (body.endTime !== undefined) {
      payload.end_time = body.endTime || "";
    }

    if (body.promoter !== undefined) {
      payload.promoter = body.promoter || "";
    }

    const { data: event, error } = await supabaseAdmin
      .from("events")
      .update(payload)
      .eq("id", Number(body.id))
      .select("*")
      .single();

    if (error) {
      console.error("Errore Supabase PATCH events:", error);

      return NextResponse.json(
        { error: "Errore aggiornamento evento" },
        { status: 500 }
      );
    }

    return NextResponse.json(mapEventToFrontend(event));
  } catch (error) {
    console.error("Errore API PATCH events:", error);

    return NextResponse.json(
      { error: "Errore server aggiornamento evento" },
      { status: 500 }
    );
  }
}