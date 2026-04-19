import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useMilk } from '../../../hooks/usemilk'
import { Button }  from '../../../components/ui/Button'
import  Modal      from '../../../components/ui/Modal'
import { Input, Select } from '../../../components/ui/Input'

const today = () => new Date().toISOString().slice(0, 10)

const MilkTab: React.FC = () => {
  const { entries, stock, loading, fetchEntries, fetchStock, addEntry } = useMilk()
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: today(), shift: 'MORNING' as 'MORNING' | 'EVENING',
    quantityLiters: '', fat: '', snf: '', source: 'OWN' as 'OWN' | 'PURCHASED', notes: '',
  })

  useEffect(() => { fetchEntries(); fetchStock() }, [fetchEntries, fetchStock])

  const handleSave = async () => {
    if (!form.quantityLiters) return
    setSaving(true)
    try {
      await addEntry({
        date: form.date, shift: form.shift,
        quantityLiters: +form.quantityLiters,
        fat: form.fat ? +form.fat : undefined,
        snf: form.snf ? +form.snf : undefined,
        source: form.source, notes: form.notes || undefined,
      })
      setModal(false)
      fetchStock(today())
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      {/* Stock summary */}
      {stock && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Collected today', value: `${stock.collected.toFixed(1)} L`, color: 'text-blue-600' },
            { label: 'Sold wholesale',  value: `${stock.wholesaled.toFixed(1)} L`, color: 'text-amber-600' },
            { label: 'Available',       value: `${stock.available.toFixed(1)} L`,  color: 'text-emerald-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-slate-700">Recent entries</p>
        <Button icon={<Plus size={14} />} onClick={() => setModal(true)} size="sm">Add Entry</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">No entries yet. Add morning or evening shift.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e._id} className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    e.shift === 'MORNING' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>{e.shift}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {e.source} {e.fat ? `· FAT ${e.fat}%` : ''} {e.snf ? `· SNF ${e.snf}%` : ''}
                </p>
              </div>
              <p className="text-base font-bold text-blue-600">{e.quantityLiters} L</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Milk Entry" size="sm"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}>Save Entry</Button></>}
      >
        <div className="space-y-3">
          <Input label="Date" type="date" value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          <Select label="Shift" value={form.shift}
            onChange={(e) => setForm((p) => ({ ...p, shift: e.target.value as 'MORNING' | 'EVENING' }))}
            options={[{ value: 'MORNING', label: 'Morning' }, { value: 'EVENING', label: 'Evening' }]} />
          <Input label="Quantity (Liters)" type="number" value={form.quantityLiters}
            onChange={(e) => setForm((p) => ({ ...p, quantityLiters: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="FAT %" type="number" step="0.1" value={form.fat}
              onChange={(e) => setForm((p) => ({ ...p, fat: e.target.value }))} />
            <Input label="SNF %" type="number" step="0.1" value={form.snf}
              onChange={(e) => setForm((p) => ({ ...p, snf: e.target.value }))} />
          </div>
          <Select label="Source" value={form.source}
            onChange={(e) => setForm((p) => ({ ...p, source: e.target.value as 'OWN' | 'PURCHASED' }))}
            options={[{ value: 'OWN', label: 'Own herd' }, { value: 'PURCHASED', label: 'Purchased' }]} />
          <Input label="Notes (optional)" value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}

export default MilkTab