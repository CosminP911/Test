import React, { useState } from "react";
import {motion} from "framer-motion";
import "./AuthPage.css"; 

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // or "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!username || !password) {
      setErr("Please fill all fields.");
      return;
    }

    try {
      if (mode === "register") {
        // Register user
        const resp = await fetch("http://localhost:8000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!resp.ok) {
          const data = await resp.json();
          setErr(data.detail || "Registration failed");
          return;
        }
        setMode("login");
        setErr("Registration successful. Now login!");
        return;
      }
      // Login user
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      const resp = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
      const data = await resp.json();
      if (!resp.ok || !data.access_token) {
        setErr(data.detail || "Login failed");
        return;
      }
      localStorage.setItem("token", data.access_token);
      onAuthSuccess();
    } catch (e) {
      setErr("Network or server error.");
    }
  };

  return (
    <div className="login">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="login-title">{mode === "login" ? "Login" : "Register"}</h1>
        <form style={{ width: "100%" }} onSubmit={handleSubmit}>
          <input
            type="text"
            className="login-inset"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="login-inset"
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">
            {mode === "login" ? "Sign In" : "Register"}
          </button>
        </form>
        <div style={{ marginTop: 10 }}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                style={{
                  color: "#6b46c1",
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
                onClick={() => { setMode("register"); setErr(""); }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                style={{
                  color: "#6b46c1",
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
                onClick={() => { setMode("login"); setErr(""); }}
              >
                Login
              </button>
            </>
          )}
        </div>
        {err && <div style={{
          color: "#e53e3e",
          background: "#fff5f5",
          padding: "10px 18px",
          marginTop: "16px",
          borderRadius: "10px"
        }}>{err}</div>}
      </motion.div>
    </div>
  );
}


export default AuthPage;
