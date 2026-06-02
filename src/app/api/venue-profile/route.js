import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "organizer" && user.role !== "admin") return forbidden();

  try {
    const { data, error } = await supabaseAdmin
      .from("venue_profiles")
      .select("*")
      .eq("user_id", Number(user.id))
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Errore lettura profilo locale" }, { status: 500 });
    return NextResponse.json(data || {});
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "organizer" && user.role !== "admin") return forbidden();

  try {
    const body = await request.json();
    const payload = {
      user_id: Number(user.id),
      venue_name: body.venueName || "",
      city: body.city || "",
      venue_type: body.venueType || "",
      capacity: body.capacity ? Number(body.capacity) : null,
      description: body.description || "",
      instagram: body.instagram || "",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("venue_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*").single();

    if (error) {
      console.error("Errore salvataggio venue_profile:", error);
      return NextResponse.json({ error: "Errore salvataggio profilo locale" }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}