/* ============================================================
   TuttoEvento — utility commissioni e formati
   Modello dati assunto (da cablare lato backend):
   - user.role: "organizer" | "artist" | "promoter" | "referent" | "admin"
   - user.referentId: id del referente associato a un locale (organizer)
   - booking: { id, organizerId, organizerName, artistName, eventTitle,
                eventDate, cachet | artistCachet, status }
   - status confermato = "confirmed" (i guadagni si contano su questi)
   ============================================================ */

export const COMMISSION_RATE = 0.08; // 8% default sul cachet

// Estrae un numero da una stringa cachet tipo "€ 800", "800,00", "1.200 €"
export function parseCachet(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // toglie separatore migliaia
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function cachetOf(booking) {
  return parseCachet(booking?.cachet ?? booking?.artistCachet ?? 0);
}

export function commissionOf(booking, rate = COMMISSION_RATE) {
  return cachetOf(booking) * rate;
}

export function isConfirmed(booking) {
  const s = String(booking?.status || "").toLowerCase();
  return s === "confirmed" || s === "confermato" || s === "paid";
}

export function formatEuro(n) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

// Aggrega un elenco di booking in totali utili alle dashboard
export function aggregate(bookings = [], rate = COMMISSION_RATE) {
  const confirmed = bookings.filter(isConfirmed);
  const volume = confirmed.reduce((s, b) => s + cachetOf(b), 0);
  const commission = confirmed.reduce((s, b) => s + commissionOf(b, rate), 0);
  return {
    count: bookings.length,
    confirmedCount: confirmed.length,
    volume,
    commission,
    netToArtists: volume - commission,
  };
}

/* ============================================================
   Indicatori finanziari aziendali
   Ricavi piattaforma = commissioni sui booking confermati.
   ============================================================ */

// finance = riga da company_finance; stats = aggregate(bookings)
export function financials(finance = {}, stats = {}) {
  const revenue = Number(stats.commission) || 0; // ricavo = commissioni incassate
  const fixed = Number(finance.fixed_costs_monthly) || 0;
  const variable = Number(finance.variable_costs) || 0;
  const depreciation = Number(finance.depreciation) || 0;
  const interest = Number(finance.interest) || 0;
  const taxes = Number(finance.taxes) || 0;
  const capital = Number(finance.invested_capital) || 0;

  const totalOpCosts = fixed + variable;
  const ebitda = revenue - totalOpCosts;          // margine operativo lordo
  const ebit = ebitda - depreciation;             // reddito operativo
  const preTax = ebit - interest;                 // utile ante imposte
  const netProfit = preTax - taxes;               // utile netto

  const ros = revenue ? (ebit / revenue) * 100 : 0;        // Return on Sales %
  const roi = capital ? (ebit / capital) * 100 : 0;        // Return on Investment %
  const ebitdaMargin = revenue ? (ebitda / revenue) * 100 : 0;

  return {
    revenue, totalOpCosts, ebitda, ebit, preTax, netProfit,
    ros, roi, ebitdaMargin,
    fixed, variable, depreciation, interest, taxes, capital,
  };
}

export function formatPct(n) {
  const v = Number.isFinite(n) ? n : 0;
  return `${v.toFixed(1)}%`;
}

// Raggruppa booking confermati per mese (YYYY-MM) -> commissioni
export function monthlySeries(bookings = [], rate = COMMISSION_RATE) {
  const map = {};
  bookings.filter(isConfirmed).forEach((b) => {
    const d = b.eventDate || b.event_date || b.created_at || "";
    const key = String(d).slice(0, 7);
    if (!key) return;
    map[key] = (map[key] || 0) + commissionOf(b, rate);
  });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => ({ month, value }));
}

// Top per volume: raggruppa per chiave (es. artistName) sui confermati
export function topBy(bookings = [], field = "artistName", limit = 5) {
  const map = {};
  bookings.filter(isConfirmed).forEach((b) => {
    const k = b[field] || "—";
    map[k] = (map[k] || 0) + cachetOf(b);
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, volume]) => ({ name, volume }));
}