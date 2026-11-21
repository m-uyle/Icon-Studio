/**
 * Offline-first Service Worker for Icon Studio
 */

const CACHE_NAME = "icon-studio-v1";
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./og-image.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function handleFetch(req) {
  const cached = await caches.match(req);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(req);
    if (response?.status === 200 && response.type === "basic") {
      const clone = response.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(req, clone);
    }
    return response;
  } catch {
    if (req.mode === "navigate") {
      const fallback = await caches.match("./index.html");
      if (fallback) {
        return fallback;
      }
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") {
    return;
  }
  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  event.respondWith(handleFetch(req));
});
