// server/models/Buyer.js
const { Schema, model } = require('mongoose')

const BuyerSchema = new Schema({
  name:    { type: String, required: true, trim: true },
  phone:   { type: String, default: '' },
  address: { type: String, default: '' },
  type:    { type: String, enum: ['VERKA', 'COOPERATIVE', 'LOCAL'], default: 'LOCAL' },
}, { timestamps: true })

module.exports = model('Buyer', BuyerSchema)