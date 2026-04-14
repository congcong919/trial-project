const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("./user/user.model")
const redis = require("./config/redis")
const emailQueue = require("./queues/emailQueue")
const { authRegisterRateLimiter, authLoginRateLimiter } = require("./middleware/rateLimiter")
const { ValidationError, ConflictError, UnauthorizedError } = require("./exceptions")

const ACCESS_SECRET  = process.env.JWT_SECRET     || "access_secret_change_in_production"
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret_change_in_production"

// TTL for the email-exists cache key (1 hour in seconds)
const EMAIL_CACHE_TTL = 60 * 60
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function issueTokens(res, userId) {
  const accessToken  = jwt.sign({ userId }, ACCESS_SECRET,  { expiresIn: "15m" })
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge:   parseInt(process.env.REFRESH_COOKIE_MAX_AGE),
    path:     "/api/auth",
  })

  return accessToken
}

// POST /auth/register
router.post("/register", authRegisterRateLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !name.trim())    throw new ValidationError("Full name is required")
    if (!email)                   throw new ValidationError("Email is required")
    if (!EMAIL_RE.test(email))    throw new ValidationError("Please enter a valid email address")
    if (!password)                throw new ValidationError("Password is required")
    if (password.length < 6)      throw new ValidationError("Password must be at least 6 characters")

    // Check Redis cache before hitting MongoDB — avoids a DB round-trip for
    // emails we know are already registered (cached for 1 hour after sign-up).
    // Redis failure is non-fatal: fall through to the DB check.
    const cacheKey = `email_exists:${email.toLowerCase().trim()}`
    try {
      const cached = await redis.get(cacheKey)
      if (cached) throw new ConflictError("This email is already registered")
    } catch (err) {
      if (err instanceof ConflictError) throw err
      // Redis unavailable — proceed to DB check
    }

    const existing = await User.findOne({ email })
    if (existing) throw new ConflictError("This email is already registered")

    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ fullName: name.trim(), email, password: hashed })
    await user.save()

    // Cache the email so future duplicate sign-up attempts are short-circuited
    // in Redis without touching the database. Non-fatal if Redis is unavailable.
    try {
      await redis.set(cacheKey, "1", "EX", EMAIL_CACHE_TTL)
    } catch { /* Redis unavailable — non-critical, proceed */ }

    // Enqueue the welcome email — fire and forget so the 201 is returned
    // immediately without waiting for the email provider to respond.
    emailQueue.add("welcome", { email })

    const accessToken = issueTokens(res, user._id)
    res.status(201).json({ accessToken })
  } catch (err) {
    next(err)
  }
})

// POST /auth/login
router.post("/login", authLoginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email)    throw new ValidationError("Email is required")
    if (!password) throw new ValidationError("Password is required")

    const user = await User.findOne({ email })
    if (!user) {
      // Return the same message whether the email is unknown or the password is
      // wrong — prevents user enumeration via differing error responses.
      throw new UnauthorizedError("Invalid email or password")
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new UnauthorizedError("Invalid email or password")

    const accessToken = issueTokens(res, user._id)
    res.json({ accessToken })
  } catch (err) {
    next(err)
  }
})

router.post("/refresh", (req, res, next) => {
  const token = req.cookies.refreshToken
  if (!token) return next(new UnauthorizedError("No refresh token"))
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET)
    const accessToken = issueTokens(res, decoded.userId)
    res.json({ accessToken })
  } catch {
    res.clearCookie("refreshToken", { path: "/api/auth" })
    next(new UnauthorizedError("Invalid or expired refresh token"))
  }
})

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth" })
  res.json({ success: true })
})

module.exports = router
