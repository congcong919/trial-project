const { Queue } = require('bullmq')
const { Redis } = require('ioredis')

// BullMQ requires its own ioredis connection with maxRetriesPerRequest: null
// so that it can block indefinitely waiting for jobs — a standard connection
// would time out those blocking commands.
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    // Retry up to 3 times using exponential backoff: 1s → 2s → 4s.
    // This handles transient failures (e.g. email provider blip) without
    // hammering the service on every failure.
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})

module.exports = emailQueue
