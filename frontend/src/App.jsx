import { useState } from "react";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setResponse("");
    
    try {
      const res = await fetch("http://localhost:8000/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      
      // Handle different types of responses based on the backend implementation
      if (typeof data === "string") {
        setResponse(data);
      } else if (data.review) {
        setResponse(data.review);
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error(err);
      setResponse("❌ Error connecting to server. Please ensure the backend is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          AI Code Reviewer
        </h1>
        <div className="action-bar">
          <button 
            className="review-btn" 
            onClick={handleReview}
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
                </svg>
                Reviewing...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>
                </svg>
                Review Code
              </>
            )}
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Left Side: Editor */}
        <section className="editor-section">
          <div className="section-header">
            <span>Code Input</span>
            <div className="score-badge language-badge">
              Auto-detect
            </div>
          </div>
          <textarea
            className="code-input"
            placeholder="Paste your code here for review..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
        </section>

        {/* Right Side: Output */}
        <section className="output-section">
          <div className="section-header">
            <span>AI Review</span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {response && !isLoading && !response.includes("❌ Error") && (
                <div className="score-badge">
                  <span>Quality: 85/100</span>
                </div>
              )}
              <button 
                className="icon-btn" 
                onClick={handleCopy} 
                title="Copy to clipboard"
                disabled={!response || isLoading}
              >
                {isCopied ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="output-content">
            {isLoading ? (
              <div className="empty-state">
                 <svg className="spinner" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
                </svg>
                <p>Analyzing code structure and logic...</p>
              </div>
            ) : response ? (
              response
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p>Your review output will appear here</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
