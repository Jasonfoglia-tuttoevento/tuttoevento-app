import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";
import { Resend } from "resend";
import { sendPushToUser } from "@/lib/pushNotifications";
import { generateContractText, TERMS_VERSION } from "@/lib/contract-template";

const resend = new Resend(process.env.RESEND_API_KEY);

// Trova admin e promoter da notificare per una richiesta
async function getRecipientsForRequest({ artistId, organizerId }) {
  const recipients = [];

  // Admin
  const { data: admins } = await supabaseAdmin
    .from("users").select("id, name, email").eq("role", "admin");
  if (admins) recipients.push(...admins.map(a => ({ ...a, type: "admin" })));

  // Promoter collegati all'artista
  const { data: artistPromoters } = await supabaseAdmin
    .from("promoter_portfolio")
    .select("promoter_id, users:promoter_id(id, name, email)")
    .eq("entity_type", "artist")
    .eq("entity_id", Number(artistId));
  if (artistPromoters) {
    artistPromoters.forEach(p => {
      if (p.users) recipients.push({ ...p.users, type: "promoter" });
    });
  }

  // Promoter collegati al locale
  const { data: venuePromoters } = await supabaseAdmin
    .from("promoter_portfolio")
    .select("promoter_id, users:promoter_id(id, name, email)")
    .eq("entity_type", "venue")
    .eq("entity_id", Number(organizerId));
  if (venuePromoters) {
    venuePromoters.forEach(p => {
      if (p.users) recipients.push({ ...p.users, type: "promoter" });
    });
  }

  // Deduplicazione per id
  const seen = new Set();
  return recipients.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// GET: lista richieste (admin vede tutto, organizer vede le sue, promoter vede quelle del suo portfolio)
export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("contact_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (user.role === "organizer") {
      query = query.eq("organizer_id", Number(user.id));
    } else if (user.role === "artist") {
      query = query.eq("artist_id", Number(user.id));
    } else if (user.role === "promoter") {
      // Trova gli artisti e locali nel portfolio del promoter
      const { data: portfolio } = await supabaseAdmin
        .from("promoter_portfolio")
        .select("entity_type, entity_id")
        .eq("promoter_id", Number(user.id));

      if (!portfolio || portfolio.length === 0) return NextResponse.json([]);

      const artistIds = portfolio.filter(p => p.entity_type === "artist").map(p => p.entity_id);
      const venueIds = portfolio.filter(p => p.entity_type === "venue").map(p => p.entity_id);

      // Richieste dove l'artista o il locale è nel portfolio
      const conditions = [];
      if (artistIds.length > 0) conditions.push(`artist_id.in.(${artistIds.join(",")})`);
      if (venueIds.length > 0) conditions.push(`organizer_id.in.(${venueIds.join(",")})`);

      if (conditions.length === 0) return NextResponse.json([]);
      query = query.or(conditions.join(","));
    } else if (user.role !== "admin" && user.role !== "referent") {
      return forbidden();
    }

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "Errore caricamento richieste" }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    console.error("Errore GET contact-requests:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

// POST: crea nuova richiesta di contatto (solo organizer)
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "organizer") return forbidden();

  try {
    const body = await request.json();

    if (!body.artistId) {
      return NextResponse.json({ error: "artistId obbligatorio" }, { status: 400 });
    }

    // Recupera nome artista
    const { data: artistUser } = await supabaseAdmin
      .from("users").select("id, name").eq("id", Number(body.artistId)).maybeSingle();

    const { data: req, error } = await supabaseAdmin
      .from("contact_requests")
      .insert({
        organizer_id: Number(user.id),
        organizer_name: user.name || "",
        artist_id: Number(body.artistId),
        artist_name: artistUser?.name || "",
        event_date: body.eventDate || "",
        event_type: body.eventType || "",
        duration: body.duration || "",
        budget: body.budget ? Number(body.budget) : null,
        notes:      body.notes      || "",
        start_time: body.startTime  || null,
        end_time:   body.endTime    || null,
        status:     "pending",
        updated_at: new Date().toISOString(),
      })
      .select("*").single();

    if (error) {
      console.error("Errore creazione contact_request:", error);
      return NextResponse.json({ error: "Errore creazione richiesta" }, { status: 500 });
    }

    // Notifica admin e promoter
    const recipients = await getRecipientsForRequest({
      artistId: body.artistId,
      organizerId: user.id,
    });

    const emailHtml = `
      <div style="font-family:sans-serif;color:#0a0a0b;max-width:520px">
        <h2 style="color:#ff5a00">Nuova richiesta di contatto</h2>
        <p><strong>Locale:</strong> ${user.name}</p>
        <p><strong>Artista richiesto:</strong> ${artistUser?.name || "—"}</p>
        ${body.eventDate ? `<p><strong>Data evento:</strong> ${body.eventDate}</p>` : ""}
        ${body.eventType ? `<p><strong>Tipo evento:</strong> ${body.eventType}</p>` : ""}
        ${body.duration ? `<p><strong>Durata:</strong> ${body.duration}</p>` : ""}
        ${body.budget ? `<p><strong>Prezzo pubblico (approvato):</strong> €${body.budget}</p>` : ""}
        ${body.notes ? `<p><strong>Note:</strong> ${body.notes}</p>` : ""}
        <p style="margin-top:24px">
          <a href="https://tuttoevento.it/dashboard"
             style="background:#ff5a00;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">
             Gestisci dalla dashboard
          </a>
        </p>
      </div>
    `;

    // Email + push a tutti i destinatari
    await Promise.allSettled([
      ...recipients.map(r =>
        resend.emails.send({
          from: "TuttoEvento <onboarding@resend.dev>",
          to: r.email,
          subject: `Nuova richiesta di contatto — ${user.name} cerca ${artistUser?.name || "un artista"}`,
          html: emailHtml,
        })
      ),
      ...recipients.map(r =>
        sendPushToUser(r.id, {
          title: "Nuova richiesta di contatto",
          body: `${user.name} vuole contattare ${artistUser?.name || "un artista"}`,
          url: "/dashboard",
          tag: `contact-request-${req.id}`,
        })
      ),
    ]);

    // Messaggio automatico in chat: apre conversazione admin ↔ locale
    try {
      const adminUser = recipients.find(r => r.type === "admin");
      if (adminUser) {
        // Crea/trova conversazione admin ↔ locale
        const convRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/chat/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: request.headers.get("cookie") || "" },
          body: JSON.stringify({
            participantUserId: Number(user.id),
            title: `Richiesta · ${artistUser?.name || "Artista"}`,
          }),
        });
        const convData = await convRes.json();
        if (convData?.id) {
          await supabaseAdmin.from("chat_messages").insert({
            conversation_id: convData.id,
            sender_id: Number(adminUser.id),
            body: `Ciao ${user.name}! Abbiamo ricevuto la tua richiesta per ${artistUser?.name || "l'artista"}. Ti contatteremo presto con tutti i dettagli.`,
          });
        }
      }
    } catch (chatError) {
      console.error("Errore apertura chat automatica:", chatError);
    }

    return NextResponse.json(req);
  } catch (e) {
    console.error("Errore POST contact-request:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

// Durata -> orario di inizio/fine placeholder (l'admin potrà affinare dal booking)
const DURATION_TO_TIMES = {
  "1h":      { startTime: "22:00", endTime: "23:00" },
  "2h":      { startTime: "22:00", endTime: "00:00" },
  "3h":      { startTime: "22:00", endTime: "01:00" },
  "fullday": { startTime: "10:00", endTime: "23:59" },
};

// PATCH: aggiorna stato richiesta (solo admin)
// status === "connected" → crea un booking reale collegato alla richiesta,
// usando il public_pricing approvato per quel tipo evento/durata.
export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id e status obbligatori" }, { status: 400 });
    }

    // Recupera la richiesta corrente
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from("contact_requests")
      .select("*")
      .eq("id", Number(body.id))
      .maybeSingle();
    if (fetchErr || !current) return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });

    const now = new Date().toISOString();

    /* ── Caso "connected": crea booking reale ── */
    if (body.status === "connected" && !current.booking_id) {
      if (!current.event_date) {
        return NextResponse.json({ error: "La richiesta non ha una data evento" }, { status: 400 });
      }

      // Recupera public_pricing (prezzo locale) e cachet_pricing (prezzo artista) approvati
      const { data: artistProfile } = await supabaseAdmin
        .from("artist_profiles")
        .select("public_pricing, cachet_pricing, promoter_id")
        .eq("user_id", Number(current.artist_id))
        .maybeSingle();

      const publicPricing = artistProfile?.public_pricing || {};
      const cachetPricing = artistProfile?.cachet_pricing || {};
      const eventType = current.event_type || "";
      const duration  = current.duration   || "";
      const publicPrice  = Number(publicPricing?.[eventType]?.[duration]) || Number(current.budget) || 0;
      const artistCachet = Number(cachetPricing?.[eventType]?.[duration]) || 0;

      if (publicPrice <= 0) {
        return NextResponse.json({ error: "Nessun prezzo pubblico approvato per questo tipo evento/durata. Approva il cachet dell'artista prima di connettere." }, { status: 400 });
      }

      // Margine = prezzo pagato dal locale − cachet che prende l'artista
      const margine = Math.max(0, publicPrice - artistCachet);

      const times = current.start_time && current.end_time
        ? { startTime: current.start_time, endTime: current.end_time }
        : (DURATION_TO_TIMES[duration] || { startTime: "22:00", endTime: "23:59" });

      // Recupera promoter eventualmente collegato all'artista
      let promoterId = null, promoterName = "";
      const { data: artistPromoterLink } = await supabaseAdmin
        .from("promoter_portfolio")
        .select("promoter_id, users:promoter_id(id, name)")
        .eq("entity_type", "artist")
        .eq("entity_id", Number(current.artist_id))
        .maybeSingle();
      if (artistPromoterLink?.users) {
        promoterId   = artistPromoterLink.users.id;
        promoterName = artistPromoterLink.users.name || "";
      }

      // ── Calcolo commissioni sul MARGINE (prezzo locale − cachet artista) ──
      // Senza sub:  margine spaccato 50/50 → TuttoEvento 50%, promoter 50%
      // Con sub:    subpromoter 50% del margine, TuttoEvento 25%, promoter 25%
      let platformFee    = 0;
      let promoterFee    = 0;
      let subPromoterFee = 0;
      let promoterParentId = null;

      if (margine > 0 && promoterId) {
        const { data: promoterData } = await supabaseAdmin
          .from("users").select("promoter_parent_id").eq("id", Number(promoterId)).maybeSingle();
        promoterParentId = promoterData?.promoter_parent_id || null;
        if (promoterParentId) {
          // Il promoter che ha fatto la vendita è un sub: prende il 50% del margine
          // Il suo parent prende 25%, TuttoEvento 25%
          subPromoterFee = Math.round(margine * 0.50 * 100) / 100;
          platformFee    = Math.round(margine * 0.25 * 100) / 100;
          promoterFee    = Math.round(margine * 0.25 * 100) / 100;
        } else {
          // Promoter senza parent: 50% margine al promoter, 50% a TuttoEvento
          platformFee = Math.round(margine * 0.50 * 100) / 100;
          promoterFee = Math.round(margine * 0.50 * 100) / 100;
        }
      } else if (margine > 0) {
        // Nessun promoter coinvolto: tutto il margine a TuttoEvento
        platformFee = Math.round(margine * 100) / 100;
      }

      // ── Insert booking diretto su Supabase ──
      const { data: bookingData, error: bookingErr } = await supabaseAdmin
        .from("bookings")
        .insert({
          organizer_id:        Number(current.organizer_id),
          organizer_name:      current.organizer_name || "",
          artist_id:           Number(current.artist_id),
          artist_name:         current.artist_name || "",
          public_price:        publicPrice,
          promoter_id:         promoterId     || null,
          promoter_name:       promoterName   || "",
          promoter_parent_id:  promoterParentId || null,
          event_title:         eventType      || "Evento",
          event_date:          current.event_date || "",
          start_time:          times.startTime,
          end_time:            times.endTime,
          message:             current.notes  || "",
          platform_fee:        platformFee    || null,
          promoter_fee:        promoterFee    || null,
          sub_promoter_fee:    subPromoterFee || null,
          status:              "accepted",
          payment_status:      "pending",
          artist_confirmation: "pending",
          updated_at:          now,
        })
        .select("*").single();

      if (bookingErr) {
        console.error("Errore insert booking da connetti:", bookingErr);
        return NextResponse.json({ error: "Errore creazione booking: " + bookingErr.message }, { status: 500 });
      }

      // ── Commissioni ──
      if (margine > 0) {
        const commissions = [];
        commissions.push({ booking_id: bookingData.id, recipient_id: 1, recipient_role: "platform", amount: platformFee, percentage: promoterParentId ? 25 : (promoterId ? 50 : 100) });
        if (promoterId && promoterFee > 0)
          commissions.push({ booking_id: bookingData.id, recipient_id: Number(promoterId), recipient_role: promoterParentId ? "sub_promoter" : "promoter", amount: promoterParentId ? subPromoterFee : promoterFee, percentage: promoterParentId ? 50 : 50 });
        if (promoterParentId && promoterFee > 0)
          commissions.push({ booking_id: bookingData.id, recipient_id: Number(promoterParentId), recipient_role: "promoter", amount: promoterFee, percentage: 25 });
        if (commissions.length > 0)
          await supabaseAdmin.from("booking_commissions").insert(commissions);
      }

      // ── Genera contratto digitale (snapshot) ──
      try {
        const contractText = generateContractText({
          artistName:    current.artist_name,
          organizerName: current.organizer_name,
          eventDate:     current.event_date,
          eventType:     current.event_type,
          venue:         current.organizer_name,
          publicPrice,
          artistCachet,
          startTime:     times?.startTime,
          endTime:       times?.endTime,
        });
        await supabaseAdmin.from("contracts").insert({
          booking_id:       bookingData.id,
          content_snapshot: contractText,
          terms_version:    TERMS_VERSION,
          status:           "pending",
        });
      } catch (e) { console.error("Errore creazione contratto:", e); }

      // ── Aggiorna booked_dates artista ──
      try {
        const { data: artistProfile } = await supabaseAdmin
          .from("artist_profiles").select("booked_dates, booked_slots").eq("user_id", Number(current.artist_id)).maybeSingle();
        let bookedDates = []; let bookedSlots = [];
        try { bookedDates = JSON.parse(artistProfile?.booked_dates || "[]"); } catch {}
        try { bookedSlots  = JSON.parse(artistProfile?.booked_slots  || "[]"); } catch {}
        if (!bookedDates.includes(current.event_date)) bookedDates.push(current.event_date);
        const slot = { bookingId: bookingData.id, date: current.event_date, startTime: times.startTime, endTime: times.endTime, organizerId: current.organizer_id, organizerName: current.organizer_name };
        if (!bookedSlots.some(s => Number(s.bookingId) === Number(bookingData.id))) bookedSlots.push(slot);
        await supabaseAdmin.from("artist_profiles").upsert({
          user_id: Number(current.artist_id),
          booked_dates: JSON.stringify(bookedDates),
          booked_slots: JSON.stringify(bookedSlots),
          updated_at: now,
        }, { onConflict: "user_id" });
      } catch(e) { console.error("Errore update booked_dates:", e); }

      // Collega la richiesta al booking creato
      const { data, error } = await supabaseAdmin
        .from("contact_requests")
        .update({ status: body.status, booking_id: bookingData.id, updated_at: now })
        .eq("id", Number(body.id))
        .select("*").single();
      if (error) return NextResponse.json({ error: "Errore aggiornamento richiesta" }, { status: 500 });

      return NextResponse.json({ ...data, booking: bookingData });
    }

    /* ── Altri stati: solo aggiornamento status ── */
    const { data, error } = await supabaseAdmin
      .from("contact_requests")
      .update({ status: body.status, updated_at: now })
      .eq("id", Number(body.id))
      .select("*").single();

    if (error) return NextResponse.json({ error: "Errore aggiornamento richiesta" }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    console.error("Errore PATCH contact-request:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}