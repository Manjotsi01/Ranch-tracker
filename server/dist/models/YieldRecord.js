"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const yieldRecordSchema = new mongoose_1.default.Schema({
    seasonId: {
        type: String,
        required: true,
        index: true,
        validate: {
            validator: (v) => /^[a-f\d]{24}$/i.test(v),
            message: 'seasonId must be a valid 24-char ObjectId string',
        },
    },
    date: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    grade: String,
    marketPrice: { type: Number, required: true, min: 0 },
    revenueRealized: { type: Number, default: 0, min: 0 },
    notes: String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
yieldRecordSchema.virtual('yieldId').get(function () {
    return this._id.toString();
});
yieldRecordSchema.index({ date: -1 });
exports.default = mongoose_1.default.model('YieldRecord', yieldRecordSchema);
