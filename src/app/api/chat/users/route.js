import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    // Esclude l'utente corrente dalla lista (preso dalla sessione, non dal body)
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role")
      .neq("id", Number(user.id))
      .order("role", { ascending: true })
      .order("name", { ascending: true });

    if (error) return NextResponse.json({ error: "Errore caricamento utenti chat" }, { status: 500 });

    return NextResponse.json(
      (users || []).map((u) => ({ id: u.id, name: u.name || "", email: u.email || "", role: u.role || "" }))
    );
  } catch (e) {
    console.error("Errore API chat users:", e);
    return NextResponse.json({ error: "Errore server utenti chat" }, { status: 500 });
  }
}