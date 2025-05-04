"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.success = false;
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, CustomError);
    }
}
exports.CustomError = CustomError;
