import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import "./Auth.css"

const API_BASE_URL = import.meta.env.VITE_API_KEY

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const resetToken = location.state?.resetToken

  const [form, setForm] = useState({ password: "", confirm: "" })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!email || !resetToken) navigate("/forgot-password", { replace: true })
  }, [email, resetToken, navigate])

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }))
    if (serverError) setServerError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.password) {
      errs.password = "Password is required"
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters"
    } else if (!/[a-zA-Z]/.test(form.password)) {
      errs.password = "Password must contain at least one letter"
    } else if (!/[0-9]/.test(form.password)) {
      errs.password = "Password must contain at least one number"
    }
    if (!form.confirm) {
      errs.confirm = "Please confirm your password"
    } else if (form.confirm !== form.password) {
      errs.confirm = "Passwords do not match"
    }
    if (Object.keys(errs).length) { setErrors(errs); return }

    setServerError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.message || "Could not reset password")
        return
      }
      setSuccess(true)
    } catch {
      setServerError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!email || !resetToken) return null

  if (success) {
    return (
      <div className="fp-root">
        <div className="fp-header">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-i">✦</span> CareerMate AI
          </Link>
        </div>
        <div className="fp-body">
          <div className="fp-success-icon">✓</div>
          <h1 className="fp-title">Reset password successful!</h1>
          <p className="fp-sub">Your password has been updated. You can now sign in with your new password.</p>
          <button className="auth-submit fp-form" onClick={() => navigate("/signin", { replace: true })}>
            Go back Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fp-root">
      <div className="fp-header">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-i">✦</span> CareerMate AI
        </Link>
        <Link to="/verify-code" state={{ email }} className="auth-top-link">Back</Link>
      </div>

      <div className="fp-body">
        <div className="fp-icon-wrap">
          <span className="fp-icon-emoji">🛡️</span>
        </div>
        <h1 className="fp-title">Set a new password</h1>
        <p className="fp-sub">Your new password must be different from previously used passwords.</p>

        <form onSubmit={handleSubmit} noValidate className="fp-form">
          <div className={`auth-field${errors.password ? " has-error" : ""}`}>
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="New password"
            />
            {errors.password && <span className="auth-field-err">{errors.password}</span>}
          </div>
          <div className={`auth-field${errors.confirm ? " has-error" : ""}`}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={handleChange("confirm")}
              placeholder="Confirm new password"
            />
            {errors.confirm && <span className="auth-field-err">{errors.confirm}</span>}
          </div>
          {serverError && <p className="auth-server-err">{serverError}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  )
}
