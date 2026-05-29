import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId mancante" },
        { status: 400 }
      );
    }

    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("chat_messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .eq("conversation_id", Number(conversationId))
      .order("id", { ascending: true });

    if (messagesError) {
      console.error("Errore Supabase GET chat_messages:", messagesError);

      return NextResponse.json(
        { error: "Errore caricamento messaggi" },
        { status: 500 }
      );
    }

    const senderIds = [
      ...new Set(messages.map((message) => message.sender_id).filter(Boolean)),
    ];

    let usersById = new Map();

    if (senderIds.length > 0) {
      const { data: users, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id, name, role")
        .in("id", senderIds);

      if (usersError) {
        console.error("Errore Supabase users messaggi:", usersError);

        return NextResponse.json(
          { error: "Errore caricamento utenti messaggi" },
          { status: 500 }
        );
      }

      usersById = new Map(
        users.map((user) => [
          Number(user.id),
          {
            name: user.name,
            role: user.role,
          },
        ])
      );
    }

    const mappedMessages = messages.map((message) => {
      const sender = usersById.get(Number(message.sender_id));

      return mapMessageToFrontend({
        ...message,
        senderName: sender?.name || "",
        senderRole: sender?.role || "",
      });
    });

    return NextResponse.json(mappedMessages);
  } catch (error) {
    console.error("Errore API GET chat messages:", error);

    return NextResponse.json(
      { error: error?.message || "Errore server messaggi" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { conversationId, senderId, message } = body;

    if (!conversationId || !senderId || !message?.trim()) {
      return NextResponse.json(
        { error: "conversationId, senderId e message sono obbligatori" },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim();

    const { data: savedMessage, error: insertError } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        conversation_id: Number(conversationId),
        sender_id: Number(senderId),
        body: cleanMessage,
      })
      .select("id, conversation_id, sender_id, body, created_at")
      .single();

    if (insertError) {
      console.error("Errore Supabase POST chat_messages:", insertError);

      return NextResponse.json(
        { error: "Errore invio messaggio" },
        { status: 500 }
      );
    }

    try {
      const { data: sender, error: senderError } = await supabaseAdmin
        .from("users")
        .select("id, name, role")
        .eq("id", Number(senderId))
        .maybeSingle();

      if (senderError) {
        console.error("Errore lettura sender push:", senderError);
      }

      const { data: conversation, error: conversationError } =
        await supabaseAdmin
          .from("chat_conversations")
          .select("id, title, booking_id, event_id")
          .eq("id", Number(conversationId))
          .maybeSingle();

      if (conversationError) {
        console.error("Errore lettura conversation push:", conversationError);
      }

      const { data: participants, error: participantsError } =
        await supabaseAdmin
          .from("chat_participants")
          .select("user_id")
          .eq("conversation_id", Number(conversationId))
          .neq("user_id", Number(senderId));

      if (participantsError) {
        console.error("Errore lettura partecipanti push:", participantsError);
      }

      if (participants?.length > 0) {
        await Promise.allSettled(
          participants.map((participant) =>
            sendPushToUser(participant.user_id, {
              title: sender?.name
                ? `Nuovo messaggio da ${sender.name}`
                : "Nuovo messaggio TuttoEvento",
              body: cleanMessage,
              url: "/dashboard",
              tag: `chat-${conversationId}`,
              conversationId: Number(conversationId),
              bookingId: conversation?.booking_id || null,
              eventId: conversation?.event_id || null,
            })
          )
        );
      }
    } catch (pushError) {
      console.error(
        "Messaggio salvato, ma errore invio push notification:",
        pushError
      );
    }

    return NextResponse.json(mapMessageToFrontend(savedMessage));
  } catch (error) {
    console.error("Errore API POST chat messages:", error);

    return NextResponse.json(
      { error: error?.message || "Errore server invio messaggio" },
      { status: 500 }
    );
  }
}