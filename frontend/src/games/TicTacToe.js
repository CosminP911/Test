import React, { useState } from "react";
import "./TicTacToe.css"; // Assuming you have styles for the game
import { useNavigate } from "react-router-dom";

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// --- Simple AI: Pick win, block, else random empty ---
function aiMove(squares, aiPlayer, humanPlayer) {
  // 1. Win if possible
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = aiPlayer;
      if (calculateWinner(copy) === aiPlayer) return i;
    }
  }
  // 2. Block opponent win
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = humanPlayer;
      if (calculateWinner(copy) === humanPlayer) return i;
    }
  }
  // 3. Take center if free
  if (!squares[4]) return 4;
  // 4. Pick random empty
  const empties = squares.map((v, idx) => v ? null : idx).filter(v => v !== null);
  return empties[Math.floor(Math.random() * empties.length)];
}

export default function TicTacToe() {
  const navigate = useNavigate();
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [yourTurn, setYourTurn] = useState(true);
  const [status, setStatus] = useState("Your move!");
  const human = "X", ai = "O";

  function handleClick(i) {
    if (!yourTurn || squares[i] || calculateWinner(squares)) return;
    const next = squares.slice();
    next[i] = human;
    setSquares(next);
    setYourTurn(false);

    const winner = calculateWinner(next);
    if (winner) {
      setStatus(`Winner: ${winner}`);
      return;
    }
    if (next.every(Boolean)) {
      setStatus("Draw!");
      return;
    }

    // AI moves after 0.6s for realism
    setTimeout(() => {
      const aiIdx = aiMove(next, ai, human);
      if (aiIdx !== undefined) {
        next[aiIdx] = ai;
      }
      setSquares(next);
      setYourTurn(true);

      const winAfterAi = calculateWinner(next);
      if (winAfterAi) setStatus(`Winner: ${winAfterAi}`);
      else if (next.every(Boolean)) setStatus("Draw!");
      else setStatus("Your move!");
    }, 600);
  }

  function reset() {
    setSquares(Array(9).fill(null));
    setYourTurn(true);
    setStatus("Your move!");
  }

  function renderSquare(i) {
    return (
      <button
        className="ttt-square"
        onClick={() => handleClick(i)}
        disabled={squares[i] || calculateWinner(squares) || !yourTurn}
      >
        {squares[i]}
      </button>
    );
  }

   return (
    <div className="ttt-root">
      {/* Back Button */}
      <button
        onClick={() => navigate("/games")}
        style={{
          background: "#6b46c1",
          color: "#fff",
          border: "none",
          borderRadius: 7,
          padding: "8px 22px",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: "pointer",
          marginBottom: 20
        }}
      >
        ← Back to Games
      </button>
      {/* Game Board */}
      <div className="ttt-board">
        {[0, 1, 2].map(r =>
          <div className="ttt-row" key={r}>
            {renderSquare(r*3)}{renderSquare(r*3+1)}{renderSquare(r*3+2)}
          </div>
        )}
      </div>
      <div className="ttt-status">{status}</div>
      <button className="ttt-reset" onClick={reset}>Reset</button>
      <div style={{marginTop:10, color:"#888"}}>You are <b>X</b> (AI is O)</div>
    </div>
  );
}