import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const { data } = await supabaseAdmin.from("admin_notes").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const body = await request.json();
  if (!body.body || !body.entityType || !body.entityId) return NextResponse.json({ error: "Campi mancanti" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("admin_notes").insert({
    entity_type: body.entityType, entity_id: Number(body.entityId),
    entity_name: body.entityName || "", body: body.body,
  }).select("*").single();
  if (error) return NextResponse.json({ error: "Errore salvataggio nota" }, { status: 500 });
  return NextResponse.json(data);
}