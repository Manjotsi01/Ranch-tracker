// models/MilkEntry.ts
import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  date:           { type: Date, required: true },
  shift:          { type: String, enum: ['MORNING', 'EVENING'], required: true },
  quantityLiters: { type: Number, required: true, min: 0 },
  fat:            { type: Number, default: 0 },
  snf:            { type: Number, default: 0 },
  source:         { type: String, enum: ['OWN', 'PURCHASED'], default: 'OWN' },
  notes:          { type: String },
}, { timestamps: true })
schema.index({ date: -1, shift: 1 }, { unique: true })  // one entry per date+shift
export default mongoose.model('MilkEntry', schema)

// models/Expense.ts
import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  date:      { type: Date, required: true, unique: true }, // one per day
  feed:      { type: Number, default: 0, min: 0 },
  labor:     { type: Number, default: 0, min: 0 },
  transport: { type: Number, default: 0, min: 0 },
  medical:   { type: Number, default: 0, min: 0 },
  misc:      { type: Number, default: 0, min: 0 },
}, { timestamps: true })
schema.index({ date: -1 })
export default mongoose.model('Expense', schema)

// models/WholesaleSale.ts
import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  date:           { type: Date, required: true },
  buyerName:      { type: String, required: true, trim: true },
  quantityLiters: { type: Number, required: true, min: 0 },
  fat:            { type: Number, default: 0 },
  snf:            { type: Number, default: 0 },
  ratePerLiter:   { type: Number, required: true, min: 0 },
  totalAmount:    { type: Number, required: true },
  paymentStatus:  { type: String, enum: ['PENDING', 'RECEIVED'], default: 'PENDING' },
  paymentDate:    { type: Date },
  notes:          { type: String },
}, { timestamps: true })
schema.index({ date: -1 })
schema.index({ paymentStatus: 1 })
export default mongoose.model('WholesaleSale', schema)