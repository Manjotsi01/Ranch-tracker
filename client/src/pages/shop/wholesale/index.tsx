import React, { useEffect, useState } from 'react'
import { Plus, CheckCircle } from 'lucide-react'
import { useWholesale } from '../../../hooks/useWholesale'
import { Button } from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'

const fmt  = (n: number) => `₹${n.toLocaleString('en-IN')}`
const today = () => new Date().toISOString().slice(0, 10)

const Wholesale: React.FC = () => {
  const { sales, loading, fetchSales, createSale, markReceived } = useWholesale()
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RECEIVED'>('ALL')
  const [modal,  setModal]  = useState(false)
  const [saving, setSaving] = useState(false)
  const [form,   setForm]   = useState({
    date: today(), buyerName: '', quantityLiters: '', fat: '', snf: '', ratePerLiter: '', notes: '',
  })

  useEffect(() => {
    fetchSales(filter === 'ALL' ? {} : { status: filter })
  }, [fetchSales, filter])

  const totalPending = sales.filter((s) => s.paymentStatus === 'PENDING').reduce((s, x) => s + x.totalAmount, 0)

  const handleSave = async () => {
    if (!form.buyerName || !form.quantityLiters || !form.ratePerLiter) return
    setSaving(true)
    try {
      await createSale({
        date: form.date, buyerName: form.buyerName,
        quantityLiters: +form.quantityLiters,
        fat: form.fat ? +form.fat : undefined,
        snf: form.snf ? +form.snf : undefined,
        ratePerLiter: +form.ratePerLiter,
        notes: form.notes || undefined,
      })
      setModal(false)
      setForm({ date: today(), buyerName: '', quantityLiters: '', fat: '', snf: '', ratePerLiter: '', notes: '' })
    } finally { setSaving(false) }
  }

  const f = (v: string, k: string) => setForm((p) => ({ ...p, [k]: v }))
  const qty     = +form.quantityLiters || 0
  const rate    = +form.ratePerLiter   || 0
  const preview = qty * rate

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Wholesale Sales</h2>
          {totalPending > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-0.5">{fmt(totalPending)} pending payment</p>
          )}
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setModal(true)}>New Sale</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL', 'PENDING', 'RECEIVED'] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors',
              filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
            ].join(' ')}
          >{s}</button>
        ))}
      </div>

      {/* Sales list */}
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : sales.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No wholesale sales found.</p>
      ) : (
        <div className="space-y-3">
          {sales.map((s) => (
            <div key={s._id} className={`bg-white border rounded-2xl px-5 py-4 ${s.paymentStatus === 'PENDING' ? 'border-amber-200' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900">{s.buyerName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{s.quantityLiters} L @ ₹{s.ratePerLiter}/L
                    {s.fat ? ` · FAT ${s.fat}%` : ''}{s.snf ? ` · SNF ${s.snf}%` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{fmt(s.totalAmount)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    s.paymentStatus === 'PENDING'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>{s.paymentStatus}</span>
                </div>
              </div>
              {s.paymentStatus === 'PENDING' && (
                <button onClick={() => markReceived(s._id)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                  <CheckCircle size={13} /> Mark as received
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New sale modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Wholesale Sale" size="sm"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}>Save</Button></>}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={(e) => f(e.target.value, 'date')} />
            <Input label="Buyer name" value={form.buyerName} onChange={(e) => f(e.target.value, 'buyerName')} placeholder="Verka, Amul…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity (L)" type="number" value={form.quantityLiters} onChange={(e) => f(e.target.value, 'quantityLiters')} />
            <Input label="Rate (₹/L)" type="number" value={form.ratePerLiter} onChange={(e) => f(e.target.value, 'ratePerLiter')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="FAT %" type="number" step="0.1" value={form.fat} onChange={(e) => f(e.target.value, 'fat')} />
            <Input label="SNF %" type="number" step="0.1" value={form.snf} onChange={(e) => f(e.target.value, 'snf')} />
          </div>
          {preview > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex justify-between items-center">
              <span className="text-sm text-blue-700">Total amount</span>
              <span className="font-bold text-blue-800">{fmt(preview)}</span>
            </div>
          )}
          <Input label="Notes (optional)" value={form.notes} onChange={(e) => f(e.target.value, 'notes')} />
        </div>
      </Modal>
    </div>
  )
}

export default Wholesale