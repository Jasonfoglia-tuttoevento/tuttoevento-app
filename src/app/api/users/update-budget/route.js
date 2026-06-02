import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "organizer") return forbidden();

  try {
    const body = await request.json();
    const budget = body.eventBudget !== null && body.eventBudget !== undefined
      ? Number(body.eventBudget) : null;

    const { error } = await supabaseAdmin
      .from("users")
      .update({ event_budget: budget })
      .eq("id", Number(user.id));

    if (error) {
      console.error("Errore update budget:", error);
      return NextResponse.json({ error: "Errore salvataggio budget" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, eventBudget: budget });
  } catch (e) {
    console.error("Errore API update-budget:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}