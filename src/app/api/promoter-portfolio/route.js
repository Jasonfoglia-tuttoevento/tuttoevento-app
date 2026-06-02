import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

// GET: portfolio del promoter (o di un promoter specifico se admin)
export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "promoter" && user.role !== "admin") return forbidden();

  try {
    const { searchParams } = new URL(request.url);
    const promoterId = user.role === "admin" ? searchParams.get("promoterId") : user.id;

    if (!promoterId) return NextResponse.json({ error: "promoterId mancante" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("promoter_portfolio")
      .select("*")
      .eq("promoter_id", Number(promoterId))
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "Errore caricamento portfolio" }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

// POST: aggiunge entità al portfolio (promoter o admin)
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "promoter" && user.role !== "admin") return forbidden();

  try {
    const body = await request.json();
    if (!body.entityType || !body.entityId) {
      return NextResponse.json({ error: "entityType e entityId obbligatori" }, { status: 400 });
    }

    const promoterId = user.role === "admin" && body.promoterId ? body.promoterId : user.id;

    // Recupera nome entità
    const { data: entityUser } = await supabaseAdmin
      .from("users").select("name").eq("id", Number(body.entityId)).maybeSingle();

    const { data, error } = await supabaseAdmin
      .from("promoter_portfolio")
      .insert({
        promoter_id: Number(promoterId),
        entity_type: body.entityType,
        entity_id: Number(body.entityId),
        entity_name: entityUser?.name || body.entityName || "",
        notes: body.notes || "",
      })
      .select("*").single();

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "Già presente nel portfolio" }, { status: 409 });
      return NextResponse.json({ error: "Errore salvataggio portfolio" }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

// DELETE: rimuove entità dal portfolio
export async function DELETE(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "promoter" && user.role !== "admin") return forbidden();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });

    // Verifica proprietà se promoter
    if (user.role === "promoter") {
      const { data: item } = await supabaseAdmin
        .from("promoter_portfolio").select("promoter_id").eq("id", id).maybeSingle();
      if (!item || Number(item.promoter_id) !== Number(user.id)) return forbidden();
    }

    const { error } = await supabaseAdmin.from("promoter_portfolio").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Errore eliminazione" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}