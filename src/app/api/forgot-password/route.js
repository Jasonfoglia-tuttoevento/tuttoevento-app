import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email obbligatoria" }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(toSet) {
            try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
            catch {}
          },
        },
      }
    );

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
    });

    // Risposta sempre uguale per non rivelare se l'email esiste
    return NextResponse.json({ message: "Se l'email esiste riceverai un link per reimpostare la password." });
  } catch (e) {
    console.error("Errore forgot-password:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}