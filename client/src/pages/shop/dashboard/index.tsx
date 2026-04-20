import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Milk, TrendingUp, AlertCircle, Clock, Zap, ChevronRight } from 'lucide-react'
import { shopApi } from '../../../lib/api'
import type { DailyReport } from '../../../types'

const fmt  = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtL = (n: number) => `${n.toFixed(1)} L`

const Dashboard: React.FC = () => {
  const [report,  setReport]  = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    shopApi.getDailyReport()
      .then((data) => setReport(data)) // ✅ FIXED
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashSkeleton />

  if (error) return (
    <div className="p-6">
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5">
        <AlertCircle size={18} className="text-red-500" />
        <p className="text-sm text-red-700 font-medium">
          Could not load today's report.
        </p>
      </div>
    </div>
  )

  // ✅ Safe fallback (no crashes)
  const r = report ?? {
    milkCollected: 0,
    sales: 0,
    expenses: 0,
    profit: 0,
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Today's Overview</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <KpiCard
          label="Milk Collected"
          value={fmtL(r.milkCollected)}
          sub="Today's total"
          color="blue"
          icon={<Milk size={16} />}
        />

        <KpiCard
          label="Total Sales"
          value={fmt(r.sales)}
          sub="All sales today"
          color="green"
          icon={<TrendingUp size={16} />}
        />

        <KpiCard
          label="Expenses"
          value={fmt(typeof r.expenses === 'number' ? r.expenses : r.expenses.total)}
          sub="Today's spending"
          color="amber"
          icon={<Clock size={16} />}
        />

        <KpiCard
          label="Profit"
          value={fmt(r.profit)}
          sub="Net earnings"
          color={r.profit > 0 ? 'green' : 'red'}
          icon={<AlertCircle size={16} />}
        />

      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/shop/pos', label: 'Open POS', sub: 'Quick checkout', icon: <Zap size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
          { to: '/shop/inventory', label: 'Add Milk Entry', sub: 'Log shift data', icon: <Milk size={20} className="text-green-600" />, bg: 'bg-green-50' },
          { to: '/shop/wholesale', label: 'Wholesale', sub: 'Bulk sales', icon: <TrendingUp size={20} className="text-amber-600" />, bg: 'bg-amber-50' },
        ].map((c) => (
          <Link key={c.to} to={c.to}
            className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition"
          >
            <div className={`${c.bg} rounded-xl p-3`}>{c.icon}</div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 text-sm">{c.label}</p>
              <p className="text-xs text-slate-400">{c.sub}</p>
            </div>
            <ChevronRight size={15} className="text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  )
}

const COLOR_MAP: Record<string, string> = {
  blue:  'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red:   'bg-red-50 text-red-600',
}

const KpiCard: React.FC<{
  label: string
  value: string
  sub: string
  color: string
  icon: React.ReactNode
}> = ({ label, value, sub, color, icon }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-3 ${COLOR_MAP[color]}`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
    <p className="text-xs text-slate-300 mt-1">{sub}</p>
  </div>
)

const DashSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="h-7 w-48 bg-slate-100 rounded-xl" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-slate-100 rounded-2xl" />
      ))}
    </div>
  </div>
)

export default Dashboard