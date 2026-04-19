import React, { useEffect, useCallback } from 'react'
import { ShoppingCart, Trash2, Plus, Minus, X, CheckCircle, Banknote, Smartphone, AlertTriangle } from 'lucide-react'
import { useProducts } from '../../../hooks/useProducts'
import { useSales }    from '../../../hooks/useSales'
import { useCartStore } from '../../../store'
import { Button }  from '../../../components/ui/Button'
import  Modal      from '../../../components/ui/Modal'
import { useState } from 'react'
import type { Product } from '../../../types'

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

const POS: React.FC = () => {
  const { products, loading, fetchProducts } = useProducts()
  const { createSale } = useSales()

  const { items, paymentMode, customerName, addItem, updateQty, removeItem,
          clearCart, setPayment, setCustomer, total, itemCount } = useCartStore()

  const [submitting,   setSubmitting]   = useState(false)
  const [saleError,    setSaleError]    = useState<string | null>(null)
  const [successSale,  setSuccessSale]  = useState<{ total: number } | null>(null)

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleAdd = useCallback((p: Product, qty: number) => {
    if (p.stockQty < qty) return
    addItem(p, qty)
  }, [addItem])

  const handleCheckout = async () => {
    if (items.length === 0) return
    setSubmitting(true); setSaleError(null)
    try {
      await createSale({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
        paymentMode,
        customerName: customerName || undefined,
      })
      setSuccessSale({ total: total() })
      clearCart()
      fetchProducts()    // refresh stock counts
    } catch (e: unknown) {
      setSaleError(e instanceof Error ? e.message : 'Sale failed. Try again.')
    } finally { setSubmitting(false) }
  }

  const cartTotal  = total()
  const cartCount  = itemCount()

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Left: Products ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <ShoppingCart size={36} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No products yet</p>
            <p className="text-xs mt-1">Add products in Inventory → Products tab</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Cart ─────────────────────────────────────────────────── */}
      <div className="w-96 shrink-0 flex flex-col bg-white border-l border-slate-100">

        {/* Cart header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={17} className="text-slate-700" />
            <span className="font-bold text-slate-900">Cart</span>
            {cartCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">{cartCount}</span>
            )}
          </div>
          {items.length > 0 && (
            <button onClick={clearCart} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer">
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {/* Customer name */}
        <div className="px-5 py-3 border-b border-slate-100">
          <input
            value={customerName}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Customer name (optional)"
            className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-slate-300">
              <ShoppingCart size={28} className="mb-2" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : items.map((item) => (
            <div key={item.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.productName}</p>
                  <p className="text-xs text-slate-400">{fmt(item.unitPrice)} / {item.unit}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 cursor-pointer">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-slate-600 cursor-pointer">
                    <Minus size={11} />
                  </button>
                  <span className="text-sm font-bold text-slate-900 w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-slate-600 cursor-pointer">
                    <Plus size={11} />
                  </button>
                </div>
                <span className="text-sm font-bold text-slate-900">{fmt(item.lineTotal)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Payment mode */}
        <div className="px-5 py-3 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Payment</p>
          <div className="grid grid-cols-2 gap-2">
            {(['CASH', 'UPI'] as const).map((mode) => (
              <button key={mode} onClick={() => setPayment(mode)}
                className={[
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all',
                  paymentMode === mode
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300',
                ].join(' ')}
              >
                {mode === 'CASH' ? <Banknote size={15} /> : <Smartphone size={15} />}
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Total + checkout */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex justify-between items-center text-lg font-bold mb-3">
            <span className="text-slate-800">Total</span>
            <span className="text-blue-600">{fmt(cartTotal)}</span>
          </div>
          {saleError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-sm text-red-700">
              <AlertTriangle size={13} className="shrink-0" />
              {saleError}
            </div>
          )}
          <Button size="lg" loading={submitting} disabled={items.length === 0} onClick={handleCheckout}
            className="!text-base !font-bold w-full">
            Confirm Sale · {fmt(cartTotal)}
          </Button>
        </div>
      </div>

      {/* Success modal */}
      <Modal open={!!successSale} onClose={() => setSuccessSale(null)} title="Sale Confirmed!" size="sm"
        footer={<Button onClick={() => setSuccessSale(null)}>New Sale</Button>}
      >
        {successSale && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{fmt(successSale.total)}</p>
            <p className="text-sm text-slate-500">Paid via {paymentMode} · Stock updated</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard: React.FC<{ product: Product; onAdd: (p: Product, qty: number) => void }> = ({ product, onAdd }) => {
  const outOfStock = product.stockQty <= 0

  return (
    <div className={`bg-white border rounded-2xl p-4 transition-all duration-200 ${
      outOfStock ? 'opacity-50 border-slate-100' : 'border-slate-100 hover:border-blue-300 hover:shadow-md'
    }`}>
      <p className="font-bold text-slate-900 text-sm leading-tight">{product.name}</p>
      <p className="text-xs text-slate-400 mt-0.5">{product.stockQty} {product.unit} left</p>
      <p className="text-base font-bold text-blue-600 mt-2">
        {`₹${product.mrp}`}
        <span className="text-xs font-normal text-slate-400">/{product.unit}</span>
      </p>

      {/* Quick buttons */}
      <div className="flex gap-1 mt-3 flex-wrap">
        {(product.quickButtons ?? [1]).map((qty) => (
          <button
            key={qty}
            disabled={outOfStock}
            onClick={() => onAdd(product, qty)}
            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            +{qty}
          </button>
        ))}
      </div>
    </div>
  )
}

export default POS