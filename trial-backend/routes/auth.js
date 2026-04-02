const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const ACCESS_SECRET  = process.env.JWT_SECRET      || "access_secret_change_in_production"
const REFRESH_SECRET = process.env.REFRESH_SECRET  || "refresh_secret_change_in_production"

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000  // 7 days in ms

function issueTokens(res, userId) {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" })
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: "/api/auth",
  })

  return accessToken
}

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: "Email already in use" })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ email, password: hashed })
    await user.save()
    const accessToken = issueTokens(res, user._id)
    res.status(201).json({ accessToken })
  } catch (err) {
    res.status(500).json({ message: "Registration failed" })
  }
})

router.post("/login", async (req, res) => {
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
