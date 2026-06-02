import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const { data } = await supabaseAdmin.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100);
  return NextResponse.json(data || []);
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const body = await request.json();
  if (!body.action) return NextResponse.json({ error: "action obbligatoria" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("admin_audit_log").insert({
    action: body.action, entity_type: body.entityType || "",
    entity_id: body.entityId || null, entity_name: body.entityName || "",
    detail: body.detail || "",
  }).select("*").single();
  if (error) return NextResponse.json({ error: "Errore log" }, { status: 500 });
  return NextResponse.json(data);
}