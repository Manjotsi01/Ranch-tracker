"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const rateLimiter_1 = require("../middleware/rateLimiter");
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const user_1 = __importDefault(require("../models/user"));
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    }),
});
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(60),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8).max(72),
        role: zod_1.z.enum(['OWNER', 'WORKER', 'VIEWER']).optional().default('VIEWER'),
    }),
});
const signToken = (id, role) => jsonwebtoken_1.default.sign({ id, role }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
router.post('/register', rateLimiter_1.authLimiter, (0, validate_1.validate)(registerSchema), async (req, res) => {
    const { name, email, password, role } = req.body;
    const exists = await user_1.default.findOne({ email });
    if (exists) {
        (0, response_1.sendError)(res, 'Email already registered', 409);
        return;
    }
    const hashed = await bcryptjs_1.default.hash(password, 12);
    const user = await user_1.default.create({ name, email, password: hashed, role });
    const token = signToken(String(user._id), user.role);
    (0, response_1.sendSuccess)(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 201);
});
router.post('/login', rateLimiter_1.authLimiter, (0, validate_1.validate)(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    const user = await user_1.default.findOne({ email }).select('+password');
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        (0, response_1.sendError)(res, 'Invalid email or password', 401);
        return;
    }
    const token = signToken(String(user._id), user.role);
    (0, response_1.sendSuccess)(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
router.get('/me', async (req, res) => {
    (0, response_1.sendSuccess)(res, { message: 'Auth check OK' });
});
exports.default = router;
