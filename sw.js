
/* AURA — Service Worker */

const CACHE_NAME = "aura-cache-v1";

/* PUSH NOTIFICATION */
self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      body: event.data ? event.data.text() : "You have a new notification."
    };
  }

  const title = payload.title || "AURA 💜";
  const options = {
    body: payload.body || "You have a new message.",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: payload.tag || "aura-notification",
    data: {
      url: payload.url || payload.data?.url || "./"
    },
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* NOTIFICATION CLICK */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil((async () => {
    const target = new URL(
      event.notification.data?.url || "./",
      self.location.origin
    );

    // Only allow navigation within AURA's own domain.
    if (target.origin !== self.location.origin) {
      target.href = self.registration.scope;
    }

    const windows = await clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin) {
        await client.navigate(target.href);
        return client.focus();
      }
    }

    return clients.openWindow(target.href);
  })());
});

/* SERVICE WORKER INSTALL */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

/* SERVICE WORKER ACTIVATE */
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
