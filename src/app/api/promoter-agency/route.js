// src/app/api/promoter-agency/route.js
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
    .from("promoter_agency")
    .select("*")
    .eq("promoter_id", user.id)
    .single();

  return Response.json(data || null);
}

export async function POST(req) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();

  const { data, error } = await supabase
    .from("promoter_agency")
    .upsert({
      promoter_id: user.id,
      agency_name: body.agency_name || null,
      bio:         body.bio         || null,
      logo_url:    body.logo_url    || null,
      website:     body.website     || null,
      instagram:   body.instagram   || null,
      updated_at:  new Date().toISOString(),
    }, { onConflict: "promoter_id" })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}