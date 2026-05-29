import DashboardSidebar from "./DashboardSidebar";
import ChatPanel from "./ChatPanel";
import PushNotificationButton from "./PushNotificationButton";
import MobileBottomNav from "./MobileBottomNav";

export default function DashboardShell({ user, children }) {
  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f5f5f6] text-[#111]">
      <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
        <DashboardSidebar user={user} />

        <section className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
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