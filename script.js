/* =========================================================
   TASKYN V3 — fully interactive mock-data SaaS demo
   All data is local/mock. No real backend, AI, GPS or WhatsApp API.
   ========================================================= */

/* ---------- CORE DATA ---------- */
let TEAM=[
 {id:'brian',name:'Brian Kamau',role:'Landscape technician',status:'Active',avatar:'BK',lat:38,lng:28},
 {id:'mercy',name:'Mercy Wanjiku',role:'Gardener',status:'On site',avatar:'MW',lat:62,lng:48},
 {id:'david',name:'David Mwangi',role:'Site supervisor',status:'Delayed',avatar:'DM',lat:22,lng:70},
 {id:'john',name:'John Otieno',role:'Groundskeeper',status:'Busy',avatar:'JO',lat:75,lng:22},
 {id:'grace',name:'Grace Njeri',role:'Irrigation specialist',status:'Available',avatar:'GN',lat:50,lng:60},
 {id:'peter',name:'Peter Kariuki',role:'Landscape technician',status:'Available',avatar:'PK',lat:30,lng:50},
 {id:'faith',name:'Faith Achieng',role:'Gardener',status:'Offline',avatar:'FA',lat:65,lng:30},
 {id:'samuel',name:'Samuel Ndungu',role:'Site supervisor',status:'Available',avatar:'SN',lat:45,lng:40},
];
let CUSTOMERS=[
 {id:'c1',name:'Jane Mwangi',phone:'0722 100 201',email:'jane.mwangi@example.com',location:'Karen'},
 {id:'c2',name:'David Otieno',phone:'0733 100 202',email:'david.otieno@example.com',location:'Runda'},
 {id:'c3',name:'Sarah Wanjiku',phone:'0711 100 203',email:'sarah.w@example.com',location:'Lavington'},
 {id:'c4',name:'Kevin Mutua',phone:'0700 100 204',email:'kevin.mutua@example.com',location:'Kilimani'},
 {id:'c5',name:'Grace Njoroge',phone:'0722 100 205',email:'grace.njoroge@example.com',location:'Kileleshwa'},
 {id:'c6',name:'Alice Wanjiku',phone:'0733 100 206',email:'alice.w@example.com',location:'Lavington'},
 {id:'c7',name:'Westlands Residence',phone:'0711 100 207',email:'admin@westlandsres.co.ke',location:'Westlands'},
 {id:'c8',name:'Peter Kamotho',phone:'0700 100 208',email:'peter.kamotho@example.com',location:'Gigiri'},
 {id:'c9',name:'Mary Achieng',phone:'0722 100 209',email:'mary.achieng@example.com',location:'Parklands'},
 {id:'c10',name:'Crystal Gardens HQ',phone:'0733 100 210',email:'ops@crystalgardens.co.ke',location:'Karen'},
 {id:'c11',name:'Daniel Kiptoo',phone:'0711 100 211',email:'daniel.k@example.com',location:"Lang'ata"},
 {id:'c12',name:'Esther Mumbi',phone:'0700 100 212',email:'esther.mumbi@example.com',location:'Runda'},
];
const STATUS_ORDER=['Unassigned','Assigned','Accepted','On Site','In Progress','Completed','Awaiting Review','Approved','Cancelled'];
let idSeq=100;
function mkJob(o){return Object.assign({id:idSeq++,priority:'Normal',progress:0,delayMin:0,timeline:[],report:null},o);}
let JOBS=[
 mkJob({name:'Garden Maintenance',customerId:'c1',location:'Karen',assignee:'brian',status:'In Progress',date:'Today',time:'09:00',progress:80,
  timeline:[{t:'09:12',e:'Task created'},{t:'09:15',e:'Assigned to Brian Kamau'},{t:'09:18',e:'Brian accepted task'},{t:'09:56',e:'Brian arrived on site'},{t:'10:42',e:'Progress updated to 80%'}]}),
 mkJob({name:'Landscape Installation',customerId:'c2',location:'Runda',assignee:'david',status:'In Progress',priority:'High',date:'Today',time:'10:30',progress:45,delayMin:45,
  timeline:[{t:'08:00',e:'Task created'},{t:'08:05',e:'Assigned to David Mwangi'},{t:'08:20',e:'David accepted task'},{t:'09:10',e:'David arrived on site'},{t:'09:40',e:'Progress updated to 45%'}]}),
 mkJob({name:'Lawn Service',customerId:'c3',location:'Lavington',assignee:'mercy',status:'On Site',date:'Today',time:'11:00',progress:20,
  timeline:[{t:'10:40',e:'Task created'},{t:'10:41',e:'Assigned to Mercy Wanjiku'},{t:'10:50',e:'Mercy accepted task'},{t:'11:02',e:'Mercy arrived on site'}]}),
 mkJob({name:'Garden Cleanup',customerId:'c4',location:'Kilimani',assignee:'john',status:'Completed',date:'Today',time:'08:00',progress:100,missingReport:true,
  timeline:[{t:'07:30',e:'Task created'},{t:'07:32',e:'Assigned to John Otieno'},{t:'07:40',e:'John accepted task'},{t:'08:05',e:'John arrived on site'},{t:'09:20',e:'Job marked complete'}]}),
 mkJob({name:'Tree Pruning',customerId:'c5',location:'Kileleshwa',assignee:null,status:'Unassigned',date:'Today',time:'14:00',
  timeline:[{t:'07:45',e:'Task created from customer request'}]}),
 mkJob({name:'Lawn & Hedge Service',customerId:'c6',location:'Lavington',assignee:'mercy',status:'Approved',date:'Yesterday',time:'09:00',progress:100,
  timeline:[{t:'09:00',e:'Task created'},{t:'09:05',e:'Assigned to Mercy Wanjiku'},{t:'15:58',e:'Completion report submitted'},{t:'16:10',e:'Manager approved report'}],
  report:{summary:'Lawn maintenance was completed successfully, including mowing and hedge trimming. All areas were left tidy and the customer confirmed satisfaction on site.',materials:['Fertilizer — 2kg','Grass seed — 1kg'],confirmed:true,status:'Approved'}}),
 mkJob({name:'New Lawn Installation',customerId:'c7',location:'Westlands',assignee:'peter',status:'In Progress',date:'Today',time:'09:30',progress:40,
  timeline:[{t:'09:00',e:'Task created'},{t:'09:05',e:'Assigned to Peter Kariuki'},{t:'09:10',e:'Peter accepted task'},{t:'09:20',e:'Peter arrived on site'}]}),
 mkJob({name:'Irrigation Repair',customerId:'c8',location:'Gigiri',assignee:'grace',status:'Accepted',date:'Today',time:'13:00',
  timeline:[{t:'11:00',e:'Task created'},{t:'11:05',e:'Assigned to Grace Njeri'},{t:'11:20',e:'Grace accepted task'}]}),
 mkJob({name:'Hedge Trimming',customerId:'c9',location:'Parklands',assignee:null,status:'Unassigned',priority:'High',date:'Today',time:'15:00',
  timeline:[{t:'12:10',e:'Task created from customer request'}]}),
 mkJob({name:'Estate Grounds Service',customerId:'c10',location:'Karen',assignee:'samuel',status:'Assigned',date:'Tomorrow',time:'08:00',
  timeline:[{t:'Today 14:00',e:'Task created'},{t:'Today 14:05',e:'Assigned to Samuel Ndungu'}]}),
 mkJob({name:'Compound Cleanup',customerId:'c11',location:"Lang'ata",assignee:null,status:'Unassigned',date:'Tomorrow',time:'10:00',
  timeline:[{t:'Today 13:00',e:'Task created from customer request'}]}),
 mkJob({name:'Flower Bed Design',customerId:'c12',location:'Runda',assignee:'faith',status:'Awaiting Review',date:'Today',time:'07:30',progress:100,
  timeline:[{t:'07:30',e:'Task created'},{t:'07:35',e:'Assigned to Faith Achieng'},{t:'12:00',e:'Completion report submitted'}],
  report:{summary:'A new flower bed was designed and planted along the front driveway. Soil was treated and irrigation lines checked.',materials:['Topsoil — 4 bags','Assorted seedlings'],confirmed:true,status:'Pending Review'}}),
 mkJob({name:'Monthly Garden Retainer',customerId:'c1',location:'Karen',assignee:'brian',status:'Completed',date:'Yesterday',time:'09:00',progress:100,
  timeline:[{t:'Y 09:00',e:'Task created'},{t:'Y 09:05',e:'Assigned to Brian Kamau'},{t:'Y 12:00',e:'Job marked complete'}],
  report:{summary:'Routine monthly maintenance completed, including mowing, weeding and hedge shaping.',materials:['None'],confirmed:true,status:'Approved'}}),
 mkJob({name:'Pest Control Treatment',customerId:'c2',location:'Runda',assignee:null,status:'Cancelled',date:'Yesterday',time:'11:00',
  timeline:[{t:'Y 09:00',e:'Task created'},{t:'Y 10:00',e:'Cancelled by customer request'}]}),
 mkJob({name:'Lawn Treatment',customerId:'c3',location:'Lavington',assignee:'david',status:'Approved',date:'2 days ago',time:'14:00',progress:100,
  timeline:[{t:'-2d 14:00',e:'Task created'},{t:'-2d 17:00',e:'Completion report submitted'},{t:'-2d 17:20',e:'Manager approved report'}],
  report:{summary:'Lawn treatment applied across the compound. Bare patches were reseeded and watered thoroughly.',materials:['Fertilizer — 3kg','Grass seed — 2kg'],confirmed:true,status:'Approved'}}),
 mkJob({name:'Driveway Landscaping',customerId:'c9',location:'Parklands',assignee:'john',status:'Completed',date:'Today',time:'07:00',progress:100,missingReport:true,
  timeline:[{t:'07:00',e:'Task created'},{t:'07:05',e:'Assigned to John Otieno'},{t:'11:30',e:'Job marked complete'}]}),
 mkJob({name:'Weekly Grounds Check',customerId:'c10',location:'Karen',assignee:'samuel',status:'Approved',date:'2 days ago',time:'08:00',progress:100,
  timeline:[{t:'-2d 08:00',e:'Task created'},{t:'-2d 09:30',e:'Completion report submitted'},{t:'-2d 10:00',e:'Manager approved report'}],
  report:{summary:'Weekly grounds inspection completed. Pathways cleared and irrigation lines tested with no issues found.',materials:['None'],confirmed:true,status:'Approved'}}),
 mkJob({name:'Tree Removal',customerId:'c11',location:"Lang'ata",assignee:'peter',status:'In Progress',date:'Today',time:'12:00',progress:60,
  timeline:[{t:'10:00',e:'Task created'},{t:'10:05',e:'Assigned to Peter Kariuki'},{t:'10:15',e:'Peter accepted task'},{t:'10:40',e:'Peter arrived on site'},{t:'11:30',e:'Progress updated to 60%'}]}),
 mkJob({name:'Garden Consultation',customerId:'c12',location:'Runda',assignee:null,status:'Unassigned',date:'Tomorrow',time:'09:00',
  timeline:[{t:'Today 16:00',e:'Task created from customer request'}]}),
 mkJob({name:'Seasonal Cleanup',customerId:'c4',location:'Kilimani',assignee:'grace',status:'Accepted',date:'Tomorrow',time:'11:00',
  timeline:[{t:'Today 09:00',e:'Task created'},{t:'Today 09:10',e:'Assigned to Grace Njeri'},{t:'Today 09:30',e:'Grace accepted task'}]}),
];
let NOTIFICATIONS=[
 {id:1,type:'red',title:'Overdue',msg:'Runda installation is 45 minutes late.',jobId:JOBS[1].id,read:false,t:'09:45'},
 {id:2,type:'amber',title:'Report required',msg:"John hasn't submitted the Kilimani report.",jobId:JOBS[3].id,read:false,t:'09:20'},
 {id:3,type:'green',title:'Completed',msg:'Mercy completed Lawn & Hedge Service.',jobId:JOBS[5].id,read:false,t:'Yesterday'},
 {id:4,type:'blue',title:'New request',msg:'New customer request — Hedge Trimming, Parklands.',jobId:JOBS[8].id,read:true,t:'12:10'},
 {id:5,type:'amber',title:'Report awaiting review',msg:'Flower Bed Design report is ready for your approval.',jobId:JOBS[11].id,read:false,t:'12:00'},
 {id:6,type:'blue',title:'New request',msg:"New customer request — Compound Cleanup, Lang'ata.",jobId:JOBS[10].id,read:true,t:'13:00'},
];
let notifSeq=100;
function addNotification(type,title,msg,jobId){NOTIFICATIONS.unshift({id:notifSeq++,type,title,msg,jobId,read:false,t:nowStr()});}
const teamById=id=>TEAM.find(t=>t.id===id);
const customerById=id=>CUSTOMERS.find(c=>c.id===id);
let currentWorkerJob=JOBS[0].id;

/* ---------- NAV ---------- */
document.getElementById('nav').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 goTo(b.dataset.v);
});
function goTo(v){
 document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.v===v));
 document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
 document.getElementById(v).classList.add('active');
 const titles={overview:['Good morning, Manager',"Here's what's happening across your field operations today."],
  dispatch:['Today’s Dispatch','Assign unassigned jobs to your field team.'],
  jobs:['Jobs','Every job, its status, and who owns it.'],
  schedule:['Schedule','Upcoming jobs by day.'],
  team:['Field Team','See who is assigned, active and available.'],
  customers:['Customers','Profiles and service history.'],
  issues:['Attention Required','Everything that needs a decision from you.'],
  reports:['Reports & Analytics','Operational performance across your team.'],
  analytics:['Analytics','How operations are trending across the workspace.'],
  ask:['Ask Taskyn','Ask questions about your operations, in plain language.'],
  worker:['Field Worker View','What your team sees on their phone.']};
 document.getElementById('title').textContent=titles[v][0];
 document.getElementById('subtitle').textContent=titles[v][1];
 render(v);
}
function render(v){
 ({overview:renderOverview,dispatch:renderDispatch,jobs:renderJobs,schedule:renderSchedule,team:renderTeam,
   customers:renderCustomers,issues:renderIssues,reports:renderReports,analytics:renderAnalytics,ask:renderAsk,worker:renderWorker}[v]||function(){})();
}

/* ---------- OVERVIEW ---------- */
function renderOverview(){
 const active=JOBS.filter(j=>['In Progress','On Site','Assigned','Accepted'].includes(j.status)).length;
 const done=JOBS.filter(j=>j.status==='Completed'||j.status==='Awaiting Review'||j.status==='Approved').length;
 const delayed=JOBS.filter(j=>j.delayMin>0).length;
 const unassigned=JOBS.filter(j=>j.status==='Unassigned').length;
 const awaitingReview=JOBS.filter(j=>j.status==='Awaiting Review').length;
 const delayedJob=JOBS.find(j=>j.delayMin>0);
 document.getElementById('overview').innerHTML=`
 <div class="cards">
  <button class="card metric" onclick="jump('jobs','In Progress')"><small>Active jobs</small><strong>${active}</strong></button>
  <button class="card metric" onclick="jump('jobs','Completed')"><small>Completed today</small><strong>${done}</strong></button>
  <button class="card metric" onclick="jump('issues')"><small>Delayed jobs</small><strong style="color:var(--amber)">${delayed}</strong></button>
  <button class="card metric" onclick="jump('dispatch')"><small>Unassigned jobs</small><strong style="color:var(--red)">${unassigned}</strong></button>
  <button class="card metric" onclick="jump('reports')"><small>Reports awaiting review</small><strong style="color:var(--blue)">${awaitingReview}</strong></button>
 </div>
 <div class="grid2">
  <div>
   <div class="briefing">
    <h3>✨ Taskyn AI Briefing</h3>
    <p>Good morning. You have ${JOBS.filter(j=>j.date==='Today').length} jobs today. ${JOBS.filter(j=>j.date==='Today').length-delayed} are on schedule. ${delayed} require attention.<br>
    Brian has completed ${JOBS.filter(j=>j.assignee==='brian'&&(j.status==='Completed'||j.status==='Approved'||j.status==='Awaiting Review')).length} of ${JOBS.filter(j=>j.assignee==='brian').length} assigned jobs.<br>
    ${delayedJob?`${teamById(delayedJob.assignee).name.split(' ')[0]}'s ${delayedJob.location} ${delayedJob.name.toLowerCase()} is currently ${delayedJob.delayMin} minutes behind schedule.`:'No jobs are currently behind schedule.'}</p>
    ${delayedJob?`<div class="rec"><span>Recommended: review the ${delayedJob.location} job.</span><button onclick="openJob(${delayedJob.id})">Review</button></div>`:''}
   </div>
   <div class="section" style="margin-top:14px">
    <div class="section-head"><h3>Live Operations Map</h3><span>Nairobi field team</span></div>
    <div class="pad"><div class="map" id="map"></div></div>
   </div>
  </div>
  <div class="section">
   <div class="section-head"><h3>Recent activity</h3><span>Live</span></div>
   <div class="pad">
    ${JOBS.flatMap(j=>j.timeline.map(t=>({...t,job:j.name}))).slice(-6).reverse().map(e=>`
     <div class="event"><div class="dot2"></div><div><b>${e.e}</b><p>${e.job} · ${e.t}</p></div></div>`).join('')}
   </div>
  </div>
 </div>`;
 drawMap();
}
function drawMap(){
 const m=document.getElementById('map');if(!m)return;m.innerHTML='';
 TEAM.forEach(t=>{
  const job=JOBS.find(j=>j.assignee===t.id&&!['Completed','Approved','Awaiting Review','Cancelled'].includes(j.status));
  const cls=t.status==='Delayed'?'delay':t.status==='Scheduled'?'sched':'on';
  const pin=document.createElement('div');pin.className='pin '+cls;
  pin.style.left=t.lng+'%';pin.style.top=t.lat+'%';pin.textContent=t.name.split(' ').map(n=>n[0]).join('');
  pin.innerHTML+=`<small>${t.name.split(' ')[0]} · ${job?job.location:'Available'}</small>`;
  pin.onclick=()=>job?openJob(job.id):toast(t.name+' has no active job right now.');
  m.appendChild(pin);
 });
}
function jump(v,filter){jobFilter=filter||'All';goTo(v);}

/* ---------- DISPATCH ---------- */
let dragJobId=null;
function renderDispatch(){
 const unassigned=JOBS.filter(j=>j.status==='Unassigned');
 const assigned=JOBS.filter(j=>j.status!=='Unassigned'&&j.date==='Today');
 document.getElementById('dispatch').innerHTML=`
 <div class="toolbar"><div></div><button class="primary" onclick="openCreateJob()">+ Create job</button></div>
 <div class="dboard">
  <div class="section">
   <div class="section-head"><h3>Today's schedule</h3><span>${assigned.length} jobs</span></div>
   ${assigned.map(j=>`
    <div class="dispatchrow">
     <div>${j.time}</div>
     <div><span class="job">${j.name}</span><span class="sub">${customerById(j.customerId).name}</span></div>
     <div>${j.location}</div>
     <div><select onchange="reassignFromDispatch(${j.id},this.value)">${TEAM.map(t=>`<option value="${t.id}" ${t.id===j.assignee?'selected':''}>${t.name}</option>`).join('')}</select></div>
     <div><span class="pill ${statusColor(j.status,j.delayMin)}">${j.delayMin>0?j.delayMin+'m late':j.status}</span></div>
    </div>`).join('')}
  </div>
  <div>
   <div class="section" style="margin-bottom:14px">
    <div class="section-head"><h3>Unassigned</h3><span>drag to a team member</span></div>
    <div class="pad">
     ${unassigned.length?unassigned.map(j=>`
      <div class="unassigned-slot" draggable="true" ondragstart="dragJobId=${j.id};this.classList.add('dragging')" ondragend="this.classList.remove('dragging')">
       <b>${j.name}</b><br><span style="color:var(--muted)">${customerById(j.customerId).name} · ${j.location} · ${j.date} ${j.time}</span>
      </div>`).join(''):'<p style="font-size:12px;color:var(--muted)">You\'re all caught up — nothing unassigned.</p>'}
    </div>
   </div>
   <div class="section">
    <div class="section-head"><h3>Team</h3><span>drop here</span></div>
    <div class="pad">
     ${TEAM.map(t=>`
      <div class="teamdrop" id="drop-${t.id}" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="dropAssign(event,'${t.id}')">
       <span><b>${t.name}</b><br><span style="color:var(--muted);font-size:11px">${t.role}</span></span>
       <span class="pill ${t.status==='Delayed'?'amber':t.status==='Offline'?'gray':'green'}">${t.status}</span>
      </div>`).join('')}
    </div>
   </div>
  </div>
 </div>`;
}
function statusColor(s,delay){if(delay>0)return'amber';if(s==='Approved'||s==='Completed')return'green';if(s==='Unassigned')return'red';if(s==='Awaiting Review')return'amber';if(s==='Cancelled')return'gray';if(['In Progress','On Site'].includes(s))return'blue';return'gray';}
function dropAssign(e,teamId){
 e.preventDefault();document.getElementById('drop-'+teamId).classList.remove('over');
 const job=JOBS.find(j=>j.id===dragJobId);if(!job)return;
 job.assignee=teamId;job.status='Assigned';
 job.timeline.push({t:nowStr(),e:'Assigned to '+teamById(teamId).name});
 addNotification('blue','Task assigned',teamById(teamId).name+' has been assigned a new task: '+job.name+'.',job.id);
 toast('Task assigned successfully. '+teamById(teamId).name+' has been assigned to '+job.name+'.');
 renderDispatch();updateBadges();
}
function reassignFromDispatch(id,teamId){
 const job=JOBS.find(j=>j.id===id);const prev=job.assignee?teamById(job.assignee).name:'nobody';
 job.assignee=teamId;job.timeline.push({t:nowStr(),e:'Reassigned from '+prev+' to '+teamById(teamId).name});
 addNotification('blue','Task reassigned',teamById(teamId).name+' has been assigned '+job.name+'.',job.id);
 toast('Reassigned to '+teamById(teamId).name+'.');renderDispatch();
}

/* ---------- JOBS ---------- */
let jobFilter='All',jobSearch='';
function renderJobs(){
 const filters=['All','Unassigned','Assigned','Accepted','On Site','In Progress','Completed','Awaiting Review','Approved','Delayed','Cancelled'];
 let list=JOBS.filter(j=>{
  if(jobFilter==='All')return true;
  if(jobFilter==='Delayed')return j.delayMin>0;
  return j.status===jobFilter;
 });
 if(jobSearch){
  const q=jobSearch.toLowerCase();
  list=list.filter(j=>(j.name+customerById(j.customerId).name+j.location+(j.assignee?teamById(j.assignee).name:'')+j.status).toLowerCase().includes(q));
 }
 document.getElementById('jobs').innerHTML=`
 <div class="toolbar">
  <input class="search" placeholder="Search jobs, customers or locations..." oninput="jobSearch=this.value;renderJobs()" value="${jobSearch}">
  <button class="primary" onclick="openCreateJob()">+ Create job</button>
 </div>
 <div class="chips" style="margin-bottom:14px">${filters.map(f=>`<div class="chip ${f===jobFilter?'active':''}" onclick="jobFilter='${f}';renderJobs()">${f}</div>`).join('')}</div>
 <div class="jobcards">
  ${list.length?list.map(j=>`
  <div class="jobcard" onclick="openJob(${j.id})">
   <span class="pill ${statusColor(j.status,j.delayMin)}">${j.delayMin>0?j.delayMin+'m late':j.status}</span>
   <h3 style="margin-top:8px">${j.name}</h3>
   <div class="meta">${customerById(j.customerId).name} · ${j.location} · ${j.date} ${j.time}</div>
   <div class="progress"><span style="width:${j.progress}%"></span></div>
   <div class="jobfoot"><span class="person">${j.assignee?'Assigned to <strong>'+teamById(j.assignee).name+'</strong>':'Unassigned'}</span><button class="secondary" onclick="event.stopPropagation();openJob(${j.id})">View</button></div>
  </div>`).join(''):'<p style="color:var(--muted);font-size:13px">No results found for this search or filter.</p>'}
 </div>`;
}

/* ---------- JOB DETAIL MODAL ---------- */
const STAGES=['Created','Assigned','Accepted','On Site','In Progress','Completed','Reviewed'];
function stageIndex(j){
 const map={'Unassigned':0,'Assigned':1,'Accepted':2,'On Site':3,'In Progress':4,'Completed':5,'Awaiting Review':5,'Approved':6,'Cancelled':0};
 return map[j.status]??0;
}
function openJob(id){
 const j=JOBS.find(x=>x.id===id);const cur=stageIndex(j);const cust=customerById(j.customerId);
 document.getElementById('modalbody').innerHTML=`
 <div class="modalhead"><h2>${j.name}</h2><button class="close" onclick="closeModal()">×</button></div>
 <p style="color:var(--muted);font-size:12px;margin:4px 0 0">${cust.name} · ${j.location} · <span class="pill ${statusColor(j.status,j.delayMin)}">${j.status}</span></p>
 ${j.status!=='Cancelled'?`<div class="stage">${STAGES.map((s,i)=>`<div class="${i<cur?'done':i===cur?'current':''}">${s}</div>`).join('')}</div>
 <div class="progress" style="margin-bottom:14px"><span style="width:${j.progress}%"></span></div>`:'<p style="margin-top:14px;color:var(--muted);font-size:12px">This job was cancelled.</p>'}
 <div class="section-head" style="padding:0;border:0;margin-bottom:6px"><h3 style="font-size:13px">Timeline</h3></div>
 ${j.timeline.map(t=>`<div class="event"><div class="dot2"></div><div><b>${t.e}</b><p>${t.t}</p></div></div>`).join('')}
 ${j.report?`<div class="aireport"><span class="tag">GENERATED BY TASKYN AI · ${j.report.status}</span>${j.report.summary}<br><br><b>Materials:</b> ${j.report.materials.join(', ')}<br><span class="check">${j.report.confirmed?'✓ Customer confirmed':''} ${j.report.status==='Approved'?'✓ Manager approved':''}</span></div>`:''}
 <div class="modalactions">
  <button class="secondary" onclick="closeModal()">Close</button>
  ${!j.assignee&&j.status==='Unassigned'?`<button class="secondary" onclick="closeModal();jump('dispatch')">Assign in Dispatch</button>`:''}
  ${j.assignee&&!['Completed','Approved','Awaiting Review','Cancelled'].includes(j.status)?`<button class="secondary" onclick="reassign(${j.id})">Reassign</button>`:''}
  ${j.status==='Awaiting Review'?`<button class="secondary" onclick="requestChanges(${j.id});closeModal()">Request changes</button><button class="primary" onclick="approveReport(${j.id});closeModal()">Approve report</button>`:''}
  ${j.report?`<button class="primary" onclick="downloadReport(${j.id})">Download PDF</button>`:''}
  ${!['Completed','Approved','Cancelled'].includes(j.status)?`<button class="secondary" style="color:var(--red)" onclick="cancelJob(${j.id})">Cancel job</button>`:''}
 </div>`;
 document.getElementById('modal').classList.add('show');
}
function reassign(id){closeModal();jump('dispatch');toast('Use the dropdown next to this job in Dispatch to reassign it.');}
function downloadReport(id){toast('Completion report exported (demo PDF generated).');}
function cancelJob(id){
 confirmDialog('Are you sure you want to cancel this job?',()=>{
  const j=JOBS.find(x=>x.id===id);j.status='Cancelled';j.timeline.push({t:nowStr(),e:'Cancelled by manager'});
  toast('Job cancelled.');closeModal();render(document.querySelector('.nav button.active').dataset.v);
 });
}
function closeModal(){document.getElementById('modal').classList.remove('show');}

/* ---------- CONFIRM DIALOG ---------- */
function confirmDialog(msg,onConfirm){
 document.getElementById('modalbody').innerHTML=`
 <div class="modalhead"><h2>Please confirm</h2><button class="close" onclick="closeModal()">×</button></div>
 <p style="font-size:13px;color:var(--text);margin-top:10px">${msg}</p>
 <div class="modalactions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" id="confirmbtn">Confirm</button></div>`;
 document.getElementById('confirmbtn').onclick=onConfirm;
 document.getElementById('modal').classList.add('show');
}

/* ---------- CREATE JOB ---------- */
function openCreateJob(prefillCustomerId){
 document.getElementById('modalbody').innerHTML=`
 <div class="modalhead"><h2>Create new job</h2><button class="close" onclick="closeModal()">×</button></div>
 <div class="form">
  <div class="field"><label>Customer</label><select id="f-customer">${CUSTOMERS.map(c=>`<option value="${c.id}" ${c.id===prefillCustomerId?'selected':''}>${c.name}</option>`).join('')}</select></div>
  <div class="field"><label>Service</label><input id="f-service" placeholder="e.g. Garden Maintenance"></div>
  <div class="field"><label>Location</label><input id="f-location" placeholder="e.g. Karen" value="${prefillCustomerId?customerById(prefillCustomerId).location:''}"></div>
  <div class="field"><label>Priority</label><select id="f-priority"><option>Normal</option><option>High</option><option>Urgent</option></select></div>
  <div class="field"><label>Date</label><select id="f-date"><option>Today</option><option>Tomorrow</option></select></div>
  <div class="field"><label>Time</label><input id="f-time" placeholder="e.g. 10:00 AM"></div>
  <div class="field full"><label>Assign to</label><select id="f-assignee"><option value="">Leave unassigned</option>${TEAM.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select></div>
  <div class="field full"><label>Instructions</label><textarea id="f-notes" placeholder="Optional notes"></textarea></div>
 </div>
 <div class="modalactions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" id="createbtn" onclick="createJob()">Create & Dispatch</button></div>`;
 document.getElementById('modal').classList.add('show');
}
function createJob(){
 const btn=document.getElementById('createbtn');btn.textContent='Creating task...';btn.disabled=true;
 /* capture form values now — the modal may be reused before the delay below finishes */
 const customerId=document.getElementById('f-customer').value;
 const s=document.getElementById('f-service').value||'New job';
 const l=document.getElementById('f-location').value||customerById(customerId).location;
 const time=document.getElementById('f-time').value||'Today';
 const a=document.getElementById('f-assignee').value;
 const priority=document.getElementById('f-priority').value;
 const date=document.getElementById('f-date').value;
 setTimeout(()=>{
  const job=mkJob({name:s,customerId,location:l,assignee:a||null,status:a?'Assigned':'Unassigned',priority,
   date,time,timeline:[{t:nowStr(),e:'Task created from customer request'}]});
  if(a)job.timeline.push({t:nowStr(),e:'Assigned to '+teamById(a).name});
  JOBS.push(job);closeModal();
  addNotification('blue','Task created','New task created: '+job.name+(a?' — assigned to '+teamById(a).name+'.':' — awaiting assignment.'),job.id);
  toast(a?`Task created successfully. Task has been assigned to ${teamById(a).name}.`:'Task created successfully — awaiting assignment.');
  render(document.querySelector('.nav button.active').dataset.v);updateBadges();
 },500);
}

/* ---------- TEAM ---------- */
let teamSearch='',teamFilter='All';
function renderTeam(){
 document.getElementById('team').innerHTML=`
 <div class="toolbar"><input class="search" placeholder="Search team by name or role..." oninput="teamSearch=this.value;renderTeam()" value="${teamSearch||''}"><button class="primary" onclick="toast('Team invite flow opened.')">+ Add team member</button></div>
 <div class="chips" style="margin-bottom:14px">${['All','Active','On site','Busy','Available','Delayed','Offline'].map(f=>`<div class="chip ${f===(teamFilter||'All')?'active':''}" onclick="teamFilter='${f}';renderTeam()">${f}</div>`).join('')}</div>
 <div class="teamgrid">${TEAM.filter(t=>(!teamFilter||teamFilter==='All'||t.status===teamFilter)&&(!teamSearch||(t.name+t.role).toLowerCase().includes(teamSearch.toLowerCase()))).map(t=>{
  const tj=JOBS.filter(j=>j.assignee===t.id);
  const done=tj.filter(j=>['Completed','Approved','Awaiting Review'].includes(j.status)).length;
  const rate=tj.length?Math.round(done/tj.length*100):100;
  return `<div class="personcard">
   <div class="personhead"><div class="personavatar">${t.avatar}</div><div><h3>${t.name}</h3><p>${t.role} · <span style="color:${t.status==='Delayed'?'var(--amber)':t.status==='Offline'?'var(--muted)':'var(--green)'}">${t.status}</span></p></div></div>
   <div class="stats"><div>Jobs today<strong>${tj.length}</strong></div><div>Completed<strong>${done}</strong></div><div>Completion rate<strong>${rate}%</strong></div></div>
   <div class="modalactions" style="margin-top:14px"><button class="secondary" onclick="openTeamProfile('${t.id}')">View profile</button></div>
  </div>`;}).join('')}</div>`;
}
function openTeamProfile(id){
 const t=teamById(id);const tj=JOBS.filter(j=>j.assignee===id);
 document.getElementById('modalbody').innerHTML=`
 <div class="modalhead"><h2>${t.name}</h2><button class="close" onclick="closeModal()">×</button></div>
 <p style="color:var(--muted);font-size:12px;margin:4px 0 14px">${t.role} · ${t.status}</p>
 <div class="section-head" style="padding:0;border:0"><h3 style="font-size:13px">Jobs</h3></div>
 ${tj.length?tj.map(j=>`<div class="event"><div class="dot2"></div><div><b>${j.name}</b><p>${j.location} · ${j.date} · <span class="pill ${statusColor(j.status,j.delayMin)}">${j.status}</span></p></div></div>`).join(''):'<p style="font-size:12px;color:var(--muted)">No jobs assigned yet.</p>'}
 <div class="modalactions"><button class="secondary" onclick="closeModal()">Close</button><button class="primary" onclick="closeModal();jump('dispatch')">Assign task</button></div>`;
 document.getElementById('modal').classList.add('show');
}

/* ---------- CUSTOMERS ---------- */
let customerSearch='';
function renderCustomers(){
 const list=CUSTOMERS.filter(c=>!customerSearch||(c.name+c.phone+c.location).toLowerCase().includes(customerSearch.toLowerCase()));
 document.getElementById('customers').innerHTML=`
 <div class="toolbar"><input class="search" placeholder="Search customers by name, phone or location..." oninput="customerSearch=this.value;renderCustomers()" value="${customerSearch}"><button class="primary" onclick="toast('New customer flow opened.')">+ Add customer</button></div>
 <div class="teamgrid">${list.length?list.map(c=>{
  const cj=JOBS.filter(j=>j.customerId===c.id);
  return `<div class="personcard" style="cursor:pointer" onclick="openCustomer('${c.id}')">
   <div class="personhead"><div class="personavatar">${c.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div><h3>${c.name}</h3><p>${c.location}</p></div></div>
   <div class="stats"><div>Jobs<strong>${cj.length}</strong></div><div>Active<strong>${cj.filter(j=>!['Completed','Approved','Cancelled'].includes(j.status)).length}</strong></div><div>Completed<strong>${cj.filter(j=>['Completed','Approved','Awaiting Review'].includes(j.status)).length}</strong></div></div>
  </div>`;}).join(''):'<p style="color:var(--muted);font-size:13px">No results found.</p>'}</div>`;
}
function openCustomer(id){
 const c=customerById(id);const cj=JOBS.filter(j=>j.customerId===id);
 document.getElementById('modalbody').innerHTML=`
 <div class="modalhead"><h2>${c.name}</h2><button class="close" onclick="closeModal()">×</button></div>
 <p style="color:var(--muted);font-size:12px;margin:4px 0 14px">${c.phone} · ${c.email} · ${c.location}</p>
 <div class="section-head" style="padding:0;border:0"><h3 style="font-size:13px">Service history</h3></div>
 ${cj.length?cj.map(j=>`<div class="event"><div class="dot2"></div><div><b>${j.name}</b><p>${j.date} · ${j.time} · <span class="pill ${statusColor(j.status,j.delayMin)}">${j.status}</span></p></div></div>`).join(''):'<p style="font-size:12px;color:var(--muted)">No jobs yet.</p>'}
 <div class="modalactions"><button class="secondary" onclick="closeModal()">Close</button><button class="primary" onclick="closeModal();openCreateJob('${c.id}')">Create task</button></div>`;
 document.getElementById('modal').classList.add('show');
}

/* ---------- SCHEDULE ---------- */
function renderSchedule(){
 const days=[...new Set(JOBS.map(j=>j.date))].filter(d=>d==='Today'||d==='Tomorrow');
 window._schedDay=window._schedDay&&days.includes(window._schedDay)?window._schedDay:(days[0]||'Today');
 const dayJobs=JOBS.filter(j=>j.date===window._schedDay&&j.status!=='Cancelled').sort((a,b)=>a.time.localeCompare(b.time));
 document.getElementById('schedule').innerHTML=`
 <div class="chips" style="margin-bottom:14px">${days.map(d=>`<div class="chip ${d===window._schedDay?'active':''}" onclick="window._schedDay='${d}';renderSchedule()">${d}</div>`).join('')}</div>
 <div class="section">${dayJobs.length?dayJobs.map(j=>`
  <div class="dispatchrow" style="grid-template-columns:70px 1fr 1fr 100px;cursor:pointer" onclick="openJob(${j.id})">
   <div><b>${j.time}</b></div>
   <div><span class="job">${j.name}</span><span class="sub">${j.location}</span></div>
   <div>${j.assignee?teamById(j.assignee).name:'Unassigned'}</div>
   <div><span class="pill ${statusColor(j.status,j.delayMin)}">${j.status}</span></div>
  </div>`).join(''):`<div class="pad" style="text-align:center;padding:40px"><b>Nothing scheduled.</b><p style="color:var(--muted);font-size:12px">No jobs for ${window._schedDay}.</p></div>`}
 </div>`;
}

/* ---------- ISSUES ---------- */
function renderIssues(){
 const overdue=JOBS.filter(j=>j.delayMin>0);
 const missingReport=JOBS.filter(j=>j.missingReport);
 const unassigned=JOBS.filter(j=>j.status==='Unassigned');
 const all=[...overdue.map(j=>({j,cls:'',title:j.delayMin+' minutes overdue',cat:'Overdue',type:'overdue'})),
  ...missingReport.map(j=>({j,cls:'amberline',title:'Completion report not submitted',cat:'Missing report',type:'missing'})),
  ...unassigned.map(j=>({j,cls:'blueline',title:'No team member assigned',cat:'Unassigned',type:'unassigned'}))];
 document.getElementById('issues').innerHTML=all.length?`<div class="issuegrid">${all.map(i=>`
  <div class="issuecard ${i.cls}">
   <div style="cursor:pointer" onclick="openJob(${i.j.id})"><h4>${i.j.name} — ${i.j.location}</h4><p>${i.cat} · ${i.title}</p></div>
   <div style="display:flex;gap:8px;align-items:center"><span class="pill gray">${customerById(i.j.customerId).name}</span><button class="secondary" onclick="resolveIssue(${i.j.id},'${i.type}')">Resolve</button></div>
  </div>`).join('')}</div>`:`<div class="section pad" style="text-align:center;padding:40px"><b>You're all caught up.</b><p style="color:var(--muted);font-size:12px">No jobs currently require attention.</p><button class="secondary" style="margin-top:10px" onclick="jump('jobs')">View all jobs</button></div>`;
}
function resolveIssue(id,type){
 const j=JOBS.find(x=>x.id===id);
 if(type==='unassigned'){closeModal();jump('dispatch');toast('Assign a team member to resolve this issue.');return;}
 if(type==='missing'){addNotification('amber','Reminder sent',teamById(j.assignee)?.name+' was reminded to submit the completion report for '+j.name+'.',j.id);toast('Reminder sent to '+(teamById(j.assignee)?.name||'the team')+'.');}
 if(type==='overdue'){addNotification('red','Escalated',j.name+' has been escalated to the site supervisor.',j.id);toast('Issue escalated. Supervisor notified.');}
 renderIssues();
}

/* ---------- REPORTS ---------- */
function renderReports(){
 const withStatus=JOBS.filter(j=>j.report);
 const pending=withStatus.filter(j=>j.report.status==='Pending Review');
 document.getElementById('reports').innerHTML=`
 <div class="reportgrid">
  <div class="report"><h3>Jobs completed</h3><div class="big">${JOBS.filter(j=>['Completed','Approved','Awaiting Review'].includes(j.status)).length}</div><div class="bar"><span style="width:70%"></span></div></div>
  <div class="report"><h3>Reports submitted</h3><div class="big">${withStatus.length}</div><div class="bar"><span style="width:80%"></span></div></div>
  <div class="report"><h3>Awaiting your review</h3><div class="big">${pending.length}</div><div class="bar"><span style="width:${pending.length?40:0}%"></span></div></div>
  <div class="report"><h3>Avg. completion time</h3><div class="big">1.8 days</div><div class="bar"><span style="width:76%"></span></div></div>
 </div>
 <div class="section" style="margin-top:14px"><div class="section-head"><h3>Completion reports</h3><span>AI-generated summaries</span></div>
  <div class="tablewrap"><table><thead><tr><th>Job</th><th>Team member</th><th>Status</th><th></th></tr></thead><tbody>
  ${withStatus.map(j=>`<tr class="rowlink" onclick="openJob(${j.id})"><td><span class="job">${j.name}</span><span class="sub">${j.location} · ${customerById(j.customerId).name}</span></td><td>${j.assignee?teamById(j.assignee).name:'—'}</td><td><span class="pill ${j.report.status==='Approved'?'green':j.report.status==='Changes Requested'?'red':'amber'}">${j.report.status}</span></td><td>${j.report.status==='Pending Review'?`<button class="secondary" onclick="event.stopPropagation();approveReport(${j.id})">Approve</button> <button class="secondary" onclick="event.stopPropagation();requestChanges(${j.id})">Changes</button>`:`<button class="secondary" onclick="event.stopPropagation();openJob(${j.id})">View</button>`}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}
function approveReport(id){
 const j=JOBS.find(x=>x.id===id);j.report.status='Approved';j.status='Approved';
 j.timeline.push({t:nowStr(),e:'Manager approved report'});
 addNotification('green','Report approved',j.name+' has been approved and sent to the customer.',j.id);
 toast('Report approved.');render(document.querySelector('.nav button.active').dataset.v);
}
function requestChanges(id){
 const j=JOBS.find(x=>x.id===id);j.report.status='Changes Requested';j.status='In Progress';
 j.timeline.push({t:nowStr(),e:'Manager requested changes to the completion report'});
 addNotification('amber','Changes requested',teamById(j.assignee)?.name+' needs to update the '+j.name+' report.',j.id);
 toast('Changes requested — sent back to '+(teamById(j.assignee)?.name||'the worker')+'.');render(document.querySelector('.nav button.active').dataset.v);
}

/* ---------- ANALYTICS ---------- */
function renderAnalytics(){
 const total=JOBS.length;
 const byStatus={};STATUS_ORDER.forEach(s=>byStatus[s]=JOBS.filter(j=>j.status===s).length);
 const completed=byStatus['Completed']+byStatus['Approved']+byStatus['Awaiting Review'];
 const onTimeRate=Math.round((total-JOBS.filter(j=>j.delayMin>0).length)/total*100);
 const maxStatus=Math.max(...Object.values(byStatus),1);
 document.getElementById('analytics').innerHTML=`
 <div class="reportgrid">
  <div class="report"><h3>Total jobs</h3><div class="big">${total}</div></div>
  <div class="report"><h3>Completed</h3><div class="big">${completed}</div></div>
  <div class="report"><h3>On-time completion</h3><div class="big">${onTimeRate}%</div></div>
  <div class="report"><h3>Delayed</h3><div class="big" style="color:var(--amber)">${JOBS.filter(j=>j.delayMin>0).length}</div></div>
 </div>
 <div class="grid2" style="margin-top:14px">
  <div class="section"><div class="section-head"><h3>Jobs by status</h3><span>current workspace</span></div><div class="pad">
   ${STATUS_ORDER.map(s=>`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:4px"><span>${s}</span><span>${byStatus[s]}</span></div><div class="bar"><span style="width:${byStatus[s]/maxStatus*100}%"></span></div></div>`).join('')}
  </div></div>
  <div class="section"><div class="section-head"><h3>Team performance</h3><span>completed jobs</span></div><div class="pad">
   ${TEAM.map(t=>{const c=JOBS.filter(j=>j.assignee===t.id&&['Completed','Approved','Awaiting Review'].includes(j.status)).length;const max=Math.max(...TEAM.map(t2=>JOBS.filter(j=>j.assignee===t2.id&&['Completed','Approved','Awaiting Review'].includes(j.status)).length),1);
   return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:4px"><span>${t.name}</span><span>${c}</span></div><div class="bar"><span style="width:${c/max*100}%"></span></div></div>`;}).join('')}
  </div></div>
 </div>`;
}

/* ---------- ASK TASKYN ---------- */
const PROMPTS=['Which jobs are delayed today?','Who is available right now?','How many jobs did Brian complete?','Which reports are awaiting approval?','What needs my attention?','Summarize today\'s operations.'];
function renderAsk(){
 document.getElementById('ask').innerHTML=`
 <div class="chatwrap">
  <div class="chatmsgs" id="chatmsgs"><div class="msg ai"><span class="tag">TASKYN</span>Ask me anything about today's operations — delays, workload, reports, or what needs your attention.</div></div>
  <div class="suggests">${PROMPTS.map(p=>`<button onclick="askTaskyn('${p}')">${p}</button>`).join('')}</div>
  <div class="chatinput"><input id="askinput" placeholder="Ask Taskyn..." onkeydown="if(event.key==='Enter')askTaskyn(this.value)"><button class="primary" onclick="askTaskyn(document.getElementById('askinput').value)">Ask</button></div>
 </div>`;
}
function askTaskyn(q){
 if(!q)return;
 const box=document.getElementById('chatmsgs');
 box.innerHTML+=`<div class="msg user">${q}</div>`;
 let a='';const ql=q.toLowerCase();
 const delayed=JOBS.filter(j=>j.delayMin>0);
 const unassigned=JOBS.filter(j=>j.status==='Unassigned');
 const pendingReports=JOBS.filter(j=>j.report&&j.report.status==='Pending Review');
 if(ql.includes('delay')){
  a=delayed.length?`${delayed.length} job${delayed.length>1?'s':''} need attention.<br>`+delayed.map(j=>`• ${j.name} — ${j.location}, ${j.delayMin} minutes behind schedule.`).join('<br>')+'<br><br>I recommend reviewing this first.':'No jobs are currently delayed. You\'re all caught up.';
 }else if(ql.includes('available')||ql.includes('right now')){
  a=TEAM.filter(t=>t.status==='Available'||t.status==='Active').map(t=>`• ${t.name} — ${t.status}`).join('<br>')||'No one is currently free.';
 }else if(ql.includes('brian')){
  const c=JOBS.filter(j=>j.assignee==='brian'&&['Completed','Approved','Awaiting Review'].includes(j.status)).length;
  a=`Brian has completed ${c} job${c!==1?'s':''} so far, including garden maintenance in Karen.`;
 }else if(ql.includes('awaiting approval')||ql.includes('reports')){
  a=pendingReports.length?pendingReports.map(j=>`• ${j.name} — ${j.location}, submitted by ${teamById(j.assignee)?.name}.`).join('<br>'):'No reports are currently awaiting your approval.';
 }else if(ql.includes('attention')){
  const items=[...delayed.map(j=>j.name+' is delayed'),...unassigned.map(j=>j.name+' is unassigned'),...pendingReports.map(j=>j.name+' report needs review')];
  a=items.length?'Here\'s what needs your attention:<br>'+items.map(i=>'• '+i).join('<br>'):'Nothing needs your attention right now — everything is on track.';
 }else if(ql.includes('summar')){
  a=`Today: ${JOBS.filter(j=>j.date==='Today').length} jobs tracked, ${JOBS.filter(j=>j.date==='Today'&&['Completed','Approved','Awaiting Review'].includes(j.status)).length} completed, ${delayed.length} delayed, ${unassigned.length} awaiting assignment. Overall the team is on pace against target.`;
 }else{
  a="I don't have enough information in the current workspace to answer that yet. Try asking about delays, availability, reports, or today's summary.";
 }
 box.innerHTML+=`<div class="msg ai"><span class="tag">TASKYN</span>${a}</div>`;
 box.scrollTop=box.scrollHeight;
 document.getElementById('askinput').value='';
}

/* ---------- WORKER VIEW ---------- */
function renderWorker(){
 const j=JOBS.find(x=>x.id===currentWorkerJob)||JOBS.find(x=>x.assignee);
 const cust=customerById(j.customerId);
 document.getElementById('worker').innerHTML=`
 <div class="worker">
  <select onchange="currentWorkerJob=Number(this.value);renderWorker()" style="border:1px solid var(--line);border-radius:9px;padding:8px;margin-bottom:14px;width:100%">
   ${JOBS.filter(j2=>j2.assignee&&j2.status!=='Cancelled').map(j2=>`<option value="${j2.id}" ${j2.id===j.id?'selected':''}>${j2.name} — ${j2.location}</option>`).join('')}
  </select>
  <h2>${j.name}</h2>
  <div class="wmeta">${j.location} · ${j.date} ${j.time} · ${cust.name}</div>
  <span class="pill ${statusColor(j.status,j.delayMin)}">${j.status}</span>
  ${j.status==='Assigned'?`<button class="bigbtn" onclick="acceptJob(${j.id})">ACCEPT JOB</button>`:''}
  ${j.status==='Accepted'?`<button class="bigbtn" onclick="startJob(${j.id})">START JOB</button>`:''}
  ${['On Site','In Progress'].includes(j.status)?`
   <div style="margin-top:16px"><b style="font-size:12px">Progress — ${j.progress}%</b><div class="progress" style="margin-top:6px"><span style="width:${j.progress}%"></span></div></div>
   <div class="wgrid">
    <button onclick="setProgress(${j.id},25)">25%</button><button onclick="setProgress(${j.id},50)">50%</button>
    <button onclick="setProgress(${j.id},75)">75%</button><button onclick="setProgress(${j.id},100)">100%</button>
   </div>
   <div class="wgrid">
    <button onclick="toast('Photo captured and attached.')">📷 Add photo</button>
    <button onclick="toast('Note added to job.')">📝 Add note</button>
    <button onclick="reportIssue(${j.id})">⚠ Report issue</button>
    <button onclick="toast('Materials logged: Fertilizer 2kg.')">🧾 Materials</button>
   </div>
   <button class="bigbtn secondary2" onclick="openCompleteFlow(${j.id})">Complete Job</button>`:''}
  ${['Completed','Awaiting Review','Approved'].includes(j.status)?`<div class="check">✓ Job completed</div>${j.report?`<div class="aireport"><span class="tag">GENERATED BY TASKYN AI · ${j.report.status}</span>${j.report.summary}</div>`:'<p style="font-size:12px;color:var(--muted)">Completion report pending.</p>'}`:''}
 </div>`;
}
function acceptJob(id){const j=JOBS.find(x=>x.id===id);j.status='Accepted';j.timeline.push({t:nowStr(),e:teamById(j.assignee).name.split(' ')[0]+' accepted task'});toast('Task accepted.');renderWorker();}
function startJob(id){
 const j=JOBS.find(x=>x.id===id);j.status='On Site';j.progress=10;
 j.timeline.push({t:nowStr(),e:teamById(j.assignee).name.split(' ')[0]+' arrived on site'});toast('Job started at '+nowStr());renderWorker();
}
function setProgress(id,pct){
 const j=JOBS.find(x=>x.id===id);j.progress=pct;j.status='In Progress';
 j.timeline.push({t:nowStr(),e:'Progress updated to '+pct+'%'});toast('Progress updated to '+pct+'%');renderWorker();
}
function reportIssue(id){
 const j=JOBS.find(x=>x.id===id);j.timeline.push({t:nowStr(),e:'Worker reported an issue on site'});
 addNotification('red','Issue reported',teamById(j.assignee).name+' reported an issue on '+j.name+'.',j.id);
 toast('Issue flagged — manager notified.');
}
function openCompleteFlow(id){
 document.getElementById('modalbody').innerHTML=`
 <div class="modalhead"><h2>Complete job</h2><button class="close" onclick="closeModal()">×</button></div>
 <div class="form">
  <div class="field full"><label>Work completed</label><textarea id="c-notes" placeholder="e.g. grass cut. hedges done. some dry plants. customer asked us to come back next week."></textarea></div>
  <div class="field full"><label>Materials used</label><input id="c-materials" placeholder="e.g. Fertilizer — 2kg, Grass seed — 1kg"></div>
  <div class="field full"><label>Issues encountered (optional)</label><input id="c-issues" placeholder="Any problems on site?"></div>
  <div class="field full"><label><input type="checkbox" id="c-confirm" checked style="width:auto;margin-right:6px">Customer confirmed completion</label></div>
 </div>
 <div class="modalactions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" id="completebtn" onclick="submitCompletion(${id})">Submit Completion Report</button></div>`;
 document.getElementById('modal').classList.add('show');
}
function submitCompletion(id){
 const btn=document.getElementById('completebtn');btn.textContent='Generating report...';btn.disabled=true;
 /* capture form values now — the modal may be reused before the delay below finishes */
 const notes=document.getElementById('c-notes').value||'Work completed as scheduled.';
 const materials=(document.getElementById('c-materials').value||'Standard supplies').split(',').map(s=>s.trim());
 const confirmed=document.getElementById('c-confirm').checked;
 setTimeout(()=>{
  const j=JOBS.find(x=>x.id===id);j.status='Awaiting Review';j.progress=100;
  j.timeline.push({t:nowStr(),e:'Completion report submitted'});
  j.report={summary:generateAISummary(notes),materials,confirmed,status:'Pending Review'};
  addNotification('amber','Report awaiting review',j.name+' completion report is ready for your approval.',j.id);
  closeModal();toast('Completion report submitted successfully.');renderWorker();updateBadges();
 },600);
}
function generateAISummary(raw){
 let s=raw.trim().replace(/\\.\\s*/g,'. ');
 s=s.charAt(0).toUpperCase()+s.slice(1);
 if(!/[.!]$/.test(s))s+='.';
 return 'Work was completed successfully on site. '+s+' The team confirmed the site was left in good condition.';
}

/* ---------- NOTIFICATIONS ---------- */
function toggleNotif(){
 const p=document.getElementById('notifpanel');
 if(p.classList.contains('show')){p.classList.remove('show');return;}
 renderNotifPanel();p.classList.add('show');
}
function renderNotifPanel(){
 const p=document.getElementById('notifpanel');
 p.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--line)"><b style="font-size:12px">Notifications</b><button class="secondary" style="padding:5px 9px;font-size:11px" onclick="markAllRead()">Mark all read</button></div>`+
  (NOTIFICATIONS.length?NOTIFICATIONS.map(n=>`<div class="notifitem" style="${n.read?'opacity:.55':''}" onclick="markRead(${n.id});toggleNotif();openJob(${n.jobId})"><span class="pill ${n.type}">${n.title}</span><div><p>${n.msg}</p></div></div>`).join(''):'<div class="notifitem"><p>No notifications yet.</p></div>');
}
function markRead(id){const n=NOTIFICATIONS.find(x=>x.id===id);if(n)n.read=true;updateBadges();}
function markAllRead(){NOTIFICATIONS.forEach(n=>n.read=true);renderNotifPanel();updateBadges();toast('All notifications marked as read.');}
function updateBadges(){
 const unread=NOTIFICATIONS.filter(n=>!n.read).length;
 document.querySelector('.iconbtn .dot').style.display=unread?'block':'none';
 document.getElementById('wsjobs').textContent=JOBS.filter(j=>!['Completed','Approved','Cancelled'].includes(j.status)).length+' active field jobs';
}

/* ---------- WORKSPACES ---------- */
const WORKSPACES=['Crystal Gardens','Nairobi Cleaning Co.','Swift Logistics','Prime Property Management'];
let wsIdx=0;
function switchWorkspace(){
 wsIdx=(wsIdx+1)%WORKSPACES.length;
 document.getElementById('wsname').textContent=WORKSPACES[wsIdx];
 toast('Switched workspace to '+WORKSPACES[wsIdx]+' (demo data).');
}

/* ---------- UTIL ---------- */
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>t.classList.remove('show'),2800);}
function nowStr(){const d=new Date();return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');}
function resetDemo(){confirmDialog('Reset the demo workspace? This restores the original mock data.',()=>location.reload());}
document.addEventListener('click',e=>{if(!e.target.closest('.notifpanel')&&!e.target.closest('.iconbtn'))document.getElementById('notifpanel').classList.remove('show');});

/* init */
updateBadges();
render('overview');
