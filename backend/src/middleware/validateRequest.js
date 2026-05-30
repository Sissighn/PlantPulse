function validateRequest(schemas = {}) {
  return (req, res, next) => {
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
  };
}

module.exports = {
  validateRequest,
};
