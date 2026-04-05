"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const user_1 = __importDefault(require("../models/user"));
const errorHandler_1 = require("../middleware/errorHandler");
const registerUser = async (data) => {
    if (await user_1.default.exists({ email: data.email })) {
        throw (0, errorHandler_1.createError)('Email already in use', 409, 'EMAIL_TAKEN');
    }
    const hashed = await bcryptjs_1.default.hash(data.password, 12);
    const user = await user_1.default.create({ ...data, password: hashed });
    return buildResponse(user);
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await user_1.default.findOne({ email }).select('+password');
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        throw (0, errorHandler_1.createError)('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }
    await user_1.default.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    return buildResponse(user);
};
exports.loginUser = loginUser;
const buildResponse = (user) => {
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
    return {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
};
