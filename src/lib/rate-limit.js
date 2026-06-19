// src/lib/rate-limit.js
// Rate limiting persistente su Supabase — funziona correttamente su Vercel serverless
// (a differenza di una Map in memoria, che si azzera ad ogni cold start/istanza diversa).
import { supabaseAdmin } from "@/lib/supabase";

const LIMITS = {
  login:          { max: 5,   windowMs: 15 * 60 * 1000 },
  register:       { max: 3,   windowMs: 60 * 60 * 1000 },
  "contact-request": { max: 10, windowMs: 60 * 60 * 1000 },
  "forgot-password": { max: 3, windowMs: 60 * 60 * 1000 },
  default:        { max: 200, windowMs: 60 * 1000 },
};

/**
 * Verifica ed incrementa il rate limit per una chiave (es. "login:1.2.3.4").
 * Ritorna { ok: boolean, remaining: number, resetAt: Date }.
 */
export async function checkRateLimit(bucket, identifier) {
  const config = LIMITS[bucket] || LIMITS.default;
  const key = `${bucket}:${identifier}`;
  const now = new Date();

  const { data: existing } = await supabaseAdmin
    .from("rate_limits").select("*").eq("key", key).maybeSingle();

  if (!existing || new Date(existing.reset_at) < now) {
    // Nuova finestra
    const resetAt = new Date(now.getTime() + config.windowMs);
    await supabaseAdmin.from("rate_limits").upsert({ key, count: 1, reset_at: resetAt.toISOString() });
    return { ok: true, remaining: config.max - 1, resetAt };
  }

  if (existing.count >= config.max) {
    return { ok: false, remaining: 0, resetAt: new Date(existing.reset_at) };
  }

  await supabaseAdmin.from("rate_limits")
    .update({ count: existing.count + 1 }).eq("key", key);
  return { ok: true, remaining: config.max - existing.count - 1, resetAt: new Date(existing.reset_at) };
}

/** Estrae l'IP del client dalla request (Vercel/Next.js) */
export function getClientIp(req) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
}

/** Helper pronto per le route: ritorna null se ok, altrimenti una Response 429 */
export async function rateLimitGuard(req, bucket) {
  const ip = getClientIp(req);
  const result = await checkRateLimit(bucket, ip);
  if (!result.ok) {
    const waitMin = Math.ceil((result.resetAt - new Date()) / 60000);
    return new Response(
      JSON.stringify({ error: `Troppi tentativi. Riprova tra ${waitMin} minuti.` }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }
  return null;
}