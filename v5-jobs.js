/* =========================================================
   TASKYN V5 — Overview, Jobs & Tasks (templates, recurring, costing), Smart Dispatch
   ========================================================= */
const wname=id=>id?teamById(id).name:'Unassigned';
const cname=j=>customerById(j.customerId).name;
const avatar=(t,cls='')=>`<span class="av ${cls}">${esc(t.avatar||avatarOf(t.name))}</span>`;
const parseOff=v=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||'');return m?Math.round((new Date(+m[1],+m[2]-1,+m[3])-TODAY0)/864e5):null};
const dateVal=off=>isoOf(off);

/* ---------- activity feed (shared by Overview and Live Operations) ---------- */
function tOrder(t){const m=/(\d{1,2}):(\d{2})/.exec(t||''),mm=m?+m[1]*60+ +m[2]:0,o=/^Y/.test(t||'')?-1:/^-2d/.test(t||'')?-2:0;return o*1440+mm}
function activity(limit=10,pred){
 const ev=[];JOBS.forEach(j=>{if(dayOff(j)<-2||(pred&&!pred(j)))return;j.timeline.forEach(e=>{if(e._o===undefined)e._o=e.ts?1e6+e.ts/1000:tOrder(e.t);ev.push({j,e})})});
 return ev.sort((a,b)=>b.e._o-a.e._o).slice(0,limit);
}
const feedHTML=(list)=>list.map(({j,e})=>`<div class="event"><i class="dot"></i><div><b>${esc(e.e)}</b><p><a class="lnk" data-act="open-job" data-id="${j.id}">${esc(j.name)}</a> · ${esc(e.t)}</p></div></div>`).join('')||empty('No activity yet');

/* ---------- OVERVIEW ---------- */
VIEWS.overview={skel:'cards',title:()=>{const h=new Date().getHours();return[(h<12?'Good morning':h<17?'Good afternoon':'Good evening')+', '+(S.role==='Manager'?'Manager':S.role),new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})+' · '+S.org.name]},
render(){
 const b=briefing(),st=b.st,al=alerts().filter(a=>a.sev!=='blue').slice(0,4);
 const T=JOBS.filter(j=>dayOff(j)===0&&j.status!=='Cancelled');
 const parts=[['Complete',T.filter(j=>DONE_ST.includes(j.status)).length,'green'],['In the field',st.active,'blue'],['To start',st.upcoming,'indigo'],['Unassigned',st.unassigned,'red']].map(([l,v,c])=>({l,v,c}));
 const wk=[6,5,4,3,2,1,0].map(n=>{const o=-n,v=JOBS.filter(j=>dayOff(j)===o&&JC.realised(j)).length;return{l:dayLabel(o),s:o===0?'Today':offDate(o).toLocaleDateString('en-GB',{weekday:'short'}),v}});
 const rev=JOBS.filter(j=>JC.realised(j)&&dayOff(j)>=-30);const tt=JC.totals(rev);
 return`
 <div class="kpis">
  ${kpi('Scheduled today',st.scheduled,{act:'go',id:'schedule'})}
  ${kpi('Completed',st.completed,{tone:'green',sub:pct(st.completed,st.scheduled)+'% of today',act:'go',id:'jobs'})}
  ${kpi('In the field',st.active,{tone:'blue',act:'go',id:'live'})}
  ${kpi('Overdue',st.overdue,{tone:st.overdue?'red':'',act:'go',id:'jobs'})}
  ${kpi('Unassigned',st.unassigned,{tone:st.unassigned?'amber':'',act:'go',id:'dispatch'})}
  ${kpi('Awaiting approval',st.approvals,{tone:st.approvals?'amber':'',act:'go',id:'reports'})}
 </div>
 <div class="row21">
  <div class="stack">
   <div class="brief"><h3>${ic('spark')} Daily operations briefing <span class="tag">Calculated from live data</span></h3>
    <ul>${b.lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>
    ${b.acts.slice(0,3).map(a=>`<div class="rec"><span>${esc(a.text)}</span><button class="btn btn-secondary btn-sm" data-act="${a.act}" data-id="${esc(a.id)}">${esc(a.btn)}</button></div>`).join('')}
    <div class="actions"><button class="btn btn-primary btn-sm" data-act="go" data-id="ask">Open full briefing</button></div></div>
   <div class="panel"><div class="phead"><div><h3>Needs attention</h3><div class="sub">Only things you can act on</div></div><button class="btn btn-ghost btn-sm" data-act="go" data-id="ask">All recommendations</button></div>
    ${al.map((a,i)=>alertHTML(a,ALERTS.indexOf(a))).join('')||empty('Nothing needs attention','Operations are running smoothly.')}</div>
   <div class="row2"><div class="panel"><div class="phead"><h3>Today by status</h3></div>${donut(parts,{center:st.scheduled,sub:'jobs today',label:'Jobs today by status'})}</div>
   <div class="panel"><div class="phead"><div><h3>Completed jobs</h3><div class="sub">Last 7 days</div></div></div>${barChart(wk,{h:150,w:300,label:'Completed jobs in the last 7 days'})}</div></div>
  </div>
  <div class="stack">
   <div class="panel"><div class="phead"><h3>Quick actions</h3></div><div class="actions tight" style="display:grid;gap:8px">
    <button class="btn btn-primary" data-act="new-job">${ic('plus')} New job</button>
    <button class="btn btn-secondary" data-act="go" data-id="dispatch">${ic('send')} Dispatch ${st.unassigned?`<span class="nbadge">${st.unassigned}</span>`:''}</button>
    <button class="btn btn-secondary" data-act="go" data-id="reports">${ic('check')} Approve reports ${st.approvals?`<span class="nbadge">${st.approvals}</span>`:''}</button>
    <button class="btn btn-secondary" data-act="go" data-id="worker">${ic('phone')} Open worker view</button></div></div>
   <div class="panel"><div class="phead"><div><h3>30-day profitability</h3><div class="sub">${rev.length} completed jobs</div></div><button class="btn btn-ghost btn-sm" data-act="go" data-id="profit">Details</button></div>
    ${hbar('Charged',tt.charge,tt.charge,KES(tt.charge))}${hbar('Costs',tt.total,tt.charge,KES(tt.total),'amber')}${hbar('Profit',Math.max(0,tt.profit),tt.charge,KES(tt.profit)+' · '+tt.margin.toFixed(0)+'%')}</div>
   <div class="panel"><div class="phead"><h3>Recent activity</h3></div><div class="feed" style="max-height:340px">${feedHTML(activity(8))}</div></div>
  </div>
 </div>`}};
ACT['new-job']=()=>openCreateJob();

/* ---------- JOBS & TASKS ---------- */
const JF={q:'',f:'open',who:'',pri:'',sort:'time',tab:'list',limit:40};
const JFILTERS=[['open','Open'],['today','Today'],['unassigned','Unassigned'],['late','Late'],['review','Needs review'],['done','Completed'],['all','All']];
function jobsFiltered(){
 const q=JF.q.trim().toLowerCase();
 let L=JOBS.filter(j=>{
  const o=dayOff(j);
  if(JF.f==='open'&&(CLOSED_ST.includes(j.status)||o<-2&&false))return false;
  if(JF.f==='today'&&!(o===0&&j.status!=='Cancelled'))return false;
  if(JF.f==='unassigned'&&j.status!=='Unassigned')return false;
  if(JF.f==='late'&&!(j.delayMin>0&&!CLOSED_ST.includes(j.status)))return false;
  if(JF.f==='review'&&!(j.status==='Awaiting Review'||j.missingReport))return false;
  if(JF.f==='done'&&!DONE_ST.includes(j.status))return false;
  if(JF.who&&j.assignee!==JF.who)return false;if(JF.pri&&j.priority!==JF.pri)return false;
  if(q&&!(j.name+' '+cname(j)+' '+j.location+' '+wname(j.assignee)+' '+j.status+' '+j.id).toLowerCase().includes(q))return false;
  return true});
 const asc=(a,b)=>dayOff(a)-dayOff(b)||jStart(a)-jStart(b);
 L.sort(JF.sort==='time'?(JF.f==='done'?(a,b)=>asc(b,a):asc):JF.sort==='priority'?(a,b)=>['Urgent','High','Normal'].indexOf(a.priority)-['Urgent','High','Normal'].indexOf(b.priority)||asc(a,b):JF.sort==='profit'?(a,b)=>JC.profit(b)-JC.profit(a):(a,b)=>a.name.localeCompare(b.name));
 return L;
}
function jobRow(j){
 const t=j.assignee?teamById(j.assignee):null,o=overlay(j).pending,cf=!CLOSED_ST.includes(j.status)&&j.assignee?conflictsFor(j,j.assignee).some(c=>c.sev==='block'):false;
 return`<div class="jrow" data-act="open-job" data-id="${j.id}" tabindex="0" role="button" aria-label="Open ${esc(j.name)}">
 <div class="c-main"><div class="t">${esc(j.name)}${j.priority!=='Normal'?` ${pl(j.priority,j.priority==='Urgent'?'red':'amber')}`:''}</div><span class="sub">${esc(cname(j))}${depsOpen(j).length?' · ⛓ blocked':''}${cf?' · <span class="neg">⚠ conflict</span>':''}</span></div>
 <div class="c-who who">${t?avatar(t)+`<span>${esc(t.name)}</span>`:`<span class="mut">Unassigned</span>`}</div>
 <div class="c-loc hide-md"><span>${esc(j.location)}</span><span class="sub">${jobDay(j)} · ${esc(j.time)}</span></div>
 <div class="c-st">${stPill(j)}</div>
 <div class="c-prog"><div class="progress ${j.delayMin>0?'amber':''}"><span style="width:${j.progress}%"></span></div><span class="sub">${j.progress}%${o?' · '+o+' pending sync':''}</span></div>
 <div class="c-act num" style="text-align:right"><b>${KES(JC.charge(j)).replace('KES ','')}</b><span class="sub ${JC.profit(j)<0?'neg':''}">${JC.costs(j).total?'profit '+Math.round(JC.margin(j))+'%':'no costs'}</span></div></div>`;
}
function jobsList(){
 const L=jobsFiltered(),show=L.slice(0,JF.limit);
 return L.length?`<div class="jlist"><div class="jrow head"><div>Job</div><div>Worker</div><div class="hide-md">Where / when</div><div>Status</div><div>Progress</div><div style="text-align:right">Charge</div></div>${show.map(jobRow).join('')}</div>${L.length>show.length?`<div class="actions center"><button class="btn btn-secondary" data-act="jobs-more">Show ${Math.min(40,L.length-show.length)} more (${L.length-show.length} hidden)</button></div>`:''}<p class="mut" style="margin-top:8px">${L.length} job${L.length!==1?'s':''}</p>`
 :empty('No jobs match','Try a different filter or clear the search.',`<button class="btn btn-secondary" data-act="jobs-clear">Clear filters</button><button class="btn btn-primary" data-act="new-job">New job</button>`);
}
VIEWS.jobs={skel:'list',title:()=>['Jobs & Tasks','Create, track and complete work — templates, recurring and costing included'],
render(p){
 if(p&&p.tab)JF.tab=p.tab==='recurring'?'recurring':'list';
 const cnt=k=>{const s=JF.f;JF.f=k;const n=jobsFiltered().length;JF.f=s;return n};
 return`<div class="toolbar"><div class="tools">${seg([['list','Jobs'],['recurring','Recurring',D.recur.filter(r=>r.active).length]],JF.tab,'jobs-tab')}</div><div class="tools"><button class="btn btn-secondary" data-act="tpl-manage">${ic('list')} Templates</button><button class="btn btn-primary" data-act="new-job">${ic('plus')} New job</button></div></div>`+
 (JF.tab==='recurring'?recurringHTML():`
 <div class="toolbar"><div class="search grow">${ic('search')}<input data-in="jobs-q" value="${esc(JF.q)}" placeholder="Search job, customer, location, worker…" aria-label="Search jobs"></div>
  <div class="tools"><select data-chg="jobs-who" aria-label="Worker"><option value="">All workers</option>${opts(TEAM.map(t=>[t.id,t.name]),JF.who)}</select><select data-chg="jobs-pri" aria-label="Priority"><option value="">Any priority</option>${opts(['Normal','High','Urgent'],JF.pri)}</select><select data-chg="jobs-sort" aria-label="Sort">${opts([['time','Sort: schedule'],['priority','Sort: priority'],['profit','Sort: profit'],['name','Sort: name']],JF.sort)}</select></div></div>
 <div class="chips" style="margin-bottom:12px" role="group" aria-label="Status filter">${JFILTERS.map(([k,l])=>`<button class="chip ${JF.f===k?'active':''}" data-act="jobs-filter" data-id="${k}">${l}<span>${cnt(k)}</span></button>`).join('')}</div>
 <div id="jobs-results">${jobsList()}</div>`)},
after(el,p){if(p&&p.templates){UI.params={};setTimeout(()=>ACT['tpl-manage'](),0)}}};
Object.assign(ACT,{'jobs-tab':el=>{JF.tab=el.dataset.id;paint('jobs')},'jobs-filter':el=>{JF.f=el.dataset.id;JF.limit=40;paint('jobs')},'jobs-more':()=>{JF.limit+=40;region('#jobs-results',jobsList())},'jobs-clear':()=>{Object.assign(JF,{q:'',f:'all',who:'',pri:''});paint('jobs')}});
let _jq;Object.assign(INP,{'jobs-q':el=>{JF.q=el.value;JF.limit=40;clearTimeout(_jq);_jq=setTimeout(()=>region('#jobs-results',jobsList()),120)}});
Object.assign(CHG,{'jobs-who':el=>{JF.who=el.value;paint('jobs')},'jobs-pri':el=>{JF.pri=el.value;paint('jobs')},'jobs-sort':el=>{JF.sort=el.value;paint('jobs')}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.jrow[data-act]')){e.preventDefault();e.target.click()}});

/* ----- recurring (inside Jobs) ----- */
function recurringHTML(){
 return`<div class="panel"><div class="phead"><div><h3>Recurring services</h3><div class="sub">Each schedule generates real jobs. Nothing is generated automatically until a backend scheduler exists — use “Generate next job”.</div></div><button class="btn btn-primary btn-sm" data-act="recur-new">${ic('plus')} New recurring service</button></div>
 ${D.recur.length?`<div class="tablewrap"><table><thead><tr><th>Service</th><th>Customer</th><th>Repeats</th><th>Worker</th><th>Next</th><th></th></tr></thead><tbody>${D.recur.map(r=>`<tr><td><b>${esc(r.tplName)}</b></td><td>${esc(customerById(r.custId).name)}</td><td>${esc(r.every)}</td><td>${esc(wname(r.who))}</td><td>${r.active?dayLabel(r.nextOff):'Paused'}</td><td class="num"><button class="btn btn-secondary btn-sm" data-act="recur-gen" data-id="${r.id}" ${r.active?'':'disabled'}>Generate next job</button> <button class="btn btn-ghost btn-sm" data-act="recur-toggle" data-id="${r.id}">${r.active?'Pause':'Resume'}</button> <button class="btn btn-ghost btn-sm icon" data-act="recur-del" data-id="${r.id}" aria-label="Delete">${ic('trash')}</button></td></tr>`).join('')}</tbody></table></div>`:empty('No recurring services','Create one to generate repeat jobs for regular customers.')}</div>`;
}
const EVERY={Weekly:7,Biweekly:14,Monthly:30};
Object.assign(ACT,{
 'recur-new':()=>UI.drawer({title:'New recurring service',sub:'Creates the first job now and a schedule for the next ones',render:()=>({body:`<form class="form" id="rf" data-submit="recur-save">${field('Service template',`<select name="tpl" required>${opts(TEMPLATES.map(t=>t.name))}</select>`,{full:1})}${field('Customer',`<select name="cust" required>${opts(CUSTOMERS.map(c=>[c.id,c.name]))}</select>`)}${field('Repeats',`<select name="every">${opts(Object.keys(EVERY))}</select>`)}${field('First visit',`<input type="date" name="first" required min="${dateVal(0)}" value="${dateVal(1)}">`)}${field('Preferred worker',`<select name="who"><option value="">Decide in dispatch</option>${opts(TEAM.map(t=>[t.id,t.name]))}</select>`)}</form>`,foot:`<button class="btn btn-secondary" data-act="close-drawer">Cancel</button><button class="btn btn-primary" form="rf">Create schedule</button>`})}),
 'recur-gen':el=>{const r=D.recur.find(x=>x.id===el.dataset.id);if(!guard('jobs.create','create jobs'))return;makeRecurJob(r,r.nextOff);r.nextOff+=EVERY[r.every];commit();toast('Next job generated and added to the schedule.','success')},
 'recur-toggle':el=>{const r=D.recur.find(x=>x.id===el.dataset.id);r.active=!r.active;commit()},
 'recur-del':el=>UI.confirm('Delete this recurring schedule? Jobs already created are kept.',()=>{D.recur=D.recur.filter(x=>x.id!==el.dataset.id);commit()},{danger:1,label:'Delete'})
});
function makeRecurJob(r,off){
 const t=TEMPLATES.find(x=>x.name===r.tplName)||TEMPLATES[0],c=customerById(r.custId);
 const j=mkJob({name:t.name,customerId:c.id,location:c.location,assignee:null,status:'Unassigned',date:dayKey(off),time:'09:00',tplId:t.id,recurId:r.id,est:Math.min(8,t.hours),charge:t.price,skills:t.skills.slice(),instructions:t.instructions,subtasks:t.checklist.filter(x=>!/photo/i.test(x)).map((x,i)=>({id:uid('s'),title:x,done:false})),timeline:[{t:nowStr(),e:'Created from recurring schedule',ts:Date.now()}]});
 JOBS.push(j);if(r.who)S.proposals.push({id:uid('p'),jobId:j.id,workerId:r.who,at:Date.now()});return j;
}
SUB['recur-save']=f=>{const d=Object.fromEntries(new FormData(f)),off=parseOff(d.first);if(off===null||off<0)return toast('Pick a valid date from today onward.','error');if(!guard('jobs.create','create jobs'))return;
 const r={id:uid('r'),tplName:d.tpl,custId:d.cust,every:d.every,who:d.who||null,nextOff:off+EVERY[d.every],active:true};D.recur.push(r);makeRecurJob(r,off);closeDrawer();commit();toast('Recurring schedule created. First job is on the schedule'+(r.who?' (worker proposed — approve in Dispatch)':'')+'.','success')};

/* ----- template manager (lives inside the job creation experience) ----- */
function tplForm(t){
 t=t||{name:'',price:'',hours:2,skills:[],equipment:[],materials:[],checklist:[],instructions:''};
 return`<form class="form" id="tf" data-submit="tpl-save"><input type="hidden" name="id" value="${esc(t.id||'')}">
 ${field('Template name',`<input name="name" required maxlength="60" value="${esc(t.name)}" placeholder="e.g. Hedge Trimming" autofocus>`,{full:1})}
 ${field('Standard price (KES)',`<input name="price" type="number" min="0" step="50" required value="${esc(t.price)}">`)}${field('Expected duration (hours)',`<input name="hours" type="number" min="0.5" max="80" step="0.5" required value="${esc(t.hours)}">`)}
 ${field('Required skills',`<div class="chips">${ALL_SKILLS.map(s=>`<label class="chip"><input type="checkbox" name="skill" value="${s}" ${t.skills.includes(s)?'checked':''}>${s}</label>`).join('')}</div>`,{full:1})}
 ${field('Required equipment',`<input name="equipment" value="${esc(t.equipment.join(', '))}" placeholder="Mower, Ladder">`,{full:1,hint:'Comma separated'})}
 ${field('Materials used (one per line: item, quantity)',`<textarea name="materials" placeholder="Fertilizer, 2">${esc(t.materials.map(m=>m.item+', '+m.qty).join('\n'))}</textarea>`,{full:1,hint:'Item names should match inventory so stock use can be projected'})}
 ${field('Checklist (one step per line)',`<textarea name="checklist" required>${esc(t.checklist.join('\n'))}</textarea>`,{full:1})}
 ${field('Instructions for the worker',`<textarea name="instructions">${esc(t.instructions)}</textarea>`,{full:1})}</form>`;
}
function tplDrawer(editId){
 UI.drawer({title:editId==null?'Task templates':editId===''?'New template':'Edit template',sub:'Reusable task definitions — pick one when creating a job',wide:1,
  render:()=>{
   if(editId!=null)return{body:tplForm(editId?tplById(editId):null),foot:`<button class="btn btn-secondary" data-act="tpl-back">Back</button><button class="btn btn-primary" form="tf">Save template</button>`};
   return{body:`<div class="actions tight" style="margin-bottom:12px"><button class="btn btn-primary btn-sm" data-act="tpl-edit" data-id="">${ic('plus')} New template</button></div>`+
   (TEMPLATES.map(t=>`<div class="rule"><div class="phead" style="margin:0"><div><h3>${esc(t.name)}</h3><div class="sub">${KES(t.price)} · ${t.hours}h · ${t.checklist.length} checklist steps</div></div><div class="actions tight"><button class="btn btn-secondary btn-sm" data-act="tpl-use" data-id="${t.id}">Use</button><button class="btn btn-ghost btn-sm icon" data-act="tpl-edit" data-id="${t.id}" aria-label="Edit ${esc(t.name)}">${ic('edit')}</button><button class="btn btn-ghost btn-sm icon" data-act="tpl-del" data-id="${t.id}" aria-label="Delete ${esc(t.name)}">${ic('trash')}</button></div></div><div class="tags">${t.skills.map(s=>`<span class="tag">${esc(s)}</span>`).join('')}${t.equipment.map(s=>`<span class="tag">🔧 ${esc(s)}</span>`).join('')}</div></div>`).join('')||empty('No templates yet','Create one to speed up job creation.'))}
 }})}
Object.assign(ACT,{'tpl-manage':()=>tplDrawer(),'tpl-back':()=>tplDrawer(),'tpl-edit':el=>tplDrawer(el.dataset.id),'tpl-use':el=>openCreateJob({tpl:el.dataset.id}),
 'tpl-del':el=>UI.confirm('Delete this template? Existing jobs keep their own copy of the checklist.',()=>{TEMPLATES=TEMPLATES.filter(t=>t.id!==el.dataset.id);commit();tplDrawer()},{danger:1,label:'Delete'})});
SUB['tpl-save']=f=>{
 if(!guard('jobs.create','manage templates'))return;
 const fd=new FormData(f),name=fd.get('name').trim(),id=fd.get('id');
 if(TEMPLATES.some(t=>t.name.toLowerCase()===name.toLowerCase()&&t.id!==id))return toast('A template with that name already exists.','error');
 const checklist=fd.get('checklist').split('\n').map(x=>x.trim()).filter(Boolean);if(!checklist.length)return toast('Add at least one checklist step.','error');
 const materials=fd.get('materials').split('\n').map(l=>l.split(',').map(x=>x.trim())).filter(a=>a[0]).map(a=>({item:a[0],qty:+a[1]||1}));
 const o={name,price:+fd.get('price'),hours:+fd.get('hours'),skills:fd.getAll('skill'),equipment:fd.get('equipment').split(',').map(x=>x.trim()).filter(Boolean),materials,checklist,instructions:fd.get('instructions').trim()};
 if(id)Object.assign(tplById(id),o);else TEMPLATES.push({id:'t'+(tplSeq++),...o});
 commit();toast('Template saved.','success');tplDrawer();
};

/* ----- create / edit job ----- */
function openCreateJob(o={}){
 if(!guard('jobs.create','create or edit jobs'))return;
 const ed=o.edit?jobById(o.edit):null,t0=o.tpl?tplById(o.tpl):ed?tplFor(ed):null;UI._reqId=o.reqId||null;UI._quote=o.quoteId||null;
 const j=ed||{name:t0?t0.name:'',customerId:'',location:'',date:'Tomorrow',time:'09:00',priority:'Normal',est:t0?Math.min(8,t0.hours):S.org.defaultHours,charge:t0?t0.price:'',skills:t0?t0.skills.slice():[],instructions:t0?t0.instructions:'',subtasks:t0?t0.checklist.filter(x=>!/photo/i.test(x)).map(x=>({title:x})):[],dependsOn:[]};
 Object.assign(j,o.pre||{});
 UI.drawer({title:ed?'Edit job':'New job',sub:ed?'Changes are logged in the job activity':'Pick a template to prefill instructions, checklist, duration and skills',wide:1,
  render:()=>({body:`<form class="form" id="jf" data-submit="job-save"><input type="hidden" name="edit" value="${ed?ed.id:''}">
  ${field('Template',`<div style="display:flex;gap:8px"><select name="tpl" data-chg="job-tpl"><option value="">— No template —</option>${opts(TEMPLATES.map(t=>[t.id,t.name+' · '+KES(t.price)]),t0?t0.id:'')}</select><button type="button" class="btn btn-secondary" data-act="job-tpl-save" title="Save this job's setup as a new template">Save as template</button></div>`,{full:1})}
  ${field('Job name',`<input name="name" required maxlength="80" value="${esc(j.name)}">`,{full:1})}
  ${field('Customer',`<select name="customerId" required data-chg="job-cust"><option value="">Select customer…</option>${opts(CUSTOMERS.map(c=>[c.id,c.name]),j.customerId)}</select>`)}
  ${field('Area',`<select name="location" required><option value="">Select area…</option>${opts(Object.keys(COORD),j.location)}</select>`,{hint:'Used for service-area matching in Dispatch'})}
  ${field('Date',`<input type="date" name="date" required ${ed?'':`min="${dateVal(0)}"`} value="${dateVal(dayOff(j))}">`)}${field('Start time',`<input type="time" name="time" required value="${esc(hhmm(mins(j.time)))}">`)}
  ${field('Expected hours',`<input type="number" name="est" min="0.5" max="80" step="0.5" required value="${esc(j.est)}">`)}${field('Customer charge (KES)',`<input type="number" name="charge" min="0" step="50" required value="${esc(j.charge)}">`)}
  ${field('Priority',`<select name="priority">${opts(['Normal','High','Urgent'],j.priority)}</select>`)}${field('Depends on',`<select name="dep"><option value="">Nothing</option>${opts(JOBS.filter(x=>!CLOSED_ST.includes(x.status)&&x.id!==(ed&&ed.id)).map(x=>[x.id,x.name+' — '+cname(x)+' ('+jobDay(x)+')']),(j.dependsOn||[])[0])}</select>`,{hint:'This job cannot start until that one is done'})}
  ${field('Required skills',`<div class="chips">${ALL_SKILLS.map(s=>`<label class="chip"><input type="checkbox" name="skill" value="${s}" ${(j.skills||[]).includes(s)?'checked':''}>${s}</label>`).join('')}</div>`,{full:1})}
  ${field('Instructions for the worker',`<textarea name="instructions">${esc(j.instructions)}</textarea>`,{full:1})}
  ${field('Subtasks / checklist (one per line)',`<textarea name="subtasks">${esc((j.subtasks||[]).map(s=>s.title).join('\n'))}</textarea>`,{full:1})}
  ${ed?'':field('Repeat',`<select name="repeat">${opts([['','Does not repeat'],['Weekly','Weekly'],['Biweekly','Every 2 weeks'],['Monthly','Monthly']],'')}</select>`,{hint:'Creates a recurring schedule (see Jobs → Recurring)'})}
  </form>`,foot:`<button class="btn btn-secondary" data-act="close-drawer">Cancel</button>${ed?'':`<button class="btn btn-secondary" type="submit" form="jf" name="go" value="dispatch">Create & dispatch</button>`}<button class="btn btn-primary" type="submit" form="jf">${ed?'Save changes':'Create job'}</button>`}),
  after:b=>{if(!ed&&!o.tpl&&!o.keep)$('[name=name]',b).focus()}});
 
}
CHG['job-tpl']=el=>{const t=tplById(el.value),f=el.form;if(!t)return;f.name.value=t.name;f.est.value=Math.min(8,t.hours);f.charge.value=t.price;f.instructions.value=t.instructions;f.subtasks.value=t.checklist.filter(x=>!/photo/i.test(x)).join('\n');$$('[name=skill]',f).forEach(c=>c.checked=t.skills.includes(c.value))};
CHG['job-cust']=el=>{const c=customerById(el.value);if(c&&!el.form.location.value)el.form.location.value=c.location};
ACT['job-tpl-save']=el=>{const f=el.closest('form'),name=f.name.value.trim();if(!name)return toast('Give the job a name first — it becomes the template name.','error');
 if(TEMPLATES.some(t=>t.name.toLowerCase()===name.toLowerCase()))return toast('A template with that name exists — rename the job first.','error');
 const cl=f.subtasks.value.split('\n').map(x=>x.trim()).filter(Boolean);if(!cl.length)return toast('Add at least one subtask to save a template.','error');
 const t={id:'t'+(tplSeq++),name,price:+f.charge.value||0,hours:+f.est.value||2,skills:$$('[name=skill]:checked',f).map(c=>c.value),equipment:[],materials:[],checklist:cl,instructions:f.instructions.value.trim()};TEMPLATES.push(t);commit();toast(`Template “${name}” saved.`,'success');f.tpl.innerHTML='<option value="">— No template —</option>'+opts(TEMPLATES.map(x=>[x.id,x.name+' · '+KES(x.price)]),t.id)};
SUB['job-save']=(f,e)=>{
 const fd=new FormData(f),off=parseOff(fd.get('date')),eid=fd.get('edit'),name=fd.get('name').trim();
 if(!name)return toast('Enter a job name.','error');if(off===null)return toast('Pick a valid date.','error');if(!eid&&off<0)return toast('The date cannot be in the past.','error');
 const c=customerById(fd.get('customerId'));if(!c)return toast('Choose a customer.','error');
 const subs=fd.get('subtasks').split('\n').map(x=>x.trim()).filter(Boolean),dep=+fd.get('dep')||null,tpl=tplById(fd.get('tpl'));
 if(eid&&dep===+eid)return toast('A job cannot depend on itself.','error');
 const vals={name,customerId:c.id,location:fd.get('location'),time:fd.get('time'),priority:fd.get('priority'),est:+fd.get('est'),charge:+fd.get('charge'),skills:fd.getAll('skill'),instructions:fd.get('instructions').trim(),dependsOn:dep?[dep]:[],tplId:tpl?tpl.id:null};
 let j;
 if(eid){j=jobById(+eid);const old=new Map(j.subtasks.map(s=>[s.title,s]));Object.assign(j,vals);setDay(j,off);j.subtasks=subs.map(t=>old.get(t)||{id:uid('s'),title:t,done:false});log(j,'Job details edited');toast('Job updated.','success')}
 else{j=mkJob({...vals,assignee:null,status:'Unassigned',subtasks:subs.map(t=>({id:uid('s'),title:t,done:false})),timeline:[{t:nowStr(),e:'Task created',ts:Date.now()}]});setDay(j,off);JOBS.push(j);
  const rep=fd.get('repeat');if(rep)D.recur.push({id:uid('r'),tplName:tpl?tpl.name:name,custId:c.id,every:rep,who:null,nextOff:off+EVERY[rep],active:true});
  toast(`Job created${rep?' with a '+rep.toLowerCase()+' schedule':''}.`,'success')}
 if(UI._quote){const q=D.quotes.find(x=>x.id===UI._quote);if(q)q.job=j.id;UI._quote=null}
 if(UI._reqId){const r=D.requests.find(x=>x.id===UI._reqId);if(r)r.st='Converted';UI._reqId=null}
 const go=e&&e.submitter&&e.submitter.value==='dispatch';closeDrawer();commit();if(go)goTo('dispatch',{focus:j.id});else if(!eid)openJob(j.id);
};

/* ----- job detail drawer ----- */
let JT={tab:'overview'};
const STAGES=['Unassigned','Assigned','Accepted','On Site','In Progress','Completed','Awaiting Review','Approved'];
function openJob(id,tab){const j=jobById(id);if(!j)return toast('That job no longer exists.','error');JT={id,tab:tab||'overview'};
 UI.drawer({wide:1,render:()=>jobDrawer()})}
function jobDrawer(){
 const j=jobById(JT.id);if(!j)return{title:'Job removed',body:empty('This job no longer exists.')};
 const tabs=[['overview','Overview'],['tasks','Tasks'],['costing','Costing'],['completion','Completion'],['activity','Activity']];
 const c=customerById(j.customerId),t=j.assignee?teamById(j.assignee):null,idx=STAGES.indexOf(j.status),cost=JC.costs(j),blocked=depsOpen(j);
 let body='';
 if(JT.tab==='overview'){
  const ns=NEXT[j.status]||[];
  body=`<div class="stage">${STAGES.map((s,i)=>`<div class="${i<idx?'done':i===idx?'current':''}">${s}</div>`).join('')}</div>
  ${blocked.length?`<div class="alert blue"><div class="alert-body"><b>Blocked by an unfinished job</b><p>${jl(blocked[0])} must be completed first.</p></div></div>`:''}
  <dl class="kv"><dt>Customer</dt><dd>${esc(c.name)} · ${esc(c.phone)}</dd><dt>Location</dt><dd>${esc(j.location)} <span class="mut">(${ZONE[j.location]||'—'} area)</span></dd><dt>Schedule</dt><dd>${jobDay(j)} · ${hhmm(jStart(j))}–${hhmm(jEnd(j))} (${estHrs(j)}h)</dd><dt>Worker</dt><dd>${t?esc(t.name)+' · '+esc(t.role):'<span class="mut">Not assigned</span>'}</dd><dt>Priority</dt><dd>${pl(j.priority,j.priority==='Normal'?'gray':j.priority==='High'?'amber':'red')}</dd><dt>Skills</dt><dd>${(j.skills||[]).map(s=>`<span class="tag">${esc(s)}</span>`).join(' ')||'—'}</dd>${j.recurId?`<dt>Recurring</dt><dd>${pl('Part of a recurring schedule','indigo')}</dd>`:''}${j.dependsOn.length?`<dt>Depends on</dt><dd>${j.dependsOn.map(d=>jobById(d)?jl(jobById(d)):'—').join(', ')}</dd>`:''}</dl>
  <div class="dsec" style="margin-top:14px"><h4>Instructions</h4><p style="font-size:13px;line-height:1.55;white-space:pre-wrap">${esc(j.instructions||'None provided.')}</p></div>
  <div class="dsec"><h4>Manage</h4><div class="form"><div class="field"><label>Status</label><select data-chg="job-status" ${ns.length?'':'disabled'}><option>${j.status}</option>${opts(ns)}</select></div>
  <div class="field"><label>Report a delay (minutes)</label><div style="display:flex;gap:6px"><input type="number" min="0" max="600" id="delayin" value="${j.delayMin||0}"><button class="btn btn-secondary" data-act="job-delay">Set</button></div></div></div>
  <div class="actions"><button class="btn btn-secondary btn-sm" data-act="job-assign">${t?'Reassign…':'Find a worker…'}</button><button class="btn btn-secondary btn-sm" data-act="job-resched">Reschedule</button><button class="btn btn-secondary btn-sm" data-act="job-notify">Notify customer</button></div></div>`;
 }else if(JT.tab==='tasks'){
  const done=j.subtasks.filter(s=>s.done).length;
  body=`<div class="dsec"><h4>Subtasks <span>${done}/${j.subtasks.length}</span></h4><div class="progress"><span style="width:${pct(done,j.subtasks.length)}%"></span></div>
  ${j.subtasks.map(s=>`<label class="chk ${s.done?'done':''}"><input type="checkbox" data-chg="sub-toggle" data-id="${s.id}" ${s.done?'checked':''}><span>${esc(s.title)}</span><button type="button" class="btn btn-ghost btn-sm icon" style="margin-left:auto" data-act="sub-del" data-id="${s.id}" aria-label="Remove">${ic('x')}</button></label>`).join('')||'<p class="mut">No subtasks yet.</p>'}
  <form class="actions" data-submit="sub-add"><input name="t" required maxlength="80" placeholder="Add a subtask" style="flex:1" aria-label="New subtask"><button class="btn btn-secondary">Add</button></form></div>
  <div class="dsec"><h4>Worker checklist (field)</h4>${Object.keys(j.proof.chk).length?Object.entries(j.proof.chk).map(([k,v])=>`<div class="event"><i class="dot" style="background:${v?'var(--green)':'var(--line-2)'}"></i><div><b>${esc(k)}</b><p>${v?'Done':'Not done'}</p></div></div>`).join(''):'<p class="mut">The worker has not synced any checklist progress yet.</p>'}</div>`;
 }else if(JT.tab==='costing'){
  const pr=JC.profit(j),mg=JC.margin(j);
  body=`<div class="costbox">${[['Customer charge',KES(JC.charge(j))],['Labour',KES(cost.labour)],['Materials',KES(cost.material)],['Transport',KES(cost.transport)],['Other',KES(cost.other)],['Total cost',KES(cost.total)]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div>
  <div class="kpis c3" style="margin-top:10px"><div class="kpi ${pr<0?'red':'green'}"><small>${JC.realised(j)?'Actual profit':'Profit to date'}</small><strong>${money(pr)}</strong></div><div class="kpi"><small>Margin</small><strong>${mg.toFixed(1)}%</strong></div><div class="kpi"><small>Status</small><strong style="font-size:14px">${JC.realised(j)?'Final':'Running'}</strong></div></div>
  <div class="dsec" style="margin-top:14px"><h4>Expenses</h4>${j.expenses.map(e=>`<div class="qrow"><div><b>${esc(e.cat)}</b> · ${esc(e.desc)}<small>${esc(e.t||'')}${e.seed?' · demo seed':''}</small></div><b>${KES(e.amt)}</b><button class="btn btn-ghost btn-sm icon" data-act="exp-del" data-id="${e.id}" aria-label="Remove expense">${ic('trash')}</button></div>`).join('')||'<p class="mut">No expenses recorded.</p>'}</div>
  <form class="form" data-submit="exp-add" style="margin-top:8px"><div class="field full"><label>Record an expense</label></div>
  ${field('Category',`<select name="cat" data-chg="exp-cat">${opts(['Labour','Material','Transport','Other'])}</select>`)}${field('Amount (KES)',`<input name="amt" type="number" min="1" step="1" required>`)}
  ${field('Description',`<input name="desc" required maxlength="80" placeholder="e.g. Casual labour, 2 workers">`,{full:1})}
  <div class="field full" id="expstock" hidden><label>Inventory item (optional — deducts stock)</label><div style="display:flex;gap:8px"><select name="stockId"><option value="">Not from stock</option>${opts(D.stock.map(s=>[s.id,s.n+' ('+s.q+s.u+')']))}</select><input name="qty" type="number" min="0.5" step="0.5" placeholder="Qty" style="max-width:90px"></div></div>
  <div class="field full"><button class="btn btn-primary">Add expense</button></div></form>
  <form class="actions" data-submit="charge-set"><label class="lbl" for="chg">Customer charge</label><input id="chg" name="charge" type="number" min="0" step="50" required value="${JC.charge(j)}" style="max-width:150px"><button class="btn btn-secondary btn-sm">Update</button></form>`;
 }else if(JT.tab==='completion'){
  const r=j.report,ph=j.proof.photos,b4=ph.filter(p=>p.kind==='before'),af=ph.filter(p=>p.kind==='after'),cu=j.cust||{status:'none'};
  const strip=(a,l)=>`<div><h5>${l}</h5>${a.length?`<div class="photos">${a.map(p=>`<figure><img data-photo="${p.id}" alt="${l} photo" class="missing"><figcaption>${esc(p.t)}</figcaption></figure>`).join('')}</div>`:`<div class="empty small" style="border:1px dashed var(--line-2);border-radius:10px">No ${l.toLowerCase()} photos</div>`}</div>`;
  body=(r?`<div class="dsec"><h4>Work summary ${pl(r.status,r.status==='Approved'?'green':r.status==='Pending Review'?'amber':'red')}</h4><div class="aireport"><span class="tag">Drafted from the worker’s notes and checklist — not AI-verified</span><p>${esc(r.summary)}</p></div></div>
  <div class="dsec"><h4>Details</h4><dl class="kv"><dt>Materials</dt><dd>${esc((r.materials||[]).join(', ')||'None')}</dd><dt>Issues</dt><dd>${esc((r.issues||[]).join('; ')||'None reported')}</dd><dt>Customer on site</dt><dd>${r.confirmed?'Worker confirmed customer was satisfied':'Not confirmed'}</dd></dl></div>`:`<div class="empty small"><b>No completion report yet</b>${j.missingReport?'<p>The job is complete but the worker has not submitted a report.</p>':''}</div>`)+
  `<div class="dsec"><h4>Before &amp; after photos</h4><div class="ba">${strip(b4,'Before')}${strip(af,'After')}</div></div>
  <div class="dsec"><h4>Customer approval <span>${pl(cu.status==='approved'?'Approved':cu.status==='awaiting'?'Awaiting customer':cu.status==='rework'?'Rework requested':'Not requested',cu.status==='approved'?'green':cu.status==='rework'?'red':'gray')}</span></h4>${cu.status==='approved'||cu.status==='rework'?`<p style="font-size:13px">${cu.rating?'★'.repeat(cu.rating)+'☆'.repeat(5-cu.rating)+' · ':''}${esc(cu.feedback||'No comment')}</p><p class="mut">${esc(cu.at||'')} — ${cu.simulated?'simulated portal action (demo), not a real customer transaction':'recorded'}</p>`:`<p class="mut">${cu.status==='awaiting'?'Waiting for the customer in the demo portal.':'Requested after the manager approves the report.'}</p>`}${cu.status==='awaiting'?`<div class="actions"><button class="btn btn-secondary btn-sm" data-act="go" data-id="portal">Open customer portal</button></div>`:''}</div>`;
 }else body=`<div>${j.timeline.slice().reverse().map(e=>`<div class="event"><i class="dot"></i><div><b>${esc(e.e)}</b><p>${esc(e.t)}</p></div></div>`).join('')}</div>`;
 const foot=JT.tab==='overview'?`<button class="btn btn-secondary" data-act="job-edit">${ic('edit')} Edit</button>${j.status!=='Cancelled'&&!DONE_ST.includes(j.status)?`<button class="btn btn-ghost" data-act="job-cancel">Cancel job</button>`:''}`:JT.tab==='completion'&&j.status==='Awaiting Review'?`<button class="btn btn-secondary" data-act="job-changes">Request changes</button><button class="btn btn-primary" data-act="job-approve">Approve report</button>`:'';
 return{title:j.name,sub:`${esc(c.name)} · ${stPill(j)}`,body:`<div class="tabs-x" role="tablist">${tabs.map(([k,l])=>`<button role="tab" class="${JT.tab===k?'on':''}" aria-selected="${JT.tab===k}" data-act="job-tab" data-id="${k}">${l}${k==='completion'&&j.status==='Awaiting Review'?' •':''}</button>`).join('')}</div>${body}`,foot};
}
const curJob=()=>jobById(JT.id);
Object.assign(ACT,{
 'job-tab':el=>{JT.tab=el.dataset.id;UI.drawerRefresh(true)},
 'job-edit':()=>openCreateJob({edit:JT.id}),
 'job-approve':()=>UI.confirm('Approve this report? The customer will be asked to confirm (demo portal).',()=>approveReport(JT.id),{label:'Approve'}),
 'job-changes':()=>modalHTML(`${mhead('Request changes')}<form data-submit="job-changes"><div class="field"><label>What should the worker fix?</label><textarea name="n" required minlength="5" autofocus></textarea></div><div class="mactions"><button type="button" class="btn btn-secondary" data-act="close-modal">Cancel</button><button class="btn btn-primary">Send back to worker</button></div></form>`),
 'job-delay':()=>{const v=$('#delayin').value;if(v===''||+v<0)return toast('Enter minutes (0 clears the delay).','error');setDelay(curJob(),v);toast(+v?`Marked ${v} minutes late. Overdue automations ran.`:'Delay cleared.','success')},
 'job-assign':()=>reassignDrawer(JT.id),'job-notify':()=>notifyCustomer(JT.id),
 'job-resched':()=>{const j=curJob();modalHTML(`${mhead('Reschedule')}<form data-submit="job-resched"><div class="form">${field('Date',`<input type="date" name="d" required min="${dateVal(0)}" value="${dateVal(Math.max(0,dayOff(j)))}">`)}${field('Time',`<input type="time" name="t" required value="${hhmm(mins(j.time))}">`)}</div><div class="mactions"><button type="button" class="btn btn-secondary" data-act="close-modal">Cancel</button><button class="btn btn-primary">Reschedule</button></div></form>`)},
 'job-cancel':()=>UI.confirm('Cancel this job? It will be removed from dispatch and the schedule.',()=>{const j=curJob();j.status='Cancelled';S.proposals=S.proposals.filter(p=>p.jobId!==j.id);log(j,'Job cancelled');commit()},{danger:1,label:'Cancel job'}),
 'exp-del':el=>removeExpense(JT.id,el.dataset.id),'sub-del':el=>{const j=curJob();j.subtasks=j.subtasks.filter(s=>s.id!==el.dataset.id);commit()}
});
Object.assign(CHG,{
 'job-status':el=>{if(!setStatus(curJob(),el.value))UI.drawerRefresh()},
 'sub-toggle':el=>{const s=curJob().subtasks.find(x=>x.id===el.dataset.id);s.done=el.checked;commit()},
 'exp-cat':el=>{$('#expstock').hidden=el.value!=='Material'}
});
Object.assign(SUB,{
 'job-changes':f=>{closeModal();requestChanges(JT.id,f.n.value.trim())},
 'job-resched':f=>{const off=parseOff(f.d.value);if(off===null||off<0)return toast('Pick a valid date.','error');closeModal();reschedule(curJob(),off,f.t.value)},
 'sub-add':f=>{const j=curJob(),t=f.t.value.trim();if(!t)return;j.subtasks.push({id:uid('s'),title:t,done:false});log(j,'Subtask added: '+t);commit()},
 'exp-add':f=>{const d=Object.fromEntries(new FormData(f));if(addExpense(JT.id,d))toast('Expense recorded.','success')},
 'charge-set':f=>{if(!guard('costs.edit','change charges'))return;const j=curJob(),v=+f.charge.value;if(!(v>=0))return toast('Enter a valid amount.','error');j.charge=Math.round(v);log(j,'Customer charge set to '+KES(v));commit();toast('Charge updated.','success')}
});
/* notify customer: composes a message (no real SMS/WhatsApp is sent) */
function notifyCustomer(id){
 const j=jobById(id),c=customerById(j.customerId),late=j.delayMin>0;
 const msg=late?`Hi ${c.name.split(' ')[0]}, your ${j.name} visit is running about ${j.delayMin} minutes late. Sorry for the delay — ${wname(j.assignee).split(' ')[0]} is on the way.`:`Hi ${c.name.split(' ')[0]}, this is ${S.org.name} confirming your ${j.name} on ${jobDay(j)} at ${j.time}.`;
 UI._msgJob=id;modalHTML(`${mhead('Message to '+esc(c.name))}<form data-submit="msg-log"><div class="field"><label>Message</label><textarea name="m" required rows="4">${esc(msg)}</textarea></div><p class="hint" style="margin-top:8px">WhatsApp/SMS sending is not connected in this demo. Copy the message to send it, and log it on the job.</p><div class="mactions"><button type="button" class="btn btn-secondary" data-act="msg-copy">${ic('copy')} Copy</button><button class="btn btn-primary">Log as sent</button></div></form>`);
}
ACT['msg-copy']=el=>{const v=el.closest('form').m.value;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast('Message copied.','success'),()=>toast('Copy not available — select the text manually.','error'))};
SUB['msg-log']=f=>{const j=jobById(UI._msgJob);log(j,'Customer contacted: “'+f.m.value.trim().slice(0,70)+'”');closeModal();commit();toast('Logged on the job (not sent automatically).','success')};
function restockDialog(id){const s=D.stock.find(x=>x.id===id);UI._rs=id;modalHTML(`${mhead('Restock '+esc(s.n))}<form data-submit="restock"><div class="field"><label>Quantity received (${esc(s.u)})</label><input name="q" type="number" min="1" step="1" required autofocus></div><div class="mactions"><button type="button" class="btn btn-secondary" data-act="close-modal">Cancel</button><button class="btn btn-primary">Add stock</button></div></form>`)}
SUB.restock=f=>{if(restock(UI._rs,f.q.value)){closeModal();toast('Stock updated.','success')}};

/* ---------- SMART DISPATCH ---------- */
const DS={day:0,focus:null,all:{},range:'day'};
function candHTML(j,r,rank,withBtn=true){
 const t=teamById(r.wid),pr=S.proposals.find(p=>p.jobId===j.id&&p.workerId===r.wid);
 const tot=r.parts.skill+r.parts.avail+r.parts.work+r.parts.zone||1;
 return`<div class="cand ${rank===0&&r.total>=60&&!r.block?'top':''}"><div class="score ${scoreClass(r.total)}" title="Recommendation score">${r.total}</div>
 <div><div class="who">${avatar(t)}<b>${esc(t.name)}</b>${rank===0&&r.total>=60&&!r.block?pl('Best match','green'):''}${pr?pl('Proposed','indigo'):''}</div>
 <div class="why">${r.reasons.map(x=>`<span class="${x.ok?'ok':'no'}">${esc(x.txt)}</span>`).join('')}</div>
 <div class="parts" title="Skills ${r.parts.skill}/40 · Availability ${r.parts.avail}/25 · Workload ${r.parts.work}/25 · Area ${r.parts.zone}/10"><i style="width:${r.parts.skill/tot*100}%"></i><i style="width:${r.parts.avail/tot*100}%"></i><i style="width:${r.parts.work/tot*100}%"></i><i style="width:${r.parts.zone/tot*100}%"></i></div>
 ${r.conflicts.filter(c=>c.sev==='block').map(c=>`<div class="warn-line">${ic('alert')} ${esc(c.msg)}</div>`).join('')}</div>
 ${withBtn?`<div class="actions tight"><button class="btn ${pr?'btn-secondary':'btn-primary'} btn-sm" data-act="propose" data-job="${j.id}" data-w="${t.id}">${pr?'Proposed':'Propose'}</button></div>`:''}</div>`;
}
function dispatchQueue(){
 const off=DS.day,L=JOBS.filter(j=>j.status==='Unassigned'&&(DS.range==='week'?dayOff(j)>=0&&dayOff(j)<=7:dayOff(j)===off)).sort((a,b)=>dayOff(a)-dayOff(b)||jStart(a)-jStart(b));
 return L.map(j=>{const r=recommend(j),n=DS.all[j.id]?r.length:3,pend=S.proposals.find(p=>p.jobId===j.id);
  return`<div class="qcard ${DS.focus===j.id?'focus':''}" id="q${j.id}" draggable="true" data-drag="job:${j.id}"><div class="qhead"><div><h3>${jl(j)} ${j.priority!=='Normal'?pl(j.priority,j.priority==='Urgent'?'red':'amber'):''}</h3><span class="sub">${esc(cname(j))} · ${esc(j.location)} (${ZONE[j.location]}) · ${DS.range==='week'?dayLabel(dayOff(j))+' ':''}${hhmm(jStart(j))}–${hhmm(jEnd(j))} · ${(j.skills||[]).join(', ')||'any skill'}</span></div>${pend?pl('Pending approval','indigo'):''}</div>
  ${r.slice(0,n).map((x,i)=>candHTML(j,x,i)).join('')}
  <div class="actions"><button class="btn btn-ghost btn-sm" data-act="disp-all" data-id="${j.id}">${DS.all[j.id]?'Show top 3':'Show all workers'}</button></div></div>`}).join('')||empty('Nothing to assign',`Every job ${DS.range==='week'?'in the next 7 days':'on '+dayLabel(off).toLowerCase()} has a worker.`);
}
function lanesHTML(){
 const off=DS.day,H0=7,H1=18,span=(H1-H0)*60;
 return`<div class="hours"><div></div><div>${Array.from({length:H1-H0+1},(_,i)=>`<span>${H0+i}:00</span>`).join('')}</div></div>`+TEAM.map(t=>{
  const [lab,tone]=capLabel(t,off),p=loadPct(t.id,off),jobs=JOBS.filter(j=>j.assignee===t.id&&dayOff(j)===off&&j.status!=='Cancelled'),tent=tentJobs(t.id,off);
  const blk=(j,cls,prop)=>{const l=Math.max(0,(jStart(j)-H0*60)/span*100),w=Math.min(100-l,(jEnd(j)-jStart(j))/span*100),bad=!prop&&!CLOSED_ST.includes(j.status)&&openJobs(t.id,off).some(o=>o.id!==j.id&&overlaps(j,o));
   return`<div class="blk ${prop?'prop':DONE_ST.includes(j.status)?'done':''} ${bad?'bad':''}" style="left:${l}%;width:${w}%" ${!DONE_ST.includes(j.status)&&!prop?`draggable="true" data-drag="job:${j.id}"`:''} data-act="open-job" data-id="${j.id}" title="${esc(j.name)} ${hhmm(jStart(j))}–${hhmm(jEnd(j))}${prop?' (proposed)':''}">${esc(j.name)}</div>`};
  return`<div class="lane" data-drop="worker:${t.id}"><div><div class="who">${avatar(t)}<b>${esc(t.name.split(' ')[0])}</b></div><div class="sub">${pl(lab,tone)} ${p}%</div></div><div><div class="tl">${jobs.map(j=>blk(j)).join('')}${tent.map(j=>blk(j,'',1)).join('')}</div><div class="progress ${p>100?'amber':''}" style="margin-top:5px;height:4px"><span style="width:${Math.min(100,p)}%"></span></div></div></div>`}).join('');
}
function proposalsHTML(){
 if(!S.proposals.length)return'';
 const ok=S.proposals.filter(p=>!scoreFor(jobById(p.jobId),p.workerId).block).length;
 return`<div class="prop-bar"><div class="phead" style="margin-bottom:4px"><div><h3>${ic('shield')} Awaiting your approval (${S.proposals.length})</h3><div class="sub">Nothing is assigned until you approve. Workers are notified only after approval.</div></div>${S.proposals.length>1?`<button class="btn btn-primary btn-sm" data-act="prop-all" ${ok?'':'disabled'}>Approve ${ok} without conflicts</button>`:''}</div>
 ${S.proposals.map(p=>{const j=jobById(p.jobId),t=teamById(p.workerId),r=scoreFor(j,t.id),cf=r.conflicts;return`<div class="prop-row"><div><b>${jl(j)}</b> → <b>${esc(t.name)}</b> <span class="score ${scoreClass(r.total)}" style="display:inline-grid;width:28px;height:28px;font-size:11px;border-width:2px;vertical-align:middle">${r.total}</span><span class="sub">${dayLabel(dayOff(j))} ${hhmm(jStart(j))}–${hhmm(jEnd(j))}</span>${cf.map(c=>`<div class="warn-line ${c.sev==='block'?'':'amber'}">${ic('alert')} ${esc(c.msg)}</div>`).join('')}</div><div class="actions tight"><button class="btn btn-primary btn-sm" data-act="prop-ok" data-id="${p.id}">Approve</button><button class="btn btn-ghost btn-sm" data-act="prop-no" data-id="${p.id}">Discard</button></div></div>`}).join('')}</div>`;
}
VIEWS.dispatch={skel:'split',title:()=>['Dispatch','Smart recommendations, conflict detection and manager approval'],
render(p){
 if(p&&p.focus){DS.focus=p.focus;const j=jobById(p.focus);if(j)DS.day=Math.max(0,dayOff(j));UI.params={};}
 const off=DS.day,un=JOBS.filter(j=>j.status==='Unassigned'&&dayOff(j)===off).length;
 return`<div class="toolbar"><div class="tools"><button class="btn btn-secondary icon" data-act="disp-day" data-id="-1" aria-label="Previous day" ${off<=0?'disabled':''}>${ic('chevL')}</button><b style="min-width:150px;text-align:center">${dayLong(off)}</b><button class="btn btn-secondary icon" data-act="disp-day" data-id="1" aria-label="Next day">${ic('chevR')}</button>${off!==0?`<button class="btn btn-ghost btn-sm" data-act="disp-day" data-id="0">Today</button>`:''}</div>
  <div class="tools">${seg([['day','This day'],['week','Next 7 days']],DS.range,'disp-range')}</div></div>
 <div id="disp-props">${proposalsHTML()}</div>
 <div class="row2" style="align-items:start"><div><div class="phead"><div><h3>Unassigned jobs <span class="pill ${un?'red':'green'}">${un}</span></h3><div class="sub">Drag a job onto a worker, or use Propose. ${isTouch()?'':'Drag works on desktop.'}</div></div></div><div id="disp-queue">${dispatchQueue()}</div></div>
 <div class="panel"><div class="phead"><div><h3>Workers & workload</h3><div class="sub">Capacity 8h/day. Dashed blocks are proposals. Red = overlap.</div></div></div>${lanesHTML()}</div></div>
 <details class="panel"><summary style="cursor:pointer;font-weight:600">How the recommendation score works</summary><p class="mut" style="margin-top:8px">Score out of 100 = <b>skills 40</b> (has the skills the job needs) + <b>availability 25</b> (rostered, status, free in the time slot) + <b>workload 25</b> (hours already planned that day) + <b>service-area fit 10</b> (other jobs in the same or a neighbouring area). Overlapping jobs cap the score at 45. Areas are demo zones — <b>no GPS or road-distance data is used</b>. Recommendations are advice; every assignment needs your approval.</p></details>`},
after(el){if(DS.focus){const q=document.getElementById('q'+DS.focus);q&&q.scrollIntoView({block:'center',behavior:'smooth'});DS.focus=null}}};
const isTouch=()=>matchMedia('(pointer:coarse)').matches;
Object.assign(ACT,{
 'disp-day':el=>{DS.day=Math.max(0,el.dataset.id==='0'?0:DS.day+ +el.dataset.id);paint('dispatch')},'disp-range':el=>{DS.range=el.dataset.id;paint('dispatch')},
 'disp-all':el=>{DS.all[el.dataset.id]=!DS.all[el.dataset.id];region('#disp-queue',dispatchQueue())},
 propose:el=>{const jid=+el.dataset.job;propose(jid,el.dataset.w);if($('#drawer').classList.contains('open')){closeDrawer();goTo('dispatch',{focus:jid})}},'prop-ok':el=>approveProposal(el.dataset.id),'prop-no':el=>discardProposal(el.dataset.id),
 'prop-all':()=>{S.proposals.slice().forEach(p=>{if(!scoreFor(jobById(p.jobId),p.workerId).block)approveProposal(p.id)})}
});
DND.worker=(k,id,wid)=>{if(k!=='job')return;const j=jobById(+id);if(!j||CLOSED_ST.includes(j.status))return;if(j.assignee===wid)return;if(['On Site','In Progress'].includes(j.status))return toast('That job is already in progress — finish or cancel it first.','error');propose(j.id,wid)};
function reassignDrawer(id){
 const j=jobById(id);UI.drawer({title:'Find a worker',sub:`${esc(j.name)} · ${dayLabel(dayOff(j))} ${hhmm(jStart(j))}`,wide:1,render:()=>({body:`<p class="mut" style="margin-bottom:8px">Pick someone to propose. You will approve it in Dispatch before anything changes.</p>${recommend(j).map((r,i)=>candHTML(j,r,i)).join('')}`})});
}
