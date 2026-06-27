import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tourId = searchParams.get("tourId");

  if (!tourId) {
    return NextResponse.json({ error: "Missing tourId" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data, error } = await supabase
    .from("tour_budget_items")
    .select("*")
    .eq("tour_id", tourId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const body = await request.json();
  const { tourId, userId, category, description, plannedAmount, actualAmount, date } = body;

  if (!tourId || !userId || !description) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tour_budget_items")
    .insert({
      tour_id: tourId,
      user_id: Number(userId),
      category,
      description,
      planned_amount: plannedAmount || 0,
      actual_amount: actualAmount || 0,
      date: date || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggiorna budget_actual del tour
  const { data: allItems } = await supabase
    .from("tour_budget_items")
    .select("actual_amount")
    .eq("tour_id", tourId);

  const totalActual = (allItems || []).reduce((sum, i) => sum + (i.actual_amount || 0), 0);

  await supabase
    .from("tours")
    .update({ budget_actual: totalActual })
    .eq("id", tourId);

  return NextResponse.json(data);
}