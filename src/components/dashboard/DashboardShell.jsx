"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import ChatPanel from "./ChatPanel";
import PushNotificationButton from "./PushNotificationButton";
import MobileBottomNav from "./MobileBottomNav";

export default function DashboardShell({ user, children }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    router.push("/login");
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f5f5f6] text-[#111]">
      <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
        <DashboardSidebar user={user} />

        <section className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
          {/* Header con logout */}
          <div className="sticky top-0 z-20 bg-white border-b border-black/5 px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{user?.name || "Utente"}</p>
              <p className="text-xs text-[#6b6b73] capitalize">{user?.role || ""}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm font-bold text-[#6b6b73] hover:text-[#ff5a00] transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loggingOut ? "Uscita..." : "← Esci"}
            </button>
          </div>

          <div className="dashboard-mobile-safe w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-28 lg:pb-6 overflow-x-hidden">
            <div className="w-full max-w-full overflow-x-hidden">
              {children}
            </div>
          </div>
        </section>
      </div>

      <PushNotificationButton user={user} />
      <ChatPanel user={user} />
      <MobileBottomNav user={user} />
    </main>
  );
}