"use client";

import { useState } from "react";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

function validatePassword(pw) {
  const errors = [];
  if (pw.length < 8)           errors.push("Almeno 8 caratteri");
  if (!/[A-Z]/.test(pw))       errors.push("Almeno una lettera maiuscola");
  if (!/[0-9]/.test(pw))       errors.push("Almeno un numero");
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push("Almeno un carattere speciale (!@#$%...)");
  return errors;
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const errors = validatePassword(password);
  const score = 4 - errors.length;
  const colors = ["#dc2626","#f97316","#eab308","#16a34a"];
  const labels = ["Troppo debole","Debole","Buona","Ottima"];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < score ? colors[score-1] : "rgba(0,0,0,.08)", transition: "background .2s" }} />
        ))}
      </div>
      {score > 0 && <p style={{ fontSize: 11, fontWeight: 700, color: colors[score-1], margin: 0 }}>{labels[score-1]}</p>}
      {errors.map(e => <p key={e} style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>· {e}</p>)}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "20px 22px", ...style }}>
      {children}
    </div>
  );
}

function Inp({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "'Manrope',system-ui,sans-serif" }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none", width: "100%" }} />
      {hint && <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{hint}</p>}
    </div>
  );
}

/* ─── Sezione: Dati personali ─────────────────────────────── */
function SectionProfile({ user }) {
  const [name, setName]   = useState(user?.name || "");
  const [email]           = useState(user?.email || "");
  const [loading, setLoad] = useState(false);
  const [msg, setMsg]     = useState("");

  async function save(e) {
    e.preventDefault();
    if (!name.trim()) { setMsg("Il nome non può essere vuoto."); return; }
    setLoad(true); setMsg("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const d = await res.json();
      setMsg(res.ok ? "✓ Profilo aggiornato" : d.error || "Errore aggiornamento");
    } catch { setMsg("Errore di rete"); }
    setLoad(false);
  }

  return (
    <Card>
      <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: INK, margin: "0 0 16px" }}>Dati personali</h3>
      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Inp label="Nome visualizzato" value={name} onChange={e => setName(e.target.value)} placeholder="Il tuo nome" />
        <Inp label="Email" value={email} placeholder="—" hint="L'email non può essere modificata da qui." />
        {msg && <p style={{ fontSize: 12, fontWeight: 700, color: msg.startsWith("✓") ? "#16a34a" : "#dc2626", margin: 0 }}>{msg}</p>}
        <button type="submit" disabled={loading}
          style={{ background: INK, color: "white", border: "none", borderRadius: 100, padding: "11px 24px", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Manrope',system-ui,sans-serif", alignSelf: "flex-start", opacity: loading ? .6 : 1 }}>
          {loading ? "Salvataggio..." : "Salva modifiche"}
        </button>
      </form>
    </Card>
  );
}

/* ─── Sezione: Cambia password ────────────────────────────── */
function SectionPassword() {
  const [current, setCurrent]   = useState("");
  const [newPw, setNewPw]       = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoad]      = useState(false);
  const [msg, setMsg]           = useState("");
  const [showNew, setShowNew]   = useState(false);

  const pwErrors = validatePassword(newPw);
  const canSubmit = current && newPw && confirm && pwErrors.length === 0 && newPw === confirm;

  async function save(e) {
    e.preventDefault();
    if (newPw !== confirm) { setMsg("Le password non coincidono."); return; }
    if (pwErrors.length > 0) { setMsg(pwErrors[0]); return; }
    setLoad(true); setMsg("");
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg("✓ Password aggiornata con successo");
        setCurrent(""); setNewPw(""); setConfirm("");
      } else {
        setMsg(d.error || "Errore aggiornamento password");
      }
    } catch { setMsg("Errore di rete"); }
    setLoad(false);
  }

  return (
    <Card>
      <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: INK, margin: "0 0 6px" }}>Cambia password</h3>
      <p style={{ fontSize: 12, color: MUTED, margin: "0 0 16px", fontFamily: "'Manrope',system-ui,sans-serif" }}>
        La password deve avere almeno 8 caratteri, una maiuscola, un numero e un carattere speciale.
      </p>
      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Inp label="Password attuale" type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••" />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "'Manrope',system-ui,sans-serif" }}>Nuova password</label>
          <div style={{ position: "relative" }}>
            <input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••"
              style={{ background: "#fbfaf8", border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, padding: "10px 40px 10px 13px", fontSize: 13, fontFamily: "'Manrope',system-ui,sans-serif", outline: "none", width: "100%" }} />
            <button type="button" onClick={() => setShowNew(p => !p)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: MUTED }}>
              {showNew ? "🙈" : "👁"}
            </button>
          </div>
          <PasswordStrength password={newPw} />
        </div>
        <Inp label="Conferma nuova password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
          hint={confirm && newPw !== confirm ? "⚠️ Le password non coincidono" : confirm && newPw === confirm ? "✓ Coincidono" : ""} />
        {msg && <p style={{ fontSize: 12, fontWeight: 700, color: msg.startsWith("✓") ? "#16a34a" : "#dc2626", margin: 0 }}>{msg}</p>}
        <button type="submit" disabled={loading || !canSubmit}
          style={{ background: ORANGE, color: "white", border: "none", borderRadius: 100, padding: "11px 24px", fontWeight: 800, fontSize: 13, cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "'Manrope',system-ui,sans-serif", alignSelf: "flex-start", opacity: !canSubmit ? .4 : 1 }}>
          {loading ? "Aggiornamento..." : "Aggiorna password"}
        </button>
      </form>
    </Card>
  );
}

/* ─── Sezione: Piano attivo ───────────────────────────────── */
function SectionPlan({ user }) {
  const plan = user?.plan || "free";
  const isPro = plan === "pro";
  return (
    <Card>
      <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: INK, margin: "0 0 16px" }}>Piano attivo</h3>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: isPro ? `${ORANGE}15` : "#f5f5f6", border: `1px solid ${isPro ? `${ORANGE}30` : "rgba(0,0,0,.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            {isPro ? "⭐" : "🆓"}
          </div>
          <div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: INK, margin: 0 }}>Piano {isPro ? "Pro" : "Free"}</p>
            <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0", fontFamily: "'Manrope',system-ui,sans-serif" }}>
              {isPro ? "Tutte le funzionalità sbloccate" : "Funzionalità base attive"}
            </p>
          </div>
        </div>
        {!isPro && (
          <div style={{ background: "rgba(255,90,0,.06)", border: "1px solid rgba(255,90,0,.15)", borderRadius: 14, padding: "10px 16px", fontSize: 12, color: ORANGE, fontWeight: 700, fontFamily: "'Manrope',system-ui,sans-serif" }}>
            Upgrade disponibile a breve
          </div>
        )}
      </div>
    </Card>
  );
}

/* ─── Main ────────────────────────────────────────────────── */
export default function AccountSettings({ user }) {
  return (
    <div id="account-settings" style={{ fontFamily: "'Manrope',system-ui,sans-serif", color: INK, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ background: "white", border: "1px solid rgba(0,0,0,.06)", borderRadius: 24, padding: "20px 22px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".16em", color: ORANGE, margin: "0 0 4px" }}>Account</p>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-.03em", margin: "0 0 4px" }}>Impostazioni</h2>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Gestisci il tuo profilo, la password e il piano.</p>
      </div>

      <SectionProfile user={user} />
      <SectionPassword />
      <SectionPlan user={user} />
    </div>
  );
}