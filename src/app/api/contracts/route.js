// src/app/api/contracts/route.js
import { NextResponse } from "next/server";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/contracts?bookingId=X → contratto di un booking
export async function GET(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) return NextResponse.json({ error: "bookingId richiesto" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("*")
    .eq("booking_id", Number(bookingId))
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || null);
}

// PATCH /api/contracts  { bookingId } → firma il contratto (click-wrap)
export async function PATCH(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { bookingId } = await req.json();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, artist_id, organizer_id")
    .eq("id", Number(bookingId))
    .maybeSingle();
  if (!booking) return NextResponse.json({ error: "Booking non trovato" }, { status: 404 });

  const isArtist    = Number(booking.artist_id)    === Number(user.id);
  const isOrganizer = Number(booking.organizer_id) === Number(user.id);
  if (!isArtist && !isOrganizer) return forbidden();

  const now = new Date().toISOString();
  const update = isArtist
    ? { artist_signed_at: now, artist_ip: ip }
    : { organizer_signed_at: now, organizer_ip: ip };

  // Recupera contratto attuale per capire se entrambi hanno firmato
  const { data: contract } = await supabaseAdmin
    .from("contracts").select("*").eq("booking_id", Number(bookingId)).maybeSingle();
  if (!contract) return NextResponse.json({ error: "Contratto non trovato" }, { status: 404 });

  const bothSigned =
    (isArtist    ? now : contract.artist_signed_at) &&
    (isOrganizer ? now : contract.organizer_signed_at);
  if (bothSigned) update.status = "signed";

  const { data, error } = await supabaseAdmin
    .from("contracts")
    .update(update)
    .eq("booking_id", Number(bookingId))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}