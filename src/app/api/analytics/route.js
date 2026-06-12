// src/app/api/analytics/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("userId") || user.id;

  try {
    const role = user.role;

    /* ── ARTISTA ── */
    if (role === "artist") {
      const { data: bookings } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("artist_id", Number(targetId))
        .order("event_date", { ascending: false });

      const safe = bookings || [];
      const confirmed = safe.filter(b => ["accepted","confirmed"].includes(b.status));
      const pending   = safe.filter(b => b.status === "pending");
      const cancelled = safe.filter(b => b.status === "cancelled");
      const revenue   = confirmed.reduce((s,b) => s + (Number(b.artist_cachet)||Number(b.cachet)||0), 0);

      // Booking per mese (ultimi 6)
      const byMonth = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        byMonth[key] = 0;
      }
      confirmed.forEach(b => {
        if (!b.event_date) return;
        const key = b.event_date.slice(0,7);
        if (key in byMonth) byMonth[key]++;
      });

      // Per tipo evento
      const byType = {};
      confirmed.forEach(b => {
        const t = b.event_type || b.event_title?.split(" ")[0] || "Altro";
        byType[t] = (byType[t]||0) + 1;
      });

      // Cachet medio
      const avgCachet = confirmed.length > 0
        ? Math.round(confirmed.reduce((s,b) => s+(Number(b.artist_cachet)||Number(b.cachet)||0), 0) / confirmed.length)
        : 0;

      return NextResponse.json({
        role: "artist",
        kpi: {
          total:     safe.length,
          confirmed: confirmed.length,
          pending:   pending.length,
          cancelled: cancelled.length,
          revenue,
          avgCachet,
        },
        byMonth: Object.entries(byMonth).map(([month, count]) => ({ month, count })),
        byType:  Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([type,count])=>({type,count})),
        recent:  safe.slice(0,5).map(b => ({
          id: b.id, artistName: b.artist_name, organizerName: b.organizer_name,
          eventDate: b.event_date, eventTitle: b.event_title,
          status: b.status, cachet: b.artist_cachet || b.cachet,
        })),
      });
    }

    /* ── LOCALE ── */
    if (role === "organizer") {
      const { data: bookings } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("organizer_id", Number(targetId))
        .order("event_date", { ascending: false });

      const safe = bookings || [];
      const confirmed = safe.filter(b => ["accepted","confirmed"].includes(b.status));
      const pending   = safe.filter(b => b.status === "pending");
      const spent     = confirmed.reduce((s,b) => s+(Number(b.public_price)||Number(b.cachet)||0), 0);

      const byMonth = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        byMonth[key] = 0;
      }
      confirmed.forEach(b => {
        if (!b.event_date) return;
        const key = b.event_date.slice(0,7);
        if (key in byMonth) byMonth[key]++;
      });

      // Artisti più prenotati
      const byArtist = {};
      confirmed.forEach(b => {
        const n = b.artist_name || "—";
        byArtist[n] = (byArtist[n]||0) + 1;
      });

      return NextResponse.json({
        role: "organizer",
        kpi: {
          total:     safe.length,
          confirmed: confirmed.length,
          pending:   pending.length,
          spent,
          avgSpent:  confirmed.length > 0 ? Math.round(spent / confirmed.length) : 0,
        },
        byMonth: Object.entries(byMonth).map(([month,count]) => ({ month, count })),
        byArtist: Object.entries(byArtist).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>({name,count})),
        recent: safe.slice(0,5).map(b => ({
          id: b.id, artistName: b.artist_name, eventDate: b.event_date,
          eventTitle: b.event_title, status: b.status,
          amount: b.public_price || b.cachet,
        })),
      });
    }

    /* ── PROMOTER ── */
    if (role === "promoter") {
      const { data: bookings } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("promoter_id", Number(targetId))
        .order("event_date", { ascending: false });

      const { data: roster } = await supabaseAdmin
        .from("users")
        .select("id, name, plan")
        .eq("referred_by", (await supabaseAdmin.from("users").select("referral_code").eq("id", Number(targetId)).maybeSingle())?.data?.referral_code || "");

      const safe = bookings || [];
      const confirmed = safe.filter(b => ["accepted","confirmed"].includes(b.status));
      const commission = confirmed.reduce((s,b) => {
        const price = Number(b.public_price) || Number(b.cachet) || 0;
        return s + Math.round(price * 0.225);
      }, 0);

      const byMonth = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        byMonth[key] = 0;
      }
      confirmed.forEach(b => {
        if (!b.event_date) return;
        const key = b.event_date.slice(0,7);
        if (key in byMonth) byMonth[key]++;
      });

      return NextResponse.json({
        role: "promoter",
        kpi: {
          total:      safe.length,
          confirmed:  confirmed.length,
          commission,
          rosterSize: (roster||[]).length,
        },
        byMonth: Object.entries(byMonth).map(([month,count]) => ({ month, count })),
        recent: safe.slice(0,5).map(b => ({
          id: b.id, artistName: b.artist_name, eventDate: b.event_date,
          status: b.status, commission: Math.round((Number(b.public_price)||Number(b.cachet)||0)*0.225),
        })),
      });
    }

    /* ── ADMIN ── */
    if (role === "admin" || role === "referent") {
      const [
        { count: totalUsers },
        { count: totalArtists },
        { count: totalOrganizers },
        { count: totalPromoters },
        { data: allBookings },
      ] = await Promise.all([
        supabaseAdmin.from("users").select("id", { count:"exact", head:true }),
        supabaseAdmin.from("users").select("id", { count:"exact", head:true }).eq("role","artist"),
        supabaseAdmin.from("users").select("id", { count:"exact", head:true }).eq("role","organizer"),
        supabaseAdmin.from("users").select("id", { count:"exact", head:true }).eq("role","promoter"),
        supabaseAdmin.from("bookings").select("*").order("event_date", { ascending:false }),
      ]);

      const safe = allBookings || [];
      const confirmed = safe.filter(b => ["accepted","confirmed"].includes(b.status));
      const gmv = confirmed.reduce((s,b) => s+(Number(b.public_price)||Number(b.cachet)||0), 0);
      const platform_revenue = Math.round(gmv * 0.1); // 10% fee stimata

      // Registrazioni per mese
      const { data: usersWithDate } = await supabaseAdmin
        .from("users")
        .select("created_at, role")
        .order("created_at", { ascending: false })
        .limit(200);

      const regByMonth = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        regByMonth[key] = 0;
      }
      (usersWithDate||[]).forEach(u => {
        if (!u.created_at) return;
        const key = u.created_at.slice(0,7);
        if (key in regByMonth) regByMonth[key]++;
      });

      const bookingByMonth = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        bookingByMonth[key] = 0;
      }
      confirmed.forEach(b => {
        if (!b.event_date) return;
        const key = b.event_date.slice(0,7);
        if (key in bookingByMonth) bookingByMonth[key]++;
      });

      return NextResponse.json({
        role: "admin",
        kpi: {
          totalUsers:        totalUsers || 0,
          totalArtists:      totalArtists || 0,
          totalOrganizers:   totalOrganizers || 0,
          totalPromoters:    totalPromoters || 0,
          totalBookings:     safe.length,
          confirmedBookings: confirmed.length,
          gmv,
          platform_revenue,
        },
        regByMonth:     Object.entries(regByMonth).map(([month,count]) => ({ month, count })),
        bookingByMonth: Object.entries(bookingByMonth).map(([month,count]) => ({ month, count })),
        recent: safe.slice(0,8).map(b => ({
          id: b.id, artistName: b.artist_name, organizerName: b.organizer_name,
          eventDate: b.event_date, status: b.status,
          amount: b.public_price || b.cachet,
        })),
      });
    }

    return forbidden();
  } catch (e) {
    console.error("analytics:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}