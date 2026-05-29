self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "TuttoEvento",
    body: "Hai una nuova notifica.",
    url: "/dashboard",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const title = data.title || "TuttoEvento";

  const options = {
    body: data.body || "Hai una nuova notifica.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      url: data.url || "/dashboard",
      conversationId: data.conversationId || null,
      bookingId: data.bookingId || null,
    },
    tag: data.tag || "tuttoevento-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();

            client.postMessage({
              type: "OPEN_CHAT_FROM_NOTIFICATION",
              conversationId: event.notification.data?.conversationId || null,
              bookingId: event.notification.data?.bookingId || null,
            });

            return;
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});