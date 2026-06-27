"use client";

import { useState, useCallback } from "react";
import Skeleton from "@/components/ui/Skeleton";
import type { SettlementFormData } from "./types";

interface SettlementSheetProps {
  tourId: string;
  dateId?: string;
  currentUser: { id: string; name?: string };
  onClose?: () => void;
}

const INITIAL_FORM: SettlementFormData = {
  venueName: "",
  city: "",
  date: new Date().toISOString().slice(0, 10),
  grossIncome: "",
  venueExpenses: "",
  merchIncome: "",
  crewTips: "",
  otherExpenses: "",
  notes: "",
};

export default function SettlementSheet({ tourId, dateId, currentUser, onClose }: SettlementSheetProps) {
  const [form, setForm] = useState<SettlementFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = useCallback((field: keyof SettlementFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toNum = (v: string): number => parseFloat(v.replace(/[^0-9.-]/g, "")) || 0;

  const netIncome =
    toNum(form.grossIncome) +
    toNum(form.merchIncome) -
    toNum(form.venueExpenses) -
    toNum(form.crewTips) -
    toNum(form.otherExpenses);

  const handleSave = async () => {
    if (!form.venueName || !form.date) {
      setError("Venue e data sono obbligatori");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/tour/settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId,
          dateId,
          userId: currentUser.id,
          ...form,
          grossIncome: toNum(form.grossIncome),
          venueExpenses: toNum(form.venueExpenses),
          merchIncome: toNum(form.merchIncome),
          crewTips: toNum(form.crewTips),
          otherExpenses: toNum(form.otherExpenses),
          netIncome,
        }),
      });
      if (!res.ok) throw new Error("Errore salvataggio");
      onClose?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "#1a1a1b",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    color: "white",
    fontFamily: "'Manrope',system-ui,sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,.5)",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Settlement Sheet</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">
            Chiudi
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* Info Base */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label style={labelStyle}>Venue *</label>
          <input
            style={inputStyle}
            value={form.venueName}
            onChange={(e) => updateField("venueName", e.target.value)}
            placeholder="Nome locale"
          />
        </div>
        <div>
          <label style={labelStyle}>Città</label>
          <input
            style={inputStyle}
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="Es. Napoli"
          />
        </div>
        <div>
          <label style={labelStyle}>Data *</label>
          <input
            style={inputStyle}
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
        </div>
      </div>

      {/* Sezione Finanziaria */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#ff5a00] uppercase tracking-wider mb-2">Incassi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Incasso Lordo (€)</label>
            <input
              style={inputStyle}
              type="number"
              value={form.grossIncome}
              onChange={(e) => updateField("grossIncome", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Merch (€)</label>
            <input
              style={inputStyle}
              type="number"
              value={form.merchIncome}
              onChange={(e) => updateField("merchIncome", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <h3 className="text-sm font-bold text-[#ff5a00] uppercase tracking-wider mb-2 mt-6">Spese</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Spese Venue (€)</label>
            <input
              style={inputStyle}
              type="number"
              value={form.venueExpenses}
              onChange={(e) => updateField("venueExpenses", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Mance Crew (€)</label>
            <input
              style={inputStyle}
              type="number"
              value={form.crewTips}
              onChange={(e) => updateField("crewTips", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Altre Spese (€)</label>
            <input
              style={inputStyle}
              type="number"
              value={form.otherExpenses}
              onChange={(e) => updateField("otherExpenses", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Net Income Calcolato */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex justify-between items-center">
        <span className="text-gray-400 font-bold">Netto Serata</span>
        <span className={`text-2xl font-extrabold ${netIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
          €{netIncome.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Note */}
      <div>
        <label style={labelStyle}>Note</label>
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Note aggiuntive sulla serata..."
        />
      </div>

      {/* Azioni */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-[#ff5a00] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#e04f00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Salvataggio..." : "Salva Settlement"}
        </button>
      </div>
    </div>
  );
}