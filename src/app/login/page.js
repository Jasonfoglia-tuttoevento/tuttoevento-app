"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPwd, setFocusedPwd] = useState(false);

  async function loginUser(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setIsError(true); setMessage(data.error || "Credenziali errate"); return; }
      router.push("/dashboard");
    } catch {
      setIsError(true);
      setMessage("Errore tecnico. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (focused) => ({
    width: "100%",
    background: focused ? "#fff" : "#fbfaf8",
    border: `1.5px solid ${focused ? "#ff5a00" : "rgba(0,0,0,.12)"}`,
    borderRadius: 16,
    padding: "13px 16px",
    fontSize: 15,
    color: "#0a0a0b",
    outline: "none",
    boxSizing: "border-box",
    transition: "all .2s",
    boxShadow: focused ? "0 0 0 3px rgba(255,90,0,.1)" : "none",
    fontFamily: "inherit",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=Manrope:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #9a9ab0; }
        @keyframes loginFloat { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-24px)} }
        @keyframes loginSpin { to{transform:rotate(360deg)} }
        @keyframes loginFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <main style={{
        minHeight: "100vh", background: "#0a0a0b",
        fontFamily: "'Manrope',system-ui,sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, position: "relative", overflow: "hidden",
      }}>
        {/* Glow bg */}
        <div aria-hidden style={{
          position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(255,90,0,.4),transparent 70%)",
          filter: "blur(80px)", animation: "loginFloat 9s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(255,90,0,.15),transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        {/* Card */}
        <div style={{
          position: "relative", zIndex: 1, width: "100%", maxWidth: 440,
          background: "rgba(255,255,255,.97)", borderRadius: 32, padding: "40px 36px",
          boxShadow: "0 40px 80px -20px rgba(0,0,0,.7)",
          animation: "loginFadeUp .4s ease",
        }}>
          {/* Logo */}
          <Link href="/" style={{
            fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "1.2rem",
            letterSpacing: "-.04em", color: "#0a0a0b", textDecoration: "none",
            display: "block", textAlign: "center", marginBottom: 32,
          }}>
            TUTTO<span style={{ color: "#ff5a00" }}>EVENTO</span>
          </Link>

          {/* Titolo */}
          <h1 style={{
            fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "2rem",
            letterSpacing: "-.04em", color: "#0a0a0b", textAlign: "center",
            marginBottom: 6, lineHeight: 1.1,
          }}>Bentornato.</h1>
          <p style={{ textAlign: "center", color: "#6b6b73", fontSize: ".9rem", marginBottom: 28 }}>
            Entra nella tua area TuttoEvento
          </p>

          <form onSubmit={loginUser}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0a0a0b", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email" placeholder="nome@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                onFocus={() => setFocusedEmail(true)}
                onBlur={() => setFocusedEmail(false)}
                style={inputStyle(focusedEmail)}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8, position: "relative" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0a0a0b", marginBottom: 6 }}>
                Password
              </label>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="La tua password"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                onFocus={() => setFocusedPwd(true)}
                onBlur={() => setFocusedPwd(false)}
                style={{ ...inputStyle(focusedPwd), paddingRight: 80 }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: "absolute", right: 14, top: 40,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: ".78rem", fontWeight: 700, color: "#9a9ab0", fontFamily: "inherit",
                }}>
                {showPwd ? "Nascondi" : "Mostra"}
              </button>
            </div>

            {/* Forgot */}
            <div style={{ textAlign: "right", marginBottom: 24 }}>
              <Link href="/forgot-password" style={{ fontSize: ".8rem", fontWeight: 700, color: "#6b6b73", textDecoration: "none" }}>
                Password dimenticata?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !email || !password}
              style={{
                width: "100%", background: loading ? "#e85100" : "#ff5a00",
                color: "#fff", border: "none", borderRadius: 16,
                padding: "15px", fontSize: "1rem", fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all .25s",
                boxShadow: "0 12px 30px rgba(255,90,0,.35)",
                opacity: (!email || !password) ? .5 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              {loading && (
                <div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "loginSpin .7s linear infinite" }} />
              )}
              {loading ? "Accesso in corso..." : "Entra →"}
            </button>
          </form>

          {/* Messaggio errore/successo */}
          {message && (
            <div style={{
              marginTop: 16, padding: "12px 16px", borderRadius: 12,
              background: isError ? "rgba(220,38,38,.08)" : "rgba(22,163,74,.08)",
              border: `1px solid ${isError ? "rgba(220,38,38,.2)" : "rgba(22,163,74,.2)"}`,
              color: isError ? "#dc2626" : "#16a34a",
              fontSize: ".875rem", fontWeight: 700, textAlign: "center",
            }}>
              {isError ? "⚠️ " : "✓ "}{message}
            </div>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,.07)" }} />
            <span style={{ fontSize: ".75rem", color: "#9a9ab0", fontWeight: 600 }}>oppure</span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,.07)" }} />
          </div>

          {/* Register link */}
          <Link href="/register" style={{
            display: "block", textAlign: "center", width: "100%",
            background: "rgba(0,0,0,.04)", border: "1px solid rgba(0,0,0,.08)",
            borderRadius: 16, padding: "13px", fontSize: ".9rem", fontWeight: 700,
            color: "#0a0a0b", textDecoration: "none", transition: "all .2s",
          }}>
            Crea un account gratis
          </Link>

          <p style={{ textAlign: "center", fontSize: ".75rem", color: "rgba(0,0,0,.3)", marginTop: 20 }}>
            © 2026 TuttoEvento · <Link href="/privacy" style={{ color: "rgba(0,0,0,.3)", textDecoration: "none" }}>Privacy</Link>
          </p>
        </div>
      </main>
    </>
  );
}