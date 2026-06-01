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