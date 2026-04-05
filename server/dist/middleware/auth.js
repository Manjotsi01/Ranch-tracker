"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
const protect = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        (0, response_1.sendError)(res, 'Not authorized — no token provided', 401);
        return;
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch (err) {
        const msg = err instanceof jsonwebtoken_1.default.TokenExpiredError
            ? 'Token expired — please log in again'
            : 'Token invalid';
        (0, response_1.sendError)(res, msg, 401);
    }
};
exports.protect = protect;
const requireRole = (...roles) => (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
        (0, response_1.sendError)(res, 'Forbidden — insufficient permissions', 403);
        return;
    }
    next();
};
exports.requireRole = requireRole;
