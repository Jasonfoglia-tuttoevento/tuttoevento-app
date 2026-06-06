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

  const { userId, plan } = await req.json();
  if (!userId || !["free","pro"].includes(plan))
    return Response.json({ error: "Parametri non validi" }, { status: 400 });

  const { error } = await supabase
    .from("users")
    .update({ plan, plan_expires_at: plan === "pro" ? null : null })
    .eq("id", userId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}