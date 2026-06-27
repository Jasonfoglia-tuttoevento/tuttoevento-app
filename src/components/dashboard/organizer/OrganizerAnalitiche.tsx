"use client";
import React from "react";
import { Card, INK, MUTED, ProBadge, ProLock, SectionTitle } from "./shared";

interface Booking {
  status?: string;
  publicPrice?: number | string;
  cachet?: number | string;
  [key: string]: unknown;
}

interface OrganizerAnaliticheProps {
  bookings?: Booking[];
  plan?: string;
}

export default function OrganizerAnalitiche({ bookings = [], plan }: OrganizerAnaliticheProps) {
  const fmt = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const confirmed = bookings.filter(b => ["confirmed", "accettato", "accepted"].includes((b.status || "").toLowerCase()));
  const spent = confirmed.reduce((s, b) => s + (Number(b.publicPrice) || Number(b.cachet) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
        {[["Booking totali", bookings.length], ["Confermati", confirmed.length], ["Budget totale", fmt(spent)]].map(([label, val]) => (
          <div key={label as string} style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 20, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: MUTED, margin: "0 0 6px" }}>{label}</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: INK, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Analitiche avanzate — solo PRO */}
      <ProLock feature="Le analitiche avanzate e il benchmark di zona" plan={plan}>
        <Card>
          <SectionTitle>Analitiche avanzate + benchmark zona <ProBadge /></SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: 14 }}>
            {["Trend serate", "Generi più prenotati", "Benchmark budget zona"].map(label => (
              <div key={label} style={{ background: "#fbfaf8", borderRadius: 14, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: INK, margin: 0 }}>—</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: MUTED }}>Confronta le tue performance con altri locali nella tua zona.</p>
        </Card>
      </ProLock>

      {/* Multi-utente staff — solo PRO */}
      <ProLock feature="La gestione multi-utente dello staff" plan={plan}>
        <Card>
          <SectionTitle>Multi-utente staff <ProBadge /></SectionTitle>
          <p style={{ fontSize: 13, color: MUTED }}>Aggiungi fino a 5 membri del tuo staff con accesso alla dashboard. Ognuno ha le proprie credenziali e permessi.</p>
          <button disabled style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "not-allowed", fontFamily: "'Manrope',system-ui,sans-serif", opacity: .5, marginTop: 12 }}>
            + Aggiungi membro staff
          </button>
        </Card>
      </ProLock>
    </div>
  );
}
