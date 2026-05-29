import { NextResponse } from "next/server";
import { savePushSubscription } from "@/lib/pushNotifications";

export async function POST(request) {
  try {
    const body = await request.json();

    const { userId, subscription, userAgent } = body;

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: "userId e subscription sono obbligatori" },
        { status: 400 }
      );
    }

    const subscriptionId = await savePushSubscription({
      userId,
      subscription,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      subscriptionId,
    });
  } catch (error) {
    console.error("Errore salvataggio push subscription:", error);

    return NextResponse.json(
      { error: "Errore salvataggio subscription" },
      { status: 500 }
    );
  }
}