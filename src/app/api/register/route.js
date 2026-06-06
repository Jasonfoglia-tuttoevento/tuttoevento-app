import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

function validatePassword(pw) {
  if (!pw || pw.length < 8)         return "Password di almeno 8 caratteri";
  if (!/[A-Z]/.test(pw))            return "Serve almeno una lettera maiuscola";
  if (!/[0-9]/.test(pw))            return "Serve almeno un numero";
  if (!/[^A-Za-z0-9]/.test(pw))     return "Serve almeno un carattere speciale (!@#$%...)";
  return null;
}

const TERMS_BY_ROLE = {
  organizer: "termini-locali.pdf",
  artist:    "termini-artisti.pdf",
  promoter:  "termini-promoter.pdf",
};

const ALLOWED_PUBLIC_ROLES = ["artist", "organizer", "promoter"];

const ROLE_LABELS = {
  artist:    "artista",
  organizer: "locale",
  promoter:  "promoter",
};

const WELCOME_HTML = (name, role, pdfFileName) => `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f6;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr>
          <td style="background:#0a0a0b;padding:32px 40px;text-align:center">
            <p style="margin:0;font-size:1.2rem;font-weight:900;letter-spacing:-.04em;color:white">
              TUTTO<span style="color:#ff5a00">EVENTO</span>
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px">
            <h1 style="margin:0 0 16px;font-size:1.6rem;font-weight:800;color:#0a0a0b;line-height:1.2">
              Benvenuto su TuttoEvento, ${name}!
            </h1>
            <p style="margin:0 0 12px;font-size:.95rem;color:#6b6b73;line-height:1.7">
              Il tuo account come <strong style="color:#0a0a0b">${ROLE_LABELS[role] || role}</strong> è stato creato con successo.
            </p>
            <p style="margin:0 0 28px;font-size:.95rem;color:#6b6b73;line-height:1.7">
              Completa il tuo profilo per iniziare a ricevere richieste e apparire nel marketplace.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
              <tr>
                <td style="background:#ff5a00;border-radius:100px;padding:14px 32px">
                  <a href="https://tuttoevento.it/dashboard"
                     style="color:white;font-weight:800;font-size:.95rem;text-decoration:none;white-space:nowrap">
                    Vai alla dashboard →
                  </a>
                </td>
              </tr>
            </table>

            <!-- Info box -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#fbfaf8;border:1px solid rgba(0,0,0,.07);border-radius:16px;padding:20px 22px">
                  <p style="margin:0 0 8px;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#6b6b73">In allegato</p>
                  <p style="margin:0;font-size:.875rem;color:#0a0a0b;line-height:1.6">
                    📄 I <strong>Termini e Condizioni</strong> che hai accettato al momento della registrazione.
                    Conservali per riferimento futuro.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fbfaf8;border-top:1px solid rgba(0,0,0,.06);padding:20px 40px;text-align:center">
            <p style="margin:0;font-size:.78rem;color:#6b6b73;line-height:1.6">
              © 2026 TuttoEvento · 
              <a href="https://tuttoevento.it/privacy" style="color:#6b6b73">Privacy Policy</a> · 
              <a href="https://tuttoevento.it/contatti" style="color:#6b6b73">Contatti</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json({ error: "Compila tutti i campi" }, { status: 400 });
    }
    if (!body.termsAccepted) {
      return NextResponse.json({ error: "Devi accettare i termini e condizioni" }, { status: 400 });
    }
    const pwError = validatePassword(body.password);
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

    const normalizedEmail = String(body.email).trim().toLowerCase();
    const safeRole        = ALLOWED_PUBLIC_ROLES.includes(body.role) ? body.role : "organizer";
    const pdfFileName     = TERMS_BY_ROLE[safeRole] || TERMS_BY_ROLE.organizer;

    // 1. Crea utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: body.password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message?.includes("already registered") || authError.code === "email_exists") {
        return NextResponse.json({ error: "Email già registrata" }, { status: 409 });
      }
      console.error("Errore Supabase Auth register:", authError);
      return NextResponse.json({ error: "Errore durante la registrazione" }, { status: 500 });
    }

    const authId = authData.user.id;

    // 2. Salva profilo nella tabella users
    const { data: createdUser, error: createUserError } = await supabaseAdmin
      .from("users")
      .insert({
        auth_id:           authId,
        name:              body.name,
        email:             normalizedEmail,
        role:              safeRole,
        business_mode:     body.businessMode || "both",
        terms_accepted:    true,
        terms_accepted_at: new Date().toISOString(),
        terms_doc:         pdfFileName,
        plan:              "free",
        referred_by:       body.referralCode || null,
      })
      .select("id, name, email, role, business_mode")
      .single();

    if (createUserError) {
      await supabaseAdmin.auth.admin.deleteUser(authId);
      console.error("Errore salvataggio profilo:", createUserError);
      return NextResponse.json({ error: "Errore durante la registrazione" }, { status: 500 });
    }

    // 3. Email di benvenuto con termini allegati
    try {
      const pdfPath = path.join(process.cwd(), "public", pdfFileName);
      const pdf     = fs.readFileSync(pdfPath);

      await resend.emails.send({
        from:        "TuttoEvento <onboarding@tuttoevento.it>",
        to:          normalizedEmail,
        subject:     `Benvenuto su TuttoEvento, ${createdUser.name}!`,
        html:        WELCOME_HTML(createdUser.name, safeRole, pdfFileName),
        attachments: [{ filename: pdfFileName, content: pdf }],
      });
    } catch (mailError) {
      // Non bloccare la registrazione se la mail fallisce
      console.error("Errore invio email:", mailError);
    }

    return NextResponse.json({
      id:           createdUser.id,
      name:         createdUser.name,
      email:        createdUser.email,
      role:         createdUser.role,
      businessMode: createdUser.business_mode,
    });

  } catch (error) {
    console.error("Errore API register:", error);
    return NextResponse.json({ error: "Errore server registrazione" }, { status: 500 });
  }
}