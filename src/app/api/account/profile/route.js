// src/app/api/account/profile/route.js
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(req) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return Response.json({ error: "Nome non valido" }, { status: 400 });

  const { error } = await supabase
    .from("users")
    .update({ name: name.trim() })
    .eq("id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}