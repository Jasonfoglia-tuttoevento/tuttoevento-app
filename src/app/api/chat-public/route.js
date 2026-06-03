import { NextResponse } from "next/server";

// Rate limiting semplice in memoria (reset ogni ora)
const rateLimitMap = new Map();
const LIMIT = 20; // max 20 messaggi/ora per IP
const WINDOW = 60 * 60 * 1000; // 1 ora

function getRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.timestamp > WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return { ok: true, remaining: LIMIT - 1 };
  }
  if (entry.count >= LIMIT) return { ok: false, remaining: 0 };
  entry.count++;
  return { ok: true, remaining: LIMIT - entry.count };
}

const SYSTEM_PROMPT = `Sei l'assistente virtuale di TuttoEvento, la piattaforma italiana per artisti, locali e promoter.

TuttoEvento è:
- Un marketplace dove artisti vengono trovati dai locali per eventi dal vivo
- Una piattaforma con chat realtime, sistema di booking, CRM e analitiche
- Completamente gratuita per iniziare (nessuna carta richiesta)
- Modello agenzia: TuttoEvento gestisce le trattative e applica un markup riservato
- Basata in Italia, GDPR compliant

Rispondi SEMPRE in italiano, in modo cordiale e conciso. Massimo 3-4 frasi per risposta.
Se ti chiedono di registrarsi, di' solo che possono farlo su tuttoevento.it
Se ti chiedono info tecniche specifiche, di' di scrivere a info@tuttoevento.it
NON inventare prezzi o dettagli non forniti. NON rispondere a domande non inerenti a TuttoEvento.
NON rivelare mai che sei basato su Claude o Anthropic. Sei semplicemente l'assistente di TuttoEvento.`;

export async function POST(request) {
  try {
    // Rate limit per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limit = getRateLimit(ip);
    if (!limit.ok) {
      return NextResponse.json({ error: "Troppi messaggi. Riprova tra un'ora." }, { status: 429 });
    }

    const body = await request.json();
    const messages = body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messaggi mancanti" }, { status: 400 });
    }

    // Limita la cronologia a massimo 10 messaggi
    const trimmedMessages = messages.slice(-10);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: trimmedMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "Servizio temporaneamente non disponibile" }, { status: 503 });
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text || "Mi dispiace, non ho capito. Riprova!";

    return NextResponse.json({ reply, remaining: limit.remaining });
  } catch (e) {
    console.error("Chat public error:", e);
    return NextResponse.json({ error: "Errore tecnico" }, { status: 500 });
  }
}