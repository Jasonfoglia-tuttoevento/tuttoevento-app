"use client";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import { useState, useEffect } from "react";

import PromoterOverview    from "./promoter/PromoterOverview";
import PromoterRoster      from "./promoter/PromoterRoster";
import PromoterTrattative  from "./promoter/PromoterTrattative";
import PromoterCommissioni from "./promoter/PromoterCommissioni";
import PromoterAgenzia     from "./promoter/PromoterAgenzia";
import PromoterCalendario  from "./promoter/PromoterCalendario";
import PromoterSubNetwork  from "./promoter/PromoterSubNetwork";
import PromoterOutreach    from "./promoter/PromoterOutreach";
import PromoterBundles     from "./promoter/PromoterBundles";

const INK = "#0a0a0b";

export default function PromoterArea({ currentUser, events=[], bookings=[], users=[], artists=[], tab: initialTab }) {
  const plan = currentUser?.plan || "free";
  const tabMap = { deals:"trattative", commissions:"commissioni", agency:"agenzia" };
  const [tab, setTab] = useState(tabMap[initialTab] || initialTab || "overview");
  const [portfolio, setPortfolio]             = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [commissions, setCommissions]         = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [addingEntry, setAddingEntry]         = useState(false);
  const [addMsg, setAddMsg]                   = useState("");

  useEffect(() => {
    const mapped = tabMap[initialTab] || initialTab || "overview";
    setTab(mapped);
  }, [initialTab]);

  useEffect(() => {
    fetch("/api/promoter-portfolio")
      .then(r=>r.json()).then(d=>{ setPortfolio(Array.isArray(d)?d:[]); setLoadingPortfolio(false); }).catch(()=>setLoadingPortfolio(false));
    fetch("/api/contact-requests")
      .then(r=>r.json()).then(d=>setContactRequests(Array.isArray(d)?d:[])).catch(()=>{});
    fetch("/api/promoter-commissions")
      .then(r=>r.json()).then(d=>setCommissions(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  async function handleAdd(entry) {
    if (!entry.entityId) { setAddMsg("Seleziona un elemento"); return; }
    setAddingEntry(true); setAddMsg("");
    try {
      const res = await fetch("/api/promoter-portfolio",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ entityType:entry.entityType, entityId:Number(entry.entityId) }),
      });
      const d = await res.json();
      if (res.ok) { setPortfolio(prev=>[d,...prev]); setAddMsg("✓ Aggiunto al roster"); }
      else setAddMsg(d.error||"Errore");
    } catch { setAddMsg("Errore tecnico"); }
    setAddingEntry(false);
  }

  async function handleRemove(id) {
    await fetch(`/api/promoter-portfolio?id=${id}`,{method:"DELETE"});
    setPortfolio(prev=>prev.filter(p=>p.id!==id));
  }

  async function handleUpdateStatus(id, status) {
    const res = await fetch("/api/contact-requests",{
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id,status}),
    });
    if (res.ok) setContactRequests(prev=>prev.map(r=>r.id===id?{...r,status}:r));
  }

  const allUsers = [...users, ...artists];

  return (
    <div id="promoter-area" style={{ fontFamily:"'Manrope',system-ui,sans-serif", color:INK, display:"flex", flexDirection:"column", gap:16 }}>
      {tab==="overview"                       && <PromoterOverview    currentUser={currentUser} bookings={bookings} portfolio={portfolio} contactRequests={contactRequests} plan={plan} commissions={commissions} />}
      {tab==="analitiche"                     && <AnalyticsWidget     role="promoter" userId={currentUser?.id} />}
      {tab==="roster"                         && <PromoterRoster      portfolio={portfolio} users={allUsers} plan={plan} onAdd={handleAdd} onRemove={handleRemove} addingEntry={addingEntry} addMsg={addMsg} currentUser={currentUser} />}
      {(tab==="trattative"||tab==="deals")    && <PromoterTrattative  contactRequests={contactRequests} portfolio={portfolio} plan={plan} onUpdateStatus={handleUpdateStatus} />}
      {(tab==="commissioni"||tab==="commissions") && <PromoterCommissioni commissions={commissions} bookings={bookings} portfolio={portfolio} plan={plan} />}
      {tab==="calendario"                     && <PromoterCalendario  bookings={bookings} portfolio={portfolio} />}
      {tab==="outreach"                       && <PromoterOutreach    currentUser={currentUser} portfolio={portfolio} />}
      {tab==="bundles"                        && <PromoterBundles     portfolio={portfolio} />}
      {tab==="subnetwork"                     && <PromoterSubNetwork currentUser={currentUser} plan={plan} />}
      {(tab==="agenzia"||tab==="agency")      && <PromoterAgenzia     currentUser={currentUser} portfolio={portfolio} plan={plan} />}
    </div>
  );
}