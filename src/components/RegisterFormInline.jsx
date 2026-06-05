"use client";
import { useState } from "react";

export default function RegisterFormInline({ role = "artist", dark = true }) {
  const [step, setStep]       = useState(1);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [extra, setExtra]     = useState("");
  const [terms, setTerms]     = useState(false);
  const [loading, setLoad]    = useState(false);
  const [msg, setMsg]         = useState("");
  const [done, setDone]       = useState(false);

  const isArtist   = role === "artist";
  const isPromoter = role === "promoter";

  const bg      = dark ? "rgba(255,255,255,.07)" : "#fbfaf8";
  const border  = dark ? "1px solid rgba(255,255,255,.15)" : "1px solid rgba(0,0,0,.1)";
  const textC   = dark ? "white" : "#0a0a0b";
  const mutedC  = dark ? "rgba(255,255,255,.45)" : "#6b6b73";
  const ORANGE  = "#ff5a00";

  const inp = {
    background: bg, border, borderRadius: 14, padding: "12px 16px",
    fontSize: 14, color: textC, fontFamily: "'Manrope',system-ui,sans-serif",
    outline: "none", width: "100%", transition: "border-color .2s",
    WebkitAppearance: "none",
  };

  function focusIn(e)  { e.target.style.borderColor = ORANGE; }
  function focusOut(e) { e.target.style.borderColor = dark ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.1)"; }

  function extraLabel() {
    if (isArtist)   return "Nome d'arte (opzionale)";
    if (isPromoter) return "Nome agenzia / management (opzionale)";
    return "Nome locale (opzionale)";
  }

  function termsHref() {
    if (isArtist)   return "/termini/artisti";
    if (isPromoter) return "/termini/promoter";
    return "/termini/locali";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!terms) { setMsg("Devi accettare i termini e condizioni per procedere."); return; }
    if (!name || !email || !password) { setMsg("Compila tutti i campi obbligatori."); return; }
    setLoad(true); setMsg("");
    try {
      const res = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role,
          stageName:  isArtist   ? extra : undefined,
          agencyName: isPromoter ? extra : undefined,
          venueName:  !isArtist && !isPromoter ? extra : undefined,
          termsAccepted: true,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setMsg(d.error || "Errore durante la registrazione."); setLoad(false); return; }
      setDone(true);
    } catch { setMsg("Errore di rete. Riprova."); }
    setLoad(false);
  }

  if (done) return (
    <div style={{ textAlign: "center", padding: "28px 0" }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>🎉</div>
      <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: textC, margin: "0 0 8px" }}>
        Account creato!
      </h3>
      <p style={{ fontSize: 13, color: mutedC, marginBottom: 20, lineHeight: 1.6 }}>
        Controlla la tua email per confermare l'account.
      </p>
      <a href="/dashboard" style={{
        display: "inline-block", background: ORANGE, color: "white",
        borderRadius: 100, padding: "12px 28px", fontWeight: 800, fontSize: 14,
        textDecoration: "none", fontFamily: "'Manrope',system-ui,sans-serif",
      }}>
        Vai alla dashboard →
      </a>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Step 1 — dati base */}
      {step === 1 && (
        <>
          <input style={inp} placeholder="Nome e cognome *" value={name}
            onChange={e => setName(e.target.value)} onFocus={focusIn} onBlur={focusOut} />
          <input style={inp} type="email" placeholder="Email *" value={email}
            onChange={e => setEmail(e.target.value)} onFocus={focusIn} onBlur={focusOut} />
          <input style={inp} type="password" placeholder="Password *" value={password}
            onChange={e => setPass(e.target.value)} onFocus={focusIn} onBlur={focusOut} />

          <button type="button"
            onClick={() => {
              if (!name || !email || !password) { setMsg("Compila tutti i campi obbligatori."); return; }
              setMsg(""); setStep(2);
            }}
            style={{
              background: ORANGE, color: "white", border: "none", borderRadius: 14,
              padding: "13px", fontWeight: 800, fontSize: 14, cursor: "pointer",
              fontFamily: "'Manrope',system-ui,sans-serif", transition: "all .2s",
            }}>
            Continua →
          </button>
        </>
      )}

      {/* Step 2 — dettagli + termini */}
      {step === 2 && (
        <>
          <input style={inp} placeholder={extraLabel()} value={extra}
            onChange={e => setExtra(e.target.value)} onFocus={focusIn} onBlur={focusOut} />

          {/* Checkbox termini */}
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
            padding: "12px 14px", borderRadius: 14,
            background: terms
              ? (dark ? "rgba(255,90,0,.1)" : "rgba(255,90,0,.06)")
              : (dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"),
            border: `1px solid ${terms ? "rgba(255,90,0,.3)" : (dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)")}`,
            transition: "all .2s",
          }}>
            <input
              type="checkbox"
              checked={terms}
              onChange={e => { setTerms(e.target.checked); if (msg.includes("termini")) setMsg(""); }}
              style={{
                width: 18, height: 18, marginTop: 1, flexShrink: 0,
                accentColor: ORANGE, cursor: "pointer",
              }}
            />
            <span style={{ fontSize: 12, color: mutedC, lineHeight: 1.6 }}>
              Ho letto e accetto i{" "}
              <a href={termsHref()} target="_blank" rel="noopener noreferrer"
                style={{ color: ORANGE, fontWeight: 700, textDecoration: "none" }}>
                Termini e Condizioni
              </a>
              {" "}e la{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer"
                style={{ color: ORANGE, fontWeight: 700, textDecoration: "none" }}>
                Privacy Policy
              </a>
              {" "}di TuttoEvento.
            </span>
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => { setStep(1); setMsg(""); }}
              style={{
                flex: 1, background: dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.05)",
                color: textC, border, borderRadius: 14, padding: "12px",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "'Manrope',system-ui,sans-serif",
              }}>
              ← Indietro
            </button>
            <button type="submit" disabled={loading || !terms}
              style={{
                flex: 2, background: loading || !terms ? "rgba(255,90,0,.4)" : ORANGE,
                color: "white", border: "none", borderRadius: 14, padding: "12px",
                fontWeight: 800, fontSize: 14,
                cursor: loading || !terms ? "not-allowed" : "pointer",
                fontFamily: "'Manrope',system-ui,sans-serif", transition: "all .2s",
              }}>
              {loading ? "Creazione account..." : "Crea account gratis"}
            </button>
          </div>
        </>
      )}

      {/* Messaggio errore/info */}
      {msg && (
        <p style={{
          fontSize: 12, fontWeight: 700, margin: 0, lineHeight: 1.5,
          color: msg.includes("termini") || msg.includes("Errore") || msg.includes("Devi") ? "#fca5a5" : "#86efac",
        }}>
          {msg}
        </p>
      )}

      {/* Link login */}
      <p style={{ fontSize: 11, color: mutedC, textAlign: "center", margin: 0 }}>
        Hai già un account?{" "}
        <a href="/login" style={{ color: ORANGE, textDecoration: "none", fontWeight: 700 }}>
          Accedi
        </a>
      </p>
    </form>
  );
}