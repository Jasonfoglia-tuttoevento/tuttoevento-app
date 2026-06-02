import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const token = String(body.token || "");
    const password = String(body.password || "");

    if (!token || !password) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "La password deve avere almeno 8 caratteri" }, { status: 400 });
    }

    const { data: reset } = await supabaseAdmin
      .from("password_resets")
      .select("id, user_id, expires_at, used")
      .eq("token", token)
      .maybeSingle();

    if (!reset || reset.used) {
      return NextResponse.json({ error: "Link non valido o già usato" }, { status: 400 });
    }
    if (new Date(reset.expires_at) < new Date()) {
      return NextResponse.json({ error: "Link scaduto, richiedine uno nuovo" }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password: hashPassword(password) })
      .eq("id", reset.user_id);

    if (updateError) {
      console.error("Errore update password:", updateError);
      return NextResponse.json({ error: "Errore aggiornamento password" }, { status: 500 });
    }

    // invalida il token
    await supabaseAdmin.from("password_resets").update({ used: true }).eq("id", reset.id);

    return NextResponse.json({ message: "Password aggiornata. Ora puoi accedere." });
  } catch (error) {
    console.error("Errore API reset-password:", error);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}