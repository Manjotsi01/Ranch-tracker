"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.createError = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const env_1 = require("../config/env");
const createError = (message, statusCode = 500, errorCode = 'INTERNAL_ERROR') => {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.errorCode = errorCode;
    err.isOperational = true;
    return err;
};
exports.createError = createError;
const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode ?? 500;
    const message = err.isOperational
        ? err.message
        : 'An unexpected error occurred';
    logger_1.default.error(`${req.method} ${req.path} → ${statusCode}: ${err.message}`, err);
    res.status(statusCode).json({
        success: false,
        message,
        errorCode: err.errorCode ?? 'SERVER_ERROR',
        ...(env_1.env.isProd() ? {} : { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
