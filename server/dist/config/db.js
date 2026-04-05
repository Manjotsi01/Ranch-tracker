"use strict";
// Path: ranch-tracker/server/src/config/db.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = __importDefault(require("../utils/logger"));
const connectDB = async () => {
    try {
        mongoose_1.default.set('strictQuery', true);
        const conn = await mongoose_1.default.connect(env_1.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45_000,
        });
        logger_1.default.info(`MongoDB connected: ${conn.connection.host}`);
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.default.error(`MongoDB runtime error: ${err.message}`);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.default.warn('MongoDB disconnected — attempting reconnect');
        });
    }
    catch (error) {
        logger_1.default.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
