"use client";
import { useState, useEffect, useRef } from "react";
import { SCard, STitle, ProBadge, ProLock, O, INK, BORDER, MUTED, MUTED2, inp, DURATIONS } from "./shared";

export default function ArtistCalendario({ availableDates=[], setAvailableDates, bookedSlots=[], plan }) {
  const [newDate, setNewDate] = useState("");
  const addDate = () => {
    if (!newDate||(availableDates||[]).includes(newDate)) return;
    setAvailableDates(p=>[...(p||[]),newDate].sort()); setNewDate("");
  };
  const removeDate = d => setAvailableDates(p=>(p||[]).filter(x=>x!==d));
  const avail = availableDates||[];
  const slots = bookedSlots||[];

  // Raggruppa per mese
  const byMonth = {};
  avail.forEach(d => {
    const [y,m] = d.split("-"); const key=`${y}-${m}`;
    if (!byMonth[key]) byMonth[key]=[];
    byMonth[key].push(d);
  });
  const monthNames = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Aggiungi data */}
      <SCard>
        <STitle sub="Segna i giorni in cui NON sei disponibile — le date non bloccate sono aperte ai booking">Indisponibilità</STitle>
        <div style={{ display:"flex", gap:10, marginBottom:avail.length>0?18:0, flexWrap:"wrap" }}>
          <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)}
            style={{ ...inp, flex:1, maxWidth:200 }} />
          <button type="button" onClick={addDate}
            style={{ background:O, color:"white", border:"none", borderRadius:12, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", boxShadow:`0 4px 12px ${O}25` }}>
            + Aggiungi
          </button>
        </div>

        {avail.length===0 ? (
          <div style={{ padding:"24px 0", textAlign:"center" }}>
            <p style={{ fontSize:13, color:MUTED, margin:0 }}>Nessuna data aggiunta ancora.</p>
            <p style={{ fontSize:12, color:"rgba(0,0,0,.25)", margin:"4px 0 0" }}>Nessuna data bloccata — sei disponibile per tutti i giorni.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {Object.entries(byMonth).map(([key,dates])=>{
              const [y,m] = key.split("-");
              return (
                <div key={key}>
                  <p style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".12em", margin:"0 0 8px" }}>
                    {monthNames[parseInt(m)-1]} {y}
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {dates.map(d=>(
                      <div key={d} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(22,163,74,.08)", border:"1px solid rgba(22,163,74,.2)", borderRadius:10, padding:"5px 10px" }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>{d.split("-")[2]}</span>
                        <button type="button" onClick={()=>removeDate(d)}
                          style={{ background:"none", border:"none", cursor:"pointer", color:"#dc2626", fontWeight:700, fontSize:13, lineHeight:1, padding:0 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <p style={{ fontSize:12, color:MUTED, margin:"4px 0 0" }}>{avail.length} date disponibili</p>
          </div>
        )}
      </SCard>

      {/* Serate prenotate — card stile marketplace */}
      {slots.length>0 && (
        <SCard>
          <STitle sub="Le tue serate già confermate">Serate prenotate</STitle>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {slots.map((slot, i) => {
              const s = typeof slot === "string" ? { date: slot } : slot;
              const dateFormatted = s.date
                ? new Date(s.date + "T12:00:00").toLocaleDateString("it-IT", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
                : "—";
              return (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:14,
                  background:"white", border:"1px solid rgba(0,0,0,.07)",
                  borderRadius:18, padding:"14px 16px",
                  boxShadow:"0 2px 8px rgba(0,0,0,.04)"
                }}>
                  {/* Data pill */}
                  <div style={{
                    minWidth:52, textAlign:"center",
                    background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.15)",
                    borderRadius:12, padding:"8px 10px", flexShrink:0
                  }}>
                    <p style={{ fontSize:18, fontWeight:900, color:"#dc2626", margin:0, lineHeight:1, fontFamily:"'Sora',sans-serif" }}>
                      {s.date ? s.date.split("-")[2] : "—"}
                    </p>
                    <p style={{ fontSize:10, fontWeight:700, color:"#dc2626", margin:"2px 0 0", textTransform:"uppercase", letterSpacing:".06em" }}>
                      {s.date ? new Date(s.date+"T12:00:00").toLocaleDateString("it-IT",{month:"short"}) : ""}
                    </p>
                  </div>
                  {/* Info evento */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:800, fontSize:14, margin:"0 0 3px", fontFamily:"'Sora',sans-serif", color:INK, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {s.organizerName || "Locale"}
                    </p>
                    <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.5 }}>
                      {dateFormatted}
                      {s.startTime && s.endTime ? ` · ${s.startTime}–${s.endTime}` : ""}
                    </p>
                  </div>
                  {/* Badge confermato */}
                  <span style={{
                    fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:100,
                    background:"rgba(220,38,38,.08)", color:"#dc2626",
                    border:"1px solid rgba(220,38,38,.15)", flexShrink:0
                  }}>Prenotata</span>
                </div>
              );
            })}
          </div>
        </SCard>
      )}

      {/* Sync Google Calendar */}
      {plan!=="pro" ? (
        <SCard style={{ opacity:.6 }}>
          <STitle>Sync Google Calendar <ProBadge /></STitle>
          <ProLock feature="Sincronizzazione automatica con Google Calendar" plan={plan} />
        </SCard>
      ) : (
        <SCard>
          <STitle sub="Aggiorna automaticamente le date disponibili da Google Calendar">Sync Google Calendar</STitle>
          <button disabled style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"10px 22px", fontWeight:700, fontSize:13, cursor:"not-allowed", opacity:.5 }}>
            Connetti Google Calendar
          </button>
        </SCard>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB: PREPARAZIONE & SCALETTE
───────────────────────────────────────────────────────────────── */
const SCALETTA_STORAGE_KEY = "te_scalette_v1";