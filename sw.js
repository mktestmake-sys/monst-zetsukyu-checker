const V='zetsukyu-v4',S=V+'-static',I=V+'-images';
const SHELL=['./','./index.html','./manifest.webmanifest'];
async function warm(){
 const ic=await caches.open(I);
 let html='';
 try{html=await (await fetch('./index.html',{cache:'reload'})).text()}catch(e){return}
 const urls=[...new Set(html.match(/https:\/\/img\.gamewith\.jp\/article_tools\/monst\/gacha\/\d+\.jpg/g)||[])];
 const q=urls.slice();
 const workers=Array.from({length:8},async()=>{while(q.length){const u=q.shift();try{if(!(await ic.match(u))){const r=await fetch(u,{mode:'no-cors',credentials:'omit'});await ic.put(u,r.clone())}}catch(e){}}});
 await Promise.allSettled(workers);
}
self.addEventListener('install',e=>{e.waitUntil(caches.open(S).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==S&&k!==I)await caches.delete(k);await self.clients.claim();await warm()})()));
self.addEventListener('message',e=>{if(e.data?.type==='PRECACHE_ALL_IMAGES')e.waitUntil(warm())});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.hostname==='img.gamewith.jp'&&u.pathname.includes('/article_tools/monst/gacha/')){
  e.respondWith((async()=>{const c=await caches.open(I),h=await c.match(e.request.url);if(h)return h;try{const r=await fetch(e.request,{mode:'no-cors'});await c.put(e.request.url,r.clone());return r}catch(_){return new Response('',{status:504})}})());return;
 }
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));return}
 e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request)));
});