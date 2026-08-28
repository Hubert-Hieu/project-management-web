let data=[], filtered=[], messages=JSON.parse(localStorage.getItem('sae_messages')||'[]');

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const val=(r, names)=>{for(const n of names){let k=Object.keys(r).find(x=>x.toLowerCase().replace(/\s+/g,' ')==n.toLowerCase().replace(/\s+/g,' ')); if(k && r[k]!==null && r[k]!=='') return r[k]}return ''};
const unique=a=>[...new Set(a.filter(x=>x!==''&&x!=null).map(String))];
function countBy(arr){return arr.reduce((o,x)=>(o[x]=(o[x]||0)+1,o),{})}
function bars(obj){let max=Math.max(...Object.values(obj),1);return Object.entries(obj).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class="barrow"><div class="name">${esc(n)}</div><div class="bar" style="max-width:${Math.max(5,v/max*100)}%"></div><div class="num">${v}</div></div>`).join('')}

function init(){
  const projects=unique(data.map(r=>val(r,['Project'])));
  const types=unique(data.map(r=>val(r,['Type'])));
  projectFilter.innerHTML='<option value="">All projects</option>'+projects.map(x=>`<option>${esc(x)}</option>`).join('');
  typeFilter.innerHTML='<option value="">All types</option>'+types.map(x=>`<option>${esc(x)}</option>`).join('');
  renderDashboard(); renderProjects(); renderItems(); renderTimeline(); renderAlerts(); renderMessages();
}
function renderDashboard(){
  const projects=unique(data.map(r=>val(r,['Project']))).length;
  const dispatched=data.filter(r=>String(val(r,['Dispatch status'])).toLowerCase().includes('dispatched')).length;
  const pendingPO=data.filter(r=>String(val(r,['Dispatch status'])).toLowerCase().includes('yet to receive po')).length;
  cards.innerHTML=[
    ['Total SAE Items',data.length,'Records from SAE sheet'],
    ['Projects',projects,'Unique project names'],
    ['Dispatched',dispatched,'Based on Dispatch status'],
    ['Pending PO',pendingPO,'Based on Dispatch status']
  ].map(x=>`<div class="card"><div class="label">${x[0]}</div><div class="value">${x[1]}</div><div class="sub">${x[2]}</div></div>`).join('');
  const p=countBy(data.map(r=>String(val(r,['Project'])||'Unknown')));
  projectCount.textContent=`${projects} projects / ${data.length} items`;
  projectTable.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Project</th><th>Items</th><th>Build</th><th>PIC</th><th>Vendor</th><th>Dispatched</th></tr></thead><tbody>`+
  Object.entries(p).sort((a,b)=>b[1]-a[1]).map(([project,n])=>{
    let rows=data.filter(r=>String(val(r,['Project']))===project);
    let builds=unique(rows.map(r=>val(r,['Build']))).join(', ');
    let pics=unique(rows.map(r=>val(r,['PIC']))).join(', ');
    let vendors=unique(rows.map(r=>val(r,['Vendor']))).slice(0,3).join(', ');
    let disp=rows.filter(r=>String(val(r,['Dispatch status'])).includes('Dispatched')).length;
    return `<tr><td><b>${esc(project)}</b></td><td>${n}</td><td>${esc(builds)}</td><td>${esc(pics)}</td><td>${esc(vendors)}</td><td>${disp}</td></tr>`
  }).join('')+'</tbody></table></div>';
  buildChart.innerHTML=bars(countBy(data.map(r=>String(val(r,['Build'])||'Blank'))));
  manufacturerChart.innerHTML=bars(countBy(data.map(r=>String(val(r,['Fixture Manufacturer 治具廠'])||'Blank'))));
}
function renderProjects(){
  let q=(projectSearch.value||'').toLowerCase();
  let rows=data.filter(r=>JSON.stringify(r).toLowerCase().includes(q));
  let projects=unique(rows.map(r=>val(r,['Project'])));
  projectsTable.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Project</th><th>Items</th><th>Build</th><th>Type</th><th>PIC</th><th>Vendor</th><th>Dispatch</th></tr></thead><tbody>`+
  projects.map(p=>{let rs=rows.filter(r=>val(r,['Project'])==p);return `<tr><td><b>${esc(p)}</b></td><td>${rs.length}</td><td>${esc(unique(rs.map(r=>val(r,['Build']))).join(', '))}</td><td>${esc(unique(rs.map(r=>val(r,['Type']))).join(', '))}</td><td>${esc(unique(rs.map(r=>val(r,['PIC']))).join(', '))}</td><td>${esc(unique(rs.map(r=>val(r,['Vendor']))).slice(0,4).join(', '))}</td><td>${rs.filter(r=>String(val(r,['Dispatch status'])).includes('Dispatched')).length}/${rs.length}</td></tr>`}).join('')+'</tbody></table></div>';
}
function renderItems(){
  let q=(itemSearch.value||'').toLowerCase(), pf=projectFilter.value, tf=typeFilter.value;
  filtered=data.filter(r=>{
    let text=[val(r,['Project']),val(r,['Machine/Equipment name']),val(r,['Spec']),val(r,['Vendor']),val(r,['PIC'])].join(' ').toLowerCase();
    return text.includes(q)&&(!pf||val(r,['Project'])==pf)&&(!tf||val(r,['Type'])==tf);
  });
  itemsTable.innerHTML=`<div class="table-wrap"><table><thead><tr><th>S.No</th><th>Project</th><th>Build</th><th>Machine / Equipment</th><th>Spec</th><th>Category</th><th>PIC</th><th>Vendor</th><th>KO Date</th><th>NBD</th><th>Dispatch</th></tr></thead><tbody>`+
  filtered.map(r=>`<tr><td>${esc(val(r,['S.No']))}</td><td><b>${esc(val(r,['Project']))}</b></td><td>${esc(val(r,['Build']))}</td><td>${esc(val(r,['Machine/Equipment name']))}</td><td>${esc(val(r,['Spec']))}</td><td>${esc(val(r,['Category']))}</td><td>${esc(val(r,['PIC']))}</td><td>${esc(val(r,['Vendor']))}</td><td>${esc(String(val(r,['KO Date'])).slice(0,10))}</td><td>${esc(String(val(r,['NBD'])).slice(0,10))}</td><td><span class="pill">${esc(val(r,['Dispatch status'])||'—')}</span></td></tr>`).join('')+'</tbody></table></div>';
}
function renderTimeline(){
  const dates=[];
  data.forEach(r=>{[['KO Date','KO Date'],['NBD','NBD'],['BFIH site arrive','BFIH site arrive'],['Dispatch to Customer','Dispatch to Customer'],['Vendor ETD','Vendor ETD'],['BFIH Actual ETA','BFIH Actual ETA']].forEach(([k,label])=>{let v=val(r,[k]);if(v && /^\d{4}-\d{2}-\d{2}/.test(String(v))) dates.push({date:String(v).slice(0,10),label,project:val(r,['Project']),spec:val(r,['Spec'])})})});
  dates.sort((a,b)=>a.date.localeCompare(b.date));
  timelineList.innerHTML=dates.slice(0,120).map(x=>`<div class="timeline-item"><b>${esc(x.date)} — ${esc(x.label)}</b><span>${esc(x.project)} · ${esc(x.spec)}</span></div>`).join('')||'<p class="muted">No usable dates found.</p>';
}
function renderAlerts(){
  const alerts=[];
  data.forEach(r=>{
    const p=val(r,['Project']), spec=val(r,['Spec']), status=String(val(r,['Dispatch status']));
    if(status.includes('Yet to receive PO')) alerts.push({t:'Pending PO',p,spec});
    if(String(val(r,['Vendor'])).toLowerCase().includes('tbd')) alerts.push({t:'Vendor TBD',p,spec});
    if(String(val(r,['Fixture Manufacturer 治具廠'])).toLowerCase().includes('cancel')) alerts.push({t:'Cancelled manufacturer',p,spec});
  });
  alertsList.innerHTML=alerts.map(x=>`<div class="alert-item"><b>${esc(x.t)}</b><span>${esc(x.p)} · ${esc(x.spec)}</span></div>`).join('')||'<p class="muted">No alert rules triggered from the current SAE data.</p>';
}
function addMessage(){
  let text=messageText.value.trim(); if(!text)return;
  messages.unshift({text,time:new Date().toLocaleString(),user:'Current user'});
  localStorage.setItem('sae_messages',JSON.stringify(messages)); messageText.value=''; renderMessages();
}
function renderMessages(){messagesList.innerHTML=messages.map(m=>`<div class="message"><b>${esc(m.user)}</b> <small>${esc(m.time)}</small><div>${esc(m.text)}</div></div>`).join('')||'<p class="muted">No messages yet.</p>'}
function exportCSV(){
  if(!data.length)return;
  const cols=Object.keys(data[0]); const csv=[cols.join(','),...data.map(r=>cols.map(c=>`"${String(r[c]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='SAE_export.csv';a.click();
}
document.querySelectorAll('.sidebar nav a').forEach(a=>a.onclick=()=>{document.querySelectorAll('.sidebar nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active');document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));document.getElementById(a.dataset.view).classList.add('active');pageTitle.textContent=a.textContent.replace(/^[^ ]+ /,'')});
fetch('sae_data.json').then(r=>r.json()).then(d=>{data=d;init()}).catch(e=>{document.body.innerHTML='<div style="padding:40px;font-family:Arial"><h2>Cannot load SAE data</h2><p>Make sure sae_data.json is in the same GitHub Pages folder.</p></div>'});
