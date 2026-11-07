/* =========================================================
   TASKYN V5 — operational intelligence
   Everything here is DETERMINISTIC analysis of the live workspace data.
   No external AI model is called unless config.js provides AI_ENDPOINT
   (see askRemote). Output is labelled accordingly in the UI.
   ========================================================= */
const jl=j=>`<a class="lnk" data-act="open-job" data-id="${j.id}">${esc(j.name)}</a>`;
const abtn=(label,act,id,cls='btn-secondary')=>`<button class="btn ${cls} btn-sm" data-act="${act}" ${id!=null?`data-id="${esc(id)}"`:''}>${esc(label)}</button>`;
const SEV={red:0,amber:1,blue:2};

/* ---------- ALERTS (why + recommended action, always actionable) ---------- */
let ALERTS=[];
function alerts(){
 const a=[],push=(sev,title,why,act,label,go,jobId)=>a.push({sev,title,why,act,label,go,jobId});
 JOBS.forEach(j=>{
  const w=j.assignee?teamById(j.assignee).name:null,open=!CLOSED_ST.includes(j.status),off=dayOff(j);
  if(open&&j.delayMin>0)push('red',`${j.name}, ${j.location}`,`${w||'The worker'} is ${j.delayMin} minutes behind schedule; ${customerById(j.customerId).name} may be waiting.`,'Tell the customer, or move the job to someone free.','Notify customer',()=>notifyCustomer(j.id),j.id);
  if(j.status==='Unassigned'&&off>=0&&off<=1)push(off===0?'red':'amber',`${j.name}, ${j.location}`,`No worker assigned for ${dayLabel(off)} ${j.time}.`,'Review the recommended workers in Dispatch.','Open dispatch',()=>goTo('dispatch'),j.id);
  if(j.missingReport)push('amber',`${j.name}, ${j.location}`,'The job is complete but no completion report was submitted.','Ask the worker to submit proof of work.','Remind worker',()=>remindWorker(j.id),j.id);
  if(j.status==='Awaiting Review')push('amber',`${j.name}, ${j.location}`,`${w||'The worker'} submitted a report that needs manager approval${j.approvalRequested?' (approval requested by automation)':''}.`,'Review the report, then approve or request changes.','Review',()=>openJob(j.id,'completion'),j.id);
  if(open&&j.assignee&&['Assigned','Accepted'].includes(j.status)&&depsOpen(j).length)push('blue',`${j.name}, ${j.location}`,`Waiting for “${depsOpen(j)[0].name}” to finish before it can start.`,'No action needed unless the earlier job slips.','View dependency',()=>openJob(depsOpen(j)[0].id),j.id);
  if(open&&j.issues.length)push('amber',`${j.name}, ${j.location}`,`${j.issues.length} issue${j.issues.length>1?'s':''} reported on site: “${j.issues[j.issues.length-1].text}”.`,'Contact the worker or adjust the plan.','Open job',()=>openJob(j.id),j.id);
  if(j.cust&&j.cust.status==='rework')push('red',`${j.name}, ${j.location}`,'The customer requested rework (simulated portal action).','Reassign or brief the worker on the feedback.','Open job',()=>openJob(j.id,'completion'),j.id);
 });
 [0,1].forEach(off=>TEAM.forEach(t=>{
  const mine=openJobs(t.id,off);let c=null;
  for(let i=0;i<mine.length&&!c;i++)for(let k=i+1;k<mine.length;k++)if(overlaps(mine[i],mine[k])){c=[mine[i],mine[k]];break}
  if(c)push('red',`Schedule conflict — ${t.name}`,`${c[0].name} and ${c[1].name} overlap on ${dayLabel(off)} (${hhmm(jStart(c[0]))}–${hhmm(jEnd(c[0]))} vs ${hhmm(jStart(c[1]))}–${hhmm(jEnd(c[1]))}).`,'Move one job to a free worker or another time.','Resolve in dispatch',()=>goTo('dispatch'));
  else if(loadPct(t.id,off)>100&&rostered(t.id,off))push('amber',`${t.name} is overloaded`,`${hrsOf(t.id,off).toFixed(1)}h planned for ${dayLabel(off)} (capacity 8h).`,'Rebalance the schedule.','Open dispatch',()=>goTo('dispatch'));
 }));
 D.stock.forEach(s=>{const st=stockState(s);if(st==='low')push('red',`${s.n} is at or below minimum`,`${s.q}${s.u} left (minimum ${s.min}${s.u}).`,`Reorder from ${s.sup}.`,'Restock',()=>restockDialog(s.id));else if(st==='projected')push('amber',`${s.n} will run low`,`Today's open jobs plan to use ${plannedUse(s.n)}${s.u}; ${s.q}${s.u} on hand, minimum ${s.min}${s.u}.`,`Reorder from ${s.sup}.`,'Restock',()=>restockDialog(s.id))});
 D.quotes.filter(q=>['Sent','Viewed'].includes(q.st)).forEach(q=>push('blue',`Quote ${q.id} awaiting approval`,`${q.cust} has not approved yet (${q.st.toLowerCase()}).`,'Follow up with the customer.','Open quotes',()=>goTo('quotes')));
 D.inv.filter(i=>i.st==='Overdue').forEach(i=>push('amber',`Invoice ${i.id} overdue`,`${i.cust} owes ${KES(i.amt-i.paid)}.`,'Send a payment reminder.','Open invoices',()=>goTo('invoices')));
 D.equip.filter(e=>e.next==='Overdue').forEach(e=>push('blue',`${e.n} maintenance overdue`,`Last serviced ${e.last}.`,'Schedule maintenance.','Open equipment',()=>goTo('equipment')));
 const cp=JOBS.filter(j=>j.cust&&j.cust.status==='awaiting').length;if(cp)push('blue',`${cp} job${cp>1?'s':''} awaiting customer approval`,'Approved reports are waiting for the customer to confirm the work (demo portal).','Open the customer portal.','Open portal',()=>goTo('portal'));
 ALERTS=a.sort((x,y)=>SEV[x.sev]-SEV[y.sev]);return ALERTS;
}
const alertHTML=(a,i)=>`<div class="alert ${a.sev}"><div class="alert-body"><b>${esc(a.title)}</b><p><span class="k">Why</span>${esc(a.why)}</p><p><span class="k">Next</span>${esc(a.act)}</p></div><button class="btn btn-secondary btn-sm" data-act="alert" data-i="${i}">${esc(a.label)}</button></div>`;
function remindWorker(id){const j=jobById(id);if(!j||!j.assignee)return toast('No worker on this job.','error');addNotification('amber','Report reminder',`Please submit the completion report for ${j.name}.`,j.id,{cat:'report',to:'worker:'+j.assignee});log(j,'Reminder sent to '+teamById(j.assignee).name);commit();toast(`Reminder sent to ${teamById(j.assignee).name} (in-app).`,'success')}

/* ---------- DAILY BRIEFING ---------- */
function briefing(){
 const T=JOBS.filter(j=>dayOff(j)===0&&j.status!=='Cancelled');
 const st={scheduled:T.length,completed:T.filter(j=>DONE_ST.includes(j.status)).length,active:T.filter(j=>['On Site','In Progress'].includes(j.status)).length,upcoming:T.filter(j=>['Assigned','Accepted'].includes(j.status)).length,
  overdue:T.filter(j=>j.delayMin>0&&!CLOSED_ST.includes(j.status)).length,unassigned:T.filter(j=>j.status==='Unassigned').length,approvals:JOBS.filter(j=>j.status==='Awaiting Review').length,
  nextUnassigned:JOBS.filter(j=>j.status==='Unassigned'&&dayOff(j)>0&&dayOff(j)<=7).length,custPending:JOBS.filter(j=>j.cust&&j.cust.status==='awaiting').length};
 const al=alerts(),issues=al.filter(x=>x.sev!=='blue').slice(0,5),acts=[];
 const un=T.filter(j=>j.status==='Unassigned').sort((a,b)=>mins(a.time)-mins(b.time));
 un.slice(0,2).forEach(j=>{const r=recommend(j)[0];acts.push({text:`Assign ${j.name} (${j.location}, ${j.time}) — top recommendation: ${teamById(r.wid).name}, score ${r.total}/100.`,btn:'Review',act:'review-assign',id:j.id,pri:1})});
 T.filter(j=>j.delayMin>0&&!CLOSED_ST.includes(j.status)).forEach(j=>acts.push({text:`Tell ${customerById(j.customerId).name} that ${j.name} is running ${j.delayMin} minutes late.`,btn:'Notify',act:'notify-customer',id:j.id,pri:0}));
 if(st.approvals)acts.push({text:`Approve ${st.approvals} completion report${st.approvals>1?'s':''} so the work can be invoiced.`,btn:'Review',act:'go',id:'reports',pri:2});
 T.filter(j=>j.missingReport).forEach(j=>acts.push({text:`${teamById(j.assignee).name} has not submitted the report for ${j.name}.`,btn:'Remind',act:'remind',id:j.id,pri:2}));
 const conf=al.find(x=>/Schedule conflict/.test(x.title));if(conf)acts.push({text:conf.title+': '+conf.why,btn:'Dispatch',act:'go',id:'dispatch',pri:1});
 D.stock.filter(s=>stockState(s)==='low').forEach(s=>acts.push({text:`Reorder ${s.n} (${s.q}${s.u} left, minimum ${s.min}${s.u}).`,btn:'Restock',act:'restock',id:s.id,pri:3}));
 acts.sort((a,b)=>a.pri-b.pri);
 const done=st.scheduled?Math.round(st.completed/st.scheduled*100):0;
 const lines=[`${st.scheduled} job${st.scheduled!==1?'s are':' is'} scheduled today: ${st.completed} complete (${done}%), ${st.active} in the field, ${st.upcoming} still to start.`,
  st.overdue?`${st.overdue} job${st.overdue>1?'s are':' is'} running late.`:'No jobs are running late.',
  st.unassigned?`${st.unassigned} job${st.unassigned>1?'s':''} today ${st.unassigned>1?'have':'has'} no worker${st.nextUnassigned?` (and ${st.nextUnassigned} more in the next 7 days)`:''}.`:'Every job today has a worker.',
  st.approvals?`${st.approvals} report${st.approvals>1?'s':''} waiting for your approval.`:'No reports are waiting for approval.'];
 return{st,issues,acts:acts.slice(0,6),lines,at:new Date(),basis:`${JOBS.length} jobs · ${TEAM.length} workers · ${D.stock.length} stock items · ${S.queue.length} queued worker actions`};
}
function suggestions(){
 const q=['What needs my attention first?','Summarise today'],T=JOBS.filter(j=>dayOff(j)===0&&!CLOSED_ST.includes(j.status));
 const late=T.find(j=>j.delayMin>0);if(late)q.push(`Why is ${late.name} late?`);
 const un=T.find(j=>j.status==='Unassigned');if(un)q.push(`Who should I assign to ${un.name}?`);
 if(JOBS.some(j=>j.status==='Awaiting Review'))q.push('Which reports need approval?');
 if(D.stock.some(s=>stockState(s)!=='ok'))q.push('What is running low in stock?');
 const ov=TEAM.find(t=>loadPct(t.id,0)>100);if(ov)q.push(`Is ${ov.name.split(' ')[0]} overloaded?`);
 q.push('Which jobs made the most profit?','Who is available now?');return q.slice(0,8);
}

/* ---------- QUESTION ANSWERING (rule-based over live data) ---------- */
function answer(q){
 const l=q.toLowerCase(),T=JOBS.filter(j=>dayOff(j)===0&&j.status!=='Cancelled'),openT=T.filter(j=>!CLOSED_ST.includes(j.status));
 const w=TEAM.find(t=>l.includes(t.name.split(' ')[0].toLowerCase()));
 const jn=JOBS.filter(j=>j.status!=='Approved'||dayOff(j)>=-2).sort((a,b)=>b.name.length-a.name.length).find(j=>l.includes(j.name.toLowerCase()));
 const list=a=>a.length?'<ul class="al">'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'';
 let h='',acts='';
 if(/why.*(late|delay)|late|delay|overdue|behind/.test(l)){
  const d=openT.filter(j=>j.delayMin>0);
  h=d.length?`<b>${d.length} job${d.length>1?'s are':' is'} running late.</b>`+list(d.map(j=>`${jl(j)} — ${esc(j.location)}, ${j.delayMin} min behind${j.assignee?` (${esc(teamById(j.assignee).name)}, ${loadPct(j.assignee,0)}% loaded, ${j.progress}% done)`:''}`))+`<p class="mut">Data used: job delay minutes, assignee workload and progress. Cause is not recorded in the data, so I can only show what the numbers say.</p>`:'No jobs are running late right now.';
  acts=d[0]?abtn('Notify customer','notify-customer',d[0].id,'btn-primary')+abtn('Open job','open-job',d[0].id):'';
 }else if(/assign|recommend|who should|who can|cover/.test(l)&&!/unassigned jobs/.test(l)||/unassigned/.test(l)){
  const j=jn||openT.find(x=>x.status==='Unassigned')||JOBS.find(x=>x.status==='Unassigned'&&dayOff(x)>=0);
  if(!j)h='Everything upcoming already has a worker.';else{const r=recommend(j).slice(0,3);h=`<b>${jl(j)}</b> (${esc(j.location)}, ${dayLabel(dayOff(j))} ${j.time}). Top candidates:`+list(r.map(x=>`<b>${esc(teamById(x.wid).name)}</b> — score ${x.total}/100. ${esc(x.reasons.filter(z=>z.ok).map(z=>z.txt).slice(0,2).join('; '))||'Limited fit'}${x.conflicts.length?` <span class="mut">⚠ ${esc(x.conflicts[0].msg)}</span>`:''}`))+'<p class="mut">Score = skills 40 + availability 25 + workload 25 + service-area fit 10 (demo zones, not GPS).</p>';acts=abtn('Review in dispatch','review-assign',j.id,'btn-primary')}
 }else if(/available|free|who is.*(now|today)/.test(l)&&!w){
  const f=TEAM.filter(t=>rostered(t.id,0)&&t.status!=='Offline'&&loadPct(t.id,0)<100).sort((a,b)=>loadPct(a.id,0)-loadPct(b.id,0));
  h=f.length?`<b>${f.length} worker${f.length>1?'s have':' has'} capacity today:</b>`+list(f.map(t=>`${esc(t.name)} — ${t.status}, ${loadPct(t.id,0)}% loaded`)):'Nobody has spare capacity today.';
 }else if(/overload|workload|capacity|busy/.test(l)){
  if(w)h=`<b>${esc(w.name)}</b> is ${loadPct(w.id,0)}% loaded today (${hrsOf(w.id,0).toFixed(1)}h of 8h across ${openJobs(w.id,0).length} open job${openJobs(w.id,0).length!==1?'s':''}).`+list(openJobs(w.id,0).map(j=>`${jl(j)} ${hhmm(jStart(j))}–${hhmm(jEnd(j))}`));
  else{const o=TEAM.filter(t=>loadPct(t.id,0)>100);h=o.length?`<b>Overloaded today:</b>`+list(o.map(t=>`${esc(t.name)} — ${loadPct(t.id,0)}% (${hrsOf(t.id,0).toFixed(1)}h)`)):'Nobody is over capacity today.';}
  acts=abtn('Open dispatch','go','dispatch');
 }else if(/report|approv/.test(l)){
  const r=JOBS.filter(j=>j.status==='Awaiting Review');const c=JOBS.filter(j=>j.cust&&j.cust.status==='awaiting');
  h=(r.length?`<b>${r.length} report${r.length>1?'s':''} awaiting your approval:</b>`+list(r.map(j=>`${jl(j)} — ${esc(j.assignee?teamById(j.assignee).name:'')}`)):'No reports are waiting for your approval.')+(c.length?`<p>${c.length} approved job${c.length>1?'s are':' is'} waiting for the customer (demo portal).</p>`:'');
  acts=abtn('Open reports','go','reports');
 }else if(/profit|margin|cost|revenue|earn/.test(l)){
  const rj=JOBS.filter(JC.realised).sort((a,b)=>JC.profit(b)-JC.profit(a)),t=JC.totals(rj);
  h=`<b>${rj.length} completed jobs:</b> charged ${KES(t.charge)}, cost ${KES(t.total)}, profit <b>${KES(t.profit)}</b> (${t.margin.toFixed(1)}% margin).`+(rj.length?list([`Best: ${jl(rj[0])} — ${KES(JC.profit(rj[0]))} (${JC.margin(rj[0]).toFixed(0)}%)`,`Lowest: ${jl(rj[rj.length-1])} — ${KES(JC.profit(rj[rj.length-1]))} (${JC.margin(rj[rj.length-1]).toFixed(0)}%)`]):'')+'<p class="mut">Costs are the expenses recorded against each job.</p>';acts=abtn('Open profitability','go','profit');
 }else if(/stock|inventory|material|low/.test(l)){
  const s=D.stock.filter(x=>stockState(x)!=='ok');h=s.length?`<b>${s.length} item${s.length>1?'s need':' needs'} attention:</b>`+list(s.map(x=>`${esc(x.n)} — ${x.q}${x.u} on hand, minimum ${x.min}${x.u}${stockState(x)==='projected'?`, ${plannedUse(x.n)}${x.u} planned for today`:''}`)):'All stock is above minimum levels.';acts=abtn('Open inventory','go','inventory');
 }else if(/customer|invoice|unpaid|paid|owe/.test(l)){
  const u=D.inv.filter(i=>i.amt>i.paid&&i.st!=='Draft');h=u.length?`<b>Outstanding invoices:</b>`+list(u.map(i=>`${esc(i.cust)}: ${KES(i.amt-i.paid)} (${i.st})`)):'No outstanding invoices.';acts=abtn('Open payments','go','payments');
 }else if(/conflict|clash|double/.test(l)){
  const c=alerts().filter(x=>/conflict/i.test(x.title));h=c.length?`<b>${c.length} schedule conflict${c.length>1?'s':''}:</b>`+list(c.map(x=>`${esc(x.title)} — ${esc(x.why)}`)):'No schedule conflicts today or tomorrow.';acts=abtn('Open dispatch','go','dispatch');
 }else if(w){
  const mine=JOBS.filter(j=>j.assignee===w.id&&dayOff(j)===0&&j.status!=='Cancelled');const dn=mine.filter(j=>DONE_ST.includes(j.status)).length;
  h=`<b>${esc(w.name)}</b> (${esc(w.role)}, ${w.status}) has ${mine.length} job${mine.length!==1?'s':''} today: ${dn} complete.`+list(mine.map(j=>`${jl(j)} — ${j.status} ${hhmm(jStart(j))}`));
 }else if(/attention|first|priority|urgent|todo|to do/.test(l)){
  const a=alerts().slice(0,5);h=a.length?`<b>Top ${a.length} things to look at:</b>`+list(a.map((x,i)=>`${esc(x.title)} — ${esc(x.why)}`)):'Nothing needs attention right now.';acts=abtn('Open daily briefing','go','ask');
 }else if(/summar|brief|today|overview/.test(l)){
  const b=briefing();h='<b>Today in one view</b>'+list(b.lines.map(esc));acts=abtn('See recommended actions','go','ask');
 }else if(/tomorrow/.test(l)){
  const t=JOBS.filter(j=>dayOff(j)===1&&j.status!=='Cancelled');h=`<b>${t.length} job${t.length!==1?'s':''} tomorrow:</b>`+list(t.sort((a,b)=>jStart(a)-jStart(b)).map(j=>`${j.time} ${jl(j)} — ${j.assignee?esc(teamById(j.assignee).name):'<b>unassigned</b>'}`));
 }else if(jn){
  h=`<b>${jl(jn)}</b> — ${jn.status}, ${dayLabel(dayOff(jn))} ${jn.time}, ${esc(jn.location)}. Worker: ${jn.assignee?esc(teamById(jn.assignee).name):'none'}. Progress ${jn.progress}%. Charge ${KES(JC.charge(jn))}, cost so far ${KES(JC.costs(jn).total)}.`;acts=abtn('Open job','open-job',jn.id);
 }else h=`I can answer from the data in this workspace: delays, who is free, assignments, workload, reports and approvals, stock, profit, invoices, or a named worker or job. I don't have enough to answer that one.`;
 return{html:h,acts};
}
/* optional remote model: POST {question, context} to TASKYN_CONFIG.AI_ENDPOINT. Falls back to the deterministic engine. */
async function askRemote(q){
 const ep=S.integ.aiEndpoint||CFG().AI_ENDPOINT;if(!ep)return null;
 try{const r=await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,context:{briefing:briefing().st,alerts:alerts().slice(0,10).map(a=>({title:a.title,why:a.why}))}})});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();return d.answer?{html:esc(d.answer).replace(/\n/g,'<br>'),remote:true}:null}catch(e){return{error:String(e.message||e)}}
}
