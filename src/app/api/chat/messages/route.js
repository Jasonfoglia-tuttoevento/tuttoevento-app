import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser, unauthorized, forbidden } from "@/lib/auth";
import { sendPushToUser } from "@/lib/pushNotifications";

function mapMessageToFrontend(message) {
  if (!message) return null;
  return {
    id: message.id,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    body: message.body || "",
    createdAt: message.created_at,
    senderName: message.senderName || message.sender_name || "",
    senderRole: message.senderRole || message.sender_role || "",
  };
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
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ error: "conversationId mancante" }, { status: 400 });

    // Verifica che l'utente faccia parte della conversazione
    const isMember = await userIsInConversation(user.id, conversationId);
    if (!isMember) return forbidden();

    const { data: messages, error } = await supabaseAdmin
      .from("chat_messages").select("id, conversation_id, sender_id, body, created_at")
      .eq("conversation_id", Number(conversationId)).order("id", { ascending: true });
    if (error) return NextResponse.json({ error: "Errore caricamento messaggi" }, { status: 500 });

    const senderIds = [...new Set(messages.map((m) => m.sender_id).filter(Boolean))];
    let usersById = new Map();
    if (senderIds.length > 0) {
      const { data: users } = await supabaseAdmin.from("users").select("id, name, role").in("id", senderIds);
      usersById = new Map((users || []).map((u) => [Number(u.id), { name: u.name, role: u.role }]));
    }

    return NextResponse.json(messages.map((m) => {
      const sender = usersById.get(Number(m.sender_id));
      return mapMessageToFrontend({ ...m, senderName: sender?.name || "", senderRole: sender?.role || "" });
    }));
  } catch (e) {
    console.error("Errore API GET messages:", e);
    return NextResponse.json({ error: e?.message || "Errore server messaggi" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!conversationId || !message?.trim()) {
      return NextResponse.json({ error: "conversationId e message obbligatori" }, { status: 400 });
    }

    // senderId viene dalla sessione, non dal body
    const senderId = user.id;

    // Verifica che l'utente faccia parte della conversazione
    const isMember = await userIsInConversation(senderId, conversationId);
    if (!isMember) return forbidden();

    const cleanMessage = message.trim();
    const { data: savedMessage, error } = await supabaseAdmin
      .from("chat_messages")
      .insert({ conversation_id: Number(conversationId), sender_id: Number(senderId), body: cleanMessage })
      .select("id, conversation_id, sender_id, body, created_at").single();
    if (error) return NextResponse.json({ error: "Errore invio messaggio" }, { status: 500 });

    // Push notifications agli altri partecipanti
    try {
      const { data: conversation } = await supabaseAdmin
        .from("chat_conversations").select("id, title, booking_id, event_id")
        .eq("id", Number(conversationId)).maybeSingle();

      const { data: participants } = await supabaseAdmin
        .from("chat_participants").select("user_id")
        .eq("conversation_id", Number(conversationId)).neq("user_id", Number(senderId));

      if (participants?.length > 0) {
        await Promise.allSettled(participants.map((p) =>
          sendPushToUser(p.user_id, {
            title: user.name ? `Nuovo messaggio da ${user.name}` : "Nuovo messaggio TuttoEvento",
            body: cleanMessage, url: "/dashboard", tag: `chat-${conversationId}`,
            conversationId: Number(conversationId),
            bookingId: conversation?.booking_id || null,
            eventId: conversation?.event_id || null,
          })
        ));
      }
    } catch (pushError) {
      console.error("Errore push notification:", pushError);
    }

    return NextResponse.json(mapMessageToFrontend(savedMessage));
  } catch (e) {
    console.error("Errore API POST messages:", e);
    return NextResponse.json({ error: e?.message || "Errore server" }, { status: 500 });
  }
}