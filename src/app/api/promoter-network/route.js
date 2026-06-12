// src/app/api/promoter-network/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

/* ─── GET: dati rete del promoter ────────────────────────── */
export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("promoterId") || user.id;

  // Solo admin o il promoter stesso
  if (user.role !== "admin" && user.role !== "referent" && Number(user.id) !== Number(targetId))
    return forbidden();

  try {
    // Sub-promoter diretti
    const { data: subPromoters } = await supabaseAdmin
      .from("users")
      .select("id, name, email, plan, created_at, referral_code")
      .eq("promoter_parent_id", Number(targetId))
      .eq("role", "promoter")
      .order("created_at", { ascending: false });

    // Locali portati direttamente (referred_by = referral_code del promoter)
    const { data: meData } = await supabaseAdmin
      .from("users")
      .select("referral_code")
      .eq("id", Number(targetId))
      .maybeSingle();

    const myCode = meData?.referral_code;

    const { data: myVenues } = await supabaseAdmin
      .from("users")
      .select("id, name, email, created_at")
      .eq("role", "organizer")
      .eq("referred_by", myCode || "___NONE___")
      .order("created_at", { ascending: false });

    // Locali portati dai sub-promoter
    const subIds = (subPromoters || []).map(s => s.id);
    let subVenues = [];
    if (subIds.length > 0) {
      const subCodes = (subPromoters || []).map(s => s.referral_code).filter(Boolean);
      if (subCodes.length > 0) {
        const { data } = await supabaseAdmin
          .from("users")
          .select("id, name, email, created_at, referred_by")
          .eq("role", "organizer")
          .in("referred_by", subCodes);
        subVenues = data || [];
      }
    }

    // Booking e commissioni del promoter
    const { data: myBookings } = await supabaseAdmin
      .from("bookings")
      .select("id, event_date, event_title, artist_name, organizer_name, status, public_price, cachet, promoter_fee, platform_fee")
      .eq("promoter_id", Number(targetId))
      .order("event_date", { ascending: false })
      .limit(50);

    // Commissioni dei sub-promoter (il promoter padre prende 10%)
    const { data: subBookings } = await supabaseAdmin
      .from("bookings")
      .select("id, event_date, event_title, artist_name, organizer_name, status, public_price, cachet, sub_promoter_fee, promoter_parent_id")
      .eq("promoter_parent_id", Number(targetId))
      .order("event_date", { ascending: false })
      .limit(50);

    // Calcola totali
    const safe = b => ["accepted","confirmed","completed"].includes((b?.status||"").toLowerCase());
    const myConfirmed   = (myBookings||[]).filter(safe);
    const subConfirmed  = (subBookings||[]).filter(safe);

    const myCommission  = myConfirmed.reduce((s,b) => s + (Number(b.promoter_fee)||0), 0);
    const subCommission = subConfirmed.reduce((s,b) => s + (Number(b.sub_promoter_fee)||0), 0);

    return NextResponse.json({
      promoterId:     Number(targetId),
      referralCode:   myCode || "",
      // Rete
      subPromoters:   subPromoters || [],
      myVenues:       myVenues    || [],
      subVenues:      subVenues,
      // Booking
      myBookings:     (myBookings||[]).map(b => ({
        ...b,
        // Nasconde cachet al promoter — vede solo prezzo pubblico e sua commissione
        cachet: undefined,
        platform_fee: undefined,
      })),
      subBookings:    (subBookings||[]).map(b => ({
        ...b,
        cachet: undefined,
        platform_fee: undefined,
      })),
      // Commissioni
      summary: {
        myVenueCount:    (myVenues||[]).length,
        subPromoterCount: (subPromoters||[]).length,
        subVenueCount:   subVenues.length,
        totalVenues:     (myVenues||[]).length + subVenues.length,
        myBookings:      (myBookings||[]).length,
        myConfirmed:     myConfirmed.length,
        subBookings:     (subBookings||[]).length,
        subConfirmed:    subConfirmed.length,
        myCommission,
        subCommission,
        totalCommission: myCommission + subCommission,
      },
    });
  } catch (e) {
    console.error("promoter-network:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ─── POST: aggiungi sub-promoter tramite codice ─────────── */
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "promoter" && user.role !== "admin") return forbidden();

  const { referralCode } = await request.json();
  if (!referralCode?.trim())
    return NextResponse.json({ error: "Codice referral obbligatorio" }, { status: 400 });

  try {
    // Trova il sub-promoter dal codice
    const { data: subPromoter } = await supabaseAdmin
      .from("users")
      .select("id, name, role, promoter_parent_id, promoter_level")
      .eq("referral_code", referralCode.trim().toUpperCase())
      .eq("role", "promoter")
      .maybeSingle();

    if (!subPromoter)
      return NextResponse.json({ error: "Nessun promoter trovato con questo codice" }, { status: 404 });

    if (Number(subPromoter.id) === Number(user.id))
      return NextResponse.json({ error: "Non puoi aggiungere te stesso come sub-promoter" }, { status: 400 });

    if (subPromoter.promoter_parent_id)
      return NextResponse.json({ error: "Questo promoter ha già un promoter padre" }, { status: 409 });

    // Verifica che non crei un loop (il sub-promoter non deve essere già padre di chi lo invita)
    const { data: myData } = await supabaseAdmin
      .from("users")
      .select("promoter_parent_id")
      .eq("id", Number(user.id))
      .maybeSingle();
    if (myData?.promoter_parent_id === subPromoter.id)
      return NextResponse.json({ error: "Relazione circolare non permessa" }, { status: 400 });

    // Imposta la relazione
    await supabaseAdmin
      .from("users")
      .update({
        promoter_parent_id: Number(user.id),
        promoter_level:     1,
      })
      .eq("id", Number(subPromoter.id));

    return NextResponse.json({ ok: true, subPromoter: { id: subPromoter.id, name: subPromoter.name } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ─── DELETE: rimuovi sub-promoter dalla rete ────────────── */
export async function DELETE(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const subId = searchParams.get("subId");
  if (!subId) return NextResponse.json({ error: "subId obbligatorio" }, { status: 400 });

  // Solo il padre o admin può rimuovere
  const { data: sub } = await supabaseAdmin
    .from("users")
    .select("promoter_parent_id")
    .eq("id", Number(subId))
    .maybeSingle();

  if (!sub) return NextResponse.json({ error: "Sub-promoter non trovato" }, { status: 404 });
  if (user.role !== "admin" && Number(sub.promoter_parent_id) !== Number(user.id))
    return forbidden();

  await supabaseAdmin
    .from("users")
    .update({ promoter_parent_id: null, promoter_level: 0 })
    .eq("id", Number(subId));

  return NextResponse.json({ ok: true });
}