// src/app/api/admin/media/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin" && user.role !== "referent") return forbidden();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "photo" | "video"

  try {
    if (type === "photo") {
      const { data, error } = await supabaseAdmin
        .from("artist_profiles")
        .select("id, user_id, stage_name, photo, photo_pending, photo_status")
        .eq("photo_status", "pending")
        .not("photo_pending", "is", null);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || []);
    }

    if (type === "video") {
      const { data, error } = await supabaseAdmin
        .from("artist_videos")
        .select(`id, artist_id, title, url, size_bytes, created_at,
                 users!inner(name)`)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json((data||[]).map(v => ({
        ...v, artist_name: v.users?.name || ""
      })));
    }

    return NextResponse.json({ error: "type obbligatorio (photo|video)" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin" && user.role !== "referent") return forbidden();

  const body = await request.json();
  const { type, id, action } = body; // action: "approve" | "reject"
  const now = new Date().toISOString();

  try {
    if (type === "photo") {
      if (action === "approve") {
        // Promuovi photo_pending → photo e segna come approvata
        const { data: profile } = await supabaseAdmin
          .from("artist_profiles")
          .select("photo_pending")
          .eq("id", Number(id))
          .maybeSingle();

        await supabaseAdmin
          .from("artist_profiles")
          .update({
            photo:        profile?.photo_pending || null,
            photo_status: "approved",
            photo_pending: null,
            updated_at:   now,
          })
          .eq("id", Number(id));
      } else {
        await supabaseAdmin
          .from("artist_profiles")
          .update({ photo_status: "rejected", photo_pending: null, updated_at: now })
          .eq("id", Number(id));
      }
    }

    if (type === "video") {
      await supabaseAdmin
        .from("artist_videos")
        .update({
          status:       action === "approve" ? "approved" : "rejected",
          moderated_at: now,
          moderated_by: Number(user.id),
        })
        .eq("id", Number(id));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}