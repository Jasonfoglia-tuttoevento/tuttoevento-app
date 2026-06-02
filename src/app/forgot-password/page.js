"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || data.error || "Richiesta inviata.");
    } catch {
      setMessage("Errore tecnico. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="te-fp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-fp-root { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; position:relative; overflow:hidden; background:var(--ink); }
        .te-fp-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-fp-root input:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,0,.15); outline:none; }
      `}</style>

      <div aria-hidden style={{ position:"absolute", top:"-140px", left:"50%", transform:"translateX(-50%)", width:"560px", height:"560px", maxWidth:"95vw", borderRadius:"999px", filter:"blur(120px)", background:"radial-gradient(circle, rgba(255,90,0,.45), transparent 70%)", zIndex:0 }} />

      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-3xl sm:rounded-[32px] border border-black/5 p-7 sm:p-9" style={{ boxShadow:"0 40px 80px -30px rgba(0,0,0,.6)" }}>
        <Link href="/" className="te-fp-display block text-center font-extrabold text-xl tracking-tight mb-7">
          TUTTO<span style={{ color:"var(--orange)" }}>EVENTO</span>
        </Link>

        <h1 className="te-fp-display text-3xl sm:text-4xl font-extrabold text-center">Password dimenticata?</h1>
        <p className="text-center text-[var(--muted)] mt-2 mb-7">Inserisci la tua email e ti invieremo un link per reimpostarla.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">Email</label>
            <input className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3.5 text-base transition" placeholder="nome@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button disabled={loading} className="w-full bg-[var(--orange)] text-white rounded-2xl py-4 font-bold text-base hover:bg-[#e85100] transition disabled:opacity-50">
            {loading ? "Invio in corso..." : "Invia link di recupero"}
          </button>
        </form>

        {message && <p className="text-center mt-5 font-bold text-[var(--orange)]">{message}</p>}

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          <Link href="/login" className="font-bold text-[var(--orange)] hover:underline">&larr; Torna al login</Link>
        </p>
      </div>
    </main>
  );
}