"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardStats from "../../components/dashboard/DashboardStats";
import RoleDashboard from "../../components/dashboard/RoleDashboard";
import { useDashboardData } from "../../hooks/useDashboardData";

export default function DashboardPage() {
  const dashboard = useDashboardData();

  if (!dashboard.user) return null;

  return (
    <DashboardShell user={dashboard.user}>
      <DashboardHeader
        user={dashboard.user}
        onLogout={dashboard.logout}
      />

      <DashboardStats
        user={dashboard.user}
        events={dashboard.events}
        artists={dashboard.artists}
        bookings={dashboard.bookings}
        bookedSlots={dashboard.bookedSlots}
        nextEventDate={dashboard.getNextEventDate()}
      />

      <RoleDashboard {...dashboard} />
    </DashboardShell>
  );
}