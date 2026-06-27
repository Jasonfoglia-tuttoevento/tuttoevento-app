"use client";
import React, { useState } from "react";
import { SCard, STitle, KpiCard, O, INK, BORDER, MUTED, inp } from "./shared";

interface Booking {
  id?: string;
  status?: string;
  paymentStatus?: string;
  cachet?: number | string;
  artistCachet?: number | string;
  eventTitle?: string;
  eventDate?: string;
  organizerName?: string;
  startTime?: string;
  endTime?: string;
  [key: string]: unknown;
}

interface ArtistGuadagniProps {
  bookings?: Booking[];
}

export default function ArtistGuadagni({ bookings = [] }: ArtistGuadagniProps) {
  const safe = Array.isArray(bookings) ? bookings : [];
  const confirmed = safe.filter(b => ["confirmed", "accettato", "accepted"].includes((b.status || "").toLowerCase()));
  const pending_pay = safe.filter(b => b.paymentStatus === "paid_by_venue");
  const fmt = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const total      = confirmed.reduce((s, b) => s + (Number(b.cachet) || Number(b.artistCachet) || 0), 0);
  const pendingAmt = pending_pay.reduce((s, b) => s + (Number(b.cachet) || Number(b.artistCachet) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
        <KpiCard label="Serate confermate" value={confirmed.length} />
        <KpiCard label="In arrivo"          value={fmt(pendingAmt)} orange />
        <KpiCard label="Totale maturato"    value={fmt(total)} accent />
      </div>

      <SCard>
        <STitle sub="Storico booking con pagamento tracciato">Estratto conto</STitle>
        {confirmed.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Nessun booking confermato ancora.</p>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,.25)", margin: "4px 0 0" }}>Appena un booking viene confermato apparirà qui.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Evento", "Data", "Locale", "Stato pagamento", "Cachet"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: MUTED, whiteSpace: "nowrap", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confirmed.map((b, i) => {
                  const ps = b.paymentStatus || "pending";
                  const pConfig: Record<string, { label: string; color: string }> = {
                    pending:        { label: "In attesa",          color: "#d97706" },
                    paid_by_venue:  { label: "Pagamento in arrivo", color: "#2563eb" },
                    completed:      { label: "Ricevuto ✓",          color: "#16a34a" },
                  };
                  const pc = pConfig[ps] || { label: ps, color: MUTED };
                  return (
                    <tr key={b.id || i} style={{ borderBottom: `1px solid rgba(0,0,0,.04)` }}>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: INK }}>{b.eventTitle || "—"}</td>
                      <td style={{ padding: "10px 12px", color: MUTED, whiteSpace: "nowrap" }}>{b.eventDate || "—"}</td>
                      <td style={{ padding: "10px 12px", color: MUTED }}>{b.organizerName || "—"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: `${pc.color}12`, color: pc.color }}>{pc.label}</span>
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 800, color: O }}>{fmt(Number(b.cachet) || Number(b.artistCachet) || 0)}</td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop: `2px solid ${BORDER}`, background: "#fbfaf8" }}>
                  <td colSpan={4} style={{ padding: "12px", fontWeight: 800, color: INK }}>TOTALE</td>
                  <td style={{ padding: "12px", fontWeight: 900, color: O, fontSize: 16 }}>{fmt(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </SCard>

      {/* Sezione "conferma ricezione" se ci sono pagamenti in arrivo */}
      {pending_pay.length > 0 && (
        <SCard style={{ border: `1px solid rgba(37,99,235,.2)`, background: "rgba(37,99,235,.03)" }}>
          <STitle sub="Il locale ha confermato il pagamento — conferma la ricezione">
            Pagamenti in arrivo ({pending_pay.length})
          </STitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending_pay.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", background: "white", borderRadius: 14, padding: "12px 16px", border: `1px solid ${BORDER}` }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: INK, margin: 0 }}>{b.eventTitle || b.organizerName || "Evento"}</p>
                  <p style={{ fontSize: 12, color: MUTED, margin: "3px 0 0" }}>{b.eventDate} · <strong style={{ color: INK }}>€{b.cachet || b.artistCachet}</strong></p>
                </div>
                <button
                  onClick={async () => {
                    await fetch("/api/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, paymentAction: "artist_confirm" }) });
                    window.location.reload();
                  }}
                  style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "9px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  ✓ Ho ricevuto il pagamento
                </button>
                <button
                  onClick={async () => {
                    const reason = prompt("Motivo della contestazione (min 10 caratteri):");
                    if (!reason || reason.trim().length < 10) return;
                    await fetch("/api/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, paymentDispute: true, disputeNote: reason }) });
                    window.location.reload();
                  }}
                  style={{ background: "transparent", border: "1px solid rgba(220,38,38,.3)", color: "#dc2626", borderRadius: 100, padding: "9px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                  ⚠️ Contesta
                </button>
              </div>
            ))}
          </div>
        </SCard>
      )}
    </div>
  );
}

export function BookingConfirmCard({ booking, onRefresh }: { booking: Booking; onRefresh?: () => void }) {
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendConfirm(action: string) {
    if (action === "decline" && declineReason.trim().length < 5) {
      setError("Inserisci un breve motivo (almeno 5 caratteri)");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          confirmAction: action,
          declineReason: action === "decline" ? declineReason.trim() : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Errore"); setLoading(false); return; }
      if (onRefresh) onRefresh();
    } catch {
      setError("Errore di rete. Riprova.");
    }
    setLoading(false);
  }

  return (
    <div style={{ background: "rgba(255,90,0,.04)", border: "1px solid rgba(255,90,0,.2)", borderRadius: 16, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <p style={{ fontWeight: 800, fontSize: 14, margin: 0, fontFamily: "'Sora',sans-serif" }}>{booking.eventTitle || "Evento"}</p>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "rgba(255,90,0,.12)", color: O }}>
          Conferma richiesta
        </span>
      </div>
      <p style={{ fontSize: 12, color: MUTED, margin: "0 0 10px", lineHeight: 1.6 }}>
        {booking.eventDate}{booking.startTime ? ` · ${booking.startTime}–${booking.endTime}` : ""} · {booking.organizerName}
      </p>
      <p style={{ fontSize: 12, color: INK, margin: "0 0 12px", lineHeight: 1.6 }}>
        Confermi la tua presenza per questa data? Se non sei disponibile, segnalalo subito: il team TuttoEvento provvederà a trovare un&apos;alternativa.
      </p>

      {!showDecline ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" disabled={loading} onClick={() => sendConfirm("confirm")}
            style={{ fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 100, border: "none", background: "#16a34a", color: "white", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? .6 : 1 }}>
            ✓ Confermo presenza
          </button>
          <button type="button" disabled={loading} onClick={() => setShowDecline(true)}
            style={{ fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 100, border: "1px solid #fca5a5", background: "transparent", color: "#dc2626", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            Non sono disponibile
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={2}
            placeholder="Motivo (es. impegno già preso per quella data)..."
            style={{ ...inp, resize: "vertical" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" disabled={loading} onClick={() => sendConfirm("decline")}
              style={{ fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 100, border: "none", background: "#dc2626", color: "white", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? .6 : 1 }}>
              Invia indisponibilità
            </button>
            <button type="button" onClick={() => { setShowDecline(false); setError(""); }}
              style={{ fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 100, border: "1px solid rgba(0,0,0,.12)", background: "transparent", color: MUTED, cursor: "pointer", fontFamily: "inherit" }}>
              Annulla
            </button>
          </div>
        </div>
      )}
      {error && <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, margin: "8px 0 0" }}>{error}</p>}
    </div>
  );
}
