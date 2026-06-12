// src/app/api/admin/user-plan/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin" && user.role !== "referent") return forbidden();

  const body = await request.json();
  const { userId, plan, verified, approvalStatus } = body;
  if (!userId) return NextResponse.json({ error: "userId obbligatorio" }, { status: 400 });

  try {
    // Aggiorna users
    const userUpdates = {};
    if (plan     !== undefined) userUpdates.plan     = plan;
    if (verified !== undefined) userUpdates.verified = verified;

    if (Object.keys(userUpdates).length > 0) {
      await supabaseAdmin.from("users").update(userUpdates).eq("id", Number(userId));
    }

    // Aggiorna artist_profiles se serve approval_status
    if (approvalStatus !== undefined) {
      await supabaseAdmin
        .from("artist_profiles")
        .update({ approval_status: approvalStatus, updated_at: new Date().toISOString() })
        .eq("user_id", Number(userId));

      // Se approvato, segna anche verified su users
      if (approvalStatus === "approved") {
        await supabaseAdmin
          .from("users")
          .update({ verified: true })
          .eq("id", Number(userId));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}