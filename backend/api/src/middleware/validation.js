import Joi from 'joi';
import { logger } from '../utils/logger.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }
    req.validatedBody = value;
    return next();
  };
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
  });
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  return res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}

