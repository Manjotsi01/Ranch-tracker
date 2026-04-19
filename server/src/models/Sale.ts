// server/models/Sale.js
const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const SaleItemSchema = new Schema({
  productId:    { type: Schema.Types.ObjectId, ref: 'Product' },
  name:         { type: String, required: true },  // snapshot at time of sale
  unit:         { type: String, required: true },
  qty:          { type: Number, required: true, min: 0 },
  pricePerUnit: { type: Number, required: true },
  subtotal:     { type: Number, required: true },
}, { _id: false })

const SaleSchema = new Schema({
  receiptNo:   { type: String, unique: true, default: () => `RCP-${nanoid(8).toUpperCase()}` },
  type:        { type: String, enum: ['RETAIL', 'WHOLESALE'], required: true },
  date:        { type: Date, default: Date.now },

  // Retail fields
  items:       { type: [SaleItemSchema], default: [] },
  paymentMode: { type: String, enum: ['CASH', 'UPI', 'CREDIT'], default: 'CASH' },

  // Wholesale-only fields (null on retail)
  buyerName:      { type: String, default: null },
  buyerId:        { type: Schema.Types.ObjectId, ref: 'Buyer', default: null },
  quantityLiters: { type: Number, default: null },
  fatReading:     { type: Number, default: null },
  snfReading:     { type: Number, default: null },
  ratePerLiter:   { type: Number, default: null },
  paymentStatus:  { type: String, enum: ['PENDING', 'RECEIVED'], default: 'RECEIVED' },

  totalAmount: { type: Number, required: true },
}, { timestamps: true })

SaleSchema.index({ date: -1 })
SaleSchema.index({ type: 1, date: -1 })

module.exports = model('Sale', SaleSchema)