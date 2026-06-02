"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loginUser(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || "Credenziali errate");
        return;
      }

      // Niente localStorage: la sessione è nei cookie HttpOnly
      router.push("/dashboard");
    } catch {
      setIsError(true);
      setMessage("Errore tecnico. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="te-login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-login-root {
          --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73;
          font-family:'Manrope',system-ui,sans-serif; color:var(--ink); min-height:100vh;
          display:flex; align-items:center; justify-content:center; padding:24px;
          position:relative; overflow:hidden; background:var(--ink);
        }
        .te-login-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-login-root input:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,0,.15); outline:none; }
        @keyframes te-login-float { 0%,100%{transform:translate(-50%,0);} 50%{transform:translate(-50%,-24px);} }
        @keyframes te-spin { to { transform: rotate(360deg); } }
        .te-login-cta { position:relative; isolation:isolate; }
        .te-login-cta::before { content:""; position:absolute; inset:-2px; border-radius:16px; z-index:-1; background:conic-gradient(from 0deg,var(--orange),#ffb98a,var(--orange)); opacity:0; transition:opacity .35s; filter:blur(8px); }
        .te-login-cta:hover::before { opacity:.55; animation:te-spin 4s linear infinite; }
      `}</style>

      <div aria-hidden style={{ position:"absolute", top:"-140px", left:"50%", transform:"translateX(-50%)", width:"560px", height:"560px", maxWidth:"95vw", borderRadius:"999px", filter:"blur(120px)", background:"radial-gradient(circle, rgba(255,90,0,.45), transparent 70%)", animation:"te-login-float 9s ease-in-out infinite", zIndex:0 }} />

      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-3xl sm:rounded-[32px] border border-black/5 p-7 sm:p-9" style={{ boxShadow:"0 40px 80px -30px rgba(0,0,0,.6)" }}>
        <Link href="/" className="te-login-display block text-center font-extrabold text-xl tracking-tight mb-7">
          TUTTO<span style={{ color:"var(--orange)" }}>EVENTO</span>
        </Link>

        <h1 className="te-login-display text-3xl sm:text-4xl font-extrabold text-center">Accedi</h1>
        <p className="text-center text-[var(--muted)] mt-2 mb-7">Entra nella tua area TuttoEvento</p>

        <form onSubmit={loginUser} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">Email</label>
            <input className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3.5 text-base transition" placeholder="nome@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">Password</label>
            <input className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3.5 text-base transition" placeholder="La tua password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button disabled={loading} className="te-login-cta w-full bg-[var(--orange)] text-white rounded-2xl py-4 font-bold text-base hover:bg-[#e85100] transition disabled:opacity-50 shadow-[0_14px_30px_-12px_rgba(255,90,0,.6)]">
            {loading ? "Accesso in corso..." : "Entra"}
          </button>

          <p className="text-center">
            <Link href="/forgot-password" className="text-sm font-bold text-[var(--muted)] hover:text-[var(--orange)] transition">
              Password dimenticata?
            </Link>
          </p>
        </form>

        {message && <p className={`text-center mt-5 font-bold ${isError ? "text-red-500" : "text-green-600"}`}>{message}</p>}

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Non hai un account?{" "}
          <Link href="/register" className="font-bold text-[var(--orange)] hover:underline">Registrati</Link>
        </p>
      </div>
    </main>
  );
}