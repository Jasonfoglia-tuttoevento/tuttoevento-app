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
    try { await fetch("/api/logout", { method: "POST" }); } catch {}
    router.push("/login");
  }

  return (
    <main style={{ minHeight:"100vh", width:"100%", maxWidth:"100%", overflowX:"hidden", background:"#f5f5f6", color:"#111" }}>
      <div style={{ display:"flex", minHeight:"100vh", width:"100%", maxWidth:"100%", overflowX:"hidden" }}>

        <DashboardSidebar user={user} />

        <section style={{ flex:1, minWidth:0, width:"100%", maxWidth:"100%", overflowX:"hidden" }}>

          {/* Header */}
          <div style={{ position:"sticky", top:0, zIndex:20, background:"white", borderBottom:"1px solid rgba(0,0,0,.06)", padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ minWidth:0 }}>
              <p style={{ fontFamily:"'Manrope',system-ui,sans-serif", fontWeight:700, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:0 }}>
                {user?.name || "Utente"}
              </p>
              <p style={{ fontFamily:"'Manrope',system-ui,sans-serif", fontSize:12, color:"#6b6b73", textTransform:"capitalize", margin:0 }}>
                {user?.role || ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ fontFamily:"'Manrope',system-ui,sans-serif", fontSize:13, fontWeight:700, color:"#6b6b73", background:"none", border:"none", cursor:"pointer", transition:"color .2s", opacity: loggingOut ? .5 : 1 }}
              onMouseEnter={e => e.target.style.color = "#ff5a00"}
              onMouseLeave={e => e.target.style.color = "#6b6b73"}
            >
              {loggingOut ? "Uscita..." : "← Esci"}
            </button>
          </div>

          {/* Contenuto */}
          <div style={{ width:"100%", maxWidth:1400, margin:"0 auto", padding:"20px 20px 100px", overflowX:"hidden" }}>
            <div style={{ width:"100%", maxWidth:"100%", overflowX:"hidden" }}>
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