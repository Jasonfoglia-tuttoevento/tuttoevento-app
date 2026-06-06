// src/app/api/account/password/route.js
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

function validatePassword(pw) {
  if (!pw || pw.length < 8)          return "Password di almeno 8 caratteri";
  if (!/[A-Z]/.test(pw))             return "Serve almeno una lettera maiuscola";
  if (!/[0-9]/.test(pw))             return "Serve almeno un numero";
  if (!/[^A-Za-z0-9]/.test(pw))      return "Serve almeno un carattere speciale (!@#$%...)";
  return null;
}

export async function PATCH(req) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  // Valida la nuova password
  const validationError = validatePassword(newPassword);
  if (validationError) return Response.json({ error: validationError }, { status: 400 });

  // Verifica la password attuale tramite sign-in
  const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) return Response.json({ error: "Password attuale non corretta" }, { status: 400 });

  // Aggiorna la password
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.auth_id || user.id,
    { password: newPassword }
  );
  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

  return Response.json({ ok: true });
}