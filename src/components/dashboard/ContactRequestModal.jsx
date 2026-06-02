"use client";

import { useState } from "react";

export default function ContactRequestModal({ artist, currentUser, onClose, onSuccess }) {
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          eventDate,
          eventType,
          budget: budget ? Number(budget) : null,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore invio richiesta");
        return;
      }
      onSuccess?.();
      onClose();
    } catch {
      setError("Errore tecnico. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl" style={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,.3)" }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--orange)] mb-1">Richiesta contatto</p>
            <h2 className="text-xl font-extrabold tracking-tight">{artist.name}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Il nostro team ti ricontatterà con tutti i dettagli.</p>
          </div>
          <button onClick={onClose} className="text-2xl text-[var(--muted)] hover:text-[var(--ink)] leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1.5">Data evento (indicativa)</label>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition focus:border-[var(--orange)] focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Tipo evento</label>
            <select value={eventType} onChange={e => setEventType(e.target.value)}
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition focus:border-[var(--orange)] focus:outline-none">
              <option value="">Seleziona...</option>
              <option>Serata in club</option>
              <option>Festival</option>
              <option>Evento privato</option>
              <option>Concerto</option>
              <option>Opening</option>
              <option>Altro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Budget indicativo (€)</label>
            <input type="number" min="0" placeholder="es. 300" value={budget} onChange={e => setBudget(e.target.value)}
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition focus:border-[var(--orange)] focus:outline-none" />
            <p className="text-[10px] text-[var(--muted)] mt-1">Il budget è riservato e visibile solo al nostro team.</p>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Note aggiuntive</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Descrivi l'evento, il pubblico atteso, le tue aspettative..."
              className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3 text-sm transition focus:border-[var(--orange)] focus:outline-none resize-none" />
          </div>

          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <button disabled={loading}
            className="w-full bg-[var(--orange)] text-white rounded-2xl py-3.5 font-bold text-sm hover:bg-[#e85100] transition disabled:opacity-50 shadow-[0_10px_24px_-10px_rgba(255,90,0,.6)]">
            {loading ? "Invio in corso..." : "Invia richiesta"}
          </button>
        </form>
      </div>
    </div>
  );
}