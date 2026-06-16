import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized } from "@/lib/auth";

const BUCKET = "tracks"; // crea questo bucket su Supabase Storage (public)
const MAX_MB = 60;

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "artist") {
    return NextResponse.json({ error: "Solo gli artisti possono caricare tracce" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { path, contentType } = body;

    if (!path || !contentType) {
      return NextResponse.json({ error: "path e contentType obbligatori" }, { status: 400 });
    }

    // Verifica che il path appartenga all'artista corrente
    if (!path.startsWith(`scalette/${user.id}/`)) {
      return NextResponse.json({ error: "Path non autorizzato" }, { status: 403 });
    }

    // Verifica tipo file
    const allowed = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/flac", "audio/aac", "audio/ogg", "audio/x-wav", "audio/x-flac"];
    if (!allowed.includes(contentType)) {
      return NextResponse.json({ error: "Tipo file non supportato" }, { status: 400 });
    }

    // Genera URL di upload firmato (60 secondi di validità)
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error) {
      console.error("Errore generazione upload URL traccia:", error);
      return NextResponse.json({ error: "Errore generazione URL di upload" }, { status: 500 });
    }

    // URL pubblico della traccia dopo l'upload
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      publicUrl,
      path,
    });
  } catch (e) {
    console.error("Errore upload-track:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}