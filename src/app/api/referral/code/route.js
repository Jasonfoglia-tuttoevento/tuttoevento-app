// src/app/api/referral/code/route.js
// GET  — restituisce il codice referral del promoter loggato (o lo genera)
// POST — genera/rigenera il codice referral

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateCode(name) {
  const letters = (name || "PRO").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3).padEnd(3, "X");
  const digits  = String(Math.floor(Math.random() * 9999 + 1)).padStart(4, "0");
  return `TE${letters}${digits}`;
}

export async function GET(req) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  if (user.role !== "promoter") return Response.json({ error: "Solo i promoter hanno un codice referral" }, { status: 403 });

  // Se già ha un codice, restituiscilo
  if (user.referral_code) return Response.json({ code: user.referral_code, link: `https://tuttoevento.it/register?ref=${user.referral_code}` });

  // Altrimenti genera
  let code = generateCode(user.name);
  // Assicurati sia unico
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase.from("users").select("id").eq("referral_code", code).single();
    if (!existing) break;
    code = generateCode(user.name);
    attempts++;
  }

  const { error } = await supabase.from("users").update({ referral_code: code }).eq("id", user.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ code, link: `https://tuttoevento.it/register?ref=${code}` });
}

export async function POST(req) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  if (user.role !== "promoter") return Response.json({ error: "Solo i promoter" }, { status: 403 });

  let code = generateCode(user.name);
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase.from("users").select("id").eq("referral_code", code).single();
    if (!existing) break;
    code = generateCode(user.name);
    attempts++;
  }

  const { error } = await supabase.from("users").update({ referral_code: code }).eq("id", user.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ code, link: `https://tuttoevento.it/register?ref=${code}` });
}