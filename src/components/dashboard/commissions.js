/* ============================================================
   TuttoEvento — utility commissioni e formati

   MODELLO ECONOMICO:
   - public_price = prezzo pagato dal locale
   - artist_cachet = cachet netto artista (sempre protetto)
   - te_margin = public_price - artist_cachet  ← margine TE
   
   Se booking ha promoter:
     promoter_share = te_margin * 0.50  (50% al promoter)
     te_net         = te_margin * 0.50  (50% resta a TE)
   Se booking NON ha promoter:
     te_net         = te_margin         (100% a TE)

   IMPORTANTE: il volume = public_price (non il cachet)
   La commissione TE = te_margin (differenza prezzo/cachet)
   ============================================================ */

export const TE_MARGIN_PCT  = 0.45; // markup medio TE sul cachet (stimato)
export const PROMOTER_SHARE = 0.50; // quota promoter sul margine TE

// ── Parsing ──────────────────────────────────────────────────
export function parseCachet(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function cachetOf(booking) {
  // Tenta di leggere il prezzo pubblico (quello pagato dal locale)
  const pub = parseCachet(
    booking?.publicPrice ?? booking?.public_price ?? 
    booking?.cachet ?? booking?.artistCachet ?? 0
  );
  return pub;
}

export function artistCachetOf(booking) {
  return parseCachet(
    booking?.artistCachet ?? booking?.artist_cachet ?? 
    booking?.cachet ?? 0
  );
}

// Margine TE = prezzo pubblico - cachet artista
export function teMarginOf(booking) {
  const pub    = cachetOf(booking);
  const artist = artistCachetOf(booking);
  // Se abbiamo entrambi usa la differenza, altrimenti stima 45%
  if (pub > 0 && artist > 0 && pub > artist) return pub - artist;
  return pub * TE_MARGIN_PCT;
}

// Commissione TE netta (dopo quota promoter se presente)
export function commissionOf(booking) {
  const margin = teMarginOf(booking);
  if (booking?.promoter_id || booking?.promoterId) {
    return margin * (1 - PROMOTER_SHARE); // 50% resta a TE
  }
  return margin; // 100% a TE se no promoter
}

// Quota promoter
export function promoterShareOf(booking) {
  const margin = teMarginOf(booking);
  if (booking?.promoter_id || booking?.promoterId) {
    return margin * PROMOTER_SHARE;
  }
  return 0;
}

export function isConfirmed(booking) {
  const s = String(booking?.status || "").toLowerCase();
  return s === "confirmed" || s === "confermato" || s === "accepted" || s === "accettato" || s === "paid";
}

export function formatEuro(n) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

// Aggrega booking
export function aggregate(bookings = []) {
  const confirmed = bookings.filter(isConfirmed);
  const volume        = confirmed.reduce((s, b) => s + cachetOf(b), 0);
  const teMargin      = confirmed.reduce((s, b) => s + teMarginOf(b), 0);
  const teNet         = confirmed.reduce((s, b) => s + commissionOf(b), 0);
  const promoterTotal = confirmed.reduce((s, b) => s + promoterShareOf(b), 0);
  return {
    count: bookings.length,
    confirmedCount: confirmed.length,
    volume,          // volume totale (prezzi pubblici)
    commission: teNet,   // commissione netta TE
    teMargin,        // margine lordo TE
    promoterTotal,   // totale ceduto ai promoter
    netToArtists: confirmed.reduce((s, b) => s + artistCachetOf(b), 0),
  };
}

// Indicatori finanziari
export function financials(finance = {}, stats = {}) {
  const revenue      = Number(stats.commission) || 0;
  const fixed        = Number(finance.fixed_costs_monthly) || 0;
  const variable     = Number(finance.variable_costs) || 0;
  const depreciation = Number(finance.depreciation) || 0;
  const interest     = Number(finance.interest) || 0;
  const taxes        = Number(finance.taxes) || 0;
  const capital      = Number(finance.invested_capital) || 0;
  const totalOpCosts = fixed + variable;
  const ebitda       = revenue - totalOpCosts;
  const ebit         = ebitda - depreciation;
  const preTax       = ebit - interest;
  const netProfit    = preTax - taxes;
  const ros          = revenue ? (ebit / revenue) * 100 : 0;
  const roi          = capital ? (ebit / capital) * 100 : 0;
  const ebitdaMargin = revenue ? (ebitda / revenue) * 100 : 0;
  return {
    revenue, totalOpCosts, ebitda, ebit, preTax, netProfit,
    ros, roi, ebitdaMargin,
    fixed, variable, depreciation, interest, taxes, capital,
  };
}

export function formatPct(n) {
  return `${Number.isFinite(n) ? n.toFixed(1) : "0.0"}%`;
}

export function monthlySeries(bookings = []) {
  const map = {};
  bookings.filter(isConfirmed).forEach(b => {
    const d = b.eventDate || b.event_date || b.created_at || "";
    const key = String(d).slice(0, 7);
    if (!key) return;
    map[key] = (map[key] || 0) + commissionOf(b);
  });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => ({ month, value }));
}

export function topBy(bookings = [], field = "artistName", limit = 5) {
  const map = {};
  bookings.filter(isConfirmed).forEach(b => {
    const k = b[field] || "—";
    map[k] = (map[k] || 0) + cachetOf(b);
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, volume]) => ({ name, volume }));
}