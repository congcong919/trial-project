const AppError = require('./AppError')

// 404 — the requested resource does not exist.
class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404)
  }
}

module.exports = NotFoundError
