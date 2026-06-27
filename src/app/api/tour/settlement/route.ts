import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
  const { tourId, dateId, userId, venueName, city, date, grossIncome, venueExpenses, merchIncome, crewTips, otherExpenses, netIncome, notes } = body;

  if (!tourId || !userId || !venueName || !date) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("settlement_sheets")
    .insert({
      tour_id: tourId,
      date_id: dateId || null,
      user_id: userId,
      venue_name: venueName,
      city: city || null,
      date,
      gross_income: grossIncome,
      venue_expenses: venueExpenses,
      merch_income: merchIncome,
      crew_tips: crewTips,
      other_expenses: otherExpenses,
      net_income: netIncome,
      notes: notes || null,
      promoter_signed: false,
      tm_signed: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggiorna budget actual del tour
  await supabase.rpc("update_tour_budget_actual", { tour_id: tourId });

  return NextResponse.json(data);
}