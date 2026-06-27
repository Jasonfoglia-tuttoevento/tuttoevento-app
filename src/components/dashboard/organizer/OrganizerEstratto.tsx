"use client";
import React from "react";
import { Card, MUTED, O, SectionTitle } from "./shared";

interface Booking {
  id?: string;
  status?: string;
  artistName?: string;
  eventTitle?: string;
  eventDate?: string;
  publicPrice?: number | string;
  cachet?: number | string;
  [key: string]: unknown;
}

interface OrganizerEstrattoProps {
  bookings?: Booking[];
}

export default function OrganizerEstratto({ bookings = [] }: OrganizerEstrattoProps) {
  const fmt = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const confirmed = bookings.filter(b => ["confirmed", "accettato", "accepted"].includes((b.status || "").toLowerCase()));
  const total = confirmed.reduce((s, b) => s + (Number(b.publicPrice) || Number(b.cachet) || 0), 0);

  return (
    <Card>
      <SectionTitle>Estratto conto</SectionTitle>
      {confirmed.length === 0 ? (
        <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessun booking confermato ancora.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(0,0,0,.07)" }}>
                {["Artista", "Evento", "Data", "Importo"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confirmed.map((b, i) => (
                <tr key={b.id || i} style={{ borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{b.artistName || "—"}</td>
                  <td style={{ padding: "10px 12px", color: MUTED }}>{b.eventTitle || "—"}</td>
                  <td style={{ padding: "10px 12px", color: MUTED }}>{b.eventDate || "—"}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: O }}>{fmt(Number(b.publicPrice) || Number(b.cachet) || 0)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(0,0,0,.1)", background: "#fbfaf8" }}>
                <td colSpan={3} style={{ padding: "12px", fontWeight: 800 }}>TOTALE SPESO</td>
                <td style={{ padding: "12px", fontWeight: 800, color: O, fontSize: 15 }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
