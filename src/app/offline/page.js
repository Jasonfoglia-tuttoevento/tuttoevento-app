"use client";
export default function OfflinePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=Manrope:wght@400;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      `}</style>
      <main style={{ minHeight:"100vh", background:"#0a0a0b", fontFamily:"'Manrope',system-ui,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden" }}>
        {/* Glow */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,90,0,.2),transparent 70%)", filter:"blur(80px)", pointerEvents:"none" }} />

        <div style={{ position:"relative", textAlign:"center", maxWidth:440 }}>
          {/* Icona animata */}
          <div style={{ fontSize:"5rem", marginBottom:24, display:"inline-block", animation:"float 3s ease-in-out infinite" }}>📡</div>

          <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color:"#ff5a00", marginBottom:12 }}>Connessione assente</p>

          <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"clamp(2rem,6vw,3rem)", letterSpacing:"-.04em", color:"white", lineHeight:1.05, marginBottom:16 }}>
            Sei offline.
          </h1>

          <p style={{ color:"rgba(255,255,255,.5)", fontSize:"1rem", lineHeight:1.7, marginBottom:32 }}>
            Sembra che tu non sia connesso a internet. Controlla la connessione e riprova.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => window.location.reload()}
              style={{ background:"#ff5a00", color:"white", border:"none", borderRadius:100, padding:"13px 28px", fontWeight:800, fontSize:".95rem", cursor:"pointer", fontFamily:"inherit", boxShadow:"0 12px 30px rgba(255,90,0,.35)", transition:"all .2s" }}>
              Ricarica la pagina
            </button>
            <button onClick={() => window.history.back()}
              style={{ background:"rgba(255,255,255,.07)", color:"white", border:"1px solid rgba(255,255,255,.15)", borderRadius:100, padding:"13px 28px", fontWeight:700, fontSize:".95rem", cursor:"pointer", fontFamily:"inherit" }}>
              ← Torna indietro
            </button>
          </div>

          <p style={{ color:"rgba(255,255,255,.2)", fontSize:".78rem", marginTop:32 }}>
            TuttoEvento funziona anche offline per alcune funzionalità.<br/>
            Riconnettiti per accedere a tutti i contenuti.
          </p>
        </div>
      </main>
    </>
  );
}