// src/app/api/crm/contacts/route.js
import { NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { data, error } = await supabaseAdmin
    .from("crm_contacts").select("*").eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const b = await req.json();
  const { data, error } = await supabaseAdmin.from("crm_contacts").insert({
    owner_id: user.id,
    contact_id: b.contactId || null,
    contact_name: b.contactName || null,
    contact_type: b.contactType || "external",
    phone: b.phone || null,
    email: b.email || null,
    notes: b.notes || null,
    tags: b.tags || [],
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const b = await req.json();
  const { data, error } = await supabaseAdmin.from("crm_contacts")
    .update({
      notes: b.notes, tags: b.tags, phone: b.phone, email: b.email,
      contact_name: b.contactName, updated_at: new Date().toISOString(),
    })
    .eq("id", b.id).eq("owner_id", user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { searchParams } = new URL(req.url);
  await supabaseAdmin.from("crm_contacts").delete()
    .eq("id", searchParams.get("id")).eq("owner_id", user.id);
  return NextResponse.json({ ok: true });
}