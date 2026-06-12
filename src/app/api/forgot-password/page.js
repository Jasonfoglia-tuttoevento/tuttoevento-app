// src/app/forgot-password/page.js
"use client";
import { useState } from "react";
import Link from "next/link";

const O    = "#ff5a00";
const INK  = "#0a0a0b";
const MUTED= "#6b6b73";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError("Inserisci la tua email"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Errore invio email"); }
      else { setSent(true); }
    } catch {
      setError("Errore di rete. Riprova.");
    }
    setLoading(false);
  }

  return (
    <main style={{
      minHeight: "100vh", background: INK,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Manrope',system-ui,sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .fp-input:focus {
          border-color: rgba(255,90,0,.5) !important;
          box-shadow: 0 0 0 3px rgba(255,90,0,.1) !important;
          outline: none;
        }
        .fp-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .fp-back:hover { color: white !important; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href="/" style={{
            fontFamily: "'Sora',sans-serif", fontWeight: 900,
            fontSize: "1.3rem", letterSpacing: "-.04em",
            color: "white", textDecoration: "none",
          }}>
            TUTTO<span style={{ color: O }}>EVENTO</span>
          </Link>
        </div>

        <div style={{
          background: "white", borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "0 24px 64px rgba(0,0,0,.3)",
        }}>
          {sent ? (
            /* ── Stato successo ── */
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(22,163,74,.1)", border: "2px solid rgba(22,163,74,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: INK, margin: "0 0 10px", letterSpacing: "-.03em" }}>
                Email inviata!
              </h2>
              <p style={{ fontSize: 14, color: MUTED, margin: "0 0 8px", lineHeight: 1.65 }}>
                Abbiamo inviato le istruzioni per reimpostare la password a:
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: "0 0 24px" }}>{email}</p>
              <p style={{ fontSize: 13, color: MUTED, margin: "0 0 24px", lineHeight: 1.65 }}>
                Controlla anche la cartella spam se non la vedi entro qualche minuto.
              </p>
              <Link href="/login"
                style={{
                  display: "block", background: INK, color: "white",
                  borderRadius: 100, padding: "12px", textAlign: "center",
                  fontWeight: 700, fontSize: 14, textDecoration: "none",
                  transition: "all .2s",
                }}>
                Torna al login
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: INK, margin: "0 0 8px", letterSpacing: "-.03em" }}>
                  Password dimenticata?
                </h1>
                <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.65 }}>
                  Inserisci la tua email e ti mandiamo il link per reimpostare la password.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".12em", display: "block", marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    type="email" className="fp-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="la-tua@email.com"
                    required
                    style={{
                      width: "100%", background: "#fbfaf8",
                      border: "1px solid rgba(0,0,0,.1)", borderRadius: 12,
                      padding: "11px 14px", fontSize: 14, color: INK,
                      fontFamily: "'Manrope',system-ui,sans-serif",
                      transition: "all .15s", boxSizing: "border-box",
                    }}
                  />
                </div>

                {error && (
                  <div style={{ background: "rgba(220,38,38,.06)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 10, padding: "10px 14px" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", margin: 0 }}>{error}</p>
                  </div>
                )}

                <button type="submit" className="fp-btn" disabled={loading}
                  style={{
                    background: O, color: "white", border: "none",
                    borderRadius: 100, padding: "13px",
                    fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Manrope',system-ui,sans-serif",
                    opacity: loading ? .7 : 1, transition: "all .2s",
                    boxShadow: `0 8px 24px ${O}35`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                  {loading ? (
                    <>
                      <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                      Invio in corso...
                    </>
                  ) : "Invia link di reset →"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: 20 }}>
                <Link href="/login" className="fp-back"
                  style={{ fontSize: 13, color: MUTED, textDecoration: "none", transition: "color .15s", fontWeight: 600 }}>
                  ← Torna al login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.25)", marginTop: 24 }}>
          © 2026 TuttoEvento ·{" "}
          <Link href="/privacy" style={{ color: "rgba(255,255,255,.35)", textDecoration: "none" }}>Privacy</Link>
        </p>
      </div>
    </main>
  );
}