// TuttoEvento Service Worker — PWA + notifiche push offline
const CACHE_NAME = "tuttoevento-v1";
const OFFLINE_URL = "/offline";

// File da cacheare per funzionamento offline
const PRECACHE = [
  "/",
  "/login",
  "/register",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ── Install: precache risorse statiche ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// ── Activate: pulisce cache vecchie ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first per API, cache-first per statici ──
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignora richieste non HTTP
  if (!event.request.url.startsWith("http")) return;

  // Le API vanno sempre in rete
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache solo risposte OK di tipo GET
        if (event.request.method === "GET" && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Fallback cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback per navigazione
          if (event.request.mode === "navigate") {
            return caches.match("/").catch(() => new Response("Offline", { status: 503 }));
          }
        });
      })
  );
});

// ── Push: riceve notifiche push dal server ──
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "TuttoEvento", body: event.data ? event.data.text() : "Nuova notifica" };
  }

  const title = data.title || "TuttoEvento";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: data.tag || "tuttoevento-notification",
    data: { url: data.url || "/dashboard" },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: [
      { action: "open", title: "Apri" },
      { action: "dismiss", title: "Ignora" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click: apre la dashboard ──
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Se c'è già una finestra aperta, porta in primo piano
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Altrimenti apre una nuova finestra
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── Background sync (futuro) ──
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-messages") {
    // Placeholder per sync messaggi offline
  }
});