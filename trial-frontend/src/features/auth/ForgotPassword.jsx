import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./Auth.css"

const API_BASE_URL = import.meta.env.VITE_API_KEY

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError("Email is required"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email format"); return }

    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Something went wrong")
        return
      }
      navigate("/verify-code", { state: { email } })
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fp-root">
      <div className="fp-header">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-i">✦</span> CareerMate AI
        </Link>
        <Link to="/signin" className="auth-top-link">Back</Link>
      </div>

      <div className="fp-body">
        <div className="fp-icon-wrap">
          <span className="fp-icon-emoji">🔑</span>
        </div>
        <h1 className="fp-title">Forgot your password?</h1>
        <p className="fp-sub">Please enter your email address to receive a verification code.</p>

        <form onSubmit={handleSubmit} noValidate className="fp-form">
          <div className={`auth-field${error ? " has-error" : ""}`}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
              placeholder="you@example.com"
            />
            {error && <span className="auth-field-err">{error}</span>}
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}
