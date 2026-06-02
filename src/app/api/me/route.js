import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
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

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role, business_mode")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (userError || !userData) {
      return NextResponse.json({ error: "Profilo non trovato" }, { status: 404 });
    }

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      businessMode: userData.business_mode || "both",
    });
  } catch (e) {
    console.error("Errore API /me:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}