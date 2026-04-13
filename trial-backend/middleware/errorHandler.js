const { AppError } = require('../exceptions')

// Central Express error handler — must be registered LAST in server.js.
// Any route that calls next(err) or throws inside an async wrapper lands here.
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  // Known operational errors: return status + message directly to the client.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  // Mongoose duplicate-key error — can occur in a race condition even after
  // an explicit existence check, so we handle it here as a safety net.
  if (err.code === 11000) {
    return res.status(409).json({ message: 'This email is already registered' })
  }

  // Unexpected errors: log for debugging, return a generic message so internal
  // details are never leaked to the client.
  console.error(err)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
}
