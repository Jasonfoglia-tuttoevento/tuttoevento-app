"use client";

import { useState } from "react";

const ORANGE = "#ff5a00";
const INK    = "#0a0a0b";
const MUTED  = "#6b6b73";

function validatePassword(pw) {
  const e = [];
  if (!pw || pw.length < 8)          e.push("Almeno 8 caratteri");
  if (!/[A-Z]/.test(pw))             e.push("Una lettera maiuscola");
  if (!/[0-9]/.test(pw))             e.push("Un numero");
  if (!/[^A-Za-z0-9]/.test(pw))      e.push("Un carattere speciale");
  return e;
}

function PasswordStrength({ pw }) {
  if (!pw) return null;
  const err = validatePassword(pw);
  const score = 4 - err.length;
  const colors = ["#dc2626","#f97316","#eab308","#16a34a"];
  const labels = ["Troppo debole","Debole","Buona","Ottima"];
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:"flex", gap:3, marginBottom:4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex:1, height:2, borderRadius:1, background: i < score ? colors[score-1] : "rgba(0,0,0,.08)", transition:"background .2s" }} />
        ))}
      </div>
      <p style={{ fontSize:11, color: score > 0 ? colors[score-1] : MUTED, fontWeight:700, margin:0 }}>
        {score > 0 ? labels[score-1] : ""}
        {err.length > 0 && score < 4 && <span style={{ color:MUTED, fontWeight:400 }}> · {err[0]}</span>}
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'Manrope',system-ui,sans-serif" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background:"#f5f5f6", border:"1px solid rgba(0,0,0,.08)", borderRadius:12,
  padding:"11px 14px", fontSize:14, fontFamily:"'Manrope',system-ui,sans-serif",
  outline:"none", width:"100%", color:INK, transition:"border-color .2s",
};

export default function AccountSettings({ user }) {
  // Profilo
  const [name, setName]     = useState(user?.name || "");
  const [saveMsg, setSaveMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [pwOpen, setPwOpen]   = useState(false);
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw]     = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwMsg, setPwMsg]     = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const pwErrors = validatePassword(newPw);
  const canSavePw = current && newPw && confirm && pwErrors.length === 0 && newPw === confirm;
  const plan = user?.plan || "free";

  async function saveProfile(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingProfile(true); setSaveMsg("");
    const res = await fetch("/api/account/profile", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name }),
    });
    setSaveMsg(res.ok ? "✓ Salvato" : "Errore aggiornamento");
    setSavingProfile(false);
  }

  async function savePassword(e) {
    e.preventDefault();
    if (!canSavePw) return;
    setSavingPw(true); setPwMsg("");
    const res = await fetch("/api/account/password", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ currentPassword:current, newPassword:newPw }),
    });
    const d = await res.json();
    if (res.ok) {
      setPwMsg("✓ Password aggiornata");
      setCurrent(""); setNewPw(""); setConfirm("");
      setTimeout(() => setPwOpen(false), 1500);
    } else {
      setPwMsg(d.error || "Errore aggiornamento");
    }
    setSavingPw(false);
  }

  return (
    <div style={{ maxWidth:640, display:"flex", flexDirection:"column", gap:16 }}>

      {/* ── Profilo ── */}
      <div style={{ background:"white", borderRadius:20, padding:"24px", border:"1px solid rgba(0,0,0,.06)" }}>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.1rem", letterSpacing:"-.02em", color:INK, margin:"0 0 20px" }}>
          Profilo
        </h2>

        {/* Avatar grande */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:`linear-gradient(135deg,${ORANGE},#ff8246)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"white", flexShrink:0 }}>
            {(name||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
          </div>
          <div>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.1rem", color:INK, margin:0 }}>{name || "—"}</p>
            <p style={{ fontSize:13, color:MUTED, margin:"3px 0 0" }}>{user?.email}</p>
            <span style={{ display:"inline-block", marginTop:6, fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:100, background: plan==="pro"?`${ORANGE}15`:"rgba(0,0,0,.05)", color: plan==="pro"?ORANGE:MUTED, border:`1px solid ${plan==="pro"?`${ORANGE}25`:"rgba(0,0,0,.08)"}` }}>
              Piano {plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>
        </div>

        <form onSubmit={saveProfile} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field label="Nome visualizzato">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Il tuo nome"
              style={inputStyle}
              onFocus={e=>e.target.style.borderColor=ORANGE}
              onBlur={e=>e.target.style.borderColor="rgba(0,0,0,.08)"} />
          </Field>
          <Field label="Email">
            <input value={user?.email||""} disabled style={{ ...inputStyle, opacity:.5, cursor:"not-allowed" }} />
            <p style={{ fontSize:11, color:MUTED, margin:0 }}>L'email non può essere modificata da qui.</p>
          </Field>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button type="submit" disabled={savingProfile || !name.trim()}
              style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"10px 24px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", opacity:savingProfile||!name.trim()?.5:1, transition:"all .2s" }}>
              {savingProfile ? "Salvataggio..." : "Salva"}
            </button>
            {saveMsg && <p style={{ fontSize:13, fontWeight:700, color:saveMsg.startsWith("✓")?"#16a34a":"#dc2626", margin:0 }}>{saveMsg}</p>}
          </div>
        </form>
      </div>

      {/* ── Sicurezza ── */}
      <div style={{ background:"white", borderRadius:20, border:"1px solid rgba(0,0,0,.06)", overflow:"hidden" }}>
        <button onClick={() => setPwOpen(p=>!p)}
          style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px", background:"none", border:"none", cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", textAlign:"left" }}>
          <div>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.05rem", color:INK, margin:0 }}>Sicurezza</p>
            <p style={{ fontSize:13, color:MUTED, margin:"3px 0 0" }}>Modifica la tua password</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: pwOpen?"rotate(180deg)":"none", transition:"transform .25s", flexShrink:0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {pwOpen && (
          <div style={{ padding:"0 24px 24px", borderTop:"1px solid rgba(0,0,0,.05)" }}>
            <form onSubmit={savePassword} style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:20 }}>
              <Field label="Password attuale">
                <input type="password" value={current} onChange={e=>setCurrent(e.target.value)}
                  placeholder="Inserisci la password attuale" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor=ORANGE}
                  onBlur={e=>e.target.style.borderColor="rgba(0,0,0,.08)"} />
              </Field>

              <Field label="Nuova password">
                <div style={{ position:"relative" }}>
                  <input type={showNew?"text":"password"} value={newPw} onChange={e=>setNewPw(e.target.value)}
                    placeholder="Min 8 car., 1 maiuscola, 1 numero, 1 simbolo"
                    style={{ ...inputStyle, paddingRight:80 }}
                    onFocus={e=>e.target.style.borderColor=ORANGE}
                    onBlur={e=>e.target.style.borderColor="rgba(0,0,0,.08)"} />
                  <button type="button" onClick={()=>setShowNew(p=>!p)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:12, fontWeight:700, color:MUTED, fontFamily:"'Manrope',system-ui,sans-serif" }}>
                    {showNew?"Nascondi":"Mostra"}
                  </button>
                </div>
                <PasswordStrength pw={newPw} />
              </Field>

              <Field label="Conferma password">
                <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                  placeholder="Ripeti la nuova password" style={{ ...inputStyle, borderColor: confirm && newPw !== confirm ? "#dc2626" : "rgba(0,0,0,.08)" }}
                  onFocus={e=>e.target.style.borderColor= confirm && newPw!==confirm ? "#dc2626" : ORANGE}
                  onBlur={e=>e.target.style.borderColor= confirm && newPw!==confirm ? "#dc2626" : "rgba(0,0,0,.08)"} />
                {confirm && newPw !== confirm && <p style={{ fontSize:11, color:"#dc2626", fontWeight:700, margin:0 }}>Le password non coincidono</p>}
                {confirm && newPw === confirm && newPw && <p style={{ fontSize:11, color:"#16a34a", fontWeight:700, margin:0 }}>✓ Coincidono</p>}
              </Field>

              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <button type="submit" disabled={savingPw || !canSavePw}
                  style={{ background:ORANGE, color:"white", border:"none", borderRadius:100, padding:"10px 24px", fontWeight:700, fontSize:13, cursor:canSavePw?"pointer":"not-allowed", fontFamily:"'Manrope',system-ui,sans-serif", opacity:!canSavePw?.4:1, transition:"all .2s" }}>
                  {savingPw ? "Aggiornamento..." : "Aggiorna password"}
                </button>
                {pwMsg && <p style={{ fontSize:13, fontWeight:700, color:pwMsg.startsWith("✓")?"#16a34a":"#dc2626", margin:0 }}>{pwMsg}</p>}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Piano ── */}
      {plan === "free" && (
        <div style={{ background:"white", borderRadius:20, padding:"20px 24px", border:`1px solid rgba(0,0,0,.06)` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.05rem", color:INK, margin:0 }}>Piano attivo</p>
              <p style={{ fontSize:13, color:MUTED, margin:"4px 0 0" }}>Stai usando il piano gratuito.</p>
            </div>
            <div style={{ background:"rgba(255,90,0,.06)", border:"1px solid rgba(255,90,0,.15)", borderRadius:14, padding:"10px 16px", fontSize:12, color:ORANGE, fontWeight:700 }}>
              Upgrade disponibile a breve
            </div>
          </div>
        </div>
      )}
    </div>
  );
}