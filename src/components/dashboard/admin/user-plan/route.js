// src/app/api/admin/user-plan/route.js
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(req) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Solo admin" }, { status: 403 });

  const body = await req.json();
  const { userId, plan, verified } = body;

  if (!userId) return Response.json({ error: "userId mancante" }, { status: 400 });

  const updates = {};
  if (plan !== undefined) {
    if (!["free","pro"].includes(plan))
      return Response.json({ error: "Piano non valido" }, { status: 400 });
    updates.plan = plan;
  }
  if (verified !== undefined) {
    updates.verified = Boolean(verified);
  }

  if (Object.keys(updates).length === 0)
    return Response.json({ error: "Nessun campo da aggiornare" }, { status: 400 });

  const { error } = await supabase.from("users").update(updates).eq("id", userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}