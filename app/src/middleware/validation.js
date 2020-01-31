const Problem = require('api-problem');
const { customValidators } = require('../components/validators');

const handleValidationErrors = (res, next, errors) => {
  if (errors && errors.length) {
    return new Problem(422, {
      detail: 'Validation failed',
      errors: errors
    }).send(res);
  }

  next();
};

const validateLogging = async (req, res, next) => {
  const errors = await customValidators.logging(req.body);
  handleValidationErrors(res, next, errors);
};

module.exports = { validateLogging };
