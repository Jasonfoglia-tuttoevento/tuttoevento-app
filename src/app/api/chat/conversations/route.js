import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";

function mapConversationToFrontend(conversation) {
  return {
    id: conversation.id,
    title: conversation.title || "Conversazione",
    bookingId: conversation.booking_id,
    eventId: conversation.event_id,
    createdAt: conversation.created_at,
    lastMessage: conversation.lastMessage || null,
    lastMessageAt: conversation.lastMessageAt || null,
    unreadCount: conversation.unreadCount || 0,
  };
}

async function getUserConversationIds(userId) {
  const { data: participants, error } = await supabaseAdmin
    .from("chat_participants").select("conversation_id").eq("user_id", Number(userId));
  if (error) throw new Error("Errore caricamento conversazioni");
  return participants.map((p) => p.conversation_id);
}

async function getLastMessagesByConversation(conversationIds) {
  if (conversationIds.length === 0) return new Map();
  const { data: messages, error } = await supabaseAdmin
    .from("chat_messages").select("id, conversation_id, sender_id, body, created_at")
    .in("conversation_id", conversationIds).order("id", { ascending: false });
  if (error) throw new Error("Errore caricamento messaggi");
  const map = new Map();
  messages.forEach((m) => { if (!map.has(m.conversation_id)) map.set(m.conversation_id, m); });
  return map;
}

async function getReadsByConversation(userId, conversationIds) {
  if (conversationIds.length === 0) return new Map();
  const { data: reads, error } = await supabaseAdmin
    .from("chat_reads").select("conversation_id, last_read_message_id")
    .eq("user_id", Number(userId)).in("conversation_id", conversationIds);
  if (error) throw new Error("Errore caricamento letture chat");
  const map = new Map();
  reads.forEach((r) => map.set(r.conversation_id, Number(r.last_read_message_id || 0)));
  return map;
}

async function getUnreadCounts(userId, conversationIds, readsMap) {
  if (conversationIds.length === 0) return new Map();
  const { data: messages, error } = await supabaseAdmin
    .from("chat_messages").select("id, conversation_id, sender_id")
    .in("conversation_id", conversationIds).neq("sender_id", Number(userId));
  if (error) throw new Error("Errore calcolo messaggi non letti");
  const unreadMap = new Map();
  conversationIds.forEach((id) => unreadMap.set(id, 0));
  messages.forEach((m) => {
    const lastRead = readsMap.get(m.conversation_id) || 0;
    if (Number(m.id) > Number(lastRead)) unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
  });
  return unreadMap;
}

async function findExistingConversation({ currentUserId, participantUserId, bookingId, eventId }) {
  let query = supabaseAdmin.from("chat_conversations").select("id, booking_id, event_id").limit(100);
  if (bookingId == null) query = query.is("booking_id", null); else query = query.eq("booking_id", Number(bookingId));
  if (eventId == null) query = query.is("event_id", null); else query = query.eq("event_id", Number(eventId));
  const { data: candidates, error } = await query;
  if (error) throw new Error("Errore ricerca conversazione");
  if (!candidates || candidates.length === 0) return null;
  const candidateIds = candidates.map((c) => c.id);
  const { data: participants, error: pError } = await supabaseAdmin
    .from("chat_participants").select("conversation_id, user_id")
    .in("conversation_id", candidateIds).in("user_id", [Number(currentUserId), Number(participantUserId)]);
  if (pError) throw new Error("Errore ricerca partecipanti");
  const grouped = new Map();
  participants.forEach((p) => {
    if (!grouped.has(p.conversation_id)) grouped.set(p.conversation_id, new Set());
    grouped.get(p.conversation_id).add(Number(p.user_id));
  });
  for (const [convId, userIds] of grouped.entries()) {
    if (userIds.has(Number(currentUserId)) && userIds.has(Number(participantUserId))) return { id: convId };
  }
  return null;
}

async function userIsInConversation(userId, conversationId) {
  const { data } = await supabaseAdmin
    .from("chat_participants").select("user_id")
    .eq("conversation_id", Number(conversationId)).eq("user_id", Number(userId)).maybeSingle();
  return !!data;
}

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");

    // Può leggere solo le proprie conversazioni (admin può leggere quelle di chiunque)
    const targetUserId = user.role === "admin" && requestedUserId ? requestedUserId : user.id;

    const conversationIds = await getUserConversationIds(targetUserId);
    if (conversationIds.length === 0) return NextResponse.json([]);

    const { data: conversations, error } = await supabaseAdmin
      .from("chat_conversations").select("*").in("id", conversationIds);
    if (error) return NextResponse.json({ error: "Errore caricamento conversazioni" }, { status: 500 });

    const lastMessagesMap = await getLastMessagesByConversation(conversationIds);
    const readsMap = await getReadsByConversation(targetUserId, conversationIds);
    const unreadMap = await getUnreadCounts(targetUserId, conversationIds, readsMap);

    const enriched = conversations.map((c) => {
      const lastMessage = lastMessagesMap.get(c.id);
      return mapConversationToFrontend({
        ...c,
        lastMessage: lastMessage?.body || null,
        lastMessageAt: lastMessage?.created_at || null,
        unreadCount: unreadMap.get(c.id) || 0,
      });
    }).sort((a, b) => new Date(b.lastMessageAt || b.createdAt || 0) - new Date(a.lastMessageAt || a.createdAt || 0));

    return NextResponse.json(enriched);
  } catch (e) {
    console.error("Errore API GET conversations:", e);
    return NextResponse.json({ error: e?.message || "Errore server conversazioni" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { title, participantUserId, bookingId = null, eventId = null } = body;

    if (!participantUserId) {
      return NextResponse.json({ error: "participantUserId obbligatorio" }, { status: 400 });
    }

    // currentUserId viene dalla sessione, non dal body
    const currentUserId = user.id;

    const existing = await findExistingConversation({ currentUserId, participantUserId, bookingId, eventId });
    if (existing) return NextResponse.json({ id: existing.id, alreadyExists: true });

    const { data: conversation, error: convError } = await supabaseAdmin
      .from("chat_conversations")
      .insert({ title: title || "Nuova conversazione", booking_id: bookingId || null, event_id: eventId || null })
      .select("*").single();
    if (convError) return NextResponse.json({ error: "Errore creazione conversazione" }, { status: 500 });

    const { error: pError } = await supabaseAdmin.from("chat_participants").insert([
      { conversation_id: conversation.id, user_id: Number(currentUserId) },
      { conversation_id: conversation.id, user_id: Number(participantUserId) },
    ]);
    if (pError) return NextResponse.json({ error: "Errore creazione partecipanti chat" }, { status: 500 });

    return NextResponse.json({ id: conversation.id, alreadyExists: false });
  } catch (e) {
    console.error("Errore API POST conversations:", e);
    return NextResponse.json({ error: e?.message || "Errore server" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { conversationId } = body;
    if (!conversationId) return NextResponse.json({ error: "conversationId obbligatorio" }, { status: 400 });

    // Verifica che l'utente faccia parte della conversazione
    const isMember = await userIsInConversation(user.id, conversationId);
    if (!isMember) return forbidden();

    const { data: lastMessage } = await supabaseAdmin
      .from("chat_messages").select("id").eq("conversation_id", Number(conversationId))
      .order("id", { ascending: false }).limit(1).maybeSingle();

    const lastReadAt = new Date().toISOString();
    const { error } = await supabaseAdmin.from("chat_reads").upsert({
      conversation_id: Number(conversationId),
      user_id: Number(user.id),
      last_read_message_id: lastMessage?.id || 0,
      last_read_at: lastReadAt,
    }, { onConflict: "conversation_id,user_id" });

    if (error) return NextResponse.json({ error: "Errore salvataggio lettura chat" }, { status: 500 });

    return NextResponse.json({ success: true, conversationId, userId: user.id, lastReadMessageId: lastMessage?.id || 0, lastReadAt });
  } catch (e) {
    console.error("Errore API PATCH conversations:", e);
    return NextResponse.json({ error: e?.message || "Errore server" }, { status: 500 });
  }
}