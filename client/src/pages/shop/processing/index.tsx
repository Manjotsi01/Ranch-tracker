// client/src/pages/shop/processing/index.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { Factory, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'
import { shopApi } from '../../../lib/api'

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`

// Conversion ratios: how much milk (L) to make 1 unit of output
// Output unit is listed beside each product
const RECIPES: Record<string, { label: string; milkPerUnit: number; outputUnit: string; outputQty: (milk: number) => number }> = {
  CURD:   { label: 'Curd (Dahi)',   milkPerUnit: 1,  outputUnit: 'L',  outputQty: (m) => m },
  PANEER: { label: 'Paneer',        milkPerUnit: 5,  outputUnit: 'kg', outputQty: (m) => m / 5 },
  GHEE:   { label: 'Ghee',          milkPerUnit: 25, outputUnit: 'kg', outputQty: (m) => m / 25 },
  BUTTER: { label: 'Butter',        milkPerUnit: 20, outputUnit: 'kg', outputQty: (m) => m / 20 },
  LASSI:  { label: 'Lassi',         milkPerUnit: 1,  outputUnit: 'L',  outputQty: (m) => m * 1.5 },
  CREAM:  { label: 'Cream',         milkPerUnit: 10, outputUnit: 'kg', outputQty: (m) => m / 5 },
  KHOYA:  { label: 'Khoya (Mawa)',  milkPerUnit: 8,  outputUnit: 'kg', outputQty: (m) => m / 8 },
}

interface MilkStock { collected: number; wholesaled: number; available: number }

const Processing: React.FC = () => {
  const [stock,       setStock]       = useState<MilkStock | null>(null)
  const [products,    setProducts]    = useState<any[]>([])
  const [milkInput,   setMilkInput]   = useState('')
  const [productType, setProductType] = useState('')
  const [milkRate,    setMilkRate]    = useState('50')
  const [materialCost, setMaterialCost] = useState('0')
  const [gasCost,     setGasCost]     = useState('0')
  const [saving,      setSaving]      = useState(false)
  const [result,      setResult]      = useState<{ product: string; qty: number; unit: string; totalCost: number } | null>(null)
  const [error,       setError]       = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  const loadData = useCallback(async () => {
    const [s, p] = await Promise.all([
      shopApi.getMilkStock(today),
      shopApi.getProducts(),
    ])
    setStock(s)
    setProducts(p)
  }, [today])

  useEffect(() => { loadData() }, [loadData])

  const recipe = RECIPES[productType]
  const milkL  = parseFloat(milkInput) || 0
  const outputQty = recipe ? recipe.outputQty(milkL) : 0
  const milkCost  = milkL * (parseFloat(milkRate) || 0)
  const totalCost = milkCost + (parseFloat(materialCost) || 0) + (parseFloat(gasCost) || 0)
  const costPerUnit = outputQty > 0 ? totalCost / outputQty : 0

  // Check if we have enough milk
  const availableMilk = stock?.available ?? 0
  const notEnoughMilk = milkL > availableMilk

  // Find the matching product in DB
  const matchedProduct = products.find(
    (p) => p.category === productType || p.name.toLowerCase().includes(recipe?.label.split(' ')[0].toLowerCase() ?? '')
  )

  const handleProcess = async () => {
    if (!recipe || milkL <= 0) return
    if (notEnoughMilk) { setError(`Not enough milk. Available: ${availableMilk.toFixed(1)} L`); return }
    if (!matchedProduct) { setError(`No product found for "${recipe.label}". Add it in Products tab first.`); return }

    setSaving(true)
    setError(null)
    try {
      // 1. Deduct milk: record a "processing" wholesale-style usage
      //    We use stock adjust on milk indirectly by creating a processing sale
      //    Since there's no processing model yet, we adjust the product stock directly
      //    and log it as a note. This is MVP — no separate Processing model needed.

      // Increase product stock
      await shopApi.adjustStock(matchedProduct._id, +outputQty.toFixed(2))

      // Record milk usage: we use the wholesale endpoint with buyerName = 'PROCESSING'
      // This deducts milk stock correctly (getMilkStock already deducts wholesaled qty)
      await shopApi.createWholesaleSale({
        date:           today,
        buyerName:      `Processing → ${recipe.label}`,
        quantityLiters: milkL,
        ratePerLiter:   parseFloat(milkRate) || 0,
        notes:          `Processed ${outputQty.toFixed(2)} ${recipe.outputUnit} of ${recipe.label}. Total cost: ₹${totalCost.toFixed(0)}`,
      })

      setResult({ product: recipe.label, qty: +outputQty.toFixed(2), unit: recipe.outputUnit, totalCost })
      setMilkInput('')
      setMaterialCost('0')
      setGasCost('0')
      loadData()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Processing failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Factory size={20} className="text-purple-600" /> Milk Processing
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Convert milk into dairy products</p>
      </div>

      {/* Milk stock strip */}
      {stock && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Collected', value: `${stock.collected.toFixed(1)} L`, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Used/Wholesale', value: `${stock.wholesaled.toFixed(1)} L`, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Available', value: `${stock.available.toFixed(1)} L`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-800">Processing complete!</p>
            <p className="text-sm text-emerald-700 mt-1">
              Produced <strong>{result.qty} {result.unit}</strong> of {result.product} · Total cost {fmt(result.totalCost)}
            </p>
            <button onClick={() => setResult(null)} className="text-xs text-emerald-600 underline mt-2">Dismiss</button>
          </div>
        </div>
      )}

      {/* Processing form */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-5">
        <p className="text-sm font-bold text-slate-800">New Processing Batch</p>

        {/* Product selector */}
        <div>
          <label className="field-label">Select Product to Make</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {Object.entries(RECIPES).map(([key, r]) => (
              <button
                key={key}
                onClick={() => setProductType(key)}
                className={[
                  'p-3 rounded-xl border text-left transition-all',
                  productType === key
                    ? 'border-purple-400 bg-purple-50 text-purple-800'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700',
                ].join(' ')}
              >
                <p className="font-semibold text-sm">{r.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.milkPerUnit} L → 1 {r.outputUnit}</p>
              </button>
            ))}
          </div>
        </div>

        {productType && recipe && (
          <>
            {/* Milk input */}
            <div>
              <label className="field-label">Milk Input (Liters)</label>
              <div className="relative mt-1">
                <input
                  type="number" min="0" step="0.5" value={milkInput}
                  onChange={e => { setMilkInput(e.target.value); setError(null) }}
                  placeholder="e.g. 10"
                  className={`field-input ${notEnoughMilk && milkL > 0 ? 'border-red-400' : ''}`}
                />
                {notEnoughMilk && milkL > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Only {availableMilk.toFixed(1)} L available today
                  </p>
                )}
              </div>
            </div>

            {/* Live conversion preview */}
            {milkL > 0 && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">Output Preview</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-purple-800">{milkL} L milk</span>
                  <ChevronRight size={14} className="text-purple-400" />
                  <span className="font-bold text-purple-800">{outputQty.toFixed(2)} {recipe.outputUnit} {recipe.label}</span>
                </div>
              </div>
            )}

            {/* Costing section */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Costing (optional)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="field-label">Milk Rate (₹/L)</label>
                  <input type="number" min="0" value={milkRate}
                    onChange={e => setMilkRate(e.target.value)} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Material (₹)</label>
                  <input type="number" min="0" value={materialCost}
                    onChange={e => setMaterialCost(e.target.value)} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Gas / Labor (₹)</label>
                  <input type="number" min="0" value={gasCost}
                    onChange={e => setGasCost(e.target.value)} className="field-input" />
                </div>
              </div>
            </div>

            {/* Cost summary */}
            {milkL > 0 && (
              <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Milk cost</span><span>{fmt(milkCost)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Material</span><span>{fmt(parseFloat(materialCost) || 0)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Gas / labor</span><span>{fmt(parseFloat(gasCost) || 0)}</span></div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-2 mt-1">
                  <span>Total cost</span><span>{fmt(totalCost)}</span>
                </div>
                {outputQty > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Cost per {recipe.outputUnit}</span><span>{fmt(costPerUnit)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Matched product note */}
            {matchedProduct ? (
              <div className="text-xs text-emerald-600 flex items-center gap-1.5">
                <CheckCircle size={12} />
                Will add to <strong>{matchedProduct.name}</strong> (current stock: {matchedProduct.stockQty} {matchedProduct.unit})
              </div>
            ) : (
              <div className="text-xs text-amber-600 flex items-center gap-1.5">
                <AlertCircle size={12} />
                No "{recipe.label}" product found. Add it in the Products tab first.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <AlertCircle size={13} className="shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={saving || milkL <= 0 || notEnoughMilk || !matchedProduct}
              className="w-full h-11 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : `Process ${milkL > 0 ? `${milkL} L →` : ''} ${outputQty > 0 ? `${outputQty.toFixed(1)} ${recipe.outputUnit} ${recipe.label}` : recipe.label}`
              }
            </button>
          </>
        )}
      </div>

      {/* Conversion table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide px-5 py-3 border-b border-slate-50">Conversion Ratios</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-5 py-2 text-xs font-semibold text-slate-500">Product</th>
              <th className="text-right px-5 py-2 text-xs font-semibold text-slate-500">Milk needed</th>
              <th className="text-right px-5 py-2 text-xs font-semibold text-slate-500">Output</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {Object.entries(RECIPES).map(([, r]) => (
              <tr key={r.label}>
                <td className="px-5 py-2.5 font-medium text-slate-800">{r.label}</td>
                <td className="px-5 py-2.5 text-right text-slate-600">{r.milkPerUnit} L</td>
                <td className="px-5 py-2.5 text-right text-emerald-700 font-semibold">1 {r.outputUnit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Processing