const { Redis } = require('ioredis')

// Shared Redis client used for the email-exists cache and rate limiting.
// BullMQ queues and workers manage their own connections — do NOT pass this
// instance to them (BullMQ requires maxRetriesPerRequest: null which would
// break regular cache commands).
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

redis.on('error', (err) => console.error('[Redis] connection error:', err.message))

module.exports = redis
