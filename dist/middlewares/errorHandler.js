"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = require("../utils/logger");
function notFoundHandler(req, res) {
    res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}`, data: null });
}
function errorHandler(err, req, res, _next) {
    if (err instanceof apiResponse_1.ApiError) {
        if (err.statusCode >= 500)
            logger_1.logger.error(err.message, { stack: err.stack });
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors ?? undefined,
            data: null,
        });
    }
    const anyErr = err;
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
    logger_1.logger.error('Unhandled error', { error: anyErr });
    return res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later',
        data: null,
    });
}
//# sourceMappingURL=errorHandler.js.map