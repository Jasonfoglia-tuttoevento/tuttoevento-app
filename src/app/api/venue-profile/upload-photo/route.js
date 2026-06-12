// src/app/api/venue-profile/upload-photo/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "organizer" && user.role !== "admin") return forbidden();

  try {
    const formData = await request.formData();
    const file     = formData.get("file");
    if (!file) return NextResponse.json({ error: "Nessun file" }, { status: 400 });

    const allowed = ["image/jpeg","image/jpg","image/png","image/webp","application/pdf"];
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: "Formato non supportato. Usa JPG, PNG, WebP o PDF." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: "File troppo grande. Max 10MB." }, { status: 400 });

    const ext      = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
    const filename = `venues/${user.id}/${Date.now()}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    // Usa lo stesso bucket artist-photos (è già pubblico)
    const { error: uploadError } = await supabaseAdmin.storage
      .from("artist-photos")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: urlData } = supabaseAdmin.storage
      .from("artist-photos")
      .getPublicUrl(filename);

    // Aggiorna venue_profiles
    await supabaseAdmin
      .from("venue_profiles")
      .upsert({ user_id: Number(user.id), photo: urlData.publicUrl, updated_at: new Date().toISOString() },
        { onConflict: "user_id" });

    // Aggiorna anche users
    await supabaseAdmin
      .from("users")
      .update({ photo: urlData.publicUrl })
      .eq("id", Number(user.id));

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    console.error("venue upload-photo:", e);
    return NextResponse.json({ error: e.message || "Errore upload" }, { status: 500 });
  }
}