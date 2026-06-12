// src/app/api/reset-password/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password)
      return NextResponse.json({ error: "Token e password obbligatori" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "Password di almeno 8 caratteri" }, { status: 400 });

    // Crea un client Supabase con il token dell'utente
    // per poter aggiornare la sua password
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    // Imposta la sessione con l'access token di recovery
    const { error: sessionError } = await supabaseUser.auth.setSession({
      access_token:  token,
      refresh_token: token, // per recovery basta l'access token
    });

    if (sessionError) {
      console.error("setSession error:", sessionError);
      return NextResponse.json(
        { error: "Link scaduto o non valido. Richiedi un nuovo link." },
        { status: 401 }
      );
    }

    // Aggiorna la password
    const { error: updateError } = await supabaseUser.auth.updateUser({ password });

    if (updateError) {
      console.error("updateUser error:", updateError);
      // Token scaduto è l'errore più comune
      if (updateError.message?.includes("expired") || updateError.status === 401)
        return NextResponse.json(
          { error: "Il link è scaduto. Richiedi un nuovo link per reimpostare la password." },
          { status: 401 }
        );
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("reset-password:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}