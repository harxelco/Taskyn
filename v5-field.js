/* =========================================================
   TASKYN V5 — Worker view (mobile-first, offline-capable) and Customer portal
   ========================================================= */
const WK={tab:'jobs',jobId:null,pct:null};
const QLABEL={accept:'Accepted task',start:'Arrived on site',progress:'Progress update',check:'Checklist step',photo:'Photo',note:'Note',material:'Material used',issue:'Issue report',complete:'Completion report',gps:'Location share',clock:'Clock in/out'};
const wkJobs=()=>JOBS.filter(j=>j.assignee===currentWorkerId&&j.status!=='Cancelled'&&dayOff(j)>=0&&dayOff(j)<=3||j.assignee===currentWorkerId&&dayOff(j)===0).sort((a,b)=>dayOff(a)-dayOff(b)||jStart(a)-jStart(b));
const wAlerts=()=>NOTIFICATIONS.filter(n=>n.to==='worker:'+currentWorkerId);
function swState(){return!('serviceWorker'in navigator)?'unsupported':navigator.serviceWorker.controller?'active':location.protocol==='file:'?'file':'pending'}
function netBar(){
 const q=pendingFor().length,on=NET.online,sw=swState();
 const swTxt=sw==='active'?'App is cached for offline use.':sw==='file'?'Offline caching needs the app to be hosted (https or localhost), not opened as a file.':sw==='unsupported'?'This browser cannot cache the app offline.':'Caching the app for offline use… reload once to finish.';
 return`<div class="wnet ${on?(q?'wait':'on'):'off'}">${ic(on?'wifi':'wifiOff')}<div style="flex:1"><b>${on?'Online':'Offline'}</b>${q?` · ${q} change${q>1?'s':''} ${on?'syncing':'saved on this device'}`:''}<div style="font-size:11px;opacity:.85">${NET.mode==='demo'?'Demo mode: changes apply to this browser’s demo workspace only.':'Changes sync to your server.'} ${swTxt}</div></div></div>`;
}
function wkJobCard(j){
 const o=overlay(j),st=o.status,c=customerById(j.customerId);
 return`<div class="wjob" data-act="wk-open" data-id="${j.id}" tabindex="0" role="button"><div style="display:flex;justify-content:space-between;gap:8px"><h3>${esc(j.name)}</h3>${pl(st,statusColor(st,j.delayMin))}</div><div class="mut">${esc(c.name)} · ${esc(j.location)}</div><div class="mut">${dayLabel(dayOff(j))} · ${hhmm(jStart(j))}–${hhmm(jEnd(j))}${j.priority!=='Normal'?' · '+esc(j.priority):''}</div><div class="progress"><span style="width:${o.progress}%"></span></div>${o.pending?`<span class="pill blue" style="justify-self:start">${o.pending} pending sync</span>`:''}${depsOpen(j).length?`<span class="pill amber" style="justify-self:start">Waiting for ${esc(depsOpen(j)[0].name)}</span>`:''}</div>`;
}
function wkJobsTab(){
 const L=wkJobs(),t=teamById(currentWorkerId),today=ATTN.today[t.id],pc=S.queue.some(a=>a.type==='clock'&&PENDING.includes(a.status));
 const g=S.GPS[t.id];
 return`<div class="panel" style="margin:0 0 12px"><div class="phead" style="margin:0"><div><h3>${today&&!today.out?'On shift':'Not clocked in'}</h3><div class="sub">${today?`In ${esc(today.in)}${today.out?' · out '+esc(today.out):''}`:'Clock in when you start work'}${pc?' · pending sync':''}</div></div><button class="btn ${today&&!today.out?'btn-secondary':'btn-primary'} btn-sm" data-act="wk-clock">${today&&!today.out?'Clock out':'Clock in'}</button></div>
 <div class="actions"><button class="btn btn-secondary btn-sm" data-act="wk-gps">${ic('nav')} Share my location</button><span class="mut">${g?'Last shared '+timeAgo(g.ts):'Optional. Uses this device’s real GPS.'}</span></div></div>
 <h3 style="margin:14px 0 8px;font-size:14px">My jobs</h3>${L.map(wkJobCard).join('')||empty('No jobs assigned','Jobs approved in Dispatch appear here.')}`;
}
function wkJobTab(){
 const j=jobById(WK.jobId);if(!j)return`<div class="empty"><b>Job not found</b><p>It may have been removed.</p><div class="actions center"><button class="btn btn-primary" data-act="wk-tab" data-id="jobs">Back to jobs</button></div></div>`;
 const o=overlay(j),st=o.status,L=wl(j.id),c=customerById(j.customerId),blocked=depsOpen(j),items=j.subtasks.map(s=>s.title),allDone=items.every(k=>L.chk[k]),afters=L.photos.filter(p=>p.kind==='after').length;
 const started=['On Site','In Progress'].includes(st),fin=['Awaiting Review','Approved','Completed'].includes(st);
 const phs=k=>L.photos.filter(p=>p.kind===k);
 const strip=k=>`<div class="photos" style="margin:6px 0">${phs(k).map(p=>`<figure><img data-photo="${p.id}" alt="${k} photo" class="missing"><figcaption>${esc(p.t)}</figcaption></figure>`).join('')}</div>`;
 return`<button class="btn btn-ghost btn-sm" data-act="wk-tab" data-id="jobs">${ic('chevL')} Jobs</button>
 <div style="display:flex;justify-content:space-between;gap:8px;margin:6px 0"><h2 style="font-size:19px">${esc(j.name)}</h2>${pl(st,statusColor(st,j.delayMin))}</div>
 <p class="mut">${esc(c.name)} · <a href="tel:${esc(c.phone.replace(/\s/g,''))}">${esc(c.phone)}</a><br>${esc(j.location)} · ${dayLabel(dayOff(j))} ${hhmm(jStart(j))}–${hhmm(jEnd(j))} · <a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name+' '+j.location+' Nairobi')}">Open in Maps</a></p>
 ${o.pending?`<div class="wnet wait" style="margin:10px 0">${ic('sync')} ${o.pending} change${o.pending>1?'s':''} on this job ${NET.online?'syncing':'waiting for a connection'}</div>`:''}
 ${blocked.length?`<div class="wnet off" style="margin:10px 0">${ic('alert')} Wait for “${esc(blocked[0].name)}” to finish before starting.</div>`:''}
 <div class="dsec" style="margin-top:12px"><h4>Instructions</h4><p style="font-size:14px;line-height:1.55;white-space:pre-wrap">${esc(j.instructions||'No special instructions.')}</p>${j.skills&&j.skills.length?`<div class="tags">${j.skills.map(s=>`<span class="tag">${esc(s)}</span>`).join('')}</div>`:''}</div>
 ${st==='Assigned'?`<button class="wbig" data-act="wk-accept" ${blocked.length?'disabled':''}>Accept task</button>`:''}
 ${st==='Accepted'?`<button class="wbig" data-act="wk-start" ${blocked.length?'disabled':''}>${ic('nav')} I’ve arrived — start work</button>`:''}
 ${started||fin?`<div class="dsec" style="margin-top:14px"><h4>Progress <span>${o.progress}%</span></h4><div class="progress"><span style="width:${o.progress}%"></span></div>${started?`<div class="pgrid">${[25,50,75,90].map(p=>`<button data-act="wk-progress" data-id="${p}" class="${o.progress>=p?'on':''}">${p}%</button>`).join('')}</div>`:''}</div>
 <div class="dsec"><h4>Checklist <span>${items.filter(k=>L.chk[k]).length}/${items.length}</span></h4>${items.map((k,i)=>`<label class="chk ${L.chk[k]?'done':''}"><input type="checkbox" data-chg="wk-chk" data-k="${i}" ${L.chk[k]?'checked':''} ${fin?'disabled':''}><span>${esc(k)}</span></label>`).join('')}</div>
 <div class="dsec"><h4>Photos</h4><div class="mut">Before</div>${strip('before')}<div class="mut">After</div>${strip('after')}${fin?'':`<div class="wgrid"><label class="wb">${ic('cam')} Before photo<input type="file" accept="image/*" capture="environment" data-chg="wk-photo" data-kind="before"></label><label class="wb">${ic('cam')} After photo<input type="file" accept="image/*" capture="environment" data-chg="wk-photo" data-kind="after"></label></div>`}</div>
 ${fin?'':`<div class="dsec"><h4>Materials used</h4>${L.mats.map(m=>`<div class="qrow"><div>${esc(m.item)}</div><b>${m.qty}${esc(m.u)}</b></div>`).join('')}<form class="actions" data-submit="wk-mat"><select name="s" required aria-label="Material" style="flex:1"><option value="">Choose item…</option>${opts(D.stock.map(s=>[s.id,s.n+' ('+s.u+')']))}</select><input name="q" type="number" min="0.5" step="0.5" required placeholder="Qty" style="width:80px" aria-label="Quantity"><button class="btn btn-secondary">Add</button></form></div>
 <div class="dsec"><h4>Notes</h4>${L.notes.map(n=>`<div class="qrow"><div>${esc(n.text)}<small>${esc(n.t)}</small></div></div>`).join('')}<form class="actions" data-submit="wk-note"><textarea name="t" required maxlength="300" placeholder="Add a note for the manager" style="min-height:56px;flex:1" aria-label="Note"></textarea><button class="btn btn-secondary">Add</button></form></div>
 <div class="dsec"><h4>Report an issue</h4><form data-submit="wk-issue"><textarea name="t" required minlength="5" maxlength="300" placeholder="What is the problem?" aria-label="Issue"></textarea><div class="actions"><select name="sev" aria-label="Severity"><option>Minor</option><option>Blocking</option></select><button class="btn btn-secondary">Send issue</button></div></form>${L.issues.map(i=>`<div class="qrow"><div>${esc(i.text)}<small>${esc(i.sev)} · ${esc(i.t)}</small></div></div>`).join('')}</div>`}`:''}
 ${started?`<div class="dsec"><h4>Complete job</h4><form data-submit="wk-complete"><div class="field"><label>Work summary</label><textarea name="s" required minlength="10" maxlength="500" placeholder="What was done?"></textarea></div><label class="chk"><input type="checkbox" name="c"><span>Customer was on site and satisfied</span></label>${!allDone?`<p class="warn-line amber">${ic('alert')} Finish the checklist to complete.</p>`:''}${afters?'':`<p class="warn-line amber">${ic('alert')} No after photo yet — recommended.</p>`}<button class="wbig" ${allDone?'':'disabled'}>Submit completion report</button></form></div>`:''}
 ${fin?`<div class="wnet ${o.pending?'wait':'on'}" style="margin-top:12px">${ic('check')} Completion report ${o.pending?(NET.online?'is syncing':'saved on this device — will sync when online'):'submitted — waiting for manager approval'}</div>`:''}`;
}
function wkSyncTab(){
 const Q=S.queue.slice().reverse(),pend=pendingFor().length,fail=S.queue.filter(a=>a.status==='failed').length;
 const lab={queued:['Waiting','amber'],syncing:['Syncing…','blue'],applied:['Applied to demo workspace','gray'],synced:['Synced to server','green'],failed:['Failed','red']};
 return`${netBar()}<div class="panel" style="margin:12px 0"><div class="phead" style="margin:0"><div><h3>Sync queue</h3><div class="sub">${pend?pend+' waiting':'Nothing waiting'}${fail?' · '+fail+' failed':''}</div></div></div>
 <label class="chk"><input type="checkbox" data-chg="wk-sim" ${S.sim.offline?'checked':''}><span>Simulate being offline (demo)</span></label>
 <div class="actions"><button class="btn btn-primary btn-sm" data-act="wk-sync" ${NET.online&&pend?'':'disabled'}>Sync now</button><button class="btn btn-secondary btn-sm" data-act="wk-retry" ${fail?'':'disabled'}>Retry failed</button><button class="btn btn-ghost btn-sm" data-act="wk-clear">Clear finished</button></div></div>
 ${Q.map(a=>{const j=a.jobId?jobById(a.jobId):null,[l,c]=lab[a.status]||['?','gray'];return`<div class="qrow"><div><b>${QLABEL[a.type]||a.type}</b>${j?` · ${esc(j.name)}`:''}<small>${new Date(a.ts).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}${a.error?' · '+esc(a.error):''}</small></div>${pl(l,c)}</div>`}).join('')||empty('No actions yet','Actions you take in the field are saved here first.')}
 <p class="mut" style="margin-top:10px">${NET.mode==='demo'?'No server is configured, so “applied” means the change was added to this browser’s demo workspace — it has not been sent anywhere.':'Items show “Synced” only after your server accepted them.'}</p>`;
}
function wkAlertsTab(){const L=wAlerts();return L.map(n=>`<div class="qrow" style="${n.read?'opacity:.65':''}"><i class="dot ${n.type}" style="margin-top:6px"></i><div><b>${esc(n.title)}</b><small>${esc(n.msg)} · ${esc(n.t)}</small>${n.jobId?`<button class="btn btn-ghost btn-sm" data-act="wk-notif" data-id="${n.id}">Open job</button>`:''}</div></div>`).join('')||empty('No alerts','Assignments and reminders from your manager appear here.')}
VIEWS.worker={skel:'split',title:()=>['Worker view','The field app — works offline and syncs when connected'],
render(p){
 if(p&&p.tab){WK.tab=p.tab;UI.params={}}
 const t=teamById(currentWorkerId),unread=wAlerts().filter(n=>!n.read).length,pend=pendingFor().length;
 const body=WK.tab==='job'?wkJobTab():WK.tab==='sync'?wkSyncTab():WK.tab==='alerts'?wkAlertsTab():wkJobsTab();
 return`<div class="wk"><div class="wk-head"><div class="row"><div class="who">${avatar(t,'lg')}<span><b>${esc(t.name)}</b><span class="sub">${esc(t.role)}</span></span></div><button class="btn btn-ghost btn-sm" data-nav="overview">Manager view</button></div>
 <div class="row"><label class="lbl" for="wkwho">Viewing as</label><select id="wkwho" data-chg="wk-who" style="max-width:220px">${opts(TEAM.map(x=>[x.id,x.name]),currentWorkerId)}</select></div>${WK.tab!=='sync'?netBar():''}</div>
 <div class="wk-body" id="wkbody">${body}</div>
 <div class="wk-tabs"><button class="${WK.tab==='jobs'?'on':''}" data-act="wk-tab" data-id="jobs">${ic('list')}Jobs</button><button class="${WK.tab==='job'?'on':''}" data-act="wk-tab" data-id="job" ${WK.jobId?'':'disabled'}>${ic('jobs')}Job</button><button class="${WK.tab==='sync'?'on':''}" data-act="wk-tab" data-id="sync">${ic('sync')}Sync${pend?`<em class="nbadge">${pend}</em>`:''}</button><button class="${WK.tab==='alerts'?'on':''}" data-act="wk-tab" data-id="alerts">${ic('bell')}Alerts${unread?`<em class="nbadge">${unread}</em>`:''}</button></div></div>`}};
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.wjob[data-act]')){e.preventDefault();e.target.click()}});
const wjob=()=>jobById(WK.jobId);
function wkDo(type,payload,msg){const j=wjob();enqueue(type,j&&j.id,payload,currentWorkerId);if(msg&&NET.online)toast(msg,'success');UI.refresh()}
Object.assign(ACT,{
 'wk-tab':el=>{WK.tab=el.dataset.id;paint('worker');if(WK.tab!=='job')window.scrollTo(0,0)},
 'wk-open':el=>{WK.jobId=+el.dataset.id;WK.tab='job';paint('worker');window.scrollTo(0,0)},
 'wk-accept':()=>{const j=wjob();if(depsOpen(j).length)return toast('Blocked by an unfinished job.','error');wkDo('accept',{},'Task accepted.')},
 'wk-start':()=>{const j=wjob();if(depsOpen(j).length)return toast('Blocked by an unfinished job.','error');wkDo('start',{},'Work started.')},
 'wk-progress':el=>wkDo('progress',{pct:+el.dataset.id},'Progress updated.'),
 'wk-clock':()=>{const t=ATTN.today[currentWorkerId],inn=!(t&&!t.out);enqueue('clock',null,{in:inn,t:nowStr()},currentWorkerId);toast(inn?'Clock-in recorded.':'Clock-out recorded.','success')},
 'wk-gps':()=>{if(!navigator.geolocation)return toast('This device cannot share location.','error');navigator.geolocation.getCurrentPosition(p=>{enqueue('gps',null,{lat:p.coords.latitude,lng:p.coords.longitude,acc:Math.round(p.coords.accuracy)},currentWorkerId);toast('Real location shared with the manager map.','success')},e=>toast('Location not shared: '+(e.code===1?'permission denied':'unavailable')+'.','error'),{enableHighAccuracy:true,timeout:10000})},
 'wk-sync':()=>flush(),'wk-retry':()=>retryFailed(),'wk-clear':()=>clearDone(),
 'wk-notif':el=>{const n=NOTIFICATIONS.find(x=>x.id===+el.dataset.id);n.read=true;WK.jobId=n.jobId;WK.tab='job';commit()}
});
Object.assign(CHG,{
 'wk-who':el=>{currentWorkerId=el.value;WK.jobId=null;WK.tab='jobs';paint('worker')},
 'wk-sim':el=>{S.sim.offline=el.checked;persist();toast(el.checked?'Simulating offline. Changes will queue.':'Back online — syncing queued changes.','info');if(!el.checked)flush();else commit()},
 'wk-chk':el=>{const j=wjob(),k=j.subtasks[+el.dataset.k].title;wl(j.id).chk[k]=el.checked;wkDo('check',{k,v:el.checked})},
 'wk-photo':async el=>{const f=el.files&&el.files[0];if(!f)return;const j=wjob();try{const b=await compressImage(f),pid=uid('ph');await IDB.put(pid,b);const rec={id:pid,kind:el.dataset.kind,t:nowStr()};wl(j.id).photos.push(rec);el.value='';enqueue('photo',j.id,{pid,kind:rec.kind,t:rec.t},currentWorkerId);toast(`${rec.kind[0].toUpperCase()+rec.kind.slice(1)} photo saved on this device.`,'success');UI.refresh()}catch(e){toast(String(e.message||e),'error')}}
});
Object.assign(SUB,{
 'wk-mat':f=>{const s=D.stock.find(x=>x.id===f.s.value),q=+f.q.value;if(!s||!(q>0))return toast('Choose an item and a quantity.','error');wl(WK.jobId).mats.push({item:s.n,qty:q,u:s.u});wkDo('material',{stockId:s.id,item:s.n,qty:q,u:s.u,t:nowStr()},'Material logged.')},
 'wk-note':f=>{const t=f.t.value.trim();if(!t)return;wl(WK.jobId).notes.push({text:t,t:nowStr()});wkDo('note',{text:t,t:nowStr()},'Note added.')},
 'wk-issue':f=>{const t=f.t.value.trim();wl(WK.jobId).issues.push({text:t,sev:f.sev.value,t:nowStr()});wkDo('issue',{text:t,sev:f.sev.value,t:nowStr()},'Issue sent to the manager.')},
 'wk-complete':f=>{const j=wjob(),L=wl(j.id);if(!j.subtasks.every(s=>L.chk[s.title]))return toast('Finish the checklist first.','error');const s=f.s.value.trim();if(s.length<10)return toast('Add a short work summary.','error');wkDo('complete',{summary:s,confirmed:f.c.checked},'Completion report submitted.')}
});

/* ---------- CUSTOMER PORTAL (demonstration of the approval workflow) ---------- */
const PT={cust:null,rating:5};
VIEWS.portal={skel:'split',title:()=>['Customer portal','Preview the customer’s completion approval experience'],
render(){
 const cs=CUSTOMERS.filter(c=>JOBS.some(j=>j.customerId===c.id&&j.cust&&j.cust.status!=='none'));
 if(!PT.cust||!cs.find(c=>c.id===PT.cust)){const a=cs.find(c=>JOBS.some(j=>j.customerId===c.id&&j.cust&&j.cust.status==='awaiting'));PT.cust=(a||cs[0]||{}).id}
 const c=customerById(PT.cust),mine=c?JOBS.filter(j=>j.customerId===c.id&&j.cust&&j.cust.status!=='none').sort((a,b)=>dayOff(b)-dayOff(a)):[];
 const aw=mine.filter(j=>j.cust.status==='awaiting'),hist=mine.filter(j=>j.cust.status!=='awaiting'&&dayOff(j)>=-30);
 return`<div class="alert amber"><div class="alert-body"><b>Demonstration</b><p>You are previewing the customer’s side. Approvals and feedback entered here are <b>simulated</b> — there is no customer portal backend, and nothing is sent to a real customer.</p></div></div>
 <div class="toolbar"><div class="tools"><label class="lbl" for="ptc">Previewing as</label><select id="ptc" data-chg="pt-cust">${opts(cs.map(x=>[x.id,x.name+(JOBS.some(j=>j.customerId===x.id&&j.cust&&j.cust.status==='awaiting')?' (awaiting approval)':'')]),PT.cust)}</select></div></div>
 <div class="portal">${c?`<div class="panel"><div class="phd"><span class="av lg gray">${esc(avatarOf(c.name))}</span><div><h3>${esc(c.name)}</h3><p>${esc(S.org.name)} · service portal</p></div></div></div>
 ${aw.map(portalCard).join('')||`<div class="panel">${empty('Nothing to approve','Completed work waiting for this customer appears here once the manager approves the report.')}</div>`}
 ${hist.length?`<h3 style="margin:16px 0 8px;font-size:14px">Previous work</h3>${hist.map(j=>`<div class="panel" style="padding:12px"><div class="phead" style="margin:0"><div><b>${esc(j.name)}</b><div class="sub">${jobDay(j)} · ${KES(JC.charge(j))}</div></div>${pl(j.cust.status==='approved'?'Approved'+(j.cust.rating?' · '+j.cust.rating+'★':''):'Rework requested',j.cust.status==='approved'?'green':'red')}</div>${j.cust.feedback?`<p class="mut" style="margin-top:6px">“${esc(j.cust.feedback)}”</p>`:''}</div>`).join('')}`:''}`:empty('No customers with completed work yet')}</div>`}};
function portalCard(j){
 const r=j.report||{},ph=j.proof.photos,b4=ph.filter(p=>p.kind==='before'),af=ph.filter(p=>p.kind==='after');
 const strip=(a,l)=>`<div><h5>${l}</h5>${a.length?`<div class="photos" style="grid-template-columns:1fr 1fr">${a.slice(0,2).map(p=>`<figure><img data-photo="${p.id}" alt="${l}" class="missing"></figure>`).join('')}</div>`:`<div class="empty small" style="border:1px dashed var(--line-2);border-radius:10px;padding:18px 6px">No ${l.toLowerCase()} photo</div>`}</div>`;
 return`<div class="panel"><div class="phead"><div><h3>${esc(j.name)}</h3><div class="sub">Completed ${jobDay(j)} · ${esc(wname(j.assignee))}</div></div>${pl('Awaiting your approval','amber')}</div>
 <div class="dsec"><h4>Completion summary</h4><p style="font-size:13.5px;line-height:1.55">${esc(r.summary||'The team has completed this job.')}</p></div>
 ${j.proof.notes.length?`<div class="dsec"><h4>Work notes</h4>${j.proof.notes.map(n=>`<p style="font-size:13px">• ${esc(n.text)}</p>`).join('')}</div>`:''}
 <div class="dsec"><h4>Before &amp; after</h4><div class="ba">${strip(b4,'Before')}${strip(af,'After')}</div></div>
 <dl class="kv"><dt>Charge</dt><dd><b>${KES(JC.charge(j))}</b></dd><dt>Materials</dt><dd>${esc((r.materials||['None']).join(', '))}</dd></dl>
 <form data-submit="pt-decide" data-job="${j.id}" style="margin-top:12px"><div class="field"><label>How was the service?</label><div class="stars" role="radiogroup" aria-label="Rating">${[1,2,3,4,5].map(n=>`<button type="button" class="${n<=PT.rating?'on':''}" role="radio" aria-checked="${n===PT.rating}" data-act="pt-star" data-id="${n}" aria-label="${n} star${n>1?'s':''}">★</button>`).join('')}</div></div>
 <div class="field" style="margin-top:8px"><label>Feedback <span class="hint">(required if requesting rework)</span></label><textarea name="f" maxlength="400" placeholder="Tell us how it went"></textarea></div>
 <div class="actions"><button class="btn btn-primary" name="d" value="approve">Approve work</button><button class="btn btn-secondary" name="d" value="rework" formnovalidate>Request rework</button></div></form>
 <p class="hint" style="margin-top:8px">Demo only — this records a simulated customer action.</p></div>`;
}
SUB['pt-decide']=(f,e)=>{const j=jobById(+f.dataset.job),ap=e.submitter&&e.submitter.value==='approve',fb=f.f.value.trim();if(!ap&&fb.length<5)return toast('Please describe what needs fixing.','error');customerDecision(j.id,ap,PT.rating,fb);toast(ap?'Approved (simulated). The manager has been notified.':'Rework requested (simulated). The job is back in progress.','success');PT.rating=5};
Object.assign(ACT,{'pt-star':el=>{PT.rating=+el.dataset.id;$$('.stars button',el.closest('.stars')).forEach((b,i)=>{b.classList.toggle('on',i<PT.rating);b.setAttribute('aria-checked',i+1===PT.rating)})}});
CHG['pt-cust']=el=>{PT.cust=el.value;paint('portal')};
