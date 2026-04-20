// server/src/services/product.service.ts

import Product from '../models/Product'
import type { UpdateQuery } from 'mongoose'
import type { IProduct } from '../models/Product' // adjust if needed

export async function getAllProducts() {
  return Product.find().lean()
}

export async function createProduct(data: unknown) {
  return Product.create(data as Partial<IProduct>)
}

export async function updateProduct(id: string, data: unknown) {
  return Product.findByIdAndUpdate(
    id,
    data as UpdateQuery<IProduct>,
    { new: true, runValidators: true }
  )
}

export async function deleteProduct(id: string) {
  return Product.findByIdAndDelete(id)
}

export const getProducts = getAllProducts

export async function getProductById(id: string) {
  return Product.findById(id)
}

export async function adjustStock(id: string, amount: number) {
  return Product.findByIdAndUpdate(
    id,
    { $inc: { stock: amount } },
    { new: true }
  )
}

export async function setStock(id: string, stock: number) {
  return Product.findByIdAndUpdate(
    id,
    { stock },
    { new: true }
  )
}