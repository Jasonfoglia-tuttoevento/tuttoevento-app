import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", Number(user.id))
    .single();

  if (userData?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("tour_managers")
    .select(`
      id,
      user_id,
      display_name,
      assigned_artists,
      is_active,
      created_at,
      users!inner(name, email, role)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tmsWithStats = await Promise.all(
    (data || []).map(async (tm) => {
      const { data: tours } = await supabase
        .from("tours")
        .select("budget_planned, budget_actual, status")
        .eq("artist_id", tm.user_id);

      const totalBudget = (tours || []).reduce((sum, t) => sum + (t.budget_planned || 0), 0);
      const totalSpent = (tours || []).reduce((sum, t) => sum + (t.budget_actual || 0), 0);
      const activeTours = (tours || []).filter((t) => t.status === "active").length;

      return { ...tm, totalBudget, totalSpent, activeTours };
    })
  );

  return NextResponse.json(tmsWithStats);
}