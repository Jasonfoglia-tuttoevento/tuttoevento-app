"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("organizer");

  const [businessMode, setBusinessMode] = useState("both");

  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
          role,
          businessMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Errore registrazione");
        return;
      }

      alert("Registrazione completata");

      router.push("/login");

    } catch (err) {

      console.log(err);

      alert("Errore tecnico");

    } finally {

      setLoading(false);

    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f6] flex items-center justify-center p-6">
      <div className="w-full max-w-[620px] bg-white rounded-[36px] border border-black/5 p-8 shadow-sm">
        <div className="mb-8">
          <p className="uppercase tracking-[4px] text-[#ff5a00] text-xs font-black mb-3">
            TuttoEvento
          </p>

          <h1 className="text-5xl font-black tracking-[-0.05em] leading-none">
            Crea il tuo account
          </h1>

          <p className="text-black/50 mt-4 text-lg">
            Gestisci eventi, artisti, locali e booking.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none"
          />

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none"
          />

          <div className="pt-2">
            <p className="text-sm font-black mb-3">
              Tipologia account
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole("organizer")}
                className={
                  role === "organizer"
                    ? "bg-[#ff5a00] text-white rounded-2xl p-4 font-black"
                    : "bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 font-black"
                }
              >
                Locale
              </button>

              <button
                type="button"
                onClick={() => setRole("artist")}
                className={
                  role === "artist"
                    ? "bg-[#ff5a00] text-white rounded-2xl p-4 font-black"
                    : "bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 font-black"
                }
              >
                Artista
              </button>

              <button
                type="button"
                onClick={() => setRole("promoter")}
                className={
                  role === "promoter"
                    ? "bg-[#ff5a00] text-white rounded-2xl p-4 font-black"
                    : "bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 font-black"
                }
              >
                Promoter
              </button>
            </div>
          </div>

          {role === "organizer" && (
            <div className="pt-4">
              <p className="text-sm font-black mb-3">
                Modalità di gestione eventi
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setBusinessMode("self_service")}
                  className={
                    businessMode === "self_service"
                      ? "w-full bg-[#ff5a00] text-white rounded-2xl p-4 text-left"
                      : "w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 text-left"
                  }
                >
                  <p className="font-black">
                    Gestione Autonoma
                  </p>

                  <p className="text-sm opacity-70 mt-1">
                    Organizzo gli eventi in autonomia tramite la piattaforma.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessMode("managed")}
                  className={
                    businessMode === "managed"
                      ? "w-full bg-[#ff5a00] text-white rounded-2xl p-4 text-left"
                      : "w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 text-left"
                  }
                >
                  <p className="font-black">
                    Gestione TuttoEvento
                  </p>

                  <p className="text-sm opacity-70 mt-1">
                    Voglio un referente TuttoEvento per la gestione completa.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessMode("both")}
                  className={
                    businessMode === "both"
                      ? "w-full bg-[#ff5a00] text-white rounded-2xl p-4 text-left"
                      : "w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 text-left"
                  }
                >
                  <p className="font-black">
                    Entrambe
                  </p>

                  <p className="text-sm opacity-70 mt-1">
                    Deciderò di volta in volta per ogni evento.
                  </p>
                </button>
              </div>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-[#111] text-white rounded-2xl py-4 font-black mt-6"
          >
            {loading ? "Creazione..." : "CREA ACCOUNT"}
          </button>
        </form>
      </div>
    </main>
  );
}