import "./style.css";

const API_URL = "https://team-task-manager-production-fb1e.up.railway.app/api";

document.getElementById("root").innerHTML = `
  <div class="page">
    <div class="card">
      <h1>Team Task Manager</h1>
      <p>Create projects, assign tasks, and track progress.</p>

      <div id="msg"></div>

      <div id="signupFields" style="display:none">
        <input id="name" placeholder="Name" />
        <select id="role">
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      <input id="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />

      <button id="submitBtn">Login</button>
      <button class="link" id="toggleBtn">New user? Signup</button>
    </div>
  </div>
`;

let signup = false;

document.getElementById("toggleBtn").onclick = () => {
  signup = !signup;
  document.getElementById("signupFields").style.display = signup ? "block" : "none";
  document.getElementById("submitBtn").innerText = signup ? "Create Account" : "Login";
  document.getElementById("toggleBtn").innerText = signup ? "Already have account? Login" : "New user? Signup";
};

document.getElementById("submitBtn").onclick = async () => {
  const body = {
    name: document.getElementById("name")?.value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role: document.getElementById("role")?.value || "admin",
  };

  const url = signup ? `${API_URL}/auth/signup` : `${API_URL}/auth/login`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed");

    document.getElementById("root").innerHTML = `
      <div class="page">
        <div class="card">
          <h1>Team Task Manager Dashboard</h1>
          <p>Welcome ${data.user?.name || "User"}</p>
          <p>Role: ${data.user?.role || "admin"}</p>
          <h3>Features</h3>
          <ul>
            <li>Authentication Signup/Login</li>
            <li>Project Management</li>
            <li>Task Assignment</li>
            <li>Status Tracking</li>
          </ul>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById("msg").innerText = err.message;
  }
};