import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase";

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:info@tuttoevento.it";

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  return true;
}

export async function savePushSubscription({
  userId,
  subscription,
  userAgent = "",
}) {
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (!userId || !endpoint || !p256dh || !auth) {
    throw new Error("Subscription non valida");
  }

  const payload = {
    user_id: Number(userId),
    endpoint,
    p256dh,
    auth,
    user_agent: userAgent || "",
  };

  const { data, error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert(payload, {
      onConflict: "endpoint",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Errore salvataggio push subscription Supabase:", error);
    throw new Error("Errore salvataggio subscription notifiche");
  }

  return data.id;
}

export async function sendPushToUser(userId, payload) {
  const configured = configureWebPush();

  if (!configured) {
    console.warn("Web Push non configurato: controlla le chiavi VAPID.");
    return;
  }

  const { data: subscriptions, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", Number(userId));

  if (error) {
    console.error("Errore lettura push subscriptions Supabase:", error);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    return;
  }

  await Promise.all(
    subscriptions.map(async (item) => {
      const pushSubscription = {
        endpoint: item.endpoint,
        keys: {
          p256dh: item.p256dh,
          auth: item.auth,
        },
      };

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        );
      } catch (error) {
        const statusCode = error?.statusCode;

        if (statusCode === 404 || statusCode === 410) {
          const { error: deleteError } = await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", item.endpoint);

          if (deleteError) {
            console.error(
              "Errore eliminazione subscription scaduta:",
              deleteError
            );
          }
        } else {
          console.error("Errore invio push:", error);
        }
      }
    })
  );
}