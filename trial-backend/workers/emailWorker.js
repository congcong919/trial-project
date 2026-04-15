const { Worker } = require('bullmq')
const { Redis } = require('ioredis')


const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Separate connection for the worker — BullMQ workers use blocking Redis
// commands (BLPOP) to wait for jobs, which requires maxRetriesPerRequest: null
// so ioredis never gives up waiting for a response.
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})


const worker = new Worker(
  'email',
  async (job) => {
    if (job.name === 'welcome') {
      const { email, fullName } = job.data
      await sgMail.send({
        to: email,
        from: process.env.EMAIL_FROM,
        templateId: process.env.SENDGRID_TEMPLATE_Registration_ID,
        dynamicTemplateData: { fullName },
      })
      console.log(`[emailWorker] Welcome email sent to ${email} (job ${job.id})`)
    } else if (job.name === 'reset-code') {
      const { email, code } = job.data
      await sgMail.send({
        to: email,
        from: process.env.EMAIL_FROM,
        templateId: process.env.SENDGRID_TEMPLATE_ResetPassword_ID,
        dynamicTemplateData: { code }
      })
      console.log(`[emailWorker] Reset-code email sent to ${email} (job ${job.id})`)
    }
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
