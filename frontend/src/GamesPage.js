import React from "react";
import { useNavigate } from "react-router-dom";
import "./GamePage.css";

const games = [
  { name: "Tic-Tac-Toe", icon: "❌", path: "/games/tictactoe", comingSoon: false },
  { name: "Guess Number", icon: "🎲", path: "/games/guessnumber", comingSoon: false },
  { name: "Math Quiz", icon: "🧠", path: "/games/mathquiz", comingSoon: false },
  { name: "Hangman", icon: "🪢", path: "/games/hangman", comingSoon: true }
];

function GamesPage() {
  const navigate = useNavigate();

  return (
    <div className="games-grid">
      {games.map((g, i) => (
        <div className="game-card" key={i}>
          <span className="game-card-icon">{g.icon}</span>
          <span className="game-card-title">{g.name}</span>
          <button
            className="game-play-btn"
            disabled={g.comingSoon}
            onClick={() => !g.comingSoon && navigate(g.path)}
          >
            {g.comingSoon ? "Coming Soon" : "Play"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default GamesPage;