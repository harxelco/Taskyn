/* TASKYN V5 — boot: restore saved workspace, start UI, register the service worker */
(function(){
 const restored=restore();
 $('#wsname').textContent=S.org.name;$('#eyebrow').textContent=S.org.name;
 checkOverdue();
 bootUI();
 setInterval(checkOverdue,60000);
 window.addEventListener('beforeunload',()=>persist(true));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist(true)});
 if(NET.online&&pendingFor().length)flush();
 if('serviceWorker'in navigator&&location.protocol!=='file:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(r=>{r.addEventListener('updatefound',()=>{});navigator.serviceWorker.ready.then(()=>{if(UI.cur==='worker')UI.refresh()})}).catch(e=>console.warn('Service worker not registered:',e)));
 }
 if(restored)console.info('Taskyn: restored saved demo workspace');
})();
