import { useState } from "react";

function App() {
  const [code, setCode] = useState("");
  const [response, setResponse] = useState("");

  const handleReview = async () => {
    try {
      const res = await fetch("http://localhost:8000/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Code Reviewer 🚀</h1>

      <textarea
        rows="10"
        cols="60"
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleReview}>Review Code</button>

      <h3>Response:</h3>
      <pre>{response}</pre>
    </div>
  );
}

export default App;
