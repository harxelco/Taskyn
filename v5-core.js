/* =========================================================
   TASKYN V5 — engine layer (state, costing, dispatch, automation, offline queue)
   Pure data/logic. UI lives in v5-ui.js and v5-views-*.js.
   ========================================================= */
const KES=n=>'KES '+Math.round(+n||0).toLocaleString('en-KE');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+Date.now().toString(36).slice(-4)+Math.random().toString(36).slice(2,6);
const CFG=()=>window.TASKYN_CONFIG||{};
const DONE_ST=['Completed','Awaiting Review','Approved'];
const CLOSED_ST=[...DONE_ST,'Cancelled'];

/* ---------- STATE ---------- */
const PERMS=[['jobs.create','Create and edit jobs'],['jobs.assign','Assign and reschedule jobs'],['jobs.approve','Approve completion reports'],['costs.edit','Record job expenses'],['team.manage','Manage team members'],['customers.manage','Manage customers'],['inventory.manage','Manage inventory'],['reports.export','Export reports'],['settings.manage','Change settings and automations']];
const mkRole=f=>Object.fromEntries(PERMS.map(([k])=>[k,f(k)]));
const S={
 role:'Manager',
 org:{name:'Crystal Gardens',tz:'Africa/Nairobi',currency:'KES',workStart:'07:00',workEnd:'18:00',defaultHours:2,sector:'Landscaping'},
 roles:{Manager:mkRole(()=>true),Supervisor:mkRole(k=>!['settings.manage','team.manage'].includes(k)),Worker:mkRole(()=>false)},
 userRoles:{},
 prefs:{job:true,report:true,stock:true,customer:true,system:true,digest:false},
 integ:{apiBase:'',aiEndpoint:'',mapsKey:''},
 rules:[
  {id:'a1',name:'Notify worker when a task is assigned',trigger:'task_assigned',conds:[],action:{type:'notify_worker',msg:'You have been assigned {job} ({customer}) on {when}.'},enabled:true,runs:0},
  {id:'a2',name:'Alert manager when a task is overdue',trigger:'task_overdue',conds:[{f:'delayMin',op:'≥',v:'15'}],action:{type:'notify_manager',msg:'{job} is {delay} minutes late.'},enabled:true,runs:0},
  {id:'a3',name:'Request approval when a job is completed',trigger:'job_completed',conds:[],action:{type:'request_approval',msg:'{worker} finished {job}. Please review and approve.'},enabled:true,runs:0},
  {id:'a4',name:'Notify supervisor when a report is submitted',trigger:'report_submitted',conds:[],action:{type:'notify_supervisor',msg:'{worker} submitted the report for {job}.'},enabled:true,runs:0},
  {id:'a5',name:'Alert when inventory falls below minimum',trigger:'stock_low',conds:[],action:{type:'stock_alert',msg:'{item} is at {qty} (minimum {min}). Consider reordering.'},enabled:true,runs:0}
 ],
 autoLog:[],proposals:[],queue:[],WL:{},GPS:{},sim:{offline:false},clock:{}
};
TEAM.forEach(t=>{S.userRoles[t.id]=/supervisor/i.test(t.role)?'Supervisor':'Worker'});
/* seeded jobs that were already late when the demo loaded count as already alerted (see seeded notification #1) */
JOBS.forEach(j=>{if(j.delayMin>0)j.ovFired=true});

/* ---------- PERSISTENCE (localStorage + IndexedDB for photos) ---------- */
const LS={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const SKEY='taskyn.v5.state',VER='5.0';
let _pt;
function persist(now){clearTimeout(_pt);const go=()=>{const ok=LS.set(SKEY,{v:VER,day:isoOf(0),S,TEAM,CUSTOMERS,JOBS,TEMPLATES,D,NOTIFICATIONS,ATTN,idSeq,notifSeq,tplSeq});if(!ok&&window.toast&&!persist.warned){persist.warned=1;toast('Browser storage is full or blocked — changes will not survive a reload.','error')}};now?go():(_pt=setTimeout(go,250))}
function restore(){
 const s=LS.get(SKEY);if(!s||s.v!==VER)return false;
 try{
  /* configuration always survives; demo workspace data only survives within the same calendar day (dates are relative to today) */
  Object.assign(S.org,s.S.org);Object.assign(S.prefs,s.S.prefs);Object.assign(S.integ,s.S.integ);S.rules=s.S.rules;S.roles=s.S.roles;S.userRoles=s.S.userRoles||S.userRoles;S.role=s.S.role||'Manager';
  TEMPLATES=s.TEMPLATES;tplSeq=s.tplSeq;
  if(s.day===isoOf(0)){
   TEAM=s.TEAM;CUSTOMERS=s.CUSTOMERS;JOBS=s.JOBS;Object.assign(D,s.D);NOTIFICATIONS=s.NOTIFICATIONS;Object.assign(ATTN,s.ATTN);idSeq=s.idSeq;notifSeq=s.notifSeq;
   ['autoLog','proposals','queue','WL','GPS','sim','clock'].forEach(k=>{if(s.S[k]!==undefined)S[k]=s.S[k]});return true;
  }
 }catch(e){console.warn('Taskyn: could not restore saved state',e)}
 return false;
}
function resetWorkspace(){LS.del(SKEY);try{indexedDB.deleteDatabase('taskyn-photos')}catch(e){}location.reload()}

/* photos live in IndexedDB so they survive reloads and offline use */
const IDB={db:null,open(){return this.db||(this.db=new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('IndexedDB unavailable'));const r=indexedDB.open('taskyn-photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('p');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
 async tx(mode,fn){const db=await this.open();return new Promise((res,rej)=>{const t=db.transaction('p',mode),q=fn(t.objectStore('p'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})},
 put(k,v){return this.tx('readwrite',s=>s.put(v,k))},get(k){return this.tx('readonly',s=>s.get(k))},del(k){return this.tx('readwrite',s=>s.delete(k))}};
const _purl={};
async function photoURL(id){if(_purl[id])return _purl[id];try{const b=await IDB.get(id);if(b)return _purl[id]=URL.createObjectURL(b)}catch(e){}return null}
function hydratePhotos(root=document){root.querySelectorAll('img[data-photo]').forEach(async im=>{const u=await photoURL(im.dataset.photo);if(u){im.src=u;im.classList.remove('missing')}else im.classList.add('missing')})}
function compressImage(file,max=1280,q=.72){return new Promise((res,rej)=>{const img=new Image(),u=URL.createObjectURL(file);img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?res(b):rej(new Error('Could not process image')),'image/jpeg',q)};img.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('That file is not a readable image'))};img.src=u})}

/* ---------- PERMISSIONS ---------- */
const can=p=>!!(S.roles[S.role]&&S.roles[S.role][p]);
function guard(p,what){if(can(p))return true;toast(`The ${S.role} role cannot ${what}. Change the role preview in Settings → Roles & permissions.`,'error');return false}

/* ---------- COMMIT: persist + refresh the visible view ---------- */
function commit(){persist();updateBadges();if(typeof UI!=='undefined')UI.refresh()}
const log=(j,e)=>{j.timeline.push({t:nowStr(),e,ts:Date.now()})};

/* ---------- JOB COSTING (single source of truth for every module) ---------- */
const JC={
 charge:j=>+j.charge||0,
 costs(j){const c={Labour:0,Material:0,Transport:0,Other:0};(j.expenses||[]).forEach(e=>{c[e.cat]=(c[e.cat]||0)+(+e.amt||0)});return{labour:c.Labour,material:c.Material,transport:c.Transport,other:c.Other,total:c.Labour+c.Material+c.Transport+c.Other}},
 profit:j=>j.status==='Cancelled'?0:JC.charge(j)-JC.costs(j).total,
 margin(j){const c=JC.charge(j);return c&&j.status!=='Cancelled'?JC.profit(j)/c*100:0},
 realised:j=>DONE_ST.includes(j.status),
 totals(list){const t={charge:0,labour:0,material:0,transport:0,other:0,total:0,profit:0,n:list.length};list.forEach(j=>{const c=JC.costs(j);t.charge+=JC.charge(j);t.labour+=c.labour;t.material+=c.material;t.transport+=c.transport;t.other+=c.other;t.total+=c.total});t.profit=t.charge-t.total;t.margin=t.charge?t.profit/t.charge*100:0;return t}
};
function addExpense(jobId,o){
 if(!guard('costs.edit','record expenses'))return false;
 const j=jobById(jobId),amt=+o.amt,desc=(o.desc||'').trim();
 if(!j)return toast('Job not found.','error'),false;
 if(!['Labour','Material','Transport','Other'].includes(o.cat))return toast('Choose an expense category.','error'),false;
 if(!(amt>0))return toast('Enter an amount greater than zero.','error'),false;
 if(!desc)return toast('Add a short description.','error'),false;
 const e={id:uid('e'),cat:o.cat,desc,amt:Math.round(amt),t:nowStr(),by:S.role};
 if(o.cat==='Material'&&o.stockId&&+o.qty>0){const s=D.stock.find(x=>x.id===o.stockId);if(s){e.stockId=s.id;e.qty=+o.qty;useStock(s,+o.qty,{job:j,by:'Manager'})}}
 j.expenses.push(e);log(j,`Expense recorded: ${o.cat} ${KES(e.amt)}`);commit();return true;
}
function removeExpense(jobId,eid){if(!guard('costs.edit','edit expenses'))return;const j=jobById(jobId);const i=j.expenses.findIndex(e=>e.id===eid);if(i<0)return;const e=j.expenses[i];j.expenses.splice(i,1);log(j,`Expense removed: ${e.cat} ${KES(e.amt)}`);commit()}

/* ---------- INVENTORY ---------- */
function plannedUse(item){let q=0;JOBS.filter(j=>dayOff(j)===0&&!CLOSED_ST.includes(j.status)).forEach(j=>{(tplFor(j).materials||[]).forEach(m=>{if(m.item===item)q+=m.qty})});return q}
const stockState=s=>s.q<=s.min?'low':(s.q-plannedUse(s.n)<s.min?'projected':'ok');
function useStock(s,qty,o={}){
 s.q=Math.max(0,+(s.q-qty).toFixed(2));
 D.moves.unshift({id:uid('m'),item:s.n,delta:-qty,type:'usage',by:o.by||'Worker',jobId:o.job?o.job.id:null,t:'Today '+nowStr()});
 if(s.q<=s.min)runRules('stock_low',{item:s.n,qty:s.q,min:s.min,stock:s});
}
function restock(id,qty){if(!guard('inventory.manage','change inventory'))return false;const s=D.stock.find(x=>x.id===id);qty=+qty;if(!s||!(qty>0))return toast('Enter a quantity greater than zero.','error'),false;s.q=+(s.q+qty).toFixed(2);s.last='Today';D.moves.unshift({id:uid('m'),item:s.n,delta:qty,type:'restock',by:S.role,ref:'Manual restock',t:'Today '+nowStr()});commit();return true}

/* ---------- DISPATCH ENGINE ---------- */
const estHrs=j=>+j.est||tplFor(j).hours||2;
const dayHrs=j=>Math.min(8,estHrs(j));
const jStart=j=>mins(j.time),jEnd=j=>jStart(j)+Math.round(dayHrs(j)*60);
const openJobs=(wid,off,skipId)=>JOBS.filter(j=>j.assignee===wid&&j.id!==skipId&&dayOff(j)===off&&!CLOSED_ST.includes(j.status));
const tentJobs=(wid,off,skipId)=>S.proposals.filter(p=>p.workerId===wid&&p.jobId!==skipId).map(p=>jobById(p.jobId)).filter(j=>j&&dayOff(j)===off&&!j.assignee);
const hrsOf=(wid,off,skipId)=>[...openJobs(wid,off,skipId),...tentJobs(wid,off,skipId)].reduce((a,j)=>a+dayHrs(j),0);
const loadPct=(wid,off=0)=>Math.round(hrsOf(wid,off)/8*100);
const rostered=(wid,off)=>!!AVAIL[wid][(offDate(off).getDay()+6)%7];
const overlaps=(a,b)=>dayOff(a)===dayOff(b)&&jStart(a)<jEnd(b)&&jStart(b)<jEnd(a);
const reqSkill=j=>j.skills&&j.skills.length?j.skills[0]:tplFor(j).skills[0];
/* today's workload label per worker */
function capLabel(t,off=0){const p=loadPct(t.id,off);if(!rostered(t.id,off))return['Day off','gray'];if(off===0&&t.status==='Offline')return['Offline','gray'];return p>100?['Overloaded','red']:p>=75?['Busy','amber']:p>=1?['Working','blue']:['Free','green']}
function conflictsFor(job,wid){
 const t=teamById(wid),off=dayOff(job),out=[];
 if(!rostered(wid,off))out.push({sev:'warn',msg:`Not rostered on ${dayLabel(off)}`});
 else if(off===0&&t.status==='Offline')out.push({sev:'warn',msg:'Currently offline'});
 (job.skills||[]).filter(s=>!SKILLS[wid].includes(s)).forEach(s=>out.push({sev:'warn',msg:`Missing skill: ${s}`}));
 [...openJobs(wid,off,job.id),...tentJobs(wid,off,job.id)].filter(o=>overlaps(job,o)).forEach(o=>out.push({sev:'block',msg:`Overlaps ${o.name} (${hhmm(jStart(o))}–${hhmm(jEnd(o))})`}));
 const total=hrsOf(wid,off,job.id)+dayHrs(job);if(total>8)out.push({sev:'warn',msg:`Exceeds 8h daily capacity (${total.toFixed(1)}h planned)`});
 return out;
}
/* Recommendation score (0–100): skills 40 + availability 25 + workload 25 + service-area fit 10. Not GPS based. */
function scoreFor(job,wid){
 const t=teamById(wid),off=dayOff(job),req=job.skills||[],cf=conflictsFor(job,wid);
 const matched=req.filter(s=>SKILLS[wid].includes(s)).length,skill=req.length?40*matched/req.length:40;
 const block=cf.some(c=>c.sev==='block'),ros=rostered(wid,off);
 let avail=!ros?0:block?0:off===0?({Available:25,Active:20,'On site':12,Busy:12,Delayed:6,Offline:0}[t.status]??10):25;
 const hrs=hrsOf(wid,off,job.id),work=!ros?0:hrs+dayHrs(job)>8?0:25*(1-Math.min(1,hrs/8));
 const mine=[...openJobs(wid,off,job.id),...tentJobs(wid,off,job.id)];
 const zi=ZONE_ORDER.indexOf(ZONE[job.location]);let zone=5,zr='No other jobs that day';
 if(mine.length){const d=Math.min(...mine.map(o=>Math.abs(ZONE_ORDER.indexOf(ZONE[o.location])-zi)));zone=d===0?10:d===1?6:0;zr=d===0?`Already working in the ${ZONE[job.location]} area`:d===1?'Neighbouring service area':'Far service area'}
 let total=Math.round(skill+avail+work+zone);if(block)total=Math.min(total,45);
 const reasons=[
  {ok:matched===req.length,txt:req.length?(matched===req.length?`Has required skill${req.length>1?'s':''}: ${req.join(', ')}`:`Missing skill: ${req.filter(s=>!SKILLS[wid].includes(s)).join(', ')}`):'No special skill required'},
  {ok:avail>=18,txt:!ros?`Not rostered on ${dayLabel(off)}`:block?cf.find(c=>c.sev==='block').msg:off===0?`${t.status} now · free ${hhmm(jStart(job))}–${hhmm(jEnd(job))}`:`Rostered · free ${hhmm(jStart(job))}–${hhmm(jEnd(job))}`},
  {ok:work>=12,txt:`Workload ${Math.round(hrs/8*100)}% (${hrs.toFixed(1)}h of 8h)`+(hrs+dayHrs(job)>8?' — would exceed capacity':'')},
  {ok:zone>=6,txt:zr+' (demo zones, not GPS)'}
 ];
 return{wid,total,parts:{skill:Math.round(skill),avail:Math.round(avail),work:Math.round(work),zone},reasons,conflicts:cf,block};
}
const recommend=job=>TEAM.map(t=>scoreFor(job,t.id)).sort((a,b)=>b.total-a.total||loadPct(a.wid,dayOff(job))-loadPct(b.wid,dayOff(job)));
const scoreClass=n=>n>=75?'good':n>=50?'mid':'bad';

function propose(jobId,wid){
 if(!guard('jobs.assign','assign jobs'))return;
 const j=jobById(jobId);if(!j)return;
 S.proposals=S.proposals.filter(p=>p.jobId!==jobId);S.proposals.push({id:uid('p'),jobId,workerId:wid,at:Date.now()});
 commit();toast(`Proposed ${teamById(wid).name} for ${j.name}. Approve it below to finalise.`);
}
function discardProposal(pid){S.proposals=S.proposals.filter(p=>p.id!==pid);commit()}
function approveProposal(pid,force){
 const p=S.proposals.find(x=>x.id===pid);if(!p)return;if(!guard('jobs.assign','approve assignments'))return;
 const j=jobById(p.jobId),sc=scoreFor(j,p.workerId);
 if(sc.block&&!force)return UI.confirm(`<b>${esc(teamById(p.workerId).name)}</b> has a schedule conflict:<br>${sc.conflicts.filter(c=>c.sev==='block').map(c=>esc(c.msg)).join('<br>')}<br><br>Assign anyway?`,()=>approveProposal(pid,true),{label:'Assign anyway',danger:true});
 S.proposals=S.proposals.filter(x=>x.id!==pid);assignJob(j,p.workerId);
}
function assignJob(j,wid,o={}){
 const t=teamById(wid),prev=j.assignee?teamById(j.assignee).name:null;
 j.assignee=wid;if(['Unassigned','Assigned'].includes(j.status)||o.reset)j.status='Assigned';
 log(j,prev&&prev!==t.name?`Reassigned from ${prev} to ${t.name} (manager approved)`:`Assigned to ${t.name} (manager approved)`);
 runRules('task_assigned',{job:j,worker:t});commit();toast(`${j.name} assigned to ${t.name}.`,'success');
}
function unassignJob(j){const p=j.assignee?teamById(j.assignee).name:'';j.assignee=null;j.status='Unassigned';log(j,'Unassigned from '+p);commit()}
function reschedule(j,off,time){
 if(!guard('jobs.assign','reschedule jobs'))return false;
 setDay(j,off);if(time)j.time=time;log(j,`Rescheduled to ${dayLabel(off)} ${j.time}`);commit();
 const c=j.assignee?conflictsFor(j,j.assignee).filter(x=>x.sev==='block'):[];
 toast(c.length?`Rescheduled, but ${teamById(j.assignee).name} now has a conflict: ${c[0].msg}`:`Rescheduled to ${dayLabel(off)} ${j.time}.`,c.length?'error':'success');return true;
}
function depsOpen(j){return(j.dependsOn||[]).map(jobById).filter(d=>d&&!DONE_ST.includes(d.status))}
/* manager-side status control with a valid-transition table */
const NEXT={Unassigned:['Assigned','Cancelled'],Assigned:['Accepted','Unassigned','Cancelled'],Accepted:['On Site','Assigned','Cancelled'],'On Site':['In Progress','Cancelled'],'In Progress':['Completed','On Site','Cancelled'],Completed:['Awaiting Review'],'Awaiting Review':['Approved','In Progress'],Approved:[],Cancelled:['Unassigned']};
function setStatus(j,st){
 if(!guard('jobs.create','change job status'))return false;
 if(!(NEXT[j.status]||[]).includes(st))return toast(`A job that is ${j.status} cannot move to ${st}.`,'error'),false;
 if(['On Site','In Progress'].includes(st)&&!j.assignee)return toast('Assign a worker first.','error'),false;
 if(['On Site','In Progress','Accepted'].includes(st)&&depsOpen(j).length)return toast('Blocked by unfinished dependency: '+depsOpen(j)[0].name,'error'),false;
 if(st==='Approved')return approveReport(j.id);
 j.status=st;if(st==='In Progress'&&j.progress<10)j.progress=10;if(st==='Unassigned')j.assignee=null;if(st==='Completed')j.progress=100;
 log(j,'Status changed to '+st+' by manager');if(st==='Completed')runRules('job_completed',{job:j,worker:teamById(j.assignee)});commit();toast('Status updated to '+st+'.','success');return true;
}
function setDelay(j,minutes){
 minutes=Math.max(0,Math.round(+minutes||0));j.delayMin=minutes;if(!minutes)j.ovFired=false;
 log(j,minutes?`Marked ${minutes} minutes behind schedule`:'Delay cleared');
 if(minutes&&!CLOSED_ST.includes(j.status)){j.ovFired=true;runRules('task_overdue',{job:j,worker:teamById(j.assignee)})}commit();
}
function checkOverdue(){let n=0;JOBS.forEach(j=>{if(j.delayMin>0&&!j.ovFired&&!CLOSED_ST.includes(j.status)){j.ovFired=true;runRules('task_overdue',{job:j,worker:teamById(j.assignee)});n++}});if(n)commit()}

/* ---------- REPORT / CUSTOMER APPROVAL ---------- */
function approveReport(id){
 if(!guard('jobs.approve','approve reports'))return false;
 const j=jobById(id);if(!j||!j.report)return toast('This job has no report to approve.','error'),false;
 j.report.status='Approved';j.status='Approved';j.approvalRequested=false;j.cust=j.cust&&j.cust.status==='approved'?j.cust:{status:'awaiting',requestedAt:nowStr()};
 log(j,'Manager approved report — sent to customer approval');addNotification('green','Report approved',`${j.name} approved. Customer approval requested (demo portal).`,j.id,{cat:'report'});commit();toast('Report approved. Customer approval is now pending in the demo portal.','success');return true;
}
function requestChanges(id,note){
 if(!guard('jobs.approve','request changes'))return false;
 const j=jobById(id);if(!j||!j.report)return false;j.report.status='Changes Requested';j.status='In Progress';
 log(j,'Manager requested changes'+(note?': '+note:''));
 if(j.assignee)addNotification('amber','Changes requested',`${teamById(j.assignee).name}: update the ${j.name} report.${note?' “'+note+'”':''}`,j.id,{cat:'report',to:'worker:'+j.assignee});
 commit();toast('Changes requested — sent back to the worker.','success');return true;
}
/* The customer portal is a DEMONSTRATION: these are simulated customer actions, never real transactions. */
function customerDecision(id,approve,rating,feedback){
 const j=jobById(id);if(!j)return;
 if(approve){j.cust={status:'approved',rating:+rating||null,feedback:(feedback||'').trim(),at:'Today '+nowStr(),simulated:true};log(j,'Customer approved the work (simulated portal action)');addNotification('green','Customer approved',`${customerById(j.customerId).name} approved ${j.name} (demo portal — simulated).`,j.id,{cat:'customer'})}
 else{j.cust={status:'rework',feedback:(feedback||'').trim(),at:'Today '+nowStr(),simulated:true};if(j.report)j.report.status='Changes Requested';j.status='In Progress';log(j,'Customer requested rework (simulated portal action)');addNotification('red','Customer requested rework',`${customerById(j.customerId).name} asked for rework on ${j.name}: ${feedback||'no details given'}`,j.id,{cat:'customer'})}
 commit();
}

/* ---------- AUTOMATION ENGINE (trigger → conditions → action) ---------- */
const TRIGGERS={task_assigned:{label:'A task is assigned',f:['priority','service']},task_overdue:{label:'A task becomes overdue',f:['delayMin','priority']},job_completed:{label:'A job is completed',f:['priority','service']},report_submitted:{label:'A report is submitted',f:['hasIssues','service']},stock_low:{label:'Inventory falls below its minimum',f:['item']}};
const COND_FIELDS={priority:{label:'Priority',op:'is',type:'select',opts:['Normal','High','Urgent']},service:{label:'Service name',op:'contains',type:'text'},delayMin:{label:'Minutes late',op:'≥',type:'number'},hasIssues:{label:'Issues reported',op:'is',type:'select',opts:['Yes','No']},item:{label:'Item name',op:'contains',type:'text'}};
const ACTIONS={notify_worker:'Notify the worker',notify_manager:'Alert the manager',notify_supervisor:'Notify the supervisor',request_approval:'Request manager approval',stock_alert:'Generate a stock alert'};
function condOk(c,x){const j=x.job||{};const v=String(c.v??'').toLowerCase();switch(c.f){case'priority':return j.priority===c.v;case'service':return !v||j.name.toLowerCase().includes(v);case'delayMin':return(+j.delayMin||0)>=(+c.v||0);case'hasIssues':return((j.issues||[]).length>0)===(c.v==='Yes');case'item':return !v||String(x.item||'').toLowerCase().includes(v)}return true}
const fillMsg=(m,x)=>String(m).replace(/\{(\w+)\}/g,(_,k)=>({job:x.job?.name,worker:x.worker?.name||'The worker',customer:x.job?customerById(x.job.customerId)?.name:'',delay:x.job?.delayMin,item:x.item,qty:x.qty,min:x.min,when:x.job?`${dayLabel(dayOff(x.job))} ${x.job.time}`:''}[k]??''));
const supervisorFor=j=>TEAM.find(t=>S.userRoles[t.id]==='Supervisor'&&t.id!==j?.assignee)||TEAM.find(t=>S.userRoles[t.id]==='Supervisor');
function runRules(trigger,x){
 let n=0;
 S.rules.filter(r=>r.enabled&&r.trigger===trigger).forEach(r=>{
  if(!r.conds.every(c=>condOk(c,x)))return;
  const msg=fillMsg(r.action.msg,x),j=x.job||null;let summary='';
  switch(r.action.type){
   case'notify_worker':{const w=x.worker||(j&&teamById(j.assignee));if(!w){summary='Skipped: no worker on this job';break}addNotification('blue',r.name.replace(/^Notify worker when /,'').replace(/^./,c=>c.toUpperCase()),msg,j?.id,{to:'worker:'+w.id});summary=`Notified ${w.name} (in-app)`;break}
   case'notify_manager':addNotification('red',j?'Overdue':'Alert',msg,j?.id,{to:'manager'});summary='Alerted the manager (in-app)';break;
   case'notify_supervisor':{const sv=supervisorFor(j);addNotification('amber','Report submitted',msg,j?.id,{cat:'report',to:'supervisor'});summary=`Notified supervisor${sv?' '+sv.name:''} (in-app)`;break}
   case'request_approval':if(j){j.approvalRequested={at:nowStr()};log(j,'Approval requested (automation)')}addNotification('amber','Approval needed',msg,j?.id,{cat:'report'});summary='Requested manager approval';break;
   case'stock_alert':addNotification('red','Low stock: '+x.item,msg,null,{cat:'stock',ref:{stock:x.stock?.id}});summary='Generated a stock alert';break;
  }
  r.runs++;r.last=Date.now();n++;
  S.autoLog.unshift({id:uid('l'),ts:Date.now(),t:nowStr(),ruleId:r.id,rule:r.name,trigger,summary,jobId:j?j.id:null});if(S.autoLog.length>80)S.autoLog.length=80;
 });
 return n;
}

/* ---------- OFFLINE QUEUE & SYNC ---------- */
const NET={get online(){return navigator.onLine!==false&&!S.sim.offline},get mode(){return(S.integ.apiBase||CFG().API_BASE)?'server':'demo'},get base(){return(S.integ.apiBase||CFG().API_BASE||'').replace(/\/$/,'')}};
const PENDING=['queued','syncing','failed'];
const pendingFor=jid=>S.queue.filter(a=>PENDING.includes(a.status)&&(jid==null||a.jobId===jid));
const ST_OF={accept:'Accepted',start:'On Site',progress:'In Progress',complete:'Awaiting Review'};
function overlay(j){let status=j.status,progress=j.progress;pendingFor(j.id).forEach(a=>{if(ST_OF[a.type]){status=ST_OF[a.type];if(a.type==='start')progress=Math.max(progress,10);if(a.type==='progress')progress=a.payload.pct;if(a.type==='complete')progress=100}});return{status,progress,pending:pendingFor(j.id).length}}
function enqueue(type,jobId,payload,workerId){
 const a={id:uid('q'),type,jobId,workerId,payload:payload||{},ts:Date.now(),status:'queued'};S.queue.push(a);persist(true);
 if(NET.online)flush();else{UI.refresh();toast('Saved on this device. It will sync when you are back online.','info')}
 return a;
}
let _flushing=false;
async function flush(){
 if(_flushing||!NET.online)return;_flushing=true;
 try{
  for(const a of S.queue.filter(x=>x.status==='queued'||x.status==='failed'&&x.retry)){
   a.status='syncing';a.retry=false;UI.refresh();
   try{
    if(NET.mode==='server'){
     let r;if(a.type==='photo'){const f=new FormData();f.append('meta',JSON.stringify({...a,payload:{...a.payload}}));const b=await IDB.get(a.payload.pid);if(b)f.append('file',b,a.payload.pid+'.jpg');r=await fetch(NET.base+'/sync',{method:'POST',body:f})}
     else r=await fetch(NET.base+'/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(a)});
     if(!r.ok)throw new Error('Server replied HTTP '+r.status);
     applyAction(a);a.status='synced';a.at=Date.now();
    }else{applyAction(a);a.status='applied';a.at=Date.now()}
   }catch(e){a.status='failed';a.error=String(e.message||e)}
   persist(true);
  }
 }finally{_flushing=false;commit()}
}
function retryFailed(){S.queue.forEach(a=>{if(a.status==='failed')a.retry=true;if(a.status==='failed')a.status='queued'});flush()}
function clearDone(){S.queue=S.queue.filter(a=>PENDING.includes(a.status));commit()}
/* applies one worker action to the workspace ("server" state). Throws if it cannot be applied. */
function applyAction(a){
 const j=jobById(a.jobId),w=teamById(a.workerId),p=a.payload;
 if(a.type==='gps'){S.GPS[a.workerId]={lat:p.lat,lng:p.lng,acc:p.acc,ts:a.ts};return}
 if(a.type==='clock'){ATTN.today[a.workerId]=p.in?{in:p.t,out:null}:{...(ATTN.today[a.workerId]||{in:p.t}),out:p.t};return}
 if(!j)throw new Error('This job no longer exists in the workspace');
 const nm=(w?w.name:'Worker').split(' ')[0];
 switch(a.type){
  case'accept':if(depsOpen(j).length)throw new Error('Blocked by '+depsOpen(j)[0].name);j.status='Accepted';log(j,nm+' accepted task');break;
  case'start':if(depsOpen(j).length)throw new Error('Blocked by '+depsOpen(j)[0].name);j.status='On Site';j.progress=Math.max(j.progress,10);log(j,nm+' arrived on site');break;
  case'progress':j.status='In Progress';j.progress=p.pct;log(j,`Progress updated to ${p.pct}%`);break;
  case'check':j.proof.chk[p.k]=p.v;break;
  case'photo':j.proof.photos.push({id:p.pid,kind:p.kind,t:p.t,by:a.workerId});log(j,`${nm} added a ${p.kind} photo`);break;
  case'note':j.proof.notes.push({text:p.text,t:p.t,by:a.workerId});log(j,nm+' added a note');break;
  case'material':{const s=D.stock.find(x=>x.id===p.stockId);j.proof.mats.push({item:p.item,qty:p.qty,u:p.u});if(s){useStock(s,p.qty,{job:j,by:w?.name});j.expenses.push({id:uid('e'),cat:'Material',desc:`${p.item} ×${p.qty}${p.u}`,amt:Math.round(s.cost*p.qty),stockId:s.id,qty:p.qty,t:p.t,by:w?.name})}log(j,`${nm} logged ${p.qty}${p.u} ${p.item}`);break}
  case'issue':j.issues.push({text:p.text,sev:p.sev,t:p.t,by:a.workerId});log(j,`${nm} reported an issue: ${p.text}`);addNotification(p.sev==='Blocking'?'red':'amber','Issue reported',`${w?.name||'Worker'} on ${j.name}: ${p.text}`,j.id,{to:'manager'});break;
  case'complete':{
   j.status='Awaiting Review';j.progress=100;j.missingReport=false;
   const ph=j.proof.photos,mats=j.proof.mats.map(m=>`${m.item} — ${m.qty}${m.u}`);
   j.report={summary:p.summary,materials:mats.length?mats:['None'],confirmed:!!p.confirmed,status:'Pending Review',issues:j.issues.map(i=>i.text),photos:{before:ph.filter(x=>x.kind==='before').length,after:ph.filter(x=>x.kind==='after').length},drafted:true,submittedBy:a.workerId};
   log(j,'Completion report submitted');addNotification('amber','Report awaiting review',`${j.name} completion report is ready for your approval.`,j.id,{cat:'report'});
   runRules('job_completed',{job:j,worker:w});runRules('report_submitted',{job:j,worker:w});break}
  default:throw new Error('Unknown action '+a.type);
 }
}
window.addEventListener('online',()=>{UI.refresh();flush()});window.addEventListener('offline',()=>UI.refresh());
/* worker-local (device) state: checklist ticks, photos, notes, materials — available offline */
const wl=jid=>S.WL[jid]||(S.WL[jid]={chk:{},photos:[],notes:[],mats:[],issues:[]});
