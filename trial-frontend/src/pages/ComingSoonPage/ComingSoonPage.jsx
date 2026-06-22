import { useAuth } from "../../context/AuthContext"
import "./ComingSoonPage.css"

export default function ComingSoonPage() {
  const { signOut } = useAuth()

  return (
    <div className="cs">
      {/* NAV */}
      <nav className="cs-nav">
        <div className="cs-nav-in">
          <div className="cs-logo">
            <span className="cs-logo-i">✦</span> CareerMate AI
          </div>
          <button className="cs-nav-out" onClick={signOut}>Sign Out</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="cs-hero">
        <span className="cs-badge">🚧 Under Construction</span>
        <h1 className="cs-h1">Something exciting<br />is on its way</h1>
        <p className="cs-sub">
          We're building powerful AI tools to supercharge your career. Stay tuned —
          resume review and AI coaching features are almost ready.
        </p>
        <div className="cs-pulse-row">
          <span /><span /><span />
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="cs-features">

        {/* Resume Upload Card */}
        <div className="cs-card">
          <div className="cs-card-head">
            <div className="cs-card-icon">📄</div>
            <div>
              <span className="cs-pill">Coming Soon</span>
              <h2 className="cs-card-h">AI Resume Review</h2>
            </div>
          </div>
          <p className="cs-card-body">
            Upload your resume and get instant, actionable feedback powered by AI.
            We'll score it, flag weak points, and rewrite bullet points to pass
            ATS systems and impress recruiters.
          </p>

          <div className="cs-upload-zone">
            <span className="cs-upload-icon">⬆</span>
            <p className="cs-upload-label">Drag &amp; drop your resume here</p>
            <p className="cs-upload-hint">PDF or DOCX · up to 5 MB</p>
            <button className="cs-upload-btn" disabled>Browse Files</button>
          </div>

          <div className="cs-steps-row">
            {[
              { n: "1", label: "Upload Resume" },
              { n: "2", label: "AI Scans" },
              { n: "3", label: "Get Report" },
            ].map((s, i, arr) => (
              <div className="cs-step-item" key={s.n}>
                <div className="cs-step-circle">{s.n}</div>
                <span className="cs-step-label">{s.label}</span>
                {i < arr.length - 1 && <div className="cs-step-line" />}
              </div>
            ))}
          </div>
        </div>

        {/* AI Chat Card */}
        <div className="cs-card">
          <div className="cs-card-head">
            <div className="cs-card-icon">💬</div>
            <div>
              <span className="cs-pill">Coming Soon</span>
              <h2 className="cs-card-h">AI Career Coach</h2>
            </div>
          </div>
          <p className="cs-card-body">
            Chat with your personal AI coach to get tailored suggestions, prep for
            interviews, and refine your career strategy — available 24/7.
          </p>

          <div className="cs-chat-mock">
            <div className="cs-msg cs-msg-ai">
              <span className="cs-av">🤖</span>
              <div className="cs-bubble cs-bubble-ai">
                Hi! I've reviewed your resume. Your summary is strong, but your bullet
                points need more impact metrics. Want me to suggest some rewrites?
              </div>
            </div>
            <div className="cs-msg cs-msg-user">
              <div className="cs-bubble cs-bubble-user">
                Yes please! Can you also help me prep for a software engineer interview?
              </div>
              <span className="cs-av cs-av-user">👤</span>
            </div>
            <div className="cs-msg cs-msg-ai">
              <span className="cs-av">🤖</span>
              <div className="cs-bubble cs-bubble-ai cs-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>

          <div className="cs-chat-input-bar">
            <span className="cs-chat-placeholder">Ask your AI coach anything…</span>
            <button className="cs-chat-send" disabled>➤</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="cs-foot">
        <p>© 2026 CareerMate AI — More features launching soon ✦</p>
      </footer>
    </div>
  )
}
