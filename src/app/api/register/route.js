import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

const TERMS_BY_ROLE = {
  organizer: "termini-locali.pdf",
  artist: "termini-artisti.pdf",
  promoter: "termini-promoter.pdf",
};

const ALLOWED_PUBLIC_ROLES = ["artist", "organizer", "promoter"];

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json({ error: "Compila tutti i campi" }, { status: 400 });
    }
    if (!body.termsAccepted) {
      return NextResponse.json({ error: "Devi accettare i termini e condizioni" }, { status: 400 });
    }
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password di almeno 8 caratteri" }, { status: 400 });
    }

    const normalizedEmail = String(body.email).trim().toLowerCase();
    const safeRole = ALLOWED_PUBLIC_ROLES.includes(body.role) ? body.role : "organizer";
    const pdfFileName = TERMS_BY_ROLE[safeRole] || TERMS_BY_ROLE.organizer;

    // 1. Crea utente in Supabase Auth (gestisce hashing bcrypt internamente)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: body.password, // Supabase usa bcrypt, non SHA-256
      email_confirm: true,     // confermato subito, gestiamo noi la welcome email
    });

    if (authError) {
      if (authError.message?.includes("already registered") || authError.code === "email_exists") {
        return NextResponse.json({ error: "Email già registrata" }, { status: 409 });
      }
      console.error("Errore Supabase Auth register:", authError);
      return NextResponse.json({ error: "Errore durante la registrazione" }, { status: 500 });
    }

    const authId = authData.user.id;

    // 2. Salva i dati aggiuntivi nella tabella users collegata tramite auth_id
    const { data: createdUser, error: createUserError } = await supabaseAdmin
      .from("users")
      .insert({
        auth_id: authId,
        name: body.name,
        email: normalizedEmail,
        role: safeRole,
        business_mode: body.businessMode || "both",
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        terms_doc: pdfFileName,
      })
      .select("id, name, email, role, business_mode")
      .single();

    if (createUserError) {
      // Rollback: elimina l'utente Auth appena creato se il salvataggio profilo fallisce
      await supabaseAdmin.auth.admin.deleteUser(authId);
      console.error("Errore salvataggio profilo:", createUserError);
      return NextResponse.json({ error: "Errore durante la registrazione" }, { status: 500 });
    }

    // 3. Email di benvenuto con termini allegati
    try {
      const pdfPath = path.join(process.cwd(), "public", pdfFileName);
      const pdf = fs.readFileSync(pdfPath);
      await resend.emails.send({
        from: "TuttoEvento <onboarding@resend.dev>",
        to: normalizedEmail,
        subject: "Benvenuto su TuttoEvento",
        html: `
          <div style="font-family:sans-serif;color:#0a0a0b">
            <h2>Ciao ${createdUser.name},</h2>
            <p>La tua registrazione su <strong>TuttoEvento</strong> è completata.</p>
            <p>In allegato trovi i Termini e Condizioni che hai accettato.</p>
            <p style="margin-top:24px">
              <a href="https://tuttoevento.it/login"
                 style="background:#ff5a00;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">
                 Accedi alla piattaforma
              </a>
            </p>
          </div>
        `,
        attachments: [{ filename: pdfFileName, content: pdf }],
      });
    } catch (mailError) {
      console.error("Errore invio email:", mailError);
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