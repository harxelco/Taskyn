/* =========================================================
   TASKYN V5 — documents & money entry
   PDF generation (jsPDF, loaded on demand), quote/invoice popups with
   WhatsApp / email sharing, Record payment, Record expense.
   ========================================================= */
const _scripts={};
function loadScript(src){return _scripts[src]||(_scripts[src]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>{delete _scripts[src];rej(new Error('Could not load '+src+'. Check your connection and try again.'))};document.head.appendChild(s)}))}
const pdfReady=()=>loadScript('assets/vendor/jspdf.umd.min.js').then(()=>loadScript('assets/vendor/jspdf.plugin.autotable.min.js'));
const newPdf=()=>new window.jspdf.jsPDF({unit:'pt',format:'a4'});
const pm=n=>(n<0?'-':'')+'KES '+Math.round(Math.abs(+n||0)).toLocaleString('en-US');
const brandRGB=()=>{const m=/(\d+)\D+(\d+)\D+(\d+)/.exec(getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()?hexToRgbStr(getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()):'31,107,69');return m?[+m[1],+m[2],+m[3]]:[31,107,69]};
function hexToRgbStr(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).join(',')}
function pdfHead(doc,title,right){
 const W=doc.internal.pageSize.getWidth(),c=brandRGB();doc.setFillColor(...c);doc.rect(0,0,W,6,'F');
 doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(20,32,25);doc.text(S.org.name,40,46);
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(100,112,105);doc.text(S.org.sector+' · '+(S.org.tz||'').replace('Africa/',''),40,60);
 doc.setFont('helvetica','bold');doc.setFontSize(20);doc.setTextColor(...c);doc.text(title,W-40,46,{align:'right'});
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(100,112,105);(right||[]).forEach((l,i)=>doc.text(l,W-40,60+i*12,{align:'right'}));
 doc.setDrawColor(220,227,223);doc.line(40,84,W-40,84);return 100;
}
function pdfFoot(doc,text){const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),n=doc.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(130,140,135);doc.text(text,40,H-24);doc.text('Page '+i+' of '+n,W-40,H-24,{align:'right'})}}
function saveBlob(blob,name){const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),800)}
const waNumber=p=>{let d=String(p||'').replace(/[^\d+]/g,'');if(d.startsWith('+'))return d.slice(1);d=d.replace(/\D/g,'');if(d.startsWith('0'))return'254'+d.slice(1);if(/^[71]\d{8}$/.test(d))return'254'+d;return d};
const fmtD=iso=>{const [y,m,d]=String(iso||'').split('-');return y?new Date(+y,+m-1,+d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):''};

/* ---------- build the PDFs ---------- */
function quoteCalc(q){const sub=(+q.labour||0)+(+q.mat||0)+(+q.trans||0),disc=sub*(+q.disc||0)/100,net=sub-disc,vat=net*(+q.tax||0)/100;return{sub,disc,net,vat,total:net+vat}}
async function pdfQuote(q){await pdfReady();const doc=newPdf(),c=quoteCalc(q),y=pdfHead(doc,'QUOTATION',[q.id,'Date: '+fmtD(q.date||isoOf(0)),'Valid for 14 days']);
 doc.setFontSize(9);doc.setTextColor(100,112,105);doc.text('PREPARED FOR',40,y+8);doc.setFontSize(12);doc.setFont('helvetica','bold');doc.setTextColor(20,32,25);doc.text(q.cust,40,y+24);doc.setFont('helvetica','normal');doc.setFontSize(10);doc.text('Service: '+q.svc,40,y+40);
 doc.autoTable({startY:y+58,head:[['Description','Amount']],body:[['Labour',pm(q.labour)],['Materials',pm(q.mat)],['Transport',pm(q.trans)],['Subtotal',pm(c.sub)],...(c.disc?[['Discount ('+q.disc+'%)','-'+pm(c.disc).replace('KES ','KES ')]]:[]),['VAT ('+q.tax+'%)',pm(c.vat)]],styles:{fontSize:10,cellPadding:7},headStyles:{fillColor:brandRGB()},columnStyles:{1:{halign:'right'}},theme:'striped'});
 let yy=doc.lastAutoTable.finalY+14;doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(...brandRGB());doc.text('Total: '+pm(c.total),doc.internal.pageSize.getWidth()-40,yy,{align:'right'});
 if(q.notes){doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(60,70,65);doc.text('Notes',40,yy+24);doc.text(doc.splitTextToSize(q.notes,500),40,yy+38)}
 pdfFoot(doc,'Thank you for considering '+S.org.name+'. This quotation is valid for 14 days.');return doc}
async function pdfInvoice(i){await pdfReady();const doc=newPdf(),y=pdfHead(doc,'INVOICE',[i.id,'Issued: '+fmtD(i.date||isoOf(0)),'Due: '+fmtD(i.due||isoOf(14))]);
 doc.setFontSize(9);doc.setTextColor(100,112,105);doc.text('BILL TO',40,y+8);doc.setFontSize(12);doc.setFont('helvetica','bold');doc.setTextColor(20,32,25);doc.text(i.cust,40,y+24);doc.setFont('helvetica','normal');
 doc.autoTable({startY:y+46,head:[['Description','Amount']],body:[[i.desc||i.job,pm(i.amt)]],styles:{fontSize:10,cellPadding:8},headStyles:{fillColor:brandRGB()},columnStyles:{1:{halign:'right'}}});
 let yy=doc.lastAutoTable.finalY+18;const W=doc.internal.pageSize.getWidth();doc.setFontSize(10);doc.setTextColor(60,70,65);doc.text('Total',W-190,yy);doc.text(pm(i.amt),W-40,yy,{align:'right'});doc.text('Paid',W-190,yy+16);doc.text(pm(i.paid),W-40,yy+16,{align:'right'});
 doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(...brandRGB());doc.text('Balance due',W-190,yy+40);doc.text(pm(i.amt-i.paid),W-40,yy+40,{align:'right'});
 if(i.notes){doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(60,70,65);doc.text('Notes',40,yy+70);doc.text(doc.splitTextToSize(i.notes,500),40,yy+84)}
 pdfFoot(doc,'Please quote '+i.id+' when paying. Thank you for your business — '+S.org.name);return doc}

/* ---------- share: native share sheet with the PDF attached when the device supports it ---------- */
async function deliver({doc,file,channel,to,subject,text}){
 const blob=doc.output('blob'),f=new File([blob],file,{type:'application/pdf'});
 if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:subject||file,text});return'share'}catch(e){if(e.name==='AbortError')return'cancel'}}
 saveBlob(blob,file);
 if(channel==='whatsapp'){const n=waNumber(to);const w=window.open('https://wa.me/'+n+'?text='+encodeURIComponent(text),'_blank','noopener');if(!w)return'blocked'}
 else location.href='mailto:'+encodeURIComponent(to||'')+'?subject='+encodeURIComponent(subject||'')+'&body='+encodeURIComponent(text);
 return'download';
}
const sentToast=r=>r==='share'?toast('Share sheet opened with the PDF attached — pick WhatsApp or your email app and press send.','success'):r==='download'?toast('PDF downloaded and your message opened. Attach the downloaded PDF and press send (browsers cannot attach files automatically on desktop).','info'):r==='blocked'?toast('Your browser blocked the WhatsApp window. Allow pop-ups for this site and try again — the PDF was downloaded.','error'):null;

/* ---------- shared document editor (quote + invoice) ---------- */
const DOCX={kind:'quote',id:null};
const custDatalist=()=>`<datalist id="custlist">${[...CUSTOMERS.map(c=>c.name),...new Set(D.stock.map(s=>s.sup))].map(n=>`<option value="${esc(n)}">`).join('')}</datalist>`;
const contactOf=name=>{const c=CUSTOMERS.find(x=>x.name.toLowerCase()===String(name).toLowerCase());return c?{phone:c.phone||'',email:c.email||''}:{phone:'',email:''}};
function readDoc(f){const d=Object.fromEntries(new FormData(f));return d}
function totalsHTML(kind,d){
 if(kind==='quote'){const c=quoteCalc({labour:+d.labour||0,mat:+d.mat||0,trans:+d.trans||0,disc:+d.disc||0,tax:+d.tax||0});return`<div><span>Subtotal</span><b>${pm(c.sub)}</b></div><div><span>Discount</span><b>${c.disc?'-'+pm(c.disc):pm(0)}</b></div><div><span>VAT</span><b>${pm(c.vat)}</b></div><div class="big"><span>Total</span><span>${pm(c.total)}</span></div>`}
 const paid=DOCX.id?D.inv.find(i=>i.id===DOCX.id).paid:0,a=+d.amt||0;return`<div><span>Amount</span><b>${pm(a)}</b></div><div><span>Paid</span><b>${pm(paid)}</b></div><div class="big"><span>Balance due</span><span>${pm(a-paid)}</span></div>`}
function docHTML(kind,rec){
 const q=kind==='quote',st=rec?rec.st:'Draft',paid=rec&&!q?rec.paid:0;
 return`${mhead((q?'Quote ':'Invoice ')+(rec?esc(rec.id):'(new)')+' '+pl(!q&&rec&&invSt(rec)?invSt(rec):st,'gray'))}<form id="docf" data-submit="doc-save"><div class="docbox"><div class="form">
 ${!q&&!rec?field('Create from an approved job (optional)',`<select data-chg="doc-job"><option value="">— Enter details manually —</option>${opts(JOBS.filter(j=>j.status==='Approved'&&!D.inv.some(i=>i.jobId===j.id)).map(j=>[j.id,`${j.name} — ${cname(j)} (${KES(JC.charge(j))})`]))}</select>`,{full:1}):''}
 ${field('Client name',`<input name="cust" list="custlist" required maxlength="80" value="${esc(rec?rec.cust:'')}" placeholder="Client or supplier" autofocus>`,{full:1})}
 ${q?field('Service / description',`<input name="svc" list="svclist" required maxlength="80" value="${esc(rec?rec.svc:'')}"><datalist id="svclist">${TEMPLATES.map(t=>`<option value="${esc(t.name)}">`).join('')}</datalist>`,{full:1})+field('Labour (KES)',`<input name="labour" type="number" min="0" step="1" required data-in="doc-calc" value="${rec?rec.labour:''}">`)+field('Materials (KES)',`<input name="mat" type="number" min="0" step="1" required data-in="doc-calc" value="${rec?rec.mat:0}">`)+field('Transport (KES)',`<input name="trans" type="number" min="0" step="1" required data-in="doc-calc" value="${rec?rec.trans:0}">`)+field('Discount %',`<input name="disc" type="number" min="0" max="100" data-in="doc-calc" value="${rec?rec.disc:0}">`)+field('VAT %',`<input name="tax" type="number" min="0" max="30" data-in="doc-calc" value="${rec?rec.tax:16}">`)
 :field('Description',`<input name="desc" required maxlength="100" value="${esc(rec?(rec.desc||rec.job):'')}" placeholder="e.g. Garden maintenance — November">`,{full:1})+field('Amount (KES)',`<input name="amt" type="number" min="1" step="1" required data-in="doc-calc" value="${rec?rec.amt:''}">`)+field('Due date',`<input name="due" type="date" required value="${esc(rec&&rec.due?rec.due:isoOf(14))}">`)}
 ${field('Notes (shown on the PDF)',`<textarea name="notes" maxlength="400">${esc(rec&&rec.notes||'')}</textarea>`,{full:1})}</div>
 <div class="totals" id="doctotals">${totalsHTML(kind,rec?(q?rec:{amt:rec.amt}):{})}</div></div></form>${custDatalist()}
 <div id="sendslot"></div>
 <div class="docactions"><button class="btn btn-secondary" data-act="close-modal">Close</button><button class="btn btn-secondary" data-act="doc-pdf">${ic('download')} Download PDF</button>${!q&&rec&&rec.paid<rec.amt&&rec.st!=='Draft'?`<button class="btn btn-secondary" data-act="pay-add" data-id="${rec.id}">Record payment</button>`:''}<button class="btn btn-wa" data-act="doc-send" data-ch="whatsapp">Send to WhatsApp</button><button class="btn btn-secondary" data-act="doc-send" data-ch="email">${ic('msg')} Send to email</button><button class="btn btn-primary" type="submit" form="docf">Save</button></div>`;
}
function openQuote(id){DOCX.kind='quote';DOCX.id=id||null;const r=id?D.quotes.find(q=>q.id===id):null;modalHTML(docHTML('quote',r),true);$('#modalbody').classList.add('xl');pdfReady().catch(()=>{})}
function openInvoice(id){DOCX.kind='invoice';DOCX.id=id||null;const r=id?D.inv.find(i=>i.id===id):null;modalHTML(docHTML('invoice',r),true);$('#modalbody').classList.add('xl');pdfReady().catch(()=>{})}
function saveDoc(f,silent){
 const d=readDoc(f),q=DOCX.kind==='quote';
 if(q){const o={cust:d.cust.trim(),svc:d.svc.trim(),labour:+d.labour,mat:+d.mat,trans:+d.trans,disc:+d.disc||0,tax:+d.tax||0,notes:(d.notes||'').trim()};
  let r=DOCX.id&&D.quotes.find(x=>x.id===DOCX.id);if(r)Object.assign(r,o);else{r={id:'Q-'+(Math.max(100,...D.quotes.map(x=>+String(x.id).replace(/\D/g,'')||0))+1),st:'Draft',date:isoOf(0),...o};D.quotes.unshift(r);DOCX.id=r.id}
  commit();if(!silent)toast('Quote saved.','success');return r}
 const o={cust:d.cust.trim(),desc:d.desc.trim(),amt:Math.round(+d.amt),due:d.due,notes:(d.notes||'').trim()};
 let r=DOCX.id&&D.inv.find(x=>x.id===DOCX.id);
 if(r){if(o.amt<r.paid){toast('Amount cannot be less than what has been paid ('+KES(r.paid)+').','error');return null}Object.assign(r,o);r.job=o.desc}
 else{r={id:'INV-'+(Math.max(2000,...D.inv.map(x=>+String(x.id).replace(/\D/g,'')||0))+1),st:'Draft',paid:0,date:isoOf(0),job:o.desc,jobId:DOCX.fromJob||null,...o};D.inv.unshift(r);DOCX.id=r.id;if(r.jobId)log(jobById(r.jobId),'Invoice '+r.id+' created')}
 commit();if(!silent)toast('Invoice saved.','success');return r;
}
SUB['doc-save']=f=>{const r=saveDoc(f);if(r){$('#modalbody .mhead h2').firstChild.textContent=(DOCX.kind==='quote'?'Quote ':'Invoice ')+r.id+' '}};
INP['doc-calc']=el=>{$('#doctotals').innerHTML=totalsHTML(DOCX.kind,readDoc(el.form))};
CHG['doc-job']=el=>{const j=jobById(+el.value),f=el.form;if(!j){DOCX.fromJob=null;return}DOCX.fromJob=j.id;f.cust.value=cname(j);f.desc.value=j.name+' — '+j.location;f.amt.value=JC.charge(j);$('#doctotals').innerHTML=totalsHTML('invoice',readDoc(f))};
function docRecord(){const f=$('#docf');if(!f.checkValidity()){f.reportValidity();return null}return saveDoc(f,true)}
ACT['doc-pdf']=async()=>{const r=docRecord();if(!r)return;try{const doc=DOCX.kind==='quote'?await pdfQuote(r):await pdfInvoice(r);saveBlob(doc.output('blob'),r.id+'.pdf');toast('PDF downloaded.','success')}catch(e){toast(e.message,'error')}};
ACT['doc-send']=el=>{
 const r=docRecord();if(!r)return;const ch=el.dataset.ch,q=DOCX.kind==='quote',ct=contactOf(r.cust),amt=q?quoteCalc(r).total:r.amt-r.paid;
 const msg=q?`Hello ${r.cust.split(' ')[0]},\n\nPlease find our quotation ${r.id} for ${r.svc}. The total is ${pm(amt)} and it is valid for 14 days.\n\nPlease reply to confirm and we will schedule the work.\n\nThank you,\n${S.org.name}`:`Hello ${r.cust.split(' ')[0]},\n\nPlease find invoice ${r.id} for ${r.desc||r.job}. The balance due is ${pm(amt)}, payable by ${fmtD(r.due)}.\n\nThank you for your business,\n${S.org.name}`;
 $('#sendslot').innerHTML=`<div class="sendpanel"><h3>${ch==='whatsapp'?'Send to WhatsApp':'Send by email'}</h3><div class="form">${field('Recipient name',`<input id="sd-name" value="${esc(r.cust)}">`)}${ch==='whatsapp'?field('WhatsApp number',`<input id="sd-to" type="tel" required value="${esc(ct.phone)}" placeholder="0722 000 000">`,{hint:'Kenyan numbers are converted to +254 automatically'}):field('Email address',`<input id="sd-to" type="email" required value="${esc(ct.email)}" placeholder="name@example.com">`)}${ch==='email'?field('Subject',`<input id="sd-sub" value="${esc((q?'Quotation ':'Invoice ')+r.id+' from '+S.org.name)}">`,{full:1}):''}${field('Message (editable)',`<textarea id="sd-msg" rows="6">${esc(msg)}</textarea>`,{full:1})}</div>
 <p class="hint">${navigator.canShare?'On phones the PDF is attached in the share sheet. ':''}On desktop browsers the PDF downloads and your ${ch==='whatsapp'?'WhatsApp':'email'} opens with this message — attach the downloaded file, then press send.</p>
 <div class="actions"><button class="btn btn-ghost" data-act="doc-send-cancel">Cancel</button><button class="btn ${ch==='whatsapp'?'btn-wa':'btn-primary'}" data-act="doc-go" data-ch="${ch}">${ch==='whatsapp'?'Open WhatsApp with PDF':'Open email with PDF'}</button></div></div>`;
 $('#sd-to').focus();$('#sendslot').scrollIntoView({block:'nearest'});
};
ACT['doc-send-cancel']=()=>{$('#sendslot').innerHTML=''};
ACT['doc-go']=async el=>{
 const to=$('#sd-to').value.trim(),ch=el.dataset.ch;if(!to)return toast(ch==='whatsapp'?'Enter the WhatsApp number.':'Enter the email address.','error');
 if(ch==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to))return toast('That email address does not look right.','error');
 const q=DOCX.kind==='quote',r=q?D.quotes.find(x=>x.id===DOCX.id):D.inv.find(x=>x.id===DOCX.id);
 el.disabled=true;try{const doc=q?await pdfQuote(r):await pdfInvoice(r),res=await deliver({doc,file:r.id+'.pdf',channel:ch,to,subject:$('#sd-sub')?$('#sd-sub').value:r.id,text:$('#sd-msg').value});
  if(res!=='cancel'){sentToast(res);if(r.st==='Draft')r.st='Sent';(r.sentVia=r.sentVia||[]).push(ch+' · '+new Date().toLocaleString('en-GB'));commit()}}catch(e){toast(e.message||'Could not create the PDF.','error')}finally{el.disabled=false}
};
Object.assign(ACT,{'q-open':el=>openQuote(el.dataset.id),'q-new':()=>openQuote(),'inv-open':el=>openInvoice(el.dataset.id),'inv-new':()=>openInvoice(),'pay-add':el=>{closeModal();openPayment(el.dataset.id)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('tr.rowlink[data-act^="q-"],tr.rowlink[data-act^="inv-"]'))e.target.click()});

/* ---------- PAYMENTS ---------- */
const PAYM=['M-Pesa','Cash','Bank transfer','Card','Cheque','Other'];
D.pay.forEach((p,i)=>{if(!p.date)p.date=isoOf(-(i+1));if(!p.type)p.type='in'});
VIEWS.payments={skel:'list',title:()=>['Payments','Money received from clients and paid out to suppliers'],
render(){const rec=D.pay.filter(p=>p.type!=='out').reduce((a,p)=>a+p.amt,0),out=D.pay.filter(p=>p.type==='out').reduce((a,p)=>a+p.amt,0);
 return`<div class="kpis c4">${kpi('Received',KES(rec),{tone:'green'})}${kpi('Paid out',KES(out))}${kpi('Outstanding invoices',KES(D.inv.filter(i=>i.st!=='Draft').reduce((a,i)=>a+i.amt-i.paid,0)),{tone:'amber'})}${kpi('Overdue invoices',D.inv.filter(i=>i.st==='Overdue').length,{tone:'red'})}</div>
 <div class="toolbar"><div class="mut">Payments are recorded by you — M-Pesa, card and bank feeds are not connected.</div><button class="btn btn-primary" data-act="pay-new">${ic('plus')} Record payment</button></div>
 <div class="tablewrap"><table><thead><tr><th>Date</th><th>Client / payee</th><th>For</th><th>Method</th><th>Reference</th><th class="num">Amount</th><th></th></tr></thead><tbody>${D.pay.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(p=>`<tr><td>${fmtD(p.date)}${p.t&&/\d:\d/.test(p.t)?`<span class="sub">${esc(p.t.replace(/^Today /,''))}</span>`:''}</td><td><b>${esc(p.cust)}</b> ${p.type==='out'?pl('Paid out','amber'):pl('Received','green')}</td><td>${esc(p.inv&&p.inv!=='—'?p.inv:'')}${p.purpose?(p.inv&&p.inv!=='—'?' · ':'')+esc(p.purpose):''}</td><td>${esc(p.method)}</td><td>${esc(p.ref||'—')}</td><td class="num ${p.type==='out'?'neg':'pos'}">${p.type==='out'?'-':''}${KES(p.amt)}</td><td class="num"><button class="btn btn-ghost btn-sm icon" data-act="pay-del" data-id="${p.id}" aria-label="Delete payment">${ic('trash')}</button></td></tr>`).join('')||`<tr><td colspan="7">${empty('No payments recorded yet','Use Record payment to add one.')}</td></tr>`}</tbody></table></div>`}};
function openPayment(invId){
 const inv=invId?D.inv.find(i=>i.id===invId):null,open=D.inv.filter(i=>i.st!=='Draft'&&i.paid<i.amt);
 modalHTML(`${mhead('Record payment')}<form data-submit="pay-save"><div class="form">
 ${field('Type',`<select name="type" data-chg="pay-type"><option value="in">Payment received (from a client)</option><option value="out">Payment made (to a supplier or other)</option></select>`,{full:1})}
 ${field('Date',`<input name="date" type="date" required max="${isoOf(0)}" value="${isoOf(0)}">`)}
 ${field('Method',`<select name="method">${opts(PAYM)}</select>`)}
 <div class="field full" id="pay-invwrap"><label for="pay-inv">Invoice (optional)</label><select name="inv" id="pay-inv" data-chg="pay-inv"><option value="">Not linked to an invoice</option>${opts(open.map(i=>[i.id,`${i.id} — ${i.cust} (balance ${KES(i.amt-i.paid)})`]),inv?inv.id:'')}</select></div>
 ${field('<span id="pay-namelbl">Client name</span>',`<input name="cust" id="pay-cust" list="custlist" required maxlength="80" value="${esc(inv?inv.cust:'')}" placeholder="Who paid you?">`,{full:1})}
 ${field('Payment name / what it is for',`<input name="purpose" maxlength="100" value="${esc(inv?inv.job:'')}" placeholder="e.g. Deposit, November retainer, seeds purchase">`,{full:1})}
 ${field('Amount (KES)',`<input name="amt" id="pay-amt" type="number" min="1" step="1" required value="${inv?inv.amt-inv.paid:''}">`)}
 ${field('Reference / transaction code',`<input name="ref" maxlength="40" placeholder="e.g. QGH7X2K9LM">`)}
 ${field('Notes',`<textarea name="notes" maxlength="300"></textarea>`,{full:1})}
 <label class="chk full" id="pay-expwrap" hidden style="grid-column:1/-1"><input type="checkbox" name="exp" checked><span>Also record this as a business expense</span></label></div>${custDatalist()}
 <div class="mactions"><button type="button" class="btn btn-secondary" data-act="close-modal">Cancel</button><button class="btn btn-primary">Save payment</button></div></form>`);
}
CHG['pay-type']=el=>{const out=el.value==='out',f=el.form;$('#pay-invwrap').hidden=out;$('#pay-expwrap').hidden=!out;$('#pay-namelbl').textContent=out?'Paid to (supplier / payee)':'Client name';f.cust.placeholder=out?'Who did you pay?':'Who paid you?';if(out){f.inv.value=''}};
CHG['pay-inv']=el=>{const i=D.inv.find(x=>x.id===el.value),f=el.form;if(i){f.cust.value=i.cust;f.amt.value=i.amt-i.paid;if(!f.purpose.value)f.purpose.value=i.job}};
SUB['pay-save']=f=>{
 const d=Object.fromEntries(new FormData(f)),amt=Math.round(+d.amt),out=d.type==='out';
 if(!(amt>0))return toast('Enter an amount greater than zero.','error');if(d.date>isoOf(0))return toast('The date cannot be in the future.','error');
 let inv=null;if(!out&&d.inv){inv=D.inv.find(i=>i.id===d.inv);if(amt>inv.amt-inv.paid)return toast('Amount is more than the invoice balance ('+KES(inv.amt-inv.paid)+').','error')}
 D.pay.unshift({id:uid('p'),type:out?'out':'in',date:d.date,t:nowStr(),inv:inv?inv.id:'—',cust:d.cust.trim(),purpose:(d.purpose||'').trim(),amt,method:d.method,ref:(d.ref||'').trim(),notes:(d.notes||'').trim()});
 if(inv){inv.paid+=amt;inv.st=inv.paid>=inv.amt?'Paid':'Partially Paid'}
 if(out&&d.exp)D.expenses.unshift({id:uid('x'),date:d.date,cat:'Other',desc:(d.purpose||'Supplier payment').trim(),vendor:d.cust.trim(),amt,method:d.method,ref:(d.ref||'').trim()});
 closeModal();commit();toast('Payment recorded.','success');
};
Object.assign(ACT,{'pay-new':()=>openPayment(),'pay-del':el=>UI.confirm('Delete this payment record? If it was linked to an invoice, the invoice balance is restored.',()=>{const p=D.pay.find(x=>x.id===el.dataset.id);if(p&&p.type!=='out'&&p.inv&&p.inv!=='—'){const i=D.inv.find(x=>x.id===p.inv);if(i){i.paid=Math.max(0,i.paid-p.amt);i.st=i.paid>=i.amt?'Paid':i.paid>0?'Partially Paid':'Sent'}}D.pay=D.pay.filter(x=>x.id!==el.dataset.id);commit()},{danger:1,label:'Delete'})});

/* ---------- EXPENSES (ledger inside Profitability) ---------- */
D.expenses=D.expenses||[];
const EXPCATS=['Labour','Material','Transport','Equipment','Rent & utilities','Marketing','Other'];
const JOBCAT={Labour:'Labour',Material:'Material',Transport:'Transport'};
function ledger(){
 const L=D.expenses.map(e=>({...e,src:'overhead'}));
 JOBS.forEach(j=>j.expenses.forEach(e=>{if(!e.seed)L.push({id:e.id,date:e.date||isoOf(dayOff(j)),cat:e.cat,desc:e.desc,vendor:e.vendor||'',amt:e.amt,method:e.method||'',ref:e.ref||'',src:'job',jobId:j.id})}));
 return L.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
const ledgerInRange=()=>ledger().filter(e=>{const o=Math.round((new Date(...e.date.split('-').map((x,i)=>i===1?x-1:+x))-TODAY0)/864e5);return o>=RNG.from&&o<=RNG.to});
const overheads=()=>ledgerInRange().filter(e=>e.src==='overhead').reduce((a,e)=>a+e.amt,0);
function openExpense(){
 if(!guard('costs.edit','record expenses'))return;
 modalHTML(`${mhead('Record expense')}<form data-submit="exp-save"><div class="form">
 ${field('Date',`<input name="date" type="date" required max="${isoOf(0)}" value="${isoOf(0)}">`)}${field('Category',`<select name="cat">${opts(EXPCATS)}</select>`)}
 ${field('What was the expense?',`<input name="desc" required maxlength="100" placeholder="e.g. Diesel for the Hilux, grass seed, trade licence" autofocus>`,{full:1})}
 ${field('Supplier / paid to',`<input name="vendor" list="custlist" maxlength="80" placeholder="Optional">`)}${field('Amount (KES)',`<input name="amt" type="number" min="1" step="1" required>`)}
 ${field('Payment method',`<select name="method">${opts(PAYM)}</select>`)}${field('Receipt / reference no.',`<input name="ref" maxlength="40" placeholder="Optional">`)}
 ${field('Charge to a job (optional)',`<select name="jobId"><option value="">No — business overhead</option>${opts(JOBS.filter(j=>j.status!=='Cancelled'&&dayOff(j)>=-30).sort((a,b)=>dayOff(b)-dayOff(a)).map(j=>[j.id,`${j.name} — ${cname(j)} (${jobDay(j)})`]))}</select>`,{full:1,hint:'Job expenses reduce that job’s profit. Overheads are subtracted from total profit.'})}</div>${custDatalist()}
 <div class="mactions"><button type="button" class="btn btn-secondary" data-act="close-modal">Cancel</button><button class="btn btn-primary">Save expense</button></div></form>`);
}
SUB['exp-save']=f=>{
 const d=Object.fromEntries(new FormData(f)),amt=Math.round(+d.amt);if(!(amt>0))return toast('Enter an amount greater than zero.','error');if(d.date>isoOf(0))return toast('The date cannot be in the future.','error');
 if(d.jobId){if(!addExpense(+d.jobId,{cat:JOBCAT[d.cat]||'Other',desc:d.desc,amt,date:d.date,vendor:d.vendor,method:d.method,ref:d.ref}))return;closeModal();toast('Expense recorded against the job.','success');return}
 D.expenses.unshift({id:uid('x'),date:d.date,cat:d.cat,desc:d.desc.trim(),vendor:(d.vendor||'').trim(),amt,method:d.method,ref:(d.ref||'').trim()});closeModal();commit();toast('Expense recorded.','success');
};
Object.assign(ACT,{'exp-new':openExpense,'led-del':el=>{if(!guard('costs.edit','edit expenses'))return;UI.confirm('Delete this expense?',()=>{if(el.dataset.src==='job')removeExpense(+el.dataset.job,el.dataset.id);else{D.expenses=D.expenses.filter(x=>x.id!==el.dataset.id);commit()}},{danger:1,label:'Delete'})}});
