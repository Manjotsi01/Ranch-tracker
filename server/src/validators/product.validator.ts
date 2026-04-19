import { z } from 'zod'

export const createProductSchema = z.object({
  body: z.object({
    name:         z.string().min(1).max(60).trim(),
    unit:         z.string().min(1).max(20).trim(),  // "kg", "ltr", "pcs"
    mrp:          z.number().positive(),
    costPrice:    z.number().min(0).optional(),
    stockQty:     z.number().min(0).optional(),
    quickButtons: z.array(z.number().positive()).max(5).optional(),
  }),
})

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    name:         z.string().min(1).max(60).trim().optional(),
    unit:         z.string().min(1).max(20).trim().optional(),
    mrp:          z.number().positive().optional(),
    costPrice:    z.number().min(0).optional(),
    quickButtons: z.array(z.number().positive()).max(5).optional(),
    isActive:     z.boolean().optional(),
  }),
})

export const adjustStockSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    delta: z.number().refine((n) => n !== 0, 'delta must be non-zero'),  // +N or -N
  }),
})

export const setStockSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    qty: z.number().min(0),
  }),
})

export type CreateProductInput = z.infer<typeof createProductSchema>['body']
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body']