import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET: legge la riga finanziaria (sempre id minore = la prima)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("company_finance")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Errore GET finance:", error);
      return NextResponse.json({ error: "Errore lettura dati finanziari" }, { status: 500 });
    }
    return NextResponse.json(data || {});
  } catch (e) {
    console.error("Errore API finance GET:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

// POST: aggiorna la riga finanziaria
export async function POST(request) {
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
      result = await supabaseAdmin
        .from("company_finance")
        .update(payload)
        .eq("id", existing.id)
        .select("*")
        .single();
    } else {
      result = await supabaseAdmin
        .from("company_finance")
        .insert(payload)
        .select("*")
        .single();
    }

    if (result.error) {
      console.error("Errore POST finance:", result.error);
      return NextResponse.json({ error: "Errore salvataggio" }, { status: 500 });
    }
    return NextResponse.json(result.data);
  } catch (e) {
    console.error("Errore API finance POST:", e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}