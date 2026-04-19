// server/models/Expense.js
const { Schema, model } = require('mongoose')

const ExpenseSchema = new Schema({
  date:      { type: Date, required: true, unique: true }, // one doc per day
  feed:      { type: Number, default: 0 },
  labor:     { type: Number, default: 0 },
  transport: { type: Number, default: 0 },
  medical:   { type: Number, default: 0 },
  misc:      { type: Number, default: 0 },
  notes:     { type: String, default: '' },
}, { timestamps: true })

// Virtual: total — never stored, always computed
ExpenseSchema.virtual('total').get(function () {
  return this.feed + this.labor + this.transport + this.medical + this.misc
})

module.exports = model('Expense', ExpenseSchema)