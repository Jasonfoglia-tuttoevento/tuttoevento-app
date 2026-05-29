import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: "Compila tutti i campi" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(body.email).trim().toLowerCase();

    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUserError) {
      return NextResponse.json(
        { error: "Errore controllo email" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 409 }
      );
    }

    const { data: createdUser, error: createUserError } = await supabaseAdmin
      .from("users")
      .insert({
        name: body.name,
        email: normalizedEmail,
        password: hashPassword(body.password),
        role: body.role,
        business_mode: body.businessMode || "both",
      })
      .select("id, name, email, role, business_mode")
      .single();

    if (createUserError) {
      console.error("Errore Supabase register:", createUserError);

      return NextResponse.json(
        { error: "Errore durante la registrazione" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      businessMode: createdUser.business_mode,
    });
  } catch (error) {
    console.error("Errore API register:", error);

    return NextResponse.json(
      { error: "Errore server registrazione" },
      { status: 500 }
    );
  }
}