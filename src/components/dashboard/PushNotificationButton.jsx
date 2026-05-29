"use client";

import { useEffect, useMemo, useState } from "react";

const PUSH_STORAGE_VERSION = "v2";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushNotificationButton({ user }) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isHidden, setIsHidden] = useState(true);

  const userId = user?.id ? String(user.id) : "";

  const storageKey = useMemo(() => {
    if (!userId) return "";

    return `tuttoevento-push-supabase-${PUSH_STORAGE_VERSION}-${userId}`;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setIsHidden(true);
      return;
    }

    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (!supported) {
      setIsHidden(true);
      return;
    }

    const currentPermission = Notification.permission;

    setPermission(currentPermission);

    const alreadyRegistered =
      storageKey && localStorage.getItem(storageKey) === "true";

    if (alreadyRegistered) {
      setIsHidden(true);
      return;
    }

    setIsHidden(false);
  }, [userId, storageKey]);

  async function enableNotifications() {
    if (!userId) {
      setMessage("Utente non trovato. Effettua di nuovo il login.");
      return;
    }

    if (!isSupported) {
      setMessage("Questo browser non supporta le notifiche push web.");
      return;
    }

    setIsLoading(true);
    setMessage("Attivazione notifiche...");

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      await navigator.serviceWorker.ready;

      const requestedPermission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;

      setPermission(requestedPermission);

      if (requestedPermission !== "granted") {
        setMessage("Permesso notifiche non concesso.");
        setIsLoading(false);
        return;
      }

      const keyRes = await fetch("/api/push/public-key");
      const keyData = await keyRes.json();

      if (!keyRes.ok || !keyData.publicKey) {
        setMessage(
          keyData?.error ||
            "Errore nel recupero della chiave pubblica notifiche."
        );

        setIsLoading(false);
        return;
      }

      const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);

      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          subscription,
          userAgent: navigator.userAgent,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        setMessage(
          saveData?.error ||
            "Errore durante il salvataggio della subscription."
        );

        setIsLoading(false);
        return;
      }

      if (storageKey) {
        localStorage.setItem(storageKey, "true");
      }

      setMessage("Notifiche attivate e salvate su Supabase.");
      setPermission("granted");

      setTimeout(() => {
        setIsHidden(true);
      }, 1500);
    } catch (error) {
      console.error("Errore attivazione notifiche:", error);

      setMessage(
        error?.message
          ? `Errore: ${error.message}`
          : "Errore durante l’attivazione notifiche."
      );
    }

    setIsLoading(false);
  }

  function dismissBanner() {
    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }

    setIsHidden(true);
  }

  function resetAndShowAgain() {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }

    setMessage("");
    setIsHidden(false);
  }

  if (!userId) return null;

  return (
    <>
      {!isHidden && (
        <div className="fixed top-4 left-4 right-4 z-[80] md:left-auto md:right-6 md:max-w-[420px]">
          <div className="rounded-[28px] border border-black/10 bg-white/95 backdrop-blur-xl p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[2px] text-[#ff5a00] font-black">
                  Notifiche
                </p>

                <p className="font-black mt-1">
                  Attiva le notifiche su questo dispositivo
                </p>

                <p className="text-sm text-black/50 mt-1 leading-relaxed">
                  Serve per ricevere avvisi quando arrivano nuovi messaggi,
                  booking o aggiornamenti.
                </p>

                {permission === "denied" && (
                  <p className="text-sm text-red-500 font-bold mt-2">
                    Le notifiche sono bloccate da Chrome. Riattivale dalle
                    impostazioni del sito.
                  </p>
                )}

                {message && (
                  <p className="text-sm text-[#ff5a00] font-bold mt-2">
                    {message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={dismissBanner}
                className="w-9 h-9 rounded-2xl bg-[#f5f5f6] font-black shrink-0"
              >
                ×
              </button>
            </div>

            <button
              type="button"
              onClick={enableNotifications}
              disabled={isLoading || permission === "denied"}
              className="w-full mt-4 bg-[#111] text-white px-5 py-3 rounded-2xl font-black text-sm disabled:opacity-40"
            >
              {isLoading
                ? "Attivazione..."
                : permission === "granted"
                ? "Aggiorna notifiche"
                : "Attiva notifiche"}
            </button>
          </div>
        </div>
      )}

      {isHidden && (
        <button
          type="button"
          onClick={resetAndShowAgain}
          className="hidden lg:block fixed top-5 right-6 z-[70] bg-white border border-black/10 shadow-sm rounded-2xl px-4 py-3 text-sm font-black text-black/60 hover:text-black"
        >
          Notifiche
        </button>
      )}
    </>
  );
}