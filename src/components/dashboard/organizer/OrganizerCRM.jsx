"use client";
import { useState, useEffect, useRef } from "react";
import { Card, INK, Inp, MUTED, O, ProBadge, ProLock, SCard, STitle, SectionTitle } from "./shared";
import CRMContacts from "@/components/CRMContacts";
import { ReviewForm } from "@/components/ReviewWidget";
export default function OrganizerCRM({ bookings, plan }) {
  const [notes, setNotes] = useState({});
  const [contactRequests, setContactRequests] = useState([]);
  const [crLoading, setCrLoading] = useState(true);
  const [reviewedIds, setReviewedIds] = useState([]);

  const toReview = (Array.isArray(bookings) ? bookings : []).filter(b =>
    b.eventDate && new Date(b.eventDate) < new Date() &&
    ["accepted","confirmed","completed"].includes(b.status) &&
    !reviewedIds.includes(b.id)
  );

  const STATI = ["pending","reviewed","confirmed","rejected"];
  const STATUS_LABEL = { pending:"In attesa", reviewed:"In revisione", confirmed:"Confermato", rejected:"Rifiutato" };
  const STATUS_COLOR = { pending:"#d97706", reviewed:"#2563eb", confirmed:"#16a34a", rejected:"#dc2626" };

  const CR_STATUS_LABEL = { pending:"In attesa", contacted:"Contattato", confirmed:"Confermato", rejected:"Rifiutato" };
  const CR_STATUS_COLOR = { pending:"#d97706", contacted:"#2563eb", confirmed:"#16a34a", rejected:"#dc2626" };

  useEffect(() => {
    fetch("/api/contact-requests")
      .then(r => r.json())
      .then(d => setContactRequests(Array.isArray(d) ? d : []))
      .catch(() => setContactRequests([]))
      .finally(() => setCrLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Richieste di contatto inviate dal marketplace */}
      <Card>
        <SectionTitle>Richieste inviate</SectionTitle>
        {crLoading ? (
          <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Caricamento...</p>
        ) : contactRequests.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessuna richiesta di contatto inviata ancora. Vai su "Trova artisti" per contattare un artista.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contactRequests.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fbfaf8", borderRadius: 16, padding: "12px 16px", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.artist_name || "Artista"}</p>
                  <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>
                    {r.event_date || "—"}{r.event_type ? ` · ${r.event_type}` : ""}{r.budget ? ` · €${r.budget}` : ""}
                  </p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, flexShrink: 0,
                  background: (CR_STATUS_COLOR[r.status] || "#6b7280") + "18",
                  color: CR_STATUS_COLOR[r.status] || "#6b7280" }}>
                  {CR_STATUS_LABEL[r.status] || r.status || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pipeline base */}
      <Card>
        <SectionTitle>Pipeline richieste</SectionTitle>
        {bookings.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(0,0,0,.3)" }}>Nessuna richiesta inviata ancora.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bookings.slice(0, 8).map((b, i) => (
              <div key={b.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fbfaf8", borderRadius: 16, padding: "12px 16px", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.artistName || "Artista"}</p>
                  <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{b.eventDate || "—"} {b.eventTitle ? `· ${b.eventTitle}` : ""}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, flexShrink: 0,
                  background: (STATUS_COLOR[b.status] || "#6b7280") + "18",
                  color: STATUS_COLOR[b.status] || "#6b7280" }}>
                  {STATUS_LABEL[b.status] || b.status || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* CRM — rubrica contatti reale */}
      <CRMContacts contactType="artist" />

      {/* Eventi conclusi da recensire */}
      {toReview.length > 0 && (
        <Card>
          <SectionTitle>Eventi conclusi — lascia una recensione</SectionTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {toReview.map(b => (
              <ReviewForm key={b.id} bookingId={b.id} targetName={b.artistName}
                onDone={() => setReviewedIds(prev => [...prev, b.id])} />
            ))}
          </div>
        </Card>
      )}

      {/* Export CSV — solo PRO */}
      <ProLock feature="L'export CSV dei dati" plan={plan}>
        <Card>
          <SectionTitle>Export dati <ProBadge /></SectionTitle>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>Esporta tutto lo storico booking e contatti in formato CSV.</p>
          <button disabled style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "not-allowed", fontFamily: "'Manrope',system-ui,sans-serif", opacity: .5 }}>
            Esporta CSV
          </button>
        </Card>
      </ProLock>
    </div>
  );
}

// ── Tab: Analitiche ────────────────────────────────────────────