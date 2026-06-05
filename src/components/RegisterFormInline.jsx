// Componente form registrazione inline — importabile nelle landing
// Usage: <RegisterFormInline role="artist" /> oppure role="organizer"
"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterFormInline({ role = "artist", dark = true }) {
  const [step, setStep]     = useState(1);
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [password, setPass] = useState("");
  const [extra, setExtra]   = useState(""); // stageName per artisti, venueName per locali
  const [loading, setLoad]  = useState(false);
  const [msg, setMsg]       = useState("");
  const [done, setDone]     = useState(false);

  const isArtist = role === "artist";
  const bg = dark ? "rgba(255,255,255,.07)" : "#fbfaf8";
  const border = dark ? "1px solid rgba(255,255,255,.15)" : "1px solid rgba(0,0,0,.1)";
  const textColor = dark ? "white" : "#0a0a0b";
  const mutedColor = dark ? "rgba(255,255,255,.5)" : "#6b6b73";

  const inp = { background:bg, border, borderRadius:14, padding:"12px 16px", fontSize:14, color:textColor, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", width:"100%", transition:"border-color .2s" };
  const focusColor = "#ff5a00";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) { setMsg("Compila tutti i campi obbligatori"); return; }
    setLoad(true); setMsg("");
    try {
      const res = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, stageName: isArtist ? extra : undefined, venueName: !isArtist ? extra : undefined }),
      });
      const d = await res.json();
      if (!res.ok) { setMsg(d.error || "Errore registrazione"); setLoad(false); return; }
      setDone(true);
    } catch { setMsg("Errore di rete"); }
    setLoad(false);
  }

  if (done) return (
    <div style={{ textAlign:"center", padding:"24px 0" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
      <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.1rem", color:textColor, margin:"0 0 8px" }}>Account creato!</h3>
      <p style={{ fontSize:13, color:mutedColor, marginBottom:16 }}>Controlla la tua email per confermare l'account.</p>
      <Link href="/dashboard" style={{ display:"inline-block", background:"#ff5a00", color:"white", borderRadius:100, padding:"11px 24px", fontWeight:800, fontSize:13, textDecoration:"none" }}>
        Vai alla dashboard →
      </Link>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {step === 1 && <>
        <input style={inp} placeholder="Nome e cognome *" value={name} onChange={e=>setName(e.target.value)} onFocus={e=>e.target.style.borderColor=focusColor} onBlur={e=>e.target.style.borderColor=dark?"rgba(255,255,255,.15)":"rgba(0,0,0,.1)"} />
        <input style={inp} type="email" placeholder="Email *" value={email} onChange={e=>setEmail(e.target.value)} onFocus={e=>e.target.style.borderColor=focusColor} onBlur={e=>e.target.style.borderColor=dark?"rgba(255,255,255,.15)":"rgba(0,0,0,.1)"} />
        <input style={inp} type="password" placeholder="Password *" value={password} onChange={e=>setPass(e.target.value)} onFocus={e=>e.target.style.borderColor=focusColor} onBlur={e=>e.target.style.borderColor=dark?"rgba(255,255,255,.15)":"rgba(0,0,0,.1)"} />
        <button type="button" onClick={()=>{ if(!name||!email||!password){setMsg("Compila tutti i campi");return;} setMsg(""); setStep(2); }}
          style={{ background:"#ff5a00", color:"white", border:"none", borderRadius:14, padding:"13px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
          Continua →
        </button>
      </>}
      {step === 2 && <>
        <input style={inp} placeholder={isArtist ? "Nome d'arte (opzionale)" : "Nome locale (opzionale)"} value={extra} onChange={e=>setExtra(e.target.value)} onFocus={e=>e.target.style.borderColor=focusColor} onBlur={e=>e.target.style.borderColor=dark?"rgba(255,255,255,.15)":"rgba(0,0,0,.1)"} />
        <div style={{ display:"flex", gap:8 }}>
          <button type="button" onClick={()=>setStep(1)}
            style={{ flex:1, background:dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.05)", color:textColor, border, borderRadius:14, padding:"12px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
            ← Indietro
          </button>
          <button type="submit" disabled={loading}
            style={{ flex:2, background:loading?"rgba(255,90,0,.5)":"#ff5a00", color:"white", border:"none", borderRadius:14, padding:"12px", fontWeight:800, fontSize:14, cursor:loading?"not-allowed":"pointer", fontFamily:"'Manrope',system-ui,sans-serif" }}>
            {loading ? "Creazione..." : "Crea account gratis"}
          </button>
        </div>
      </>}
      {msg && <p style={{ fontSize:11, color:"#fca5a5", fontWeight:700, margin:0 }}>{msg}</p>}
      <p style={{ fontSize:11, color:mutedColor, textAlign:"center", margin:0 }}>
        Già registrato? <Link href="/login" style={{ color:"#ff5a00", textDecoration:"none", fontWeight:700 }}>Accedi</Link>
      </p>
    </form>
  );
}