"use client";

import { useEffect, useState } from "react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Registra Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registrato"))
        .catch((e) => console.error("SW error:", e));
    }

    // Controlla se già installata
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // iOS: non supporta beforeinstallprompt, mostra istruzioni manuali
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Android/Chrome: intercetta il prompt di installazione
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostra banner dopo 3 secondi
      setTimeout(() => setShowBanner(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: mostra banner dopo 5 secondi se non installata
    if (ios && !localStorage.getItem("pwa-ios-dismissed")) {
      setTimeout(() => setShowBanner(true), 5000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
    setShowBanner(false);
  }

  function dismiss() {
    setShowBanner(false);
    if (isIOS) localStorage.setItem("pwa-ios-dismissed", "1");
  }

  if (isInstalled || !showBanner) return null;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, width: "calc(100% - 32px)", maxWidth: 420,
      background: "#0a0a0b", color: "white", borderRadius: 20,
      padding: "16px 18px", boxShadow: "0 20px 60px rgba(0,0,0,.5)",
      display: "flex", alignItems: "center", gap: 14, fontFamily: "'Manrope',sans-serif",
    }}>
      <img src="/icons/icon-72x72.png" alt="TuttoEvento" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>
          Installa TuttoEvento
        </p>
        {isIOS ? (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.4 }}>
            Tocca <strong style={{ color: "#ff5a00" }}>Condividi</strong> poi <strong style={{ color: "#ff5a00" }}>"Aggiungi a schermata Home"</strong>
          </p>
        ) : (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
            Installa l'app per un'esperienza migliore
          </p>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {!isIOS && (
          <button onClick={handleInstall} style={{
            background: "#ff5a00", color: "white", border: "none",
            borderRadius: 100, padding: "8px 16px", fontWeight: 700,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>Installa</button>
        )}
        <button onClick={dismiss} style={{
          background: "rgba(255,255,255,.1)", color: "white", border: "none",
          borderRadius: 100, padding: "8px 12px", fontWeight: 700,
          fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        }}>×</button>
      </div>
    </div>
  );
}