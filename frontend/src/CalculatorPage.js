import React, { useState } from "react";
import "./App.css";

function CalculatorPage() {
  const [operation, setOperation] = useState("pow");
  const [inputData, setInputData] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const opLabels = {
    pow: "Power (enter: base,exponent e.g. 2,5)",
    fibonacci: "Fibonacci (enter: n e.g. 10)",
    factorial: "Factorial (enter: n e.g. 5)"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    let payload = { operation, input_data: inputData };
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch("http://localhost:8000/calculate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (resp.status === 401) {
        setErr("Session expired. Please login again.");
        // optional: auto logout
        // onLogout();
        return;
      }
      if (!resp.ok) throw new Error("Calculation failed.");
      const data = await resp.json();
      setResult(data.result);
    } catch (error) {
      setErr("Could not calculate. Check your backend or input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{maxWidth: "440px", margin: "auto"}}>
      <h1>Math Microservice Calc</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="operation">Operation</label>
        <select
          id="operation"
          value={operation}
          onChange={(e) => {
            setOperation(e.target.value);
            setInputData(""); setResult(null);
          }}
        >
          <option value="pow">Power</option>
          <option value="fibonacci">Fibonacci</option>
          <option value="factorial">Factorial</option>
        </select>
        <label htmlFor="inputData">{opLabels[operation]}</label>
        <input
          id="inputData"
          type="text"
          value={inputData}
          placeholder={opLabels[operation]}
          onChange={(e) => setInputData(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </form>
      {err && <div className="result" style={{ color: "#e53e3e", background: "#fff5f5" }}>{err}</div>}
      {result !== null && !err && (
        <div className="result">Result: {result}</div>
      )}
    </div>
  );
}

export default CalculatorPage;
