import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/pushNotifications";

export async function POST(request) {
  try {
    const body = await request.json();

    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId obbligatorio" },
        { status: 400 }
      );
    }

    await sendPushToUser(userId, {
      title: "Test TuttoEvento",
      body: "Questa è una notifica test dalla dashboard.",
      url: "/dashboard",
      tag: `test-notification-${userId}`,
    });

    return NextResponse.json({
      success: true,
      message: "Notifica test inviata.",
    });
  } catch (error) {
    console.error("Errore invio notifica test:", error);

    return NextResponse.json(
      {
        error: "Errore invio notifica test",
        details: error?.message || "Errore sconosciuto",
      },
      { status: 500 }
    );
  }
}