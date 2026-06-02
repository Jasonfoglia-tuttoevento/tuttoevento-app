"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("organizer");
  const [businessMode, setBusinessMode] = useState("both");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Devi accettare i termini e condizioni");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, businessMode, termsAccepted }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Errore registrazione");
        return;
      }
      alert("Registrazione completata. Controlla la tua email.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Errore tecnico");
    } finally {
      setLoading(false);
    }
  }

  const roles = [
    { id: "organizer", label: "Locale", icon: "🏛️" },
    { id: "artist", label: "Artista", icon: "🎤" },
    { id: "promoter", label: "Promoter", icon: "📣" },
  ];

  const termsByRole = {
    organizer: "/termini/locali",
    artist: "/termini/artisti",
    promoter: "/termini/promoter",
  };
  const termsUrl = termsByRole[role] || termsByRole.organizer;

  const modes = [
    { id: "self_service", label: "Gestione Autonoma", desc: "Organizzo gli eventi in autonomia tramite la piattaforma." },
    { id: "managed", label: "Gestione TuttoEvento", desc: "Voglio un referente TuttoEvento per la gestione completa." },
    { id: "both", label: "Entrambe", desc: "Deciderò di volta in volta per ogni evento." },
  ];

  return (
    <main className="te-reg-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-reg-root {
          --orange:#ff5a00; --orange-soft:#ff8246; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73;
          font-family:'Manrope',system-ui,sans-serif; color:var(--ink); background:var(--paper);
          min-height:100vh; display:flex; flex-direction:column; position:relative; overflow-x:hidden;
        }
        .te-reg-root *::selection { background:var(--orange); color:#fff; }
        .te-reg-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-reg-root input::placeholder { color:#9a9aa2; }
        .te-reg-root input[type=text]:focus, .te-reg-root input[type=email]:focus, .te-reg-root input[type=password]:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,0,.12); }
        @keyframes te-reg-float { 0%,100%{transform:translateX(-50%) translateY(0) scale(1);} 50%{transform:translateX(-50%) translateY(-24px) scale(1.05);} }
        @keyframes te-reg-spin { to { transform: rotate(360deg); } }
        .te-reg-cta { position:relative; isolation:isolate; }
        .te-reg-cta::before { content:""; position:absolute; inset:-2px; border-radius:16px; z-index:-1; background:conic-gradient(from 0deg,var(--orange),#ffb98a,var(--orange)); opacity:0; transition:opacity .35s; filter:blur(8px); }
        .te-reg-cta:hover::before { opacity:.5; animation:te-reg-spin 4s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .te-reg-cta::before { animation:none !important; } }
      `}</style>

      <div aria-hidden style={{ position: "absolute", top: "-160px", left: "50%", transform: "translateX(-50%)", width: "560px", height: "560px", maxWidth: "95vw", borderRadius: "999px", filter: "blur(120px)", background: "radial-gradient(circle, rgba(255,90,0,.22), transparent 70%)", animation: "te-reg-float 9s ease-in-out infinite", zIndex: 0 }} />

      <header className="relative z-10 px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="te-reg-display font-extrabold text-base sm:text-lg tracking-tight">
          TUTTO<span style={{ color: "var(--orange)" }}>EVENTO</span>
        </Link>
        <Link href="/login" className="text-sm font-bold text-[var(--muted)] hover:text-[var(--orange)] transition">
          Accedi →
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 pb-12 pt-2 sm:pt-0">
        <div className="w-full max-w-[560px] bg-white rounded-3xl sm:rounded-[36px] border border-black/5 p-6 sm:p-10" style={{ boxShadow: "0 30px 60px -30px rgba(20,12,0,.22)" }}>
          <div className="mb-7 sm:mb-8">
            <p className="uppercase tracking-[0.22em] text-[var(--orange)] text-[11px] font-extrabold mb-3">Registrazione</p>
            <h1 className="te-reg-display text-3xl sm:text-5xl font-extrabold leading-[1.02]">Crea il tuo account</h1>
            <p className="text-[var(--muted)] mt-3 text-base sm:text-lg leading-relaxed">Gestisci eventi, artisti, locali e booking in un unico posto.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5">Nome</label>
              <input type="text" placeholder="Mario Rossi" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3.5 text-base outline-none transition" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">Email</label>
              <input type="email" placeholder="nome@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3.5 text-base outline-none transition" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">Password</label>
              <input type="password" placeholder="Almeno 8 caratteri" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3.5 text-base outline-none transition" />
            </div>

            <div className="pt-2">
              <p className="text-sm font-bold mb-2.5">Tipologia account</p>
              <div className="grid grid-cols-3 gap-2.5">
                {roles.map((r) => {
                  const active = role === r.id;
                  return (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      className={`rounded-2xl px-2 py-3.5 font-bold text-sm transition flex flex-col items-center gap-1.5 ${active ? "bg-[var(--orange)] text-white shadow-[0_10px_24px_-10px_rgba(255,90,0,.7)]" : "bg-[var(--paper)] border border-black/10 text-[var(--ink)] hover:border-[var(--orange)]/40"}`}>
                      <span className="text-xl leading-none">{r.icon}</span>
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {role === "organizer" && (
              <div className="pt-2">
                <p className="text-sm font-bold mb-2.5">Modalità di gestione eventi</p>
                <div className="space-y-2.5">
                  {modes.map((opt) => {
                    const active = businessMode === opt.id;
                    return (
                      <button key={opt.id} type="button" onClick={() => setBusinessMode(opt.id)}
                        className={`w-full rounded-2xl px-4 py-3.5 text-left transition flex items-start gap-3 ${active ? "bg-[var(--orange)] text-white shadow-[0_10px_24px_-10px_rgba(255,90,0,.7)]" : "bg-[var(--paper)] border border-black/10 hover:border-[var(--orange)]/40"}`}>
                        <span className={`mt-0.5 shrink-0 grid place-items-center w-5 h-5 rounded-full border-2 ${active ? "border-white" : "border-black/25"}`}>
                          {active && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        <span>
                          <span className="block font-bold text-sm">{opt.label}</span>
                          <span className={`block text-xs mt-0.5 ${active ? "text-white/80" : "text-[var(--muted)]"}`}>{opt.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-5 h-5 accent-[var(--orange)] shrink-0" />
              <span className="text-sm text-[var(--muted)] leading-relaxed">
                Dichiaro di aver letto e accettato i{" "}
                <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--orange)] hover:underline">termini e condizioni</a>.
              </span>
            </label>

            <button disabled={loading || !termsAccepted}
              className="te-reg-cta w-full bg-[var(--ink)] text-white rounded-2xl py-4 font-bold text-base mt-3 transition hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
              {loading ? "Creazione in corso..." : "Crea account gratis"}
            </button>

            <p className="text-center text-sm text-[var(--muted)] pt-1">
              Hai già un account?{" "}
              <Link href="/login" className="font-bold text-[var(--orange)] hover:underline">Accedi</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}