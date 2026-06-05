"use client";

import { useEffect, useMemo, useState } from "react";

const PUSH_STORAGE_VERSION = "v2";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function PushNotificationButton({ user }) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isHidden, setIsHidden] = useState(true);

  const userId = user?.id ? String(user.id) : "";
  const storageKey = useMemo(() => userId ? `tuttoevento-push-supabase-${PUSH_STORAGE_VERSION}-${userId}` : "", [userId]);

  useEffect(() => {
    if (!userId) { setIsHidden(true); return; }
    const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);
    if (!supported) { setIsHidden(true); return; }
    setPermission(Notification.permission);
    const alreadyRegistered = storageKey && localStorage.getItem(storageKey) === "true";
    setIsHidden(!!alreadyRegistered);
  }, [userId, storageKey]);

  async function enableNotifications() {
    if (!userId || !isSupported) { setMessage("Notifiche non supportate su questo browser."); return; }
    setIsLoading(true); setMessage("Attivazione notifiche...");
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      setPermission(perm);
      if (perm !== "granted") { setMessage("Permesso notifiche non concesso."); setIsLoading(false); return; }
      const keyRes = await fetch("/api/push/public-key");
      const keyData = await keyRes.json();
      if (!keyRes.ok || !keyData.publicKey) { setMessage(keyData?.error || "Errore chiave pubblica."); setIsLoading(false); return; }
      const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
      const existing = await registration.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscription, userAgent: navigator.userAgent }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) { setMessage(saveData?.error || "Errore salvataggio subscription."); setIsLoading(false); return; }
      if (storageKey) localStorage.setItem(storageKey, "true");
      setMessage("✓ Notifiche attivate");
      setPermission("granted");
      setTimeout(() => setIsHidden(true), 1500);
    } catch (err) {
      setMessage(err?.message ? `Errore: ${err.message}` : "Errore attivazione notifiche.");
    }
    setIsLoading(false);
  }

  function dismissBanner() {
    if (storageKey) localStorage.setItem(storageKey, "true");
    setIsHidden(true);
  }

  function resetAndShowAgain() {
    if (storageKey) localStorage.removeItem(storageKey);
    setMessage(""); setIsHidden(false);
  }

  if (!userId) return null;
  // Non mostrare per admin e referent — usano già la dashboard completa
  if (user?.role === "admin" || user?.role === "referent") return null;

  return (
    <>
      <style>{`
        .pnb-wrap { position:fixed; top:16px; left:16px; right:16px; z-index:80; }
        @media(min-width:768px) { .pnb-wrap { left:auto; right:24px; max-width:420px; } }
        .pnb-card { background:rgba(255,255,255,.97); border:1px solid rgba(0,0,0,.1); border-radius:28px; padding:18px 20px; box-shadow:0 8px 40px rgba(0,0,0,.15); }
        .pnb-row { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; }
        .pnb-close { width:36px; height:36px; border-radius:12px; background:#f5f5f6; border:none; cursor:pointer; font-size:1.2rem; font-weight:900; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .pnb-btn { width:100%; margin-top:14px; background:#0a0a0b; color:white; border:none; border-radius:14px; padding:12px; font-weight:700; font-size:.875rem; cursor:pointer; font-family:'Manrope',system-ui,sans-serif; }
        .pnb-btn:disabled { opacity:.4; cursor:not-allowed; }
        .pnb-bell { display:none; position:fixed; top:18px; right:24px; z-index:70; background:white; border:1px solid rgba(0,0,0,.1); border-radius:14px; padding:9px 16px; font-size:.8rem; font-weight:700; color:rgba(0,0,0,.55); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.08); font-family:'Manrope',system-ui,sans-serif; }
        @media(min-width:1024px) { .pnb-bell { display:block; } }
        .pnb-bell:hover { color:#0a0a0b; }
      `}</style>

      {!isHidden && (
        <div className="pnb-wrap">
          <div className="pnb-card">
            <div className="pnb-row">
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color:"#ff5a00", fontWeight:700, marginBottom:4, fontFamily:"'Manrope',system-ui,sans-serif" }}>Notifiche</p>
                <p style={{ fontWeight:700, fontSize:".9rem", marginBottom:4, fontFamily:"'Manrope',system-ui,sans-serif" }}>Attiva le notifiche su questo dispositivo</p>
                <p style={{ fontSize:".8rem", color:"rgba(0,0,0,.5)", lineHeight:1.6, fontFamily:"'Manrope',system-ui,sans-serif" }}>Ricevi avvisi per messaggi, booking e aggiornamenti in tempo reale.</p>
                {permission === "denied" && <p style={{ fontSize:".8rem", color:"#dc2626", fontWeight:700, marginTop:6 }}>Notifiche bloccate. Riattivale dalle impostazioni del browser.</p>}
                {message && <p style={{ fontSize:".8rem", color:"#ff5a00", fontWeight:700, marginTop:6 }}>{message}</p>}
              </div>
              <button className="pnb-close" onClick={dismissBanner}>×</button>
            </div>
            <button className="pnb-btn" onClick={enableNotifications} disabled={isLoading || permission === "denied"}>
              {isLoading ? "Attivazione..." : permission === "granted" ? "Aggiorna notifiche" : "Attiva notifiche"}
            </button>
          </div>
        </div>
      )}

      {isHidden && (
        <button className="pnb-bell" onClick={resetAndShowAgain}>🔔 Notifiche</button>
      )}
    </>
  );
}