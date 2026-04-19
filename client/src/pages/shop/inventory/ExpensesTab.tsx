import React, { useEffect, useState } from 'react'
import { shopApi } from '../../../lib/api'
import { Button }  from '../../../components/ui/Button'
import { Input }   from '../../../components/ui/Input'
import type { MakingPrice } from '../../../types'

const today = () => new Date().toISOString().slice(0, 10)

const FIELDS = ['feed', 'labor', 'transport', 'medical', 'misc'] as const
type Field = typeof FIELDS[number]

const ExpensesTab: React.FC = () => {
  const [date,  setDate]  = useState(today())
  const [form,  setForm]  = useState<Record<Field, string>>({ feed: '', labor: '', transport: '', medical: '', misc: '' })
  const [mp,    setMp]    = useState<MakingPrice | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    shopApi.getMakingPrice(date)
      .then((r) => {
        const data = r.data.data ?? r.data
        setMp(data)
        // Prefill from existing expense if any
        if (data.expenseTotal > 0) {
          shopApi.getExpenses({ from: date, to: date }).then((er) => {
            const exp = (er.data.data ?? er.data)[0]
            if (exp) setForm({ feed: String(exp.feed), labor: String(exp.labor),
              transport: String(exp.transport), medical: String(exp.medical), misc: String(exp.misc) })
          })
        }
      })
      .catch(() => {})
  }, [date])

  const total = FIELDS.reduce((s, f) => s + (Number(form[f]) || 0), 0)

  const handleSave = async () => {
    setSaving(true); setSaved(false)
    try {
      await shopApi.upsertExpense({ date, ...Object.fromEntries(FIELDS.map((f) => [f, Number(form[f]) || 0])) })
      const r = await shopApi.getMakingPrice(date)
      setMp(r.data.data ?? r.data)
      setSaved(true)
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 max-w-lg">
      <Input label="Date" type="date" value={date} onChange={(e) => { setDate(e.target.value); setSaved(false) }} />

      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-bold text-slate-700 mb-1">Daily expenses</p>
        {FIELDS.map((field) => (
          <div key={field} className="flex items-center gap-3">
            <label className="text-sm text-slate-600 capitalize w-24 shrink-0">{field}</label>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input
                type="number" min={0} value={form[field]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                placeholder="0"
                className="w-full h-10 pl-7 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
        <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-700">Total expenses</span>
          <span className="text-base font-bold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Making price result */}
      {mp && mp.milkTotal > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Making Price</p>
          <p className="text-2xl font-bold text-emerald-800">₹{mp.makingPrice} / litre</p>
          <p className="text-xs text-emerald-600 mt-1">
            ₹{mp.expenseTotal} ÷ {mp.milkTotal} L = ₹{mp.makingPrice}/L
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button loading={saving} onClick={handleSave}>Save Expenses</Button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Saved ✓</span>}
      </div>
    </div>
  )
}

export default ExpensesTab