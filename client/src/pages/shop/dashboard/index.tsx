// client/src/pages/shop/dashboard/index.tsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Milk, TrendingUp, AlertCircle, Clock, Zap, ChevronRight, Factory } from 'lucide-react'
import { shopApi } from '../../../lib/api'

const fmt  = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`
const fmtL = (n: number) => `${Number(n || 0).toFixed(1)} L`

const Dashboard: React.FC = () => {
  const [report,  setReport]  = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    shopApi.getDailyReport()
      .then((data) => setReport(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashSkeleton />

  if (error) return (
    <div className="p-6">
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5">
        <AlertCircle size={18} className="text-red-500" />
        <p className="text-sm text-red-700 font-medium">Could not load today's report.</p>
      </div>
    </div>
  )

  // FIX: report shape is { milk, expenses, retail, wholesale, totalRevenue }
  // safely pull each value with fallbacks
  const milkCollected  = report?.milk?.collected ?? 0
  const milkAvailable  = report?.milk?.available ?? 0
  const totalRevenue   = report?.totalRevenue ?? 0
  const expenseTotal   = report?.expenses?.total ?? 0
  const profit         = totalRevenue - expenseTotal
  const pendingAmt     = report?.pendingPayments?.total ?? 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Today's Overview</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Milk Collected" value={fmtL(milkCollected)} sub="Today's total" color="blue" icon={<Milk size={16} />} />
        <KpiCard label="Available Stock" value={fmtL(milkAvailable)} sub="After wholesale" color="green" icon={<Milk size={16} />} />
        <KpiCard label="Total Revenue" value={fmt(totalRevenue)} sub="Retail + wholesale" color="green" icon={<TrendingUp size={16} />} />
        <KpiCard label="Net Profit" value={fmt(profit)} sub="Revenue − expenses" color={profit >= 0 ? 'green' : 'red'} icon={<AlertCircle size={16} />} />
      </div>

      {/* Pending payments warning */}
      {pendingAmt > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <Clock size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {fmt(pendingAmt)} pending from wholesale — <Link to="/shop/wholesale" className="underline">view</Link>
          </p>
        </div>
      )}

      {/* Quick actions — the real dairy workflow */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { to: '/shop/inventory', label: 'Add Milk Entry', sub: 'Log morning / evening shift', icon: <Milk size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
            { to: '/shop/wholesale', label: 'Wholesale Sale', sub: 'Sell to Verka / bulk buyer', icon: <TrendingUp size={20} className="text-amber-600" />, bg: 'bg-amber-50' },
            { to: '/shop/processing', label: 'Process Milk', sub: 'Make curd, paneer, ghee…', icon: <Factory size={20} className="text-purple-600" />, bg: 'bg-purple-50' },
            { to: '/shop/pos', label: 'Open POS', sub: 'Sell at counter', icon: <Zap size={20} className="text-green-600" />, bg: 'bg-green-50' },
          ].map((c) => (
            <Link key={c.to} to={c.to}
              className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition"
            >
              <div className={`${c.bg} rounded-xl p-3 shrink-0`}>{c.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">{c.label}</p>
                <p className="text-xs text-slate-400 truncate">{c.sub}</p>
              </div>
              <ChevronRight size={15} className="text-slate-300 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Today's summary strip */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Today's Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <SummaryRow label="Milk wholesaled" value={fmtL(report?.milk?.wholesaled ?? 0)} />
          <SummaryRow label="Retail transactions" value={String(report?.retail?.transactions ?? 0)} />
          <SummaryRow label="Making price" value={`₹${report?.makingPrice ?? 0}/L`} />
          <SummaryRow label="Retail revenue" value={fmt(report?.retail?.revenue ?? 0)} />
          <SummaryRow label="Wholesale revenue" value={fmt(report?.wholesale?.revenue ?? 0)} />
          <SummaryRow label="Total expenses" value={fmt(expenseTotal)} />
        </div>
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

const KpiCard: React.FC<{ label: string; value: string; sub: string; color: string; icon: React.ReactNode }> = ({ label, value, sub, color, icon }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-3 ${COLOR_MAP[color] ?? COLOR_MAP.blue}`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
    <p className="text-xs text-slate-300 mt-1">{sub}</p>
  </div>
)

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="font-semibold text-slate-800">{value}</p>
  </div>
)

const DashSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="h-7 w-48 bg-slate-100 rounded-xl" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
    </div>
  </div>
)

export default Dashboard