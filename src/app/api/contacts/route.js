import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("company_contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: "Errore lettura contatti" }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: "Nome obbligatorio" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("company_contacts")
      .insert({
        name: body.name,
        role: body.role || "",
        email: body.email || "",
        phone: body.phone || "",
        notes: body.notes || "",
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: "Errore salvataggio contatto" }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });
    const { error } = await supabaseAdmin.from("company_contacts").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Errore eliminazione" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}