// src/middleware.js — sostituisce completamente il proxy.js attuale
// Gestisce: autenticazione, rate limiting, security headers, protezione route

import { NextResponse } from "next/server";

// ── Route pubbliche (no auth richiesta) ──
const PUBLIC_PATHS = new Set([
  "/", "/login", "/register", "/privacy", "/cookie-policy",
  "/chi-siamo", "/offline", "/manifest.webmanifest",
]);
const PUBLIC_PREFIXES = [
  "/termini/", "/icons/", "/_next/", "/api/login", "/api/register",
  "/api/chat-public", "/hero", "/favicon", "/sw.js",
];

// ── Rate limiting in memoria ──
// Struttura: { ip: { count, resetAt } }
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMITS = {
  "/api/login":           { max: 5,   window: 15 * 60 * 1000 }, // 5 tentativi/15min
  "/api/register":        { max: 3,   window: 60 * 60 * 1000 }, // 3/ora
  "/api/contact-request": { max: 10,  window: 60 * 60 * 1000 }, // 10/ora
  "/api/chat-public":     { max: 20,  window: 60 * 60 * 1000 }, // 20/ora
  default:                { max: 200, window: 60 * 1000 },       // 200/minuto per le altre API
};

function checkRateLimit(ip, path) {
  const config = RATE_LIMITS[path] || RATE_LIMITS.default;
  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.window });
    return { ok: true, remaining: config.max - 1 };
  }
  if (entry.count >= config.max) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { ok: true, remaining: config.max - entry.count };
}

// Pulizia periodica del rate limit store (evita memory leak)
let lastCleanup = Date.now();
function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return; // ogni 5 minuti
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  cleanupRateLimits();

  // ── 1. Security headers su tutte le risposte ──
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  // ── 2. Rate limiting per le API ──
  if (pathname.startsWith("/api/")) {
    const limit = checkRateLimit(ip, pathname);
    if (!limit.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Troppe richieste. Riprova tra poco." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
    response.headers.set("X-RateLimit-Remaining", String(limit.remaining));
  }

  // ── 3. Blocca path traversal e injection nei path ──
  if (pathname.includes("..") || pathname.includes("//") || /[<>'"`;]/.test(pathname)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // ── 4. Route pubbliche: passa senza auth ──
  if (PUBLIC_PATHS.has(pathname)) return response;
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return response;

  // ── 5. Dashboard e API protette: verifica sessione ──
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
    const sessionCookie =
      request.cookies.get("sb-access-token")?.value ||
      request.cookies.get("supabase-auth-token")?.value;

    if (!sessionCookie) {
      if (pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Non autenticato" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|hero.mp4|hero-poster.png).*)",
  ],
};