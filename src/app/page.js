"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ============================================================
   TuttoEvento — Landing Page
   Stile: Apple-like, bianco/arancio, animazioni 3D, futuristico
   Next.js (App Router) — drop-in replacement per app/page.tsx
   Dipendenze: solo Next.js + Tailwind (già nel tuo progetto)
   ============================================================ */

/* Hook: reveal on scroll (IntersectionObserver, zero librerie) */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* Card 3D che segue il mouse (tilt) */
function TiltCard({ children, className = "", glow = "rgba(255,90,0,0.25)" }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  function handleMove(e) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 12;
    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`,
      "--mx": `${px * 100}%`,
      "--my": `${py * 100}%`,
      "--glow": glow,
    });
  }
  function reset() {
    setStyle({ transform: "perspective(900px) rotateX(0) rotateY(0) translateY(0)" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={style}
      className={`te-tilt ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  useReveal();

  // parallax leggero dell'aura del hero
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="te-root">
      {/* ---------- STILI ---------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        .te-root {
          --orange: #ff5a00;
          --orange-soft: #ff8246;
          --ink: #0a0a0b;
          --paper: #fbfaf8;
          --muted: #6b6b73;
          font-family: 'Manrope', system-ui, sans-serif;
          background: var(--paper);
          color: var(--ink);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }
        .te-root ::selection { background: var(--orange); color: #fff; }
        .te-display { font-family: 'Sora', sans-serif; letter-spacing: -0.03em; }

        /* grana sottile per profondità "premium" */
        .te-grain::before {
          content: "";
          position: fixed; inset: 0; z-index: 1; pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* reveal */
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); }
        [data-reveal].is-visible { opacity: 1; transform: none; }
        [data-reveal][data-delay="1"] { transition-delay: .08s; }
        [data-reveal][data-delay="2"] { transition-delay: .16s; }
        [data-reveal][data-delay="3"] { transition-delay: .24s; }

        /* tilt cards */
        .te-tilt { transition: transform .25s cubic-bezier(.2,.7,.2,1); transform-style: preserve-3d; will-change: transform; position: relative; }
        .te-tilt::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: radial-gradient(420px circle at var(--mx,50%) var(--my,50%), var(--glow,rgba(255,90,0,.18)), transparent 45%);
          opacity: 0; transition: opacity .3s;
        }
        .te-tilt:hover::after { opacity: 1; }

        /* float orbs */
        @keyframes te-float { 0%,100%{ transform: translate(0,0) scale(1);} 50%{ transform: translate(0,-26px) scale(1.04);} }
        @keyframes te-float2 { 0%,100%{ transform: translate(0,0);} 50%{ transform: translate(18px,18px);} }
        @keyframes te-spin { to { transform: rotate(360deg); } }
        @keyframes te-pulse { 0%,100%{ opacity:.5;} 50%{ opacity:1;} }
        @keyframes te-marquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }

        /* hero headline shimmer */
        .te-shimmer {
          background: linear-gradient(100deg, var(--orange) 0%, var(--orange-soft) 40%, #ffb98a 50%, var(--orange-soft) 60%, var(--orange) 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: te-shimmer-move 6s linear infinite;
        }
        @keyframes te-shimmer-move { to { background-position: -200% 0; } }

        /* bottone magnetico */
        .te-cta { position: relative; isolation: isolate; }
        .te-cta::before {
          content:""; position:absolute; inset:-2px; border-radius:999px; z-index:-1;
          background: conic-gradient(from 0deg, var(--orange), #ffb98a, var(--orange));
          opacity:0; transition:opacity .35s; filter: blur(8px);
        }
        .te-cta:hover::before { opacity:.55; animation: te-spin 4s linear infinite; }

        .te-glass {
          background: rgba(255,255,255,0.62);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 30px 60px -30px rgba(20,12,0,.25);
        }

        @media (min-width: 1024px) {
          .te-crm-panel { transform: rotateY(6deg) rotateX(4deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .te-tilt, [data-reveal] { transition: none !important; transform: none !important; }
          .te-shimmer, .te-cta::before { animation: none !important; }
        }
      `}</style>

      <div className="te-grain" />

      {/* ===================== NAVBAR ===================== */}
      <nav className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <div className="te-glass max-w-6xl mx-auto rounded-full px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <span className="te-display font-extrabold text-base sm:text-lg tracking-tight">
              TUTTO<span className="text-[var(--orange)]">EVENTO</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-[var(--muted)]">
            <a href="#features" className="hover:text-[var(--orange)] transition">Funzioni</a>
            <a href="#marketplace" className="hover:text-[var(--orange)] transition">Marketplace</a>
            <a href="#dashboard" className="hover:text-[var(--orange)] transition">Dashboard</a>
            <a href="#come-funziona" className="hover:text-[var(--orange)] transition">Come funziona</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-[var(--ink)] px-4 py-2 rounded-full hover:bg-black/5 transition">
              Accedi
            </Link>
            <Link href="/register" className="te-cta bg-[var(--ink)] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full hover:scale-[1.04] transition whitespace-nowrap">
              Inizia gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ===================== HERO ===================== */}
      <section className="relative pt-28 sm:pt-40 pb-20 sm:pb-28 px-5 sm:px-6">
        {/* aure 3D di sfondo con parallax */}
        <div
          aria-hidden
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full -z-10 blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(255,90,0,.32), rgba(255,130,70,.12) 55%, transparent 70%)",
            transform: `translate(-50%, ${scrollY * 0.15}px)`,
            animation: "te-float 9s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          className="absolute top-[120px] right-[-80px] w-[360px] h-[360px] rounded-full -z-10 blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(255,185,138,.4), transparent 70%)", animation: "te-float2 11s ease-in-out infinite" }}
        />

        <div className="max-w-5xl mx-auto text-center">
          <div data-reveal className="inline-flex items-center gap-2 te-glass rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 max-w-[92vw]">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" style={{ animation: "te-pulse 2s infinite" }} />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Live · La nuova piattaforma per eventi</span>
          </div>

          <h1 data-reveal data-delay="1" className="te-display text-[2.7rem] leading-[1] sm:text-7xl sm:leading-[0.92] md:text-[5.5rem] font-extrabold mb-6 sm:mb-7">
            L'ecosistema per <br className="hidden sm:block" />
            <span className="te-shimmer">artisti, promoter</span> <br className="hidden sm:block" />
            e organizzatori.
          </h1>

          <p data-reveal data-delay="2" className="text-base sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Trova talenti nel <strong className="text-[var(--ink)] font-bold">marketplace</strong>, chatti in
            <strong className="text-[var(--ink)] font-bold"> tempo reale</strong>, chiudi con
            <strong className="text-[var(--ink)] font-bold"> pagamenti sicuri</strong> e gestisci tutto dal tuo
            <strong className="text-[var(--ink)] font-bold"> CRM</strong> — incassi, eventi e analitiche in un unico posto.
          </p>

          <div data-reveal data-delay="3" className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="te-cta w-full sm:w-auto bg-[var(--orange)] text-white px-6 sm:px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#e85100] transition shadow-[0_18px_40px_-12px_rgba(255,90,0,.6)]">
              Crea il tuo profilo gratis
            </Link>
            <a href="#marketplace" className="w-full sm:w-auto te-glass text-[var(--ink)] px-6 sm:px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:scale-[1.02] transition">
              Esplora gli artisti →
            </a>
          </div>

          {/* mini trust row */}
          <div data-reveal className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] sm:text-xs font-semibold text-[var(--muted)]">
            <span>✓ Nessuna carta richiesta</span>
            <span>✓ Pagamenti protetti</span>
            <span>✓ Pronto in 2 minuti</span>
          </div>
        </div>

        {/* HERO IMAGE + STAT CARDS FLOTTANTI */}
        <div data-reveal data-delay="2" className="max-w-5xl mx-auto mt-12 sm:mt-20 px-1 sm:px-2" style={{ perspective: "1600px" }}>
          <div
            className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden"
            style={{ boxShadow: "0 40px 90px -40px rgba(40,20,0,.45)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80"
              alt="Concerto live"
              className="w-full h-[260px] sm:h-[420px] object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,11,0) 40%, rgba(10,10,11,.55) 100%)" }} />
            <div className="te-glass absolute bottom-3 left-3 sm:bottom-6 sm:left-6 rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3.5 text-left">
              <p className="text-[9px] sm:text-[11px] uppercase tracking-wide font-bold text-[var(--muted)]">Incassi mese</p>
              <p className="te-display text-lg sm:text-2xl font-extrabold">€ 18.420</p>
              <p className="text-[10px] sm:text-xs font-bold text-green-600">+24%</p>
            </div>
            <div className="te-glass absolute top-3 right-3 sm:top-6 sm:right-6 rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3.5 text-left flex items-center gap-2 sm:gap-2.5">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[var(--orange)] shrink-0" style={{ animation: "te-pulse 2s infinite" }} />
              <div>
                <p className="text-[9px] sm:text-[11px] font-bold text-[var(--muted)]">12 nuovi messaggi</p>
                <p className="text-[10px] sm:text-xs font-bold text-[var(--orange)]">in tempo reale</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MARQUEE LOGOS ===================== */}
      <section className="py-8 overflow-hidden border-y border-black/5 bg-white">
        <div className="flex whitespace-nowrap" style={{ animation: "te-marquee 28s linear infinite" }}>
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex items-center gap-12 px-6 text-[var(--muted)] font-bold te-display text-lg">
              <span>DJ &amp; Producer</span><span className="text-[var(--orange)]">●</span>
              <span>Band Live</span><span className="text-[var(--orange)]">●</span>
              <span>Promoter</span><span className="text-[var(--orange)]">●</span>
              <span>Club &amp; Venue</span><span className="text-[var(--orange)]">●</span>
              <span>Agenzie</span><span className="text-[var(--orange)]">●</span>
              <span>Festival</span><span className="text-[var(--orange)]">●</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FEATURES (3 core) ===================== */}
      <section id="features" className="py-20 sm:py-28 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="max-w-2xl mb-14">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">Tutto in un posto</p>
            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Tre strumenti, <span className="text-[var(--orange)]">un solo flusso</span> di lavoro.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* CHAT */}
            <TiltCard className="rounded-[2rem]" >
              <div data-reveal className="h-full bg-white rounded-[2rem] border border-black/5 p-8 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 grid place-items-center mb-6">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </div>
                <h3 className="te-display text-2xl font-extrabold mb-2">Chat in tempo reale</h3>
                <p className="text-[var(--muted)] leading-relaxed">Tratti, negozi e confermi senza uscire dalla piattaforma. Notifiche istantanee, cronologia e proposte di booking direttamente in chat.</p>
                <div className="mt-6 flex flex-col gap-2">
                  <div className="self-start bg-[var(--paper)] border border-black/5 rounded-2xl rounded-bl-md px-4 py-2 text-sm font-medium">Disponibile il 14 giugno?</div>
                  <div className="self-end bg-[var(--orange)] text-white rounded-2xl rounded-br-md px-4 py-2 text-sm font-semibold">Sì! Ti mando la proposta ✦</div>
                </div>
              </div>
            </TiltCard>

            {/* PAGAMENTI */}
            <TiltCard className="rounded-[2rem]" glow="rgba(40,200,100,.22)">
              <div data-reveal data-delay="1" className="h-full bg-[var(--ink)] text-white rounded-[2rem] p-8 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-white/10 grid place-items-center mb-6">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
                </div>
                <h3 className="te-display text-2xl font-extrabold mb-2">Pagamenti sicuri</h3>
                <p className="text-white/70 leading-relaxed">Cachet protetti con sistema di garanzia: i fondi vengono rilasciati a evento confermato. Fatturazione e ricevute automatiche.</p>
                <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Cachet protetto</span>
                    <span className="font-bold te-display">€ 1.200</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-2/3 rounded-full" style={{ background: "linear-gradient(90deg,var(--orange),#ffb98a)" }} />
                  </div>
                  <p className="mt-2 text-xs text-green-400 font-bold">🔒 In garanzia · rilascio post-evento</p>
                </div>
              </div>
            </TiltCard>

            {/* MARKETPLACE */}
            <TiltCard className="rounded-[2rem]">
              <div data-reveal data-delay="2" className="h-full bg-white rounded-[2rem] border border-black/5 p-8 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 grid place-items-center mb-6">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-5h16l1 5"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 22V12h6v10"/></svg>
                </div>
                <h3 className="te-display text-2xl font-extrabold mb-2">Marketplace artisti</h3>
                <p className="text-[var(--muted)] leading-relaxed">Sfoglia profili verificati, ascolta demo, confronta cachet e disponibilità. Filtra per genere, città e budget in pochi secondi.</p>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[
                    { t: "DJ", src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=70" },
                    { t: "Live", src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=200&q=70" },
                    { t: "Band", src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=70" },
                  ].map((m) => (
                    <img key={m.t} src={m.src} alt={m.t} className="w-full aspect-square object-cover rounded-xl" />
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ===================== MARKETPLACE SHOWCASE ===================== */}
      <section id="marketplace" className="py-20 sm:py-28 px-5 sm:px-6 bg-white border-y border-black/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div data-reveal>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">Marketplace</p>
            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Il talento giusto, <br /> a portata di clic.
            </h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed mb-8">
              Per gli <strong className="text-[var(--ink)]">organizer</strong>: trova e prenoti artisti verificati in tempo record.
              Per gli <strong className="text-[var(--ink)]">artisti e promoter</strong>: una vetrina professionale che lavora per te 24/7.
            </p>
            <ul className="space-y-3">
              {["Profili verificati con demo audio/video", "Cachet e disponibilità trasparenti", "Recensioni reali post-evento", "Richiesta di booking in 1 clic"].map((t) => (
                <li key={t} className="flex items-center gap-3 font-semibold">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-[var(--orange)] text-white text-xs">✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/register" className="te-cta inline-block mt-9 bg-[var(--ink)] text-white px-7 py-3.5 rounded-full font-bold hover:scale-[1.03] transition">
              Pubblica il tuo profilo
            </Link>
          </div>

          {/* griglia card artisti */}
          <div data-reveal data-delay="1" className="grid grid-cols-2 gap-4">
            {[
              { n: "Marco DJ", g: "House / Techno", p: "€ 450", t: 2, src: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&w=500&q=75" },
              { n: "The Lumens", g: "Indie Live", p: "€ 900", t: 8, src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=75" },
              { n: "Sara Vox", g: "Soul / R&B", p: "€ 600", t: 0, src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=500&q=75" },
              { n: "Nova Crew", g: "Hip-Hop", p: "€ 750", t: 18, src: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?auto=format&fit=crop&w=500&q=75" },
            ].map((a, i) => (
              <TiltCard key={a.n} className="rounded-3xl">
                <div className={`bg-[var(--paper)] border border-black/5 rounded-3xl p-4 ${i % 2 ? "mt-6" : ""}`}>
                  <div className="relative mb-4">
                    <img src={a.src} alt={a.n} className="w-full aspect-square object-cover rounded-2xl" />
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-white/90 text-[var(--ink)] px-2 py-0.5 rounded-full">✓ Verificato</span>
                  </div>
                  <h4 className="te-display font-extrabold leading-tight">{a.n}</h4>
                  <p className="text-xs text-[var(--muted)] font-semibold mb-2">{a.g}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--orange)]">{a.p}</span>
                    <span className="text-[11px] text-[var(--muted)] font-semibold">{a.t === 0 ? "nuovo" : `${a.t} eventi`}</span>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CRM / DASHBOARD ===================== */}
      <section id="dashboard" className="py-20 sm:py-28 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* visual: pannello CRM */}
          <div data-reveal className="order-2 lg:order-1" style={{ perspective: "1400px" }}>
            <div
              className="te-glass te-crm-panel rounded-2xl sm:rounded-[2rem] p-3 sm:p-4"
              style={{ boxShadow: "0 40px 90px -40px rgba(40,20,0,.4)" }}
            >
              <div className="rounded-xl sm:rounded-[1.5rem] bg-white border border-black/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
                  <p className="te-display font-extrabold">Il tuo pannello</p>
                  <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">● Live</span>
                </div>
                {/* stat cards */}
                <div className="grid grid-cols-2 gap-3 p-5">
                  <div className="rounded-2xl bg-[var(--paper)] border border-black/5 p-4">
                    <p className="text-[11px] uppercase tracking-wide font-bold text-[var(--muted)]">Saldo disponibile</p>
                    <p className="te-display text-2xl font-extrabold mt-1">€ 4.860</p>
                    <p className="text-xs font-bold text-green-600 mt-1">prelevabile</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--paper)] border border-black/5 p-4">
                    <p className="text-[11px] uppercase tracking-wide font-bold text-[var(--muted)]">Eventi 2026</p>
                    <p className="te-display text-2xl font-extrabold mt-1">28</p>
                    <p className="text-xs font-bold text-[var(--orange)] mt-1">+9 vs 2025</p>
                  </div>
                </div>
                {/* mini bar chart */}
                <div className="px-5 pb-3">
                  <p className="text-[11px] uppercase tracking-wide font-bold text-[var(--muted)] mb-2">Incassi ultimi 6 mesi</p>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 58, 48, 72, 64, 92].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%`, background: i === 5 ? "linear-gradient(180deg,var(--orange),#ffb98a)" : "#ffe0cc" }} />
                    ))}
                  </div>
                </div>
                {/* estratto conto rows */}
                <div className="px-5 py-4 border-t border-black/5 space-y-2.5">
                  {[
                    { d: "Cachet · Festival Sunset", v: "+ € 1.200", c: "text-green-600" },
                    { d: "Commissione piattaforma", v: "− € 96", c: "text-[var(--muted)]" },
                    { d: "Cachet · Club Aurora", v: "+ € 750", c: "text-green-600" },
                  ].map((r) => (
                    <div key={r.d} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)] font-medium">{r.d}</span>
                      <span className={`font-bold ${r.c}`}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* testo */}
          <div data-reveal data-delay="1" className="order-1 lg:order-2">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">Il tuo CRM</p>
            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Non solo booking: <br /> il tuo gestionale completo.
            </h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed mb-8">
              Ogni artista, promoter e locale ha la propria dashboard. Tieni traccia di tutto in un colpo d'occhio:
              guadagni, eventi, contatti e pagamenti, sempre aggiornati in tempo reale.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: "Analitiche in tempo reale", d: "Incassi, margini e andamento mese per mese." },
                { t: "Estratto conto", d: "Ogni cachet, commissione e pagamento tracciato." },
                { t: "Storico eventi", d: "Tutti i tuoi booking passati e futuri in un posto." },
                { t: "Rubrica contatti", d: "Artisti, locali e promoter sempre a portata." },
              ].map((f) => (
                <div key={f.t} className="bg-white rounded-2xl border border-black/5 p-5">
                  <h4 className="te-display font-extrabold mb-1">{f.t}</h4>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>
            <Link href="/register" className="te-cta inline-block mt-8 bg-[var(--ink)] text-white px-7 py-3.5 rounded-full font-bold hover:scale-[1.03] transition">
              Apri la tua dashboard gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== COME FUNZIONA ===================== */}
      <section id="come-funziona" className="py-20 sm:py-28 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div data-reveal className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--orange)] mb-3">Come funziona</p>
            <h2 className="te-display text-3xl sm:text-4xl md:text-5xl font-extrabold">Dal contatto al palco in 3 step.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Scopri", d: "Esplora il marketplace e filtra per genere, città e budget." },
              { n: "02", t: "Contatta", d: "Chatti in tempo reale e ricevi una proposta di booking chiara." },
              { n: "03", t: "Paga sicuro", d: "Confermi con pagamento protetto. I fondi si sbloccano a evento fatto." },
            ].map((s, i) => (
              <div key={s.n} data-reveal data-delay={i} className="relative bg-white rounded-3xl border border-black/5 p-8">
                <span className="te-display text-6xl font-extrabold text-orange-100 absolute top-4 right-5 select-none">{s.n}</span>
                <h3 className="te-display text-2xl font-extrabold mb-2 relative">{s.t}</h3>
                <p className="text-[var(--muted)] leading-relaxed relative">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINALE ===================== */}
      <section className="px-5 sm:px-6 pb-20 sm:pb-28">
        <div data-reveal className="max-w-5xl mx-auto relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden text-center px-6 py-14 sm:px-8 sm:py-20">
          <img src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,11,.92), rgba(26,20,15,.82))" }} />
          <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] max-w-[90vw] rounded-full blur-[110px]"
            style={{ background: "radial-gradient(circle, rgba(255,90,0,.5), transparent 70%)", animation: "te-float 8s ease-in-out infinite" }} />
          <h2 className="te-display text-3xl sm:text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5 relative">
            Pronto a far <span className="te-shimmer">suonare</span> i tuoi eventi?
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-9 relative">
            Unisciti agli artisti, promoter e organizer che gestiscono tutto su TuttoEvento.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="te-cta bg-[var(--orange)] text-white px-8 sm:px-9 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#e85100] transition shadow-[0_18px_40px_-12px_rgba(255,90,0,.7)]">
              Inizia gratis ora
            </Link>
            <Link href="/login" className="bg-white/10 text-white border border-white/15 px-8 sm:px-9 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/15 transition backdrop-blur">
              Accedi
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-black/5 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <span className="te-display font-extrabold text-lg tracking-tight mb-4 inline-block">
              TUTTO<span className="text-[var(--orange)]">EVENTO</span>
            </span>
            <p className="text-[var(--muted)] max-w-sm leading-relaxed">L'ecosistema all-in-one per il booking di artisti: marketplace, chat in tempo reale e pagamenti sicuri.</p>
          </div>
          <div>
            <p className="te-display font-bold mb-3 text-sm">Piattaforma</p>
            <ul className="space-y-2 text-sm text-[var(--muted)] font-semibold">
              <li><a href="#features" className="hover:text-[var(--orange)]">Funzioni</a></li>
              <li><a href="#marketplace" className="hover:text-[var(--orange)]">Marketplace</a></li>
              <li><a href="#dashboard" className="hover:text-[var(--orange)]">Dashboard</a></li>
              <li><a href="#come-funziona" className="hover:text-[var(--orange)]">Come funziona</a></li>
            </ul>
          </div>
          <div>
            <p className="te-display font-bold mb-3 text-sm">Account</p>
            <ul className="space-y-2 text-sm text-[var(--muted)] font-semibold">
              <li><Link href="/login" className="hover:text-[var(--orange)]">Accedi</Link></li>
              <li><Link href="/register" className="hover:text-[var(--orange)]">Registrati</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black/5 py-6 text-center text-xs text-[var(--muted)]">
          © 2026 TuttoEvento. Tutti i diritti riservati.
        </div>
      </footer>
    </main>
  );
}