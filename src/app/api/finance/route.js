import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const { data, error } = await supabaseAdmin
      .from("company_finance")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Errore lettura dati finanziari" }, { status: 500 });
    return NextResponse.json(data || {});
  } catch (e) {
    console.error("Errore API finance GET:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const body = await request.json();

    const { data: existing } = await supabaseAdmin
      .from("company_finance")
      .select("id")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    const payload = {
      fixed_costs_monthly: Number(body.fixedCostsMonthly) || 0,
      variable_costs: Number(body.variableCosts) || 0,
      depreciation: Number(body.depreciation) || 0,
      interest: Number(body.interest) || 0,
      taxes: Number(body.taxes) || 0,
      invested_capital: Number(body.investedCapital) || 0,
      commission_rate: Number(body.commissionRate) || 0.08,
      notes: body.notes || "",
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing?.id) {
      result = await supabaseAdmin.from("company_finance").update(payload).eq("id", existing.id).select("*").single();
    } else {
      result = await supabaseAdmin.from("company_finance").insert(payload).select("*").single();
    }

    if (result.error) return NextResponse.json({ error: "Errore salvataggio" }, { status: 500 });
    return NextResponse.json(result.data);
  } catch (e) {
    console.error("Errore API finance POST:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}