import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./Auth.css"

const API_BASE_URL = import.meta.env.VITE_API_KEY

export default function SignUp() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = "Name is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format"
    if (form.password.length < 6) e.password = "Password must be at least 6 characters"
    if (form.confirm !== form.password) e.confirm = "Passwords do not match"
    return e
  }

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }))
    if (serverError) setServerError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setServerError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.message || "Registration failed")
        return
      }
      setSuccess(true)
      setTimeout(() => { signIn(data.accessToken); navigate("/todos", { replace: true }) }, 1500)
    } catch {
      setServerError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-root">
      {/* ── Left: Form ── */}
      <div className="auth-left">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-i">✦</span> CareerMate AI
          </Link>
          <Link to="/signin" className="auth-top-link">Sign In</Link>
        </div>

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h2>Account Created!</h2>
            <p>Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <div className="auth-form-wrap">
            <h1>Create Your Account</h1>
            <p className="auth-sub">Start practising smarter today — it&apos;s free.</p>
            <form onSubmit={handleSubmit} noValidate>
              <div className={`auth-field${errors.name ? " has-error" : ""}`}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Jane Smith"
                />
                {errors.name && <span className="auth-field-err">{errors.name}</span>}
              </div>
              <div className={`auth-field${errors.email ? " has-error" : ""}`}>
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="auth-field-err">{errors.email}</span>}
              </div>
              <div className={`auth-field${errors.password ? " has-error" : ""}`}>
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Min. 6 characters"
                />
                {errors.password && <span className="auth-field-err">{errors.password}</span>}
              </div>
              <div className={`auth-field${errors.confirm ? " has-error" : ""}`}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={handleChange("confirm")}
                  placeholder="Repeat your password"
                />
                {errors.confirm && <span className="auth-field-err">{errors.confirm}</span>}
              </div>
              {serverError && <p className="auth-server-err">{serverError}</p>}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>
            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/signin">Sign In</Link>
            </p>
          </div>
        )}
      </div>

      {/* ── Right: Decorative panel ── */}
      <div className="auth-right">
        <div className="auth-panel-card">
          <div className="auth-panel-tag">🚀 AI-Powered Career Coach</div>
          <p className="auth-panel-title">Your career,<br />supercharged by AI.</p>
          <div className="auth-panel-features">
            <span>✓ AI Resume Builder</span>
            <span>✓ Mock Interviews</span>
            <span>✓ Cover Letter Generator</span>
            <span>✓ Job Match Score</span>
          </div>
        </div>
        <div className="auth-panel-social">
          <div className="auth-panel-avatars">
            <span>👩🏾‍💻</span>
            <span>👨🏻‍💼</span>
            <span>👩🏽‍🎓</span>
            <span>👨🏿‍💻</span>
          </div>
          <p>Joined by <strong>10,000+</strong> students worldwide</p>
        </div>
      </div>
    </div>
  )
}
