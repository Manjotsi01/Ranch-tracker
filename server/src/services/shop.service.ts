import mongoose from 'mongoose'
import MilkEntry   from '../models/MilkEntry'
import Expense     from '../models/Expense'
import Product     from '../models/Product'
import Sale        from '../models/Sale'
import WholesaleSale from '../models/WholesaleSale'

// ═══════════════════════════════════════════════════════════════
// MILK INVENTORY
// ═══════════════════════════════════════════════════════════════

export const addMilkEntry = async (data: {
  date: string
  shift: 'MORNING' | 'EVENING'
  quantityLiters: number
  fat?: number
  snf?: number
  source: 'OWN' | 'PURCHASED'
  notes?: string
}) => {
  // One entry per date+shift — upsert so re-submitting a morning entry overwrites it
  return MilkEntry.findOneAndUpdate(
    { date: new Date(data.date), shift: data.shift },
    { $set: data },
    { upsert: true, new: true, runValidators: true }
  )
}

export const getMilkEntries = async (params: {
  from?: string
  to?: string
  month?: string   // "2025-04" → auto expand to date range
}) => {
  const filter: Record<string, unknown> = {}

  if (params.month) {
    const [y, m] = params.month.split('-').map(Number)
    filter.date = {
      $gte: new Date(y, m - 1, 1),
      $lte: new Date(y, m, 0, 23, 59, 59),
    }
  } else if (params.from || params.to) {
    filter.date = {
      ...(params.from ? { $gte: new Date(params.from) } : {}),
      ...(params.to   ? { $lte: new Date(params.to)   } : {}),
    }
  }

  return MilkEntry.find(filter).sort({ date: -1, shift: 1 })
}

export const getMilkStock = async (date?: string) => {
  const day = date ? new Date(date) : new Date()
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const end   = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)

  const [entries, soldToday] = await Promise.all([
    MilkEntry.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$quantityLiters' } } },
    ]),
    WholesaleSale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$quantityLiters' } } },
    ]),
  ])

  const collected  = entries[0]?.total    ?? 0
  const wholesaled = soldToday[0]?.total  ?? 0

  return {
    collected,
    wholesaled,
    available: Math.max(0, collected - wholesaled),
    date: start,
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════════

export const upsertExpense = async (data: {
  date: string
  feed?: number
  labor?: number
  transport?: number
  medical?: number
  misc?: number
}) => {
  const doc = await Expense.findOneAndUpdate(
    { date: new Date(data.date) },
    { $set: data },
    { upsert: true, new: true, runValidators: true }
  )
  return doc
}

export const getExpense = async (date: string) => {
  return Expense.findOne({ date: new Date(date) })
}

export const getExpenses = async (params: { from?: string; to?: string; month?: string }) => {
  const filter: Record<string, unknown> = {}

  if (params.month) {
    const [y, m] = params.month.split('-').map(Number)
    filter.date = {
      $gte: new Date(y, m - 1, 1),
      $lte: new Date(y, m, 0, 23, 59, 59),
    }
  } else if (params.from || params.to) {
    filter.date = {
      ...(params.from ? { $gte: new Date(params.from) } : {}),
      ...(params.to   ? { $lte: new Date(params.to)   } : {}),
    }
  }

  return Expense.find(filter).sort({ date: -1 })
}

export const getMakingPrice = async (date?: string) => {
  const day   = date ? new Date(date) : new Date()
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const end   = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)

  const [expense, milkAgg] = await Promise.all([
    Expense.findOne({ date: { $gte: start, $lte: end } }),
    MilkEntry.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$quantityLiters' } } },
    ]),
  ])

  const expenseTotal = expense
    ? (expense.feed + expense.labor + expense.transport + expense.medical + expense.misc)
    : 0
  const milkTotal   = milkAgg[0]?.total ?? 0
  const makingPrice = milkTotal > 0 ? +(expenseTotal / milkTotal).toFixed(2) : 0

  return { date: start, expenseTotal, milkTotal, makingPrice }
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTS  (stock CRUD — already in product.service.ts pattern)
// ═══════════════════════════════════════════════════════════════

export const getProducts = async (activeOnly = true) =>
  Product.find(activeOnly ? { isActive: true } : {}).sort({ name: 1 })

export const getProductById = async (id: string) => {
  const p = await Product.findById(id)
  if (!p) throw new Error('Product not found')
  return p
}

export const createProduct = async (data: {
  name: string; unit: string; mrp: number
  costPrice?: number; stockQty?: number; quickButtons?: number[]
}) => {
  const exists = await Product.findOne({ name: data.name.trim(), isActive: true })
  if (exists) throw new Error(`Product "${data.name}" already exists`)
  return Product.create(data)
}

export const updateProduct = async (id: string, data: Record<string, unknown>) => {
  const p = await Product.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
  if (!p) throw new Error('Product not found')
  return p
}

export const adjustStock = async (id: string, delta: number) => {
  const p = await Product.findOneAndUpdate(
    { _id: id, stockQty: { $gte: delta < 0 ? Math.abs(delta) : 0 } },
    { $inc: { stockQty: delta } },
    { new: true }
  )
  if (!p) throw new Error('Insufficient stock or product not found')
  return p
}

export const setStock = async (id: string, qty: number) => {
  const p = await Product.findByIdAndUpdate(id, { $set: { stockQty: qty } }, { new: true, runValidators: true })
  if (!p) throw new Error('Product not found')
  return p
}

export const deleteProduct = async (id: string) => {
  const p = await Product.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
  if (!p) throw new Error('Product not found')
  return p
}

// ═══════════════════════════════════════════════════════════════
// RETAIL SALES (POS)
// ═══════════════════════════════════════════════════════════════

export const createSale = async (data: {
  items: { productId: string; quantity: number; unitPrice: number }[]
  paymentMode: 'CASH' | 'UPI'
  customerName?: string
}) => {
  // Validate all stock upfront before touching anything
  for (const item of data.items) {
    const p = await Product.findById(item.productId)
    if (!p || !p.isActive)             throw new Error(`Product not found: ${item.productId}`)
    if (p.stockQty < item.quantity)    throw new Error(`Insufficient stock: ${p.name} (have ${p.stockQty} ${p.unit})`)
  }

  // Build line items + deduct stock atomically per product
  let totalAmount = 0
  const saleItems = []

  for (const item of data.items) {
    const p = await Product.findOneAndUpdate(
      { _id: item.productId, stockQty: { $gte: item.quantity } },
      { $inc: { stockQty: -item.quantity } },
      { new: true }
    )
    if (!p) throw new Error(`Stock race condition on product ${item.productId}. Please retry.`)

    const lineTotal = +(item.quantity * item.unitPrice).toFixed(2)
    totalAmount += lineTotal
    saleItems.push({
      productId:   p._id,
      productName: p.name,          // denormalized — survives product deletion
      unit:        p.unit,
      quantity:    item.quantity,
      unitPrice:   item.unitPrice,
      lineTotal,
    })
  }

  return Sale.create({
    items:        saleItems,
    totalAmount:  +totalAmount.toFixed(2),
    paymentMode:  data.paymentMode,
    customerName: data.customerName,
    dateTime:     new Date(),
  })
}

export const getSales = async (params: {
  from?: string; to?: string
  paymentMode?: string
  page?: number; limit?: number
}) => {
  const page  = Number(params.page  ?? 1)
  const limit = Number(params.limit ?? 20)
  const filter: Record<string, unknown> = {}

  if (params.paymentMode)     filter.paymentMode = params.paymentMode
  if (params.from || params.to) {
    filter.dateTime = {
      ...(params.from ? { $gte: new Date(params.from) } : {}),
      ...(params.to   ? { $lte: new Date(params.to)   } : {}),
    }
  }

  const [sales, total] = await Promise.all([
    Sale.find(filter).sort({ dateTime: -1 }).skip((page - 1) * limit).limit(limit),
    Sale.countDocuments(filter),
  ])

  return { sales, total, page, pages: Math.ceil(total / limit) }
}

export const getSaleById = async (id: string) => {
  const s = await Sale.findById(id)
  if (!s) throw new Error('Sale not found')
  return s
}

// ═══════════════════════════════════════════════════════════════
// WHOLESALE SALES
// ═══════════════════════════════════════════════════════════════

export const createWholesaleSale = async (data: {
  date: string
  buyerName: string
  quantityLiters: number
  fat?: number
  snf?: number
  ratePerLiter: number
  notes?: string
}) => {
  const totalAmount = +(data.quantityLiters * data.ratePerLiter).toFixed(2)
  return WholesaleSale.create({ ...data, date: new Date(data.date), totalAmount, paymentStatus: 'PENDING' })
}

export const getWholesaleSales = async (params: {
  status?: string; from?: string; to?: string
}) => {
  const filter: Record<string, unknown> = {}
  if (params.status)              filter.paymentStatus = params.status
  if (params.from || params.to) {
    filter.date = {
      ...(params.from ? { $gte: new Date(params.from) } : {}),
      ...(params.to   ? { $lte: new Date(params.to)   } : {}),
    }
  }
  return WholesaleSale.find(filter).sort({ date: -1 })
}

export const markWholesalePaymentReceived = async (id: string) => {
  const ws = await WholesaleSale.findByIdAndUpdate(
    id,
    { $set: { paymentStatus: 'RECEIVED', paymentDate: new Date() } },
    { new: true }
  )
  if (!ws) throw new Error('Wholesale sale not found')
  return ws
}

// ═══════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════

const dayBounds = (date?: string) => {
  const d = date ? new Date(date) : new Date()
  return {
    start: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    end:   new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
  }
}

export const getDailyReport = async (date?: string) => {
  const { start, end } = dayBounds(date)

  const [milkAgg, expense, salesAgg, salesByMode, wholesaleAgg, pendingAgg] = await Promise.all([
    // Total milk collected today
    MilkEntry.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$quantityLiters' }, entries: { $sum: 1 } } },
    ]),
    // Today's expenses
    Expense.findOne({ date: { $gte: start, $lte: end } }),
    // Retail sales totals
    Sale.aggregate([
      { $match: { dateTime: { $gte: start, $lte: end } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    // Breakdown by payment mode
    Sale.aggregate([
      { $match: { dateTime: { $gte: start, $lte: end } } },
      { $group: { _id: '$paymentMode', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    // Wholesale sold today
    WholesaleSale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, liters: { $sum: '$quantityLiters' }, revenue: { $sum: '$totalAmount' } } },
    ]),
    // All-time pending wholesale payments
    WholesaleSale.aggregate([
      { $match: { paymentStatus: 'PENDING' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
  ])

  const milkCollected  = milkAgg[0]?.total    ?? 0
  const expenseTotal   = expense
    ? expense.feed + expense.labor + expense.transport + expense.medical + expense.misc
    : 0
  const retailRevenue  = salesAgg[0]?.revenue  ?? 0
  const retailCount    = salesAgg[0]?.count    ?? 0
  const wholesaleRevenue = wholesaleAgg[0]?.revenue ?? 0
  const makingPrice    = milkCollected > 0 ? +(expenseTotal / milkCollected).toFixed(2) : 0

  return {
    date:    start,
    milk: {
      collected:   milkCollected,
      entries:     milkAgg[0]?.entries ?? 0,
      wholesaled:  wholesaleAgg[0]?.liters ?? 0,
      available:   Math.max(0, milkCollected - (wholesaleAgg[0]?.liters ?? 0)),
    },
    expenses:       { ...expense?.toObject(), total: expenseTotal },
    makingPrice,
    retail: {
      revenue:      retailRevenue,
      transactions: retailCount,
      byMode:       Object.fromEntries(salesByMode.map((r) => [r._id, { total: r.total, count: r.count }])),
    },
    wholesale: {
      revenue:      wholesaleRevenue,
      liters:       wholesaleAgg[0]?.liters ?? 0,
    },
    totalRevenue:   +(retailRevenue + wholesaleRevenue).toFixed(2),
    pendingPayments: {
      total:  pendingAgg[0]?.total ?? 0,
      count:  pendingAgg[0]?.count ?? 0,
    },
  }
}

export const getMonthlyReport = async (month: string) => {
  const [y, m] = month.split('-').map(Number)
  const start  = new Date(y, m - 1, 1)
  const end    = new Date(y, m, 0, 23, 59, 59, 999)

  const [milkAgg, expenseAgg, salesAgg, wholesaleAgg] = await Promise.all([
    MilkEntry.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$quantityLiters' } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          feed: { $sum: '$feed' }, labor: { $sum: '$labor' },
          transport: { $sum: '$transport' }, medical: { $sum: '$medical' }, misc: { $sum: '$misc' },
        },
      },
    ]),
    Sale.aggregate([
      { $match: { dateTime: { $gte: start, $lte: end } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    WholesaleSale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, liters: { $sum: '$quantityLiters' }, revenue: { $sum: '$totalAmount' } } },
    ]),
  ])

  const expTotal = expenseAgg[0]
    ? expenseAgg[0].feed + expenseAgg[0].labor + expenseAgg[0].transport
      + expenseAgg[0].medical + expenseAgg[0].misc
    : 0
  const milkTotal = milkAgg[0]?.total ?? 0

  return {
    month: `${y}-${String(m).padStart(2, '0')}`,
    milk:         { total: milkTotal },
    expenses:     { ...expenseAgg[0], total: expTotal },
    makingPrice:  milkTotal > 0 ? +(expTotal / milkTotal).toFixed(2) : 0,
    retail:       { revenue: salesAgg[0]?.revenue ?? 0, transactions: salesAgg[0]?.count ?? 0 },
    wholesale:    { revenue: wholesaleAgg[0]?.revenue ?? 0, liters: wholesaleAgg[0]?.liters ?? 0 },
    totalRevenue: +((salesAgg[0]?.revenue ?? 0) + (wholesaleAgg[0]?.revenue ?? 0)).toFixed(2),
  }
}