import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUser(req) {
  const cookieStore = cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) return null;
  const { data } = await supabaseAdmin.auth.getUser(token);
  if (!data?.user) return null;
  const { data: u } = await supabaseAdmin.from("users").select("*").eq("auth_id", data.user.id).single();
  return u;
}

// GET /api/promoter-network/subs — lista sub-promoter con KPI
export async function GET(req) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { data: subs } = await supabaseAdmin
    .from("promoter_sub_network")
    .select("*")
    .eq("parent_id", user.id)
    .neq("status", "removed")
    .order("created_at", { ascending: false });

  if (!subs?.length) return NextResponse.json([]);

  // Arricchisci con dati utente e KPI booking
  const subIds = subs.map(s => s.sub_id).filter(Boolean);
  const { data: subUsers } = subIds.length
    ? await supabaseAdmin.from("users").select("id,name,email").in("id", subIds)
    : { data: [] };
  const usersMap = Object.fromEntries((subUsers||[]).map(u => [u.id, u]));

  // Booking generati dai sub
  const { data: commissions } = subIds.length
    ? await supabaseAdmin.from("booking_commissions")
        .select("user_id, amount")
        .in("user_id", subIds)
        .eq("commission_type", "sub_promoter")
    : { data: [] };

  const bookingMap = {};
  const earnedMap  = {};
  (commissions||[]).forEach(c => {
    bookingMap[c.user_id] = (bookingMap[c.user_id]||0) + 1;
    earnedMap[c.user_id]  = (earnedMap[c.user_id]||0) + Number(c.amount||0);
  });

  const result = subs.map(s => ({
    ...s,
    name:         usersMap[s.sub_id]?.name || null,
    email:        s.email,
    bookingCount: bookingMap[s.sub_id] || 0,
    totalEarned:  earnedMap[s.sub_id]  || 0,
  }));

  return NextResponse.json(result);
}

// POST /api/promoter-network/subs — invita sub-promoter
export async function POST(req) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const { email, commission_pct } = await req.json();
  if (!email) return NextResponse.json({ error: "Email richiesta" }, { status: 400 });

  // Controlla se già nel network
  const { data: existing } = await supabaseAdmin
    .from("promoter_sub_network")
    .select("id")
    .eq("parent_id", user.id)
    .eq("email", email.toLowerCase())
    .neq("status", "removed")
    .single();

  if (existing) return NextResponse.json({ error: "Già nel tuo network" }, { status: 409 });

  // Cerca se ha già un account
  const { data: subUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  const { data: entry, error } = await supabaseAdmin
    .from("promoter_sub_network")
    .insert({
      parent_id:      user.id,
      sub_id:         subUser?.id || null,
      email:          email.toLowerCase(),
      commission_pct: commission_pct || 10,
      status:         subUser ? "active" : "pending",
      accepted_at:    subUser ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // TODO: invia email invito se subUser è null (Resend)

  return NextResponse.json(entry, { status: 201 });
}

// PATCH /api/promoter-network/subs — aggiorna commissione
export async function PATCH(req) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { id, commission_pct } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("promoter_sub_network")
    .update({ commission_pct })
    .eq("id", id)
    .eq("parent_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/promoter-network/subs?id=X — rimuove sub
export async function DELETE(req) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await supabaseAdmin
    .from("promoter_sub_network")
    .update({ status: "removed" })
    .eq("id", id)
    .eq("parent_id", user.id);

  return NextResponse.json({ ok: true });
}