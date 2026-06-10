// src/app/api/pricing-approval/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

/* ─── GET: lista richieste ───────────────────────────────────── */
export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId");

  try {
    let query = supabaseAdmin
      .from("pricing_approvals")
      .select("*")
      .order("created_at", { ascending: false });

    if (user.role === "admin" || user.role === "referent") {
      // Admin vede tutto, con filtro opzionale per artista
      if (artistId) query = query.eq("artist_id", Number(artistId));
    } else if (user.role === "artist") {
      // Artista vede solo le sue richieste
      query = query.eq("artist_id", Number(user.id));
    } else if (user.role === "promoter") {
      // Promoter vede le richieste dei suoi artisti
      query = query.eq("promoter_id", Number(user.id));
    } else {
      return forbidden();
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ─── POST: artista invia richiesta approvazione ─────────────── */
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "artist") return forbidden();

  try {
    const body = await request.json();
    const { pricing } = body;

    if (!pricing || typeof pricing !== "object") {
      return NextResponse.json({ error: "Pricing non valido" }, { status: 400 });
    }

    // Controlla che ci sia almeno un prezzo inserito
    const hasAnyPrice = Object.values(pricing).some(durations =>
      Object.values(durations || {}).some(v => v && Number(v) > 0)
    );
    if (!hasAnyPrice) {
      return NextResponse.json({ error: "Inserisci almeno un prezzo prima di inviare" }, { status: 400 });
    }

    // Trova il promoter associato tramite referred_by
    let promoterId   = null;
    let promoterName = "";
    if (user.referred_by) {
      const { data: promoter } = await supabaseAdmin
        .from("users")
        .select("id, name")
        .eq("referral_code", user.referred_by)
        .maybeSingle();
      if (promoter) {
        promoterId   = promoter.id;
        promoterName = promoter.name;
      }
    }

    // Cancella eventuali richieste pending precedenti dello stesso artista
    await supabaseAdmin
      .from("pricing_approvals")
      .delete()
      .eq("artist_id", Number(user.id))
      .eq("status", "pending");

    // Crea nuova richiesta
    const { data: approval, error } = await supabaseAdmin
      .from("pricing_approvals")
      .insert({
        artist_id:      Number(user.id),
        artist_name:    user.name || "",
        promoter_id:    promoterId,
        promoter_name:  promoterName,
        cachet_pricing: pricing,
        status:         "pending",
        updated_at:     new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Aggiorna stato su artist_profiles
    await supabaseAdmin
      .from("artist_profiles")
      .upsert({
        user_id:        Number(user.id),
        pricing:        JSON.stringify(pricing),
        pricing_status: "pending",
        updated_at:     new Date().toISOString(),
      }, { onConflict: "user_id" });

    return NextResponse.json({ ok: true, id: approval.id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ─── PATCH: admin approva/rifiuta ───────────────────────────── */
export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin" && user.role !== "referent") return forbidden();

  try {
    const body = await request.json();
    const { id, action, publicPricing, adminNote } = body;
    // action: "approve" | "reject"

    if (!id || !action) {
      return NextResponse.json({ error: "id e action obbligatori" }, { status: 400 });
    }
    if (action === "approve" && !publicPricing) {
      return NextResponse.json({ error: "Devi impostare i prezzi pubblici prima di approvare" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newStatus = action === "approve" ? "approved" : "rejected";

    // Aggiorna la richiesta
    const { data: approval, error } = await supabaseAdmin
      .from("pricing_approvals")
      .update({
        status:         newStatus,
        public_pricing: publicPricing || null,
        admin_note:     adminNote     || null,
        reviewed_at:    now,
        reviewed_by:    Number(user.id),
        updated_at:     now,
      })
      .eq("id", Number(id))
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Se approvato → salva public_pricing e pricing_status su artist_profiles
    if (action === "approve") {
      await supabaseAdmin
        .from("artist_profiles")
        .upsert({
          user_id:        Number(approval.artist_id),
          public_pricing: publicPricing,
          pricing_status: "approved",
          updated_at:     now,
        }, { onConflict: "user_id" });
    } else {
      // Rifiutato → torna a draft
      await supabaseAdmin
        .from("artist_profiles")
        .update({ pricing_status: "rejected", updated_at: now })
        .eq("user_id", Number(approval.artist_id));
    }

    return NextResponse.json({ ok: true, approval });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}