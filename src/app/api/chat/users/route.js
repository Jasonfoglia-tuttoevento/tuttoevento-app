import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("currentUserId");

    let query = supabaseAdmin
      .from("users")
      .select("id, name, email, role")
      .order("role", { ascending: true })
      .order("name", { ascending: true });

    if (currentUserId) {
      query = query.neq("id", Number(currentUserId));
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("Errore Supabase GET chat users:", error);

      return NextResponse.json(
        { error: "Errore caricamento utenti chat" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      users.map((user) => ({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      }))
    );
  } catch (error) {
    console.error("Errore API chat users:", error);

    return NextResponse.json(
      { error: "Errore server utenti chat" },
      { status: 500 }
    );
  }
}