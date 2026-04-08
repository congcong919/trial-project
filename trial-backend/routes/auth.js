const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const redis = require("../config/redis")
const emailQueue = require("../queues/emailQueue")
const {authRegisterRateLimiter, authLoginRateLimiter} = require("../middleware/rateLimiter")

const ACCESS_SECRET  = process.env.JWT_SECRET      || "access_secret_change_in_production"
const REFRESH_SECRET = process.env.REFRESH_SECRET  || "refresh_secret_change_in_production"

// TTL for the email-exists cache key (1 hour in seconds)
const EMAIL_CACHE_TTL = 60 * 60

function issueTokens(res, userId) {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" })
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: parseInt(process.env.REFRESH_COOKIE_MAX_AGE),
    path: "/api/auth",
  })

  return accessToken
}

// POST /auth/register
// Rate limiter applied here (not globally) so only auth endpoints are throttled.
router.post("/register", authRegisterRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    // Check Redis cache before hitting MongoDB — avoids a DB round-trip for
    // emails we know are already registered (cached for 1 hour after sign-up).
    const cacheKey = `email_exists:${email}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return res.status(409).json({ message: "Email already in use" })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: "Email already in use" })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ email, password: hashed })
    await user.save()

    // Cache the email so future duplicate sign-up attempts are short-circuited
    // in Redis without touching the database.
    await redis.set(cacheKey, '1', 'EX', EMAIL_CACHE_TTL)

    // Enqueue the welcome email — fire and forget so the 201 is returned
    // immediately without waiting for the email provider to respond.
    emailQueue.add('welcome', { email })

    const accessToken = issueTokens(res, user._id)
    res.status(201).json({ accessToken })
  } catch (err) {
    res.status(500).json({ message: "Registration failed" })
  }
})

// POST /auth/login
// Rate limiter applied here to protect against brute-force password guessing.
router.post("/login", authLoginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const accessToken = issueTokens(res, user._id)
    res.json({ accessToken })
  } catch (err) {
    res.status(500).json({ message: "Login failed" })
  }
})

router.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) {
    return res.status(401).json({ message: "No refresh token" })
  }
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET)
    const accessToken = issueTokens(res, decoded.userId)
    res.json({ accessToken })
  } catch {
    res.clearCookie("refreshToken", { path: "/api/auth" })
    res.status(401).json({ message: "Invalid or expired refresh token" })
  }
})

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth" })
  res.json({ success: true })
})

module.exports = router
