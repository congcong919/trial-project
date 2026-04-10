const { Worker } = require('bullmq')
const { Redis } = require('ioredis')

// Separate connection for the worker — BullMQ workers use blocking Redis
// commands (BLPOP) to wait for jobs, which requires maxRetriesPerRequest: null
// so ioredis never gives up waiting for a response.
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

// Process one job at a time. Replace the console.log with a real email
// provider call (e.g. SendGrid, AWS SES) when the service is ready.
const worker = new Worker(
  'email',
  async (job) => {
    const { email } = job.data
    // TODO: swap this stub for an actual email SDK call
    console.log(`[emailWorker] Sending welcome email to ${email} (job ${job.id})`)
  },
  { connection }
)

worker.on('completed', (job) => {
  console.log(`[emailWorker] Job ${job.id} completed — welcome email sent to ${job.data.email}`)
})

worker.on('failed', (job, err) => {
  // BullMQ will automatically retry up to the configured attempt limit.
  // This log fires on every failure so ops can monitor recurring problems.
  console.error(
    `[emailWorker] Job ${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts}):`,
    err.message
  )
})

module.exports = worker
