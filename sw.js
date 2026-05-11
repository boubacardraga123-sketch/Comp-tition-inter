// ══════════════════════════════════════════════════
// SERVICE WORKER — Olympiade des Cerveaux Guinée
// Collection BHDS · Édition 2026
// ══════════════════════════════════════════════════

const CACHE_NAME = 'olympiade-bhds-v1';

// Fichiers à mettre en cache pour le mode hors-ligne
const ASSETS_TO_CACHE = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ── Installation : mise en cache des assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ── Activation : suppression des anciens caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ── Fetch : réseau en priorité, cache en fallback ──
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes Firebase (temps réel obligatoire)
  if (
    event.request.url.includes('firebaseio.com') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('gstatic.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse fraîche
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Hors ligne : retourner depuis le cache
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/index.html');
        });
      })
  );
});
