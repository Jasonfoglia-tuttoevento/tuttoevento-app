import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// PDF termini per categoria (nomi identici ai file in /public)
const TERMS_BY_ROLE = {
  organizer: "termini-locali.pdf",
  artist: "termini-artisti.pdf",
  promoter: "termini-promoter.pdf",
};

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json({ error: "Compila tutti i campi" }, { status: 400 });
    }

    if (!body.termsAccepted) {
      return NextResponse.json({ error: "Devi accettare i termini e condizioni" }, { status: 400 });
    }

    const normalizedEmail = String(body.email).trim().toLowerCase();
    const pdfFileName = TERMS_BY_ROLE[body.role] || TERMS_BY_ROLE.organizer;

    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUserError) {
      return NextResponse.json({ error: "Errore controllo email" }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: "Email già registrata" }, { status: 409 });
    }

    const { data: createdUser, error: createUserError } = await supabaseAdmin
      .from("users")
      .insert({
        name: body.name,
        email: normalizedEmail,
        password: hashPassword(body.password),
        role: body.role,
        business_mode: body.businessMode || "both",
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        terms_doc: pdfFileName,
      })
      .select("id, name, email, role, business_mode")
      .single();

    if (createUserError) {
      console.error("Errore Supabase register:", createUserError);
      return NextResponse.json({ error: "Errore durante la registrazione" }, { status: 500 });
    }

    // Invio email di benvenuto con il PDF della categoria giusta (non blocca la registrazione)
    try {
      const pdfPath = path.join(process.cwd(), "public", pdfFileName);
      const pdf = fs.readFileSync(pdfPath);

      await resend.emails.send({
        from: "TuttoEvento <onboarding@resend.dev>", // dopo verifica dominio: noreply@tuttoevento.it
        to: normalizedEmail,
        subject: "Benvenuto su TuttoEvento",
        html: `
          <div style="font-family:sans-serif;color:#0a0a0b">
            <h2>Ciao ${createdUser.name},</h2>
            <p>La tua registrazione su <strong>TuttoEvento</strong> è completata.</p>
            <p>In allegato trovi i Termini e Condizioni che hai accettato al momento dell'iscrizione.</p>
            <p style="margin-top:24px">
              <a href="https://tuttoevento.it/login"
                 style="background:#ff5a00;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">
                 Accedi alla piattaforma
              </a>
            </p>
          </div>
        `,
        attachments: [
          { filename: pdfFileName, content: pdf },
        ],
      });
    } catch (mailError) {
      console.error("Errore invio email registrazione:", mailError);
    }

    return NextResponse.json({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      businessMode: createdUser.business_mode,
    });
  } catch (error) {
    console.error("Errore API register:", error);
    return NextResponse.json({ error: "Errore server registrazione" }, { status: 500 });
  }
}