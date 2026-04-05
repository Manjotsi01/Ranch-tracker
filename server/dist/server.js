"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const compression_1 = __importDefault(require("compression"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = __importDefault(require("./utils/logger"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const dairy_routes_1 = __importDefault(require("./routes/dairy.routes"));
const shop_routes_1 = __importDefault(require("./routes/shop.routes"));
const agriculture_routes_1 = __importDefault(require("./routes/agriculture.routes"));
const app = (0, express_1.default)();
// ── 1. CORS — must be FIRST, before everything else ──────────────────────────
// This is why your requests were blocked: CORS was either missing or
// registered after other middleware, so OPTIONS preflight never got a response.
const allowedOrigins = [
    env_1.env.CLIENT_ORIGIN, // https://ranch-tracker.vercel.app
    'http://localhost:5173', // Vite dev
    'http://localhost:3000', // CRA dev fallback
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, server-to-server, curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        logger_1.default.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`CORS: origin ${origin} is not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true, // allow cookies / Authorization header
    optionsSuccessStatus: 200, // some legacy browsers choke on 204
    maxAge: 86_400, // cache preflight for 24 h
}));
// Explicitly handle OPTIONS for all routes (required for credentials:true)
app.options('*', (0, cors_1.default)());
// ── 2. Security headers ───────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// ── 3. Body parsing ───────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
// ── 4. Sanitize & compress ────────────────────────────────────────────────────
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, compression_1.default)());
// ── 5. Rate limiting ──────────────────────────────────────────────────────────
app.use(env_1.env.BASE_API, rateLimiter_1.apiLimiter);
// ── 6. Health check (no auth required) ───────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env_1.env.NODE_ENV, ts: new Date().toISOString() });
});
// ── 7. API routes ─────────────────────────────────────────────────────────────
const api = env_1.env.BASE_API; // '/api'
app.use(`${api}/auth`, auth_routes_1.default);
app.use(`${api}/dashboard`, dashboard_routes_1.default);
app.use(`${api}/dairy`, dairy_routes_1.default);
app.use(`${api}/shop`, shop_routes_1.default);
app.use(`${api}/agriculture`, agriculture_routes_1.default);
// ── 8. 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// ── 9. Global error handler — must be last ────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ── 10. Start ─────────────────────────────────────────────────────────────────
const start = async () => {
    await (0, db_1.connectDB)();
    app.listen(env_1.env.PORT, () => {
        logger_1.default.info(`Server running on port ${env_1.env.PORT} [${env_1.env.NODE_ENV}]`);
        logger_1.default.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
    });
};
start().catch((err) => {
    logger_1.default.error('Fatal startup error:', err);
    process.exit(1);
});
exports.default = app;
