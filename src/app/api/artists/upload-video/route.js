// src/app/api/artist/upload-video/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

const MAX_FREE    = 2;
const MAX_SIZE_MB = 200;

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "artist") return forbidden();

  const { data, error } = await supabaseAdmin
    .from("artist_videos")
    .select("*")
    .eq("artist_id", Number(user.id))
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "artist") return forbidden();

  try {
    const formData = await request.formData();
    const file     = formData.get("file");
    const title    = formData.get("title") || "Video dimostrativo";

    if (!file) return NextResponse.json({ error: "Nessun file ricevuto" }, { status: 400 });
    if (file.type !== "video/mp4") {
      return NextResponse.json({ error: "Solo file MP4 sono supportati." }, { status: 400 });
    }

    const maxBytes = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `File troppo grande. Massimo ${MAX_SIZE_MB}MB.` }, { status: 400 });
    }

    // Controlla limite piano Free
    const isPro = user.plan === "pro";
    if (!isPro) {
      const { count } = await supabaseAdmin
        .from("artist_videos")
        .select("id", { count: "exact", head: true })
        .eq("artist_id", Number(user.id));

      if (count >= MAX_FREE) {
        return NextResponse.json({
          error: `Piano Free: massimo ${MAX_FREE} video. Passa a Pro per video illimitati.`,
          limitReached: true,
        }, { status: 403 });
      }
    }

    const filename = `${user.id}/${Date.now()}.mp4`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("artist-videos")
      .upload(filename, buffer, { contentType: "video/mp4", upsert: false });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: urlData } = supabaseAdmin.storage
      .from("artist-videos")
      .getPublicUrl(filename);

    // Salva in tabella artist_videos
    const { data: video, error: dbError } = await supabaseAdmin
      .from("artist_videos")
      .insert({
        artist_id:  Number(user.id),
        title,
        url:        urlData.publicUrl,
        filename,
        size_bytes: file.size,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
    return NextResponse.json(video);
  } catch (e) {
    console.error("Upload video:", e);
    return NextResponse.json({ error: e.message || "Errore upload" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "artist") return forbidden();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });

  const { data: video } = await supabaseAdmin
    .from("artist_videos")
    .select("*")
    .eq("id", Number(id))
    .eq("artist_id", Number(user.id))
    .maybeSingle();

  if (!video) return NextResponse.json({ error: "Video non trovato" }, { status: 404 });

  // Elimina da Storage
  await supabaseAdmin.storage.from("artist-videos").remove([video.filename]);

  // Elimina dal DB
  await supabaseAdmin.from("artist_videos").delete().eq("id", Number(id));

  return NextResponse.json({ ok: true });
}