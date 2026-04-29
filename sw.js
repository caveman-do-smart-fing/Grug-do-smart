const CACHE = 'caveman-pnl-v1';
const ASSETS = [
  './caveman-pnl-calculator.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* Install — cache all assets */
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS.filter(function(a){
        return !a.endsWith('.png'); /* skip icons if missing — not critical */
      }));
    })
  );
  self.skipWaiting();
});

/* Activate — clean old caches */
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* Fetch — serve from cache, fall back to network */
self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(response){
        /* Cache successful responses */
        if(response && response.status === 200 && response.type === 'basic'){
          var clone = response.clone();
          caches.open(CACHE).then(function(cache){
            cache.put(e.request, clone);
          });
        }
        return response;
      });
    }).catch(function(){
      /* Fully offline fallback */
      return caches.match('./caveman-pnl-calculator.html');
    })
  );
});
