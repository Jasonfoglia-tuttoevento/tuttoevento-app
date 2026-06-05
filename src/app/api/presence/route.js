// src/app/api/presence/route.js
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST — aggiorna last_seen dell'utente corrente
export async function POST(req) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  await supabase
    .from("users")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", user.id);

  return Response.json({ ok: true });
}

// GET — restituisce last_seen di tutti gli utenti (solo id + last_seen)
export async function GET(req) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const { data } = await supabase
    .from("users")
    .select("id, last_seen")
    .not("last_seen", "is", null);

  return Response.json(data || []);
}