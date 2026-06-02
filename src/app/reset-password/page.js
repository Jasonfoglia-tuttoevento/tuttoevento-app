"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase mette il token nell'hash dell'URL dopo il redirect
    const supabase = createSupabaseBrowserClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(""); setIsError(false);
    if (password !== confirm) { setIsError(true); setMessage("Le password non coincidono."); return; }
    if (password.length < 8) { setIsError(true); setMessage("Almeno 8 caratteri."); return; }
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { setIsError(true); setMessage(error.message); return; }
      setMessage("Password aggiornata. Reindirizzamento...");
      setTimeout(() => router.push("/login"), 1500);
    } catch { setIsError(true); setMessage("Errore tecnico."); }
    finally { setLoading(false); }
  }

  return (
    <main className="te-rp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .te-rp-root { --orange:#ff5a00; --ink:#0a0a0b; --paper:#fbfaf8; --muted:#6b6b73; font-family:'Manrope',system-ui,sans-serif; color:var(--ink); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; background:var(--ink); position:relative; overflow:hidden; }
        .te-rp-display { font-family:'Sora',sans-serif; letter-spacing:-0.03em; }
        .te-rp-root input:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,0,.15); outline:none; }
      `}</style>
      <div aria-hidden style={{ position:"absolute", top:"-140px", left:"50%", transform:"translateX(-50%)", width:"560px", height:"560px", borderRadius:"999px", filter:"blur(120px)", background:"radial-gradient(circle, rgba(255,90,0,.45), transparent 70%)", zIndex:0 }} />
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-3xl p-7 sm:p-9" style={{ boxShadow:"0 40px 80px -30px rgba(0,0,0,.6)" }}>
        <Link href="/" className="te-rp-display block text-center font-extrabold text-xl mb-7">
          TUTTO<span style={{ color:"var(--orange)" }}>EVENTO</span>
        </Link>
        <h1 className="te-rp-display text-3xl font-extrabold text-center">Nuova password</h1>
        <p className="text-center text-[var(--muted)] mt-2 mb-7">Scegli una nuova password per il tuo account.</p>

        {!ready ? (
          <p className="text-center text-[var(--muted)]">Verifica del link in corso...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5">Nuova password</label>
              <input className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3.5 transition" placeholder="Almeno 8 caratteri" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">Conferma password</label>
              <input className="w-full bg-[var(--paper)] border border-black/10 rounded-2xl px-4 py-3.5 transition" placeholder="Ripeti la password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <button disabled={loading} className="w-full bg-[var(--orange)] text-white rounded-2xl py-4 font-bold hover:bg-[#e85100] transition disabled:opacity-50">
              {loading ? "Aggiornamento..." : "Reimposta password"}
            </button>
          </form>
        )}

        {message && <p className={`text-center mt-5 font-bold ${isError ? "text-red-500" : "text-green-600"}`}>{message}</p>}
      </div>
    </main>
  );
}