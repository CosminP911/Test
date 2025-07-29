import React, { useState, useEffect, useRef } from "react";
import "./MathQuiz.css";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const ops = ["+", "-", "*", "/"];
  const op = ops[randomInt(0, ops.length - 1)];
  let a = randomInt(2, 30), b = randomInt(2, 30);
  if (op === "/") {
    a = a * b; // ensures integer division
  }
  let answer;
  switch (op) {
    case "+": answer = a + b; break;
    case "-": answer = a - b; break;
    case "*": answer = a * b; break;
    case "/": answer = a / b; break;
    default: answer = 0;
  }
  return { question: `${a} ${op} ${b} = ?`, answer, op };
}

const TOTAL_QUESTIONS = 8;
const TIME_PER_QUESTION = 10; // seconds

export default function MathQuiz() {
  const [step, setStep] = useState(0);
  const [currentQ, setCurrentQ] = useState(generateQuestion());
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    if (step >= TOTAL_QUESTIONS) return;
    setTimeLeft(TIME_PER_QUESTION);
    setShowAnswer(false);
    setCurrentQ(generateQuestion());
    setUserAnswer("");
  }, [step]);

  useEffect(() => {
    if (step >= TOTAL_QUESTIONS) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowAnswer(true);
          setTimeout(() => setStep(s => s + 1), 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showAnswer) return;
    clearInterval(timerRef.current);
    const correct = parseFloat(userAnswer) === currentQ.answer;
    setShowAnswer(true);
    if (correct) setScore(s => s + 1);
    setTimeout(() => setStep(s => s + 1), 1200);
  };

  const handleRestart = () => {
    setStep(0);
    setScore(0);
    setTimeLeft(TIME_PER_QUESTION);
  };

  if (step >= TOTAL_QUESTIONS) {
    return (
      <div className="quiz-root">
        <div className="quiz-card">
          <h2>Quiz Finished!</h2>
          <div className="quiz-score">Your score: {score} / {TOTAL_QUESTIONS}</div>
          <button className="quiz-btn" onClick={handleRestart}>Restart</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-root">
      <div className="quiz-card">
        <div className="quiz-header">
          <div>Question {step + 1} / {TOTAL_QUESTIONS}</div>
          <div className="quiz-timer">{timeLeft} sec</div>
        </div>
        <div className="quiz-question">{currentQ.question}</div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            className="quiz-input"
            type="number"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            disabled={showAnswer}
            autoFocus
            step="any"
          />
          <button className="quiz-btn" type="submit" disabled={showAnswer}>
            Submit
          </button>
        </form>
        <div className="quiz-status">
          {showAnswer && (
            parseFloat(userAnswer) === currentQ.answer
              ? <span style={{ color: "green" }}>Correct!</span>
              : <span style={{ color: "red" }}>Wrong! Correct answer: <b>{currentQ.answer}</b></span>
          )}
        </div>
      </div>
    </div>
  );
}
