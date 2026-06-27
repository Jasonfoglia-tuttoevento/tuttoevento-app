"use client";

import { useState, useEffect } from "react";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import OrganizerOverview from "./organizer/OrganizerOverview";
import OrganizerMarketplace from "./organizer/OrganizerMarketplace";
import OrganizerCRM from "./organizer/OrganizerCRM";
import OrganizerEstratto from "./organizer/OrganizerEstratto";
import OrganizerFavourites from "./organizer/OrganizerFavourites";
import OrganizerPublicProfile from "./organizer/OrganizerPublicProfile";

// ── Tipi ────────────────────────────────────────────────────────
interface OrganizerUser {
  id: string;
  plan?: string;
  [key: string]: unknown;
}

interface OrganizerAreaProps {
  currentUser: OrganizerUser | null;
  events?: unknown[];
  artists?: unknown[];
  bookings?: unknown[];
  tab?: string;
}

const TAB_MAP: Record<string, string> = {
  profile: "overview",
  analytics: "analitiche",
  earnings: "estratto",
};

// ── Componente ──────────────────────────────────────────────────
export default function OrganizerArea({
  currentUser,
  artists = [],
  bookings = [],
  tab: initialTab,
}: OrganizerAreaProps) {
  const plan = currentUser?.plan || "free";
  const resolvedTab = TAB_MAP[initialTab || ""] || initialTab || "overview";
  const [tab, setTab] = useState(resolvedTab);

  useEffect(() => {
    setTab(TAB_MAP[initialTab || ""] || initialTab || "overview");
  }, [initialTab]);

  return (
    <div
      id="organizer-area"
      style={{
        fontFamily: "'Manrope',system-ui,sans-serif",
        color: "#0a0a0b",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {tab === "overview" && (
        <OrganizerOverview currentUser={currentUser} bookings={bookings} plan={plan} />
      )}

      {tab === "marketplace" && (
        <OrganizerMarketplace artists={artists as any[]} plan={plan} currentUser={currentUser} />
      )}

      {tab === "crm" && (
        <OrganizerCRM bookings={bookings as any[]} plan={plan} />
      )}

      {tab === "preferiti" && (
        <OrganizerFavourites artists={artists as any[]} currentUser={currentUser} />
      )}

      {tab === "profilo" && (
        <OrganizerPublicProfile userId={currentUser?.id} />
      )}

      {tab === "analitiche" && (
        <AnalyticsWidget role="organizer" userId={currentUser?.id} />
      )}

      {tab === "estratto" && (
        <OrganizerEstratto bookings={bookings} />
      )}
    </div>
  );
}