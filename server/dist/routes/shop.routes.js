"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/shop.routes.ts
const express_1 = require("express");
const shop_controller_1 = require("../controllers/shop.controller");
const router = (0, express_1.Router)();
// ── Stats ──────────────────────────────────────────────────────────────────
router.get('/stats', shop_controller_1.getStatsHandler);
// ── Batches ────────────────────────────────────────────────────────────────
router.get('/batches', shop_controller_1.getBatchesHandler);
router.post('/batches', shop_controller_1.createBatchHandler);
router.get('/batches/:id', shop_controller_1.getBatchByIdHandler);
router.patch('/batches/:id', shop_controller_1.updateBatchHandler);
router.delete('/batches/:id', shop_controller_1.deleteBatchHandler);
// ── Sales ──────────────────────────────────────────────────────────────────
router.get('/sales', shop_controller_1.getSalesHandler);
router.post('/sales', shop_controller_1.posSaleHandler);
router.get('/sales/:id', shop_controller_1.getSaleByIdHandler);
// ── Reports ────────────────────────────────────────────────────────────────
router.get('/reports/revenue', shop_controller_1.getRevenueChartHandler);
router.get('/reports/products', shop_controller_1.getProductBreakdownHandler);
router.get('/reports/daily', shop_controller_1.getDailyReportHandler);
exports.default = router;
