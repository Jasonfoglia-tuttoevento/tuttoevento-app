"use client";

import Link from "next/link";

export default function ChiSiamoPage() {
  const valori = [
    { t: "Trasparenza", d: "Cachet, commissioni e pagamenti sempre chiari, senza sorprese." },
    { t: "Velocità", d: "Dal primo contatto al palco in pochi clic, tutto nella stessa piattaforma." },
    { t: "Fiducia", d: "Profili verificati, recensioni reali e pagamenti protetti per ogni booking." },
  ];
  const stats = [
    { n: "3", l: "categorie: artisti, locali, promoter" },
    { n: "1", l: "ecosistema unico end-to-end" },
    { n: "100%", l: "online, gestibile da mobile" },
  ];

  return (
    <main className="te-about-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-about-root { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); background:var(--paper); min-height:100vh; overflow-x:hidden; }
        .te-about-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-about-root ::selection { background:var(--orange); color:#fff; }
      `}</style>

      <header className="px-5 sm:px-8 py-5 flex items-center justify-between border-b border-black/5 bg-white">
        <Link href="/" className="te-about-display font-extrabold text-base sm:text-lg tracking-tight">
          TUTTO<span style={{ color: "var(--orange)" }}>EVENTO</span>
        </Link>
        <Link href="/register" className="bg-[var(--ink)] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:scale-[1.04] transition">
          Inizia gratis
        </Link>
      </header>

      {/* HERO */}
      <section className="relative px-5 sm:px-6 pt-16 sm:pt-24 pb-12 text-center overflow-hidden">
        <div aria-hidden style={{ position:"absolute", top:"-160px", left:"50%", transform:"translateX(-50%)", width:"560px", height:"560px", maxWidth:"95vw", borderRadius:"999px", filter:"blur(120px)", background:"radial-gradient(circle, rgba(255,90,0,.2), transparent 70%)", zIndex:0 }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.2em] text-[var(--orange)] text-[11px] font-extrabold mb-4">Chi siamo</p>
          <h1 className="te-about-display text-4xl sm:text-6xl font-extrabold leading-[1.02] mb-6">
            Colleghiamo chi crea <span style={{ color:"var(--orange)" }}>musica</span> con chi crea <span style={{ color:"var(--orange)" }}>eventi</span>.
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            TuttoEvento nasce per semplificare il booking dal vivo: un solo posto dove artisti, locali e promoter si trovano, trattano e lavorano insieme.
          </p>
        </div>
      </section>

      {/* MISSIONE */}
      <section className="px-5 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white border border-black/5 rounded-3xl p-7 sm:p-10">
          <h2 className="te-about-display text-2xl sm:text-3xl font-extrabold mb-4">La nostra missione</h2>
          <p className="text-[var(--muted)] text-lg leading-relaxed">
            Organizzare un evento dal vivo è ancora troppo complicato: trattative via messaggi sparsi, pagamenti incerti, nessuno strumento unico. Vogliamo cambiarlo, dando ad artisti, locali e promoter un ecosistema unico con marketplace, chat in tempo reale, pagamenti sicuri e un CRM completo per gestire tutto.
          </p>
        </div>
      </section>

      {/* VALORI */}
      <section className="px-5 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="te-about-display text-2xl sm:text-3xl font-extrabold mb-8 text-center">I nostri valori</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {valori.map((v) => (
              <div key={v.t} className="bg-white border border-black/5 rounded-3xl p-7">
                <h3 className="te-about-display text-xl font-extrabold mb-2">{v.t}</h3>
                <p className="text-[var(--muted)] leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUMERI */}
      <section className="px-5 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((s) => (
            <div key={s.l} className="bg-[var(--ink)] text-white rounded-3xl p-8 text-center">
              <p className="te-about-display text-4xl font-extrabold" style={{ color:"var(--orange)" }}>{s.n}</p>
              <p className="text-white/70 mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="te-about-display text-3xl sm:text-4xl font-extrabold mb-5">Entra nell'ecosistema</h2>
          <p className="text-[var(--muted)] text-lg mb-8">Crea il tuo profilo gratis e inizia a lavorare oggi stesso.</p>
          <Link href="/register" className="inline-block bg-[var(--orange)] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#e85100] transition shadow-[0_18px_40px_-12px_rgba(255,90,0,.6)]">
            Inizia gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white py-8 text-center text-sm text-[var(--muted)]">
        © 2026 TuttoEvento. Tutti i diritti riservati.
      </footer>
    </main>
  );
}