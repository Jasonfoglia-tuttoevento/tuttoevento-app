"use client";

import { useState, useEffect, useCallback } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { BUDGET_CATEGORIES, type TourBudgetItem, type BudgetFormData, type BudgetCategory } from "./types";

interface TourBudgetProps {
  tourId: string;
  currentUser: { id: number; name?: string };
  onClose?: () => void;
}

const INITIAL_FORM: BudgetFormData = {
  category: "transport",
  description: "",
  plannedAmount: "",
  actualAmount: "",
  date: "",
};

export default function TourBudget({ tourId, currentUser, onClose }: TourBudgetProps) {
  const [items, setItems] = useState<TourBudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<BudgetFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/tour/budget?tourId=${tourId}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const updateField = useCallback((field: keyof BudgetFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toNum = (v: string): number => parseFloat(v.replace(/[^0-9.-]/g, "")) || 0;

  const totalPlanned = items.reduce((sum, i) => sum + i.plannedAmount, 0);
  const totalActual = items.reduce((sum, i) => sum + i.actualAmount, 0);
  const diff = totalPlanned - totalActual;

  const handleAdd = async () => {
    if (!form.description) { setError("Descrizione obbligatoria"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/tour/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId,
          userId: currentUser.id,
          category: form.category,
          description: form.description,
          plannedAmount: toNum(form.plannedAmount),
          actualAmount: toNum(form.actualAmount),
          date: form.date || null,
        }),
      });
      if (!res.ok) throw new Error("Errore salvataggio");
      setForm(INITIAL_FORM);
      await loadItems();
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

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="text" className="w-48 h-6 bg-gray-800" />
        <Skeleton className="h-32 w-full bg-gray-800" />
        <Skeleton className="h-32 w-full bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Budget Tour</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">Chiudi</button>
        )}
      </div>

      {/* Riepilogo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500 font-bold uppercase">Preventivato</p>
          <p className="text-xl font-extrabold text-white mt-1">€{totalPlanned.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500 font-bold uppercase">Speso</p>
          <p className="text-xl font-extrabold text-white mt-1">€{totalActual.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500 font-bold uppercase">Residuo</p>
          <p className={`text-xl font-extrabold mt-1 ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
            €{diff.toLocaleString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-bold">{error}</div>
      )}

      {/* Form aggiunta voce */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#ff5a00] uppercase tracking-wider">Aggiungi Voce</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Categoria</label>
            <select
              style={inputStyle}
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              {BUDGET_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Data</label>
            <input
              style={inputStyle}
              type="date"
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Descrizione *</label>
          <input
            style={inputStyle}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Es. Van noleggio Roma-Napoli"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Preventivato (€)</label>
            <input
              style={inputStyle}
              type="number"
              value={form.plannedAmount}
              onChange={(e) => updateField("plannedAmount", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Speso (€)</label>
            <input
              style={inputStyle}
              type="number"
              value={form.actualAmount}
              onChange={(e) => updateField("actualAmount", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="w-full bg-[#ff5a00] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#e04f00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Salvataggio..." : "+ Aggiungi Voce"}
        </button>
      </div>

      {/* Lista voci */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Voci Budget ({items.length})</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm py-6 text-center">Nessuna voce inserita.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{item.description}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {BUDGET_CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                  {item.date ? ` · ${item.date}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-xs text-gray-500">Prev: €{item.plannedAmount.toLocaleString()}</p>
                <p className={`text-sm font-bold ${item.actualAmount > item.plannedAmount ? "text-red-400" : "text-green-400"}`}>
                  €{item.actualAmount.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}