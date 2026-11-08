/* =========================================================
   TASKYN V5 — core data & domain helpers
   All workspace data below is DEMONSTRATION data held in the browser.
   There is no backend, real GPS, payments, messaging or AI service unless
   configured in config.js (see README). Swap the arrays for API calls later.
   ========================================================= */

/* ---------- DATES (the demo is always anchored to the real "today") ---------- */
const TODAY0=(()=>{const d=new Date();d.setHours(0,0,0,0);return d})();
const offDate=n=>{const d=new Date(TODAY0);d.setDate(d.getDate()+n);return d};
const isoOf=n=>{const d=offDate(n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const REL={Today:0,Tomorrow:1,Yesterday:-1,'2 days ago':-2};
function dayOff(j){const v=typeof j==='object'?j.date:j;if(v in REL)return REL[v];const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v);return m?Math.round((new Date(+m[1],+m[2]-1,+m[3])-TODAY0)/864e5):0}
/* store a day offset the way V3/V4 code expects it: relative words for -2..+1, ISO otherwise */
const dayKey=n=>n===0?'Today':n===1?'Tomorrow':n===-1?'Yesterday':n===-2?'2 days ago':isoOf(n);
function setDay(j,n){j.date=dayKey(n)}
const dayLabel=n=>n===0?'Today':n===1?'Tomorrow':n===-1?'Yesterday':offDate(n).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
const dayLong=n=>offDate(n).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
const jobDay=j=>dayLabel(dayOff(j));
function mins(t){if(typeof t!=='string')return 540;const m=/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(t.trim());if(!m)return 540;let h=+m[1];const ap=(m[3]||'').toUpperCase();if(ap==='PM'&&h<12)h+=12;if(ap==='AM'&&h===12)h=0;return h*60+ +m[2]}
const hhmm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
function nowStr(){const d=new Date();return hhmm(d.getHours()*60+d.getMinutes())}
const ZONE={Karen:'South-West',"Lang'ata":'South-West',Kilimani:'Central',Kileleshwa:'Central',Lavington:'Central',Westlands:'North',Parklands:'North',Gigiri:'North-East',Runda:'North-East'};
const ZONE_ORDER=['South-West','Central','North','North-East'];
/* approximate neighbourhood centres (decimal degrees) used for the schematic/Google map */
const COORD={Karen:[-1.3197,36.7073],"Lang'ata":[-1.3556,36.7435],Kilimani:[-1.2902,36.7873],Kileleshwa:[-1.2760,36.7840],Lavington:[-1.2790,36.7700],Westlands:[-1.2672,36.8110],Parklands:[-1.2630,36.8200],Gigiri:[-1.2330,36.8050],Runda:[-1.2150,36.8130]};
const SKILLS={brian:['Lawn care','Garden maintenance','Tree pruning'],mercy:['Lawn care','Garden maintenance'],david:['Landscaping','Tree pruning','Supervision'],john:['Cleanup','Lawn care'],grace:['Irrigation','Landscaping','Equipment'],peter:['Landscaping','Tree pruning','Lawn care'],faith:['Garden design','Garden maintenance'],samuel:['Supervision','Cleanup','Irrigation']};
const ALL_SKILLS=['Lawn care','Garden maintenance','Garden design','Tree pruning','Landscaping','Irrigation','Cleanup','Equipment','Supervision','Pest control'];
/* weekly availability Mon..Sun */
const AVAIL={brian:[1,1,1,1,1,1,0],mercy:[1,1,1,1,1,1,0],david:[1,1,1,1,1,0,0],john:[1,1,1,1,1,1,0],grace:[1,1,1,1,1,0,0],peter:[1,1,1,1,1,1,0],faith:[1,1,1,1,1,0,0],samuel:[1,1,1,1,1,1,1]};

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
function mkJob(o){return Object.assign({id:idSeq++,priority:'Normal',progress:0,delayMin:0,timeline:[],report:null,est:null,charge:null,expenses:[],subtasks:[],dependsOn:[],skills:null,instructions:'',tplId:null,recurId:null,cust:{status:'none'},proof:{chk:{},photos:[],notes:[],mats:[]},issues:[]},o);}
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

/* ---------- TEMPLATES (reusable task templates; managed inside job creation) ---------- */
let TEMPLATES=[
 {id:'t1',name:'Garden Maintenance',price:8000,hours:3,skills:['Garden maintenance'],equipment:['Mower','Hedge trimmer'],materials:[{item:'Fertilizer',qty:2}],checklist:['Mow lawn','Trim hedges','Remove weeds','Inspect irrigation','Clean site','Take completion photos'],instructions:'Check in with the customer on arrival. Mow, edge and trim; bag all clippings. Photograph the site before and after.'},
 {id:'t2',name:'Lawn Maintenance',price:5000,hours:2,skills:['Lawn care'],equipment:['Mower'],materials:[{item:'Fertilizer',qty:1}],checklist:['Mow lawn','Edge borders','Remove clippings','Take completion photos'],instructions:'Mow at medium height. Keep clippings off paths and flower beds.'},
 {id:'t3',name:'Tree Pruning',price:6000,hours:3,skills:['Tree pruning'],equipment:['Saw','Ladder'],materials:[],checklist:['Inspect tree','Prune branches','Remove waste','Take completion photos'],instructions:'Inspect for dead wood first. Never prune within 3 m of power lines. Remove all cuttings.'},
 {id:'t4',name:'Irrigation Repair',price:9000,hours:2,skills:['Irrigation'],equipment:['Tool kit'],materials:[],checklist:['Locate leak','Repair line','Pressure test','Take completion photos'],instructions:'Isolate the zone before cutting any line. Pressure test for 10 minutes after repair.'},
 {id:'t5',name:'Landscape Installation',price:42000,hours:16,skills:['Landscaping'],equipment:['Vehicle','Tool kit'],materials:[{item:'Topsoil',qty:4}],checklist:['Site prep','Soil treatment','Planting','Cleanup','Take completion photos'],instructions:'Confirm the layout plan with the customer before digging. Multi-day job: log progress daily.'},
 {id:'t6',name:'Pest Control',price:7500,hours:2,skills:['Pest control'],equipment:['Sprayer'],materials:[{item:'Pesticide',qty:1}],checklist:['Inspect','Treat','Safety sign-off','Take completion photos'],instructions:'Wear protective gear. Keep children and pets away from treated areas for 2 hours.'}
];
let tplSeq=10;
const tplById=id=>TEMPLATES.find(t=>t.id===id);

/* ---------- OTHER DEMO MODELS ---------- */
const D={
 requests:[{id:1,cust:'Lucy Njeri',svc:'Lawn Maintenance',loc:'Karen',date:'Tomorrow',src:'WhatsApp',st:'New'},{id:2,cust:'Omar Hassan',svc:'Tree Pruning',loc:'Lavington',date:'Fri',src:'Website',st:'New'},{id:3,cust:'Acme Offices',svc:'Irrigation Repair',loc:'Westlands',date:'Today',src:'Phone',st:'Reviewing'},{id:4,cust:'Joy Kamau',svc:'Pest Control',loc:'Kilimani',date:'Sat',src:'Email',st:'New'},{id:5,cust:'Brian Odhiambo',svc:'Landscape Installation',loc:'Runda',date:'Next week',src:'Manual',st:'New'}],
 quotes:[{id:'Q-101',cust:'Jane Mwangi',svc:'Garden Maintenance',labour:8000,mat:3500,trans:1000,disc:0,tax:16,st:'Sent'},{id:'Q-102',cust:'Sarah Wanjiku',svc:'Landscape Installation',labour:42000,mat:28000,trans:3000,disc:5,tax:16,st:'Approved'},{id:'Q-103',cust:'Kevin Mutua',svc:'Tree Pruning',labour:6000,mat:0,trans:1500,disc:0,tax:16,st:'Viewed'},{id:'Q-104',cust:'Peter Kamotho',svc:'Irrigation Repair',labour:9000,mat:6500,trans:1200,disc:0,tax:16,st:'Draft'}],
 inv:[{id:'INV-2041',cust:'Alice Wanjiku',job:'Lawn & Hedge Service',amt:12400,st:'Paid',paid:12400},{id:'INV-2042',cust:'Sarah Wanjiku',job:'Lawn Treatment',amt:9800,st:'Partially Paid',paid:4000},{id:'INV-2043',cust:'Jane Mwangi',job:'Monthly Garden Retainer',amt:18500,st:'Overdue',paid:0},{id:'INV-2044',cust:'Crystal Gardens HQ',job:'Weekly Grounds Check',amt:7200,st:'Sent',paid:0},{id:'INV-2045',cust:'Mary Achieng',job:'Driveway Landscaping',amt:31000,st:'Draft',paid:0}],
 stock:[{id:'s1',n:'Fertilizer',q:42,u:'kg',min:10,cost:180,sup:'AgriSupply Ltd',last:'12 days ago'},{id:'s2',n:'Grass seed',q:8,u:'kg',min:6,cost:450,sup:'GreenSeed Kenya',last:'3 weeks ago'},{id:'s3',n:'Topsoil',q:14,u:'bags',min:10,cost:350,sup:'Karen Soils',last:'1 week ago'},{id:'s4',n:'Pesticide',q:4,u:'L',min:4,cost:900,sup:'AgriSupply Ltd',last:'5 weeks ago'}],
 moves:[],
 equip:[{n:'Honda Mower #1',k:'Mower',cond:'Good',who:'Brian Kamau',loc:'Karen',last:'2 months ago',next:'In 1 month',st:'In use'},{n:'Hedge Trimmer #2',k:'Trimmer',cond:'Fair',who:'David Mwangi',loc:'Runda',last:'5 months ago',next:'Overdue',st:'Maintenance due'},{n:'Toyota Hilux',k:'Vehicle',cond:'Good',who:'Samuel Ndungu',loc:'Depot',last:'6 weeks ago',next:'In 2 weeks',st:'Available'},{n:'Generator 5kVA',k:'Generator',cond:'Good',who:'—',loc:'Depot',last:'3 months ago',next:'In 3 months',st:'Available'}],
 recur:[{id:'r1',tplName:'Garden Maintenance',custId:'c1',every:'Monthly',who:'brian',nextOff:6,active:true},{id:'r2',tplName:'Lawn Maintenance',custId:'c10',every:'Weekly',who:'samuel',nextOff:1,active:true},{id:'r3',tplName:'Lawn Maintenance',custId:'c3',every:'Biweekly',who:'mercy',nextOff:4,active:true}],
 sectors:['Landscaping','Cleaning','Maintenance','Pest Control','Security','Construction','Electrical','Plumbing','HVAC','Other']
};
const quoteTotal=q=>{const s=q.labour+q.mat+q.trans;const d=s*q.disc/100;return(s-d)*(1+q.tax/100)};

/* ---------- NOTIFICATIONS ---------- */
let NOTIFICATIONS=[
 {id:1,type:'red',cat:'job',title:'Overdue',msg:'Runda installation is 45 minutes late.',jobId:JOBS[1].id,read:false,t:'09:45',to:'manager'},
 {id:2,type:'amber',cat:'report',title:'Report required',msg:"John hasn't submitted the Kilimani report.",jobId:JOBS[3].id,read:false,t:'09:20',to:'manager'},
 {id:3,type:'green',cat:'job',title:'Completed',msg:'Mercy completed Lawn & Hedge Service.',jobId:JOBS[5].id,read:false,t:'Yesterday',to:'manager'},
 {id:4,type:'blue',cat:'job',title:'New request',msg:'New customer request — Hedge Trimming, Parklands.',jobId:JOBS[8].id,read:true,t:'12:10',to:'manager'},
 {id:5,type:'amber',cat:'report',title:'Report awaiting review',msg:'Flower Bed Design report is ready for your approval.',jobId:JOBS[11].id,read:false,t:'12:00',to:'manager'},
 {id:6,type:'blue',cat:'job',title:'New request',msg:"New customer request — Compound Cleanup, Lang'ata.",jobId:JOBS[10].id,read:true,t:'13:00',to:'manager'}
];
let notifSeq=100;
const NCATS={job:'Jobs',report:'Reports',stock:'Inventory',customer:'Customers',system:'System'};
/* to: 'manager' | 'supervisor' | 'worker:<teamId>' ; cat drives the filters on the Notifications page */
function addNotification(type,title,msg,jobId,o={}){if(typeof S!=='undefined'&&S.prefs&&S.prefs[o.cat||'job']===false)return null;const n={id:notifSeq++,type,title,msg,jobId:jobId??null,read:false,t:nowStr(),ts:Date.now(),cat:o.cat||'job',to:o.to||'manager',ref:o.ref||null};NOTIFICATIONS.unshift(n);if(NOTIFICATIONS.length>200)NOTIFICATIONS.length=200;return n}
const teamById=id=>TEAM.find(t=>t.id===id);
const customerById=id=>CUSTOMERS.find(c=>c.id===id);
const jobById=id=>JOBS.find(j=>j.id===id);
let currentWorkerId='brian';let currentWorkerJob=null;

/* ---------- SEED ENRICHMENT (costing, estimates, instructions, extra jobs) ---------- */
const EST={'Garden Maintenance':3,'Landscape Installation':8,'Lawn Service':2,'Garden Cleanup':2,'Tree Pruning':3,'Lawn & Hedge Service':3,'New Lawn Installation':5,'Irrigation Repair':2,'Hedge Trimming':2,'Estate Grounds Service':4,'Compound Cleanup':3,'Flower Bed Design':3,'Monthly Garden Retainer':3,'Pest Control Treatment':2,'Lawn Treatment':2,'Driveway Landscaping':4,'Weekly Grounds Check':2,'Tree Removal':3,'Garden Consultation':1,'Seasonal Cleanup':3};
const SEED_CHARGE={'Lawn & Hedge Service':12400,'Lawn Treatment':9800,'Monthly Garden Retainer':18500,'Weekly Grounds Check':7200,'Driveway Landscaping':31000};
const SEED_PHONE={brian:'0722 301 101',mercy:'0733 301 102',david:'0711 301 103',john:'0700 301 104',grace:'0722 301 105',peter:'0733 301 106',faith:'0711 301 107',samuel:'0700 301 108'};
TEAM.forEach(t=>{t.phone=SEED_PHONE[t.id]});
const hashN=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
function tplFor(j){return tplById(j.tplId)||TEMPLATES.find(t=>t.name===j.name)||TEMPLATES.find(t=>j.name.toLowerCase().includes(t.name.split(' ')[0].toLowerCase()))||TEMPLATES[0]}
function seedCosting(j){
 if(j.charge==null){const t=TEMPLATES.find(x=>x.name===j.name);j.charge=SEED_CHARGE[j.name]??(t?t.price:6000+((j.id*7)%14)*1200)}
 if(j.status==='Cancelled'||j.expenses.length||j.progress<=0)return;
 const pf=j.progress>=100?1:j.progress/100,r=v=>Math.round(v/50)*50;
 [['Labour',.32,'Crew labour'],['Material',.12,'Materials'],['Transport',.06,'Transport'],['Other',.03,'Sundries']].forEach(([cat,k,d],i)=>j.expenses.push({id:'e'+j.id+'-'+i,cat,desc:d+' (demo seed)',amt:r(j.charge*k*pf),seed:true,t:'Seed',date:isoOf(dayOff(j))}));
}
JOBS.forEach(j=>{
 j.est=j.est??EST[j.name]??tplFor(j).hours;
 const t=tplFor(j);j.skills=j.skills||t.skills.slice();j.instructions=j.instructions||t.instructions;
 j.subtasks=j.subtasks.length?j.subtasks:t.checklist.filter(c=>!/photo/i.test(c)).map((c,i)=>({id:'s'+j.id+'-'+i,title:c,done:['Completed','Awaiting Review','Approved'].includes(j.status)}));
 seedCosting(j);
});
/* a dependency + a late-start example */
const jobByName=n=>JOBS.find(j=>j.name===n);
jobByName('Irrigation Repair').dependsOn=[jobByName('New Lawn Installation').id];
jobByName('Estate Grounds Service').recurId='r2';
/* customer-approval states for the existing demo jobs */
jobByName('Lawn & Hedge Service').cust={status:'approved',rating:5,feedback:'Neat work, thank you.',at:'Yesterday 16:30',simulated:true};
jobByName('Lawn Treatment').cust={status:'awaiting'};jobByName('Weekly Grounds Check').cust={status:'awaiting'};
jobByName('Monthly Garden Retainer').cust={status:'awaiting'};

/* additional jobs so week/month views and report date filters have real data (ISO dates) */
(function(){
 const C=CUSTOMERS.map(c=>c.id),W=TEAM.filter(t=>t.id!=='faith').map(t=>t.id),svc=TEMPLATES;
 [[-3,'Lawn Maintenance'],[-4,'Garden Maintenance'],[-6,'Irrigation Repair'],[-7,'Lawn Maintenance'],[-9,'Tree Pruning'],[-10,'Garden Maintenance'],[-12,'Pest Control'],[-14,'Lawn Maintenance'],[-16,'Garden Maintenance'],[-19,'Tree Pruning'],[-21,'Irrigation Repair'],[-24,'Landscape Installation'],[-26,'Garden Maintenance'],[-29,'Lawn Maintenance']].forEach(([o,n],i)=>{
  const t=svc.find(x=>x.name===n),c=customerById(C[(i*5+2)%C.length]),w=W[(i*3+1)%W.length],late=i%4===1?25+i:0;
  const j=mkJob({name:n,customerId:c.id,location:c.location,assignee:w,status:'Approved',date:isoOf(o),time:['08:00','09:00','10:00','13:00'][i%4],progress:100,lateMin:late,tplId:t.id,
   timeline:[{t:isoOf(o).slice(5)+' 08:00',e:'Task created'},{t:isoOf(o).slice(5)+' 08:05',e:'Assigned to '+teamById(w).name},{t:isoOf(o).slice(5)+' 15:10',e:'Completion report submitted'},{t:isoOf(o).slice(5)+' 15:40',e:'Manager approved report'}],
   report:{summary:n+' was completed at the '+c.location+' property and the site was left tidy.',materials:['None'],confirmed:true,status:'Approved'},
   cust:{status:'approved',rating:i%5===2?4:5,feedback:['Great service','On time and tidy','Good work','Very happy','Thank you'][i%5],at:isoOf(o),simulated:true}});
  j.est=t.hours>8?8:t.hours;j.skills=t.skills.slice();j.instructions=t.instructions;seedCosting(j);
  /* make history profitability vary a little */
  j.expenses.forEach((e,k)=>{e.amt=Math.round(e.amt*(.85+((hashN(j.id+'-'+k)%35)/100))/50)*50});
  JOBS.push(j);
 });
 [[2,'Garden Maintenance','c1','brian',1],[2,'Lawn Maintenance','c6',null,0],[3,'Tree Pruning','c8','david',1],[4,'Irrigation Repair','c3','grace',1],[5,'Lawn Maintenance','c10','samuel',1],[5,'Garden Maintenance','c7',null,0],[7,'Lawn Maintenance','c3','mercy',1],[8,'Garden Maintenance','c1','brian',1],[9,'Pest Control','c5','john',1],[12,'Landscape Installation','c2',null,0]].forEach(([o,n,cid,w,asg])=>{
  const t=TEMPLATES.find(x=>x.name===n),c=customerById(cid);
  const j=mkJob({name:n,customerId:cid,location:c.location,assignee:w,status:asg?'Assigned':'Unassigned',date:isoOf(o),time:['08:00','09:30','11:00','14:00'][(o+cid.length)%4],tplId:t.id,timeline:[{t:'Today 08:00',e:'Task created'}].concat(asg?[{t:'Today 08:05',e:'Assigned to '+teamById(w).name}]:[])});
  j.est=Math.min(8,t.hours);j.skills=t.skills.slice();j.instructions=t.instructions;seedCosting(j);JOBS.push(j);
 });
})();
/* stock movement history seeded from real seed jobs */
D.moves=[
 {id:'m1',item:'Fertilizer',delta:50,type:'restock',by:'Manager',ref:'Supplier delivery',t:'12 days ago'},
 {id:'m2',item:'Grass seed',delta:-1,type:'usage',by:'Mercy Wanjiku',jobId:jobByName('Lawn & Hedge Service').id,t:'Yesterday 15:40'},
 {id:'m3',item:'Fertilizer',delta:-2,type:'usage',by:'Mercy Wanjiku',jobId:jobByName('Lawn & Hedge Service').id,t:'Yesterday 15:40'},
 {id:'m4',item:'Topsoil',delta:-4,type:'usage',by:'Faith Achieng',jobId:jobByName('Flower Bed Design').id,t:'Today 12:00'},
 {id:'m5',item:'Pesticide',delta:-1,type:'usage',by:'Brian Kamau',ref:'Pest control, Runda',t:'2 days ago'}
];
jobByName('Garden Cleanup').missingReport=true;
currentWorkerJob=JOBS.find(j=>j.assignee==='brian'&&j.date==='Today').id;
/* attendance: last 7 days (deterministic demo history) + today's clock-in state */
const ATTN={hist:{},today:{}};
TEAM.forEach(t=>{ATTN.hist[t.id]=[1,2,3,4,5,6,7].map(d=>{const dow=(offDate(-d).getDay()+6)%7;if(!AVAIL[t.id][dow])return'off';const h=hashN(t.id+d)%10;return h===0?'absent':h<3?'late':'present'});
 ATTN.today[t.id]=t.status==='Offline'?null:{in:'0'+(6+hashN(t.id)%2)+':'+['40','52','58','45'][hashN(t.id)%4],out:null}});
let seq={ev:1};
