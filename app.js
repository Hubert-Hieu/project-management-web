const stages=['OPM','RD','Sourcing','Supplier','QA'];
let projects=[
{id:'ALP-1033',name:'Fixture ALP-1033PPA-A00',manager:'Nguyễn Văn A',stage:'Supplier',progress:65,deadline:'2026-08-29',status:'In Progress',tasks:5},
{id:'ALP-1034',name:'Fixture ALP-1034',manager:'Trần Minh B',stage:'QA',progress:85,deadline:'2026-09-02',status:'In Progress',tasks:4},
{id:'LINE-01',name:'Production Line A',manager:'Lê C',stage:'RD',progress:30,deadline:'2026-09-15',status:'Planning',tasks:8},
{id:'ALP-1032',name:'Fixture ALP-1032',manager:'Nguyễn Văn A',stage:'QA',progress:100,deadline:'2026-08-20',status:'Completed',tasks:7},
{id:'ALP-1031',name:'Fixture ALP-1031',manager:'Trần Minh B',stage:'Supplier',progress:45,deadline:'2026-08-25',status:'Delayed',tasks:6}
];
let tasks=[
['Requirement confirmation','ALP-1033','OPM','Nguyễn A',100,'2026-08-20','Completed'],
['Drawing approval','ALP-1033','RD','Trần B',80,'2026-08-28','In Progress'],
['Production','ALP-1033','Supplier','Lima',60,'2026-08-29','In Progress'],
['Final inspection','ALP-1034','QA','Lê C',45,'2026-09-02','In Progress'],
['Customer specification','LINE-01','OPM','Nguyễn A',30,'2026-09-15','Planning'],
['Inspection','ALP-1031','QA','Trần B',20,'2026-08-25','Delayed']
];
const $=id=>document.getElementById(id);
function init(){
  document.querySelectorAll('.sidebar nav a[data-section]').forEach(a=>a.addEventListener('click',()=>showSection(a.dataset.section)));
  $('csvFile').addEventListener('change',importCSV);
  renderProjectFilter(); renderDashboard(); renderProjects(); renderTasks(); renderTimeline(); renderAlerts(); renderCalendar();
}
function showSection(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'));$(id)?.classList.add('active-page');document.querySelectorAll('.sidebar a').forEach(a=>a.classList.toggle('active',a.dataset.section===id));window.scrollTo({top:0,behavior:'smooth'})}
function renderProjectFilter(){ $('projectFilter').innerHTML='<option value="all">Tất cả dự án</option>'+projects.map(p=>`<option value="${p.id}">${p.id} - ${p.name}</option>`).join('') }
function filteredProjects(){const f=$('projectFilter').value;return f==='all'?projects:projects.filter(p=>p.id===f)}
function renderDashboard(){const ps=filteredProjects();$('totalProjects').textContent=ps.length;$('inProgress').textContent=ps.filter(p=>p.status==='In Progress'||p.status==='Delayed').length;$('severeDelay').textContent=ps.filter(p=>p.status==='Delayed').length;$('completed').textContent=ps.filter(p=>p.status==='Completed').length;
 $('pipeline').innerHTML=stages.map(s=>{const n=ps.filter(p=>p.stage===s).length;const avg=n?Math.round(ps.filter(p=>p.stage===s).reduce((a,p)=>a+p.progress,0)/n):0;return `<div class="pipe" onclick="showStage('${s}')"><b>${s}</b><strong>${n}</strong><small>${avg}% average progress</small></div>`}).join('');
 const bn=['Waiting Supplier KO','Waiting Drawing','Waiting ETA','ETD Unconfirmed','ETA Overdue','Waiting Shipment','Waiting Arrival','Inspection','Waiting GRN','In Production'];$('bottlenecks').innerHTML=bn.map((x,i)=>`<div class="bottle"><strong>${i===9?ps.filter(p=>p.status==='In Progress').length:Math.max(0,(i+ps.length)%4-1)}</strong><span>${x}</span></div>`).join('');
 const managers={};ps.forEach(p=>managers[p.manager]=(managers[p.manager]||0)+1);const max=Math.max(1,...Object.values(managers));$('managerChart').innerHTML=Object.entries(managers).map(([m,n])=>`<div class="manager-row"><span class="name">${m}</span><span class="track"><i style="width:${n/max*100}%"></i></span><em>${n}</em></div>`).join('');
 $('upcoming').innerHTML=ps.filter(p=>p.status!=='Completed').sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,5).map(p=>`<div class="upcoming"><b>${p.name}</b><small>${p.deadline} · ${p.manager}</small></div>`).join('')||'<p class="sub">Không có deadline sắp tới.</p>';}
function showStage(stage){showSection('projects');$('projectSearch').value='';$('statusSearch').value='all';renderProjects(stage)}
function renderProjects(stageFilter){let q=$('projectSearch').value.toLowerCase(),s=$('statusSearch').value;let list=projects.filter(p=>(!q||p.name.toLowerCase().includes(q)||p.id.toLowerCase().includes(q))&&(s==='all'||p.status===s)&&(!stageFilter||p.stage===stageFilter));$('projectTable').innerHTML=list.map(p=>`<tr><td><b>${p.id}</b><br><small>${p.name}</small></td><td>${p.manager}</td><td>${p.stage}</td><td><div class="progress"><span>${p.progress}%</span><span class="track"><i style="width:${p.progress}%"></i></span></div></td><td>${p.deadline}</td><td><span class="status ${p.status==='Completed'?'s-green':p.status==='Delayed'?'s-red':p.status==='Planning'?'s-gray':'s-blue'}">${p.status}</span></td><td><button onclick="openProject('${p.id}')">View</button></td></tr>`).join('')||'<tr><td colspan="7">Không tìm thấy dự án.</td></tr>'}
function renderTasks(){ $('taskTable').innerHTML=tasks.map(t=>`<tr><td><b>${t[0]}</b></td><td>${t[1]}</td><td>${t[2]}</td><td>${t[3]}</td><td><div class="progress"><span>${t[4]}%</span><span class="track"><i style="width:${t[4]}%"></i></span></div></td><td>${t[5]}</td><td><span class="status ${t[6]==='Completed'?'s-green':t[6]==='Delayed'?'s-red':'s-blue'}">${t[6]}</span></td></tr>`).join('')}
function renderTimeline(){ $('timelineView').innerHTML=projects.map(p=>`<div class="tl-row"><div class="tl-label"><b>${p.id}</b><small>${p.name}</small></div><div class="tl-bar"><div class="tl-fill" style="width:${p.progress}%"></div></div></div>`).join('')}
function renderAlerts(){let delayed=projects.filter(p=>p.status==='Delayed');$('alertList').innerHTML=(delayed.length?delayed.map(p=>`<div class="alert">⚠️ <b>${p.id}</b> đang chậm tiến độ. Deadline: ${p.deadline}. Progress hiện tại ${p.progress}%.</div>`).join(''):'<div class="alert">✓ Hiện không có cảnh báo nghiêm trọng.</div>')}
function renderCalendar(){let days=['29/08','30/08','31/08','01/09','02/09','03/09','04/09'];$('calendarDemo').innerHTML=days.map(d=>`<div class="day"><b>${d}</b>${projects.filter(p=>p.deadline.slice(5).replace('-','/')===d.slice(3) || p.deadline.endsWith(d.slice(3))).slice(0,2).map(p=>`<small>${p.id}</small>`).join('')}</div>`).join('')}
function openProject(id){let p=projects.find(x=>x.id===id);if(!p)return;showToast(`${p.name}: ${p.progress}% • ${p.stage}`);setTimeout(()=>showSection('tasks'),500)}
function openProjectModal(){$('projectModal').classList.add('show')};function closeProjectModal(){$('projectModal').classList.remove('show')}
function createProject(){let name=$('newName').value.trim();if(!name){showToast('Vui lòng nhập tên dự án');return}let id='P-'+String(projects.length+1).padStart(3,'0');projects.push({id,name,manager:$('newManager').value||'Chưa phân công',stage:$('newStage').value,progress:0,deadline:$('newDeadline').value||'2026-09-30',status:'Planning',tasks:0});closeProjectModal();renderProjectFilter();renderDashboard();renderProjects();renderTimeline();showToast('Đã tạo dự án '+id)}
function showToast(msg){let t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
function downloadCSV(){let csv='Project ID,Project Name,Manager,Stage,Progress,Deadline,Status\n'+projects.map(p=>[p.id,p.name,p.manager,p.stage,p.progress,p.deadline,p.status].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='projects.csv';a.click()}
function importCSV(e){let file=e.target.files[0];if(!file)return;let r=new FileReader();r.onload=()=>{let lines=r.result.split(/\r?\n/).filter(Boolean).slice(1);lines.forEach(line=>{let c=line.split(',').map(x=>x.replace(/^"|"$/g,''));if(c.length>=7)projects.push({id:c[0],name:c[1],manager:c[2],stage:c[3],progress:Number(c[4])||0,deadline:c[5],status:c[6],tasks:0})});renderProjectFilter();renderDashboard();renderProjects();renderTimeline();showToast('Đã import '+lines.length+' dòng')};r.readAsText(file)}
function globalSearch(q){q=q.toLowerCase();let arr=projects.filter(p=>(p.name+' '+p.id+' '+p.manager+' '+p.stage).toLowerCase().includes(q));$('searchResults').innerHTML=q?arr.map(p=>`<div class="search-item"><b>${p.id} — ${p.name}</b><br><small>${p.manager} · ${p.stage} · ${p.progress}% · ${p.status}</small></div>`).join(''):'<p class="sub">Nhập từ khóa để tìm kiếm.</p>'}
init();
