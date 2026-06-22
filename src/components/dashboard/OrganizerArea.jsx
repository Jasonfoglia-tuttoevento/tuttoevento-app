"use client";
import VerifiedBadge from "@/components/VerifiedBadge";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import { useState, useEffect, useRef } from "react";

import OrganizerOverview      from "./organizer/OrganizerOverview";
import OrganizerMarketplace   from "./organizer/OrganizerMarketplace";
import OrganizerCRM           from "./organizer/OrganizerCRM";
import OrganizerAnalitiche    from "./organizer/OrganizerAnalitiche";
import OrganizerEstratto      from "./organizer/OrganizerEstratto";
import OrganizerFavourites    from "./organizer/OrganizerFavourites";
import OrganizerPublicProfile from "./organizer/OrganizerPublicProfile";

const INK = "#0a0a0b";

export default function OrganizerArea({ currentUser, events=[], artists=[], bookings=[], title, setTitle, date, setDate, artist, setArtist, promoter, setPromoter, tab: initialTab }) {
  const plan = currentUser?.plan || "free";
  const tabMap = { profile:"overview", analytics:"analitiche", earnings:"estratto" };
  const [tab, setTab] = useState(tabMap[initialTab] || initialTab || "overview");

  useEffect(() => {
    const mapped = tabMap[initialTab] || initialTab || "overview";
    setTab(mapped);
  }, [initialTab]);

  return (
    <div id="organizer-area" style={{ fontFamily:"'Manrope',system-ui,sans-serif", color:INK, display:"flex", flexDirection:"column", gap:16 }}>
      {tab==="overview"    && <OrganizerOverview      currentUser={currentUser} bookings={bookings} plan={plan} />}
      {tab==="marketplace" && <OrganizerMarketplace   artists={artists} plan={plan} currentUser={currentUser} />}
      {tab==="crm"         && <OrganizerCRM           bookings={bookings} plan={plan} currentUser={currentUser} />}
      {tab==="preferiti"   && <OrganizerFavourites    artists={artists} currentUser={currentUser} />}
      {tab==="profilo"     && <OrganizerPublicProfile userId={currentUser?.id} />}
      {tab==="analitiche"  && <AnalyticsWidget        role="organizer" userId={currentUser?.id} />}
      {tab==="estratto"    && <OrganizerEstratto      bookings={bookings} />}
    </div>
  );
}