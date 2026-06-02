import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

function timeToMinutes(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function rangesOverlap(startA, endA, startB, endB) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return false;
  return aStart < bEnd && bStart < aEnd;
}

function mapBookingToFrontend(booking) {
  if (!booking) return null;
  return {
    id: booking.id,
    organizerId: booking.organizer_id,
    organizerName: booking.organizer_name || "",
    artistId: booking.artist_id,
    artistName: booking.artist_name || "",
    artistCachet: booking.artist_cachet || "",
    cachet: booking.cachet || "",
    eventId: booking.event_id,
    eventTitle: booking.event_title || "",
    eventDate: booking.event_date || "",
    startTime: booking.start_time || "",
    endTime: booking.end_time || "",
    message: booking.message || "",
    status: booking.status || "pending",
    paymentStatus: booking.payment_status || "pending",
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
  };
}

async function artistHasOverlap({ artistId, eventDate, startTime, endTime, excludeBookingId = null }) {
  const { data: acceptedBookings, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("artist_id", Number(artistId))
    .eq("event_date", eventDate)
    .eq("status", "accepted");
  if (error) throw new Error("Errore controllo disponibilità artista");
  return acceptedBookings.some((booking) => {
    if (excludeBookingId && Number(booking.id) === Number(excludeBookingId)) return false;
    return rangesOverlap(startTime, endTime, booking.start_time, booking.end_time);
  });
}

async function updateEventStatus(eventId, status) {
  if (!eventId) return;
  const { error } = await supabaseAdmin.from("events").update({ status }).eq("id", Number(eventId));
  if (error) console.error("Errore aggiornamento evento:", error);
}

async function updateArtistBookedSlots(booking) {
  if (!booking?.artist_id || !booking?.event_date) return;
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("artist_profiles").select("*").eq("user_id", Number(booking.artist_id)).maybeSingle();
  if (profileError) throw new Error("Errore caricamento profilo artista");

  let bookedDates = [];
  let bookedSlots = [];
  try { bookedDates = JSON.parse(profile?.booked_dates || "[]"); } catch { bookedDates = []; }
  try { bookedSlots = JSON.parse(profile?.booked_slots || "[]"); } catch { bookedSlots = []; }

  if (!bookedDates.includes(booking.event_date)) bookedDates.push(booking.event_date);

  const slot = {
    bookingId: booking.id, eventId: booking.event_id, eventTitle: booking.event_title,
    date: booking.event_date, startTime: booking.start_time, endTime: booking.end_time,
    organizerId: booking.organizer_id, organizerName: booking.organizer_name,
  };
  if (!bookedSlots.some((s) => Number(s.bookingId) === Number(booking.id))) bookedSlots.push(slot);

  const { error: upsertError } = await supabaseAdmin.from("artist_profiles").upsert({
    user_id: Number(booking.artist_id),
    booked_dates: JSON.stringify(bookedDates),
    booked_slots: JSON.stringify(bookedSlots),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (upsertError) throw new Error("Errore aggiornamento calendario artista");
}

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get("artistId");
    const organizerId = searchParams.get("organizerId");

    let query = supabaseAdmin.from("bookings").select("*").order("id", { ascending: false });

    // admin e referent vedono tutto; gli altri solo i propri booking
    if (user.role === "admin" || user.role === "referent") {
      if (artistId) query = query.eq("artist_id", Number(artistId));
      if (organizerId) query = query.eq("organizer_id", Number(organizerId));
    } else if (user.role === "artist") {
      query = query.eq("artist_id", Number(user.id));
    } else if (user.role === "organizer") {
      query = query.eq("organizer_id", Number(user.id));
    } else {
      return forbidden();
    }

    const { data: bookings, error } = await query;
    if (error) return NextResponse.json({ error: "Errore caricamento booking" }, { status: 500 });
    return NextResponse.json(bookings.map(mapBookingToFrontend));
  } catch (e) {
    console.error("Errore API GET bookings:", e);
    return NextResponse.json({ error: "Errore server booking" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  // Solo organizer e admin possono creare booking
  if (user.role !== "organizer" && user.role !== "admin") return forbidden();

  try {
    const body = await request.json();

    if (!body.eventDate || !body.startTime || !body.endTime) {
      return NextResponse.json({ error: "Data, ora inizio e ora fine sono obbligatorie" }, { status: 400 });
    }
    if (timeToMinutes(body.startTime) >= timeToMinutes(body.endTime)) {
      return NextResponse.json({ error: "L'ora fine deve essere successiva all'ora inizio" }, { status: 400 });
    }

    const overlap = await artistHasOverlap({
      artistId: body.artistId, eventDate: body.eventDate,
      startTime: body.startTime, endTime: body.endTime,
    });
    if (overlap) return NextResponse.json({ error: "Artista già occupato in questa fascia oraria" }, { status: 409 });

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        organizer_id: Number(body.organizerId),
        organizer_name: body.organizerName || "",
        artist_id: Number(body.artistId),
        artist_name: body.artistName || "",
        artist_cachet: body.artistCachet || body.cachet || "",
        cachet: body.cachet || body.artistCachet || "",
        event_id: body.eventId || null,
        event_title: body.eventTitle || "",
        event_date: body.eventDate || "",
        start_time: body.startTime || "",
        end_time: body.endTime || "",
        message: body.message || "",
        status: "pending",
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .select("*").single();

    if (error) return NextResponse.json({ error: "Errore creazione booking" }, { status: 500 });
    await updateEventStatus(body.eventId, "pending");
    return NextResponse.json(mapBookingToFrontend(booking));
  } catch (e) {
    console.error("Errore API POST bookings:", e);
    return NextResponse.json({ error: e?.message || "Errore server creazione booking" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id e status sono obbligatori" }, { status: 400 });
    }

    const { data: bookingBeforeUpdate, error: beforeError } = await supabaseAdmin
      .from("bookings").select("*").eq("id", Number(body.id)).maybeSingle();
    if (beforeError) return NextResponse.json({ error: "Errore caricamento richiesta" }, { status: 500 });
    if (!bookingBeforeUpdate) return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });

    // Verifica proprietà: solo l'artista interessato o l'admin può accettare/rifiutare
    if (user.role !== "admin") {
      const isArtist = user.role === "artist" && Number(bookingBeforeUpdate.artist_id) === Number(user.id);
      const isOrganizer = user.role === "organizer" && Number(bookingBeforeUpdate.organizer_id) === Number(user.id);
      if (!isArtist && !isOrganizer) return forbidden();
    }

    if (body.status === "accepted") {
      const overlap = await artistHasOverlap({
        artistId: bookingBeforeUpdate.artist_id,
        eventDate: bookingBeforeUpdate.event_date,
        startTime: bookingBeforeUpdate.start_time,
        endTime: bookingBeforeUpdate.end_time,
        excludeBookingId: bookingBeforeUpdate.id,
      });
      if (overlap) return NextResponse.json({ error: "Artista già occupato in questa fascia oraria" }, { status: 409 });
    }

    const { data: booking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", Number(body.id))
      .select("*").single();

    if (updateError) return NextResponse.json({ error: "Errore aggiornamento booking" }, { status: 500 });

    await updateEventStatus(booking.event_id, body.status);
    if (body.status === "accepted") await updateArtistBookedSlots(booking);

    return NextResponse.json(mapBookingToFrontend(booking));
  } catch (e) {
    console.error("Errore API PATCH bookings:", e);
    return NextResponse.json({ error: e?.message || "Errore server aggiornamento booking" }, { status: 500 });
  }
}