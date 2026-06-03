"use client";

import { useState, useMemo } from "react";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";
const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const GIORNI_SHORT = ["L","M","M","G","V","S","D"];

const STATUS_COLOR = {
  confirmed: "#16a34a", accepted: "#16a34a", paid: "#16a34a",
  pending: "#d97706", draft: "#6b7280", rejected: "#dc2626",
};

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

function generateIcal(bookings) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TuttoEvento//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:TuttoEvento - I miei booking",
    "X-WR-TIMEZONE:Europe/Rome",
  ];
  bookings.forEach(b => {
    const dateStr = (b.eventDate || b.event_date || b.date || "").replace(/-/g, "");
    if (!dateStr || dateStr.length < 8) return;
    const uid = `booking-${b.id || Math.random().toString(36).slice(2)}@tuttoevento.it`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:${(b.eventTitle || b.title || "Evento").replace(/[,;\\]/g, " ")}`,
      `DESCRIPTION:Locale: ${b.organizerName || "—"} | Stato: ${b.status || "—"}`,
      `STATUS:${["confirmed","accepted","paid"].includes(String(b.status||"").toLowerCase()) ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export default function ArtistCalendar({ bookings = [], availableDates = [], bookedDates = [] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("month");

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }

  // Mappa booking per giorno
  const bookingsByDay = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const d = b.eventDate || b.event_date || b.date || "";
      if (!d) return;
      const dt = new Date(d);
      if (isNaN(dt) || dt.getFullYear() !== year || dt.getMonth() !== month) return;
      const day = dt.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(b);
    });
    return map;
  }, [bookings, year, month]);

  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);
  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const todayKey = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;

  // Lista eventi del mese ordinati
  const monthBookings = useMemo(() => bookings.filter(b => {
    const d = new Date(b.eventDate || b.event_date || b.date || "");
    return !isNaN(d) && d.getFullYear() === year && d.getMonth() === month;
  }).sort((a,b) => new Date(a.eventDate||a.date||"") - new Date(b.eventDate||b.date||"")), [bookings, year, month]);

  // Prossimi 5 eventi
  const upcoming = useMemo(() => {
    const todayStr = today.toISOString().slice(0,10);
    return [...bookings].filter(b => (b.eventDate||b.date||"") >= todayStr)
      .sort((a,b) => (a.eventDate||a.date||"").localeCompare(b.eventDate||b.date||""))
      .slice(0,5);
  }, [bookings]);

  function downloadIcal() {
    const ical = generateIcal(bookings);
    const blob = new Blob([ical], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "tuttoevento-booking.ics"; a.click();
    URL.revokeObjectURL(url);
  }

  const s = {
    card: { background:"#fff", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" },
    tabBtn: (a) => ({ padding:"7px 16px", borderRadius:100, fontWeight:700, fontSize:13, cursor:"pointer", border: a?"none":"1px solid rgba(0,0,0,.1)", background: a?INK:"white", color: a?"white":MUTED, fontFamily:"inherit" }),
    dayCell: (isToday, isSel, hasBooking, isAvail) => ({
      minHeight:64, borderRadius:12, padding:"6px 5px", cursor:"pointer", transition:"all .15s",
      background: isSel ? INK : isToday ? "#fff7ed" : hasBooking ? "rgba(255,90,0,.06)" : isAvail ? "rgba(22,163,74,.05)" : "#fbfaf8",
      border: isToday ? `2px solid ${ORANGE}` : isSel ? `2px solid ${INK}` : "1px solid rgba(0,0,0,.05)",
    }),
  };

  return (
    <div style={{ fontFamily:"'Manrope',system-ui,sans-serif", display:"flex", flexDirection:"column", gap:16 }} id="artist-calendar">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={s.card}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:16 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:ORANGE, marginBottom:4 }}>Calendario</p>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-.03em" }}>I tuoi eventi</h2>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={() => setView("month")} style={s.tabBtn(view==="month")}>Mese</button>
            <button onClick={() => setView("list")} style={s.tabBtn(view==="list")}>Lista</button>
            <button onClick={() => setView("upcoming")} style={s.tabBtn(view==="upcoming")}>In arrivo</button>
            <button onClick={downloadIcal}
              style={{ padding:"7px 14px", borderRadius:100, fontWeight:700, fontSize:13, cursor:"pointer", background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#16a34a", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
              📅 Esporta iCal
            </button>
          </div>
        </div>

        {/* Stats veloci */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>
          {[
            ["Totali", bookings.length, INK],
            ["Confermati", bookings.filter(b=>["confirmed","accepted","paid"].includes(String(b.status||"").toLowerCase())).length, "#16a34a"],
            ["In attesa", bookings.filter(b=>b.status==="pending").length, "#d97706"],
            ["Questo mese", monthBookings.length, ORANGE],
          ].map(([label,val,color]) => (
            <div key={label} style={{ background:"#fbfaf8", borderRadius:14, padding:"12px 14px", textAlign:"center" }}>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color, lineHeight:1 }}>{val}</p>
              <p style={{ fontSize:11, fontWeight:700, color:MUTED, marginTop:4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* VISTA MESE */}
      {view === "month" && (
        <div style={s.card}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={prevMonth} style={{ background:"#f5f5f6", border:"none", borderRadius:10, width:34, height:34, cursor:"pointer", fontWeight:700, fontSize:16, fontFamily:"inherit" }}>‹</button>
              <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-.03em" }}>{MESI[month]} {year}</h3>
              <button onClick={nextMonth} style={{ background:"#f5f5f6", border:"none", borderRadius:10, width:34, height:34, cursor:"pointer", fontWeight:700, fontSize:16, fontFamily:"inherit" }}>›</button>
            </div>
            <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
              style={{ fontSize:12, fontWeight:700, padding:"5px 12px", borderRadius:100, border:"1px solid rgba(0,0,0,.1)", background:"white", cursor:"pointer", fontFamily:"inherit" }}>
              Oggi
            </button>
          </div>

          {/* Intestazione giorni */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:3 }}>
            {GIORNI_SHORT.map((g,i) => (
              <p key={i} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:MUTED, padding:"3px 0" }}>{g}</p>
            ))}
          </div>

          {/* Griglia */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
            {Array.from({ length: firstDay }).map((_,i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_,i) => {
              const day = i + 1;
              const dayBookings = bookingsByDay[day] || [];
              const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const isToday = day === todayKey;
              const isSel = selected === day;
              const isAvail = availableSet.has(dateStr);
              const isBooked = bookedSet.has(dateStr);

              return (
                <div key={day} style={s.dayCell(isToday, isSel, dayBookings.length > 0, isAvail)}
                  onClick={() => setSelected(isSel ? null : day)}>
                  <p style={{ fontWeight:800, fontSize:12, color: isSel?"white":isToday?ORANGE:INK, marginBottom:2 }}>{day}</p>
                  {dayBookings.slice(0,2).map((b,ei) => {
                    const col = STATUS_COLOR[String(b.status||"").toLowerCase()] || MUTED;
                    return (
                      <div key={ei} style={{ background: isSel?"rgba(255,255,255,.15)":col+"20", borderLeft:`2px solid ${col}`, borderRadius:3, padding:"1px 3px", marginBottom:1 }}>
                        <p style={{ fontSize:9, fontWeight:700, color:isSel?"white":col, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {b.eventTitle||b.title||"Evento"}
                        </p>
                      </div>
                    );
                  })}
                  {dayBookings.length > 2 && <p style={{ fontSize:9, color:isSel?"rgba(255,255,255,.6)":MUTED, fontWeight:700 }}>+{dayBookings.length-2}</p>}
                  {isAvail && dayBookings.length === 0 && <div style={{ width:6, height:6, borderRadius:"50%", background:"#16a34a", margin:"2px auto 0" }} />}
                  {isBooked && <div style={{ width:6, height:6, borderRadius:"50%", background:ORANGE, margin:"2px auto 0" }} />}
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
            {[["#16a34a","Confermato"],[ORANGE,"In attesa"],["#6b7280","Bozza"],["#16a34a","Disponibile (punto verde)"]].map(([c,l]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:c+"40", border:`1px solid ${c}` }} />
                <span style={{ fontSize:11, color:MUTED, fontWeight:600 }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Dettaglio giorno */}
          {selected && (bookingsByDay[selected]||[]).length > 0 && (
            <div style={{ marginTop:14, background:"#fbfaf8", borderRadius:16, padding:"14px 16px" }}>
              <p style={{ fontWeight:800, fontSize:13, marginBottom:10 }}>{selected} {MESI[month]} — {(bookingsByDay[selected]||[]).length} eventi</p>
              {(bookingsByDay[selected]||[]).map((b,i) => {
                const col = STATUS_COLOR[String(b.status||"").toLowerCase()] || MUTED;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"white", borderRadius:12, padding:"10px 12px", marginBottom:6, border:"1px solid rgba(0,0,0,.06)" }}>
                    <div style={{ width:3, height:36, borderRadius:2, background:col, flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.eventTitle||b.title||"Evento"}</p>
                      <p style={{ fontSize:11, color:MUTED, marginTop:1 }}>{b.organizerName||"—"}{b.startTime?` · ${b.startTime}`:""}</p>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:100, background:col+"18", color:col, flexShrink:0 }}>{b.status||"—"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA LISTA */}
      {view === "list" && (
        <div style={s.card}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={prevMonth} style={{ background:"#f5f5f6", border:"none", borderRadius:10, width:32, height:32, cursor:"pointer", fontWeight:700, fontFamily:"inherit" }}>‹</button>
              <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16 }}>{MESI[month]} {year}</h3>
              <button onClick={nextMonth} style={{ background:"#f5f5f6", border:"none", borderRadius:10, width:32, height:32, cursor:"pointer", fontWeight:700, fontFamily:"inherit" }}>›</button>
            </div>
            <p style={{ fontSize:12, color:MUTED, fontWeight:600 }}>{monthBookings.length} eventi</p>
          </div>
          {monthBookings.length === 0 ? (
            <p style={{ color:"rgba(0,0,0,.3)", fontSize:13, textAlign:"center", padding:"24px 0" }}>Nessun evento questo mese.</p>
          ) : monthBookings.map((b,i) => {
            const col = STATUS_COLOR[String(b.status||"").toLowerCase()] || MUTED;
            const d = new Date(b.eventDate||b.date||"");
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                <div style={{ width:44, height:44, background:col+"18", borderRadius:12, display:"grid", placeItems:"center", flexShrink:0 }}>
                  <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:col }}>
                    {isNaN(d) ? "?" : d.getDate()}
                  </p>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.eventTitle||b.title||"Evento"}</p>
                  <p style={{ fontSize:11, color:MUTED, marginTop:2 }}>{b.organizerName||"—"}{b.startTime?` · ${b.startTime}`:""}</p>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:100, background:col+"18", color:col, flexShrink:0 }}>
                  {b.status||"—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA IN ARRIVO */}
      {view === "upcoming" && (
        <div style={s.card}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, marginBottom:14 }}>Prossimi 5 eventi</h3>
          {upcoming.length === 0 ? (
            <p style={{ color:"rgba(0,0,0,.3)", fontSize:13, textAlign:"center", padding:"24px 0" }}>Nessun evento in programma.</p>
          ) : upcoming.map((b,i) => {
            const col = STATUS_COLOR[String(b.status||"").toLowerCase()] || MUTED;
            const d = new Date(b.eventDate||b.date||"");
            return (
              <div key={i} style={{ display:"flex", gap:14, padding:"14px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                <div style={{ width:48, height:48, background:col+"15", borderRadius:14, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${col}30` }}>
                  <p style={{ fontSize:9, fontWeight:700, color:col, textTransform:"uppercase" }}>
                    {isNaN(d) ? "" : ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"][d.getMonth()]}
                  </p>
                  <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:18, color:col, lineHeight:1 }}>{isNaN(d)?"?":d.getDate()}</p>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:14 }}>{b.eventTitle||b.title||"Evento"}</p>
                  <p style={{ fontSize:12, color:MUTED, marginTop:2 }}>{b.organizerName||"—"}</p>
                  <p style={{ fontSize:11, color:MUTED, marginTop:2 }}>
                    {b.startTime&&b.endTime ? `${b.startTime} – ${b.endTime}` : b.startTime||""}
                  </p>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:"4px 12px", borderRadius:100, background:col+"18", color:col, alignSelf:"flex-start", flexShrink:0 }}>
                  {b.status||"—"}
                </span>
              </div>
            );
          })}
          <div style={{ marginTop:16, padding:"12px 14px", background:"#f0fdf4", borderRadius:14, border:"1px solid #bbf7d0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>📅 Aggiungi tutti al tuo calendario</p>
            <button onClick={downloadIcal} style={{ fontSize:12, fontWeight:800, padding:"6px 14px", borderRadius:100, background:"#16a34a", color:"white", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
              Esporta iCal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}