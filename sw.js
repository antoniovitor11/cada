const CACHE='fittony-v1';
const CORE=['./seca.html','./icon.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));
});

self.addEventListener('activate',e=>{
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    const cached=await caches.match(e.request,{ignoreSearch:true});
    const fetchP=fetch(e.request).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){
        const clone=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});
      }
      return res;
    }).catch(()=>null);
    if(cached)return cached; // cache primeiro; rede atualiza o cache em background
    const net=await fetchP;
    if(net)return net;
    if(e.request.mode==='navigate'){
      const shell=await caches.match('./seca.html');
      if(shell)return shell;
    }
    return new Response('offline',{status:503});
  })());
});
