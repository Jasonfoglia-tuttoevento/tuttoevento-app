// src/app/api/artist/upload-photo/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "artist") return forbidden();

  try {
    const formData = await request.formData();
    const file     = formData.get("file");

    if (!file) return NextResponse.json({ error: "Nessun file ricevuto" }, { status: 400 });

    const allowed = ["image/jpeg","image/jpg","image/png","image/webp","application/pdf"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Formato non supportato. Usa JPG, PNG, WebP o PDF." }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File troppo grande. Massimo 10MB." }, { status: 400 });
    }

    const ext      = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
    const filename = `${user.id}/${Date.now()}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabaseAdmin.storage
      .from("artist-photos")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: urlData } = supabaseAdmin.storage
      .from("artist-photos")
      .getPublicUrl(filename);

    // Aggiorna photo nel profilo artista
    await supabaseAdmin
      .from("artist_profiles")
      .upsert({ user_id: Number(user.id), photo: urlData.publicUrl, updated_at: new Date().toISOString() },
        { onConflict: "user_id" });

    // Aggiorna anche nella tabella users
    await supabaseAdmin
      .from("users")
      .update({ photo: urlData.publicUrl })
      .eq("id", Number(user.id));

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    console.error("Upload photo:", e);
    return NextResponse.json({ error: e.message || "Errore upload" }, { status: 500 });
  }
}