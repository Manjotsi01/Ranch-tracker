"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const seasonSchema = new mongoose_1.default.Schema({
    cropId: { type: String, required: true, index: true },
    cropName: { type: String, trim: true },
    localName: { type: String, trim: true },
    label: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    areaSown: { type: Number, required: true },
    areaUnit: { type: String, default: 'acres' },
    variety: String,
    budget: { type: Number, default: 0 },
    notes: String,
    status: {
        type: String,
        enum: ['PLANNED', 'ACTIVE', 'HARVESTED', 'COMPLETED', 'ABANDONED'],
        default: 'PLANNED',
    },
    totalExpense: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalYield: { type: Number, default: 0 },
    yieldUnit: String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
seasonSchema.virtual('seasonId').get(function () {
    return this._id.toString();
});
seasonSchema.index({ cropId: 1, startDate: -1 });
seasonSchema.index({ status: 1 });
exports.default = mongoose_1.default.model('Season', seasonSchema);
