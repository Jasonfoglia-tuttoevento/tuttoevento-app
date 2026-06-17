"use client";
import { useState, useEffect } from "react";
import { INK, KpiCard, MUTED, O, SCard, STitle } from "./shared";
const MONTHS = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
const DAYS_LABEL = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];

export default function PromoterCalendario({ bookings=[], portfolio=[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  // Booking del roster del promoter nel mese selezionato
  const portfolioArtistIds = portfolio.filter(p => p.entity_type === "artist").map(p => Number(p.entity_id));

  const monthBookings = bookings.filter(b => {
    if (!b.eventDate && !b.event_date) return false;
    const d = new Date(b.eventDate || b.event_date);
    return d.getFullYear() === year && d.getMonth() === month &&
      portfolioArtistIds.includes(Number(b.artistId || b.artist_id));
  });

  // Costruisci griglia mensile
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function bookingsOnDay(day) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return monthBookings.filter(b => (b.eventDate || b.event_date || "").startsWith(dateStr));
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }

  const upcoming = bookings
    .filter(b => {
      const d = new Date(b.eventDate || b.event_date);
      return d >= now && portfolioArtistIds.includes(Number(b.artistId || b.artist_id));
    })
    .sort((a,b) => new Date(a.eventDate||a.event_date) - new Date(b.eventDate||b.event_date))
    .slice(0, 5);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
        <KpiCard label="Booking questo mese" value={monthBookings.length} orange />
        <KpiCard label="Artisti nel roster" value={portfolioArtistIds.length} />
        <KpiCard label="Prossimi eventi" value={upcoming.length} />
      </div>

      {/* Calendario */}
      <SCard>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <STitle>{MONTHS[month]} {year}</STitle>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={prevMonth} style={{ width:32, height:32, borderRadius:8, border:"1px solid rgba(0,0,0,.1)", background:"white", cursor:"pointer", fontSize:16 }}>‹</button>
            <button onClick={nextMonth} style={{ width:32, height:32, borderRadius:8, border:"1px solid rgba(0,0,0,.1)", background:"white", cursor:"pointer", fontSize:16 }}>›</button>
          </div>
        </div>

        {/* Header giorni */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
          {DAYS_LABEL.map(d => <p key={d} style={{ fontSize:10, fontWeight:700, color:MUTED, textAlign:"center", margin:0, textTransform:"uppercase" }}>{d}</p>)}
        </div>

        {/* Griglia */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
          {Array.from({ length: firstDay }, (_,i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_,i) => {
            const day = i + 1;
            const dayBookings = bookingsOnDay(day);
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            return (
              <div key={day} style={{
                minHeight:48, borderRadius:10, padding:"4px 6px",
                background: dayBookings.length > 0 ? `${O}10` : isToday ? "#f0f0f2" : "transparent",
                border: isToday ? `2px solid ${O}` : dayBookings.length > 0 ? `1px solid ${O}30` : "1px solid rgba(0,0,0,.05)",
                position:"relative"
              }}>
                <p style={{ fontSize:11, fontWeight:isToday?800:500, color:isToday?O:INK, margin:0 }}>{day}</p>
                {dayBookings.map((b,bi) => (
                  <div key={bi} style={{ marginTop:2, background:O, borderRadius:4, padding:"1px 4px" }}>
                    <p style={{ fontSize:9, color:"white", fontWeight:700, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {b.artistName || b.artist_name || "Artista"}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </SCard>

      {/* Prossimi eventi */}
      {upcoming.length > 0 && (
        <SCard>
          <STitle>Prossimi eventi roster</STitle>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {upcoming.map(b => {
              const d = new Date(b.eventDate || b.event_date);
              return (
                <div key={b.id} style={{ display:"flex", alignItems:"center", gap:14, background:"#fbfaf8", borderRadius:14, padding:"12px 14px", border:"1px solid rgba(0,0,0,.06)" }}>
                  <div style={{ minWidth:42, textAlign:"center", background:`${O}10`, borderRadius:10, padding:"6px 8px", flexShrink:0 }}>
                    <p style={{ fontSize:16, fontWeight:900, color:O, margin:0, fontFamily:"'Sora',sans-serif" }}>{d.getDate()}</p>
                    <p style={{ fontSize:9, color:O, margin:0, fontWeight:700, textTransform:"uppercase" }}>{MONTHS[d.getMonth()]}</p>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:800, fontSize:13, margin:0, fontFamily:"'Sora',sans-serif", color:INK }}>{b.artistName || b.artist_name}</p>
                    <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>{b.organizerName || b.organizer_name} · {b.eventTitle || b.event_title || "Evento"}</p>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:100, background:"rgba(22,163,74,.1)", color:"#16a34a", flexShrink:0 }}>
                    {b.status === "accepted" ? "Confermato" : "In corso"}
                  </span>
                </div>
              );
            })}
          </div>
        </SCard>
      )}
    </div>
  );
}