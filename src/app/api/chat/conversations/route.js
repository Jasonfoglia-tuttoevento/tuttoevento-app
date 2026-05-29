import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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
    .from("chat_participants")
    .select("conversation_id")
    .eq("user_id", Number(userId));

  if (error) {
    console.error("Errore lettura partecipanti chat:", error);
    throw new Error("Errore caricamento conversazioni");
  }

  return participants.map((participant) => participant.conversation_id);
}

async function getLastMessagesByConversation(conversationIds) {
  if (conversationIds.length === 0) return new Map();

  const { data: messages, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .in("conversation_id", conversationIds)
    .order("id", { ascending: false });

  if (error) {
    console.error("Errore lettura ultimi messaggi:", error);
    throw new Error("Errore caricamento messaggi");
  }

  const map = new Map();

  messages.forEach((message) => {
    if (!map.has(message.conversation_id)) {
      map.set(message.conversation_id, message);
    }
  });

  return map;
}

async function getReadsByConversation(userId, conversationIds) {
  if (conversationIds.length === 0) return new Map();

  const { data: reads, error } = await supabaseAdmin
    .from("chat_reads")
    .select("conversation_id, last_read_message_id")
    .eq("user_id", Number(userId))
    .in("conversation_id", conversationIds);

  if (error) {
    console.error("Errore lettura chat_reads:", error);
    throw new Error("Errore caricamento letture chat");
  }

  const map = new Map();

  reads.forEach((read) => {
    map.set(read.conversation_id, Number(read.last_read_message_id || 0));
  });

  return map;
}

async function getUnreadCounts(userId, conversationIds, readsMap) {
  if (conversationIds.length === 0) return new Map();

  const { data: messages, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id, conversation_id, sender_id")
    .in("conversation_id", conversationIds)
    .neq("sender_id", Number(userId));

  if (error) {
    console.error("Errore calcolo unread:", error);
    throw new Error("Errore calcolo messaggi non letti");
  }

  const unreadMap = new Map();

  conversationIds.forEach((conversationId) => {
    unreadMap.set(conversationId, 0);
  });

  messages.forEach((message) => {
    const lastReadMessageId = readsMap.get(message.conversation_id) || 0;

    if (Number(message.id) > Number(lastReadMessageId)) {
      unreadMap.set(
        message.conversation_id,
        (unreadMap.get(message.conversation_id) || 0) + 1
      );
    }
  });

  return unreadMap;
}

async function findExistingConversation({
  currentUserId,
  participantUserId,
  bookingId,
  eventId,
}) {
  let query = supabaseAdmin
    .from("chat_conversations")
    .select("id, booking_id, event_id")
    .limit(100);

  if (bookingId === null || bookingId === undefined) {
    query = query.is("booking_id", null);
  } else {
    query = query.eq("booking_id", Number(bookingId));
  }

  if (eventId === null || eventId === undefined) {
    query = query.is("event_id", null);
  } else {
    query = query.eq("event_id", Number(eventId));
  }

  const { data: candidateConversations, error: conversationError } =
    await query;

  if (conversationError) {
    console.error("Errore ricerca conversazione:", conversationError);
    throw new Error("Errore ricerca conversazione");
  }

  if (!candidateConversations || candidateConversations.length === 0) {
    return null;
  }

  const candidateIds = candidateConversations.map(
    (conversation) => conversation.id
  );

  const { data: participants, error: participantsError } = await supabaseAdmin
    .from("chat_participants")
    .select("conversation_id, user_id")
    .in("conversation_id", candidateIds)
    .in("user_id", [Number(currentUserId), Number(participantUserId)]);

  if (participantsError) {
    console.error("Errore ricerca partecipanti:", participantsError);
    throw new Error("Errore ricerca partecipanti");
  }

  const grouped = new Map();

  participants.forEach((participant) => {
    if (!grouped.has(participant.conversation_id)) {
      grouped.set(participant.conversation_id, new Set());
    }

    grouped.get(participant.conversation_id).add(Number(participant.user_id));
  });

  for (const [conversationId, userIds] of grouped.entries()) {
    if (
      userIds.has(Number(currentUserId)) &&
      userIds.has(Number(participantUserId))
    ) {
      return { id: conversationId };
    }
  }

  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId mancante" },
        { status: 400 }
      );
    }

    const conversationIds = await getUserConversationIds(userId);

    if (conversationIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: conversations, error } = await supabaseAdmin
      .from("chat_conversations")
      .select("*")
      .in("id", conversationIds);

    if (error) {
      console.error("Errore Supabase GET conversations:", error);

      return NextResponse.json(
        { error: "Errore caricamento conversazioni" },
        { status: 500 }
      );
    }

    const lastMessagesMap = await getLastMessagesByConversation(
      conversationIds
    );

    const readsMap = await getReadsByConversation(userId, conversationIds);

    const unreadMap = await getUnreadCounts(
      userId,
      conversationIds,
      readsMap
    );

    const enrichedConversations = conversations
      .map((conversation) => {
        const lastMessage = lastMessagesMap.get(conversation.id);

        return mapConversationToFrontend({
          ...conversation,
          lastMessage: lastMessage?.body || null,
          lastMessageAt: lastMessage?.created_at || null,
          unreadCount: unreadMap.get(conversation.id) || 0,
        });
      })
      .sort((a, b) => {
        const dateA = new Date(a.lastMessageAt || a.createdAt || 0);
        const dateB = new Date(b.lastMessageAt || b.createdAt || 0);

        return dateB - dateA;
      });

    return NextResponse.json(enrichedConversations);
  } catch (error) {
    console.error("Errore API GET chat conversations:", error);

    return NextResponse.json(
      { error: error?.message || "Errore server conversazioni" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      title,
      currentUserId,
      participantUserId,
      bookingId = null,
      eventId = null,
    } = body;

    if (!currentUserId || !participantUserId) {
      return NextResponse.json(
        { error: "currentUserId e participantUserId sono obbligatori" },
        { status: 400 }
      );
    }

    const existingConversation = await findExistingConversation({
      currentUserId,
      participantUserId,
      bookingId,
      eventId,
    });

    if (existingConversation) {
      return NextResponse.json({
        id: existingConversation.id,
        alreadyExists: true,
      });
    }

    const { data: conversation, error: conversationError } =
      await supabaseAdmin
        .from("chat_conversations")
        .insert({
          title: title || "Nuova conversazione",
          booking_id: bookingId || null,
          event_id: eventId || null,
        })
        .select("*")
        .single();

    if (conversationError) {
      console.error("Errore creazione conversazione:", conversationError);

      return NextResponse.json(
        { error: "Errore creazione conversazione" },
        { status: 500 }
      );
    }

    const { error: participantsError } = await supabaseAdmin
      .from("chat_participants")
      .insert([
        {
          conversation_id: conversation.id,
          user_id: Number(currentUserId),
        },
        {
          conversation_id: conversation.id,
          user_id: Number(participantUserId),
        },
      ]);

    if (participantsError) {
      console.error("Errore creazione partecipanti:", participantsError);

      return NextResponse.json(
        { error: "Errore creazione partecipanti chat" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: conversation.id,
      alreadyExists: false,
    });
  } catch (error) {
    console.error("Errore API POST chat conversations:", error);

    return NextResponse.json(
      { error: error?.message || "Errore server creazione conversazione" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();

    const { conversationId, userId } = body;

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "conversationId e userId sono obbligatori" },
        { status: 400 }
      );
    }

    const { data: lastMessage, error: lastMessageError } = await supabaseAdmin
      .from("chat_messages")
      .select("id")
      .eq("conversation_id", Number(conversationId))
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastMessageError) {
      console.error("Errore ultimo messaggio:", lastMessageError);

      return NextResponse.json(
        { error: "Errore aggiornamento lettura chat" },
        { status: 500 }
      );
    }

    const lastReadMessageId = lastMessage?.id || 0;
    const lastReadAt = new Date().toISOString();

    const { error: upsertError } = await supabaseAdmin
      .from("chat_reads")
      .upsert(
        {
          conversation_id: Number(conversationId),
          user_id: Number(userId),
          last_read_message_id: lastReadMessageId,
          last_read_at: lastReadAt,
        },
        {
          onConflict: "conversation_id,user_id",
        }
      );

    if (upsertError) {
      console.error("Errore upsert chat_reads:", upsertError);

      return NextResponse.json(
        { error: "Errore salvataggio lettura chat" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversationId,
      userId,
      lastReadMessageId,
      lastReadAt,
    });
  } catch (error) {
    console.error("Errore API PATCH chat conversations:", error);

    return NextResponse.json(
      { error: error?.message || "Errore server lettura chat" },
      { status: 500 }
    );
  }
}