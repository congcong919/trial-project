const AppError = require('./AppError')

// 401 — the request lacks valid authentication credentials.
class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401)
  }
}

module.exports = UnauthorizedError
