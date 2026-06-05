import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getSessionUser() {
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
    if (error || !user) return null;

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role, business_mode, plan, plan_expires_at")
      .eq("auth_id", user.id)
      .maybeSingle();

    return userData || null;
  } catch {
    return null;
  }
}

// Helper: risponde 401 se non autenticato, 403 se ruolo non autorizzato
export function unauthorized() {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
}