import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  name: string
  unit: string
  mrp: number
  costPrice: number
  stockQty: number
  isActive: boolean
  quickButtons: number[]
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    name:         { type: String, required: true, trim: true },
    unit:         { type: String, required: true, trim: true },   // "kg", "ltr", "pcs"
    mrp:          { type: Number, required: true, min: 0 },       // selling price
    costPrice:    { type: Number, default: 0, min: 0 },
    stockQty:     { type: Number, default: 0, min: 0 },
    isActive:     { type: Boolean, default: true },
    quickButtons: { type: [Number], default: [1] },               // e.g. [0.5, 1, 2]
  },
  { timestamps: true }
)

// Fast lookup for active products on POS screen
productSchema.index({ isActive: 1, name: 1 })

export default mongoose.model<IProduct>('Product', productSchema)