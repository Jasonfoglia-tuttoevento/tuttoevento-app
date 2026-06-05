"use client";

import { useEffect, useState, useRef } from "react";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

/* ─── Reveal hook ─────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0) scale(1)";
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Register form inline ────────────────────────────────── */
function RegisterForm() {
  const [step, setStep]       = useState(1);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [agency, setAgency]   = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");
  const [done, setDone]       = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) { setMsg("Compila tutti i campi obbligatori"); return; }
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "promoter", agencyName: agency }),
      });
      const d = await res.json();
      if (!res.ok) { setMsg(d.error || "Errore registrazione"); setLoading(false); return; }
      setDone(true);
    } catch { setMsg("Errore di rete"); }
    setLoading(false);
  }

  const inp = { background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.15)", borderRadius:14, padding:"13px 16px", fontSize:14, color:"white", fontFamily:"Manrope,system-ui,sans-serif", outline:"none", width:"100%", transition:"border-color .2s" };

  if (done) return (
    <div style={{ textAlign:"center", padding:"32px 20px" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
      <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.3rem", color:"white", margin:"0 0 8px" }}>Account creato!</h3>
      <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", marginBottom:20 }}>Controlla la tua email per confermare l'account.</p>
      <a href="/dashboard" style={{ display:"inline-block", background:ORANGE, color:"white", borderRadius:100, padding:"12px 28px", fontWeight:800, fontSize:14, textDecoration:"none", fontFamily:"Manrope,system-ui,sans-serif" }}>
        Vai alla dashboard →
      </a>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {step === 1 && <>
        <input style={inp} placeholder="Nome e cognome *" value={name} onChange={e=>setName(e.target.value)} onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.15)"} />
        <input style={inp} type="email" placeholder="Email professionale *" value={email} onChange={e=>setEmail(e.target.value)} onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.15)"} />
        <input style={inp} type="password" placeholder="Password *" value={password} onChange={e=>setPass(e.target.value)} onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.15)"} />
        <button type="button" onClick={()=>{if(!name||!email||!password){setMsg("Compila tutti i campi");return;}setMsg("");setStep(2);}}
          style={{ background:ORANGE, color:"white", border:"none", borderRadius:14, padding:"14px", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"Manrope,system-ui,sans-serif", transition:"all .2s" }}>
          Continua →
        </button>
      </>}
      {step === 2 && <>
        <input style={inp} placeholder="Nome agenzia / management (opzionale)" value={agency} onChange={e=>setAgency(e.target.value)} onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.15)"} />
        <div style={{ display:"flex", gap:8 }}>
          <button type="button" onClick={()=>setStep(1)}
            style={{ flex:1, background:"rgba(255,255,255,.07)", color:"white", border:"1px solid rgba(255,255,255,.15)", borderRadius:14, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"Manrope,system-ui,sans-serif" }}>
            ← Indietro
          </button>
          <button type="submit" disabled={loading}
            style={{ flex:2, background:loading?"rgba(255,90,0,.5)":ORANGE, color:"white", border:"none", borderRadius:14, padding:"13px", fontWeight:800, fontSize:15, cursor:loading?"not-allowed":"pointer", fontFamily:"Manrope,system-ui,sans-serif", transition:"all .2s" }}>
            {loading ? "Creazione..." : "Crea account gratis"}
          </button>
        </div>
      </>}
      {msg && <p style={{ fontSize:12, color:"#fca5a5", fontWeight:700, margin:0, fontFamily:"Manrope,system-ui,sans-serif" }}>{msg}</p>}
      <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", textAlign:"center", margin:0 }}>
        Creando un account accetti i nostri <a href="/termini/promoter" style={{ color:"rgba(255,255,255,.5)", textDecoration:"none" }}>Termini</a> e la <a href="/privacy" style={{ color:"rgba(255,255,255,.5)", textDecoration:"none" }}>Privacy Policy</a>
      </p>
    </form>
  );
}

/* ─── 3D Tilt card ─────────────────────────────────────────── */
function TiltCard({ children, style={} }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx:0, ry:0, gx:"50%", gy:"50%" });

  function onMove(e) {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ rx:(py-.5)*-14, ry:(px-.5)*16, gx:`${px*100}%`, gy:`${py*100}%` });
  }
  function onLeave() { setTilt({ rx:0, ry:0, gx:"50%", gy:"50%" }); }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transform:`perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition:"transform .3s cubic-bezier(.2,.7,.2,1)", transformStyle:"preserve-3d", position:"relative", ...style }}>
      <div style={{ position:"absolute", inset:0, borderRadius:"inherit", pointerEvents:"none", background:`radial-gradient(280px circle at ${tilt.gx} ${tilt.gy}, rgba(255,90,0,.12), transparent 60%)`, zIndex:1 }} />
      {children}
    </div>
  );
}

/* ─── Animated counter ────────────────────────────────────── */
function Counter({ target, suffix="" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const t = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(start));
      }, 16);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function LandingPromoter() {
  useReveal();
  const [openFaq, setOpenFaq] = useState(null);

  const FAQS = [
    { q:"Come funziona la mia commissione?", a:"TuttoEvento trattiene la differenza tra il prezzo pubblico pagato dal locale e il cachet netto dell'artista. Come promoter che ha portato l'artista sulla piattaforma, ricevi il 30% di questo margine per ogni booking confermato del tuo roster." },
    { q:"Quanti artisti posso inserire nel roster?", a:"Con il piano Free puoi gestire fino a 5 artisti e 3 locali. Con il piano Pro (€19,90/mese) il roster è illimitato, con commissioni personalizzabili per artista." },
    { q:"Come faccio a portare i miei artisti sulla piattaforma?", a:"Una volta registrato, vai nell'area Roster della tua dashboard e aggiungi gli artisti già iscritti a TuttoEvento. Se non sono ancora registrati, puoi invitarli condividendo il link di registrazione artisti." },
    { q:"Posso gestire attivamente le trattative?", a:"Con il piano Pro puoi spostare gli stati delle richieste (In attesa → In revisione → Connessi), agire come intermediario attivo tra locale e artista e impostare commissioni diverse per ogni artista." },
    { q:"Quando ricevo le commissioni?", a:"I pagamenti vengono elaborati mensilmente. Al momento siamo in fase di lancio — ti notificheremo quando il sistema di pagamento sarà attivo, con tutto lo storico già calcolato." },
  ];

  const rev = { opacity:0, transform:"translateY(32px) scale(0.98)", transition:"opacity .75s cubic-bezier(.2,.7,.2,1), transform .75s cubic-bezier(.2,.7,.2,1)" };

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-28px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(18px,14px)} }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes shimmer { to{background-position:-200% 0} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(160px) rotate(0deg)} to{transform:rotate(360deg) translateX(160px) rotate(-360deg)} }
        @keyframes orbit2 { from{transform:rotate(120deg) translateX(220px) rotate(-120deg)} to{transform:rotate(480deg) translateX(220px) rotate(-480deg)} }
        @keyframes orbit3 { from{transform:rotate(240deg) translateX(180px) rotate(-240deg)} to{transform:rotate(600deg) translateX(180px) rotate(-600deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        * { box-sizing:border-box; }
        html,body { margin:0; padding:0; overflow-x:hidden; }
        .lp-root { font-family:'Manrope',system-ui,sans-serif; background:#0a0a0b; color:white; min-height:100vh; overflow-x:hidden; }
        .lp-shimmer { background:linear-gradient(100deg,#ff5a00 0%,#ff8246 40%,#ffb98a 50%,#ff8246 60%,#ff5a00 100%); background-size:200% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:shimmer 5s linear infinite; }
        .lp-glass { background:rgba(255,255,255,.06); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.1); }
        .lp-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:24px; }
        .lp-cta { background:#ff5a00; color:white; border:none; border-radius:100px; padding:15px 32px; font-weight:800; font-size:.95rem; cursor:pointer; font-family:'Manrope',system-ui,sans-serif; transition:all .2s; text-decoration:none; display:inline-block; }
        .lp-cta:hover { background:#e85100; transform:scale(1.03); }
        .lp-ghost { background:rgba(255,255,255,.07); color:white; border:1px solid rgba(255,255,255,.15); border-radius:100px; padding:15px 32px; font-weight:700; font-size:.95rem; cursor:pointer; font-family:'Manrope',system-ui,sans-serif; transition:all .2s; text-decoration:none; display:inline-block; }
        .lp-ghost:hover { background:rgba(255,255,255,.13); }

        @media(max-width:768px) {
          .lp-nav-links { display:none!important; }
          .lp-footer-grid { grid-template-columns:1fr!important; gap:24px!important; }
        }
        @media(max-width:768px) { .lp-hero-grid{grid-template-columns:1fr!important} .lp-feat-grid{grid-template-columns:1fr!important} .lp-steps-grid{grid-template-columns:1fr!important} .lp-orbit{display:none!important} }
        @media(max-width:480px) { .lp-kpi-grid{grid-template-columns:1fr 1fr!important} }

        /* Nav mobile */
        .lp-nav-center { display:flex; gap:24px; align-items:center; }
        .lp-nav-login { display:flex; gap:8px; }
        /* Footer */
        .lp-footer-grid { display:grid; }
        
        @media(max-width:900px) {
          .lp-nav-center { display:none; }
        }
        @media(max-width:768px) {
          .lp-hero-grid { grid-template-columns:1fr!important; gap:32px!important; }
          .lp-feat-grid { grid-template-columns:1fr!important; }
          .lp-steps { grid-template-columns:1fr!important; }
          .lp-kpi-grid { grid-template-columns:1fr 1fr; gap:10px; }
          .lp-footer-grid { grid-template-columns:1fr!important; gap:20px!important; }
          .lp-orbit { display:none!important; }
        }
        @media(max-width:480px) {
          .lp-kpi-grid { grid-template-columns:1fr!important; }
        }
    
      `}</style>

      <div className="lp-root">

        {/* ── NAVBAR ── */}
        <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"12px 16px" }}>
          <div className="lp-glass" style={{ maxWidth:1100, margin:"0 auto", borderRadius:100, padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <a href="/" style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"1.1rem", letterSpacing:"-.04em", textDecoration:"none", color:"white" }}>
              TUTTO<span style={{ color:ORANGE }}>EVENTO</span>
            </a>
            <div style={{ display:"flex", gap:24, alignItems:"center" }} className="lp-nav-center">
              {[["#vantaggi","Vantaggi"],["#come-funziona","Come funziona"],["#commissioni","Commissioni"],["#faq","FAQ"]].map(([h,l]) => (
                <a key={h} href={h} style={{ fontSize:".875rem", fontWeight:600, color:"rgba(255,255,255,.6)", textDecoration:"none" }}>{l}</a>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <a href="/login" style={{ fontSize:".875rem", fontWeight:700, color:"rgba(255,255,255,.7)", textDecoration:"none", padding:"7px 14px" }}>Accedi</a>
              <a href="#registrati" className="lp-cta" style={{ padding:"8px 18px", fontSize:".85rem" }}>Inizia gratis</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden", paddingTop:80 }}>

          {/* Sfere glow */}
          <div aria-hidden style={{ position:"absolute", top:-120, left:"50%", width:800, height:800, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.3),rgba(255,130,70,.1) 50%,transparent 72%)", filter:"blur(120px)", animation:"float 9s ease-in-out infinite", pointerEvents:"none" }} />
          <div aria-hidden style={{ position:"absolute", top:200, right:-150, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,185,138,.25),transparent 70%)", filter:"blur(100px)", animation:"float2 12s ease-in-out infinite", pointerEvents:"none" }} />

          {/* Orbite decorative */}
          <div className="lp-orbit" style={{ position:"absolute", top:"50%", left:"62%", transform:"translate(-50%,-50%)", width:500, height:500, pointerEvents:"none", opacity:.6 }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px dashed rgba(255,90,0,.2)" }} />
            <div style={{ position:"absolute", inset:40, borderRadius:"50%", border:"1px dashed rgba(255,255,255,.08)" }} />
            <div style={{ position:"absolute", inset:80, borderRadius:"50%", border:"1px dashed rgba(255,90,0,.1)" }} />
            {/* Pianeti orbitanti */}
            {[
              { style:{ animation:"orbit 8s linear infinite" }, bg:"#ff5a00", label:"🎤", size:40 },
              { style:{ animation:"orbit2 12s linear infinite" }, bg:"rgba(255,255,255,.1)", label:"🏛️", size:36 },
              { style:{ animation:"orbit3 10s linear infinite" }, bg:"rgba(255,90,0,.3)", label:"💰", size:32 },
            ].map((o,i) => (
              <div key={i} style={{ position:"absolute", top:"50%", left:"50%", marginTop:-o.size/2, marginLeft:-o.size/2, ...o.style }}>
                <div style={{ width:o.size, height:o.size, borderRadius:"50%", background:o.bg, border:"1px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:o.size*.45 }}>
                  {o.label}
                </div>
              </div>
            ))}
          </div>

          {/* Contenuto hero */}
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", display:"grid", gridTemplateColumns:"1fr 420px", gap:60, alignItems:"center", position:"relative", zIndex:1, width:"100%" }} className="lp-hero-grid">

            <div>
              <div data-reveal style={{ ...rev, display:"inline-flex", alignItems:"center", gap:8, borderRadius:100, padding:"6px 16px", marginBottom:28, background:"rgba(255,90,0,.12)", border:"1px solid rgba(255,90,0,.25)" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:ORANGE, animation:"pulse 2s infinite", display:"inline-block" }} />
                <span style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:"rgba(255,255,255,.8)" }}>Per promoter e management · 2026</span>
              </div>

              <h1 data-reveal style={{ ...rev, fontFamily:"Sora,sans-serif", fontSize:"clamp(2.6rem,5.5vw,4.2rem)", fontWeight:900, lineHeight:1.0, letterSpacing:"-3px", margin:"0 0 24px", transitionDelay:".08s" }}>
                Porta i tuoi artisti<br/>dove vengono<br/><span className="lp-shimmer">cercati dai locali.</span>
              </h1>

              <p data-reveal style={{ ...rev, fontSize:"clamp(.95rem,2vw,1.15rem)", color:"rgba(255,255,255,.6)", lineHeight:1.7, marginBottom:36, maxWidth:540, transitionDelay:".16s" }}>
                TuttoEvento è il marketplace italiano per artisti e locali. Come promoter, inserisci il tuo roster, monitora le trattative e <strong style={{ color:"white" }}>guadagni il 30% del margine su ogni booking confermato.</strong>
              </p>

              <div data-reveal style={{ ...rev, display:"flex", gap:12, flexWrap:"wrap", marginBottom:40, transitionDelay:".24s" }}>
                <a href="#registrati" className="lp-cta" style={{ fontSize:"1rem", padding:"16px 34px" }}>Crea account gratis →</a>
                <a href="#come-funziona" className="lp-ghost" style={{ fontSize:"1rem", padding:"16px 28px" }}>Come funziona</a>
              </div>

              <div data-reveal style={{ ...rev, display:"flex", gap:20, flexWrap:"wrap", transitionDelay:".32s" }}>
                {["Roster illimitato (PRO)","Commissioni automatiche","Dashboard professionale","🇮🇹 Made in Italy"].map(t => (
                  <span key={t} style={{ fontSize:".78rem", fontWeight:600, color:"rgba(255,255,255,.45)", display:"flex", alignItems:"center", gap:4 }}>✓ {t}</span>
                ))}
              </div>
            </div>

            {/* Form registrazione nel hero */}
            <div data-reveal style={{ ...rev, transitionDelay:".2s" }}>
              <div id="registrati" className="lp-glass" style={{ borderRadius:28, padding:"32px 28px" }}>
                <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:ORANGE, marginBottom:6, fontFamily:"Manrope,system-ui,sans-serif" }}>Inizia subito</p>
                <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.3rem", letterSpacing:"-.03em", color:"white", margin:"0 0 20px" }}>Crea il tuo account promoter</h2>
                <RegisterForm />
              </div>
            </div>

          </div>
        </section>

        {/* ── TICKER ── */}
        <section style={{ background:"rgba(255,255,255,.03)", borderTop:"1px solid rgba(255,255,255,.06)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"16px 0", overflow:"hidden" }}>
          <div style={{ display:"flex", whiteSpace:"nowrap", animation:"marquee 28s linear infinite" }}>
            {["Management","Booking Agency","Talent Scout","Promoter","DJ Agency","Music Management","Artist Rep","Tour Booking","Event Agency","Live Music","Management","Booking Agency","Talent Scout","Promoter","DJ Agency","Music Management","Artist Rep","Tour Booking","Event Agency","Live Music"].map((item,i) => (
              <span key={i} style={{ margin:"0 24px", color:"rgba(255,255,255,.3)", fontSize:".8rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em" }}>{item}</span>
            ))}
          </div>
        </section>

        {/* ── KPI ── */}
        <section style={{ padding:"80px 20px" }}>
          <div style={{ maxWidth:1000, margin:"0 auto" }}>
            <div className="lp-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
              {[["30%","del margine TE","è tuo per ogni booking"],["+∞","artisti nel roster","con il piano Pro"],["0€","per iniziare","nessuna carta richiesta"],["100%","controllo","gestisci tu le trattative"]].map(([val,label,sub],i) => (
                <div key={i} data-reveal style={{ ...rev, transitionDelay:`${i*.07}s` }}>
                  <TiltCard style={{ borderRadius:22, height:"100%" }}>
                    <div className="lp-card" style={{ padding:"24px 20px", height:"100%", position:"relative", zIndex:2 }}>
                      <p style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"2.2rem", letterSpacing:"-2px", color: i===0?ORANGE:"white", margin:"0 0 6px" }}>{val}</p>
                      <p style={{ fontWeight:700, fontSize:".875rem", color:"white", margin:"0 0 4px" }}>{label}</p>
                      <p style={{ fontSize:".78rem", color:"rgba(255,255,255,.4)", margin:0 }}>{sub}</p>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VANTAGGI ── */}
        <section id="vantaggi" style={{ padding:"80px 20px", background:"rgba(255,255,255,.02)", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div data-reveal style={{ ...rev, textAlign:"center", marginBottom:56 }}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Pensato per chi gestisce talenti</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.1, margin:"0 0 12px" }}>Il tuo ufficio booking, digitale.</h2>
              <p style={{ fontSize:"1rem", color:"rgba(255,255,255,.5)", maxWidth:520, margin:"0 auto", lineHeight:1.7 }}>Tutto quello che ti serve per portare i tuoi artisti sul mercato e monetizzare le tue relazioni.</p>
            </div>

            <div className="lp-feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
              {[
                { icon:"🎤", title:"Roster professionale", desc:"Inserisci tutti i tuoi artisti con profili completi: foto, bio, generi, cachet, disponibilità. Un media kit digitale per ognuno.", delay:".05s" },
                { icon:"💰", title:"Commissioni automatiche", desc:"Ogni booking confermato dei tuoi artisti genera una commissione calcolata automaticamente. Estratto conto sempre aggiornato.", delay:".1s" },
                { icon:"🎯", title:"Gestione trattative attiva", desc:"Con il piano Pro sei coinvolto attivamente: segui ogni richiesta, muovi gli stati, fai da intermediario tra locale e artista.", delay:".15s" },
                { icon:"🏢", title:"Pagina agenzia pubblica", desc:"Crea la vetrina della tua agenzia nel marketplace: logo, bio, lista artisti rappresentati. I locali sanno chi sei.", delay:".2s" },
                { icon:"📊", title:"Analytics & reporting", desc:"Volume gestito, trend mensili, artisti più prenotati, commissioni per periodo. I dati che servono al tuo business.", delay:".25s" },
                { icon:"⚡", title:"Notifiche in tempo reale", desc:"Ogni nuova richiesta per un tuo artista arriva come push notification. Non perdi mai un'opportunità.", delay:".3s" },
              ].map(f => (
                <div key={f.title} data-reveal style={{ ...rev, transitionDelay:f.delay }}>
                  <TiltCard style={{ borderRadius:22, height:"100%" }}>
                    <div className="lp-card" style={{ padding:"26px 22px", height:"100%", position:"relative", zIndex:2, transition:"border-color .2s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,90,0,.3)"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.08)"}>
                      <div style={{ fontSize:"1.6rem", marginBottom:14 }}>{f.icon}</div>
                      <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1rem", color:"white", margin:"0 0 8px", letterSpacing:"-.02em" }}>{f.title}</h3>
                      <p style={{ fontSize:".875rem", color:"rgba(255,255,255,.5)", lineHeight:1.6, margin:0 }}>{f.desc}</p>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COME FUNZIONA ── */}
        <section id="come-funziona" style={{ padding:"80px 20px" }}>
          <div style={{ maxWidth:1000, margin:"0 auto" }}>
            <div data-reveal style={{ ...rev, textAlign:"center", marginBottom:56 }}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Processo semplice</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.1, margin:0 }}>Dalla registrazione ai guadagni.</h2>
            </div>

            <div className="lp-steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, position:"relative" }}>
              {/* Linea connettore */}
              <div style={{ position:"absolute", top:32, left:"12%", right:"12%", height:1, background:"linear-gradient(90deg,transparent,rgba(255,90,0,.4),transparent)", pointerEvents:"none" }} />

              {[
                { n:"01", icon:"✍️", title:"Crea l'account", desc:"Registrati come promoter. 2 minuti, nessuna carta richiesta." },
                { n:"02", icon:"🎤", title:"Aggiungi il roster", desc:"Inserisci i tuoi artisti già iscritti o invitali a registrarsi." },
                { n:"03", icon:"📬", title:"Monitora le richieste", desc:"Vedi ogni richiesta che arriva per i tuoi artisti in tempo reale." },
                { n:"04", icon:"💰", title:"Incassa le commissioni", desc:"Ogni booking confermato genera automaticamente la tua quota." },
              ].map((s,i) => (
                <div key={s.n} data-reveal style={{ ...rev, transitionDelay:`${i*.1}s` }}>
                  <div style={{ textAlign:"center", padding:"24px 16px", position:"relative" }}>
                    <div style={{ width:60, height:60, borderRadius:"50%", background:i===0?ORANGE:"rgba(255,255,255,.06)", border:`2px solid ${i===0?ORANGE:"rgba(255,255,255,.12)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", margin:"0 auto 14px", position:"relative", zIndex:1 }}>
                      {s.icon}
                    </div>
                    <p style={{ fontFamily:"Sora,sans-serif", fontSize:".7rem", fontWeight:700, color:ORANGE, letterSpacing:".1em", margin:"0 0 6px" }}>{s.n}</p>
                    <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1rem", color:"white", margin:"0 0 8px" }}>{s.title}</h3>
                    <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.45)", lineHeight:1.6, margin:0 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMISSIONI ── */}
        <section id="commissioni" style={{ padding:"80px 20px", background:"rgba(255,255,255,.02)", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }} className="lp-hero-grid">
            <div data-reveal style={rev}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Il modello economico</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.1, margin:"0 0 16px" }}>
                Guadagni sul margine<br/><span className="lp-shimmer">senza toccare il cachet.</span>
              </h2>
              <p style={{ fontSize:"1rem", color:"rgba(255,255,255,.55)", lineHeight:1.7, marginBottom:24 }}>
                TuttoEvento trattiene la differenza tra il prezzo pubblico pagato dal locale e il cachet netto dell'artista. Tu, come promoter che ha portato quell'artista, ricevi il <strong style={{ color:"white" }}>30% di questo margine</strong> — senza toccare il compenso dell'artista.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[["L'artista incassa", "il 100% del cachet concordato"],["Il locale paga","il prezzo pubblico"],["TuttoEvento","trattiene il margine (differenza)"],["Tu incassi","30% del margine TE"]].map(([label,val]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"rgba(255,255,255,.04)", borderRadius:12, border:"1px solid rgba(255,255,255,.07)" }}>
                    <span style={{ fontSize:".875rem", color:"rgba(255,255,255,.6)", fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:".875rem", fontWeight:700, color:label==="Tu incassi"?ORANGE:"white" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulatore commissione */}
            <div data-reveal style={{ ...rev, transitionDelay:".15s" }}>
              <CommissionSimulator />
            </div>
          </div>
        </section>

        {/* ── PIANI ── */}
        <section style={{ padding:"80px 20px" }}>
          <div style={{ maxWidth:800, margin:"0 auto" }}>
            <div data-reveal style={{ ...rev, textAlign:"center", marginBottom:48 }}>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.1, margin:0 }}>Piano semplice. Nessuna sorpresa.</h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="lp-hero-grid">
              {/* FREE */}
              <div data-reveal style={{ ...rev, transitionDelay:".05s" }}>
                <TiltCard style={{ borderRadius:24, height:"100%" }}>
                  <div className="lp-card" style={{ padding:"28px 24px", height:"100%", position:"relative", zIndex:2 }}>
                    <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".14em", color:"rgba(255,255,255,.45)", marginBottom:8 }}>Free</p>
                    <p style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"2.5rem", color:"white", margin:"0 0 4px", letterSpacing:"-2px" }}>€0</p>
                    <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.4)", marginBottom:20 }}>per sempre</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                      {["5 artisti nel roster","3 locali nel roster","Vista richieste (sola lettura)","Chat con il team TuttoEvento","Overview booking e commissioni","Pagina agenzia base"].map(f => (
                        <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:".875rem", color:"rgba(255,255,255,.7)" }}>
                          <span style={{ color:"#22c55e", fontWeight:700 }}>✓</span>{f}
                        </div>
                      ))}
                    </div>
                    <a href="#registrati" className="lp-ghost" style={{ display:"block", textAlign:"center", width:"100%" }}>Inizia gratis</a>
                  </div>
                </TiltCard>
              </div>
              {/* PRO */}
              <div data-reveal style={{ ...rev, transitionDelay:".12s" }}>
                <TiltCard style={{ borderRadius:24, height:"100%" }}>
                  <div style={{ background:"rgba(255,90,0,.08)", border:"2px solid rgba(255,90,0,.4)", borderRadius:24, padding:"28px 24px", height:"100%", position:"relative", zIndex:2 }}>
                    <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:ORANGE, color:"white", borderRadius:100, padding:"4px 16px", fontSize:11, fontWeight:800, whiteSpace:"nowrap" }}>Più scelto</div>
                    <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".14em", color:ORANGE, marginBottom:8 }}>Pro</p>
                    <p style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"2.5rem", color:"white", margin:"0 0 4px", letterSpacing:"-2px" }}>€19,90</p>
                    <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.4)", marginBottom:20 }}>al mese · disponibile presto</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                      {["Roster illimitato artisti e locali","Gestione attiva delle trattative","Commissioni personalizzabili per artista","Analitiche avanzate + trend","Pagina agenzia brandizzata + badge","Export CSV · Supporto prioritario"].map(f => (
                        <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:".875rem", color:"rgba(255,255,255,.85)" }}>
                          <span style={{ color:ORANGE, fontWeight:700 }}>✓</span>{f}
                        </div>
                      ))}
                    </div>
                    <a href="#registrati" className="lp-cta" style={{ display:"block", textAlign:"center", width:"100%" }}>Inizia gratis + upgrade a breve</a>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ padding:"80px 20px", background:"rgba(255,255,255,.02)", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <div style={{ maxWidth:760, margin:"0 auto" }}>
            <div data-reveal style={{ ...rev, textAlign:"center", marginBottom:48 }}>
              <p style={{ fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:ORANGE, marginBottom:10 }}>Hai domande?</p>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:900, letterSpacing:"-.04em", margin:0 }}>Domande frequenti</h2>
            </div>
            <div data-reveal style={rev}>
              {FAQS.map((f,i) => (
                <div key={i} style={{ border:"1px solid rgba(255,255,255,.08)", borderRadius:18, marginBottom:10, overflow:"hidden", background:"rgba(255,255,255,.03)" }}>
                  <button onClick={() => setOpenFaq(openFaq===i?null:i)}
                    style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"Manrope,system-ui,sans-serif", fontWeight:700, fontSize:"1rem", color:"white", gap:12 }}>
                    <span>{f.q}</span>
                    <span style={{ transition:"transform .3s", transform:openFaq===i?"rotate(180deg)":"none", color:"rgba(255,255,255,.4)", flexShrink:0, fontSize:".8rem" }}>▼</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding:"0 20px 18px", borderTop:"1px solid rgba(255,255,255,.07)" }}>
                      <p style={{ fontSize:".9rem", color:"rgba(255,255,255,.55)", lineHeight:1.7, paddingTop:14, margin:0 }}>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINALE ── */}
        <section style={{ padding:"20px 20px 60px" }}>
          <div data-reveal style={{ ...rev, maxWidth:1000, margin:"0 auto", position:"relative", borderRadius:32, overflow:"hidden", padding:"80px 40px", textAlign:"center", background:"rgba(255,90,0,.06)", border:"1px solid rgba(255,90,0,.2)" }}>
            <div aria-hidden style={{ position:"absolute", top:-100, left:"50%", transform:"translateX(-50%)", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.3),transparent 70%)", filter:"blur(80px)", animation:"float 8s ease-in-out infinite" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(2rem,5vw,3rem)", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.05, margin:"0 0 16px" }}>
                Il tuo roster merita<br/><span className="lp-shimmer">di essere trovato.</span>
              </h2>
              <p style={{ fontSize:"1rem", color:"rgba(255,255,255,.55)", maxWidth:460, margin:"0 auto 36px", lineHeight:1.7 }}>
                Unisciti a TuttoEvento come promoter. Crea l'account oggi, aggiungi il tuo roster e inizia a monetizzare le tue relazioni.
              </p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <a href="#registrati" className="lp-cta" style={{ fontSize:"1rem", padding:"16px 36px" }}>Crea account gratis →</a>
                <a href="/login" className="lp-ghost" style={{ fontSize:"1rem", padding:"16px 28px" }}>Accedi</a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background:"rgba(255,255,255,.03)", borderTop:"1px solid rgba(255,255,255,.06)", padding:"40px 20px 24px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:40, marginBottom:32 }} className="lp-footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:40, marginBottom:32 }}>
            <div>
              <span style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:"1.1rem", letterSpacing:"-.04em" }}>TUTTO<span style={{ color:ORANGE }}>EVENTO</span></span>
              <p style={{ fontSize:".875rem", color:"rgba(255,255,255,.4)", lineHeight:1.7, marginTop:10, maxWidth:280 }}>La piattaforma italiana per artisti, locali e promoter. Booking semplice, CRM completo.</p>
            </div>
            <div>
              <p style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Sezioni</p>
              {[["#vantaggi","Vantaggi"],["#come-funziona","Come funziona"],["#commissioni","Commissioni"],["#faq","FAQ"]].map(([h,l]) => (
                <a key={h} href={h} style={{ display:"block", color:"rgba(255,255,255,.4)", fontSize:".875rem", textDecoration:"none", marginBottom:8 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Link utili</p>
              {[["/","Home"],["/login","Accedi"],["/landing-artisti","Per artisti"],["/landing-locali","Per locali"]].map(([h,l]) => (
                <a key={h} href={h} style={{ display:"block", color:"rgba(255,255,255,.4)", fontSize:".875rem", textDecoration:"none", marginBottom:8 }}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:20, textAlign:"center", fontSize:".78rem", color:"rgba(255,255,255,.25)" }}>
            © 2026 TuttoEvento. Tutti i diritti riservati.
          </div>
        </footer>

      </div>
    </>
  );
}

/* ─── Simulatore commissione interattivo ──────────────────── */
function CommissionSimulator() {
  const [cachet, setCachet] = useState(200);

  const serate = [1, 2, 4, 8];

  return (
    <div className="lp-glass" style={{ borderRadius:24, padding:"28px 24px" }}>
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".14em", color:ORANGE, marginBottom:14 }}>Simulatore commissioni</p>
      <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.1rem", color:"white", margin:"0 0 6px" }}>Il cachet dell'artista? Sempre intatto.</h3>
      <p style={{ fontSize:13, color:"rgba(255,255,255,.5)", margin:"0 0 20px", lineHeight:1.6 }}>
        L'artista incassa il 100% del suo cachet netto. La tua commissione viene dalla quota di TuttoEvento — non erode il compenso dell'artista.
      </p>

      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <label style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.6)" }}>Cachet netto artista</label>
          <span style={{ fontFamily:"Sora,sans-serif", fontWeight:800, color:"white" }}>€{cachet}</span>
        </div>
        <input type="range" min="50" max="1500" step="25" value={cachet} onChange={e=>setCachet(Number(e.target.value))}
          style={{ width:"100%", accentColor:ORANGE, height:6, cursor:"pointer" }} />
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,.3)", marginTop:5 }}>
          <span>€50</span><span>€750</span><span>€1500</span>
        </div>
      </div>

      {/* Schema visivo */}
      <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:"14px 16px", marginBottom:16 }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:"rgba(255,255,255,.4)", margin:"0 0 10px" }}>Come si distribuisce il pagamento</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.2)", borderRadius:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>🎤</span>
              <span style={{ fontSize:13, fontWeight:700, color:"white" }}>Artista incassa</span>
            </div>
            <span style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:15, color:"#22c55e" }}>€{cachet} — 100%</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:"rgba(255,90,0,.08)", border:"1px solid rgba(255,90,0,.2)", borderRadius:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>💼</span>
              <span style={{ fontSize:13, fontWeight:700, color:"white" }}>Tu guadagni (30% quota TE)</span>
            </div>
            <span style={{ fontFamily:"Sora,sans-serif", fontWeight:900, fontSize:15, color:ORANGE }}>~€{Math.round(cachet * 0.15)}</span>
          </div>
        </div>
        <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", margin:"10px 0 0", textAlign:"center" }}>
          ✓ Il cachet dell'artista non viene mai toccato
        </p>
      </div>

      {/* Tabella serate */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:16, marginBottom:16 }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:"rgba(255,255,255,.4)", marginBottom:10 }}>Le tue commissioni mensili</p>
        {serate.map(n => (
          <div key={n} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"rgba(255,255,255,.04)", borderRadius:10, marginBottom:6, border:"1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,.6)", fontWeight:600 }}>{n} booking/mese</span>
            <span style={{ fontFamily:"Sora,sans-serif", fontWeight:800, color:ORANGE }}>~€{Math.round(cachet * 0.15 * n)}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", textAlign:"center", margin:0, lineHeight:1.5 }}>
        Stima indicativa · Il calcolo esatto dipende dal prezzo pubblico concordato con il locale
      </p>
    </div>
  );
}