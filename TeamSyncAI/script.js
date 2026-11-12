const $ = (id) => document.getElementById(id);
const state = {
  projectTitle: "AI Student Project",
  requiredSkills: ["Python", "Machine Learning", "Web Development"],
  domain: "Artificial Intelligence",
  budget: 5000,
  spent: 2800,
  students: [
    {name:"Student A", skills:["Python","Machine Learning"], interests:["AI"], availability:"Weekends"},
    {name:"Student B", skills:["Python","Web Development"], interests:["AI","Web"], availability:"Flexible"},
    {name:"Student C", skills:["UI Design","Web Development"], interests:["Web","Design"], availability:"Evenings"},
    {name:"Student D", skills:["Machine Learning","Data Analysis"], interests:["AI","Data Science"], availability:"Weekends"}
  ],
  expenses: [
    {name:"Prototype components", category:"Hardware", amount:1600},
    {name:"Software / API credits", category:"Software / API", amount:800},
    {name:"Hosting and tools", category:"Hosting", amount:400}
  ],
  tasks: [
    {id:1,name:"Build AI matching model",assignee:"Student A",due:"",priority:"High",status:"Completed"},
    {id:2,name:"Develop website interface",assignee:"Student B",due:"",priority:"High",status:"In Progress"},
    {id:3,name:"Test the final product",assignee:"Student C",due:"",priority:"Medium",status:"Pending"}
  ],
  checklist: [false,false,false,false,false],
  deliverables: [
    {id:1,name:"Project proposal",link:"",status:"Approved"},
    {id:2,name:"Source code repository",link:"https://github.com/",status:"Under Review"}
  ],
  productStatus:"In Development",
  feedback: [
    {id:1,reviewer:"Faculty Reviewer",rating:4,category:"Overall project",comment:"Good concept. Improve website integration."}
  ],
  nextTaskId:4, nextDeliverableId:3, nextFeedbackId:2
};

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2});}
function csv(text){return text.split(",").map(x=>x.trim()).filter(Boolean);}
function toast(message){
  const el=$("toast");el.textContent=message;el.classList.add("show");
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2500);
}
function showView(view){
  document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active-view",el.id===view));
  document.querySelectorAll(".nav-link").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
  const titles={dashboard:"Dashboard overview",matching:"AI team matching",budget:"Project budget manager",tracker:"Project tracker",finalize:"Product finalization",feedback:"Feedback & evaluation"};
  $("pageTitle").textContent=titles[view]||"TeamSync AI";
  window.scrollTo({top:0,behavior:"smooth"});
  if(view==="matching")renderMatches();
}
document.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));
document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.go)));

function scoreStudents(){
  const required=state.requiredSkills.map(s=>s.toLowerCase());
  return state.students.map(student=>{
    const skills=student.skills.map(s=>s.toLowerCase());
    const matched=state.requiredSkills.filter(s=>skills.includes(s.toLowerCase()));
    const missing=state.requiredSkills.filter(s=>!skills.includes(s.toLowerCase()));
    const skillScore=required.length?matched.length/required.length*100:0;
    const projectWords=state.domain.toLowerCase().split(/\W+/).filter(Boolean);
    const interests=student.interests.map(s=>s.toLowerCase());
    const interestBonus=interests.some(i=>projectWords.some(w=>w.length>2&&i.includes(w)))?5:0;
    const score=Math.min(100,Math.round(skillScore+interestBonus));
    return {...student,matched,missing,score};
  }).sort((a,b)=>b.score-a.score);
}
function renderStudents(){
  $("studentCount").textContent=`${state.students.length} students`;
  $("studentList").innerHTML=state.students.map(s=>`<div class="student-row"><div class="student-avatar">${esc(s.name.slice(0,1).toUpperCase())}</div><div><b>${esc(s.name)}</b><small>${esc(s.skills.join(", "))} · ${esc(s.interests.join(", ")||"No interests listed")}</small></div></div>`).join("");
}
function renderMatches(){
  const skills=csv($("requiredSkills").value);
  state.requiredSkills=skills;
  state.projectTitle=$("matchProjectTitle").value.trim()||"AI Student Project";
  state.domain=$("projectDomain").value;
  $("dashboardProjectTitle").textContent=state.projectTitle;
  $("dashboardSkills").textContent=skills.join(" · ");
  const ranked=scoreStudents();
  $("matchResults").innerHTML=ranked.map((s,i)=>`<article class="match-card"><div class="match-card-top"><div class="student-avatar">${esc(s.name.slice(0,1).toUpperCase())}</div><b>${esc(s.name)}${i===0?' · Top match':''}</b><span class="match-score">${s.score}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${s.score}%"></div></div><small><b>Matched:</b> ${esc(s.matched.join(", ")||"No required skills yet")}</small><small class="missing"><b>Missing:</b> ${esc(s.missing.join(", ")||"All required skills covered")}</small><small><b>Interests:</b> ${esc(s.interests.join(", ")||"Not provided")} · <b>Availability:</b> ${esc(s.availability)}</small></article>`).join("")||'<p class="empty-state">Add student profiles to see recommendations.</p>';
  renderStudents();
  toast("Team matching results updated.");
}
$("runMatch").addEventListener("click",renderMatches);
$("studentForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("studentName").value.trim(),skills=csv($("studentSkills").value),interests=csv($("studentInterests").value);
  if(!name||!skills.length){toast("Enter a student name and at least one skill.");return;}
  state.students.push({name,skills,interests,availability:"Flexible"});
  e.target.reset();renderStudents();renderMatches();updateDashboard();toast("Student profile added.");
});

function updateBudget(){
  const remaining=state.budget-state.spent;
  const percent=state.budget>0?state.spent/state.budget*100:0;
  $("budgetTotalBig").textContent=money(state.budget);$("budgetSpentBig").textContent=money(state.spent);$("budgetRemainingBig").textContent=money(remaining);
  $("budgetMessage").textContent=remaining<0?"Budget exceeded":"Available for upcoming tasks";
  $("budgetPercent").textContent=`${Math.round(percent)}%`;
  $("budgetBar").style.width=`${Math.min(100,Math.max(0,percent))}%`;
  $("budgetAlert").textContent=remaining<0?`Warning: You are ${money(Math.abs(remaining))} over budget.`:"Your project is within budget.";
  $("budgetAlert").style.color=remaining<0?"#c84e58":"";
  $("statRemaining").textContent=money(remaining);$("statSpent").textContent=`${money(state.spent)} spent so far`;
  $("budgetUsedLabel").textContent=`${Math.round(percent)}%`; $("budgetUsedBar").style.width=`${Math.min(100,Math.max(0,percent))}%`;
  renderExpenses();
}
function renderExpenses(){
  $("expenseRows").innerHTML=state.expenses.map((e,i)=>`<tr><td>${esc(e.name)}</td><td>${esc(e.category)}</td><td><b>${money(e.amount)}</b></td><td><button class="delete-btn" data-delete-expense="${i}">Remove</button></td></tr>`).join("")||'<tr><td colspan="4">No expenses recorded yet.</td></tr>';
  document.querySelectorAll("[data-delete-expense]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.deleteExpense);state.spent=Math.max(0,state.spent-state.expenses[i].amount);state.expenses.splice(i,1);updateBudget();updateDashboard();toast("Expense removed.");}));
}
$("budgetForm").addEventListener("submit",e=>{e.preventDefault();state.budget=Math.max(0,Number($("budgetInput").value)||0);state.spent=Math.max(0,Number($("spentInput").value)||0);updateBudget();updateDashboard();toast("Budget updated.");});
$("expenseForm").addEventListener("submit",e=>{e.preventDefault();const amount=Number($("expenseAmount").value);if(amount<=0){toast("Enter an expense greater than zero.");return;}state.expenses.push({name:$("expenseName").value.trim(),category:$("expenseCategory").value,amount});state.spent+=amount;$("spentInput").value=state.spent;e.target.reset();updateBudget();updateDashboard();toast("Expense recorded.");});

function renderTasks(){
  const completed=state.tasks.filter(t=>t.status==="Completed").length;
  const pending=state.tasks.filter(t=>t.status==="Pending").length;
  const progress=state.tasks.length?Math.round(completed/state.tasks.length*100):0;
  $("taskTotal").textContent=state.tasks.length;$("taskCompleted").textContent=completed;$("taskPending").textContent=pending;
  $("trackerProgressBig").textContent=`${progress}%`;$("trackerProgressChip").textContent=`${progress}% complete`;$("trackerProgressBar").style.width=`${progress}%`;
  $("statProgress").textContent=`${progress}%`;$("statTasks").textContent=`${completed} of ${state.tasks.length} tasks completed`;$("taskUsedLabel").textContent=`${progress}%`;$("taskUsedBar").style.width=`${progress}%`;
  $("taskList").innerHTML=state.tasks.map(t=>`<div class="task-row"><div class="task-check ${t.status==="Completed"?"complete":""}">${t.status==="Completed"?"✓":"·"}</div><div class="task-main"><b>${esc(t.name)}</b><small>${esc(t.assignee||"Unassigned")}${t.due?` · Due ${esc(t.due)}`:""} </small></div><span class="priority ${t.priority.toLowerCase()}">${esc(t.priority)}</span><select aria-label="Status for ${esc(t.name)}" data-task-status="${t.id}"><option ${t.status==="Pending"?"selected":""}>Pending</option><option ${t.status==="In Progress"?"selected":""}>In Progress</option><option ${t.status==="Completed"?"selected":""}>Completed</option></select><button class="delete-btn" data-delete-task="${t.id}">Remove</button></div>`).join("")||'<p class="empty-state">No tasks yet. Add a task above.</p>';
  document.querySelectorAll("[data-task-status]").forEach(sel=>sel.addEventListener("change",()=>{const t=state.tasks.find(x=>x.id===Number(sel.dataset.taskStatus));if(t)t.status=sel.value;renderTasks();updateDashboard();toast("Task status updated.");}));
  document.querySelectorAll("[data-delete-task]").forEach(btn=>btn.addEventListener("click",()=>{state.tasks=state.tasks.filter(t=>t.id!==Number(btn.dataset.deleteTask));renderTasks();updateDashboard();toast("Task removed.");}));
}
$("taskForm").addEventListener("submit",e=>{e.preventDefault();const name=$("taskName").value.trim();if(!name)return;state.tasks.push({id:state.nextTaskId++,name,assignee:$("taskAssignee").value.trim(),due:$("taskDue").value,priority:$("taskPriority").value,status:"Pending"});e.target.reset();renderTasks();updateDashboard();toast("Task added to tracker.");});

function renderChecklist(){
  const checked=state.checklist.filter(Boolean).length;
  $("checklistBar").style.width=`${checked/state.checklist.length*100}%`;
  $("checklistLabel").textContent=`${checked} of ${state.checklist.length} completed`;
  document.querySelectorAll("#finalChecklist input").forEach((input,i)=>{input.checked=state.checklist[i];input.onchange=()=>{state.checklist[i]=input.checked;renderChecklist();}});
}
function renderDeliverables(){
  $("productStatus").value=state.productStatus;
  $("deliverableList").innerHTML=state.deliverables.map(d=>`<article class="deliverable-card"><div class="deliverable-icon">↗</div><div style="flex:1;min-width:0"><b>${esc(d.name)}</b><small>Deliverable #${d.id}</small>${d.link?`<a href="${esc(d.link)}" target="_blank" rel="noopener noreferrer">Open deliverable ↗</a>`:""}<select data-deliverable-status="${d.id}" aria-label="Status for ${esc(d.name)}"><option ${d.status==="Submitted"?"selected":""}>Submitted</option><option ${d.status==="Under Review"?"selected":""}>Under Review</option><option ${d.status==="Approved"?"selected":""}>Approved</option><option ${d.status==="Needs Changes"?"selected":""}>Needs Changes</option></select></div><button class="delete-btn" data-delete-deliverable="${d.id}">×</button></article>`).join("")||'<p class="empty-state">No deliverables added yet.</p>';
  document.querySelectorAll("[data-deliverable-status]").forEach(sel=>sel.addEventListener("change",()=>{const d=state.deliverables.find(x=>x.id===Number(sel.dataset.deliverableStatus));if(d)d.status=sel.value;toast("Deliverable status updated.");}));
  document.querySelectorAll("[data-delete-deliverable]").forEach(btn=>btn.addEventListener("click",()=>{state.deliverables=state.deliverables.filter(d=>d.id!==Number(btn.dataset.deleteDeliverable));renderDeliverables();toast("Deliverable removed.");}));
}
$("finalChecklist").querySelectorAll("input").forEach((input,i)=>input.addEventListener("change",()=>{state.checklist[i]=input.checked;renderChecklist();}));
$("deliverableForm").addEventListener("submit",e=>{e.preventDefault();const name=$("deliverableName").value.trim();if(!name)return;state.deliverables.push({id:state.nextDeliverableId++,name,link:$("deliverableLink").value.trim(),status:$("deliverableStatus").value});renderDeliverables();e.target.reset();toast("Deliverable added.");});
$("productStatus").addEventListener("change",()=>{state.productStatus=$("productStatus").value;toast(`Product status: ${state.productStatus}`);});

function renderFeedback(){
  const average=state.feedback.length?state.feedback.reduce((sum,f)=>sum+f.rating,0)/state.feedback.length:0;
  $("averageRating").textContent=`${average.toFixed(1)}/5`;$("averageStars").textContent="★".repeat(Math.round(average))+"☆".repeat(5-Math.round(average));
  $("feedbackCount").textContent=`${state.feedback.length} review${state.feedback.length===1?"":"s"} recorded`;
  $("feedbackList").innerHTML=state.feedback.map(f=>`<article class="feedback-card"><div class="feedback-top"><b>${esc(f.reviewer)}</b><span class="feedback-stars">${"★".repeat(f.rating)}${"☆".repeat(5-f.rating)}</span></div><div class="feedback-meta">${esc(f.category)} · Rating ${f.rating}/5</div><p>${esc(f.comment||"No written comment provided.")}</p></article>`).join("")||'<p class="empty-state">No feedback yet. Add the first review.</p>';
}
$("feedbackForm").addEventListener("submit",e=>{e.preventDefault();const reviewer=$("reviewerName").value.trim();if(!reviewer){toast("Enter reviewer name.");return;}state.feedback.unshift({id:state.nextFeedbackId++,reviewer,rating:Number($("feedbackRating").value),category:$("feedbackCategory").value,comment:$("feedbackComment").value.trim()});e.target.reset();renderFeedback();updateDashboard();toast("Feedback submitted. Thank you!");});

function updateDashboard(){
  $("statProjects").textContent="1";$("statStudents").textContent=state.students.length;
  $("dashboardProjectTitle").textContent=state.projectTitle;
  $("dashboardSkills").textContent=state.requiredSkills.join(" · ");
  $("statRemaining").textContent=money(state.budget-state.spent);
  $("statSpent").textContent=`${money(state.spent)} spent so far`;
  $("statFeedback")?.textContent;
  renderTasks();
}
function init(){
  $("budgetInput").value=state.budget;$("spentInput").value=state.spent;
  $("matchProjectTitle").value=state.projectTitle;$("requiredSkills").value=state.requiredSkills.join(", ");
  renderStudents();renderMatches();updateBudget();renderTasks();renderChecklist();renderDeliverables();renderFeedback();updateDashboard();
}
init();
