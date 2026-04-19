import { useState, useCallback } from 'react'
import { shopApi } from '../lib/api'
import type { Product } from '../types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const fetchProducts = useCallback(async (all?: boolean) => {
    setLoading(true); setError(null)
    try {
      const res = await shopApi.getProducts(all)
      setProducts(res.data.data ?? res.data)
    } catch { setError('Failed to load products') }
    finally  { setLoading(false) }
  }, [])

  const createProduct = useCallback(async (data: {
    name: string; unit: string; mrp: number
    costPrice?: number; stockQty?: number; quickButtons?: number[]
  }) => {
    const res = await shopApi.createProduct(data)
    const p   = res.data.data ?? res.data
    setProducts((prev) => [...prev, p])
    return p
  }, [])

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const res = await shopApi.updateProduct(id, data)
    const p   = res.data.data ?? res.data
    setProducts((prev) => prev.map((x) => x._id === id ? p : x))
    return p
  }, [])

  const updateStock = useCallback(async (id: string, qty: number) => {
    const res = await shopApi.setStock(id, qty)
    const p   = res.data.data ?? res.data
    setProducts((prev) => prev.map((x) => x._id === id ? p : x))
    return p
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    await shopApi.deleteProduct(id)
    setProducts((prev) => prev.filter((x) => x._id !== id))
  }, [])

  return { products, loading, error, fetchProducts, createProduct, updateProduct, updateStock, deleteProduct }
}
