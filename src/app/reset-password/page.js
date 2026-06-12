// src/app/reset-password/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const O    = "#ff5a00";
const INK  = "#0a0a0b";
const MUTED= "#6b6b73";

const inp = {
  width:"100%", background:"#fbfaf8",
  border:"1px solid rgba(0,0,0,.1)", borderRadius:12,
  padding:"11px 14px", fontSize:14, color:INK,
  fontFamily:"'Manrope',system-ui,sans-serif",
  transition:"all .15s", boxSizing:"border-box", outline:"none",
};

function StrengthBar({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["#dc2626","#f59e0b","#f59e0b","#16a34a","#16a34a"];
  const labels = ["","Debole","Discreta","Buona","Ottima"];
  if (!password) return null;
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:"flex", gap:3, marginBottom:4 }}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<score?colors[score]:"rgba(0,0,0,.1)", transition:"background .2s" }} />
        ))}
      </div>
      <p style={{ fontSize:11, color:colors[score], margin:0, fontWeight:600 }}>{labels[score]}</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router  = useRouter();
  const [phase,    setPhase]    = useState("loading"); // loading | ready | error | success
  const [token,    setToken]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Estrai token dall'hash o dai query params ──────────────────
  // Supabase PKCE reindirizza con hash: #access_token=...&type=recovery
  // oppure come query: ?token=...&type=recovery
  useEffect(() => {
    function parseToken() {
      // 1. Prova dall'hash (flusso PKCE standard)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const type        = params.get("type");
        if (accessToken && type === "recovery") {
          setToken(accessToken);
          setPhase("ready");
          // Pulisci l'hash dall'URL senza ricaricare
          window.history.replaceState(null, "", window.location.pathname);
          return;
        }
      }

      // 2. Prova dai query params (fallback)
      const search = new URLSearchParams(window.location.search);
      const qToken = search.get("access_token") || search.get("token");
      const qType  = search.get("type");
      if (qToken && (qType === "recovery" || qToken.length > 20)) {
        setToken(qToken);
        setPhase("ready");
        return;
      }

      // 3. Nessun token trovato
      setPhase("error");
      setErrorMsg("Link non valido o scaduto. Richiedi un nuovo link per reimpostare la password.");
    }

    // Aspetta che l'hash sia disponibile (può richiedere un tick dopo il redirect)
    const timer = setTimeout(parseToken, 200);
    return () => clearTimeout(timer);
  }, []);

  function validate() {
    if (password.length < 8)          return "Password di almeno 8 caratteri";
    if (!/[A-Z]/.test(password))      return "Serve almeno una lettera maiuscola";
    if (!/[0-9]/.test(password))      return "Serve almeno un numero";
    if (!/[^A-Za-z0-9]/.test(password)) return "Serve almeno un carattere speciale";
    if (password !== confirm)          return "Le password non coincidono";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError("");

    try {
      const res = await fetch("/api/reset-password", {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify({ token, password }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Errore reimpostazione password"); }
      else {
        setPhase("success");
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Errore di rete. Riprova.");
    }
    setLoading(false);
  }

  return (
    <main style={{
      minHeight:"100vh", background:INK,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"24px 16px", fontFamily:"'Manrope',system-ui,sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .rp-input:focus { border-color:rgba(255,90,0,.5)!important; box-shadow:0 0 0 3px rgba(255,90,0,.1)!important; }
        .rp-btn:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
      `}</style>

      <div style={{ width:"100%", maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Link href="/" style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1.25rem", letterSpacing:"-.04em", color:"white", textDecoration:"none" }}>
            TUTTO<span style={{ color:O }}>EVENTO</span>
          </Link>
        </div>

        <div style={{ background:"white", borderRadius:24, padding:"32px 28px", boxShadow:"0 24px 64px rgba(0,0,0,.3)" }}>

          {/* ── Loading ── */}
          {phase === "loading" && (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ width:40, height:40, border:`3px solid rgba(255,90,0,.2)`, borderTopColor:O, borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 16px" }} />
              <p style={{ fontSize:14, color:MUTED, margin:0 }}>Verifica del link in corso...</p>
            </div>
          )}

          {/* ── Token non valido ── */}
          {phase === "error" && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(220,38,38,.1)", border:"2px solid rgba(220,38,38,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:INK, margin:"0 0 10px" }}>Link non valido</h2>
              <p style={{ fontSize:14, color:MUTED, margin:"0 0 24px", lineHeight:1.65 }}>{errorMsg}</p>
              <Link href="/forgot-password"
                style={{ display:"block", background:O, color:"white", borderRadius:100, padding:"12px", textAlign:"center", fontWeight:700, fontSize:14, textDecoration:"none", boxShadow:`0 8px 24px ${O}35` }}>
                Richiedi nuovo link →
              </Link>
              <div style={{ marginTop:14, textAlign:"center" }}>
                <Link href="/login" style={{ fontSize:13, color:MUTED, textDecoration:"none", fontWeight:600 }}>← Torna al login</Link>
              </div>
            </div>
          )}

          {/* ── Successo ── */}
          {phase === "success" && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(22,163,74,.1)", border:"2px solid rgba(22,163,74,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:INK, margin:"0 0 10px" }}>Password aggiornata!</h2>
              <p style={{ fontSize:14, color:MUTED, margin:"0 0 24px", lineHeight:1.65 }}>
                La tua password è stata reimpostata. Verrai reindirizzato al login tra pochi secondi...
              </p>
              <Link href="/login"
                style={{ display:"block", background:INK, color:"white", borderRadius:100, padding:"12px", textAlign:"center", fontWeight:700, fontSize:14, textDecoration:"none" }}>
                Vai al login →
              </Link>
            </div>
          )}

          {/* ── Form ── */}
          {phase === "ready" && (
            <>
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:INK, margin:"0 0 8px", letterSpacing:"-.03em" }}>
                  Nuova password
                </h1>
                <p style={{ fontSize:14, color:MUTED, margin:0, lineHeight:1.65 }}>
                  Scegli una password sicura per il tuo account TuttoEvento.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* Password */}
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".12em", display:"block", marginBottom:6 }}>
                    Nuova password
                  </label>
                  <div style={{ position:"relative" }}>
                    <input className="rp-input" type={showPw?"text":"password"}
                      value={password} onChange={e=>setPassword(e.target.value)}
                      placeholder="Min. 8 caratteri" required style={inp} />
                    <button type="button" onClick={()=>setShowPw(p=>!p)}
                      style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:MUTED, padding:2 }}>
                      {showPw
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  <StrengthBar password={password} />
                </div>

                {/* Conferma */}
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".12em", display:"block", marginBottom:6 }}>
                    Conferma password
                  </label>
                  <input className="rp-input" type={showPw?"text":"password"}
                    value={confirm} onChange={e=>setConfirm(e.target.value)}
                    placeholder="Ripeti la password" required
                    style={{ ...inp, borderColor: confirm && confirm!==password?"#dc2626":"rgba(0,0,0,.1)" }} />
                  {confirm && confirm !== password && (
                    <p style={{ fontSize:11, color:"#dc2626", margin:"4px 0 0", fontWeight:600 }}>Le password non coincidono</p>
                  )}
                  {confirm && confirm === password && (
                    <p style={{ fontSize:11, color:"#16a34a", margin:"4px 0 0", fontWeight:600 }}>✓ Le password coincidono</p>
                  )}
                </div>

                {/* Requisiti */}
                <div style={{ background:"rgba(0,0,0,.03)", borderRadius:10, padding:"10px 14px" }}>
                  {[
                    ["Almeno 8 caratteri",       password.length>=8],
                    ["Una lettera maiuscola",     /[A-Z]/.test(password)],
                    ["Un numero",                 /[0-9]/.test(password)],
                    ["Un carattere speciale",     /[^A-Za-z0-9]/.test(password)],
                  ].map(([label,ok])=>(
                    <div key={label} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="5" fill={ok?"#16a34a":"rgba(0,0,0,.12)"}/>
                        {ok && <path d="M3 6l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
                      </svg>
                      <span style={{ fontSize:12, color:ok?"#16a34a":MUTED, fontWeight:ok?700:400 }}>{label}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{ background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.2)", borderRadius:10, padding:"10px 14px" }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"#dc2626", margin:0 }}>{error}</p>
                  </div>
                )}

                <button type="submit" className="rp-btn"
                  disabled={loading || password!==confirm || password.length<8}
                  style={{
                    background:O, color:"white", border:"none", borderRadius:100, padding:"13px",
                    fontWeight:800, fontSize:15, cursor:loading?"not-allowed":"pointer",
                    fontFamily:"'Manrope',system-ui,sans-serif",
                    opacity: loading||password!==confirm||password.length<8 ? .6 : 1,
                    transition:"all .2s", boxShadow:`0 8px 24px ${O}35`,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  }}>
                  {loading ? (
                    <>
                      <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
                      Aggiornamento...
                    </>
                  ) : "Imposta nuova password →"}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,.25)", marginTop:24 }}>
          © 2026 TuttoEvento ·{" "}
          <Link href="/privacy" style={{ color:"rgba(255,255,255,.35)", textDecoration:"none" }}>Privacy</Link>
        </p>
      </div>
    </main>
  );
}