"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const C = {
  orange: "#ff5a00",
  ink: "#0a0a0b",
  paper: "#fbfaf8",
  muted: "#6b6b73",
  white: "#ffffff",
};

const ROLES = [
  { id: "organizer", label: "Locale", icon: "🏛️", desc: "Gestisci serate e trova artisti" },
  { id: "artist", label: "Artista", icon: "🎤", desc: "Fatti trovare dai locali giusti" },
  { id: "promoter", label: "Promoter", icon: "📣", desc: "Gestisci il tuo portfolio" },
];

const MODES = [
  { id: "self_service", label: "Gestione Autonoma", desc: "Organizzo gli eventi in autonomia." },
  { id: "managed", label: "Gestione TuttoEvento", desc: "Voglio un referente dedicato." },
  { id: "both", label: "Entrambe", desc: "Deciderò di volta in volta." },
];

const TERMS = {
  organizer: "/termini/locali",
  artist: "/termini/artisti",
  promoter: "/termini/promoter",
};

const FEATURES = [
  { icon: "💬", text: "Chat in tempo reale" },
  { icon: "📅", text: "Gestione booking" },
  { icon: "📊", text: "CRM e analitiche" },
  { icon: "🔔", text: "Notifiche push" },
];

function validatePassword(pw) {
  const errors = [];
  if (!pw || pw.length < 8)           errors.push("Almeno 8 caratteri");
  if (!/[A-Z]/.test(pw))              errors.push("Una lettera maiuscola");
  if (!/[0-9]/.test(pw))              errors.push("Un numero");
  if (!/[^A-Za-z0-9]/.test(pw))       errors.push("Un carattere speciale (!@#$%...)");
  return errors;
}

function Input({ label, type = "text", placeholder, value, onChange, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: focused ? C.white : C.paper,
          border: `1.5px solid ${focused ? C.orange : "rgba(0,0,0,.12)"}`,
          borderRadius: 16, padding: "13px 16px", fontSize: 15, color: C.ink,
          outline: "none", boxSizing: "border-box", transition: "all .2s",
          boxShadow: focused ? `0 0 0 3px rgba(255,90,0,.1)` : "none", fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qr = searchParams.get("role");

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [role, setRole]           = useState(["artist","promoter","organizer"].includes(qr) ? qr : "organizer");
  const [businessMode, setBusinessMode] = useState("both");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState(1);
  const [showPwd, setShowPwd]     = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // ── REFERRAL ──────────────────────────────────────────────
  const [referralCode, setReferralCode]   = useState("");
  const [promoterName, setPromoterName]   = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;
    setReferralCode(ref.toUpperCase());
    fetch(`/api/referral/resolve?code=${ref}`)
      .then(r => r.json())
      .then(d => { if (d.promoterName) setPromoterName(d.promoterName); })
      .catch(() => {});
  }, [searchParams]);
  // ─────────────────────────────────────────────────────────

  async function handleRegister(e) {
    e.preventDefault();
    setFormError("");
    if (!termsAccepted) { setFormError("Devi accettare i termini e condizioni."); return; }
    const pwErrs = validatePassword(password);
    if (pwErrs.length > 0) { setFormError("Password: " + pwErrs[0]); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role, businessMode, termsAccepted,
          referralCode: referralCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Errore durante la registrazione."); setLoading(false); return; }
      setFormSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch { setFormError("Errore di rete. Riprova."); }
    finally { setLoading(false); }
  }

  const pwErrors = validatePassword(password);
  const canGoStep2 = name.trim() && email.trim() && pwErrors.length === 0;
  const selectedRole = ROLES.find(r => r.id === role);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::placeholder { color: #9a9ab0; }
        @keyframes floatGlow { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-30px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .reg-root { min-height:100vh; background:#0a0a0b; font-family:'Manrope',system-ui,sans-serif; display:flex; flex-direction:column; position:relative; overflow:hidden; }
        .reg-glow { position:absolute; top:-200px; left:50%; transform:translateX(-50%); width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(255,90,0,.35),transparent 70%); filter:blur(80px); pointer-events:none; animation:floatGlow 10s ease-in-out infinite; }
        .reg-glow2 { position:absolute; bottom:-100px; right:-100px; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(255,90,0,.15),transparent 70%); filter:blur(60px); pointer-events:none; }
        .reg-grid { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
        .reg-left { display:flex; flex-direction:column; justify-content:center; padding:60px 48px; position:relative; z-index:1; }
        .reg-right { background:rgba(255,255,255,.97); display:flex; flex-direction:column; justify-content:center; padding:48px 40px; position:relative; z-index:1; overflow-y:auto; }
        .reg-card { animation:fadeUp .4s ease; }
        .reg-logo { font-family:'Sora',sans-serif; font-weight:900; font-size:1.3rem; letter-spacing:-.04em; color:#fff; text-decoration:none; display:inline-block; margin-bottom:48px; }
        .reg-logo span { color:#ff5a00; }
        .reg-headline { font-family:'Sora',sans-serif; font-size:clamp(2rem,4vw,3.2rem); font-weight:900; color:#fff; letter-spacing:-.04em; line-height:1.05; margin-bottom:16px; }
        .reg-headline em { color:#ff5a00; font-style:normal; }
        .reg-sub { color:rgba(255,255,255,.55); font-size:1rem; line-height:1.7; margin-bottom:40px; max-width:380px; }
        .reg-features { display:flex; flex-direction:column; gap:12px; }
        .reg-feat { display:flex; align-items:center; gap:12px; }
        .reg-feat-icon { width:36px; height:36px; border-radius:10px; background:rgba(255,90,0,.15); border:1px solid rgba(255,90,0,.25); display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
        .reg-feat-text { color:rgba(255,255,255,.7); font-size:.9rem; font-weight:600; }
        .reg-trust { margin-top:40px; display:flex; gap:20px; flex-wrap:wrap; }
        .reg-trust-item { display:flex; align-items:center; gap:6px; color:rgba(255,255,255,.35); font-size:.78rem; font-weight:600; }
        .reg-trust-item span:first-child { color:#16a34a; }
        .reg-steps { display:flex; gap:6px; margin-bottom:28px; }
        .reg-step { flex:1; height:3px; border-radius:3px; transition:background .3s; }
        .reg-form-title { font-family:'Sora',sans-serif; font-size:1.6rem; font-weight:900; color:#0a0a0b; letter-spacing:-.03em; margin-bottom:4px; }
        .reg-form-sub { color:#6b6b73; font-size:.875rem; margin-bottom:24px; }
        .reg-role-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
        .reg-role-btn { border:1.5px solid rgba(0,0,0,.1); border-radius:16px; padding:14px 8px; text-align:center; cursor:pointer; transition:all .2s; background:#fbfaf8; }
        .reg-role-btn.active { background:#ff5a00; border-color:#ff5a00; color:#fff; box-shadow:0 10px 30px rgba(255,90,0,.3); }
        .reg-role-icon { font-size:1.5rem; margin-bottom:4px; }
        .reg-role-label { font-size:.85rem; font-weight:800; }
        .reg-role-desc { font-size:.7rem; opacity:.7; margin-top:2px; line-height:1.3; }
        .reg-mode-btn { width:100%; border:1.5px solid rgba(0,0,0,.1); border-radius:14px; padding:12px 14px; text-align:left; cursor:pointer; transition:all .2s; background:#fbfaf8; margin-bottom:8px; display:flex; align-items:flex-start; gap:10px; }
        .reg-mode-btn.active { background:#ff5a00; border-color:#ff5a00; }
        .reg-mode-radio { width:18px; height:18px; border-radius:50%; border:2px solid; margin-top:1px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .reg-mode-radio-inner { width:8px; height:8px; border-radius:50%; }
        .reg-checkbox-wrap { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; background:#f5f5f6; border-radius:14px; margin-bottom:20px; }
        .reg-checkbox { width:18px; height:18px; accent-color:#ff5a00; flex-shrink:0; margin-top:1px; cursor:pointer; }
        .reg-checkbox-label { font-size:.85rem; color:#6b6b73; line-height:1.5; }
        .reg-checkbox-label a { color:#ff5a00; font-weight:700; }
        .reg-btn-primary { width:100%; background:#ff5a00; color:#fff; border:none; border-radius:14px; padding:15px; font-size:1rem; font-weight:800; cursor:pointer; transition:all .25s; font-family:'Manrope',sans-serif; box-shadow:0 12px 30px rgba(255,90,0,.35); }
        .reg-btn-primary:hover:not(:disabled) { background:#e85100; transform:translateY(-1px); }
        .reg-btn-primary:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .reg-btn-secondary { width:100%; background:rgba(0,0,0,.05); color:#0a0a0b; border:none; border-radius:14px; padding:13px; font-size:.95rem; font-weight:700; cursor:pointer; font-family:'Manrope',sans-serif; margin-top:10px; transition:all .2s; }
        .reg-btn-secondary:hover { background:rgba(0,0,0,.09); }
        .reg-login-link { text-align:center; font-size:.875rem; color:#6b6b73; margin-top:16px; }
        .reg-login-link a { color:#ff5a00; font-weight:700; text-decoration:none; }
        .reg-spinner { width:20px; height:20px; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; vertical-align:middle; margin-right:8px; }
        .reg-pwd-wrap { position:relative; margin-bottom:16px; }
        .reg-pwd-wrap label { display:block; font-size:13px; font-weight:700; color:#0a0a0b; margin-bottom:6px; }
        .reg-pwd-input { width:100%; background:#fbfaf8; border:1.5px solid rgba(0,0,0,.12); border-radius:16px; padding:13px 46px 13px 16px; font-size:15px; color:#0a0a0b; outline:none; box-sizing:border-box; font-family:inherit; transition:all .2s; }
        .reg-pwd-input:focus { background:#fff; border-color:#ff5a00; box-shadow:0 0 0 3px rgba(255,90,0,.1); }
        .reg-pwd-toggle { position:absolute; right:14px; top:38px; background:none; border:none; cursor:pointer; color:#9a9ab0; font-size:.85rem; font-weight:700; }
        .reg-strength { display:flex; gap:4px; margin-top:6px; }
        .reg-strength-bar { flex:1; height:3px; border-radius:3px; transition:background .3s; }
        .reg-strength-label { font-size:.72rem; font-weight:700; margin-top:3px; }
        .reg-referral-banner { display:flex; align-items:center; gap:8px; background:rgba(255,90,0,.08); border:1px solid rgba(255,90,0,.2); border-radius:12px; padding:10px 14px; margin-bottom:18px; }
        @media(max-width:900px) {
          .reg-grid { grid-template-columns:1fr; }
          .reg-left { display:none; }
          .reg-right { padding:32px 20px; min-height:100vh; }
        }
      `}</style>

      <div className="reg-root">
        <div className="reg-glow" />
        <div className="reg-glow2" />

        <div className="reg-grid">
          {/* LATO SINISTRO */}
          <div className="reg-left">
            <Link href="/" className="reg-logo">TUTTO<span>EVENTO</span></Link>
            <h1 className="reg-headline">Il tuo prossimo<br/><em>show</em><br/>inizia qui.</h1>
            <p className="reg-sub">La piattaforma italiana per artisti, locali e promoter.<br/>Booking semplice, chat realtime, CRM completo.</p>
            <div className="reg-features">
              {FEATURES.map(f => (
                <div key={f.text} className="reg-feat">
                  <div className="reg-feat-icon">{f.icon}</div>
                  <span className="reg-feat-text">{f.text}</span>
                </div>
              ))}
            </div>
            <div className="reg-trust">
              {["100% gratuito","Nessuna carta","GDPR compliant","Made in Italy 🇮🇹"].map(t => (
                <div key={t} className="reg-trust-item"><span>✓</span><span>{t}</span></div>
              ))}
            </div>
          </div>

          {/* LATO DESTRO */}
          <div className="reg-right">
            <div className="reg-card">

              {/* ── Banner referral ── */}
              {promoterName && (
                <div className="reg-referral-banner">
                  <span style={{ fontSize:18 }}>🤝</span>
                  <p style={{ fontSize:13, fontWeight:700, color:"#ff5a00", margin:0, fontFamily:"Manrope,system-ui,sans-serif" }}>
                    Invitato da <strong>{promoterName}</strong>
                  </p>
                </div>
              )}

              {/* Progress steps */}
              <div className="reg-steps">
                {[1,2,3].map(s => (
                  <div key={s} className="reg-step" style={{ background: s <= step ? C.orange : "rgba(0,0,0,.1)" }} />
                ))}
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <>
                  <p className="reg-form-title">Crea il tuo account</p>
                  <p className="reg-form-sub">Registrati gratis in 2 minuti. Nessuna carta richiesta.</p>
                  <Input label="Nome completo" placeholder="Mario Rossi" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                  <Input label="Email" type="email" placeholder="nome@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                  <div className="reg-pwd-wrap">
                    <label>Password</label>
                    <input type={showPwd ? "text" : "password"} placeholder="Min 8 car., 1 maiuscola, 1 numero, 1 simbolo"
                      value={password} onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password" className="reg-pwd-input" />
                    <button type="button" className="reg-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? "Nascondi" : "Mostra"}
                    </button>
                    {password.length > 0 && (
                      <>
                        <div className="reg-strength">
                          {[0,1,2,3].map(n => (
                            <div key={n} className="reg-strength-bar"
                              style={{ background: n < (4 - pwErrors.length) ? (pwErrors.length===0?"#16a34a":pwErrors.length<=2?"#f59e0b":"#dc2626") : "rgba(0,0,0,.08)" }} />
                          ))}
                        </div>
                        <p className="reg-strength-label" style={{ color: pwErrors.length===0?"#16a34a":"#f59e0b" }}>
                          {pwErrors.length===0 ? "Password sicura ✓" : pwErrors[0]}
                        </p>
                      </>
                    )}
                  </div>
                  {formError && step === 1 && (
                    <div style={{ background:"rgba(220,38,38,.1)", border:"1px solid rgba(220,38,38,.25)", borderRadius:14, padding:"10px 14px", fontSize:13, color:"#fca5a5", fontWeight:600, marginBottom:4 }}>
                      {formError}
                    </div>
                  )}
                  <button className="reg-btn-primary" disabled={!canGoStep2} onClick={() => { setFormError(""); setStep(2); }}>
                    Continua →
                  </button>
                  <div className="reg-login-link">Hai già un account? <Link href="/login">Accedi</Link></div>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  <p className="reg-form-title">Sei un...</p>
                  <p className="reg-form-sub">Scegli la categoria che ti descrive meglio.</p>
                  <div className="reg-role-grid">
                    {ROLES.map(r => (
                      <div key={r.id} className={`reg-role-btn${role === r.id ? " active" : ""}`} onClick={() => setRole(r.id)}>
                        <div className="reg-role-icon">{r.icon}</div>
                        <div className="reg-role-label">{r.label}</div>
                        <div className="reg-role-desc">{r.desc}</div>
                      </div>
                    ))}
                  </div>
                  {role === "organizer" && (
                    <div style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 10 }}>Come vuoi gestire gli eventi?</p>
                      {MODES.map(m => {
                        const active = businessMode === m.id;
                        return (
                          <button key={m.id} className={`reg-mode-btn${active ? " active" : ""}`} onClick={() => setBusinessMode(m.id)}>
                            <div className="reg-mode-radio" style={{ borderColor: active ? "#fff" : "rgba(0,0,0,.25)" }}>
                              {active && <div className="reg-mode-radio-inner" style={{ background:"#fff" }} />}
                            </div>
                            <div>
                              <p style={{ fontSize:".85rem", fontWeight:800, color:active?"#fff":C.ink, margin:0 }}>{m.label}</p>
                              <p style={{ fontSize:".75rem", color:active?"rgba(255,255,255,.75)":C.muted, margin:"2px 0 0" }}>{m.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <button className="reg-btn-primary" onClick={() => setStep(3)}>Continua →</button>
                  <button className="reg-btn-secondary" onClick={() => setStep(1)}>← Indietro</button>
                </>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <form onSubmit={handleRegister}>
                  <p className="reg-form-title">Quasi fatto!</p>
                  <p className="reg-form-sub">Controlla il riepilogo e accetta i termini.</p>
                  <div style={{ background:"#f5f5f6", borderRadius:16, padding:"16px 18px", marginBottom:20 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".1em", marginBottom:10 }}>Riepilogo</p>
                    {[["Nome",name],["Email",email],["Ruolo",selectedRole?.icon+" "+selectedRole?.label],
                      ...(referralCode ? [["Invitato da", promoterName || referralCode]] : [])
                    ].map(([k,v]) => (
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                        <span style={{ color:C.muted, fontWeight:600 }}>{k}</span>
                        <span style={{ fontWeight:800, color:k==="Invitato da"?"#ff5a00":C.ink }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="reg-checkbox-wrap">
                    <input type="checkbox" className="reg-checkbox" checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)} id="terms" />
                    <label htmlFor="terms" className="reg-checkbox-label">
                      Dichiaro di aver letto e accettato i{" "}
                      <a href={TERMS[role]||TERMS.organizer} target="_blank" rel="noopener noreferrer">termini e condizioni</a>{" "}
                      di TuttoEvento.
                    </label>
                  </div>
                  {formError && (
                    <div style={{ background:"rgba(220,38,38,.1)", border:"1px solid rgba(220,38,38,.25)", borderRadius:14, padding:"10px 14px", fontSize:13, color:"#fca5a5", fontWeight:600, marginBottom:4 }}>
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div style={{ background:"rgba(22,163,74,.1)", border:"1px solid rgba(22,163,74,.25)", borderRadius:14, padding:"10px 14px", fontSize:13, color:"#86efac", fontWeight:600, marginBottom:4 }}>
                      ✓ Account creato! Reindirizzamento al login...
                    </div>
                  )}
                  <button type="submit" className="reg-btn-primary" disabled={loading||!termsAccepted||formSuccess}>
                    {loading ? <><span className="reg-spinner"/>Creazione account...</> : "🎉 Crea account gratis"}
                  </button>
                  <button type="button" className="reg-btn-secondary" onClick={() => setStep(2)}>← Indietro</button>
                  <div className="reg-login-link">Hai già un account? <Link href="/login">Accedi</Link></div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100vh", background:"#0a0a0b", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:40, height:40, border:"3px solid rgba(255,90,0,.3)", borderTopColor:"#ff5a00", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto" }} />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}