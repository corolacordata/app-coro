/* Il «motore» dell'app installata: apre subito, riceve le notifiche, prepara gli aggiornamenti. */
const VERSIONE='94c90cb8f5be',CACHE='coro-'+VERSIONE,ESTERNI='coro-esterni';
const FILE=['./','index.html','manifest.webmanifest','icona-192.png','icona-512.png','icona-apple-180.png'];
const ESTERNI_OK=/^https:\/\/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)\//;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILE)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(l=>Promise.all(l.filter(k=>k.indexOf('coro-')===0&&k!==CACHE&&k!==ESTERNI).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data==='aggiorna')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    /* con ?accesso=… o ?apri=… la pagina è sempre la stessa: conta il file, non l'indirizzo */
    const chiave=(r.mode==='navigate'&&/\/(index\.html)?$/.test(u.pathname))?'index.html':r;
    e.respondWith(caches.match(chiave).then(c=>c||fetch(r)));
    return;
  }
  /* solo caratteri e icone: i dati dei soci non passano mai da qui */
  if(ESTERNI_OK.test(r.url))e.respondWith(caches.open(ESTERNI).then(c=>c.match(r).then(x=>x||fetch(r).then(n=>{if(n.ok||n.type==='opaque')c.put(r,n.clone());return n;}))));
});
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{};}catch(x){}
  e.waitUntil(self.registration.showNotification(d.titolo||'La Cordata',{body:d.testo||'',icon:'icona-192.png',badge:'icona-192.png',tag:d.chiave||undefined,data:{url:d.url||''}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL(e.notification.data&&e.notification.data.url||'./',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l)if('navigate' in c)return c.navigate(url).then(x=>x&&x.focus());
    return self.clients.openWindow(url);
  }));
});
