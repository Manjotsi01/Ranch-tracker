"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFodderStock = exports.createFodderStock = exports.getFodderStock = exports.updateFodderCrop = exports.createFodderCrop = exports.getFodderCrops = exports.getProfitability = exports.upsertFeedingPlan = exports.createFeedRecord = exports.getFeeding = exports.updateTreatment = exports.createTreatment = exports.updateVaccination = exports.createVaccination = exports.getHealth = exports.createCalving = exports.updateAIRecord = exports.createAIRecord = exports.getReproduction = exports.updateLactation = exports.createLactation = exports.getLactations = exports.deleteMilkRecord = exports.createMilkRecord = exports.getMilkSummary = exports.getMilkRecords = exports.deleteAnimal = exports.updateAnimal = exports.createAnimal = exports.getAnimalById = exports.getAnimals = exports.getHerdSummary = void 0;
const Animal_1 = __importDefault(require("../models/Animal"));
const MilkRecord_1 = __importDefault(require("../models/MilkRecord"));
const HealthRecord_1 = __importDefault(require("../models/HealthRecord"));
const FeedRecord_1 = __importDefault(require("../models/FeedRecord"));
const FodderStock_1 = __importDefault(require("../models/FodderStock"));
const ReproductionRecord_1 = __importDefault(require("../models/ReproductionRecord"));
const errorHandler_1 = require("../middleware/errorHandler");
const env_1 = require("../config/env");
// ── Herd ──────────────────────────────────────────────────────────────────────
const getHerdSummary = async () => {
    const [total, byStatus, byType] = await Promise.all([
        Animal_1.default.countDocuments(),
        Animal_1.default.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Animal_1.default.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    ]);
    return { total, byStatus, byType };
};
exports.getHerdSummary = getHerdSummary;
// ── Animals ───────────────────────────────────────────────────────────────────
const getAnimals = async (query = {}) => {
    const filter = {};
    if (query.status)
        filter.status = query.status;
    if (query.type)
        filter.type = query.type;
    if (query.gender)
        filter.gender = query.gender;
    return Animal_1.default.find(filter).sort({ createdAt: -1 });
};
exports.getAnimals = getAnimals;
const getAnimalById = async (id) => {
    return Animal_1.default.findById(id);
};
exports.getAnimalById = getAnimalById;
const createAnimal = async (data) => {
    return Animal_1.default.create(data);
};
exports.createAnimal = createAnimal;
const updateAnimal = async (id, data) => {
    return Animal_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};
exports.updateAnimal = updateAnimal;
const deleteAnimal = async (id) => {
    return Animal_1.default.findByIdAndDelete(id);
};
exports.deleteAnimal = deleteAnimal;
// ── Milk ──────────────────────────────────────────────────────────────────────
const getMilkRecords = async (animalId, query = {}) => {
    const filter = { animalId };
    if (query.from || query.to) {
        filter.date = {
            ...(query.from ? { $gte: new Date(query.from) } : {}),
            ...(query.to ? { $lte: new Date(query.to) } : {}),
        };
    }
    return MilkRecord_1.default.find(filter).sort({ date: -1 });
};
exports.getMilkRecords = getMilkRecords;
const getMilkSummary = async (animalId, query = {}) => {
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 86_400_000);
    const to = query.to ? new Date(query.to) : new Date();
    const records = await MilkRecord_1.default.find({
        animalId,
        date: { $gte: from, $lte: to },
    });
    const totalLitres = records.reduce((s, r) => s + (r.quantity ?? r.total ?? 0), 0);
    const totalRevenue = totalLitres * env_1.env.MILK_PRICE_PER_LITRE;
    return { totalLitres, totalRevenue, recordCount: records.length, from, to };
};
exports.getMilkSummary = getMilkSummary;
const createMilkRecord = async (animalId, data) => {
    return MilkRecord_1.default.create({ ...data, animalId });
};
exports.createMilkRecord = createMilkRecord;
const deleteMilkRecord = async (animalId, recordId) => {
    return MilkRecord_1.default.findOneAndDelete({ _id: recordId, animalId });
};
exports.deleteMilkRecord = deleteMilkRecord;
// ── Lactations ────────────────────────────────────────────────────────────────
const getLactations = async (animalId) => {
    const animal = await Animal_1.default.findById(animalId).select('lactations');
    if (!animal)
        throw (0, errorHandler_1.createError)('Animal not found', 404, 'NOT_FOUND');
    return animal.lactations ?? [];
};
exports.getLactations = getLactations;
const createLactation = async (animalId, data) => {
    const animal = await Animal_1.default.findByIdAndUpdate(animalId, { $push: { lactations: data } }, { new: true, runValidators: true });
    if (!animal)
        throw (0, errorHandler_1.createError)('Animal not found', 404, 'NOT_FOUND');
    return animal.lactations?.at(-1);
};
exports.createLactation = createLactation;
const updateLactation = async (animalId, lacId, data) => {
    const update = {};
    for (const [k, v] of Object.entries(data)) {
        update[`lactations.$.${k}`] = v;
    }
    const animal = await Animal_1.default.findOneAndUpdate({ _id: animalId, 'lactations._id': lacId }, { $set: update }, { new: true });
    if (!animal)
        throw (0, errorHandler_1.createError)('Lactation record not found', 404, 'NOT_FOUND');
    return animal.lactations?.find((l) => String(l._id) === lacId);
};
exports.updateLactation = updateLactation;
// ── Reproduction ──────────────────────────────────────────────────────────────
const getReproduction = async (animalId) => {
    return ReproductionRecord_1.default.find({ animalId }).sort({ date: -1 });
};
exports.getReproduction = getReproduction;
const createAIRecord = async (animalId, data) => {
    return ReproductionRecord_1.default.create({ ...data, animalId, type: 'AI' });
};
exports.createAIRecord = createAIRecord;
const updateAIRecord = async (animalId, aiId, data) => {
    const record = await ReproductionRecord_1.default.findOneAndUpdate({ _id: aiId, animalId, type: 'AI' }, data, { new: true, runValidators: true });
    if (!record)
        throw (0, errorHandler_1.createError)('AI record not found', 404, 'NOT_FOUND');
    return record;
};
exports.updateAIRecord = updateAIRecord;
const createCalving = async (animalId, data) => {
    return ReproductionRecord_1.default.create({ ...data, animalId, type: 'Calving' });
};
exports.createCalving = createCalving;
// ── Health ────────────────────────────────────────────────────────────────────
const getHealth = async (animalId) => {
    return HealthRecord_1.default.find({ animalId }).sort({ date: -1 });
};
exports.getHealth = getHealth;
const createVaccination = async (animalId, data) => {
    return HealthRecord_1.default.create({
        ...data,
        animalId,
        recordType: 'VACCINATION',
    });
};
exports.createVaccination = createVaccination;
const updateVaccination = async (animalId, vId, data) => {
    const record = await HealthRecord_1.default.findOneAndUpdate({ _id: vId, animalId, recordType: 'VACCINATION' }, data, { new: true, runValidators: true });
    if (!record)
        throw (0, errorHandler_1.createError)('Vaccination record not found', 404, 'NOT_FOUND');
    return record;
};
exports.updateVaccination = updateVaccination;
const createTreatment = async (animalId, data) => {
    return HealthRecord_1.default.create({
        ...data,
        animalId,
        recordType: 'TREATMENT',
    });
};
exports.createTreatment = createTreatment;
const updateTreatment = async (animalId, tId, data) => {
    const record = await HealthRecord_1.default.findOneAndUpdate({ _id: tId, animalId, recordType: 'TREATMENT' }, data, { new: true, runValidators: true });
    if (!record)
        throw (0, errorHandler_1.createError)('Treatment record not found', 404, 'NOT_FOUND');
    return record;
};
exports.updateTreatment = updateTreatment;
// ── Feeding ───────────────────────────────────────────────────────────────────
const getFeeding = async (animalId) => {
    const [records, animal] = await Promise.all([
        FeedRecord_1.default.find({ animalId }).sort({ date: -1 }).limit(90),
        Animal_1.default.findById(animalId).select('feedingPlan'),
    ]);
    return { records, plan: animal?.feedingPlan ?? [] };
};
exports.getFeeding = getFeeding;
const createFeedRecord = async (animalId, data) => {
    return FeedRecord_1.default.create({ ...data, animalId });
};
exports.createFeedRecord = createFeedRecord;
const upsertFeedingPlan = async (animalId, data) => {
    const animal = await Animal_1.default.findByIdAndUpdate(animalId, { $set: { feedingPlan: data } }, { new: true, runValidators: true });
    if (!animal)
        throw (0, errorHandler_1.createError)('Animal not found', 404, 'NOT_FOUND');
    return animal.feedingPlan;
};
exports.upsertFeedingPlan = upsertFeedingPlan;
// ── Profitability ─────────────────────────────────────────────────────────────
const getProfitability = async (animalId, query = {}) => {
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 365 * 86_400_000);
    const to = query.to ? new Date(query.to) : new Date();
    const [milkRecords, feedRecords, healthRecords, animal] = await Promise.all([
        MilkRecord_1.default.find({ animalId, date: { $gte: from, $lte: to } }),
        FeedRecord_1.default.find({ animalId, date: { $gte: from, $lte: to } }),
        HealthRecord_1.default.find({ animalId, date: { $gte: from, $lte: to } }),
        Animal_1.default.findById(animalId).select('purchaseCost name tagNo type breed'),
    ]);
    const totalMilk = milkRecords.reduce((s, r) => s + (r.quantity ?? r.total ?? 0), 0);
    const milkRevenue = totalMilk * env_1.env.MILK_PRICE_PER_LITRE;
    const feedCost = feedRecords.reduce((s, r) => s + (r.quantity * (r.costPerKg ?? 0)), 0);
    const healthCost = healthRecords.reduce((s, r) => s + (r.cost ?? 0), 0);
    const totalCost = feedCost + healthCost;
    const netProfit = milkRevenue - totalCost;
    return {
        animal,
        period: { from, to },
        revenue: { milk: milkRevenue, total: milkRevenue },
        costs: { feed: feedCost, health: healthCost, total: totalCost },
        milk: { litres: totalMilk, records: milkRecords.length },
        netProfit,
        roi: totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(2) + '%' : 'N/A',
    };
};
exports.getProfitability = getProfitability;
// ── Fodder ────────────────────────────────────────────────────────────────────
const getFodderCrops = async () => {
    return FodderStock_1.default.find({ isCrop: true }).sort({ plantingDate: -1 });
};
exports.getFodderCrops = getFodderCrops;
const createFodderCrop = async (data) => {
    return FodderStock_1.default.create({ ...data, isCrop: true });
};
exports.createFodderCrop = createFodderCrop;
const updateFodderCrop = async (id, data) => {
    return FodderStock_1.default.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
};
exports.updateFodderCrop = updateFodderCrop;
const getFodderStock = async () => {
    return FodderStock_1.default.find({ isCrop: false }).sort({ createdAt: -1 });
};
exports.getFodderStock = getFodderStock;
const createFodderStock = async (data) => {
    return FodderStock_1.default.create({ ...data, isCrop: false });
};
exports.createFodderStock = createFodderStock;
const updateFodderStock = async (id, data) => {
    return FodderStock_1.default.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
};
exports.updateFodderStock = updateFodderStock;
