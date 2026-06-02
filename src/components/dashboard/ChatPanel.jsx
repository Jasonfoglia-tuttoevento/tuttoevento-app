"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  const totalUnread = conversations.reduce((t, c) => t + Number(c.unreadCount || 0), 0);

  useEffect(() => {
    if (!user?.id) return;
    loadUsers();
    loadConversations();
    const interval = setInterval(() => {
      loadConversations();
      if (selectedConversationId) {
        loadMessages(selectedConversationId);
        if (isOpen) markConversationAsRead(selectedConversationId);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user?.id, selectedConversationId, isOpen]);

  useEffect(() => {
    if (!user?.id) return;
    function handleOpenChat(event) {
      const detail = event.detail;
      if (!detail?.participantUserId) { alert("Impossibile aprire la chat: participantUserId mancante."); return; }
      createOrOpenConversation({
        participantUserId: detail.participantUserId,
        bookingId: detail.bookingId || null,
        eventId: detail.eventId || null,
        title: detail.title || "Conversazione booking",
      });
    }
    function handleOpenChatButton() {
      setIsOpen(true);
      if (selectedConversationId) markConversationAsRead(selectedConversationId);
    }
    window.addEventListener("tuttoevento:open-chat", handleOpenChat);
    window.addEventListener("tuttoevento:open-chat-button", handleOpenChatButton);
    return () => {
      window.removeEventListener("tuttoevento:open-chat", handleOpenChat);
      window.removeEventListener("tuttoevento:open-chat-button", handleOpenChatButton);
    };
  }, [user?.id, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;
    loadMessages(selectedConversationId);
    if (isOpen) markConversationAsRead(selectedConversationId);
  }, [selectedConversationId, isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadUsers() {
    // currentUserId rimosso: la sessione lo gestisce lato server
    const res = await fetch("/api/chat/users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  }

  async function loadConversations() {
    // userId rimosso: la sessione lo gestisce lato server
    const res = await fetch("/api/chat/conversations");
    const data = await res.json();
    setConversations(Array.isArray(data) ? data : []);
    if (!selectedConversationId && Array.isArray(data) && data.length > 0) {
      setSelectedConversationId(data[0].id);
    }
  }

  async function loadMessages(conversationId) {
    const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  }

  async function markConversationAsRead(conversationId) {
    if (!conversationId) return;
    // userId rimosso: la sessione lo gestisce lato server
    await fetch("/api/chat/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    await loadConversations();
  }

  async function createOrOpenConversation({ participantUserId, bookingId = null, eventId = null, title = "Nuova conversazione" }) {
    // currentUserId rimosso: la sessione lo gestisce lato server
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantUserId: Number(participantUserId), bookingId, eventId, title }),
    });
    const data = await res.json();
    if (!res.ok || !data.id) { alert("Errore apertura conversazione"); return; }
    setIsOpen(true);
    setSelectedConversationId(data.id);
    setSelectedUserId("");
    await loadConversations();
    await loadMessages(data.id);
    await markConversationAsRead(data.id);
  }

  async function createConversation() {
    if (!selectedUserId) return;
    const selectedUser = users.find((u) => String(u.id) === String(selectedUserId));
    await createOrOpenConversation({
      participantUserId: Number(selectedUserId),
      title: selectedUser ? `${user.name} · ${selectedUser.name}` : "Nuova conversazione",
    });
  }

  async function handleSelectConversation(conversationId) {
    setSelectedConversationId(conversationId);
    await loadMessages(conversationId);
    await markConversationAsRead(conversationId);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!selectedConversationId || !message.trim() || isSending) return;
    setIsSending(true);
    const text = message.trim();
    setMessage("");
    // senderId rimosso: la sessione lo gestisce lato server
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedConversationId, message: text }),
    });
    if (res.ok) {
      await loadMessages(selectedConversationId);
      await loadConversations();
      await markConversationAsRead(selectedConversationId);
    } else {
      setMessage(text);
      alert("Errore invio messaggio");
    }
    setIsSending(false);
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  return (
    <>
      <button type="button" onClick={() => { setIsOpen(true); if (selectedConversationId) markConversationAsRead(selectedConversationId); }}
        className="hidden lg:block fixed bottom-6 right-6 z-40 bg-[#111] text-white rounded-full px-5 py-4 font-black shadow-lg hover:scale-[1.02] transition">
        <span className="relative inline-flex items-center gap-2">
          Chat
          {totalUnread > 0 && (
            <span className="absolute -top-7 -right-7 min-w-7 h-7 px-2 rounded-full bg-[#ff5a00] text-white text-xs flex items-center justify-center font-black border-2 border-white">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-end">
          <div className="w-full h-full bg-[#f5f5f6] shadow-2xl border-l border-black/10 grid grid-cols-1 md:grid-cols-[320px_1fr] md:max-w-[980px]">
            <aside className="bg-white border-r border-black/5 p-4 md:p-5 flex flex-col min-h-0">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">TuttoEvento</p>
                  <h2 className="text-2xl font-black tracking-[-0.04em]">Chat</h2>
                  <p className="text-sm text-black/45 mt-1">Conversazioni operative</p>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-2xl bg-[#f5f5f6] font-black shrink-0">×</button>
              </div>

              <div className="rounded-3xl bg-[#f7f7f8] border border-black/5 p-4 mb-5">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black mb-3">Nuova chat</p>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-2xl px-4 py-3 text-sm outline-none">
                  <option value="">Seleziona utente</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}
                </select>
                <button type="button" onClick={createConversation} disabled={!selectedUserId}
                  className="w-full mt-3 bg-[#111] text-white rounded-2xl py-3 font-black text-sm disabled:opacity-40">
                  Avvia conversazione
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pb-24 md:pb-0">
                {conversations.length === 0 ? (
                  <p className="text-sm text-black/45">Nessuna conversazione ancora.</p>
                ) : conversations.map((c) => {
                  const isActive = c.id === selectedConversationId;
                  const unread = Number(c.unreadCount || 0);
                  return (
                    <button key={c.id} type="button" onClick={() => handleSelectConversation(c.id)}
                      className={`relative w-full text-left rounded-3xl p-4 border transition ${isActive ? "bg-[#111] text-white border-[#111]" : unread > 0 ? "bg-[#fff7ed] text-black border-[#ff5a00]/30" : "bg-[#f7f7f8] text-black border-black/5 hover:bg-black/[0.04]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-black text-sm">{c.title || "Conversazione"}</p>
                        {unread > 0 && <span className="min-w-6 h-6 px-2 rounded-full bg-[#ff5a00] text-white text-[11px] flex items-center justify-center font-black">{unread > 99 ? "99+" : unread}</span>}
                      </div>
                      <p className={`text-xs mt-2 line-clamp-2 ${isActive ? "text-white/60" : "text-black/45"}`}>{c.lastMessage || "Nessun messaggio ancora"}</p>
                      {c.bookingId && <p className={`text-[11px] mt-3 font-black uppercase tracking-[2px] ${isActive ? "text-white/35" : "text-[#ff5a00]"}`}>Booking collegato</p>}
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="hidden md:flex flex-col min-h-0">
              <div className="bg-white border-b border-black/5 p-5">
                <p className="text-xs uppercase tracking-[2px] text-black/40 font-black">Conversazione</p>
                <h3 className="text-xl font-black tracking-[-0.03em] mt-1">{selectedConversation?.title || "Seleziona una conversazione"}</h3>
                {selectedConversation?.bookingId && <p className="text-sm text-[#ff5a00] font-black mt-2">Chat collegata al booking #{selectedConversation.bookingId}</p>}
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {!selectedConversationId ? (
                  <div className="h-full flex items-center justify-center"><p className="text-black/45 font-bold">Avvia o seleziona una chat.</p></div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center"><p className="text-black/45 font-bold">Nessun messaggio. Scrivi il primo.</p></div>
                ) : messages.map((item) => {
                  const isMine = String(item.senderId) === String(user.id);
                  return (
                    <div key={item.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-[24px] px-4 py-3 ${isMine ? "bg-[#111] text-white" : "bg-white border border-black/5 text-black"}`}>
                        {!isMine && <p className="text-xs font-black text-[#ff5a00] mb-1">{item.senderName || "Utente"}</p>}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.body}</p>
                        <p className={`text-[11px] mt-2 ${isMine ? "text-white/45" : "text-black/35"}`}>
                          {new Date(item.createdAt).toLocaleString("it-IT", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} className="bg-white border-t border-black/5 p-4 flex gap-3">
                <input value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedConversationId ? "Scrivi un messaggio..." : "Seleziona una conversazione"}
                  disabled={!selectedConversationId}
                  className="flex-1 bg-[#f7f7f8] border border-black/10 rounded-2xl px-4 py-3 outline-none disabled:opacity-50" />
                <button disabled={!selectedConversationId || !message.trim() || isSending}
                  className="bg-[#ff5a00] text-white rounded-2xl px-5 font-black disabled:opacity-40">
                  {isSending ? "Invio..." : "Invia"}
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </>
  );
}