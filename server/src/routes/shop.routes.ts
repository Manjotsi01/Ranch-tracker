import { Router, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { sendSuccess } from '../utils/response'
import * as shop from '../services/shop.service'

const router = Router()

// ── Zod schemas (co-located — small enough to not need a separate file) ────────

const dateParam   = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
const monthParam  = z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM')
const mongoId     = z.string().length(24, 'Invalid ID')

const milkEntrySchema = z.object({ body: z.object({
  date:           dateParam,
  shift:          z.enum(['MORNING', 'EVENING']),
  quantityLiters: z.number().positive(),
  fat:            z.number().min(0).max(10).optional(),
  snf:            z.number().min(0).max(15).optional(),
  source:         z.enum(['OWN', 'PURCHASED']),
  notes:          z.string().max(200).optional(),
})})

const expenseSchema = z.object({ body: z.object({
  date:      dateParam,
  feed:      z.number().min(0).default(0),
  labor:     z.number().min(0).default(0),
  transport: z.number().min(0).default(0),
  medical:   z.number().min(0).default(0),
  misc:      z.number().min(0).default(0),
})})

const productSchema = z.object({ body: z.object({
  name:         z.string().min(1).max(60).trim(),
  unit:         z.string().min(1).max(20).trim(),
  mrp:          z.number().positive(),
  costPrice:    z.number().min(0).optional(),
  stockQty:     z.number().min(0).optional(),
  quickButtons: z.array(z.number().positive()).max(5).optional(),
})})

const productPatchSchema = z.object({
  params: z.object({ id: mongoId }),
  body: z.object({
    name:         z.string().min(1).max(60).trim().optional(),
    unit:         z.string().min(1).max(20).trim().optional(),
    mrp:          z.number().positive().optional(),
    costPrice:    z.number().min(0).optional(),
    quickButtons: z.array(z.number().positive()).max(5).optional(),
    isActive:     z.boolean().optional(),
  }),
})

const adjustStockSchema = z.object({
  params: z.object({ id: mongoId }),
  body: z.object({ delta: z.number().refine((n) => n !== 0, 'delta cannot be 0') }),
})

const setStockSchema = z.object({
  params: z.object({ id: mongoId }),
  body: z.object({ qty: z.number().min(0) }),
})

const saleSchema = z.object({ body: z.object({
  items: z.array(z.object({
    productId: mongoId,
    quantity:  z.number().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
  paymentMode:  z.enum(['CASH', 'UPI']),
  customerName: z.string().max(80).optional(),
})})

const wholesaleSchema = z.object({ body: z.object({
  date:           dateParam,
  buyerName:      z.string().min(1).max(80).trim(),
  quantityLiters: z.number().positive(),
  fat:            z.number().min(0).max(10).optional(),
  snf:            z.number().min(0).max(15).optional(),
  ratePerLiter:   z.number().positive(),
  notes:          z.string().max(200).optional(),
})})

// ─────────────────────────────────────────────────────────────────────────────
// MILK  /api/shop/milk
// ─────────────────────────────────────────────────────────────────────────────

router.get('/milk', asyncHandler(async (req: Request, res: Response) => {
  const { from, to, month } = req.query as Record<string, string>
  sendSuccess(res, await shop.getMilkEntries({ from, to, month }))
}))

router.get('/milk/stock', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query as { date?: string }
  sendSuccess(res, await shop.getMilkStock(date))
}))

router.post('/milk', validate(milkEntrySchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.addMilkEntry(req.body), 201)
}))

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSES  /api/shop/expenses
// ─────────────────────────────────────────────────────────────────────────────

router.get('/expenses', asyncHandler(async (req: Request, res: Response) => {
  const { from, to, month } = req.query as Record<string, string>
  sendSuccess(res, await shop.getExpenses({ from, to, month }))
}))

router.get('/expenses/making-price', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query as { date?: string }
  sendSuccess(res, await shop.getMakingPrice(date))
}))

router.post('/expenses', validate(expenseSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.upsertExpense(req.body))
}))

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS  /api/shop/products
// ─────────────────────────────────────────────────────────────────────────────

router.get('/products', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.getProducts(req.query.all !== 'true'))
}))

router.get('/products/:id', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.getProductById(req.params.id))
}))

router.post('/products', validate(productSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.createProduct(req.body), 201)
}))

router.patch('/products/:id', validate(productPatchSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.updateProduct(req.params.id, req.body))
}))

router.patch('/products/:id/stock/adjust', validate(adjustStockSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.adjustStock(req.params.id, req.body.delta))
}))

router.patch('/products/:id/stock/set', validate(setStockSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.setStock(req.params.id, req.body.qty))
}))

router.delete('/products/:id', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.deleteProduct(req.params.id))
}))

// ─────────────────────────────────────────────────────────────────────────────
// RETAIL SALES  /api/shop/sales
// ─────────────────────────────────────────────────────────────────────────────

router.get('/sales', asyncHandler(async (req: Request, res: Response) => {
  const { from, to, paymentMode, page, limit } = req.query as Record<string, string>
  sendSuccess(res, await shop.getSales({ from, to, paymentMode, page: +page, limit: +limit }))
}))

router.get('/sales/:id', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.getSaleById(req.params.id))
}))

router.post('/sales', validate(saleSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.createSale(req.body), 201)
}))

// ─────────────────────────────────────────────────────────────────────────────
// WHOLESALE  /api/shop/wholesale
// ─────────────────────────────────────────────────────────────────────────────

router.get('/wholesale', asyncHandler(async (req: Request, res: Response) => {
  const { status, from, to } = req.query as Record<string, string>
  sendSuccess(res, await shop.getWholesaleSales({ status, from, to }))
}))

router.post('/wholesale', validate(wholesaleSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.createWholesaleSale(req.body), 201)
}))

router.patch('/wholesale/:id/payment', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await shop.markWholesalePaymentReceived(req.params.id))
}))

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS  /api/shop/reports
// ─────────────────────────────────────────────────────────────────────────────

router.get('/reports/daily', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query as { date?: string }
  sendSuccess(res, await shop.getDailyReport(date))
}))

router.get('/reports/monthly', asyncHandler(async (req: Request, res: Response) => {
  const { month } = req.query as { month?: string }
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ success: false, message: 'month query param required (YYYY-MM)' })
    return
  }
  sendSuccess(res, await shop.getMonthlyReport(month))
}))

export default router