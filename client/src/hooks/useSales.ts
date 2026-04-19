import { useState, useCallback } from 'react'
import { shopApi } from '../lib/api'
import type { Sale, CreateSalePayload } from '../types'

export function useSales() {
  const [sales,   setSales]   = useState<Sale[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const fetchSales = useCallback(async (params?: Record<string, string | number>) => {
    setLoading(true); setError(null)
    try {
      const res     = await shopApi.getSales(params)
      const payload = res.data.data ?? res.data
      if (Array.isArray(payload)) { setSales(payload); setTotal(payload.length) }
      else { setSales(payload.sales ?? []); setTotal(payload.total ?? 0) }
    } catch { setError('Failed to load sales') }
    finally  { setLoading(false) }
  }, [])

  const createSale = useCallback(async (payload: CreateSalePayload) => {
    setLoading(true); setError(null)
    try {
      const res  = await shopApi.createSale(payload)
      const sale = res.data.data ?? res.data
      setSales((prev) => [sale, ...prev])
      return sale as Sale
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sale failed'
      setError(msg); throw e
    } finally { setLoading(false) }
  }, [])

  return { sales, total, loading, error, fetchSales, createSale }
}