import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}`, data: null });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logger.error(err.message, { stack: err.stack });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors ?? undefined,
      data: null,
    });
  }

  const anyErr = err as any;

  // Mongoose duplicate key
  if (anyErr?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
      data: null,
    });
  }

  // Mongoose validation error
  if (anyErr?.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: anyErr.errors,
      data: null,
    });
  }

  logger.error('Unhandled error', { error: anyErr });
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later',
    data: null,
  });
}
