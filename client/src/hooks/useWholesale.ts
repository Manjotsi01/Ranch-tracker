import { useState, useCallback } from 'react'
import { shopApi } from '../lib/api'
import type { WholesaleSale } from '../types'

export function useWholesale() {
  const [sales,   setSales]   = useState<WholesaleSale[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const fetchSales = useCallback(async (params?: Record<string, string>) => {
    setLoading(true); setError(null)
    try {
      const res = await shopApi.getWholesale(params)
      setSales(res.data.data ?? res.data)
    } catch { setError('Failed to load wholesale data') }
    finally  { setLoading(false) }
  }, [])

  const createSale = useCallback(async (data: {
    date: string; buyerName: string; quantityLiters: number
    fat?: number; snf?: number; ratePerLiter: number; notes?: string
  }) => {
    const res  = await shopApi.createWholesale(data)
    const sale = res.data.data ?? res.data
    setSales((prev) => [sale, ...prev])
    return sale as WholesaleSale
  }, [])

  const markReceived = useCallback(async (id: string) => {
    const res  = await shopApi.markPaymentReceived(id)
    const sale = res.data.data ?? res.data
    setSales((prev) => prev.map((s) => s._id === id ? sale : s))
    return sale as WholesaleSale
  }, [])

  return { sales, loading, error, fetchSales, createSale, markReceived }
}