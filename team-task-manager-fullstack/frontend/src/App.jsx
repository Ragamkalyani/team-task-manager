import { useState } from "react";
import API from "./api";

export default function App() {
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [msg, setMsg] = useState("");

  const submit = async () => {
    try {
      const url = isSignup ? "/auth/signup" : "/auth/login";
      const res = await API.post(url, form);

      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }

      setMsg("Success");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed");
    }
  };

  if (user) {
    return (
      <div className="page">
        <div className="card">
          <h1>Team Task Manager Dashboard</h1>
          <p>Welcome, {user.name}</p>
          <p>Role: {user.role}</p>

          <h3>Key Features</h3>
          <ul>
            <li>Authentication Signup/Login</li>
            <li>Project and team management</li>
            <li>Task creation and assignment</li>
            <li>Status tracking dashboard</li>
          </ul>

          <button onClick={() => {
            localStorage.clear();
            setUser(null);
          }}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Team Task Manager</h1>
        <p>Create projects, assign tasks, and track progress.</p>

        {msg && <div className="msg">{msg}</div>}

        {isSignup && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {isSignup && (
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        )}

        <button onClick={submit}>
          {isSignup ? "Create Account" : "Login"}
        </button>

        <button className="link" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Already have account? Login" : "New user? Signup"}
        </button>
      </div>
    </div>
  );
}