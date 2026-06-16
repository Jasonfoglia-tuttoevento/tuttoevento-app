"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import VerifiedBadge from "@/components/VerifiedBadge";

/* ─────────────────────── Helpers ─────────────────────── */
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}
function formatLastSeen(iso) {
  if (!iso) return null;
  const diffMin = Math.floor((Date.now() - new Date(iso)) / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 2) return "Online";
  if (diffMin < 60) return `Attivo ${diffMin} min fa`;
  if (diffH < 24) return `Attivo ${diffH}h fa`;
  if (diffD < 7) return `Attivo ${diffD}g fa`;
  return `Attivo il ${new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })}`;
}
function isOnline(iso) { return iso && (Date.now() - new Date(iso)) < 120000; }
function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
function getOtherName(title, myName) {
  if (!title) return "Conversazione";
  const parts = title.split(/[&·\-,]/).map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return title;
  const mine = (myName || "").toLowerCase();
  return parts.find(p => p.toLowerCase() !== mine) || parts[parts.length - 1];
}

/* ─────────────────────── Avatar ─────────────────────── */
function Avatar({ name, photo, verified, size = 36, orange = false, online: onl = false }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      {photo ? (
        <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(255,255,255,.12)" }} />
      ) : (
        <div style={{ width: size, height: size, borderRadius: "50%", background: orange ? "#ff5a00" : "#2a2a30", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: size * 0.38, color: "white" }}>
          {initials(name)}
        </div>
      )}
      {verified && <div style={{ position: "absolute", bottom: -2, right: -2 }}><VerifiedBadge size={size * 0.42} /></div>}
      {onl && !verified && <span style={{ position: "absolute", bottom: 0, right: 0, width: size * 0.26, height: size * 0.26, borderRadius: "50%", background: "#22c55e", border: `2px solid #0a0a0b` }} />}
    </div>
  );
}

/* ─────────────────────── ConvItem ─────────────────────── */
function ConvItem({ conv, isActive, onClick, myName, onlineMap, usersMap }) {
  const unread = Number(conv.unreadCount || 0);
  const otherUser = usersMap?.[conv.otherUserId];
  const otherName = otherUser?.name || getOtherName(conv.title, myName);
  const lastSeen = onlineMap?.[conv.otherUserId];
  const online = isOnline(lastSeen);

  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", border: "none", cursor: "pointer",
      borderRadius: 14, padding: "11px 12px", marginBottom: 2,
      background: isActive ? "rgba(255,90,0,.15)" : "transparent",
      transition: "background .12s", fontFamily: "'Manrope',system-ui,sans-serif",
      display: "flex", gap: 12, alignItems: "center",
    }}>
      <Avatar name={otherName} photo={otherUser?.photo} verified={otherUser?.verified} size={46} online={online} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{otherName}</p>
          {unread > 0 && !isActive && <span style={{ background: "#ff5a00", color: "white", borderRadius: 100, padding: "1px 7px", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{unread > 99 ? "99+" : unread}</span>}
        </div>
        <p style={{ fontSize: 12.5, color: unread > 0 ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.35)", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {conv.lastMessage || "Nessun messaggio ancora"}
        </p>
      </div>
    </button>
  );
}

/* ─────────────────────── Bubble ─────────────────────── */
function Bubble({ msg, isMine }) {
  return (
    <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: 3, padding: "0 2px" }}>
      <div style={{
        maxWidth: "78%",
        background: isMine ? "#ff5a00" : "#26262b",
        borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        padding: "8px 12px 6px",
      }}>
        <p style={{ fontSize: 14.5, lineHeight: 1.4, color: "white", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'Manrope',system-ui,sans-serif" }}>{msg.body}</p>
        <p style={{ fontSize: 10, color: isMine ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.4)", margin: "2px 0 0", textAlign: "right", fontFamily: "'Manrope',system-ui,sans-serif" }}>
          {msg.pending ? "Invio…" : formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════ ChatPanel ═══════════════════════ */
export default function ChatPanel({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("list");
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [onlineMap, setOnlineMap] = useState({});

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const pingRef = useRef(null);
  const supabaseRef = useRef(null);
  const selectedConvRef = useRef(null);
  const isOpenRef = useRef(false);

  const usersMap = Object.fromEntries(users.map(u => [u.id, u]));
  const totalUnread = conversations.reduce((t, c) => t + Number(c.unreadCount || 0), 0);

  useEffect(() => { selectedConvRef.current = selectedConvId; }, [selectedConvId]);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  /* ── Presenza ── */
  useEffect(() => {
    if (!user?.id) return;
    async function ping() { try { await fetch("/api/presence", { method: "POST" }); } catch {} }
    ping();
    pingRef.current = setInterval(ping, 60000);
    return () => clearInterval(pingRef.current);
  }, [user?.id]);

  const loadPresence = useCallback(async () => {
    try {
      const res = await fetch("/api/presence");
      const d = await res.json();
      if (Array.isArray(d)) {
        const map = {};
        d.forEach(u => { map[u.id] = u.last_seen; });
        setOnlineMap(map);
      }
    } catch {}
  }, []);

  /* ── API ── */
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
    loadPresence();
  }, [loadPresence]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    const res = await fetch(`/api/chat/messages?conversationId=${convId}`);
    const d = await res.json();
    setMessages(Array.isArray(d) ? d : []);
  }, []);

  const markAsRead = useCallback(async (convId) => {
    if (!convId) return;
    try {
      await fetch("/api/chat/conversations", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId }),
      });
      // Azzera unread localmente senza refetch completo
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
    } catch {}
  }, []);

  /* ── Realtime ── */
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createSupabaseBrowserClient();
    supabaseRef.current = supabase;
    let channel = null;
    let pollTimer = null;

    function buildChannel() {
      if (channel) { try { supabase.removeChannel(channel); } catch {} }
      channel = supabase
        .channel(`chat-${user.id}-${Date.now()}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
          const m = payload.new;
          const activeConvId = selectedConvRef.current;
          if (Number(m.conversation_id) === Number(activeConvId)) {
            setMessages(prev => {
              // Sostituisci eventuale messaggio optimistic (stesso body+sender)
              const withoutPending = prev.filter(x => !(x.pending && x.senderId === m.sender_id && x.body === m.body));
              if (withoutPending.some(x => x.id === m.id)) return withoutPending;
              return [...withoutPending, { id: m.id, conversationId: m.conversation_id, senderId: m.sender_id, body: m.body, createdAt: m.created_at }];
            });
            if (isOpenRef.current) markAsRead(m.conversation_id);
          }
          // Aggiorna solo l'anteprima conversazione localmente (no refetch pesante)
          setConversations(prev => prev.map(c =>
            Number(c.id) === Number(m.conversation_id)
              ? { ...c, lastMessage: m.body, unreadCount: (Number(m.conversation_id) === Number(selectedConvRef.current) && isOpenRef.current) ? 0 : Number(c.unreadCount || 0) + (m.sender_id !== user.id ? 1 : 0) }
              : c
          ));
        })
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") startPolling();
          else stopPolling();
        });
    }
    function startPolling() {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        if (selectedConvRef.current) loadMessages(selectedConvRef.current);
        loadConversations();
      }, 5000);
    }
    function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        if (selectedConvRef.current) loadMessages(selectedConvRef.current);
        loadConversations();
        buildChannel();
        stopPolling();
      } else startPolling();
    }
    buildChannel();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopPolling();
      if (channel) { try { supabase.removeChannel(channel); } catch {} }
    };
  }, [user?.id, loadConversations, markAsRead, loadMessages]);

  /* ── Apertura da altri componenti ── */
  useEffect(() => {
    if (!user?.id) return;
    function handleOpenChat(e) {
      const d = e.detail;
      if (!d?.participantUserId) return;
      createOrOpenConversation({ participantUserId: d.participantUserId, bookingId: d.bookingId || null, eventId: d.eventId || null, title: d.title || "Conversazione" });
    }
    function handleOpenButton() {
      setIsOpen(true); setView("list");
      if (selectedConvRef.current) markAsRead(selectedConvRef.current);
    }
    window.addEventListener("tuttoevento:open-chat", handleOpenChat);
    window.addEventListener("tuttoevento:open-chat-button", handleOpenButton);
    return () => {
      window.removeEventListener("tuttoevento:open-chat", handleOpenChat);
      window.removeEventListener("tuttoevento:open-chat-button", handleOpenButton);
    };
  }, [user?.id, markAsRead]);

  /* ── Init ── */
  useEffect(() => {
    if (!user?.id) return;
    loadUsers(); loadConversations();
  }, [user?.id, loadUsers, loadConversations]);

  useEffect(() => {
    if (!selectedConvId) return;
    loadMessages(selectedConvId);
    if (isOpen) markAsRead(selectedConvId);
  }, [selectedConvId, isOpen, loadMessages, markAsRead]);

  // Scroll automatico in fondo
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen) loadPresence();
  }, [isOpen, loadPresence]);

  /* ── Azioni ── */
  async function createOrOpenConversation({ participantUserId, bookingId = null, eventId = null, title = "Nuova conversazione" }) {
    const otherUser = users.find(u => String(u.id) === String(participantUserId));
    const cleanTitle = otherUser?.name || title;
    const res = await fetch("/api/chat/conversations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantUserId: Number(participantUserId), bookingId, eventId, title: cleanTitle }),
    });
    const d = await res.json();
    if (!res.ok || !d.id) { alert("Errore apertura conversazione"); return; }
    setIsOpen(true); setSelectedConvId(d.id); setSelectedUserId(""); setShowNewChat(false); setView("chat");
    await loadConversations(); await loadMessages(d.id); await markAsRead(d.id);
  }

  async function handleSelectConv(convId) {
    setSelectedConvId(convId); setView("chat");
    await loadMessages(convId); await markAsRead(convId);
  }

  async function sendMessage(e) {
    if (e) e.preventDefault();
    const text = message.trim();
    if (!selectedConvId || !text || isSending) return;
    setMessage("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    // Optimistic update — messaggio appare SUBITO (velocità WhatsApp)
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, conversationId: selectedConvId, senderId: user.id, body: text, createdAt: new Date().toISOString(), pending: true }]);

    setIsSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConvId, message: text }),
      });
      if (!res.ok) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setMessage(text);
        alert("Errore invio messaggio");
      }
      // Il realtime sostituirà il temp con quello reale
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setMessage(text);
      alert("Errore di rete");
    }
    setIsSending(false);
    inputRef.current?.focus();
  }

  function handleInputChange(e) {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  }

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const selOtherUser = selectedConv ? usersMap[selectedConv.otherUserId] : null;
  const otherName = selectedConv ? (selOtherUser?.name || getOtherName(selectedConv.title, user?.name)) : null;
  const otherLastSeen = selectedConv ? onlineMap?.[selectedConv.otherUserId] : null;
  const otherOnline = isOnline(otherLastSeen);

  if (!user?.id) return null;

  return (
    <>
      <style>{`
        .cp-btn{display:none;position:fixed;bottom:24px;right:24px;z-index:40;background:#0a0a0b;color:white;border:none;border-radius:100px;padding:13px 22px;font-family:'Manrope',system-ui,sans-serif;font-weight:800;font-size:.875rem;cursor:pointer;box-shadow:0 8px 32px rgba(0,0,0,.5);align-items:center;gap:8px;}
        @media(min-width:1024px){.cp-btn{display:flex;}}
        .cp-badge{background:#ff5a00;color:white;border-radius:100px;padding:2px 8px;font-size:11px;font-weight:900;}
        .cp-overlay{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.6);display:flex;justify-content:flex-end;}
        .cp-panel{
          width:100%;max-width:940px;background:#0a0a0b;
          display:grid;grid-template-columns:300px 1fr;
          border-left:1px solid rgba(255,255,255,.07);
          height:100vh;height:100dvh;overflow:hidden;
        }
        .cp-sidebar{background:#111114;border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;min-height:0;overflow:hidden;}
        .cp-main{display:flex;flex-direction:column;min-height:0;background:#0a0a0b;overflow:hidden;}
        .cp-scroll::-webkit-scrollbar{width:4px;}
        .cp-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px;}
        .cp-input{flex:1;background:#1e1e22;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:10px 16px;color:white;font-size:16px;font-family:'Manrope',system-ui,sans-serif;outline:none;resize:none;min-height:44px;max-height:100px;line-height:1.4;}
        .cp-input::placeholder{color:rgba(255,255,255,.3);}
        .cp-input:focus{border-color:rgba(255,90,0,.5);}
        .cp-send{background:#ff5a00;color:white;border:none;border-radius:50%;width:44px;height:44px;font-weight:800;font-size:20px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
        .cp-send:disabled{opacity:.4;}
        .cp-select{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 12px;color:white;font-size:16px;font-family:'Manrope',system-ui,sans-serif;outline:none;margin-bottom:10px;}
        .cp-select option{background:#1a1a1e;color:white;}
        .cp-start{width:100%;background:#ff5a00;color:white;border:none;border-radius:12px;padding:12px;font-weight:800;font-size:14px;cursor:pointer;font-family:'Manrope',system-ui,sans-serif;}
        .cp-start:disabled{opacity:.4;}
        .cp-back{display:none;background:none;border:none;color:white;font-size:24px;cursor:pointer;padding:0 4px;line-height:1;}
        .cp-newbtn{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px 14px;color:white;font-size:14px;font-weight:700;cursor:pointer;font-family:'Manrope',system-ui,sans-serif;text-align:left;}
        @media(max-width:767px){
          .cp-overlay{justify-content:center;}
          .cp-panel{grid-template-columns:1fr;max-width:100%;border-left:none;}
          .cp-sidebar{display:none;}
          .cp-sidebar.mv{display:flex;}
          .cp-main{display:none;}
          .cp-main.mv{display:flex;}
          .cp-back{display:block;}
        }
      `}</style>

      <button className="cp-btn" onClick={() => { setIsOpen(true); setView("list"); }}>
        <span>💬</span><span>Chat</span>
        {totalUnread > 0 && <span className="cp-badge">{totalUnread > 99 ? "99+" : totalUnread}</span>}
      </button>

      {isOpen && (
        <div className="cp-overlay" onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="cp-panel">

            {/* ══ SIDEBAR ══ */}
            <aside className={`cp-sidebar${view === "list" ? " mv" : ""}`}>
              <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "1.3rem", color: "white", margin: 0 }}>Chat</h2>
                  <button onClick={() => setIsOpen(false)} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.07)", border: "none", color: "white", fontSize: "1.3rem", cursor: "pointer" }}>×</button>
                </div>
                <button className="cp-newbtn" onClick={() => setShowNewChat(p => !p)}>
                  {showNewChat ? "✕ Annulla" : "+ Nuova conversazione"}
                </button>
              </div>

              {showNewChat && (
                <div style={{ margin: "10px 12px 0", background: "rgba(255,255,255,.04)", borderRadius: 14, padding: 14, flexShrink: 0 }}>
                  <select className="cp-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                    <option value="">Seleziona utente...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button className="cp-start" disabled={!selectedUserId} onClick={() => createOrOpenConversation({ participantUserId: Number(selectedUserId) })}>
                    Avvia chat →
                  </button>
                </div>
              )}

              <div className="cp-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 8px 20px", minHeight: 0 }}>
                {conversations.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 16px" }}>
                    <p style={{ fontSize: 28, margin: "0 0 10px" }}>💬</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)", fontFamily: "'Manrope',system-ui,sans-serif" }}>Nessuna conversazione.</p>
                  </div>
                ) : conversations.map(c => (
                  <ConvItem key={c.id} conv={c} isActive={c.id === selectedConvId && view === "chat"} onClick={() => handleSelectConv(c.id)} myName={user?.name} onlineMap={onlineMap} usersMap={usersMap} />
                ))}
              </div>
            </aside>

            {/* ══ MAIN ══ */}
            <section className={`cp-main${view === "chat" ? " mv" : ""}`}>
              {/* Header */}
              <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <button className="cp-back" onClick={() => setView("list")}>‹</button>
                {selectedConv && otherName ? (
                  <>
                    <Avatar name={otherName} photo={selOtherUser?.photo} verified={selOtherUser?.verified} size={40} online={otherOnline} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1rem", color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{otherName}</h3>
                        {selOtherUser?.verified && <VerifiedBadge size={14} />}
                      </div>
                      <p style={{ fontSize: 11.5, margin: "1px 0 0", fontFamily: "'Manrope',system-ui,sans-serif", color: otherOnline ? "#22c55e" : "rgba(255,255,255,.4)", fontWeight: 600 }}>
                        {otherLastSeen ? formatLastSeen(otherLastSeen) : "Offline"}
                      </p>
                    </div>
                  </>
                ) : <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14, flex: 1 }}>Seleziona una conversazione</p>}
                <button onClick={() => setIsOpen(false)} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.07)", border: "none", color: "white", fontSize: "1.2rem", cursor: "pointer", flexShrink: 0 }}>×</button>
              </div>

              {/* Messaggi */}
              <div ref={scrollRef} className="cp-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 12px", minHeight: 0 }}>
                {!selectedConvId ? (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ fontSize: 48 }}>💬</span>
                    <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Seleziona una conversazione</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ fontSize: 48 }}>✉️</span>
                    <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14, textAlign: "center" }}>Nessun messaggio.<br />Scrivi il primo!</p>
                  </div>
                ) : (
                  <>
                    {messages.map(m => <Bubble key={m.id} msg={m} isMine={String(m.senderId) === String(user.id)} />)}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div style={{ padding: "10px 12px calc(10px + env(safe-area-inset-bottom))", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0, background: "#0a0a0b" }}>
                <textarea
                  ref={inputRef}
                  className="cp-input"
                  rows={1}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                  placeholder={selectedConvId ? "Messaggio" : "Seleziona una chat"}
                  disabled={!selectedConvId}
                />
                <button className="cp-send" type="button" onClick={sendMessage} disabled={!selectedConvId || !message.trim()}>↑</button>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}