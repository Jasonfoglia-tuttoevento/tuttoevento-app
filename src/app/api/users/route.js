import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        name,
        email,
        role,
        business_mode,
        referent_id,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore Supabase users:", error);

      return NextResponse.json(
        { error: "Errore caricamento utenti" },
        { status: 500 }
      );
    }

    const normalizedUsers = (users || []).map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role || "other",
      businessMode: user.business_mode || "both",
      referentId: user.referent_id || null,
      createdAt: user.created_at || null,
    }));

    return NextResponse.json(normalizedUsers);
  } catch (error) {
    console.error("Errore API users:", error);

    return NextResponse.json(
      { error: "Errore server utenti" },
      { status: 500 }
    );
  }
}