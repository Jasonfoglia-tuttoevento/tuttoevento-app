"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

/* ─── Helpers ─────────────────────────────────────────────── */
function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("it-IT", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
}
function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
}

/* ─── Avatar ──────────────────────────────────────────────── */
function Avatar({ name, size = 36, orange = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: orange ? "#ff5a00" : "#0a0a0b",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Sora',sans-serif", fontWeight: 800,
      fontSize: size * 0.36, color: "white", letterSpacing: "-.02em",
    }}>
      {initials(name)}
    </div>
  );
}

/* ─── ConvItem ────────────────────────────────────────────── */
function ConvItem({ conv, isActive, onClick }) {
  const unread = Number(conv.unreadCount || 0);
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", border: "none", cursor: "pointer",
      borderRadius: 20, padding: "12px 14px", marginBottom: 4,
      background: isActive ? "#ff5a00" : unread > 0 ? "rgba(255,90,0,.08)" : "rgba(255,255,255,.04)",
      borderLeft: !isActive && unread > 0 ? "3px solid #ff5a00" : "3px solid transparent",
      transition: "background .15s",
      fontFamily: "'Manrope',system-ui,sans-serif",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <p style={{ fontWeight:700, fontSize:13, color: isActive ? "white" : "#fff", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
          {conv.title || "Conversazione"}
        </p>
        {unread > 0 && !isActive && (
          <span style={{ background:"#ff5a00", color:"white", borderRadius:100, padding:"2px 7px", fontSize:10, fontWeight:800, flexShrink:0 }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>
      <p style={{ fontSize:11, color: isActive ? "rgba(255,255,255,.65)" : "rgba(255,255,255,.35)", margin:"4px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {conv.lastMessage || "Nessun messaggio ancora"}
      </p>
    </button>
  );
}

/* ─── Bubble ──────────────────────────────────────────────── */
function Bubble({ msg, isMine }) {
  return (
    <div style={{ display:"flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom:8, gap:8, alignItems:"flex-end" }}>
      {!isMine && <Avatar name={msg.senderName || "?"} size={28} />}
      <div style={{ maxWidth:"72%", minWidth:60 }}>
        {!isMine && (
          <p style={{ fontSize:10, fontWeight:700, color:"#ff5a00", marginBottom:3, marginLeft:4, fontFamily:"'Manrope',system-ui,sans-serif" }}>
            {msg.senderName || "Utente"}
          </p>
        )}
        <div style={{
          background: isMine ? "#ff5a00" : "rgba(255,255,255,.08)",
          border: isMine ? "none" : "1px solid rgba(255,255,255,.1)",
          borderRadius: isMine ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
          padding: "10px 14px",
        }}>
          <p style={{ fontSize:13, lineHeight:1.6, color:"white", margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word", fontFamily:"'Manrope',system-ui,sans-serif" }}>
            {msg.body}
          </p>
        </div>
        <p style={{ fontSize:10, color:"rgba(255,255,255,.25)", marginTop:3, textAlign: isMine ? "right" : "left", marginLeft:4, marginRight:4, fontFamily:"'Manrope',system-ui,sans-serif" }}>
          {formatTime(msg.createdAt)}
        </p>
      </div>
      {isMine && <Avatar name="Tu" size={28} orange />}
    </div>
  );
}

/* ─── ChatPanel principale ────────────────────────────────── */
export default function ChatPanel({ user }) {
  const [isOpen, setIsOpen]           = useState(false);
  const [view, setView]               = useState("list"); // "list" | "chat" (mobile)
  const [users, setUsers]             = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [message, setMessage]         = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSending, setIsSending]     = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const totalUnread = conversations.reduce((t, c) => t + Number(c.unreadCount || 0), 0);

  /* ── API helpers ── */
  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/chat/users");
    const d = await res.json();
    setUsers(Array.isArray(d) ? d : []);
  }, []);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/chat/conversations");
    const d = await res.json();
    if (!Array.isArray(d)) return;
    setConversations(d);
    setSelectedConversationId(prev => prev || (d.length > 0 ? d[0].id : null));
  }, []);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    const res = await fetch(`/api/chat/messages?conversationId=${convId}`);
    const d = await res.json();
    setMessages(Array.isArray(d) ? d : []);
  }, []);

  const markAsRead = useCallback(async (convId) => {
    if (!convId) return;
    await fetch("/api/chat/conversations", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: convId }),
    });
    loadConversations();
  }, [loadConversations]);

  /* ── Realtime ── */
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("chat-realtime")
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"chat_messages" }, (payload) => {
        const m = payload.new;
        if (Number(m.conversation_id) === Number(selectedConversationId)) {
          setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, {
            id: m.id, conversationId: m.conversation_id, senderId: m.sender_id,
            body: m.body, createdAt: m.created_at, senderName: "", senderRole: "",
          }]);
          if (isOpen) markAsRead(m.conversation_id);
        }
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, selectedConversationId, isOpen, loadConversations, markAsRead]);

  /* ── Init ── */
  useEffect(() => {
    if (!user?.id) return;
    loadUsers(); loadConversations();
  }, [user?.id, loadUsers, loadConversations]);

  /* ── Cambio conversazione ── */
  useEffect(() => {
    if (!selectedConversationId) return;
    loadMessages(selectedConversationId);
    if (isOpen) markAsRead(selectedConversationId);
  }, [selectedConversationId, isOpen, loadMessages, markAsRead]);

  /* ── Scroll automatico ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  /* ── Focus input quando si apre la chat ── */
  useEffect(() => {
    if (isOpen && view === "chat") setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen, view]);

  /* ── Apertura da eventi esterni ── */
  useEffect(() => {
    if (!user?.id) return;
    function handleOpenChat(e) {
      const d = e.detail;
      if (!d?.participantUserId) return;
      createOrOpenConversation({ participantUserId: d.participantUserId, bookingId: d.bookingId || null, eventId: d.eventId || null, title: d.title || "Conversazione" });
    }
    function handleOpenButton() {
      setIsOpen(true);
      setView("list");
      if (selectedConversationId) markAsRead(selectedConversationId);
    }
    window.addEventListener("tuttoevento:open-chat", handleOpenChat);
    window.addEventListener("tuttoevento:open-chat-button", handleOpenButton);
    return () => {
      window.removeEventListener("tuttoevento:open-chat", handleOpenChat);
      window.removeEventListener("tuttoevento:open-chat-button", handleOpenButton);
    };
  }, [user?.id, selectedConversationId, markAsRead]);

  /* ── Azioni ── */
  async function createOrOpenConversation({ participantUserId, bookingId=null, eventId=null, title="Nuova conversazione" }) {
    const res = await fetch("/api/chat/conversations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantUserId: Number(participantUserId), bookingId, eventId, title }),
    });
    const d = await res.json();
    if (!res.ok || !d.id) { alert("Errore apertura conversazione"); return; }
    setIsOpen(true);
    setSelectedConversationId(d.id);
    setSelectedUserId("");
    setShowNewChat(false);
    setView("chat");
    await loadConversations();
    await loadMessages(d.id);
    await markAsRead(d.id);
  }

  async function handleSelectConversation(convId) {
    setSelectedConversationId(convId);
    setView("chat");
    await loadMessages(convId);
    await markAsRead(convId);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!selectedConversationId || !message.trim() || isSending) return;
    setIsSending(true);
    const text = message.trim(); setMessage("");
    const res = await fetch("/api/chat/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedConversationId, message: text }),
    });
    if (!res.ok) { setMessage(text); alert("Errore invio messaggio"); }
    setIsSending(false);
  }

  const selectedConv = conversations.find(c => c.id === selectedConversationId);

  if (!user?.id) return null;

  return (
    <>
      <style>{`
        .cp-btn-open {
          display: none;
          position: fixed; bottom: 24px; right: 24px; z-index: 40;
          background: #0a0a0b; color: white;
          border: none; border-radius: 100px; padding: 14px 24px;
          font-family: 'Manrope',system-ui,sans-serif; font-weight: 800; font-size: .9rem;
          cursor: pointer; box-shadow: 0 8px 32px rgba(0,0,0,.4);
          transition: transform .2s, box-shadow .2s;
          align-items: center; gap: 8px;
        }
        @media(min-width:1024px) { .cp-btn-open { display:flex; } }
        .cp-btn-open:hover { transform: scale(1.03); box-shadow: 0 12px 40px rgba(0,0,0,.5); }
        .cp-badge { background:#ff5a00; color:white; border-radius:100px; padding:2px 8px; font-size:11px; font-weight:900; }

        /* Overlay */
        .cp-overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(0,0,0,.6); backdrop-filter: blur(6px);
          display: flex; justify-content: flex-end;
          animation: cp-fade-in .2s ease;
        }
        @keyframes cp-fade-in { from{opacity:0} to{opacity:1} }

        /* Pannello */
        .cp-panel {
          width: 100%; max-width: 960px; height: 100%;
          background: #0a0a0b;
          display: grid; grid-template-columns: 300px 1fr;
          animation: cp-slide-in .25s cubic-bezier(.4,0,.2,1);
        }
        @keyframes cp-slide-in { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        @media(max-width:767px) {
          .cp-panel { grid-template-columns: 1fr; max-width: 100%; }
          .cp-sidebar { display: none; }
          .cp-sidebar.mobile-visible { display: flex !important; }
          .cp-main { display: none; }
          .cp-main.mobile-visible { display: flex !important; }
        }

        /* Sidebar */
        .cp-sidebar {
          background: #111114;
          border-right: 1px solid rgba(255,255,255,.07);
          display: flex; flex-direction: column;
          height: 100%; overflow: hidden;
        }

        /* Main */
        .cp-main {
          display: flex; flex-direction: column;
          height: 100%; overflow: hidden;
          background: #0a0a0b;
        }

        /* Scrollbar sottile */
        .cp-scroll::-webkit-scrollbar { width: 4px; }
        .cp-scroll::-webkit-scrollbar-track { background: transparent; }
        .cp-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 2px; }

        /* Input */
        .cp-input {
          flex: 1; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px; padding: 12px 16px; color: white; font-size: 14px;
          font-family: 'Manrope',system-ui,sans-serif; outline: none; resize: none;
          transition: border-color .2s;
        }
        .cp-input::placeholder { color: rgba(255,255,255,.3); }
        .cp-input:focus { border-color: rgba(255,90,0,.5); }

        /* Send btn */
        .cp-send {
          background: #ff5a00; color: white; border: none; border-radius: 14px;
          padding: 12px 20px; font-weight: 800; font-size: .875rem; cursor: pointer;
          font-family: 'Manrope',system-ui,sans-serif; transition: all .2s; flex-shrink: 0;
        }
        .cp-send:disabled { opacity: .4; cursor: not-allowed; }
        .cp-send:not(:disabled):hover { background: #e85100; transform: scale(1.02); }

        /* New chat form */
        .cp-new-chat {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px; padding: 16px; margin: 12px 12px 0;
        }
        .cp-select {
          width: 100%; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
          border-radius: 12px; padding: 10px 12px; color: white; font-size: 13px;
          font-family: 'Manrope',system-ui,sans-serif; outline: none; margin-bottom: 10px;
        }
        .cp-select option { background: #1a1a1e; color: white; }
        .cp-btn-start {
          width: 100%; background: #ff5a00; color: white; border: none; border-radius: 12px;
          padding: 11px; font-weight: 800; font-size: 13px; cursor: pointer;
          font-family: 'Manrope',system-ui,sans-serif; transition: all .2s;
        }
        .cp-btn-start:disabled { opacity: .4; cursor: not-allowed; }
        .cp-btn-start:not(:disabled):hover { background: #e85100; }

        /* Header back btn mobile */
        .cp-back {
          background: rgba(255,255,255,.08); border: none; border-radius: 10px;
          padding: 7px 12px; color: white; font-weight: 700; font-size: 12px;
          cursor: pointer; font-family: 'Manrope',system-ui,sans-serif; display: none;
        }
        @media(max-width:767px) { .cp-back { display: block; } }

        /* Typing indicator */
        @keyframes cp-blink { 0%,80%,100%{opacity:.3} 40%{opacity:1} }
        .cp-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,.5); margin:0 2px; animation:cp-blink 1.4s infinite; }
        .cp-dot:nth-child(2) { animation-delay:.2s; }
        .cp-dot:nth-child(3) { animation-delay:.4s; }
      `}</style>

      {/* ── Bottone apri ── */}
      <button className="cp-btn-open" onClick={() => { setIsOpen(true); setView("list"); }}>
        <span>💬</span>
        <span>Chat</span>
        {totalUnread > 0 && <span className="cp-badge">{totalUnread > 99 ? "99+" : totalUnread}</span>}
      </button>

      {/* ── Overlay + Pannello ── */}
      {isOpen && (
        <div className="cp-overlay" onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="cp-panel">

            {/* ══ SIDEBAR ══ */}
            <aside className={`cp-sidebar${view === "list" ? " mobile-visible" : ""}`}>

              {/* Header sidebar */}
              <div style={{ padding:"20px 16px 14px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".16em", color:"#ff5a00", margin:0, fontFamily:"'Manrope',system-ui,sans-serif" }}>TuttoEvento</p>
                    <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:"1.3rem", letterSpacing:"-.04em", color:"white", margin:"4px 0 0" }}>Chat</h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} style={{ width:36, height:36, borderRadius:12, background:"rgba(255,255,255,.08)", border:"none", color:"white", fontSize:"1.2rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }}>×</button>
                </div>
                <button onClick={() => setShowNewChat(p => !p)}
                  style={{ width:"100%", background: showNewChat ? "#ff5a00" : "rgba(255,255,255,.07)", border:`1px solid ${showNewChat ? "#ff5a00" : "rgba(255,255,255,.12)"}`, borderRadius:14, padding:"10px 14px", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Manrope',system-ui,sans-serif", textAlign:"left", transition:"all .2s" }}>
                  {showNewChat ? "✕ Annulla" : "+ Nuova conversazione"}
                </button>
              </div>

              {/* Nuova chat */}
              {showNewChat && (
                <div className="cp-new-chat">
                  <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:"rgba(255,255,255,.4)", marginBottom:10, fontFamily:"'Manrope',system-ui,sans-serif" }}>Seleziona utente</p>
                  <select className="cp-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                    <option value="">Scegli un utente...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}
                  </select>
                  <button className="cp-btn-start" disabled={!selectedUserId}
                    onClick={() => {
                      const u = users.find(u => String(u.id) === String(selectedUserId));
                      createOrOpenConversation({ participantUserId: Number(selectedUserId), title: u ? `${user.name} & ${u.name}` : "Nuova chat" });
                    }}>
                    Avvia conversazione →
                  </button>
                </div>
              )}

              {/* Lista conversazioni */}
              <div className="cp-scroll" style={{ flex:1, overflowY:"auto", padding:"10px 12px 80px" }}>
                {conversations.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 16px" }}>
                    <p style={{ fontSize:24, marginBottom:8 }}>💬</p>
                    <p style={{ fontSize:13, color:"rgba(255,255,255,.3)", fontFamily:"'Manrope',system-ui,sans-serif" }}>Nessuna conversazione ancora.<br/>Inizia una nuova chat.</p>
                  </div>
                ) : conversations.map(c => (
                  <ConvItem key={c.id} conv={c} isActive={c.id === selectedConversationId && view === "chat"} onClick={() => handleSelectConversation(c.id)} />
                ))}
              </div>
            </aside>

            {/* ══ AREA MESSAGGI ══ */}
            <section className={`cp-main${view === "chat" ? " mobile-visible" : ""}`}>

              {/* Header chat */}
              <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0, display:"flex", alignItems:"center", gap:12 }}>
                <button className="cp-back" onClick={() => setView("list")}>← Lista</button>
                {selectedConv ? (
                  <>
                    <Avatar name={selectedConv.title} size={38} orange />
                    <div style={{ flex:1, minWidth:0 }}>
                      <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1rem", color:"white", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", letterSpacing:"-.03em" }}>{selectedConv.title}</h3>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", margin:"2px 0 0", fontFamily:"'Manrope',system-ui,sans-serif", display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
                        Live · Realtime
                        {selectedConv.bookingId && <span style={{ marginLeft:8, color:"#ff5a00", fontWeight:700 }}>· Booking #{selectedConv.bookingId}</span>}
                      </p>
                    </div>
                  </>
                ) : (
                  <p style={{ color:"rgba(255,255,255,.3)", fontFamily:"'Manrope',system-ui,sans-serif", fontSize:13 }}>Seleziona una conversazione</p>
                )}
                <button onClick={() => setIsOpen(false)} style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.07)", border:"none", color:"white", fontSize:"1.1rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, flexShrink:0 }}>×</button>
              </div>

              {/* Messaggi */}
              <div className="cp-scroll" style={{ flex:1, overflowY:"auto", padding:"20px 16px" }}>
                {!selectedConversationId ? (
                  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
                    <span style={{ fontSize:48 }}>💬</span>
                    <p style={{ color:"rgba(255,255,255,.3)", fontFamily:"'Manrope',system-ui,sans-serif", fontSize:14, textAlign:"center" }}>Seleziona una conversazione<br/>o avviarne una nuova</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
                    <span style={{ fontSize:48 }}>✉️</span>
                    <p style={{ color:"rgba(255,255,255,.3)", fontFamily:"'Manrope',system-ui,sans-serif", fontSize:14, textAlign:"center" }}>Nessun messaggio ancora.<br/>Scrivi il primo!</p>
                  </div>
                ) : (
                  <>
                    {messages.map(m => (
                      <Bubble key={m.id} msg={m} isMine={String(m.senderId) === String(user.id)} />
                    ))}
                    {isSending && (
                      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8, gap:8, alignItems:"flex-end" }}>
                        <div style={{ background:"rgba(255,90,0,.3)", borderRadius:"20px 20px 6px 20px", padding:"10px 16px" }}>
                          <span className="cp-dot" /><span className="cp-dot" /><span className="cp-dot" />
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,.07)", display:"flex", gap:10, alignItems:"flex-end", flexShrink:0, background:"#0a0a0b" }}>
                <textarea
                  ref={inputRef}
                  className="cp-input"
                  rows={1}
                  value={message}
                  onChange={e => {
                    setMessage(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                  placeholder={selectedConversationId ? "Scrivi un messaggio... (Enter per inviare)" : "Seleziona una conversazione"}
                  disabled={!selectedConversationId}
                  style={{ flex:1, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:14, padding:"12px 16px", color:"white", fontSize:14, fontFamily:"'Manrope',system-ui,sans-serif", outline:"none", resize:"none", minHeight:44, maxHeight:120, transition:"border-color .2s" }}
                />
                <button className="cp-send" type="submit" disabled={!selectedConversationId || !message.trim() || isSending}>
                  {isSending ? "..." : "Invia"}
                </button>
              </form>

            </section>
          </div>
        </div>
      )}
    </>
  );
}