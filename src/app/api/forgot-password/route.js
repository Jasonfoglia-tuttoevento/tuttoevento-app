import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const normalizedEmail = String(body.email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Inserisci la tua email" }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, name, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    // Risposta sempre uguale: non riveliamo se l'email esiste (sicurezza)
    const genericOk = NextResponse.json({
      message: "Se l'email esiste, riceverai un link per reimpostare la password.",
    });

    if (!user) return genericOk;

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 ora

    const { error: tokenError } = await supabaseAdmin
      .from("password_resets")
      .insert({ user_id: user.id, token, expires_at: expires, used: false });

    if (tokenError) {
      console.error("Errore creazione token reset:", tokenError);
      return NextResponse.json({ error: "Errore tecnico" }, { status: 500 });
    }

    const resetUrl = `https://tuttoevento.it/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from: "TuttoEvento <onboarding@resend.dev>", // dopo verifica dominio: noreply@tuttoevento.it
        to: normalizedEmail,
        subject: "Reimposta la tua password — TuttoEvento",
        html: `
          <div style="font-family:sans-serif;color:#0a0a0b">
            <h2>Ciao ${user.name},</h2>
            <p>Hai richiesto di reimpostare la password. Il link scade tra 1 ora.</p>
            <p style="margin-top:24px">
              <a href="${resetUrl}"
                 style="background:#ff5a00;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">
                 Reimposta password
              </a>
            </p>
            <p style="color:#6b6b73;font-size:13px;margin-top:24px">Se non sei stato tu, ignora questa email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Errore invio email reset:", mailError);
    }

    return genericOk;
  } catch (error) {
    console.error("Errore API forgot-password:", error);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}