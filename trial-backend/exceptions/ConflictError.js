const AppError = require('./AppError')

// 409 — the request cannot be completed due to a conflict with existing data
// (e.g. duplicate email on registration).
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409)
  }
}

module.exports = ConflictError
