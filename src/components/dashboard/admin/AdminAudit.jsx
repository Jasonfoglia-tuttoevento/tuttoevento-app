"use client";

import { useState, useEffect } from "react";

const ORANGE = "#ff5a00";
const INK = "#0a0a0b";
const MUTED = "#6b6b73";

const PRIORITY_COLORS = { urgent:"#dc2626", high:ORANGE, normal:"#2563eb", low:"#6b7280" };
const PRIORITY_LABELS = { urgent:"🔴 Urgente", high:"🟠 Alta", normal:"🔵 Normale", low:"⚪ Bassa" };
const STATUS_COLS = [
  { id:"todo", label:"Da fare", color:"#6b7280" },
  { id:"doing", label:"In corso", color:ORANGE },
  { id:"done", label:"Completato", color:"#16a34a" },
];

export default function AdminAudit({ users = [] }) {
  const [tasks, setTasks] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [activeTab, setActiveTab] = useState("tasks");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", priority:"normal", status:"todo", dueDate:"", relatedName:"" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin-tasks").then(r=>r.json()).then(d => setTasks(Array.isArray(d)?d:[])).catch(()=>{});
    fetch("/api/admin-audit").then(r=>r.json()).then(d => setAuditLog(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  async function saveTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin-tasks", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (res.ok) { setTasks(prev => [d, ...prev]); setShowForm(false); setForm({ title:"", description:"", priority:"normal", status:"todo", dueDate:"", relatedName:"" }); }
    } catch {}
    setSaving(false);
  }

  async function updateTaskStatus(id, status) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    await fetch("/api/admin-tasks", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, status }),
    }).catch(()=>{});
  }

  async function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    await fetch(`/api/admin-tasks?id=${id}`, { method:"DELETE" }).catch(()=>{});
  }

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  const s = {
    card: { background:"white", border:"1px solid rgba(0,0,0,.06)", borderRadius:24, padding:"20px 22px" },
    tab: (a) => ({ padding:"7px 16px", borderRadius:100, fontWeight:700, fontSize:13, cursor:"pointer", border: a?"none":"1px solid rgba(0,0,0,.1)", background: a?INK:"white", color: a?"white":MUTED, fontFamily:"inherit" }),
    input: { width:"100%", background:"#fbfaf8", border:"1px solid rgba(0,0,0,.1)", borderRadius:12, padding:"9px 13px", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Manrope:wght@400;600;700&display=swap');`}</style>

      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => setActiveTab("tasks")} style={s.tab(activeTab==="tasks")}>Task manager</button>
        <button onClick={() => setActiveTab("audit")} style={s.tab(activeTab==="audit")}>Log audit</button>
      </div>

      {/* TASK MANAGER */}
      {activeTab === "tasks" && (
        <div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
            <button onClick={() => setShowForm(!showForm)}
              style={{ background:ORANGE, color:"white", border:"none", borderRadius:100, padding:"9px 20px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              {showForm ? "Annulla" : "+ Nuovo task"}
            </button>
          </div>

          {showForm && (
            <div style={{ ...s.card, marginBottom:16 }}>
              <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:16, marginBottom:14 }}>Nuovo task</h3>
              <form onSubmit={saveTask} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <input placeholder="Titolo task *" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={s.input} />
                <textarea placeholder="Descrizione" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                  style={{ ...s.input, minHeight:80, resize:"none" }} />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:MUTED, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.1em" }}>Priorità</label>
                    <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} style={s.input}>
                      <option value="low">Bassa</option>
                      <option value="normal">Normale</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:MUTED, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.1em" }}>Stato</label>
                    <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={s.input}>
                      <option value="todo">Da fare</option>
                      <option value="doing">In corso</option>
                      <option value="done">Completato</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:MUTED, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.1em" }}>Scadenza</label>
                    <input type="date" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} style={s.input} />
                  </div>
                </div>
                <input placeholder="Riferimento (artista/locale/booking)" value={form.relatedName} onChange={e=>setForm(p=>({...p,relatedName:e.target.value}))} style={s.input} />
                <button disabled={saving} style={{ background:INK, color:"white", border:"none", borderRadius:100, padding:"10px 24px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", alignSelf:"flex-start" }}>
                  {saving ? "Salvo..." : "Salva task"}
                </button>
              </form>
            </div>
          )}

          {/* Kanban task */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {STATUS_COLS.map(col => (
              <div key={col.id} style={{ background:"#fbfaf8", borderRadius:20, padding:"14px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <p style={{ fontWeight:800, fontSize:14, color:col.color }}>{col.label}</p>
                  <span style={{ background:col.color, color:"white", borderRadius:100, fontSize:11, fontWeight:700, padding:"2px 8px" }}>{tasksByStatus(col.id).length}</span>
                </div>
                {tasksByStatus(col.id).length === 0 && (
                  <p style={{ fontSize:12, color:"rgba(0,0,0,.25)", textAlign:"center", padding:"16px 0" }}>Nessun task</p>
                )}
                {tasksByStatus(col.id).map(task => (
                  <div key={task.id} style={{ background:"white", borderRadius:14, padding:"12px", marginBottom:8, border:"1px solid rgba(0,0,0,.06)", borderLeft:`4px solid ${PRIORITY_COLORS[task.priority]||MUTED}` }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:6 }}>
                      <p style={{ fontWeight:700, fontSize:13, lineHeight:1.3 }}>{task.title}</p>
                      <button onClick={() => deleteTask(task.id)} style={{ background:"transparent", border:"none", color:"rgba(0,0,0,.25)", cursor:"pointer", fontSize:16, lineHeight:1, flexShrink:0 }}>×</button>
                    </div>
                    {task.description && <p style={{ fontSize:12, color:MUTED, marginBottom:8, lineHeight:1.4 }}>{task.description}</p>}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:PRIORITY_COLORS[task.priority] }}>{PRIORITY_LABELS[task.priority]}</span>
                      {task.due_date && <span style={{ fontSize:10, color:MUTED, fontWeight:600 }}>📅 {task.due_date}</span>}
                    </div>
                    {task.related_name && <p style={{ fontSize:11, color:MUTED, marginTop:6, fontStyle:"italic" }}>↳ {task.related_name}</p>}
                    {/* Azioni rapide */}
                    <div style={{ display:"flex", gap:4, marginTop:10 }}>
                      {STATUS_COLS.filter(c => c.id !== col.id).map(c => (
                        <button key={c.id} onClick={() => updateTaskStatus(task.id, c.id)}
                          style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:8, border:`1px solid ${c.color}40`, background:c.color+"12", color:c.color, cursor:"pointer", fontFamily:"inherit" }}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOG */}
      {activeTab === "audit" && (
        <div style={s.card}>
          <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.03em", marginBottom:16 }}>Log azioni sistema</h2>
          {auditLog.length === 0 ? (
            <p style={{ color:"rgba(0,0,0,.3)", fontSize:14 }}>Nessuna azione registrata.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {auditLog.slice(0,50).map((log, i) => (
                <div key={log.id || i} style={{ display:"flex", gap:14, padding:"10px 0", borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:ORANGE, marginTop:6, flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:700, fontSize:13 }}>{log.action}</p>
                    {log.detail && <p style={{ fontSize:12, color:MUTED, marginTop:2 }}>{log.detail}</p>}
                    {log.entity_name && <p style={{ fontSize:11, color:ORANGE, marginTop:2, fontWeight:600 }}>↳ {log.entity_name}</p>}
                  </div>
                  <p style={{ fontSize:11, color:MUTED, flexShrink:0, whiteSpace:"nowrap" }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString("it-IT", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }) : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}