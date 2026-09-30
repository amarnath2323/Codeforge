const API = "/api";
const problemGrid = document.getElementById("problemGrid");
const search = document.getElementById("search");
const difficulty = document.getElementById("difficulty");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

async function loadProblems() {
  const params = new URLSearchParams({
    q: search.value,
    difficulty: difficulty.value
  });
  const res = await fetch(`${API}/problems?${params}`);
  const problems = await res.json();
  problemGrid.innerHTML = problems.map(p => `
    <article class="problem" onclick="openProblem(${p.id})">
      <div class="problem-top">
        <span>#${p.id}</span>
        <span class="difficulty ${p.difficulty.toLowerCase()}">${p.difficulty}</span>
      </div>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <div>${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
    </article>
  `).join("") || "<p>No problems found.</p>";
}

async function openProblem(id) {
  const p = await (await fetch(`${API}/problems/${id}`)).json();
  modalContent.innerHTML = `
    <div class="problem-detail">
      <p class="eyebrow">${p.topic.toUpperCase()}</p>
      <h2>${p.title}</h2>
      <span class="difficulty ${p.difficulty.toLowerCase()}">${p.difficulty}</span>
      <p style="margin-top:15px;color:var(--muted)">${p.description}</p>
      <div class="detail-grid">
        <div class="detail-box"><strong>Input</strong><br>${p.input}</div>
        <div class="detail-box"><strong>Output</strong><br>${p.output}</div>
      </div>
      <div class="editor">
        <div class="editor-head"><span>Java</span><button class="btn btn-primary" onclick="runCode()">▶ Run Code</button></div>
        <textarea id="code">${p.starterCode.replace(/\\n/g, "\n")}</textarea>
        <div id="output" class="output">Output will appear here...</div>
      </div>
    </div>`;
  modal.classList.remove("hidden");
}

async function runCode() {
  const code = document.getElementById("code").value;
  const output = document.getElementById("output");
  output.textContent = "Running...";
  const res = await fetch(`${API}/run`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({language:"java", code})
  });
  const data = await res.json();
  output.textContent = data.output;
}

async function loadLeaderboard() {
  const res = await fetch(`${API}/leaderboard`);
  const users = await res.json();
  document.getElementById("leaderboardList").innerHTML = users.map((u,i) => `
    <div class="leader-row">
      <div class="rank">#${i+1}</div>
      <div><strong>${u.name}</strong><br><small>@${u.username}</small></div>
      <div>${u.solved} solved</div>
      <div><strong>${u.points}</strong> pts</div>
    </div>
  `).join("");
}

function showAuth(type) {
  modalContent.innerHTML = `
    <div class="auth">
      <p class="eyebrow">${type.toUpperCase()}</p>
      <h2>${type === "login" ? "Welcome back" : "Create your account"}</h2>
      ${type === "register" ? '<input id="authName" placeholder="Full name">' : ""}
      <input id="authEmail" type="email" placeholder="Email">
      <input id="authPassword" type="password" placeholder="Password">
      <button class="btn btn-primary" onclick="submitAuth('${type}')">${type === "login" ? "Login" : "Create Account"}</button>
      <p id="authMsg" style="margin-top:12px;color:var(--muted)"></p>
    </div>`;
  modal.classList.remove("hidden");
}

async function submitAuth(type) {
  const email = document.getElementById("authEmail").value;
  const body = {email};
  if (type === "register") body.name = document.getElementById("authName").value;
  const res = await fetch(`${API}/auth/${type}`, {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
  });
  const data = await res.json();
  document.getElementById("authMsg").textContent = data.message;
}

document.getElementById("loginBtn").onclick = () => showAuth("login");
document.getElementById("signupBtn").onclick = () => showAuth("register");
document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");
modal.onclick = e => { if(e.target === modal) modal.classList.add("hidden"); };
search.addEventListener("input", loadProblems);
difficulty.addEventListener("change", loadProblems);

document.getElementById("themeBtn").onclick = () => {
  document.body.classList.toggle("dark");
  document.getElementById("themeBtn").textContent =
    document.body.classList.contains("dark") ? "☀" : "☾";
};

loadProblems();
loadLeaderboard();
