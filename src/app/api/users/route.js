import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin" && user.role !== "referent") return forbidden();

  try {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role, business_mode, referent_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore Supabase users:", error);
      return NextResponse.json({ error: "Errore caricamento utenti" }, { status: 500 });
    }

    return NextResponse.json(
      (users || []).map((u) => ({
        id: u.id,
        name: u.name || "",
        email: u.email || "",
        role: u.role || "other",
        businessMode: u.business_mode || "both",
        referentId: u.referent_id || null,
        createdAt: u.created_at || null,
      }))
    );
  } catch (e) {
    console.error("Errore API users:", e);
    return NextResponse.json({ error: "Errore server utenti" }, { status: 500 });
  }
}