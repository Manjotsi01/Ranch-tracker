import { Router } from 'express'

const router = Router()

router.get('/daily', async (_req, res) => {
  res.json({
    success: true,
    data: {
      milkCollected: 0,
      sales: 0,
      expenses: 0,
      profit: 0,
    },
  })
})

router.get('/monthly', async (_req, res) => {
  res.json({
    success: true,
    data: {},
  })
})

export default router