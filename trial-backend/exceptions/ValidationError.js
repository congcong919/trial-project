const AppError = require('./AppError')

// 400 — the request body is missing a required field or fails a format check.
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400)
  }
}

module.exports = ValidationError
