"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyReport = exports.getProductBreakdown = exports.getRevenueChart = exports.createPosSale = exports.getSaleById = exports.getSales = exports.deleteBatch = exports.updateBatch = exports.createBatch = exports.getBatchById = exports.getBatches = exports.getStats = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Batch_1 = __importDefault(require("../models/Batch"));
const Sale_1 = require("../models/Sale");
// ── Helper ────────────────────────────────────────────────────────────────────
const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
// ── Stats ─────────────────────────────────────────────────────────────────────
const getStats = async () => {
    const today = startOfDay();
    const [totalBatches, activeBatches, todaySales, totalRevenue] = await Promise.all([
        Batch_1.default.countDocuments(),
        Batch_1.default.countDocuments({ status: { $in: ['PROCESSING', 'READY'] } }),
        Sale_1.SaleModel.countDocuments({ dateTime: { $gte: today } }),
        Sale_1.SaleModel.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);
    return {
        totalBatches,
        activeBatches,
        todaySales,
        totalRevenue: totalRevenue[0]?.total ?? 0,
    };
};
exports.getStats = getStats;
// ── Batches ───────────────────────────────────────────────────────────────────
const getBatches = async (query = {}) => {
    const filter = {};
    if (query.status)
        filter.status = query.status;
    if (query.productType)
        filter.productType = query.productType;
    return Batch_1.default.find(filter).sort({ productionDate: -1 });
};
exports.getBatches = getBatches;
const getBatchById = async (id) => {
    return Batch_1.default.findById(id);
};
exports.getBatchById = getBatchById;
const createBatch = async (data) => {
    const batch = await Batch_1.default.create(data);
    // Initialise stockRemaining from output if not supplied
    if (!batch.stockRemaining) {
        batch.stockRemaining = (batch.output?.quantityProduced ?? 0) - (batch.output?.wastage ?? 0);
        await batch.save();
    }
    return batch;
};
exports.createBatch = createBatch;
const updateBatch = async (id, data) => {
    return Batch_1.default.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
};
exports.updateBatch = updateBatch;
const deleteBatch = async (id) => {
    return Batch_1.default.findByIdAndDelete(id);
};
exports.deleteBatch = deleteBatch;
// ── Sales ─────────────────────────────────────────────────────────────────────
const getSales = async (query = {}) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;
    const filter = {};
    if (query.paymentMode)
        filter.paymentMode = query.paymentMode;
    if (query.from || query.to) {
        filter.dateTime = {
            ...(query.from ? { $gte: new Date(query.from) } : {}),
            ...(query.to ? { $lte: new Date(query.to) } : {}),
        };
    }
    const [sales, total] = await Promise.all([
        Sale_1.SaleModel.find(filter).sort({ dateTime: -1 }).skip(skip).limit(limit),
        Sale_1.SaleModel.countDocuments(filter),
    ]);
    return { sales, total, page, pages: Math.ceil(total / limit) };
};
exports.getSales = getSales;
const getSaleById = async (id) => {
    return Sale_1.SaleModel.findById(id);
};
exports.getSaleById = getSaleById;
const createPosSale = async (data) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let totalAmount = 0;
        const saleItems = [];
        for (const item of data.items) {
            const batch = await Batch_1.default.findById(item.batchId).session(session);
            if (!batch)
                throw new Error(`Batch ${item.batchId} not found`);
            if (batch.stockRemaining < item.quantity) {
                throw new Error(`Insufficient stock for batch ${batch.batchId}: ` +
                    `requested ${item.quantity}, available ${batch.stockRemaining}`);
            }
            const discount = item.discount ?? 0;
            const lineTotal = item.quantity * item.unitPrice * (1 - discount / 100);
            totalAmount += lineTotal;
            saleItems.push({
                productId: batch.productType,
                batchId: batch._id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount,
                total: lineTotal,
            });
            await Batch_1.default.findByIdAndUpdate(item.batchId, { $inc: { stockRemaining: -item.quantity } }, { session });
        }
        const [sale] = await Sale_1.SaleModel.create([
            {
                items: saleItems,
                totalAmount,
                paymentMode: data.paymentMode,
                customerName: data.customerName,
                customerId: data.customerId,
                dateTime: new Date(),
            },
        ], { session });
        await session.commitTransaction();
        return sale;
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
};
exports.createPosSale = createPosSale;
// ── Reports ───────────────────────────────────────────────────────────────────
const getRevenueChart = async (query = {}) => {
    const period = query.period ?? 'month';
    const now = new Date();
    const from = period === 'week' ? new Date(now.getTime() - 7 * 86_400_000) :
        period === 'year' ? new Date(now.getTime() - 365 * 86_400_000) :
            new Date(now.getTime() - 30 * 86_400_000);
    const fmt = period === 'year' ? '%Y-%m' : '%Y-%m-%d';
    return Sale_1.SaleModel.aggregate([
        { $match: { dateTime: { $gte: from } } },
        {
            $group: {
                _id: { $dateToString: { format: fmt, date: '$dateTime' } },
                revenue: { $sum: '$totalAmount' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', revenue: 1, count: 1, _id: 0 } },
    ]);
};
exports.getRevenueChart = getRevenueChart;
const getProductBreakdown = async (query = {}) => {
    const filter = {};
    if (query.from || query.to) {
        filter.dateTime = {
            ...(query.from ? { $gte: new Date(query.from) } : {}),
            ...(query.to ? { $lte: new Date(query.to) } : {}),
        };
    }
    return Sale_1.SaleModel.aggregate([
        { $match: filter },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.productId',
                revenue: { $sum: '$items.total' },
                quantity: { $sum: '$items.quantity' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { revenue: -1 } },
        { $project: { product: '$_id', revenue: 1, quantity: 1, orders: 1, _id: 0 } },
    ]);
};
exports.getProductBreakdown = getProductBreakdown;
const getDailyReport = async (dateStr) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    const from = startOfDay(date);
    const to = endOfDay(date);
    const [sales, batchesMade] = await Promise.all([
        Sale_1.SaleModel.find({ dateTime: { $gte: from, $lte: to } }),
        Batch_1.default.find({ productionDate: { $gte: from, $lte: to } }),
    ]);
    const totalRevenue = sales.reduce((s, r) => s + r.totalAmount, 0);
    const totalTransactions = sales.length;
    const byPaymentMode = sales.reduce((acc, s) => {
        acc[s.paymentMode] = (acc[s.paymentMode] ?? 0) + s.totalAmount;
        return acc;
    }, {});
    return {
        date: from,
        totalRevenue,
        totalTransactions,
        byPaymentMode,
        batchesProduced: batchesMade.length,
        sales,
    };
};
exports.getDailyReport = getDailyReport;
