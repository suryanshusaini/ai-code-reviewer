import { useState, useRef } from "react";
import "./App.css";

// ─── Icons (inline SVG helpers) ──────────────────────────────────────────────
const Icon = {
  Code: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Bot: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <line x1="12" y1="3" x2="12" y2="7" />
      <circle cx="9" cy="16" r="1" fill="currentColor" />
      <circle cx="15" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Loader: () => (
    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="4.93" x2="19.07" y2="7.76" />
    </svg>
  ),
  File: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
};

// ─── Score badge ─────────────────────────────────────────────────────────────
function ScoreBadge({ errors = [], improvements = [] }) {
  const score = Math.max(0, 100 - errors.length * 15 - improvements.length * 5);
  const cls = score >= 80 ? "score-high" : score >= 50 ? "score-mid" : "score-low";
  return (
    <span className={`score-badge ${cls}`} title="Code Quality Score">
      {score}/100
    </span>
  );
}

// ─── Review block ─────────────────────────────────────────────────────────────
function ReviewBlock({ kind, items }) {
  const configs = {
    errors:   { label: "❌  Errors",        cls: "errors"   },
    warnings: { label: "⚠   Improvements",  cls: "warnings" },
    success:  { label: "✅  Good Practices", cls: "success"  },
  };
  const { label, cls } = configs[kind];

  return (
    <div className="review-block">
      <div className={`review-block-header ${cls}`}>{label}</div>
      <div className="review-block-body">
        {items && items.length > 0 ? (
          <ul>
            {items.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        ) : (
          <p className="none-text">None</p>
        )}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [code, setCode] = useState("");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeMode, setActiveMode] = useState("review"); // current button tab
  const textareaRef = useRef(null);

  // ── Tab key → insert 2 spaces, cursor stays in place ──────────────────────
  const handleKeyDown = (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();

    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const spaces = "  "; // 2 spaces

    // Insert spaces using document.execCommand so undo history is preserved
    // Fallback: manual string splice
    const newCode = code.substring(0, start) + spaces + code.substring(end);
    setCode(newCode);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + spaces.length;
    });
  };

  // ── API call ───────────────────────────────────────────────────────────────
  const handleAction = async (mode) => {
    if (!code.trim()) return;
    setIsLoading(true);
    setResponse(null);
    setActiveMode(mode);

    try {
      const res = await fetch("http://localhost:8000/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, mode }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResponse({ mode, data: data.review });
    } catch (err) {
      console.error(err);
      // Fallback
      if (mode === "review") {
        setResponse({
          mode,
          data: { errors: [], improvements: [], goodPractices: [], isFallback: true },
        });
      } else {
        setResponse({ mode, data: "⚠ AI unavailable — showing basic analysis.", isFallback: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Copy output to clipboard ───────────────────────────────────────────────
  const handleCopy = () => {
    if (!response) return;
    let text = "";
    if (response.mode === "review" && typeof response.data === "object") {
      const d = response.data;
      text =
        `❌ Errors:\n${(d.errors || []).map((e) => "- " + e).join("\n") || "None"}\n\n` +
        `⚠ Improvements:\n${(d.improvements || []).map((e) => "- " + e).join("\n") || "None"}\n\n` +
        `✅ Good Practices:\n${(d.goodPractices || []).map((e) => "- " + e).join("\n") || "None"}`;
    } else {
      text = String(response.data);
    }
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // ── Output renderer ────────────────────────────────────────────────────────
  const renderOutput = () => {
    if (isLoading) {
      return (
        <div className="state-center">
          <Icon.Loader />
          <p>
            {activeMode === "fix"
              ? "Applying fixes…"
              : activeMode === "explain"
              ? "Generating explanation…"
              : "Analyzing code…"}
          </p>
        </div>
      );
    }

    if (!response) {
      return (
        <div className="state-center">
          <Icon.File />
          <p>Review output will appear here</p>
        </div>
      );
    }

    if (response.mode === "review" && typeof response.data === "object") {
      const d = response.data;
      return (
        <>
          {d.isFallback && (
            <div className="fallback-banner">
              ⚠ AI unavailable — showing basic fallback analysis
            </div>
          )}
          <ReviewBlock kind="errors"   items={d.errors} />
          <ReviewBlock kind="warnings" items={d.improvements} />
          <ReviewBlock kind="success"  items={d.goodPractices} />
        </>
      );
    }

    // fix / explain → plain pre-formatted text
    return <div className="text-output">{response.data}</div>;
  };

  // ── Panel tab label ────────────────────────────────────────────────────────
  const outputLabel =
    activeMode === "fix" ? "Fixed Code" : activeMode === "explain" ? "Explanation" : "AI Review";

  // ── Score (only for completed review) ─────────────────────────────────────
  const showScore =
    !isLoading &&
    response?.mode === "review" &&
    typeof response.data === "object" &&
    !response.data.isFallback;

  return (
    <div className="app">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-left">
          <Icon.Code />
          <span className="topbar-title">AI Code Reviewer</span>
        </div>

        <div className="topbar-right">
          <button
            id="btn-review"
            className={`btn ${activeMode === "review" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => handleAction("review")}
            disabled={isLoading || !code.trim()}
          >
            Review Code
          </button>

          <button
            id="btn-fix"
            className={`btn ${activeMode === "fix" ? "btn-active" : "btn-ghost"}`}
            onClick={() => handleAction("fix")}
            disabled={isLoading || !code.trim()}
          >
            Fix Code
          </button>

          <div className="btn-divider" />

          <button
            id="btn-explain"
            className={`btn ${activeMode === "explain" ? "btn-active" : "btn-ghost"}`}
            onClick={() => handleAction("explain")}
            disabled={isLoading || !code.trim()}
          >
            Explain
          </button>
        </div>
      </header>

      {/* ── Workspace ───────────────────────────────────────────── */}
      <div className="workspace">
        {/* LEFT — Code Editor */}
        <div className="panel">
          <div className="panel-tab">
            <div className="panel-tab-name">
              <Icon.Code />
              input.code
            </div>
            <div className="panel-tab-actions">
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {code.split("\n").length} ln
              </span>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            id="code-input"
            className="code-editor"
            placeholder={"// Paste your code here…\n// Press Tab to indent"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* RIGHT — Output */}
        <div className="panel">
          <div className="panel-tab">
            <div className="panel-tab-name">
              <Icon.Bot />
              {outputLabel}
              {isLoading && (
                <span style={{ color: "var(--warning)", fontSize: "11px" }}>Analyzing…</span>
              )}
            </div>
            <div className="panel-tab-actions">
              {showScore && (
                <ScoreBadge
                  errors={response.data.errors}
                  improvements={response.data.improvements}
                />
              )}
              <button
                id="btn-copy"
                className="btn-icon"
                onClick={handleCopy}
                disabled={!response || isLoading}
                title="Copy output"
              >
                {isCopied ? <Icon.Check /> : <Icon.Copy />}
              </button>
            </div>
          </div>

          <div className="output-body">{renderOutput()}</div>
        </div>
      </div>
    </div>
  );
}
