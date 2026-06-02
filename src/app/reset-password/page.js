"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Link non valido o scaduto.");
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Link non valido o scaduto.");
      return;
    }

    if (password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Errore durante il reset password.");
        return;
      }

      setMessage(data.message || "Password aggiornata correttamente.");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Errore di connessione.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f6] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-black/5 rounded-[28px] p-8 shadow-sm">
        <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black text-center mb-3">
          TuttoEvento
        </p>

        <h1 className="text-4xl font-black text-center tracking-[-0.04em]">
          Reimposta password
        </h1>

        <p className="text-center text-black/50 mt-3 mb-8">
          Inserisci una nuova password per accedere alla tua area riservata.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl mb-4 font-bold text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 border border-green-100 p-4 rounded-2xl mb-4 font-bold text-sm">
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Nuova password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none focus:border-[#ff5a00]"
              required
              minLength={8}
            />

            <input
              type="password"
              placeholder="Conferma password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none focus:border-[#ff5a00]"
              required
              minLength={8}
            />

            <button
              type="submit"
              disabled={!token}
              className="w-full bg-[#ff5a00] disabled:bg-black/20 text-white rounded-2xl py-4 font-black"
            >
              AGGIORNA PASSWORD
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full mt-5 text-black/45 font-bold text-sm hover:text-black"
        >
          Torna al login
        </button>
      </div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f5f5f6] flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-b-[#ff5a00]" />
    </main>
  );
}