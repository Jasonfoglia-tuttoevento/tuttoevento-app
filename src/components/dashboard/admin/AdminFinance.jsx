"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import * as XLSX from "xlsx";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

function fmt(n) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);
}
function pct(n) {
  return `${Number.isFinite(n) ? n.toFixed(1) : "0.0"}%`;
}

// ── Tooltip personalizzato ──
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e5e5e7", borderRadius: 12, padding: "10px 14px", fontSize: 13 }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
}

// ── Grafico KPI card ──
function KpiCard({ label, value, sub, color = ORANGE, trend }) {
  return (
    <div style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "20px 22px" }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: MUTED, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, fontFamily: "Sora,sans-serif", letterSpacing: "-0.03em", color: color === "ink" ? INK : color }}>{value}</p>
      {sub && <p style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginTop: 4 }}>{sub}</p>}
      {trend !== undefined && (
        <p style={{ fontSize: 12, fontWeight: 700, color: trend >= 0 ? "#16a34a" : "#dc2626", marginTop: 4 }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}% vs mese prec.
        </p>
      )}
    </div>
  );
}

export default function AdminFinance({ bookings = [], finance = {} }) {
  // ── Costi fissi (righe dinamiche) ──
  const [costiRighe, setCostiRighe] = useState([
    { id: 1, descrizione: "Affitto ufficio", importo: "" },
    { id: 2, descrizione: "Software / SaaS", importo: "" },
    { id: 3, descrizione: "Stipendi", importo: "" },
  ]);
  const [costiVariabiliRighe, setCostiVariabiliRighe] = useState([
    { id: 1, descrizione: "Marketing / Ads", importo: "" },
    { id: 2, descrizione: "Trasferte", importo: "" },
  ]);
  const [ammortamenti, setAmmortamenti] = useState(finance.depreciation || "");
  const [oneriFinanziari, setOneriFinanziari] = useState(finance.interest || "");
  const [imposte, setImposte] = useState(finance.taxes || "");
  const [capitaleInvestito, setCapitaleInvestito] = useState(finance.invested_capital || "");
  const [commissionRate, setCommissionRate] = useState(finance.commission_rate || 0.08);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [activeChart, setActiveChart] = useState("pl"); // pl | cashflow | breakeven

  // ── Calcoli ──
  const isConfirmed = (b) => ["confirmed", "confermato", "paid", "accepted"].includes(String(b?.status || "").toLowerCase());
  const confirmedBookings = bookings.filter(isConfirmed);

  // Ricavi = somma (prezzo pubblico - cachet netto) dei booking confermati
  const ricaviTotali = confirmedBookings.reduce((s, b) => {
    const pubPrice = Number(b.cachet || b.artistCachet || 0);
    return s + pubPrice * commissionRate;
  }, 0);

  const totaleCostiFissi = costiRighe.reduce((s, r) => s + (Number(r.importo) || 0), 0);
  const totaleCostiVar = costiVariabiliRighe.reduce((s, r) => s + (Number(r.importo) || 0), 0);
  const totCostiOp = totaleCostiFissi + totaleCostiVar;
  const ebitda = ricaviTotali - totCostiOp;
  const ebit = ebitda - (Number(ammortamenti) || 0);
  const preTax = ebit - (Number(oneriFinanziari) || 0);
  const utileNetto = preTax - (Number(imposte) || 0);
  const ros = ricaviTotali ? (ebit / ricaviTotali) * 100 : 0;
  const roi = Number(capitaleInvestito) ? (ebit / Number(capitaleInvestito)) * 100 : 0;
  const ebitdaMargin = ricaviTotali ? (ebitda / ricaviTotali) * 100 : 0;

  // Break-even: quanti booking al mese per coprire i costi fissi
  const ricavoMedioPerBooking = confirmedBookings.length
    ? ricaviTotali / confirmedBookings.length : 0;
  const breakEvenBookings = ricavoMedioPerBooking > 0
    ? Math.ceil(totaleCostiFissi / ricavoMedioPerBooking) : 0;

  // ── Serie mensile per grafici ──
  const monthlyData = (() => {
    const map = {};
    confirmedBookings.forEach(b => {
      const d = b.eventDate || b.event_date || b.createdAt || "";
      const key = String(d).slice(0, 7);
      if (!key || key.length < 7) return;
      if (!map[key]) map[key] = { mese: key, ricavi: 0, costiOp: 0, bookings: 0 };
      map[key].ricavi += Number(b.cachet || 0) * commissionRate;
      map[key].bookings += 1;
    });
    return Object.values(map)
      .sort((a, b) => a.mese.localeCompare(b.mese))
      .map(m => ({
        ...m,
        mese: m.mese.slice(5) + "/" + m.mese.slice(2, 4),
        costiOp: totCostiOp / Math.max(Object.keys(map).length, 1),
        ebitda: m.ricavi - totCostiOp / Math.max(Object.keys(map).length, 1),
      }));
  })();

  // Cash flow cumulativo
  const cashFlowData = monthlyData.reduce((acc, m, i) => {
    const prev = i > 0 ? acc[i - 1].cumulativo : 0;
    acc.push({ ...m, cumulativo: prev + m.ebitda });
    return acc;
  }, []);

  // Break-even chart (simulazione scaling)
  const breakEvenChartData = Array.from({ length: 20 }, (_, i) => {
    const bk = (i + 1) * Math.max(1, Math.ceil(breakEvenBookings / 10));
    return {
      booking: bk,
      ricavi: bk * ricavoMedioPerBooking,
      costi: totaleCostiFissi + totaleCostiVar,
    };
  });

  // ── CRUD righe costi ──
  function addRiga(setter) {
    setter(prev => [...prev, { id: Date.now(), descrizione: "", importo: "" }]);
  }
  function removeRiga(setter, id) {
    setter(prev => prev.filter(r => r.id !== id));
  }
  function updateRiga(setter, id, field, val) {
    setter(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  }

  // ── Salva su Supabase ──
  async function salva() {
    setSaving(true); setSaveMsg("");
    try {
      const payload = {
        fixedCostsMonthly: totaleCostiFissi,
        variableCosts: totaleCostiVar,
        depreciation: Number(ammortamenti) || 0,
        interest: Number(oneriFinanziari) || 0,
        taxes: Number(imposte) || 0,
        investedCapital: Number(capitaleInvestito) || 0,
        commissionRate: Number(commissionRate) || 0.08,
        notes: JSON.stringify({ costiRighe, costiVariabiliRighe }),
      };
      const res = await fetch("/api/finance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) setSaveMsg("Dati salvati ✓");
      else setSaveMsg("Errore salvataggio");
    } catch { setSaveMsg("Errore tecnico"); }
    finally { setSaving(false); }
  }

  // ── Export Excel ──
  function exportExcel() {
    const wb = XLSX.utils.book_new();

    // Foglio 1: Conto Economico
    const ce = [
      ["CONTO ECONOMICO — TuttoEvento", "", ""],
      ["", "", ""],
      ["RICAVI", "", ""],
      ["Commissioni su booking confermati", "", ricaviTotali],
      ["", "", ""],
      ["COSTI FISSI", "", ""],
      ...costiRighe.map(r => [r.descrizione, "", Number(r.importo) || 0]),
      ["Totale costi fissi", "", totaleCostiFissi],
      ["", "", ""],
      ["COSTI VARIABILI", "", ""],
      ...costiVariabiliRighe.map(r => [r.descrizione, "", Number(r.importo) || 0]),
      ["Totale costi variabili", "", totaleCostiVar],
      ["", "", ""],
      ["EBITDA", "", ebitda],
      ["Ammortamenti", "", Number(ammortamenti) || 0],
      ["EBIT", "", ebit],
      ["Oneri finanziari", "", Number(oneriFinanziari) || 0],
      ["Utile ante imposte", "", preTax],
      ["Imposte", "", Number(imposte) || 0],
      ["UTILE NETTO", "", utileNetto],
      ["", "", ""],
      ["INDICATORI", "", ""],
      ["ROS", "", `${ros.toFixed(2)}%`],
      ["ROI", "", `${roi.toFixed(2)}%`],
      ["EBITDA Margin", "", `${ebitdaMargin.toFixed(2)}%`],
      ["Break-even (booking/mese)", "", breakEvenBookings],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(ce);
    ws1["!cols"] = [{ wch: 40 }, { wch: 5 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Conto Economico");

    // Foglio 2: Serie mensile
    const mensile = [
      ["Mese", "Ricavi", "Costi Operativi", "EBITDA", "Booking"],
      ...monthlyData.map(m => [m.mese, m.ricavi, m.costiOp, m.ebitda, m.bookings]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(mensile);
    XLSX.utils.book_append_sheet(wb, ws2, "Serie Mensile");

    // Foglio 3: Booking confermati
    const bkRows = [
      ["ID", "Artista", "Locale", "Data", "Cachet", "Commissione"],
      ...confirmedBookings.map(b => [
        b.id, b.artistName, b.organizerName, b.eventDate,
        Number(b.cachet || 0),
        Number(b.cachet || 0) * commissionRate,
      ]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(bkRows);
    XLSX.utils.book_append_sheet(wb, ws3, "Booking Confermati");

    XLSX.writeFile(wb, `TuttoEvento_Finance_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const s = { // stili inline riutilizzabili
    card: { background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "20px 22px", marginBottom: 0 },
    label: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: MUTED, display: "block", marginBottom: 6 },
    input: { width: "100%", background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 14, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    inputDesc: { flex: 1, background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 14, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none" },
    inputNum: { width: 130, background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 14, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", textAlign: "right" },
    btn: { background: ORANGE, color: "white", border: "none", borderRadius: 100, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
    btnSec: { background: "white", color: INK, border: "1px solid rgba(0,0,0,.12)", borderRadius: 100, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
    btnSmall: { background: "#f5f5f6", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
    btnDanger: { background: "transparent", border: "none", color: "#dc2626", fontWeight: 700, fontSize: 18, cursor: "pointer", padding: "0 6px", lineHeight: 1 },
    row: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 },
    sep: { border: "none", borderTop: "1px solid rgba(0,0,0,.07)", margin: "20px 0" },
    h2: { fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em", marginBottom: 4 },
    h3: { fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 12 },
    orange: { color: ORANGE },
    green: { color: "#16a34a" },
    red: { color: "#dc2626" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700&display=swap');`}</style>

      {/* ── KPI TOP ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <KpiCard label="Ricavi totali" value={fmt(ricaviTotali)} sub={`${confirmedBookings.length} booking confermati`} />
        <KpiCard label="EBITDA" value={fmt(ebitda)} sub={`Margine ${pct(ebitdaMargin)}`} color={ebitda >= 0 ? "#16a34a" : "#dc2626"} />
        <KpiCard label="EBIT" value={fmt(ebit)} sub="Reddito operativo" color={ebit >= 0 ? "#16a34a" : "#dc2626"} />
        <KpiCard label="Utile netto" value={fmt(utileNetto)} sub="Dopo imposte" color={utileNetto >= 0 ? "#16a34a" : "#dc2626"} />
        <KpiCard label="ROS" value={pct(ros)} sub="Return on Sales" />
        <KpiCard label="ROI" value={pct(roi)} sub="Return on Investment" />
        <KpiCard label="Break-even" value={`${breakEvenBookings} booking`} sub="Per coprire i costi fissi" color={INK} />
        <KpiCard label="Costi operativi" value={fmt(totCostiOp)} sub={`Fissi: ${fmt(totaleCostiFissi)}`} color={INK} />
      </div>

      {/* ── GRAFICI ── */}
      <div style={s.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h2 style={s.h2}>Grafici finanziari</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {[["pl", "P&L mensile"], ["cashflow", "Cash flow"], ["breakeven", "Break-even"]].map(([id, label]) => (
              <button key={id} onClick={() => setActiveChart(id)}
                style={{ ...( activeChart === id ? s.btn : s.btnSec), padding: "7px 16px", fontSize: 13 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeChart === "pl" && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
              <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="ricavi" name="Ricavi" fill={ORANGE} radius={[6,6,0,0]} />
              <Bar dataKey="costiOp" name="Costi op." fill="#e5e5e7" radius={[6,6,0,0]} />
              <Bar dataKey="ebitda" name="EBITDA" fill="#16a34a" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === "cashflow" && (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cashFlowData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ORANGE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
              <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="cumulativo" name="Cash flow cumulativo"
                stroke={ORANGE} fill="url(#cfGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === "breakeven" && (
          <div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>
              Con ricavo medio per booking di <strong>{fmt(ricavoMedioPerBooking)}</strong>, il break-even è a <strong style={s.orange}>{breakEvenBookings} booking/mese</strong>.
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={breakEvenChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                <XAxis dataKey="booking" label={{ value: "Booking/mese", position: "insideBottom", offset: -2, fontSize: 12 }} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="ricavi" name="Ricavi" stroke={ORANGE} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="costi" name="Costi totali" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── CONTO ECONOMICO INTERATTIVO ── */}
      <div style={s.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h2 style={s.h2}>Conto Economico</h2>
            <p style={{ fontSize: 13, color: MUTED }}>Inserisci tutti i costi. I ricavi si calcolano automaticamente dai booking confermati.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={exportExcel} style={s.btnSec}>📊 Esporta Excel</button>
            <button onClick={salva} disabled={saving} style={s.btn}>{saving ? "Salvo..." : "💾 Salva"}</button>
          </div>
        </div>
        {saveMsg && <p style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", marginBottom: 12 }}>{saveMsg}</p>}

        {/* Ricavi */}
        <div style={{ background: "#fbfaf8", borderRadius: 18, padding: "16px 18px", marginBottom: 16 }}>
          <h3 style={{ ...s.h3, color: ORANGE }}>+ Ricavi</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>Commissioni su booking confermati</span>
            <span style={{ fontWeight: 800, fontSize: 16 }}>{fmt(ricaviTotali)}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={s.label}>Tasso commissione (%)</label>
            <input type="number" min="0" max="100" step="0.1"
              value={(Number(commissionRate) * 100).toFixed(1)}
              onChange={e => setCommissionRate(Number(e.target.value) / 100)}
              style={{ ...s.input, width: 120, textAlign: "right" }} />
          </div>
        </div>

        {/* Costi fissi */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h3 style={{ ...s.h3, color: "#dc2626", margin: 0 }}>− Costi fissi mensili</h3>
            <button onClick={() => addRiga(setCostiRighe)} style={s.btnSmall}>+ Aggiungi riga</button>
          </div>
          {costiRighe.map(r => (
            <div key={r.id} style={s.row}>
              <input placeholder="Descrizione costo" value={r.descrizione}
                onChange={e => updateRiga(setCostiRighe, r.id, "descrizione", e.target.value)}
                style={s.inputDesc} />
              <span style={{ color: MUTED, fontWeight: 700, fontSize: 14 }}>€</span>
              <input type="number" min="0" placeholder="0" value={r.importo}
                onChange={e => updateRiga(setCostiRighe, r.id, "importo", e.target.value)}
                style={s.inputNum} />
              <button onClick={() => removeRiga(setCostiRighe, r.id)} style={s.btnDanger}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, paddingTop: 8, borderTop: "1px dashed rgba(0,0,0,.1)" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Totale: <strong style={{ color: "#dc2626" }}>{fmt(totaleCostiFissi)}</strong></span>
          </div>
        </div>

        {/* Costi variabili */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h3 style={{ ...s.h3, color: "#f59e0b", margin: 0 }}>− Costi variabili</h3>
            <button onClick={() => addRiga(setCostiVariabiliRighe)} style={s.btnSmall}>+ Aggiungi riga</button>
          </div>
          {costiVariabiliRighe.map(r => (
            <div key={r.id} style={s.row}>
              <input placeholder="Descrizione costo" value={r.descrizione}
                onChange={e => updateRiga(setCostiVariabiliRighe, r.id, "descrizione", e.target.value)}
                style={s.inputDesc} />
              <span style={{ color: MUTED, fontWeight: 700, fontSize: 14 }}>€</span>
              <input type="number" min="0" placeholder="0" value={r.importo}
                onChange={e => updateRiga(setCostiVariabiliRighe, r.id, "importo", e.target.value)}
                style={s.inputNum} />
              <button onClick={() => removeRiga(setCostiVariabiliRighe, r.id)} style={s.btnDanger}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, paddingTop: 8, borderTop: "1px dashed rgba(0,0,0,.1)" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Totale: <strong style={{ color: "#f59e0b" }}>{fmt(totaleCostiVar)}</strong></span>
          </div>
        </div>

        <hr style={s.sep} />

        {/* Altre voci */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
          {[
            ["Ammortamenti (€)", ammortamenti, setAmmortamenti],
            ["Oneri finanziari (€)", oneriFinanziari, setOneriFinanziari],
            ["Imposte (€)", imposte, setImposte],
            ["Capitale investito (€)", capitaleInvestito, setCapitaleInvestito],
          ].map(([label, val, setter]) => (
            <div key={label}>
              <label style={s.label}>{label}</label>
              <input type="number" min="0" value={val}
                onChange={e => setter(e.target.value)}
                style={s.input} />
            </div>
          ))}
        </div>

        {/* Riepilogo finale */}
        <div style={{ background: INK, color: "white", borderRadius: 20, padding: "20px 22px" }}>
          <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 16, color: "white" }}>Riepilogo conto economico</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              ["Ricavi", fmt(ricaviTotali), "rgba(255,255,255,.5)"],
              ["− Costi operativi", fmt(totCostiOp), "rgba(255,255,255,.5)"],
              ["= EBITDA", fmt(ebitda), ebitda >= 0 ? "#86efac" : "#fca5a5"],
              ["− Ammortamenti", fmt(Number(ammortamenti)||0), "rgba(255,255,255,.5)"],
              ["= EBIT", fmt(ebit), ebit >= 0 ? "#86efac" : "#fca5a5"],
              ["− Oneri fin.", fmt(Number(oneriFinanziari)||0), "rgba(255,255,255,.5)"],
              ["− Imposte", fmt(Number(imposte)||0), "rgba(255,255,255,.5)"],
              ["= Utile netto", fmt(utileNetto), utileNetto >= 0 ? "#4ade80" : "#f87171"],
            ].map(([k, v, c]) => (
              <div key={k}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{k}</p>
                <p style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 18, color: c }}>{v}</p>
              </div>
            ))}
          </div>
          <hr style={{ ...s.sep, borderColor: "rgba(255,255,255,.1)", margin: "16px 0" }} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>ROS <strong style={{ color: ros >= 0 ? "#86efac" : "#fca5a5" }}>{pct(ros)}</strong></span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>ROI <strong style={{ color: roi >= 0 ? "#86efac" : "#fca5a5" }}>{pct(roi)}</strong></span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>EBITDA margin <strong style={{ color: ebitdaMargin >= 0 ? "#86efac" : "#fca5a5" }}>{pct(ebitdaMargin)}</strong></span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>Break-even <strong style={{ color: ORANGE }}>{breakEvenBookings} booking/mese</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}