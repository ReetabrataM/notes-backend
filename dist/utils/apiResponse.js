"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200, meta) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            ...(meta ? { meta } : {}),
        });
    }
    static created(res, data, message = 'Created successfully') {
        return this.success(res, data, message, 201);
    }
    static noContent(res, message = 'Deleted successfully') {
        return res.status(200).json({ success: true, message, data: null });
    }
}
exports.ApiResponse = ApiResponse;
class ApiError extends Error {
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message = 'Bad request', errors) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }
    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }
    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }
    static internal(message = 'Internal server error') {
        return new ApiError(500, message);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=apiResponse.js.map