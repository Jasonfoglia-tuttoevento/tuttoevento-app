// src/components/dashboard/AnalyticsWidget.jsx
// Usato da: ArtistArea, OrganizerArea, PromoterArea, AdminArea
"use client";
import { useState, useEffect } from "react";

const O    = "#ff5a00";
const INK  = "#0a0a0b";
const MUTED= "#6b6b73";
const CARD = "#ffffff";
const BORDER = "rgba(0,0,0,.07)";

const MONTHS_IT = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];

function fmt(n) {
  return new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0);
}
function fmtShort(n) {
  if (n >= 1000000) return `€${(n/1000000).toFixed(1)}M`;
  if (n >= 1000)    return `€${(n/1000).toFixed(1)}K`;
  return fmt(n);
}
function monthLabel(key) {
  const [,m] = key.split("-");
  return MONTHS_IT[parseInt(m)-1] || key;
}

/* ── Barchart orizzontale ── */
function BarChart({ data, valueKey="count", labelKey="month", color=O, height=120, formatVal=v=>v }) {
  if (!data?.length) return <p style={{fontSize:12,color:MUTED,margin:0}}>Nessun dato</p>;
  const max = Math.max(...data.map(d=>d[valueKey]), 1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height,paddingBottom:18,position:"relative"}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{fontSize:9,color:MUTED,fontWeight:700}}>{d[valueKey]>0?formatVal(d[valueKey]):""}</span>
          <div style={{
            width:"100%", borderRadius:"4px 4px 0 0",
            background: i===data.length-1 ? color : `${color}30`,
            height:`${Math.max((d[valueKey]/max)*80,d[valueKey]>0?4:0)}px`,
            minHeight:d[valueKey]>0?3:0,
            transition:"height .4s cubic-bezier(.4,0,.2,1)",
          }}/>
          <span style={{fontSize:9,color:MUTED,position:"absolute",bottom:0}}>
            {monthLabel(d[labelKey]||"")}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── HBar (barra orizzontale) ── */
function HBar({ items, nameKey, valueKey, color=O }) {
  if (!items?.length) return <p style={{fontSize:12,color:MUTED,margin:0}}>Nessun dato</p>;
  const max = Math.max(...items.map(d=>d[valueKey]),1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {items.map((d,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,fontWeight:700,color:INK,minWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d[nameKey]}</span>
          <div style={{flex:1,background:"rgba(0,0,0,.05)",borderRadius:4,height:8,overflow:"hidden"}}>
            <div style={{width:`${(d[valueKey]/max)*100}%`,height:"100%",background:color,borderRadius:4,transition:"width .4s"}}/>
          </div>
          <span style={{fontSize:12,fontWeight:700,color:MUTED,minWidth:24,textAlign:"right"}}>{d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── KPI card ── */
function Kpi({label,value,accent=false,orange=false,sub}) {
  return (
    <div style={{
      background: accent?INK:orange?`${O}08`:"#f8f8f9",
      border:`1px solid ${accent||orange?"transparent":"rgba(0,0,0,.06)"}`,
      borderRadius:18, padding:"16px 18px",
    }}>
      <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",color:accent?"rgba(255,255,255,.5)":orange?O:MUTED,margin:"0 0 5px",fontFamily:"'Manrope',system-ui,sans-serif"}}>{label}</p>
      <p style={{fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:22,letterSpacing:"-.04em",color:accent?"white":orange?O:INK,margin:0}}>{value}</p>
      {sub&&<p style={{fontSize:11,color:accent?"rgba(255,255,255,.4)":MUTED,margin:"3px 0 0"}}>{sub}</p>}
    </div>
  );
}

function Card({children,style={}}) {
  return <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:20,padding:"18px 20px",...style}}>{children}</div>;
}
function Title({children,sub}) {
  return (
    <div style={{marginBottom:14}}>
      <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:INK,margin:0,letterSpacing:"-.02em"}}>{children}</h3>
      {sub&&<p style={{fontSize:12,color:MUTED,margin:"3px 0 0"}}>{sub}</p>}
    </div>
  );
}

/* ════════════════════════════════════════
   ARTIST ANALYTICS
════════════════════════════════════════ */
function ArtistAnalytics({ data }) {
  const {kpi,byMonth,byType} = data;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        <Kpi label="Booking totali"  value={kpi.total} />
        <Kpi label="Confermati"       value={kpi.confirmed} orange />
        <Kpi label="In attesa"        value={kpi.pending} />
        <Kpi label="Cachet maturato" value={fmt(kpi.revenue)} accent />
      </div>
      {kpi.avgCachet > 0 && (
        <Card>
          <Title sub="Media cachet per booking confermato">Performance</Title>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:"#f8f8f9",borderRadius:14,padding:"12px 16px"}}>
              <p style={{fontSize:11,fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:".1em",margin:"0 0 4px"}}>Cachet medio</p>
              <p style={{fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:20,color:O,margin:0}}>{fmt(kpi.avgCachet)}</p>
            </div>
            <div style={{background:"#f8f8f9",borderRadius:14,padding:"12px 16px"}}>
              <p style={{fontSize:11,fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:".1em",margin:"0 0 4px"}}>Cancellati</p>
              <p style={{fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:20,color:INK,margin:0}}>{kpi.cancelled}</p>
            </div>
          </div>
        </Card>
      )}
      {byMonth?.length>0 && (
        <Card>
          <Title sub="Booking confermati negli ultimi 6 mesi">Andamento</Title>
          <BarChart data={byMonth} valueKey="count" labelKey="month" />
        </Card>
      )}
      {byType?.length>0 && (
        <Card>
          <Title sub="Dove suoni di più">Per tipo evento</Title>
          <HBar items={byType} nameKey="type" valueKey="count" />
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   ORGANIZER ANALYTICS
════════════════════════════════════════ */
function OrganizerAnalytics({ data }) {
  const {kpi,byMonth,byArtist} = data;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        <Kpi label="Richieste inviate" value={kpi.total} />
        <Kpi label="Confermate"         value={kpi.confirmed} orange />
        <Kpi label="In attesa"          value={kpi.pending} />
        <Kpi label="Budget speso"       value={fmt(kpi.spent)} accent />
      </div>
      {kpi.avgSpent > 0 && (
        <Card>
          <Title>Performance</Title>
          <div style={{background:"#f8f8f9",borderRadius:14,padding:"12px 16px",display:"inline-block"}}>
            <p style={{fontSize:11,fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:".1em",margin:"0 0 4px"}}>Spesa media per serata</p>
            <p style={{fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:20,color:O,margin:0}}>{fmt(kpi.avgSpent)}</p>
          </div>
        </Card>
      )}
      {byMonth?.length>0 && (
        <Card>
          <Title sub="Serate confermate negli ultimi 6 mesi">Andamento</Title>
          <BarChart data={byMonth} valueKey="count" labelKey="month" />
        </Card>
      )}
      {byArtist?.length>0 && (
        <Card>
          <Title sub="Artisti che hai prenotato di più">Artisti preferiti</Title>
          <HBar items={byArtist} nameKey="name" valueKey="count" />
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   PROMOTER ANALYTICS
════════════════════════════════════════ */
function PromoterAnalytics({ data }) {
  const {kpi,byMonth} = data;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        <Kpi label="Booking gestiti"  value={kpi.total} />
        <Kpi label="Confermati"        value={kpi.confirmed} orange />
        <Kpi label="Roster artisti"    value={kpi.rosterSize} />
        <Kpi label="Commissioni"       value={fmt(kpi.commission)} accent />
      </div>
      {byMonth?.length>0 && (
        <Card>
          <Title sub="Booking confermati negli ultimi 6 mesi">Andamento</Title>
          <BarChart data={byMonth} valueKey="count" labelKey="month" />
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   ADMIN ANALYTICS
════════════════════════════════════════ */
function AdminAnalytics({ data }) {
  const {kpi,regByMonth,bookingByMonth} = data;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* KPI piattaforma */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        <Kpi label="Utenti totali"    value={kpi.totalUsers} />
        <Kpi label="Artisti"          value={kpi.totalArtists} orange />
        <Kpi label="Locali"           value={kpi.totalOrganizers} />
        <Kpi label="Promoter"         value={kpi.totalPromoters} />
        <Kpi label="Booking totali"   value={kpi.totalBookings} />
        <Kpi label="Confermati"       value={kpi.confirmedBookings} orange />
        <Kpi label="GMV"              value={fmtShort(kpi.gmv)} accent sub="volume transato totale" />
        <Kpi label="Revenue stimata"  value={fmtShort(kpi.platform_revenue)} accent sub="~10% del GMV" />
      </div>

      {regByMonth?.length>0 && (
        <Card>
          <Title sub="Nuovi utenti registrati negli ultimi 6 mesi">Crescita utenti</Title>
          <BarChart data={regByMonth} valueKey="count" labelKey="month" color="#2563eb" />
        </Card>
      )}
      {bookingByMonth?.length>0 && (
        <Card>
          <Title sub="Booking confermati negli ultimi 6 mesi">Andamento booking</Title>
          <BarChart data={bookingByMonth} valueKey="count" labelKey="month" />
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════ */
export default function AnalyticsWidget({ role, userId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    setLoading(true); setError("");
    const params = userId ? `?userId=${userId}` : "";
    fetch(`/api/analytics${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Errore caricamento dati"); setLoading(false); });
  }, [role, userId]);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"40px",gap:12}}>
      <div style={{width:20,height:20,border:`2px solid rgba(255,90,0,.2)`,borderTopColor:O,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <p style={{fontSize:13,color:MUTED,margin:0}}>Caricamento analitiche...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{background:"rgba(220,38,38,.06)",border:"1px solid rgba(220,38,38,.2)",borderRadius:16,padding:"16px 20px"}}>
      <p style={{fontSize:13,color:"#dc2626",margin:0,fontWeight:600}}>{error}</p>
    </div>
  );

  if (!data) return null;

  return (
    <>
      {data.role === "artist"    && <ArtistAnalytics    data={data} />}
      {data.role === "organizer" && <OrganizerAnalytics data={data} />}
      {data.role === "promoter"  && <PromoterAnalytics  data={data} />}
      {data.role === "admin"     && <AdminAnalytics      data={data} />}
    </>
  );
}