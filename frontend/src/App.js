import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import CalculatorPage from "./CalculatorPage";
import ProfilePage from "./ProfilePage";
import GamesPage from "./GamesPage";
import "./App.css";
import TicTacToe from "./games/TicTacToe";
import "./games/TicTacToe.css"; // Importing game styles
import "./games/MathQuiz.css"; // Importing Math Quiz styles
import MathQuiz from "./games/MathQuiz";

// Layout component with sidebar and topbar
function Layout({ onLogout, children }) {
  const navigate = useNavigate();
  return (
    <div className="main-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <button className="sidebar-btn" onClick={() => navigate("/profile")}>
          <span role="img" aria-label="Profile" style={{fontSize:28}}>👤</span>
        </button>
        <button className="sidebar-btn" onClick={() => navigate("/calculator")}>
          <span role="img" aria-label="Calculator" style={{fontSize:28}}>🧮</span>
        </button>
        <button className="sidebar-btn" onClick={() => navigate("/games")}>
          <span role="img" aria-label="Games" style={{fontSize:28}}>🎮</span>
        </button>
      </div>
      {/* Content */}
      <div className="content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title"> Calc App </div>
          <div className="topbar-title" style={{fontWeight:700, letterSpacing:2}}></div>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

// Route protection
function PrivateRoute({ children }) {
  const isAuth = !!localStorage.getItem("token");
  return isAuth ? children : <Navigate to="/" replace />;
}

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    setIsAuth(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public: Login/Register only at root */}
        <Route
          path="/"
          element={isAuth ? <Navigate to="/calculator" /> : <AuthPage onAuthSuccess={() => setIsAuth(true)} />}
        />
        {/* Private: All pages inside Layout */}
        <Route
          path="*"
          element={
            <PrivateRoute>
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/calculator" element={<CalculatorPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/games/tictactoe" element={<TicTacToe />} />
                  <Route path="/games/guessnumber" element={<div style={{padding:40}}>Guess Number coming soon!</div>} />
                  <Route path="/games/mathquiz" element={<MathQuiz/>} />

                  {/* Fallback to calculator for unknown private routes */}
                  <Route path="*" element={<Navigate to="/calculator" />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
