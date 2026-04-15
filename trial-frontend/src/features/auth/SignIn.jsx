import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./Auth.css"

const API_BASE_URL = import.meta.env.VITE_API_KEY

export default function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }))
    if (serverError) setServerError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.email) errs.email = "Email is required"
    if (!form.password) errs.password = "Password is required"
    if (Object.keys(errs).length) { setErrors(errs); return }

    setServerError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.message || "Invalid email or password")
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
          <Link to="/signup" className="auth-top-link">Get Started</Link>
        </div>

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h2>Welcome Back!</h2>
            <p>Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <div className="auth-form-wrap">
            <h1>Welcome Back</h1>
            <p className="auth-sub">Sign in to continue your career journey.</p>
            <form onSubmit={handleSubmit} noValidate>
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
                  placeholder="Your password"
                />
                {errors.password && <span className="auth-field-err">{errors.password}</span>}
              </div>
              {serverError && <p className="auth-server-err">{serverError}</p>}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
            <p className="auth-switch">
              <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
            </p>
            <p className="auth-switch">
              Don&apos;t have an account?{" "}
              <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        )}
      </div>

      {/* ── Right: Decorative panel ── */}
      <div className="auth-right">
        <div className="auth-panel-card">
          <div className="auth-panel-tag">🎯 Interview Ready</div>
          <p className="auth-panel-title">Practise smarter,<br />land faster.</p>
          <div className="auth-panel-features">
            <span>✓ AI Resume Builder</span>
            <span>✓ Mock Interviews</span>
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
