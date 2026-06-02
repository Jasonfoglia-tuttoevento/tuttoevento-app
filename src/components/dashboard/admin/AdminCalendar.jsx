"use client";

import { useState, useMemo } from "react";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const GIORNI = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

const STATUS_COLORS = {
  confirmed: "#16a34a", accepted: "#16a34a", paid: "#16a34a",
  pending: "#d97706", draft: "#6b7280", rejected: "#dc2626",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  let d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // lunedì = 0
}

export default function AdminCalendar({ events = [], bookings = [] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("month"); // month | list

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  // Mappa eventi per giorno
  const eventsByDay = useMemo(() => {
    const map = {};
    [...events, ...bookings].forEach(item => {
      const dateStr = item.date || item.eventDate || item.event_date || "";
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d)) return;
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const day = d.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(item);
    });
    return map;
  }, [events, bookings, year, month]);

  // Lista eventi del mese ordinati
  const monthEvents = useMemo(() => {
    return [...events, ...bookings]
      .filter(item => {
        const d = new Date(item.date || item.eventDate || item.event_date || "");
        return !isNaN(d) && d.getFullYear() === year && d.getMonth() === month;
      })
      .sort((a, b) => new Date(a.date || a.eventDate || "") - new Date(b.date || b.eventDate || ""));
  }, [events, bookings, year, month]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayKey = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;

  const s = {
    card: { background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" },
    tab: (a) => ({ padding:"7px 16px", borderRadius:100, fontWeight:700, fontSize:13, cursor:"pointer", border: a ? "none" : "1px solid rgba(0,0,0,.1)", background: a ? INK : "white", color: a ? "white" : MUTED, fontFamily:"inherit" }),
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700&display=swap');`}</style>

      <div style={s.card}>
        {/* Header navigazione */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={prevMonth} style={{ background:"#f5f5f6", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontWeight:700, fontSize:16 }}>‹</button>
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-0.03em" }}>{MESI[month]} {year}</h2>
            <button onClick={nextMonth} style={{ background:"#f5f5f6", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontWeight:700, fontSize:16 }}>›</button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ ...s.tab(false), padding:"7px 14px" }}>Oggi</button>
            <button onClick={() => setView("month")} style={s.tab(view === "month")}>Mese</button>
            <button onClick={() => setView("list")} style={s.tab(view === "list")}>Lista</button>
          </div>
        </div>

        {view === "month" && (
          <>
            {/* Intestazione giorni */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
              {GIORNI.map(g => <p key={g} style={{ textAlign:"center", fontSize:12, fontWeight:700, color:MUTED, padding:"4px 0" }}>{g}</p>)}
            </div>
            {/* Griglia giorni */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = eventsByDay[day] || [];
                const isToday = day === todayKey;
                const isSelected = selected === day;
                return (
                  <div key={day} onClick={() => setSelected(isSelected ? null : day)}
                    style={{ minHeight:72, background: isSelected ? INK : isToday ? "#fff7ed" : "#fbfaf8",
                      border: isToday ? `2px solid ${ORANGE}` : "1px solid rgba(0,0,0,.06)",
                      borderRadius:14, padding:"8px 6px", cursor:"pointer", transition:"all .15s" }}>
                    <p style={{ fontWeight:800, fontSize:13, color: isSelected ? "white" : isToday ? ORANGE : INK, marginBottom:4 }}>{day}</p>
                    {dayEvents.slice(0,3).map((ev, ei) => {
                      const status = ev.status || "draft";
                      const color = STATUS_COLORS[status] || MUTED;
                      return (
                        <div key={ei} style={{ background: isSelected ? "rgba(255,255,255,.15)" : color+"18",
                          borderLeft:`3px solid ${color}`, borderRadius:4, padding:"2px 5px", marginBottom:2 }}>
                          <p style={{ fontSize:10, fontWeight:700, color: isSelected ? "white" : color, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {ev.title || ev.eventTitle || ev.artistName || "Evento"}
                          </p>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && <p style={{ fontSize:10, color: isSelected ? "rgba(255,255,255,.6)" : MUTED, fontWeight:700 }}>+{dayEvents.length - 3}</p>}
                  </div>
                );
              })}
            </div>

            {/* Dettaglio giorno selezionato */}
            {selected && (eventsByDay[selected] || []).length > 0 && (
              <div style={{ marginTop:16, background:"#fbfaf8", borderRadius:18, padding:"14px 16px" }}>
                <p style={{ fontWeight:800, fontSize:14, marginBottom:10 }}>{selected} {MESI[month]} — {(eventsByDay[selected]||[]).length} eventi</p>
                {(eventsByDay[selected]||[]).map((ev, i) => {
                  const status = ev.status || "draft";
                  const color = STATUS_COLORS[status] || MUTED;
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:"white", borderRadius:12, padding:"10px 12px", marginBottom:6, border:"1px solid rgba(0,0,0,.06)" }}>
                      <div style={{ width:4, height:40, borderRadius:2, background:color, flexShrink:0 }} />
                      <div>
                        <p style={{ fontWeight:700, fontSize:13 }}>{ev.title || ev.eventTitle || ev.artistName || "Evento"}</p>
                        <p style={{ fontSize:11, color:MUTED }}>{ev.organizerName || ev.organizer || ""} {ev.startTime ? `· ${ev.startTime}` : ""}</p>
                      </div>
                      <span style={{ marginLeft:"auto", background:color+"20", color, borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === "list" && (
          <div>
            <p style={{ fontSize:13, color:MUTED, marginBottom:14 }}>{monthEvents.length} eventi in {MESI[month]} {year}</p>
            {monthEvents.length === 0 ? <p style={{ color:"rgba(0,0,0,.3)", fontSize:14 }}>Nessun evento questo mese.</p> :
              monthEvents.map((ev, i) => {
                const status = ev.status || "draft";
                const color = STATUS_COLORS[status] || MUTED;
                const dateStr = ev.date || ev.eventDate || ev.event_date || "";
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                    <div style={{ width:48, height:48, background:color+"15", borderRadius:14, display:"grid", placeItems:"center", flexShrink:0 }}>
                      <p style={{ fontWeight:800, fontSize:16, color }}>{dateStr ? new Date(dateStr).getDate() : "?"}</p>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:14 }}>{ev.title || ev.eventTitle || ev.artistName || "Evento"}</p>
                      <p style={{ fontSize:12, color:MUTED, marginTop:2 }}>
                        {ev.organizerName || ev.organizer || ""}
                        {ev.artistName ? ` · ${ev.artistName}` : ""}
                        {ev.startTime ? ` · ${ev.startTime}` : ""}
                      </p>
                    </div>
                    <span style={{ background:color+"20", color, borderRadius:10, padding:"4px 12px", fontSize:12, fontWeight:700, flexShrink:0 }}>{status}</span>
                  </div>
                );
              })
            }
          </div>
        )}
      </div>

      {/* Stats mensili */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14 }}>
        {[
          ["Totale eventi", monthEvents.length],
          ["Confermati", monthEvents.filter(e => ["confirmed","accepted","paid"].includes(String(e.status||"").toLowerCase())).length],
          ["In attesa", monthEvents.filter(e => e.status === "pending").length],
          ["Bozze", monthEvents.filter(e => !e.status || e.status === "draft").length],
        ].map(([label, val]) => (
          <div key={label} style={{ background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:20, padding:"16px 18px" }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:MUTED, marginBottom:6 }}>{label}</p>
            <p style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:28, letterSpacing:"-0.03em" }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}