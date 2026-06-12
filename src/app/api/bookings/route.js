import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

/* ─── Helpers ────────────────────────────────────────────── */
function timeToMinutes(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function rangesOverlap(startA, endA, startB, endB) {
  const aStart = timeToMinutes(startA);
  const aEnd   = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd   = timeToMinutes(endB);
  if ([aStart,aEnd,bStart,bEnd].some(v=>v===null)) return false;
  return aStart < bEnd && bStart < aEnd;
}

function mapBookingToFrontend(booking) {
  if (!booking) return null;
  return {
    id:              booking.id,
    organizerId:     booking.organizer_id,
    organizerName:   booking.organizer_name   || "",
    artistId:        booking.artist_id,
    artistUserId:    booking.artist_id,
    artistName:      booking.artist_name      || "",
    artistCachet:    booking.artist_cachet    || "",
    cachet:          booking.cachet           || "",
    publicPrice:     booking.public_price     || null,
    promoterId:      booking.promoter_id      || null,
    promoterName:    booking.promoter_name    || "",
    eventId:         booking.event_id,
    eventTitle:      booking.event_title      || "",
    eventDate:       booking.event_date       || "",
    startTime:       booking.start_time       || "",
    endTime:         booking.end_time         || "",
    message:         booking.message          || "",
    status:          booking.status           || "pending",
    paymentStatus:   booking.payment_status   || "pending",
    paidVenueAt:     booking.paid_venue_at    || null,
    paidArtistAt:    booking.paid_artist_at   || null,
    paidPromoterAt:  booking.paid_promoter_at || null,
    createdAt:       booking.created_at,
    updatedAt:       booking.updated_at,
  };
}

/* ─── Controlla overlap su booking esistenti ─────────────── */
async function artistHasBookingOverlap({ artistId, eventDate, startTime, endTime, excludeBookingId = null }) {
  const { data: accepted, error } = await supabaseAdmin
    .from("bookings").select("*")
    .eq("artist_id", Number(artistId))
    .eq("event_date", eventDate)
    .in("status", ["accepted","confirmed"]);
  if (error) throw new Error("Errore controllo disponibilità artista");
  return accepted.some(b => {
    if (excludeBookingId && Number(b.id) === Number(excludeBookingId)) return false;
    return rangesOverlap(startTime, endTime, b.start_time, b.end_time);
  });
}

/* ─── Controlla disponibilità nel calendario artista ────── */
async function artistIsUnavailableOnDate(artistId, eventDate) {
  const { data: profile } = await supabaseAdmin
    .from("artist_profiles")
    .select("available_dates, booked_dates")
    .eq("user_id", Number(artistId))
    .maybeSingle();

  if (!profile) return { unavailable: false };

  // Controlla se la data è nelle booked_dates (già occupato)
  let bookedDates = [];
  try { bookedDates = JSON.parse(profile.booked_dates || "[]"); } catch {}
  if (bookedDates.includes(eventDate)) {
    return {
      unavailable: true,
      reason: "calendar_busy",
      message: `L'artista ha già una serata confermata il ${eventDate}. Scegli un'altra data.`,
    };
  }

  // Controlla se l'artista ha indicato disponibilità e questa data NON c'è
  let availableDates = [];
  try { availableDates = JSON.parse(profile.available_dates || "[]"); } catch {}

  // Solo se l'artista ha impostato date disponibili e questa non è tra quelle
  if (availableDates.length > 0 && !availableDates.includes(eventDate)) {
    return {
      unavailable: true,
      reason: "not_available",
      message: `L'artista non ha indicato disponibilità per il ${eventDate}. Controlla le date disponibili prima di inviare la richiesta.`,
    };
  }

  return { unavailable: false };
}

/* ─── Funzione unificata di controllo disponibilità ─────── */
async function checkArtistAvailability({ artistId, eventDate, startTime, endTime, excludeBookingId = null }) {
  // 1. Controlla calendario (date bloccate / non disponibili)
  const calendarCheck = await artistIsUnavailableOnDate(artistId, eventDate);
  if (calendarCheck.unavailable) {
    return { available: false, ...calendarCheck };
  }

  // 2. Controlla overlap con booking esistenti
  const hasOverlap = await artistHasBookingOverlap({ artistId, eventDate, startTime, endTime, excludeBookingId });
  if (hasOverlap) {
    return {
      available: false,
      reason: "booking_overlap",
      message: `L'artista ha già un booking confermato in questa fascia oraria (${startTime}–${endTime}). Scegli un orario diverso.`,
    };
  }

  return { available: true };
}

async function updateEventStatus(eventId, status) {
  if (!eventId) return;
  await supabaseAdmin.from("events").update({ status }).eq("id", Number(eventId));
}

async function updateArtistBookedSlots(booking) {
  if (!booking?.artist_id || !booking?.event_date) return;
  const { data: profile } = await supabaseAdmin
    .from("artist_profiles").select("*").eq("user_id", Number(booking.artist_id)).maybeSingle();
  let bookedDates = []; let bookedSlots = [];
  try { bookedDates = JSON.parse(profile?.booked_dates || "[]"); } catch {}
  try { bookedSlots  = JSON.parse(profile?.booked_slots  || "[]"); } catch {}
  if (!bookedDates.includes(booking.event_date)) bookedDates.push(booking.event_date);
  const slot = {
    bookingId: booking.id, eventId: booking.event_id, eventTitle: booking.event_title,
    date: booking.event_date, startTime: booking.start_time, endTime: booking.end_time,
    organizerId: booking.organizer_id, organizerName: booking.organizer_name,
  };
  if (!bookedSlots.some(s => Number(s.bookingId) === Number(booking.id))) bookedSlots.push(slot);
  await supabaseAdmin.from("artist_profiles").upsert({
    user_id: Number(booking.artist_id),
    booked_dates: JSON.stringify(bookedDates),
    booked_slots: JSON.stringify(bookedSlots),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

/* ─── GET ─────────────────────────────────────────────────── */
export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  try {
    const { searchParams } = new URL(request.url);
    const artistId    = searchParams.get("artistId");
    const organizerId = searchParams.get("organizerId");

    // Endpoint speciale: controlla disponibilità artista prima di inviare richiesta
    const checkDate      = searchParams.get("checkDate");
    const checkArtistId  = searchParams.get("checkArtistId");
    const checkStartTime = searchParams.get("checkStartTime");
    const checkEndTime   = searchParams.get("checkEndTime");

    if (checkDate && checkArtistId) {
      const result = await checkArtistAvailability({
        artistId:  checkArtistId,
        eventDate: checkDate,
        startTime: checkStartTime || "00:00",
        endTime:   checkEndTime   || "23:59",
      });
      return NextResponse.json(result);
    }

    let query = supabaseAdmin.from("bookings").select("*").order("id", { ascending: false });
    if (user.role === "admin" || user.role === "referent") {
      if (artistId)    query = query.eq("artist_id",    Number(artistId));
      if (organizerId) query = query.eq("organizer_id", Number(organizerId));
    } else if (user.role === "artist") {
      query = query.eq("artist_id", Number(user.id));
    } else if (user.role === "organizer") {
      query = query.eq("organizer_id", Number(user.id));
    } else if (user.role === "promoter") {
      query = query.eq("promoter_id", Number(user.id));
    } else {
      return forbidden();
    }
    const { data: bookings, error } = await query;
    if (error) return NextResponse.json({ error: "Errore caricamento booking" }, { status: 500 });
    return NextResponse.json((bookings||[]).map(mapBookingToFrontend));
  } catch (e) {
    console.error("GET bookings:", e);
    return NextResponse.json({ error: "Errore server booking" }, { status: 500 });
  }
}

/* ─── POST ────────────────────────────────────────────────── */
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "organizer" && user.role !== "admin") return forbidden();
  try {
    const body = await request.json();
    if (!body.eventDate || !body.startTime || !body.endTime)
      return NextResponse.json({ error: "Data, ora inizio e ora fine sono obbligatorie" }, { status: 400 });
    if (timeToMinutes(body.startTime) >= timeToMinutes(body.endTime))
      return NextResponse.json({ error: "L'ora fine deve essere successiva all'ora inizio" }, { status: 400 });

    // Controllo disponibilità completo (calendario + booking esistenti)
    const availability = await checkArtistAvailability({
      artistId:  body.artistId,
      eventDate: body.eventDate,
      startTime: body.startTime,
      endTime:   body.endTime,
    });
    if (!availability.available) {
      return NextResponse.json(
        { error: availability.message, reason: availability.reason },
        { status: 409 }
      );
    }

    const { data: booking, error } = await supabaseAdmin
      .from("bookings").insert({
        organizer_id:   Number(body.organizerId),
        organizer_name: body.organizerName  || "",
        artist_id:      Number(body.artistId),
        artist_name:    body.artistName     || "",
        artist_cachet:  body.artistCachet   || body.cachet || "",
        cachet:         body.cachet         || body.artistCachet || "",
        public_price:   body.publicPrice    || null,
        promoter_id:    body.promoterId     || null,
        promoter_name:  body.promoterName   || "",
        event_id:       body.eventId        || null,
        event_title:    body.eventTitle     || "",
        event_date:     body.eventDate      || "",
        start_time:     body.startTime      || "",
        end_time:       body.endTime        || "",
        message:        body.message        || "",
        status:         "pending",
        payment_status: "pending",
        updated_at:     new Date().toISOString(),
      }).select("*").single();
    if (error) return NextResponse.json({ error: "Errore creazione booking" }, { status: 500 });
    await updateEventStatus(body.eventId, "pending");
    return NextResponse.json(mapBookingToFrontend(booking));
  } catch (e) {
    console.error("POST bookings:", e);
    return NextResponse.json({ error: e?.message || "Errore server" }, { status: 500 });
  }
}

/* ─── PATCH ───────────────────────────────────────────────── */
export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });

    const { data: current, error: fetchErr } = await supabaseAdmin
      .from("bookings").select("*").eq("id", Number(body.id)).maybeSingle();
    if (fetchErr || !current) return NextResponse.json({ error: "Booking non trovato" }, { status: 404 });

    const now = new Date().toISOString();
    let updates = { updated_at: now };

    if (body.status && !body.paymentAction) {
      if (user.role !== "admin") {
        const isArtist    = user.role === "artist"    && Number(current.artist_id)    === Number(user.id);
        const isOrganizer = user.role === "organizer" && Number(current.organizer_id) === Number(user.id);
        if (!isArtist && !isOrganizer) return forbidden();
      }
      if (body.status === "accepted") {
        const availability = await checkArtistAvailability({
          artistId:        current.artist_id,
          eventDate:       current.event_date,
          startTime:       current.start_time,
          endTime:         current.end_time,
          excludeBookingId: current.id,
        });
        if (!availability.available) {
          return NextResponse.json({ error: availability.message }, { status: 409 });
        }
      }
      updates.status = body.status;
    }


    /* ══════════════════════════════════════════════════════
       CASO 3 — cancellazione booking
    ══════════════════════════════════════════════════════ */
    if (body.cancelAction) {
      const isArtist    = user.role === "artist"    && Number(current.artist_id)    === Number(user.id);
      const isOrganizer = user.role === "organizer" && Number(current.organizer_id) === Number(user.id);
      const isAdmin     = user.role === "admin";

      if (!isArtist && !isOrganizer && !isAdmin) return forbidden();

      if (current.payment_status === "completed")
        return NextResponse.json({ error: "Non puoi cancellare un booking già completato" }, { status: 400 });

      if (!body.cancelReason || body.cancelReason.trim().length < 10)
        return NextResponse.json({ error: "Inserisci una motivazione di almeno 10 caratteri" }, { status: 400 });

      updates.status               = "cancelled";
      updates.cancelled_at         = now;
      updates.cancelled_by         = Number(user.id);
      updates.cancel_reason        = body.cancelReason.trim();
      updates.cancel_initiated_by  = isAdmin ? "admin" : isArtist ? "artist" : "organizer";
    }

    if (body.paymentAction) {
      const action = body.paymentAction;
      if (action === "venue_paid") {
        if (user.role !== "organizer" || Number(current.organizer_id) !== Number(user.id)) return forbidden();
        if (!["accepted","confirmed"].includes(current.status))
          return NextResponse.json({ error: "Il booking deve essere accettato prima di confermare il pagamento" }, { status: 400 });
        if (current.payment_status !== "pending")
          return NextResponse.json({ error: "Pagamento già registrato" }, { status: 400 });
        updates.payment_status = "paid_by_venue";
        updates.paid_venue_at  = now;
      } else if (action === "artist_confirm") {
        if (user.role !== "artist" || Number(current.artist_id) !== Number(user.id)) return forbidden();
        if (!["paid_by_venue","paid_to_promoter"].includes(current.payment_status))
          return NextResponse.json({ error: "Il locale non ha ancora confermato il pagamento" }, { status: 400 });
        updates.paid_artist_at = now;
        const hasPromoter = !!current.promoter_id;
        if (!hasPromoter || current.paid_promoter_at) {
          updates.payment_status = "completed";
        } else {
          updates.payment_status = "paid_to_artist";
        }
      } else if (action === "promoter_confirm") {
        if (user.role !== "promoter" || Number(current.promoter_id) !== Number(user.id)) return forbidden();
        if (!["paid_by_venue","paid_to_artist"].includes(current.payment_status))
          return NextResponse.json({ error: "Il locale non ha ancora confermato il pagamento" }, { status: 400 });
        updates.paid_promoter_at = now;
        if (current.paid_artist_at) {
          updates.payment_status = "completed";
        } else {
          updates.payment_status = "paid_to_promoter";
        }
      } else if (action === "admin_confirm_venue") {
        if (user.role !== "admin") return forbidden();
        updates.payment_status = "paid_by_venue";
        updates.paid_venue_at  = now;
      } else {
        return NextResponse.json({ error: "paymentAction non riconosciuta" }, { status: 400 });
      }
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("bookings").update(updates).eq("id", Number(body.id)).select("*").single();
    if (updateErr) return NextResponse.json({ error: "Errore aggiornamento booking" }, { status: 500 });

    await updateEventStatus(updated.event_id, updated.status);
    if (updates.status === "accepted") await updateArtistBookedSlots(updated);

    return NextResponse.json(mapBookingToFrontend(updated));
  } catch (e) {
    console.error("PATCH bookings:", e);
    return NextResponse.json({ error: e?.message || "Errore server" }, { status: 500 });
  }
}