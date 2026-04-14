const ValidationException = require('../exceptions/ValidationError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(', ');
    throw new ValidationException(message);
  }
  req.body = result.data;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(', ');
    throw new ValidationException(message);
  }
  req.body = result.data;
  next();
};

module.exports = { validate, validateQuery };