import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Inserisci email e password" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(body.email).trim().toLowerCase();
    const hashedPassword = hashPassword(body.password);

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, password, role, business_mode")
      .eq("email", normalizedEmail)
      .eq("password", hashedPassword)
      .maybeSingle();

    if (error) {
      console.error("Errore Supabase login:", error);

      return NextResponse.json(
        { error: "Errore durante il login" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Credenziali errate" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessMode: user.business_mode || "both",
    });
  } catch (error) {
    console.error("Errore API login:", error);

    return NextResponse.json(
      { error: "Errore server login" },
      { status: 500 }
    );
  }
}