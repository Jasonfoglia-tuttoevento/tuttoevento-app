// src/app/api/promoter-commissions/route.js
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const { data } = await supabase
    .from("promoter_commissions")
    .select("*")
    .eq("promoter_id", user.id)
    .order("created_at", { ascending: false });

  return Response.json(data || []);
}