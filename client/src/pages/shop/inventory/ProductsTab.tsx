// src/pages/shop/inventory/ProductsTab.tsx
// Products management — clean white redesign
// Hooks: useProducts() — unchanged

import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Package } from 'lucide-react'
import { useProducts } from '../../../hooks/useProducts'
import type { Product, ProductCategory } from '../../../types'
import {
  SectionCard, EmptyState, Badge, ShopButton, ShopInput,
  ShopSelect, SkeletonBlock, SHOP_COLORS,
} from '../../../components/shop/ShopUI'

const EMPTY = {
  name: '', category: 'OTHER' as ProductCategory,
  unit: 'kg', mrp: '', costPrice: '', stockQty: '',
  quickButtons: '1', lowStockThreshold: '5', isActive: true,
}

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  'MILK','CURD','PANEER','GHEE','BUTTER','LASSI','KHOYA','CREAM','OTHER'
].map(c => ({ value: c, label: c }))

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`

function marginPct(cost: number, mrp: number) {
  return mrp > 0 ? `${Math.round(((mrp - cost) / mrp) * 100)}%` : '—'
}

function stockBadge(p: Product) {
  if (p.stockQty <= 0)                  return <Badge variant="red">Out of stock</Badge>
  if (p.stockQty <= p.lowStockThreshold) return <Badge variant="amber">Low: {p.stockQty} {p.unit}</Badge>
  return <Badge variant="green">{p.stockQty} {p.unit}</Badge>
}

export default function ProductsTab() {
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Product | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [errors,   setErrors]   = useState<Record<string, string>>({})

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit   = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name, category: p.category, unit: p.unit,
      mrp: String(p.mrp), costPrice: String(p.costPrice),
      stockQty: String(p.stockQty),
      quickButtons: (p.quickButtons ?? [1]).join(','),
      lowStockThreshold: String(p.lowStockThreshold),
      isActive: p.isActive,
    })
    setShowForm(true)
  }

  const set = (k: string, v: string | boolean) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())            e.name = 'Product name is required'
    if (!form.mrp || +form.mrp <= 0)  e.mrp  = 'MRP must be greater than 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        name:     form.name.trim(),
        category: form.category,
        unit:     form.unit || 'kg',
        mrp:      +form.mrp,
        costPrice: +form.costPrice || 0,
        stockQty:  +form.stockQty  || 0,
        quickButtons:      form.quickButtons.split(',').map(Number).filter(Boolean),
        lowStockThreshold: +form.lowStockThreshold || 5,
        isActive:  form.isActive,
      }
      if (editing) await updateProduct(editing._id, payload)
      else         await createProduct(payload as any)
      setShowForm(false); setEditing(null); setErrors({})
    } finally { setSaving(false) }
  }

  const cancel = () => { setShowForm(false); setEditing(null); setErrors({}) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: SHOP_COLORS.gray500 }}>
          {loading ? '…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
        </p>
        <ShopButton size="sm" leftIcon={<Plus size={13} />} onClick={openCreate}>
          Add Product
        </ShopButton>
      </div>

      {/* Form */}
      {showForm && (
        <SectionCard title={editing ? `Edit — ${editing.name}` : 'New Product'}>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={gridTwo}>
              <ShopInput
                label="Name *"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Paneer 500g"
                error={errors.name}
              />
              <ShopSelect
                label="Category"
                value={form.category}
                options={CATEGORY_OPTIONS}
                onChange={e => set('category', e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <ShopInput label="Unit" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="kg / L / pcs" />
              <ShopInput label="MRP (₹) *" type="number" value={form.mrp} onChange={e => set('mrp', e.target.value)} placeholder="0" error={errors.mrp} prefix={<span style={{ fontSize: 12 }}>₹</span>} />
              <ShopInput label="Cost (₹)" type="number" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} placeholder="0" prefix={<span style={{ fontSize: 12 }}>₹</span>} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <ShopInput label="Opening Stock" type="number" value={form.stockQty} onChange={e => set('stockQty', e.target.value)} placeholder="0" />
              <ShopInput label="Low Stock Alert" type="number" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} placeholder="5" />
              <ShopInput label="Quick Buttons" value={form.quickButtons} onChange={e => set('quickButtons', e.target.value)} placeholder="0.5,1,2" />
            </div>
            {/* Active toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => set('isActive', !form.isActive)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.isActive ? SHOP_COLORS.green : SHOP_COLORS.gray400, padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {form.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              </button>
              <span style={{ fontSize: 13, color: SHOP_COLORS.gray600 }}>Product is {form.isActive ? 'active' : 'inactive'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <ShopButton variant="ghost" onClick={cancel} style={{ flex: 1 }}>Cancel</ShopButton>
              <ShopButton loading={saving} onClick={handleSave} style={{ flex: 2 }}>
                {editing ? 'Update Product' : 'Create Product'}
              </ShopButton>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Product list */}
      <SectionCard noPadding>
        {loading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} height={52} radius={8} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={26} style={{ color: SHOP_COLORS.gray300 }} />}
            title="No products yet"
            sub="Add products to sell at the counter"
            action={<ShopButton size="sm" leftIcon={<Plus size={13} />} onClick={openCreate}>Add First Product</ShopButton>}
          />
        ) : (
          <div>
            {products.map((p, i) => {
              const stockColor = p.stockQty <= 0
                ? SHOP_COLORS.red
                : p.stockQty <= p.lowStockThreshold
                ? SHOP_COLORS.amber
                : SHOP_COLORS.green

              return (
                <div
                  key={p._id}
                  style={{
                    ...productRow,
                    opacity: p.isActive ? 1 : 0.5,
                    borderTop: i > 0 ? `1px solid ${SHOP_COLORS.gray100}` : 'none',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SHOP_COLORS.gray50 }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: SHOP_COLORS.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={16} style={{ color: SHOP_COLORS.blue }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: SHOP_COLORS.gray900 }}>{p.name}</span>
                        <Badge variant="gray">{p.category}</Badge>
                        {!p.isActive && <Badge variant="gray">Inactive</Badge>}
                      </div>
                      <p style={{ fontSize: 11, color: SHOP_COLORS.gray400, margin: '2px 0 0' }}>
                        {fmt(p.mrp)}/{p.unit} · Cost {fmt(p.costPrice)} · Margin {marginPct(p.costPrice, p.mrp)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: stockColor }}>
                      {p.stockQty} {p.unit}
                    </span>
                    {stockBadge(p)}
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        title={p.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => updateProduct(p._id, { isActive: !p.isActive })}
                        style={iconBtn}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SHOP_COLORS.gray100 }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        {p.isActive
                          ? <ToggleRight size={16} style={{ color: SHOP_COLORS.green }} />
                          : <ToggleLeft  size={16} style={{ color: SHOP_COLORS.gray400 }} />}
                      </button>
                      <button
                        title="Edit"
                        onClick={() => openEdit(p)}
                        style={iconBtn}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SHOP_COLORS.blueLight; (e.currentTarget as HTMLElement).style.color = SHOP_COLORS.blue }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = SHOP_COLORS.gray400 }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => deleteProduct(p._id)}
                        style={iconBtn}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SHOP_COLORS.redLight; (e.currentTarget as HTMLElement).style.color = SHOP_COLORS.red }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = SHOP_COLORS.gray400 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const gridTwo: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
}

const productRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 18px', gap: 16, transition: 'background 0.1s',
}

const iconBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 7, border: 'none',
  background: 'transparent', cursor: 'pointer', color: SHOP_COLORS.gray400,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s',
}