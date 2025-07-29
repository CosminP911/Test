import React, { useEffect, useState } from "react";

function ProfilePage() {
  const [user, setUser] = useState({username: "", id: null});
  const [editMode, setEditMode] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // State for edit form
  const [form, setForm] = useState({username: "", curPw: "", newPw: "", newPw2: ""});
  const [pwStep, setPwStep] = useState(0); // 0: edit username & check current pw, 1: allow new pw fields

  const hasSpaces = (s) => /\s/.test(s);


  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUser(data));
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setMsg("");
    setPwStep(0);
    setForm({username: user.username, curPw: "", newPw: "", newPw2: ""});
  };

  const validateProfileInputs = () => {
  if (form.username && (form.username.trim() !== form.username || hasSpaces(form.username))) {
    return "Username cannot have leading/trailing spaces or contain spaces.";
  }
  if (form.username && form.username.length < 3) {
    return "Username must be at least 3 characters.";
  }
  if (form.newPw) {
    if (form.newPw.trim() !== form.newPw || hasSpaces(form.newPw)) {
      return "New password cannot have leading/trailing spaces or contain spaces.";
    }
    if (form.newPw.length < 6) {
      return "New password must be at least 6 characters.";
    }
    if (form.newPw !== form.newPw2) {
      return "New passwords do not match.";
    }
  }
  return "";
};

  // Step 1: Edit username, verify current password if user wants to change password
 const handleVerifyOrSave = async (e) => {
  e.preventDefault();
  setMsg("");
  setLoading(true);

  // Validate inputs
  const validationMsg = validateProfileInputs();
  if (validationMsg) {
    setMsg(validationMsg);
    setLoading(false);
    return;
  }

  // If no new password is requested, just update username
  if (!form.newPw && !form.newPw2 && !form.curPw) {
    await updateProfile({username: form.username});
    return;
  }
  // If user wants to change password, check if current password is entered and correct
  if (!form.curPw) {
    setMsg("Please enter your current password to change password.");
    setLoading(false);
    return;
  }
  // Verify password with backend
  const token = localStorage.getItem("token");
  try {
    const resp = await fetch("http://localhost:8000/verify-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ password: form.curPw })
    });
    if (resp.ok) {
      setPwStep(1);
      setMsg("");
    } else {
      setMsg("Incorrect current password.");
    }
  } catch {
    setMsg("Server error.");
  }
  setLoading(false);
};

// Step 2: Set new password
const handleSaveNewPassword = async (e) => {
  e.preventDefault();
  setMsg("");
  setLoading(true);

  // Validate again
  const validationMsg = validateProfileInputs();
  if (validationMsg) {
    setMsg(validationMsg);
    setLoading(false);
    return;
  }

  // Update username and password together
  await updateProfile({
    username: form.username,
    password: form.newPw,
    old_password: form.curPw
  });
};
  // Shared profile update logic
const updateProfile = async (payload) => {
  const token = localStorage.getItem("token");
  try {
    const resp = await fetch("http://localhost:8000/me", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      if (Array.isArray(data.detail)) {
        setMsg(data.detail.map(e => e.msg).join(" | "));
      } else if (typeof data.detail === "string") {
        setMsg(data.detail);
      } else {
        setMsg("Update failed. Try again.");
      }
      setLoading(false);
      return;
    }
    setMsg("Profile updated! Please log in again.");
    setLoading(false);
    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/";
    }, 1600);
  } catch {
    setMsg("Server error.");
    setLoading(false);
  }
};

  return (
    <div style={{
     // height: "40%",
      minWidth: 340,
      maxWidth: 420,
      background: "#fff",
      borderRadius: 18,
      padding: "32px 34px",
      boxShadow: "0 4px 20px rgba(107, 70, 193, 0.10)",
      margin: "auto"
    }}>
      <h2 style={{color:"#6b46c1", marginBottom:10}}>Profile</h2>
      <hr style={{marginBottom:24}} />
      {!editMode ? (
        <>
          <div style={{fontSize:"1.18rem", marginBottom:18}}><strong>Username:</strong> {user.username}</div>
          <div style={{fontSize:"1.18rem", marginBottom:8}}>
            <strong>Password:</strong> ********
          </div>
          <button
            style={{
              background:"#6b46c1", color:"#fff", border:"none", borderRadius:7,
              padding:"8px 22px", fontWeight:600, fontSize:"1rem", cursor:"pointer"
            }}
            onClick={handleEdit}
          >
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={pwStep === 0 ? handleVerifyOrSave : handleSaveNewPassword}>
          {/* Editable Username */}
          <div style={{marginBottom:12}}>
            <label>Username:</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({...f, username: e.target.value}))}
              style={{width:"90%", padding:8, borderRadius:6, marginTop:4}}
              autoFocus
            />
          </div>
          {/* Change password step 1: Current password */}
          {pwStep === 0 && (
            <div style={{marginBottom:14}}>
              <label>Current Password (required to change password):</label>
              <input
                type="password"
                value={form.curPw}
                onChange={e => setForm(f => ({...f, curPw: e.target.value}))}
                style={{width:"90%", padding:8, borderRadius:6, marginTop:4}}
                autoComplete="current-password"
              />
            </div>
          )}
          {/* Change password step 2: New password fields */}
          {pwStep === 1 && (
            <>
              <div style={{marginBottom:14}}>
                <label>New Password:</label>
                <input
                  type="password"
                  value={form.newPw}
                  onChange={e => setForm(f => ({...f, newPw: e.target.value}))}
                  style={{width:"90%", padding:8, borderRadius:6, marginTop:4}}
                  autoFocus
                  autoComplete="new-password"
                />
              </div>
              <div style={{marginBottom:24}}>
                <label>Repeat New Password:</label>
                <input
                  type="password"
                  value={form.newPw2}
                  onChange={e => setForm(f => ({...f, newPw2: e.target.value}))}
                  style={{width:"90%", padding:8, borderRadius:6, marginTop:4}}
                  autoComplete="new-password"
                />
              </div>
            </>
          )}
          <button type="submit" style={{
            background:"#6b46c1", color:"#fff", border:"none", borderRadius:7,
            padding:"8px 22px", fontWeight:600, fontSize:"1rem", cursor:"pointer"
          }} disabled={loading}>
            {pwStep === 0 ? (loading ? "Saving..." : "Save Changes") : (loading ? "Saving..." : "Save New Password")}
          </button>
          <button
            type="button"
            style={{
              background:"#eee", color:"#6b46c1", border:"none", borderRadius:7,
              padding:"8px 22px", fontWeight:600, fontSize:"1rem", cursor:"pointer", marginLeft: 8
            }}
            onClick={() => setEditMode(false)}
          >Cancel</button>
          {msg && <div style={{marginTop:18, color:"#6b46c1"}}>{msg}</div>}
        </form>
      )}
    </div>
  );
}

export default ProfilePage;
