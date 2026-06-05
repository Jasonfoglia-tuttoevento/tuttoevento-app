"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RegisterFormInline from "@/components/RegisterFormInline";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const FAQS = [
  { q: "Quanto costa cercare artisti?", a: "La registrazione è gratuita. Puoi creare il profilo del tuo locale, sfogliare il marketplace e inviare richieste di contatto senza alcun costo." },
  { q: "Posso trovare artisti anche per eventi privati o aziendali?", a: "Sì. TuttoEvento è pensato per locali, ristoranti, hotel, beach club, discoteche, wedding planner, aziende e privati che vogliono trovare artisti affidabili." },
  { q: "Come funziona il pricing degli artisti?", a: "I prezzi sono su richiesta — non visibili nel marketplace. Indica il tuo budget nella richiesta e il team TuttoEvento gestirà la trattativa in modo riservato." },
  { q: "Gli artisti sono verificati?", a: "Ogni artista viene approvato manualmente dal team TuttoEvento prima di apparire nel marketplace. Verifichiamo identità, qualità del profilo e coerenza delle informazioni." },
  { q: "Posso gestire più eventi contemporaneamente?", a: "Sì. Dalla dashboard puoi monitorare richieste, pipeline trattative, eventi confermati e comunicazioni con il team TuttoEvento in un unico spazio." },
];

const PASSI = [
  { n:"01", icon:"🔍", title:"Sfoglia il marketplace", desc:"Filtra gli artisti per genere musicale, città e fascia di budget. Solo profili verificati dal team." },
  { n:"02", icon:"📬", title:"Richiedi contatto riservato", desc:"Indica data, tipo evento e budget. Il team TuttoEvento gestisce la trattativa per te in totale riservatezza." },
  { n:"03", icon:"🎉", title:"Serata confermata", desc:"Artista confermato, tutto organizzato. Gestisci il tutto dalla dashboard: chat, calendario e storico booking." },
];

const reveal = { opacity: 0, transform: "translateY(28px)", transition: "opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1)" };

export default function LandingLocali() {
  useReveal();
  const [budget, setBudget] = useState(300);
  const [openFaq, setOpenFaq] = useState(null);

  const FORMAT = [
    { min:100, max:300, label:"Aperitivo / piccolo evento", desc:"DJ set light, cantante solista o musicista acustico." },
    { min:300, max:700, label:"Serata locale / cena spettacolo", desc:"DJ, duo acustico, performer o live set strutturato." },
    { min:700, max:2000, label:"Evento premium", desc:"Band live, show completo, corporate event o grande format." },
  ];

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-24px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(18px,14px)} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes shimmer { to{background-position:-200% 0} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        * { box-sizing:border-box; }
        html,body { margin:0; padding:0; overflow-x:hidden; }
        .ll-root { font-family:'Manrope',system-ui,sans-serif; background:#fbfaf8; color:#0a0a0b; min-height:100vh; overflow-x:hidden; }
        .ll-shimmer { background:linear-gradient(100deg,#ff5a00 0%,#ff8a3d 38%,#ffc27d 50%,#ff8a3d 62%,#ff5a00 100%); background-size:200% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:shimmer 6s linear infinite; }
        .ll-glass { background:rgba(255,255,255,.68); backdrop-filter:blur(18px) saturate(160%); border:1px solid rgba(255,255,255,.72); box-shadow:0 30px 60px -30px rgba(20,12,0,.22); }
        .ll-dark-glass { background:rgba(16,16,18,.85); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,.08); box-shadow:0 30px 80px -35px rgba(0,0,0,.8); }
        .ll-card { background:#fbfaf8; border:1px solid rgba(0,0,0,.06); border-radius:28px; padding:28px; height:100%; transition:box-shadow .2s, transform .2s; }
        .ll-card:hover { box-shadow:0 12px 40px rgba(0,0,0,.1); transform:translateY(-3px); }
        .ll-cta-btn { position:relative; display:inline-block; background:#ff5a00; color:white; padding:16px 36px; border-radius:100px; font-weight:700; font-size:1rem; text-decoration:none; transition:all .2s; box-shadow:0 18px 40px -12px rgba(255,90,0,.55); font-family:'Manrope',sans-serif; }
        .ll-cta-btn:hover { background:#e85100; transform:scale(1.02); }
        .ll-ghost-btn { display:inline-block; background:rgba(255,255,255,.65); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.72); color:#0a0a0b; padding:16px 32px; border-radius:100px; font-weight:700; font-size:1rem; text-decoration:none; transition:all .2s; font-family:'Manrope',sans-serif; }
        .ll-ghost-btn:hover { transform:scale(1.02); }
        input[type=range].ll-slider { width:100%; height:8px; -webkit-appearance:none; appearance:none; background:rgba(0,0,0,.12); border-radius:4px; outline:none; cursor:pointer; }
        input[type=range].ll-slider::-webkit-slider-thumb { -webkit-appearance:none; width:24px; height:24px; border-radius:50%; background:#ff5a00; box-shadow:0 0 12px rgba(255,90,0,.5); transition:transform .15s; }
        input[type=range].ll-slider::-webkit-slider-thumb:hover { transform:scale(1.2); }
        @media(max-width:768px) { .ll-hero-grid{grid-template-columns:1fr!important} .ll-grid-2{grid-template-columns:1fr!important} .ll-grid-4{grid-template-columns:1fr 1fr!important} }
        @media(max-width:400px) { .ll-grid-4{grid-template-columns:1fr!important} }
      `}</style>

      <div className="ll-root">

        {/* NAVBAR */}
        <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"12px 16px" }}>
          <div className="ll-glass" style={{ maxWidth:1100, margin:"0 auto", borderRadius:100, padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <Link href="/" style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1.1rem", letterSpacing:"-.04em", textDecoration:"none", color:"#0a0a0b" }}>
              TUTTO<span style={{ color:"#ff5a00" }}>EVENTO</span>
            </Link>
            <div style={{ display:"flex", gap:28, alignItems:"center" }}>
              {[["#vantaggi","Vantaggi"],["#come-funziona","Come funziona"],["#budget","Budget"],["#faq","FAQ"]].map(([h,l]) => (
                <a key={h} href={h} style={{ fontSize:".875rem", fontWeight:600, color:"#6b6b73", textDecoration:"none" }}>{l}</a>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <Link href="/login" style={{ fontSize:".875rem", fontWeight:700, color:"#0a0a0b", textDecoration:"none", padding:"7px 14px", borderRadius:100 }}>Accedi</Link>
              <Link href="/register?role=organizer" className="ll-cta-btn" style={{ padding:"8px 18px", fontSize:".85rem" }}>Trova artisti</Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ position:"relative", paddingTop:160, paddingBottom:80, paddingLeft:20, paddingRight:20, overflow:"hidden" }}>
          <div aria-hidden style={{ position:"absolute", top:-160, left:"50%", width:760, height:760, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.28),rgba(255,177,74,.12) 50%,transparent 72%)", filter:"blur(130px)", zIndex:0, animation:"float 9s ease-in-out infinite", pointerEvents:"none" }} />
          <div aria-hidden style={{ position:"absolute", top:170, right:-160, width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,210,150,.3),transparent 70%)", filter:"blur(110px)", zIndex:0, animation:"float2 12s ease-in-out infinite", pointerEvents:"none" }} />

          <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center", position:"relative", zIndex:1 }} className="ll-hero-grid">

            {/* Testo */}
            <div>
              <div data-reveal style={{ ...reveal, display:"inline-flex", alignItems:"center", gap:8, borderRadius:100, padding:"6px 16px", marginBottom:28, background:"rgba(255,255,255,.65)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,.72)" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#ff5a00", animation:"pulse 2s infinite", display:"inline-block" }} />
                <span style={{ fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:"#6b6b73" }}>Per locali e organizzatori · 2026</span>
              </div>

              <h1 data-reveal style={{ ...reveal, fontFamily:"'Sora',sans-serif", fontSize:"clamp(2.4rem,5vw,4rem)", fontWeight:900, lineHeight:1.0, letterSpacing:"-2px", color:"#0a0a0b", marginBottom:24 }}>
                Riempi il tuo locale.<br/>Trova l'artista giusto<br/><span className="ll-shimmer">in pochi click.</span>
              </h1>

              <p data-reveal style={{ ...reveal, fontSize:"clamp(.95rem,2vw,1.1rem)", color:"#6b6b73", marginBottom:36, lineHeight:1.7 }}>
                Con TuttoEvento trovi DJ, band, cantanti e performer per serate ed eventi. Gestisci richieste, chat e booking da un'unica dashboard — il tuo CRM per gli eventi.
              </p>

              <div data-reveal style={{ ...reveal, display:"flex", gap:14, flexWrap:"wrap", marginBottom:28 }}>
                <Link href="#registrati" className="ll-cta-btn">Pubblica una richiesta gratis</Link>
                <a href="#come-funziona" className="ll-ghost-btn">Come funziona →</a>
              </div>

              <div data-reveal style={{ ...reveal, display:"flex", gap:16, flexWrap:"wrap" }}>
                {["Artisti verificati","Prezzi su richiesta","Risposta in 48h","🇮🇹 Made in Italy"].map(t => (
                  <span key={t} style={{ fontSize:".8rem", fontWeight:600, color:"#6b6b73" }}>✓ {t}</span>
                ))}
              </div>
            </div>

            {/* Hero card dashboard */}
            <div data-reveal style={reveal}>
              <div className="ll-dark-glass" style={{ borderRadius:32, overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div><p style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontFamily:"monospace" }}>tuttoevento.it/locali</p><h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.15rem", fontWeight:800, color:"white", marginTop:4 }}>Richieste in arrivo</h3></div>
                  <span style={{ fontSize:11, fontWeight:700, color:"#4ade80", background:"rgba(74,222,128,.12)", padding:"4px 12px", borderRadius:100 }}>Live</span>
                </div>
                <div style={{ padding:20 }}>
                  {[["DJ Set","Venerdì sera · Rooftop Bar","€350–€500","12 artisti"],["Duo Acustico","Cena spettacolo · Ristorante","€250–€400","8 artisti"],["Band Live","Evento aziendale · Hotel","€700–€1.200","6 artisti"]].map(([tipo,luogo,budget_r,match]) => (
                    <div key={tipo} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:"14px 16px", marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <div><p style={{ fontWeight:700, color:"white", fontSize:".9rem" }}>{tipo}</p><p style={{ fontSize:".78rem", color:"rgba(255,255,255,.45)", marginTop:2 }}>{luogo}</p></div>
                        <p style={{ fontSize:".8rem", fontWeight:700, color:"#ff8a3d" }}>{budget_r}</p>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"#4ade80" }}>{match} disponibili</span>
                        <button style={{ fontSize:11, fontWeight:700, background:"white", color:"#0a0a0b", border:"none", borderRadius:100, padding:"5px 12px", cursor:"pointer" }}>Vedi profili</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"0 20px 20px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {[["24h","risposta media"],["100+","artisti verificati"],["0","stress operativo"]].map(([v,l]) => (
                    <div key={l} style={{ background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:"12px 8px", textAlign:"center" }}>
                      <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1.4rem", color:"white" }}>{v}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,.4)", marginTop:4, lineHeight:1.3 }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <section style={{ background:"#111114", padding:"18px 0", overflow:"hidden" }}>
          <div style={{ display:"flex", whiteSpace:"nowrap", animation:"marquee 26s linear infinite" }}>
            {["Ristoranti","Beach Club","Hotel","Rooftop Bar","Discoteche","Wedding Planner","Aziende","Festival","Locali Live","Ristoranti","Beach Club","Hotel","Rooftop Bar","Discoteche","Wedding Planner","Aziende","Festival","Locali Live"].map((item,i) => (
              <span key={i} style={{ margin:"0 24px", color:"rgba(255,255,255,.5)", fontSize:".85rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em" }}>{item}</span>
            ))}
          </div>
        </section>

        {/* FORM REGISTRAZIONE INLINE */}
        <section id="registrati" style={{ padding:"0 20px 60px" }}>
          <div style={{ maxWidth:560, margin:"0 auto" }}>
            <div data-reveal style={{ ...reveal, background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:28, padding:"32px 28px", boxShadow:"0 20px 60px rgba(0,0,0,.1)" }}>
              <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", marginBottom:6 }}>Inizia subito</p>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.3rem", letterSpacing:"-.03em", color:"#0a0a0b", margin:"0 0 20px" }}>Registra il tuo locale</h2>
              <RegisterFormInline role="organizer" dark={false} />
            </div>
          </div>
        </section>

        {/* VANTAGGI */}
        <section id="vantaggi" style={{ padding:"80px 20px", background:"white", borderTop:"1px solid rgba(0,0,0,.06)", borderBottom:"1px solid rgba(0,0,0,.06)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div data-reveal style={{ ...reveal, textAlign:"center", marginBottom:56 }}>
              <p style={{ fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", marginBottom:10 }}>Pensato per chi organizza eventi</p>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900, color:"#0a0a0b", letterSpacing:"-.04em", lineHeight:1.1 }}>Meno telefonate, più serate riuscite.</h2>
              <p style={{ color:"#6b6b73", fontSize:"1rem", marginTop:12, maxWidth:520, margin:"12px auto 0", lineHeight:1.7 }}>Trova artisti adatti al tuo pubblico e conferma la serata con un flusso semplice e professionale.</p>
            </div>
            <div className="ll-grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
              {[["🎧","Artisti per ogni format","DJ, band, cantanti, performer e animatori per ogni tipo di pubblico e serata."],["📍","Ricerca per città","Trova talenti disponibili nella tua zona, riducendo tempi e costi di trasferta."],["💬","CRM integrato","Pipeline trattative, chat col team TuttoEvento, storico booking e analitiche."],["🔒","Prezzi riservati","Il budget è trattato in modo riservato. I locali non vedono mai il cachet netto dell'artista."]].map(([icon,title,desc],i) => (
                <div key={title} data-reveal style={{ ...reveal, transitionDelay:`${i*.08}s` }}>
                  <div className="ll-card">
                    <span style={{ fontSize:"1.8rem", display:"block", marginBottom:14 }}>{icon}</span>
                    <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1rem", color:"#0a0a0b", marginBottom:8 }}>{title}</h3>
                    <p style={{ fontSize:".875rem", color:"#6b6b73", lineHeight:1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COME FUNZIONA */}
        <section id="come-funziona" style={{ padding:"80px 20px", background:"#fbfaf8" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1.5fr", gap:48, alignItems:"center" }} className="ll-grid-2">
            <div data-reveal style={reveal}>
              <p style={{ fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", marginBottom:10 }}>Processo semplice</p>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, color:"#0a0a0b", letterSpacing:"-.04em", lineHeight:1.1, marginBottom:14 }}>Dal bisogno alla serata confermata.</h2>
              <p style={{ color:"#6b6b73", fontSize:".95rem", lineHeight:1.7 }}>Pubblica quello che ti serve, ricevi candidature coerenti e scegli l'artista più adatto al tuo locale.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {PASSI.map((p,i) => (
                <div key={p.n} data-reveal style={{ ...reveal, transitionDelay:`${i*.1}s`, background:"white", border:"1px solid rgba(0,0,0,.07)", borderRadius:22, padding:"20px 22px", display:"flex", gap:16, alignItems:"flex-start" }}>
                  <div style={{ width:44, height:44, borderRadius:14, background:"#0a0a0b", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:".9rem", flexShrink:0 }}>{p.n}</div>
                  <div>
                    <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1rem", color:"#0a0a0b", marginBottom:4 }}>{p.title}</h3>
                    <p style={{ fontSize:".875rem", color:"#6b6b73", lineHeight:1.6 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BUDGET SIMULATOR */}
        <section id="budget" style={{ padding:"80px 20px", background:"white", borderTop:"1px solid rgba(0,0,0,.06)", borderBottom:"1px solid rgba(0,0,0,.06)" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }} className="ll-grid-2">
            <div data-reveal style={reveal}>
              <p style={{ fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", marginBottom:10 }}>Simula il budget della serata</p>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, color:"#0a0a0b", letterSpacing:"-.04em", lineHeight:1.1, marginBottom:14 }}>Parti dal budget e trova il talento giusto.</h2>
              <p style={{ color:"#6b6b73", fontSize:"1rem", lineHeight:1.7 }}>Ogni evento ha obiettivi diversi. Imposta un budget indicativo e valuta quale format è più adatto alla tua serata.</p>
            </div>
            <div data-reveal style={{ ...reveal, background:"#fbfaf8", border:"1px solid rgba(0,0,0,.07)", borderRadius:32, padding:36, boxShadow:"0 20px 60px rgba(0,0,0,.08)" }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                  <label style={{ fontSize:".875rem", fontWeight:700 }}>Budget indicativo</label>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontSize:"2rem", fontWeight:900, color:"#ff5a00" }}>€{budget}</span>
                </div>
                <input type="range" min="100" max="2000" step="50" value={budget} onChange={e => setBudget(Number(e.target.value))} className="ll-slider" />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b6b73", fontWeight:600, marginTop:6 }}>
                  <span>€100</span><span>€1000</span><span>€2000+</span>
                </div>
              </div>
              <div style={{ borderTop:"1px solid rgba(0,0,0,.07)", paddingTop:20 }}>
                <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", color:"#6b6b73", marginBottom:14 }}>Format consigliati</p>
                {FORMAT.map(f => {
                  const active = budget >= f.min && budget <= f.max;
                  return (
                    <div key={f.label} style={{ padding:"12px 14px", borderRadius:14, marginBottom:10, border:`1px solid ${active?"#ff5a00":"rgba(0,0,0,.06)"}`, background:active?"white":"rgba(255,255,255,.55)", transition:"all .2s" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <p style={{ fontWeight:700, fontSize:".875rem" }}>{f.label}</p>
                        {active && <span style={{ fontSize:10, fontWeight:700, color:"white", background:"#ff5a00", padding:"2px 8px", borderRadius:100 }}>consigliato</span>}
                      </div>
                      <p style={{ fontSize:".78rem", color:"#6b6b73" }}>{f.desc}</p>
                    </div>
                  );
                })}
              </div>
              <Link href="/register?role=organizer" style={{ display:"block", background:"#0a0a0b", color:"white", textAlign:"center", padding:"14px", borderRadius:14, fontWeight:700, fontSize:".95rem", textDecoration:"none", marginTop:16, fontFamily:"'Manrope',sans-serif" }}>
                Inizia ora →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding:"80px 20px", background:"#fbfaf8" }}>
          <div style={{ maxWidth:760, margin:"0 auto" }}>
            <div data-reveal style={{ ...reveal, textAlign:"center", marginBottom:48 }}>
              <p style={{ fontSize:".75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", marginBottom:10 }}>Hai domande?</p>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, color:"#0a0a0b", letterSpacing:"-.04em" }}>Domande frequenti</h2>
            </div>
            <div data-reveal style={reveal}>
              {FAQS.map((f,i) => (
                <div key={i} style={{ border:"1px solid rgba(0,0,0,.07)", borderRadius:18, marginBottom:10, overflow:"hidden", background:"white" }}>
                  <button onClick={() => setOpenFaq(openFaq===i?null:i)}
                    style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"'Manrope',sans-serif", fontWeight:700, fontSize:"1rem", color:"#0a0a0b", gap:12 }}>
                    <span>{f.q}</span>
                    <span style={{ transition:"transform .3s", transform:openFaq===i?"rotate(180deg)":"none", color:"#6b6b73", flexShrink:0 }}>▼</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding:"0 20px 18px", borderTop:"1px solid rgba(0,0,0,.06)" }}>
                      <p style={{ fontSize:".9rem", color:"#6b6b73", lineHeight:1.7, paddingTop:14 }}>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINALE */}
        <section style={{ padding:"20px 20px 60px" }}>
          <div data-reveal style={{ ...reveal, maxWidth:1000, margin:"0 auto", position:"relative", borderRadius:32, overflow:"hidden", textAlign:"center", padding:"80px 40px" }}>
            <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(9,9,11,.94),rgba(34,22,13,.84))" }} />
            <div aria-hidden style={{ position:"absolute", top:-80, left:"50%", transform:"translateX(-50%)", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.5),transparent 70%)", filter:"blur(80px)", animation:"float 8s ease-in-out infinite" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:900, color:"white", letterSpacing:"-.04em", lineHeight:1.05, marginBottom:16 }}>
                La prossima serata può essere<br/><span className="ll-shimmer">più semplice da organizzare.</span>
              </h2>
              <p style={{ color:"rgba(255,255,255,.65)", fontSize:"1rem", maxWidth:460, margin:"0 auto 36px", lineHeight:1.7 }}>Crea il profilo del tuo locale, pubblica una richiesta gratuita e trova artisti disponibili per il tuo prossimo evento.</p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <Link href="#registrati" className="ll-cta-btn">Pubblica una richiesta gratis</Link>
                <Link href="/login" style={{ display:"inline-block", background:"rgba(255,255,255,.1)", color:"white", border:"1px solid rgba(255,255,255,.2)", padding:"16px 32px", borderRadius:100, fontWeight:700, fontSize:"1rem", textDecoration:"none", fontFamily:"'Manrope',sans-serif" }}>Accedi</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background:"white", borderTop:"1px solid rgba(0,0,0,.06)", padding:"40px 20px 24px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:40, marginBottom:32 }} className="ll-grid-2">
            <div>
              <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1.1rem", letterSpacing:"-.04em" }}>TUTTO<span style={{ color:"#ff5a00" }}>EVENTO</span></span>
              <p style={{ color:"#6b6b73", fontSize:".875rem", lineHeight:1.7, marginTop:10, maxWidth:280 }}>La piattaforma italiana per artisti, locali e promoter. Booking semplice, CRM completo, chat realtime.</p>
            </div>
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Sezioni</p>
              {[["#vantaggi","Vantaggi"],["#come-funziona","Come funziona"],["#budget","Budget"],["#faq","FAQ"]].map(([h,l]) => (
                <a key={h} href={h} style={{ display:"block", color:"#6b6b73", fontSize:".875rem", textDecoration:"none", marginBottom:8 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:".85rem", marginBottom:12 }}>Link utili</p>
              {[["/","Home"],["/login","Accedi"],["/register?role=organizer","Registrati"]].map(([h,l]) => (
                <Link key={h} href={h} style={{ display:"block", color:"#6b6b73", fontSize:".875rem", textDecoration:"none", marginBottom:8 }}>{l}</Link>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(0,0,0,.06)", paddingTop:20, textAlign:"center", fontSize:".78rem", color:"#6b6b73" }}>
            © 2026 TuttoEvento. Tutti i diritti riservati.
          </div>
        </footer>

      </div>
    </>
  );
}