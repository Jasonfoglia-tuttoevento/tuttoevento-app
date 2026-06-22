// src/app/api/promoter-outreach/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";
import { Resend } from "resend";
import { rateLimitGuard } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

// GET — lista outreach: promoter vede le sue inviate, locale vede le ricevute
export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const col = user.role === "organizer" ? "venue_id" : "promoter_id";
  const { data, error } = await supabaseAdmin
    .from("promoter_outreach")
    .select("*")
    .eq(col, user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Arricchisci con nomi artisti e nome locale/promoter
  const allArtistIds = [...new Set((data || []).flatMap(o => o.artist_ids || []))];
  const otherIds = [...new Set((data || []).map(o => user.role === "organizer" ? o.promoter_id : o.venue_id))];

  const { data: artists } = allArtistIds.length
    ? await supabaseAdmin.from("artist_profiles").select("user_id, stage_name").in("user_id", allArtistIds)
    : { data: [] };
  const { data: others } = otherIds.length
    ? await supabaseAdmin.from("users").select("id, name").in("id", otherIds)
    : { data: [] };

  const artistMap = Object.fromEntries((artists||[]).map(a => [a.user_id, a.stage_name]));
  const otherMap  = Object.fromEntries((others||[]).map(u => [u.id, u.name]));

  const result = (data || []).map(o => ({
    ...o,
    artistNames: (o.artist_ids||[]).map(id => artistMap[id] || "Artista"),
    otherName: otherMap[user.role === "organizer" ? o.promoter_id : o.venue_id] || "—",
  }));

  return NextResponse.json(result);
}

// POST — invia proposta proattiva (promoter → locale)
export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "promoter" && user.role !== "admin") return forbidden();

  const limited = await rateLimitGuard(req, "contact-request");
  if (limited) return limited;

  const { venueId, artistIds, eventDate, message } = await req.json();
  if (!venueId || !Array.isArray(artistIds) || artistIds.length === 0 || !message)
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

  // Verifica che gli artisti siano nel roster del promoter
  const { data: portfolio } = await supabaseAdmin
    .from("promoter_portfolio")
    .select("entity_id")
    .eq("promoter_id", user.id)
    .eq("entity_type", "artist")
    .in("entity_id", artistIds);

  const allowedIds = (portfolio || []).map(p => p.entity_id);
  const validArtistIds = artistIds.filter(id => allowedIds.includes(Number(id)));
  if (validArtistIds.length === 0)
    return NextResponse.json({ error: "Nessuno degli artisti selezionati è nel tuo roster" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("promoter_outreach")
    .insert({
      promoter_id: user.id,
      venue_id: Number(venueId),
      artist_ids: validArtistIds,
      event_date: eventDate || null,
      message: message.slice(0, 1000),
      status: "sent",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notifica email al locale
  try {
    const { data: venue } = await supabaseAdmin.from("users").select("email, name").eq("id", venueId).maybeSingle();
    if (venue?.email) {
      await resend.emails.send({
        from: "TuttoEvento <notifiche@tuttoevento.it>",
        to: venue.email,
        subject: `${user.name} ti propone ${validArtistIds.length > 1 ? "alcuni artisti" : "un artista"} per un evento`,
        html: `<p>Ciao ${venue.name},</p><p>${user.name} ti ha mandato una proposta su TuttoEvento.</p><p>Accedi alla dashboard per vederla.</p>`,
      });
    }
  } catch (e) { console.error("Errore invio email outreach:", e); }

  return NextResponse.json(data, { status: 201 });
}

// PATCH — il locale risponde (interested | declined) o segna come vista
export async function PATCH(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

  const update = { status };
  if (status === "viewed") update.viewed_at = new Date().toISOString();
  else update.responded_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("promoter_outreach")
    .update(update)
    .eq("id", id)
    .eq("venue_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}