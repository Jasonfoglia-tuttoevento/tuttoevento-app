import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

function validatePassword(pw) {
  if (!pw || pw.length < 8)       return "Password di almeno 8 caratteri";
  if (!/[A-Z]/.test(pw))          return "Serve almeno una lettera maiuscola";
  if (!/[0-9]/.test(pw))          return "Serve almeno un numero";
  if (!/[^A-Za-z0-9]/.test(pw))   return "Serve almeno un carattere speciale";
  return null;
}

const TERMS_BY_ROLE = {
  organizer: "termini-locali.pdf",
  artist:    "termini-artisti.pdf",
  promoter:  "termini-promoter.pdf",
};
const ALLOWED_ROLES = ["artist","organizer","promoter"];
const ROLE_LABELS   = { artist:"artista", organizer:"locale", promoter:"promoter" };

function generateSlug(name, userId) {
  const base = (name||"artista")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g,"")
    .replace(/\s+/g,"-")
    .slice(0,40);
  return `${base}-${userId}`;
}

const WELCOME_HTML = (name, role, pdfFileName) => `
<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
<tr><td style="background:#0a0a0b;padding:32px 40px;text-align:center">
  <p style="margin:0;font-size:1.2rem;font-weight:900;letter-spacing:-.04em;color:white">TUTTO<span style="color:#ff5a00">EVENTO</span></p>
</td></tr>
<tr><td style="padding:40px 40px 32px">
  <h1 style="margin:0 0 16px;font-size:1.6rem;font-weight:800;color:#0a0a0b">Benvenuto su TuttoEvento, ${name}!</h1>
  <p style="margin:0 0 12px;font-size:.95rem;color:#6b6b73;line-height:1.7">
    Il tuo account come <strong style="color:#0a0a0b">${ROLE_LABELS[role]||role}</strong> è stato creato.
  </p>
  <p style="margin:0 0 28px;font-size:.95rem;color:#6b6b73;line-height:1.7">
    Completa il profilo per iniziare a ricevere richieste e apparire nel marketplace.
  </p>
  <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
    <tr><td style="background:#ff5a00;border-radius:100px;padding:14px 32px">
      <a href="https://tuttoevento.it/dashboard" style="color:white;font-weight:800;font-size:.95rem;text-decoration:none">Vai alla dashboard →</a>
    </td></tr>
  </table>
  <table width="100%"><tr><td style="background:#fbfaf8;border:1px solid rgba(0,0,0,.07);border-radius:16px;padding:20px 22px">
    <p style="margin:0 0 8px;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#6b6b73">In allegato</p>
    <p style="margin:0;font-size:.875rem;color:#0a0a0b;line-height:1.6">📄 I <strong>Termini e Condizioni</strong> che hai accettato alla registrazione.</p>
  </td></tr></table>
</td></tr>
<tr><td style="background:#fbfaf8;border-top:1px solid rgba(0,0,0,.06);padding:20px 40px;text-align:center">
  <p style="margin:0;font-size:.78rem;color:#6b6b73">© 2026 TuttoEvento · <a href="https://tuttoevento.it/privacy" style="color:#6b6b73">Privacy</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`;

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.password || !body.role)
      return NextResponse.json({ error:"Compila tutti i campi" }, { status:400 });
    if (!body.termsAccepted)
      return NextResponse.json({ error:"Devi accettare i termini e condizioni" }, { status:400 });

    const pwError = validatePassword(body.password);
    if (pwError) return NextResponse.json({ error:pwError }, { status:400 });

    const normalizedEmail = String(body.email).trim().toLowerCase();
    const safeRole        = ALLOWED_ROLES.includes(body.role) ? body.role : "organizer";
    const pdfFileName     = TERMS_BY_ROLE[safeRole];

    // ── 1. Crea in Supabase Auth CON verifica email ──────────────
    // email_confirm: false → Supabase invia email di conferma
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email:         normalizedEmail,
      password:      body.password,
      email_confirm: false, // ← verifica email attiva
    });

    if (authError) {
      if (authError.message?.includes("already registered") || authError.code === "email_exists")
        return NextResponse.json({ error:"Email già registrata" }, { status:409 });
      return NextResponse.json({ error:"Errore durante la registrazione" }, { status:500 });
    }

    const authId = authData.user.id;

    // ── 2. Salva profilo in tabella users ────────────────────────
    const { data: createdUser, error: createError } = await supabaseAdmin
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

    if (createError) {
      await supabaseAdmin.auth.admin.deleteUser(authId);
      console.error("Errore salvataggio profilo:", createError);
      return NextResponse.json({ error:"Errore durante la registrazione" }, { status:500 });
    }

    // ── 3. Crea artist_profile con slug e approval_status ────────
    if (safeRole === "artist") {
      const slug = generateSlug(body.name, createdUser.id);
      await supabaseAdmin.from("artist_profiles").upsert({
        user_id:        createdUser.id,
        stage_name:     body.name,
        approval_status:"pending",
        slug,
        updated_at:     new Date().toISOString(),
      }, { onConflict:"user_id" });
    }

    // ── 3b. Se è un promoter registrato col referral di un altro promoter,
    //        agganciarlo come sub-promoter del network ─────────────
    if (safeRole === "promoter" && body.referralCode) {
      const { data: parentPromoter } = await supabaseAdmin
        .from("users")
        .select("id, role")
        .eq("referral_code", body.referralCode.toUpperCase())
        .eq("role", "promoter")
        .maybeSingle();

      if (parentPromoter && parentPromoter.id !== createdUser.id) {
        // Imposta il parent sul nuovo promoter
        await supabaseAdmin
          .from("users")
          .update({ promoter_parent_id: parentPromoter.id })
          .eq("id", createdUser.id);

        // Crea/attiva il record nel network del parent
        await supabaseAdmin
          .from("promoter_sub_network")
          .upsert({
            parent_id:      parentPromoter.id,
            sub_id:         createdUser.id,
            email:          normalizedEmail,
            commission_pct: 50,
            status:         "active",
            accepted_at:    new Date().toISOString(),
          }, { onConflict: "parent_id,email" });
      }
    }

    // ── 4. Email di benvenuto con PDF termini ────────────────────
    try {
      const pdfPath = path.join(process.cwd(), "public", pdfFileName);
      const pdf     = fs.readFileSync(pdfPath);
      await resend.emails.send({
        from:        "TuttoEvento <onboarding@tuttoevento.it>",
        to:          normalizedEmail,
        subject:     `Benvenuto su TuttoEvento, ${createdUser.name}!`,
        html:        WELCOME_HTML(createdUser.name, safeRole, pdfFileName),
        attachments: [{ filename:pdfFileName, content:pdf }],
      });
    } catch (mailErr) {
      console.error("Errore invio email:", mailErr);
    }

    return NextResponse.json({
      id:           createdUser.id,
      name:         createdUser.name,
      email:        createdUser.email,
      role:         createdUser.role,
      businessMode: createdUser.business_mode,
      // Segnala al frontend che serve conferma email
      emailVerificationRequired: true,
    });

  } catch (e) {
    console.error("Errore API register:", e);
    return NextResponse.json({ error:"Errore server" }, { status:500 });
  }
}