import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const { data } = await supabaseAdmin.from("admin_tasks").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: "Titolo obbligatorio" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("admin_tasks").insert({
    title: body.title, description: body.description || "",
    status: body.status || "todo", priority: body.priority || "normal",
    related_type: body.relatedType || "", related_id: body.relatedId || null,
    related_name: body.relatedName || "", due_date: body.dueDate || "",
    updated_at: new Date().toISOString(),
  }).select("*").single();
  if (error) return NextResponse.json({ error: "Errore salvataggio task" }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id mancante" }, { status: 400 });
  const payload = { updated_at: new Date().toISOString() };
  if (body.status) payload.status = body.status;
  if (body.title) payload.title = body.title;
  if (body.priority) payload.priority = body.priority;
  const { data, error } = await supabaseAdmin.from("admin_tasks").update(payload).eq("id", body.id).select("*").single();
  if (error) return NextResponse.json({ error: "Errore aggiornamento task" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });
  await supabaseAdmin.from("admin_tasks").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}