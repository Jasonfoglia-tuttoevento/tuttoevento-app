import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { rateLimitGuard } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    const limited = await rateLimitGuard(request, "login");
    if (limited) return limited;

    const body = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Inserisci email e password" }, { status: 400 });
    }

    const normalizedEmail = String(body.email).trim().toLowerCase();

    // Prepara la response vuota su cui scriveremo i cookie
    const response = NextResponse.json({ ok: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return []; },
          setAll(toSet) {
            toSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
              });
            });
          },
        },
      }
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: body.password,
    });

    if (authError || !authData.session) {
      return NextResponse.json({ error: "Credenziali errate" }, { status: 401 });
    }

    // Recupera ruolo e dati dalla tabella users
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role, business_mode")
      .eq("auth_id", authData.user.id)
      .maybeSingle();

    if (userError || !userData) {
      return NextResponse.json({ error: "Profilo utente non trovato" }, { status: 404 });
    }

    // Aggiorna il body della response con i dati utente
    // (i cookie sono già stati scritti sopra tramite setAll)
    return new NextResponse(
      JSON.stringify({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        businessMode: userData.business_mode || "both",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Copia tutti i cookie dalla response preparata sopra
          "Set-Cookie": response.headers.getSetCookie?.() ?? [],
        },
      }
    );
  } catch (error) {
    console.error("Errore API login:", error);
    return NextResponse.json({ error: "Errore server login" }, { status: 500 });
  }
}