import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import "./Auth.css"

const API_BASE_URL = import.meta.env.VITE_API_KEY

export default function VerifyCode() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState("")
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true })
  }, [email, navigate])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = cleaned
    setDigits(next)
    setError("")
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return
    const next = [...digits]
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || ""
    }
    setDigits(next)
    const focusIdx = Math.min(pasted.length, 5)
    inputRefs.current[focusIdx]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = digits.join("")
    if (code.length < 6) { setError("Please enter the 6-digit code"); return }

    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Invalid or expired code")
        return
      }
      navigate("/reset-password", { state: { email, resetToken: data.data.resetToken } })
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendMsg("")
    setResendLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setDigits(["", "", "", "", "", ""])
        setResendMsg("A new code has been sent.")
        inputRefs.current[0]?.focus()
      } else {
        setResendMsg("Could not resend. Please try again.")
      }
    } catch {
      setResendMsg("Network error. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  if (!email) return null

  return (
    <div className="fp-root">
      <div className="fp-header">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-i">✦</span> CareerMate AI
        </Link>
        <Link to="/forgot-password" className="auth-top-link">Back</Link>
      </div>

      <div className="fp-body">
        <div className="fp-icon-wrap">
          <span className="fp-icon-emoji">✉️</span>
        </div>
        <h1 className="fp-title">Check your email</h1>
        <p className="fp-sub">
          We sent a verification code to<br />
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit} noValidate className="fp-form">
          <div className={`fp-otp-row${error ? " fp-otp-error" : ""}`} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className={`fp-otp-input${error ? " has-error" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>
          {error && <p className="auth-server-err">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Verifying…" : "Next"}
          </button>
        </form>

        <p className="fp-resend">
          Didn&apos;t get the code?{" "}
          <button onClick={handleResend} disabled={resendLoading}>
            {resendLoading ? "Sending…" : "Send it again"}
          </button>
        </p>
        {resendMsg && <p className="fp-resend-msg">{resendMsg}</p>}
      </div>
    </div>
  )
}
