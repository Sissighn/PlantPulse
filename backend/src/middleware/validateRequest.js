const { sendValidationError } = require("../validation/requestSchemas");

function validateRequest(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params || {});
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query || {});
      }

      if (schemas.body) {
        req.body = schemas.body.parse(req.body || {});
      }

      next();
    } catch (error) {
      if (sendValidationError(res, error)) return;
      next(error);
    }
  };
}

module.exports = {
  validateRequest,
};
