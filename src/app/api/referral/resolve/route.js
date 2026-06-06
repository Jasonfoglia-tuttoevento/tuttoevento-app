// src/app/api/referral/resolve/route.js
// GET ?code=XXXXXXXX — risolve un codice referral e restituisce info promoter (pubblico)

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return Response.json({ error: "Codice mancante" }, { status: 400 });

  const { data } = await supabase
    .from("users")
    .select("id, name, referral_code")
    .eq("referral_code", code.toUpperCase())
    .eq("role", "promoter")
    .single();

  if (!data) return Response.json({ error: "Codice non valido" }, { status: 404 });
  return Response.json({ promoterName: data.name, code: data.referral_code });
}