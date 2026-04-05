"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteYield = exports.addYieldToSeason = exports.getYields = exports.deleteResource = exports.addResource = exports.getResources = exports.deleteExpense = exports.addExpenseToSeason = exports.getExpenses = exports.deleteSeason = exports.updateSeason = exports.getSeasonById = exports.getCropSeasons = exports.getSeasons = exports.createSeason = exports.getCropById = exports.getAllCrops = void 0;
const Season_1 = __importDefault(require("../models/Season"));
const SeasonExpense_1 = __importDefault(require("../models/SeasonExpense"));
const YieldRecord_1 = __importDefault(require("../models/YieldRecord"));
const errorHandler_1 = require("../middleware/errorHandler");
// ─── Crops ────────────────────────────────────────────────────────────────────
const getAllCrops = async () => {
    return Season_1.default.aggregate([
        {
            $group: {
                _id: '$cropId',
                name: { $first: '$cropName' },
                localName: { $first: '$localName' },
                activeSeasonsCount: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
                totalArea: { $sum: '$areaSown' },
                totalExpense: { $sum: '$totalExpense' },
                totalRevenue: { $sum: '$totalRevenue' },
                totalProfit: { $sum: { $subtract: ['$totalRevenue', '$totalExpense'] } },
                latestSeason: { $last: { label: '$label', status: '$status' } },
            },
        },
        {
            $project: {
                cropId: '$_id',
                name: 1,
                localName: 1,
                latestSeason: 1,
                stats: {
                    activeSeasonsCount: '$activeSeasonsCount',
                    totalArea: '$totalArea',
                    totalExpense: '$totalExpense',
                    totalRevenue: '$totalRevenue',
                    totalProfit: '$totalProfit',
                },
            },
        },
        { $sort: { 'stats.totalRevenue': -1 } },
    ]);
};
exports.getAllCrops = getAllCrops;
const getCropById = async (cropId) => {
    const [crop] = await Season_1.default.aggregate([
        { $match: { cropId } },
        {
            $group: {
                _id: '$cropId',
                name: { $first: '$cropName' },
                localName: { $first: '$localName' },
                totalExpense: { $sum: '$totalExpense' },
                totalRevenue: { $sum: '$totalRevenue' },
                totalProfit: { $sum: { $subtract: ['$totalRevenue', '$totalExpense'] } },
            },
        },
        {
            $project: {
                cropId: '$_id', name: 1, localName: 1,
                totalExpense: 1, totalRevenue: 1, totalProfit: 1,
            },
        },
    ]);
    if (!crop)
        throw (0, errorHandler_1.createError)(`Crop '${cropId}' not found`, 404, 'CROP_NOT_FOUND');
    return crop;
};
exports.getCropById = getCropById;
// ─── Seasons ──────────────────────────────────────────────────────────────────
const createSeason = async (data) => Season_1.default.create(data);
exports.createSeason = createSeason;
const getSeasons = async () => Season_1.default.find().sort({ createdAt: -1 });
exports.getSeasons = getSeasons;
const getCropSeasons = async (cropId) => Season_1.default.find({ cropId }).sort({ startDate: -1 });
exports.getCropSeasons = getCropSeasons;
const getSeasonById = async (id) => {
    const season = await Season_1.default.findById(id);
    if (!season)
        throw (0, errorHandler_1.createError)('Season not found', 404, 'SEASON_NOT_FOUND');
    return season;
};
exports.getSeasonById = getSeasonById;
const updateSeason = async (id, data) => {
    const season = await Season_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!season)
        throw (0, errorHandler_1.createError)('Season not found', 404, 'SEASON_NOT_FOUND');
    return season;
};
exports.updateSeason = updateSeason;
const deleteSeason = async (id) => {
    const season = await Season_1.default.findById(id);
    if (!season)
        throw (0, errorHandler_1.createError)('Season not found', 404, 'SEASON_NOT_FOUND');
    await Promise.all([
        SeasonExpense_1.default.deleteMany({ seasonId: id }),
        YieldRecord_1.default.deleteMany({ seasonId: id }),
        Season_1.default.findByIdAndDelete(id),
    ]);
};
exports.deleteSeason = deleteSeason;
// ─── Expenses ─────────────────────────────────────────────────────────────────
const getExpenses = async (seasonId) => SeasonExpense_1.default.find({ seasonId }).sort({ date: -1 });
exports.getExpenses = getExpenses;
const addExpenseToSeason = async (seasonId, data) => {
    await (0, exports.getSeasonById)(seasonId);
    const expense = await SeasonExpense_1.default.create({ ...data, seasonId });
    await Season_1.default.findByIdAndUpdate(seasonId, { $inc: { totalExpense: data.amount } });
    return expense;
};
exports.addExpenseToSeason = addExpenseToSeason;
const deleteExpense = async (seasonId, expenseId) => {
    const expense = await SeasonExpense_1.default.findByIdAndDelete(expenseId);
    if (expense) {
        await Season_1.default.findByIdAndUpdate(seasonId, { $inc: { totalExpense: -expense.amount } });
    }
};
exports.deleteExpense = deleteExpense;
// ─── Resources — not yet implemented ─────────────────────────────────────────
const getResources = async (_seasonId) => [];
exports.getResources = getResources;
const addResource = async (_seasonId, _data) => {
    throw (0, errorHandler_1.createError)('Resource management is not yet implemented', 501, 'NOT_IMPLEMENTED');
};
exports.addResource = addResource;
const deleteResource = async (_seasonId, _resourceId) => {
    throw (0, errorHandler_1.createError)('Resource management is not yet implemented', 501, 'NOT_IMPLEMENTED');
};
exports.deleteResource = deleteResource;
// ─── Yields ───────────────────────────────────────────────────────────────────
const getYields = async (seasonId) => YieldRecord_1.default.find({ seasonId }).sort({ date: -1 });
exports.getYields = getYields;
const addYieldToSeason = async (seasonId, data) => {
    await (0, exports.getSeasonById)(seasonId);
    const revenue = Number(data.revenueRealized ?? data.revenue ?? 0);
    const record = await YieldRecord_1.default.create({ ...data, revenueRealized: revenue, seasonId });
    await Season_1.default.findByIdAndUpdate(seasonId, {
        $inc: { totalRevenue: revenue, totalYield: Number(data.quantity ?? 0) },
    });
    return record;
};
exports.addYieldToSeason = addYieldToSeason;
const deleteYield = async (seasonId, yieldId) => {
    const record = await YieldRecord_1.default.findByIdAndDelete(yieldId);
    if (record) {
        await Season_1.default.findByIdAndUpdate(seasonId, {
            $inc: {
                totalRevenue: -record.revenueRealized,
                totalYield: -(record.quantity ?? 0),
            },
        });
    }
};
exports.deleteYield = deleteYield;
