"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const seasonExpenseSchema = new mongoose_1.default.Schema({
    seasonId: {
        type: String,
        required: true,
        index: true,
        validate: {
            validator: (v) => /^[a-f\d]{24}$/i.test(v),
            message: 'seasonId must be a valid 24-char ObjectId string',
        },
    },
    date: { type: Date, required: true, default: Date.now },
    category: {
        type: String,
        enum: ['SEEDS', 'FERTILIZER', 'PESTICIDE', 'LABOUR', 'MACHINERY', 'IRRIGATION', 'OTHER'],
        required: true,
    },
    description: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    vendor: { type: String, trim: true },
    notes: { type: String },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
seasonExpenseSchema.virtual('expenseId').get(function () {
    return this._id.toString();
});
seasonExpenseSchema.index({ seasonId: 1, date: -1 });
exports.default = mongoose_1.default.model('SeasonExpense', seasonExpenseSchema);
