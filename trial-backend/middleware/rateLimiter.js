const rateLimit = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const redis = require('../config/redis')

// Shared across all server instances because limits are stored in Redis rather
// than in-process memory — a request to instance A counts toward the same
// bucket as a request to instance B for the same IP.
const createAuthRateLimiter = (name) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: `rl:${name}:`,
    }),
    handler: (_req, res) => {
      res.status(429).json({ message: 'Too many attempts, please try again in 15 minutes' })
    },
  })

const authRegisterRateLimiter = createAuthRateLimiter('register')
const authLoginRateLimiter    = createAuthRateLimiter('login')

// const authLoginRateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 5,                  // max 5 requests per IP per window

//   // RateLimit-Policy, RateLimit, and Retry-After headers so clients know
//   // how long to back off without having to guess.
//   standardHeaders: 'draft-8',
//   legacyHeaders: false,
//   identifier: 'login',
//   store: new RedisStore({
//     // ioredis exposes Redis commands through .call(); rate-limit-redis uses
//     // this abstraction so it stays client-library agnostic.
//     sendCommand: (...args) => redis.call(...args),
//   }),

//   // Override the default handler so the response shape matches the rest of
//   // the API (JSON with a "message" key).
//   handler: (_req, res) => {
//     res.status(429).json({ message: 'Too many attempts, please try again in 15 minutes' })
//   },
// })

module.exports = {
  authRegisterRateLimiter,
  authLoginRateLimiter
}
