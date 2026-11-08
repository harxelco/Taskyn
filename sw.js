/* Taskyn V5 service worker — caches the app shell so the worker view loads offline. */
const CACHE='taskyn-v5-2';
const SHELL=['./','index.html','v5.css','config.js','script.js','v5-icons.js','v5-core.js','v5-intel.js','v5-ui.js','v5-jobs.js','v5-ops.js','v5-field.js','v5-business.js','v5-docs.js','v5-boot.js','manifest.webmanifest','assets/icon.svg','assets/fonts/inter-latin-wght-normal.woff2','assets/harxel-logo.png','assets/vendor/leaflet/leaflet.js','assets/vendor/leaflet/leaflet.css','assets/vendor/jspdf.umd.min.js','assets/vendor/jspdf.plugin.autotable.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('index.html',c));return res}).catch(()=>caches.match('index.html')));return}
 e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>hit);return hit||net}));
});
