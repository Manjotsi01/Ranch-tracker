import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useProducts } from '../../../hooks/useProducts'
import { Button } from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import type { Product } from '../../../types'

const EMPTY = { name: '', unit: 'kg', mrp: '', costPrice: '', stockQty: '', quickButtons: '1' }

const ProductsTab: React.FC = () => {
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts()
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState(EMPTY)

  useEffect(() => { fetchProducts(true) }, [fetchProducts])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, unit: p.unit, mrp: String(p.mrp), costPrice: String(p.costPrice),
              stockQty: String(p.stockQty), quickButtons: p.quickButtons.join(',') })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.mrp) return
    setSaving(true)
    try {
      const payload = {
        name: form.name, unit: form.unit, mrp: +form.mrp,
        costPrice: form.costPrice ? +form.costPrice : 0,
        stockQty:  form.stockQty  ? +form.stockQty  : 0,
        quickButtons: form.quickButtons.split(',').map(Number).filter(Boolean),
      }
      if (editing) await updateProduct(editing._id, payload)
      else         await createProduct(payload)
      setModal(false)
    } finally { setSaving(false) }
  }

  const f = (v: string, key: string) => setForm((p) => ({ ...p, [key]: v }))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-slate-700">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        <Button icon={<Plus size={14} />} onClick={openCreate} size="sm">Add Product</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p._id} className={`bg-white border rounded-xl px-4 py-3 flex items-center justify-between ${!p.isActive ? 'opacity-40' : 'border-slate-100'}`}>
              <div>
                <p className="text-sm font-semibold text-slate-800">{p.name}
                  {!p.isActive && <span className="ml-2 text-xs text-slate-400">(inactive)</span>}
                </p>
                <p className="text-xs text-slate-400">
                  ₹{p.mrp}/{p.unit} · Stock: <span className={p.stockQty <= 0 ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>{p.stockQty} {p.unit}</span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => deleteProduct(p._id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'} size="sm"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}>Save</Button></>}
      >
        <div className="space-y-3">
          <Input label="Product name" value={form.name} onChange={(e) => f(e.target.value, 'name')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Unit (kg / ltr / pcs)" value={form.unit} onChange={(e) => f(e.target.value, 'unit')} />
            <Input label="MRP (₹)" type="number" value={form.mrp} onChange={(e) => f(e.target.value, 'mrp')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cost price (₹)" type="number" value={form.costPrice} onChange={(e) => f(e.target.value, 'costPrice')} />
            <Input label="Opening stock" type="number" value={form.stockQty} onChange={(e) => f(e.target.value, 'stockQty')} />
          </div>
          <Input label="Quick qty buttons (comma-separated)" value={form.quickButtons}
            onChange={(e) => f(e.target.value, 'quickButtons')}
            placeholder="e.g. 0.5,1,2" />
        </div>
      </Modal>
    </div>
  )
}

export default ProductsTab