/* =========================================================
   TASKYN V5 — UI foundation
   Router, shell, drawers/modals/toasts, theme, charts, command bar.
   Events are delegated: elements declare data-act / data-in / data-chg / data-submit.
   ========================================================= */
const ACT={},INP={},CHG={},SUB={},DND={},VIEWS={};
const NAVG=[['Operations',[['overview','Overview','home'],['requests','Requests','inbox'],['jobs','Jobs & Tasks','jobs'],['dispatch','Dispatch','send'],['schedule','Schedule','cal']]],
 ['Customers',[['customers','Customers','users'],['quotes','Quotes','file'],['invoices','Invoices','card'],['payments','Payments','wallet'],['portal','Customer portal','phone']]],
 ['Field',[['team','Team','users'],['live','Live Operations','map'],['inventory','Inventory','box'],['equipment','Equipment','tool'],['worker','Worker view','phone']]],
 ['Business',[['reports','Reports & Analytics','chart'],['profit','Profitability','pie']]],
 ['Intelligence',[['ask','Taskyn AI','spark'],['notifications','Notifications','bell']]],
 ['System',[['settings','Settings','gear'],['harxel','Harxel Agency','building']]]];
const NAVFLAT=NAVG.flatMap(g=>g[1]);
const ALIAS={analytics:'reports',insights:'ask',services:'jobs',recurring:'jobs',inbox:'notifications',issues:'ask'};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ---------- small view helpers ---------- */
const STC={Unassigned:'red',Assigned:'indigo',Accepted:'indigo','On Site':'blue','In Progress':'blue',Completed:'green','Awaiting Review':'amber',Approved:'green',Cancelled:'gray'};
const statusColor=(s,d)=>d>0?'amber':STC[s]||'gray';
const pl=(t,c='gray')=>`<span class="pill ${c}">${esc(t)}</span>`;
const stPill=j=>pl(j.delayMin>0&&!CLOSED_ST.includes(j.status)?j.delayMin+'m late':j.status,statusColor(j.status,CLOSED_ST.includes(j.status)?0:j.delayMin));
const avatarOf=n=>n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
const empty=(t,b,a)=>`<div class="empty"><div class="empty-ic">${ic('check')}</div><b>${t}</b>${b?`<p>${b}</p>`:''}${a?`<div class="actions center">${a}</div>`:''}</div>`;
const kpi=(label,val,o={})=>`<${o.act?`button data-act="${o.act}" ${o.id!=null?`data-id="${o.id}"`:''}`:'div'} class="kpi ${o.tone||''}"><small>${label}</small><strong>${val}</strong>${o.sub?`<span>${o.sub}</span>`:''}</${o.act?'button':'div'}>`;
const field=(label,inner,o={})=>`<div class="field ${o.full?'full':''}"><label ${o.for?`for="${o.for}"`:''}>${label}</label>${inner}${o.hint?`<small class="hint">${o.hint}</small>`:''}</div>`;
const opts=(list,sel)=>list.map(x=>{const[v,l]=Array.isArray(x)?x:[x,x];return`<option value="${esc(v)}" ${String(v)===String(sel)?'selected':''}>${esc(l)}</option>`}).join('');
const seg=(items,cur,act)=>`<div class="seg" role="tablist">${items.map(([v,l,n])=>`<button role="tab" aria-selected="${v===cur}" class="${v===cur?'on':''}" data-act="${act}" data-id="${esc(v)}">${esc(l)}${n!=null?`<span>${n}</span>`:''}</button>`).join('')}</div>`;
const pct=(n,t)=>t?Math.round(n/t*100):0;
const money=n=>(n<0?'−':'')+KES(Math.abs(n));
const timeAgo=ts=>{const m=Math.round((Date.now()-ts)/60000);return m<1?'just now':m<60?m+' min ago':Math.round(m/60)+' h ago'};

/* ---------- charts (inline SVG, themed through CSS variables) ---------- */
function barChart(data,o={}){
 const W=o.w||520,H=o.h||170,pad=26,max=Math.max(...data.map(d=>d.v),o.min||1),bw=(W-pad)/data.length;
 return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'Bar chart')}" preserveAspectRatio="xMidYMid meet">`+
  [0,.5,1].map(f=>{const y=H-pad-(H-pad-8)*f;return`<line class="grid" x1="${pad}" x2="${W}" y1="${y}" y2="${y}"/><text class="ax" x="${pad-6}" y="${y+3}" text-anchor="end">${Math.round(max*f)}</text>`}).join('')+
  data.map((d,i)=>{const h=(H-pad-8)*d.v/max,x=pad+i*bw+bw*.18,w=bw*.64;return`<g><title>${esc(d.l)}: ${d.fmt||d.v}</title><rect class="bar ${d.c||''}" x="${x}" y="${H-pad-h}" width="${w}" height="${Math.max(h,d.v?2:0)}" rx="3"/><text class="ax" x="${x+w/2}" y="${H-8}" text-anchor="middle">${esc(d.s||d.l)}</text></g>`}).join('')+`</svg>`;
}
function donut(parts,o={}){
 const tot=parts.reduce((a,p)=>a+p.v,0)||1,R=44,C=2*Math.PI*R;let off=0;
 const arcs=parts.filter(p=>p.v).map(p=>{const len=p.v/tot*C,s=`<circle class="seg-${p.c}" r="${R}" cx="60" cy="60" fill="none" stroke-width="14" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}"><title>${esc(p.l)}: ${p.v}</title></circle>`;off+=len;return s}).join('');
 return`<div class="donutwrap"><svg viewBox="0 0 120 120" class="donut" role="img" aria-label="${esc(o.label||'Distribution')}"><circle r="${R}" cx="60" cy="60" fill="none" stroke-width="14" class="track"/><g transform="rotate(-90 60 60)">${arcs}</g><text x="60" y="58" text-anchor="middle" class="dn">${o.center??tot}</text><text x="60" y="73" text-anchor="middle" class="ds">${esc(o.sub||'')}</text></svg><ul class="legend">${parts.map(p=>`<li><i class="dot seg-bg-${p.c}"></i>${esc(p.l)} <b>${p.v}</b></li>`).join('')}</ul></div>`;
}
const hbar=(label,val,max,txt,tone='')=>`<div class="hbar"><div><span>${esc(label)}</span><b>${txt??val}</b></div><div class="track"><span class="${tone}" style="width:${max?Math.min(100,val/max*100):0}%"></span></div></div>`;

/* ---------- toast ---------- */
function toast(msg,type='info'){
 const box=$('#toasts');if(!box)return;const el=document.createElement('div');el.className='toast '+type;el.setAttribute('role',type==='error'?'alert':'status');
 el.innerHTML=`<span class="t-ic">${ic(type==='error'?'alert':type==='success'?'check':'bulb')}</span><span>${esc(msg)}</span>`;
 box.appendChild(el);while(box.children.length>3)box.firstChild.remove();
 requestAnimationFrame(()=>el.classList.add('in'));setTimeout(()=>{el.classList.remove('in');setTimeout(()=>el.remove(),250)},type==='error'?5200:3200);
}

/* ---------- drawer / modal / confirm ---------- */
const UI={cur:'overview',params:{},seen:new Set(),_focus:null,_drawer:null,_raf:0,dirty:false};
function focusables(c){return $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',c).filter(e=>e.offsetParent!==null)}
function lockScroll(on){document.documentElement.classList.toggle('noscroll',on)}
UI.drawer=function(cfg){
 UI._drawer=cfg;const d=$('#drawer');if(!d.classList.contains('open'))UI._focus=document.activeElement;
 UI.drawerRefresh(true);d.classList.toggle('wide',!!cfg.wide);d.classList.add('open');$('#scrim').classList.add('show');lockScroll(true);
 setTimeout(()=>{const f=$('[autofocus]',d)||focusables($('#drawer-body'))[0]||$('.drawer-x',d);f&&f.focus()},60);
};
UI.drawerRefresh=function(first){
 const c=UI._drawer;if(!c)return;const body=$('#drawer-body'),top=body.scrollTop,r=c.render();
 $('#drawer-title').textContent=r.title||c.title||'';$('#drawer-sub').innerHTML=r.sub||c.sub||'';
 body.innerHTML=r.body;$('#drawer-foot').innerHTML=r.foot||'';$('#drawer-foot').hidden=!r.foot;
 hydrate(body);hydratePhotos(body);if(!first)body.scrollTop=top;if(c.after)c.after(body);
};
function closeDrawer(){const d=$('#drawer');if(!d.classList.contains('open'))return;d.classList.remove('open');$('#scrim').classList.remove('show');UI._drawer=null;lockScroll(!!$('#modal.show'));UI._focus&&UI._focus.focus&&UI._focus.focus()}
function modalHTML(h,wide){$('#modalbody').innerHTML=h;$('#modalbody').classList.toggle('wide',!!wide);hydrate($('#modalbody'));$('#modal').classList.add('show');lockScroll(true);UI._mfocus=document.activeElement;setTimeout(()=>{const f=$('#modalbody [autofocus]')||focusables($('#modalbody'))[0];f&&f.focus()},40)}
function closeModal(){$('#modal').classList.remove('show');lockScroll(!!$('#drawer.open'));UI._yes=null;UI._mfocus&&UI._mfocus.focus&&UI._mfocus.focus()}
const openM=modalHTML;
const mhead=t=>`<div class="mhead"><h2>${t}</h2><button class="btn btn-ghost icon" data-act="close-modal" aria-label="Close">${ic('x')}</button></div>`;
UI.confirm=function(msg,onYes,o={}){UI._yes=onYes;modalHTML(`${mhead(o.title||'Please confirm')}<p class="mtext">${msg}</p><div class="mactions"><button class="btn btn-secondary" data-act="close-modal">Cancel</button><button class="btn ${o.danger?'btn-danger':'btn-primary'}" data-act="confirm-yes" autofocus>${esc(o.label||'Confirm')}</button></div>`)};
const confirmDialog=(m,f)=>UI.confirm(m,f);
document.addEventListener('keydown',e=>{
 if(e.key==='Tab'){const c=$('#modal.show #modalbody')||($('#drawer.open')&&$('#drawer'))||($('#palette.show .pal-box'));if(c){const f=focusables(c);if(f.length){const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}}}
});

/* ---------- refresh (coalesced; never destroys what the user is typing) ---------- */
UI.refresh=function(){
 if(UI._raf)return;UI._raf=requestAnimationFrame(()=>{UI._raf=0;
  const a=document.activeElement,typing=a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.type!=='checkbox'&&a.type!=='range'&&!a.hasAttribute('data-live');
  if(typing&&$('#views').contains(a)){UI.dirty=true}else{paint(UI.cur)}
  if(UI._drawer&&!(typing&&$('#drawer').contains(a)))UI.drawerRefresh();
  syncChip();if($('#menu.show'))renderMenu();
 });
};
document.addEventListener('focusout',()=>{if(UI.dirty){UI.dirty=false;setTimeout(()=>{if(!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||''))UI.refresh()},30)}});

/* ---------- router ---------- */
function goTo(v,params){
 if(ALIAS[v]){params=Object.assign({tab:{recurring:'recurring',insights:'recs',services:'list'}[v],templates:v==='services'},params);v=ALIAS[v]}
 if(!VIEWS[v])v='overview';
 const same=UI.cur===v&&!params;
 UI.cur=v;UI.params=params||{};closeDrawer();closeModal();closeMenus();
 if(location.hash!=='#/'+v)history.pushState(null,'','#/'+v);
 showView(v,same);
}
function showView(v,quiet){
 const box=$('#views');let s=document.getElementById('v-'+v);
 if(!s){s=document.createElement('section');s.id='v-'+v;s.className='view';s.setAttribute('aria-live','off');box.appendChild(s)}
 $$('.view',box).forEach(x=>x.classList.toggle('active',x===s));
 $$('.nav button').forEach(x=>{const on=x.dataset.v===v;x.classList.toggle('active',on);on?x.setAttribute('aria-current','page'):x.removeAttribute('aria-current')});
 $$('.mnav button').forEach(x=>x.classList.toggle('active',x.dataset.m===v));
 document.body.dataset.view=v;
 const vw=VIEWS[v],t=typeof vw.title==='function'?vw.title():vw.title;
 $('#title').textContent=t[0];$('#subtitle').textContent=t[1]||'';document.title=t[0]+' · Taskyn';
 if(!quiet)window.scrollTo(0,0);
 if(!UI.seen.has(v)){UI.seen.add(v);s.innerHTML=skeleton(vw.skel);setTimeout(()=>{if(UI.cur===v)paint(v)},90)}else paint(v);
}
function skeleton(kind='cards'){const b=n=>Array.from({length:n},()=>'<div class="sk"></div>').join('');return kind==='list'?`<div class="sk sk-bar"></div>${b(5)}`:kind==='split'?`<div class="skgrid"><div class="sk tall"></div><div class="sk tall"></div></div>`:`<div class="skgrid k">${b(4)}</div><div class="skgrid"><div class="sk tall"></div><div class="sk tall"></div></div>`}
function paint(v){
 const el=document.getElementById('v-'+v);if(!el||!VIEWS[v])return;
 const y=window.scrollY;
 try{el.innerHTML=VIEWS[v].render(UI.params);hydrate(el);hydratePhotos(el);VIEWS[v].after&&VIEWS[v].after(el,UI.params)}
 catch(err){console.error('Taskyn view error ('+v+')',err);el.innerHTML=`<div class="empty err"><div class="empty-ic">${ic('alert')}</div><b>This page could not load.</b><p>${esc(err.message||err)}</p><div class="actions center"><button class="btn btn-primary" data-act="retry">Try again</button><button class="btn btn-secondary" data-nav="overview">Go to Overview</button></div></div>`}
 if(UI._keepScroll)window.scrollTo(0,y);
}
window.render=v=>paint(v||UI.cur);
/* repaint just one region (search boxes etc.) without touching inputs */
function region(sel,html,root=document){const e=$(sel,root);if(e){e.innerHTML=html;hydrate(e);hydratePhotos(e)}}

/* ---------- shell: nav, mobile nav, topbar chips, menus ---------- */
function buildNav(){
 $('#nav').innerHTML=NAVG.map(g=>`<div class="grp">${g[0]}</div>`+g[1].map(([v,l,i])=>`<button data-v="${v}" data-nav="${v}" title="${esc(l)}"><i>${ic(i)}</i><span>${esc(l)}</span><em class="nbadge" data-badge="${v}" hidden></em></button>`).join('')).join('');
 const M=[['overview','Overview','home'],['jobs','Jobs','jobs'],['dispatch','Dispatch','send'],['schedule','Schedule','cal']];
 $('#mnav').innerHTML=M.map(([v,l,i])=>`<button data-m="${v}" data-nav="${v}" aria-label="${l}">${ic(i)}<span>${l}</span><em class="nbadge" data-badge="${v}" hidden></em></button>`).join('')+`<button data-act="sheet" aria-label="More">${ic('more')}<span>More</span></button>`;
 $('#sheetbody').innerHTML=NAVFLAT.filter(n=>!M.some(m=>m[0]===n[0])).map(([v,l,i])=>`<button data-nav="${v}">${ic(i)}${esc(l)}<em class="nbadge" data-badge="${v}" hidden></em></button>`).join('');
}
function updateBadges(){
 const un=JOBS.filter(j=>j.status==='Unassigned'&&dayOff(j)<=1&&dayOff(j)>=0).length,ap=JOBS.filter(j=>j.status==='Awaiting Review').length;
 const unread=NOTIFICATIONS.filter(n=>!n.read&&/^(manager|supervisor)$/.test(n.to||'manager')).length;
 const set=(v,n)=>$$(`[data-badge="${v}"]`).forEach(e=>{e.textContent=n>99?'99+':n;e.hidden=!n});
 set('dispatch',un);set('reports',ap);set('notifications',unread);set('requests',D.requests.filter(r=>r.st==='New').length);
 const b=$('#bellcount');if(b){b.textContent=unread>9?'9+':unread;b.hidden=!unread}
 const w=$('#wsjobs');if(w)w.textContent=JOBS.filter(j=>!CLOSED_ST.includes(j.status)&&dayOff(j)===0).length+' open jobs today';
}
function syncChip(){
 const c=$('#netchip');if(!c)return;const q=pendingFor().length,on=NET.online;
 c.className='netchip '+(on?(q?'warn':'ok'):'off');c.hidden=on&&!q&&NET.mode==='demo'&&!UI._showNet;
 c.innerHTML=on?`${ic('sync')}<span>${q} syncing</span>`:`${ic('wifiOff')}<span>Offline${q?' · '+q+' queued':''}</span>`;c.hidden=on&&!q;
 c.onclick=()=>goTo('worker',{tab:'sync'});
}
function closeMenus(){$('#menu').classList.remove('show')}
function renderMenu(){
 const m=$('#menu'),kind=m.dataset.kind;
 if(kind==='bell'){const L=NOTIFICATIONS.filter(n=>/^(manager|supervisor)$/.test(n.to||'manager')).slice(0,6);
  m.innerHTML=`<div class="mn-head"><b>Notifications</b><button class="btn btn-ghost btn-sm" data-act="read-all">Mark all read</button></div>${L.map(n=>`<button class="mn-item ${n.read?'':'unread'}" data-act="open-notif" data-id="${n.id}"><i class="dot ${n.type}"></i><span><b>${esc(n.title)}</b><small>${esc(n.msg)}</small></span></button>`).join('')||'<p class="mn-empty">No notifications.</p>'}<button class="mn-foot" data-nav="notifications">View all notifications</button>`}
 else if(kind==='user'){m.innerHTML=`<div class="mn-head"><b>${esc(S.org.name)}</b><span class="pill gray">Demo</span></div><div class="mn-sec">Preview as role</div>${Object.keys(S.roles).map(r=>`<button class="mn-item" data-act="set-role" data-id="${r}"><span><b>${r}</b></span>${S.role===r?ic('check'):''}</button>`).join('')}<div class="mn-sec">Appearance</div>${[['auto','System'],['light','Light'],['dark','Dark']].map(([v,l])=>`<button class="mn-item" data-act="theme" data-id="${v}"><span><b>${l}</b></span>${(LS.get('taskyn.theme')||'auto')===v?ic('check'):''}</button>`).join('')}<button class="mn-foot" data-nav="settings">Settings</button>`}
 hydrate(m);
}
function openMenu(kind,anchor){const m=$('#menu');if(m.classList.contains('show')&&m.dataset.kind===kind){closeMenus();return}m.dataset.kind=kind;renderMenu();const r=anchor.getBoundingClientRect();m.style.top=(r.bottom+8)+'px';m.style.right=Math.max(8,window.innerWidth-r.right)+'px';m.classList.add('show')}

/* ---------- theme ---------- */
function setTheme(mode){LS.set('taskyn.theme',mode);applyTheme();}
function applyTheme(){const m=LS.get('taskyn.theme')||'auto',dark=m==='dark'||m==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=dark?'dark':'light';const b=$('#themebtn');if(b){b.innerHTML=ic(dark?'sun':'moon');b.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme')}const tc=document.querySelector('meta[name=theme-color]');if(tc)tc.content=dark?'#0e1411':'#f6f8f6'}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);

/* ---------- command bar (actions + live search of jobs, customers, workers) ---------- */
const PAL={sel:0,items:[]};
function palItems(q){
 q=q.trim().toLowerCase();
 const acts=[['Create new job','plus',()=>openCreateJob()],['Smart dispatch: assign unassigned jobs','send',()=>goTo('dispatch')],['Review reports awaiting approval','check',()=>goTo('reports')],['Open Daily Briefing','spark',()=>goTo('ask')],['Manage task templates','list',()=>goTo('jobs',{templates:true})],['Manage automation rules','zap',()=>goTo('settings',{tab:'automations'})],['Toggle dark / light theme','moon',()=>{const d=document.documentElement.dataset.theme==='dark';setTheme(d?'light':'dark')}],...NAVFLAT.map(n=>['Go to '+n[1],n[2],()=>goTo(n[0])])];
 const out=acts.filter(a=>!q||a[0].toLowerCase().includes(q)).slice(0,q?5:9).map(a=>({l:a[0],i:a[1],f:a[2],g:'Actions'}));
 if(q.length>=2){
  JOBS.filter(j=>(j.name+' '+customerById(j.customerId).name+' '+j.location+' '+j.status).toLowerCase().includes(q)).slice(0,5).forEach(j=>out.push({l:`${j.name} — ${customerById(j.customerId).name}`,s:`${j.status} · ${jobDay(j)}`,i:'jobs',f:()=>openJob(j.id),g:'Jobs'}));
  CUSTOMERS.filter(c=>(c.name+c.location+c.phone).toLowerCase().includes(q)).slice(0,3).forEach(c=>out.push({l:c.name,s:c.location,i:'users',f:()=>openCustomer(c.id),g:'Customers'}));
  TEAM.filter(t=>(t.name+t.role).toLowerCase().includes(q)).slice(0,3).forEach(t=>out.push({l:t.name,s:t.role,i:'user',f:()=>openTeamProfile(t.id),g:'Team'}));
 }
 return out;
}
function palPaint(){PAL.items=palItems($('#palq').value);PAL.sel=Math.min(PAL.sel,Math.max(0,PAL.items.length-1));let g='';
 $('#pallist').innerHTML=PAL.items.map((a,i)=>{const h=a.g!==g?`<div class="pal-g">${g=a.g}</div>`:'';return h+`<button class="pal-item ${i===PAL.sel?'sel':''}" role="option" aria-selected="${i===PAL.sel}" data-act="pal-run" data-i="${i}">${ic(a.i)}<span>${esc(a.l)}${a.s?`<small>${esc(a.s)}</small>`:''}</span></button>`}).join('')||'<div class="empty small">No matches</div>'}
function openPalette(){UI._pfocus=document.activeElement;$('#palette').classList.add('show');$('#palq').value='';PAL.sel=0;palPaint();$('#palq').focus();lockScroll(true)}
function closePalette(){$('#palette').classList.remove('show');lockScroll(!!($('#drawer.open')||$('#modal.show')));UI._pfocus&&UI._pfocus.focus&&UI._pfocus.focus()}
let _pd;$('#palq').addEventListener('input',()=>{clearTimeout(_pd);_pd=setTimeout(palPaint,70)});
document.addEventListener('keydown',e=>{
 const pal=$('#palette').classList.contains('show');
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();pal?closePalette():openPalette();return}
 if(pal){if(e.key==='Escape')closePalette();else if(e.key==='ArrowDown'){e.preventDefault();PAL.sel=Math.min(PAL.sel+1,PAL.items.length-1);palPaint()}else if(e.key==='ArrowUp'){e.preventDefault();PAL.sel=Math.max(PAL.sel-1,0);palPaint()}else if(e.key==='Enter'&&PAL.items[PAL.sel]){const f=PAL.items[PAL.sel].f;closePalette();f()}return}
 if(e.key==='Escape'){if($('#modal.show'))closeModal();else if($('#drawer.open'))closeDrawer();else closeMenus()}
});

/* ---------- global delegated handlers ---------- */
Object.assign(ACT,{
 'close-drawer':()=>closeDrawer(),'close-modal':()=>closeModal(),'confirm-yes':()=>{const f=UI._yes;closeModal();f&&f()},
 retry:()=>paint(UI.cur),sheet:()=>$('#sheet').classList.add('show'),
 palette:()=>openPalette(),'pal-run':el=>{const f=PAL.items[+el.dataset.i].f;closePalette();f()},
 bell:el=>openMenu('bell',el),user:el=>openMenu('user',el),'toggle-theme':()=>{setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')},
 theme:el=>{setTheme(el.dataset.id);renderMenu()},'set-role':el=>{S.role=el.dataset.id;commit();toast('Previewing the app as '+S.role+'.','info')},
 'read-all':()=>{NOTIFICATIONS.forEach(n=>n.read=true);commit();toast('All notifications marked as read.','success')},
 'open-notif':el=>{openNotif(+el.dataset.id)},
 'collapse':()=>{const c=$('#app').classList.toggle('collapsed');LS.set('taskyn.collapsed',c)},
 'open-job':el=>openJob(+el.dataset.id,el.dataset.tab),'alert':el=>{const a=ALERTS[+el.dataset.i];a&&a.go()},
 go:el=>goTo(el.dataset.id),'notify-customer':el=>notifyCustomer(+el.dataset.id),remind:el=>remindWorker(+el.dataset.id),
 'review-assign':el=>{goTo('dispatch',{focus:+el.dataset.id})},restock:el=>restockDialog(el.dataset.id),
 'hide-banner':()=>{$('#banner').hidden=true;sessionStorage.setItem('taskyn.banner','1')},
 'close-sheet':()=>$('#sheet').classList.remove('show')
});
function openNotif(id){const n=NOTIFICATIONS.find(x=>x.id===id);if(!n)return;n.read=true;commit();closeMenus();if(n.jobId&&jobById(n.jobId))openJob(n.jobId);else if(n.cat==='stock')goTo('inventory');else goTo('notifications')}
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-nav]');if(nav){e.preventDefault();$('#sheet').classList.remove('show');goTo(nav.dataset.nav);return}
 const a=e.target.closest('[data-act]');
 if(a&&!a.disabled){const f=ACT[a.dataset.act];if(f){if(a.tagName==='A')e.preventDefault();f(a,e)}else console.warn('No handler for',a.dataset.act);return}
 if(e.target===$('#scrim'))closeDrawer();if(e.target===$('#modal'))closeModal();if(e.target===$('#palette'))closePalette();if(e.target===$('#sheet'))$('#sheet').classList.remove('show');
 if(!e.target.closest('#menu')&&!e.target.closest('[data-act="bell"],[data-act="user"]'))closeMenus();
});
document.addEventListener('input',e=>{const t=e.target.closest('[data-in]');if(t&&INP[t.dataset.in])INP[t.dataset.in](t,e)});
document.addEventListener('change',e=>{const t=e.target.closest('[data-chg]');if(t&&CHG[t.dataset.chg])CHG[t.dataset.chg](t,e)});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-submit]');if(f){e.preventDefault();if(f.checkValidity())SUB[f.dataset.submit](f,e);else f.reportValidity()}});
/* drag & drop (desktop). Every drop target has a keyboard/touch alternative button. */
document.addEventListener('dragstart',e=>{const d=e.target.closest('[data-drag]');if(!d)return;e.dataTransfer.setData('text/plain',d.dataset.drag);e.dataTransfer.effectAllowed='move';d.classList.add('dragging')});
document.addEventListener('dragend',e=>{const d=e.target.closest('[data-drag]');d&&d.classList.remove('dragging');$$('.over').forEach(x=>x.classList.remove('over'))});
document.addEventListener('dragover',e=>{const t=e.target.closest('[data-drop]');if(t){e.preventDefault();t.classList.add('over')}});
document.addEventListener('dragleave',e=>{const t=e.target.closest('[data-drop]');if(t&&!t.contains(e.relatedTarget))t.classList.remove('over')});
document.addEventListener('drop',e=>{const t=e.target.closest('[data-drop]');if(!t)return;e.preventDefault();t.classList.remove('over');const [k,id]=(e.dataTransfer.getData('text/plain')||':').split(':'),h=DND[t.dataset.drop.split(':')[0]];h&&h(k,id,t.dataset.drop.split(':').slice(1).join(':'))});
window.addEventListener('popstate',()=>{const v=(location.hash.match(/^#\/(\w+)/)||[])[1];if(v&&VIEWS[v]){UI.cur=v;UI.params={};closeDrawer();showView(v)}});

/* ---------- boot helper (called by v5-views-c.js after all views exist) ---------- */
function bootUI(){
 applyTheme();buildNav();hydrate();
 if(LS.get('taskyn.collapsed'))$('#app').classList.add('collapsed');
 if(sessionStorage.getItem('taskyn.banner'))$('#banner').hidden=true;
 $('#kbd').textContent=/Mac/i.test(navigator.platform)?'⌘K':'Ctrl K';
 updateBadges();syncChip();
 const v=(location.hash.match(/^#\/(\w+)/)||[])[1];UI.cur=ALIAS[v]||(VIEWS[v]?v:'overview');showView(UI.cur);
}
