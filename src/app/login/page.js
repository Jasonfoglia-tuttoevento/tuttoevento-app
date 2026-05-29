"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function loginUser(e) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Login non riuscito");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));

    setMessage("Login riuscito. Benvenuto " + data.name);

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-[#0b0b0d] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[28px] p-8 shadow-2xl border">
        <img src="/logo.png" alt="TuttoEvento" className="w-60 mx-auto mb-8" />

        <h1 className="text-4xl font-black text-center">
          Accedi
        </h1>

        <p className="text-center text-neutral-500 mt-3 mb-8">
          Entra nella tua area TuttoEvento
        </p>

        <form onSubmit={loginUser} className="space-y-4">
          <input
            className="w-full border rounded-xl p-4"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border rounded-xl p-4"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-[#ff5a00] text-white rounded-xl py-4 font-black">
            ENTRA
          </button>
        </form>

        {message && (
          <p className="text-center mt-5 font-bold text-[#ff5a00]">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}