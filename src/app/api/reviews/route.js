// src/app/api/reviews/route.js
import { NextResponse } from "next/server";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/reviews?targetId=X  → recensioni ricevute da un utente (pubblico)
// GET /api/reviews?bookingId=X → recensioni di un booking
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetId  = searchParams.get("targetId");
  const bookingId = searchParams.get("bookingId");

  let q = supabaseAdmin
    .from("reviews")
    .select("id, booking_id, reviewer_id, reviewer_role, target_id, target_role, rating, comment, created_at")
    .order("created_at", { ascending: false });

  if (targetId)  q = q.eq("target_id", Number(targetId));
  if (bookingId) q = q.eq("booking_id", Number(bookingId));

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Arricchisci con nome del recensore
  const reviewerIds = [...new Set((data || []).map(r => r.reviewer_id))];
  const { data: users } = reviewerIds.length
    ? await supabaseAdmin.from("users").select("id, name").in("id", reviewerIds)
    : { data: [] };
  const nameMap = Object.fromEntries((users || []).map(u => [u.id, u.name]));

  return NextResponse.json((data || []).map(r => ({ ...r, reviewerName: nameMap[r.reviewer_id] || "Utente" })));
}

// POST /api/reviews  { bookingId, rating, comment }
// Solo le due parti del booking possono recensire, solo dopo evento concluso
export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { bookingId, rating, comment } = await req.json();
  if (!bookingId || !rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, artist_id, organizer_id, event_date, status")
    .eq("id", Number(bookingId))
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking non trovato" }, { status: 404 });

  // Verifica che l'utente sia parte del booking
  const isArtist    = Number(booking.artist_id)    === Number(user.id);
  const isOrganizer = Number(booking.organizer_id) === Number(user.id);
  if (!isArtist && !isOrganizer) return forbidden();

  // L'evento deve essere passato
  if (booking.event_date && new Date(booking.event_date) > new Date())
    return NextResponse.json({ error: "Puoi recensire solo dopo l'evento" }, { status: 400 });

  const reviewerRole = isArtist ? "artist" : "organizer";
  const targetRole   = isArtist ? "organizer" : "artist";
  const targetId     = isArtist ? booking.organizer_id : booking.artist_id;

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      booking_id: booking.id,
      reviewer_id: user.id,
      reviewer_role: reviewerRole,
      target_id: targetId,
      target_role: targetRole,
      rating: Number(rating),
      comment: (comment || "").slice(0, 1000),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Hai già recensito questo booking" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}