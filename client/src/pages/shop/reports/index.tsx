import React, { useEffect, useState } from 'react'
import { shopApi } from '../../../lib/api'
import type { DailyReport, MonthlyReport } from '../../../types'

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtL = (n: number) => `${n.toFixed(1)} L`
const today = () => new Date().toISOString().slice(0, 10)
const thisMonth = () => new Date().toISOString().slice(0, 7)

const Reports: React.FC = () => {
  const [view, setView] = useState<'daily' | 'monthly'>('daily')
  const [date, setDate] = useState(today())
  const [month, setMonth] = useState(thisMonth())
  const [daily, setDaily] = useState<DailyReport | null>(null)
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    if (view === 'daily') {
      shopApi.getDailyReport(date)
        .then((r) => setDaily(r.data.data ?? r.data))
        .finally(() => setLoading(false))
    } else {
      shopApi.getMonthlyReport(month)
        .then((r) => setMonthly(r.data.data ?? r.data))
        .finally(() => setLoading(false))
    }
  }, [view, date, month])

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Reports</h2>
        <button onClick={() => window.print()}
          className="text-sm text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer">
          Print
        </button>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 items-center">
        {(['daily', 'monthly'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={[
              'px-4 py-1.5 rounded-xl text-sm font-semibold border cursor-pointer transition-colors capitalize',
              view === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200',
            ].join(' ')}
          >{v}</button>
        ))}
        {view === 'daily'
          ? <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="ml-2 h-9 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          : <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="ml-2 h-9 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        }
      </div>

      {loading && <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>}

      {/* Daily report */}
      {!loading && view === 'daily' && daily && (
        <div className="space-y-4">
          <ReportSection title="Milk">
            <Row label="Collected" value={fmtL(daily.milk.collected)} />
            <Row label="Wholesaled" value={fmtL(daily.milk.wholesaled)} />
            <Row label="Available" value={fmtL(daily.milk.available)} highlight />
          </ReportSection>

          <ReportSection title="Expenses & Making Price">
            {['feed', 'labor', 'transport', 'medical', 'misc'].map((k) => {
  const expenseMap = {
    feed: daily.expenses.feed,
    labor: daily.expenses.labor,
    transport: daily.expenses.transport,
    medical: daily.expenses.medical,
    misc: daily.expenses.misc,
  };

  return (
    <Row
      key={k}
      label={k.charAt(0).toUpperCase() + k.slice(1)}
      value={fmt(expenseMap[k as keyof typeof expenseMap] ?? 0)}
    />
  );
})}
            <Row label="Total expenses" value={fmt(daily.expenses?.total ?? 0)} bold />
            <Row label="Making price" value={`₹${daily.makingPrice}/L`} highlight />
          </ReportSection>

          <ReportSection title="Retail Sales">
            <Row label="Transactions" value={String(daily.retail.transactions)} />
            {Object.entries(daily.retail.byMode).map(([mode, d]) => (
              <Row key={mode} label={mode} value={`${fmt(d.total)} (${d.count})`} />
            ))}
            <Row label="Revenue" value={fmt(daily.retail.revenue)} bold />
          </ReportSection>

          <ReportSection title="Wholesale">
            <Row label="Litres sold" value={fmtL(daily.wholesale.liters)} />
            <Row label="Revenue" value={fmt(daily.wholesale.revenue)} bold />
          </ReportSection>

          <div className="bg-blue-600 text-white rounded-2xl px-5 py-4 flex justify-between items-center">
            <p className="font-bold text-lg">Total Revenue</p>
            <p className="font-bold text-2xl">{fmt(daily.totalRevenue)}</p>
          </div>

          {daily.pendingPayments.total > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex justify-between items-center">
              <p className="text-amber-800 font-semibold">Pending wholesale payments</p>
              <p className="text-amber-800 font-bold">{fmt(daily.pendingPayments.total)}</p>
            </div>
          )}
        </div>
      )}

      {/* Monthly report */}
      {!loading && view === 'monthly' && monthly && (
        <div className="space-y-4">
          <ReportSection title="Milk">
            <Row label="Total collected" value={fmtL(monthly.milk.total)} highlight />
          </ReportSection>
          <ReportSection title="Expenses">
            {(['feed', 'labor', 'transport', 'medical', 'misc'] as const).map((k) => (
              <Row key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={fmt(monthly.expenses[k])} />
            ))}
            <Row label="Total" value={fmt(monthly.expenses.total)} bold />
            <Row label="Making price" value={`₹${monthly.makingPrice}/L`} highlight />
          </ReportSection>
          <ReportSection title="Sales">
            <Row label="Retail transactions" value={String(monthly.retail.transactions)} />
            <Row label="Retail revenue" value={fmt(monthly.retail.revenue)} />
            <Row label="Wholesale litres" value={fmtL(monthly.wholesale.liters)} />
            <Row label="Wholesale revenue" value={fmt(monthly.wholesale.revenue)} />
          </ReportSection>
          <div className="bg-blue-600 text-white rounded-2xl px-5 py-4 flex justify-between items-center">
            <p className="font-bold text-lg">Month Total</p>
            <p className="font-bold text-2xl">{fmt(monthly.totalRevenue)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const ReportSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide px-5 py-3 border-b border-slate-50">{title}</p>
    <div className="divide-y divide-slate-50">{children}</div>
  </div>
)

const Row: React.FC<{ label: string; value: string; bold?: boolean; highlight?: boolean }> = ({ label, value, bold, highlight }) => (
  <div className="flex justify-between items-center px-5 py-3">
    <span className="text-sm text-slate-600">{label}</span>
    <span className={`text-sm ${highlight ? 'text-emerald-600 font-bold' : bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{value}</span>
  </div>
)

export default Reports