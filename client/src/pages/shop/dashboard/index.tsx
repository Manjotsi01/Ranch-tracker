// src/pages/shop/dashboard/index.tsx
// Shop & POS Dashboard — Premium white SaaS redesign
// API: shopApi.getDailyReport() — unchanged
// Business logic: untouched

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Milk, TrendingUp, AlertCircle, Clock, ShoppingCart,
  Factory, ChevronRight, Droplets, IndianRupee,
  RefreshCw,
} from 'lucide-react'
import { shopApi } from '../../../lib/api'
import {
  KpiCard, SectionCard, PageHeader, StatRow, AlertBanner,
  ShopButton, Badge,  SHOP_COLORS,
} from '../../../components/shop/ShopUI'

const fmt  = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`
const fmtL = (n: number) => `${Number(n || 0).toFixed(1)} L`

const QUICK_ACTIONS = [
  { to: '/shop/inventory', label: 'Add Milk',    sub: 'Log morning / evening shift',  Icon: Droplets,     color: SHOP_COLORS.blue,   bg: SHOP_COLORS.blueLight   },
  { to: '/shop/pos',       label: 'POS Sale',    sub: 'Sell at counter',              Icon: ShoppingCart, color: SHOP_COLORS.green,  bg: SHOP_COLORS.greenLight  },
  { to: '/shop/wholesale', label: 'Wholesale',   sub: 'Sell bulk to buyers',          Icon: TrendingUp,   color: SHOP_COLORS.amber,  bg: SHOP_COLORS.amberLight  },
  { to: '/shop/processing',label: 'Processing',  sub: 'Make curd, paneer, ghee…',    Icon: Factory,      color: SHOP_COLORS.purple, bg: SHOP_COLORS.purpleLight },
]

export default function ShopDashboard() {
  const [report,  setReport]  = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  const load = () => {
    setLoading(true)
    setError(false)
    shopApi.getDailyReport()
      .then(d => setReport(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Safely pull values from report
  const milkCollected = report?.milk?.collected  ?? 0
  const milkAvailable = report?.milk?.available  ?? 0
  const totalRevenue  = report?.totalRevenue      ?? 0
  const expenseTotal  = report?.expenses?.total   ?? 0
  const profit        = totalRevenue - expenseTotal
  const pendingAmt    = report?.pendingPayments?.total ?? 0
  const retailRev     = report?.retail?.revenue   ?? 0
  const wholesaleRev  = report?.wholesale?.revenue ?? 0
  const retailTxn     = report?.retail?.transactions ?? 0
  const milkWholesaled = report?.milk?.wholesaled ?? 0
  const makingPrice   = report?.makingPrice       ?? 0

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (error) {
    return (
      <div style={pageWrap}>
        <PageHeader title="Dashboard" subtitle={today} />
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <AlertCircle size={36} style={{ color: SHOP_COLORS.red, margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: 14, color: SHOP_COLORS.gray600, marginBottom: 16 }}>Could not load today's report</p>
          <ShopButton onClick={load} leftIcon={<RefreshCw size={13} />}>Try Again</ShopButton>
        </div>
      </div>
    )
  }

  return (
    <div style={pageWrap}>
      {/* ── Header ── */}
      <PageHeader
        title="Dashboard"
        subtitle={`Today · ${today}`}
        action={
          <ShopButton
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={13} />}
            onClick={load}
            loading={loading}
          >
            Refresh
          </ShopButton>
        }
      />

      {/* ── Pending banner ── */}
      {!loading && pendingAmt > 0 && (
        <div style={{ marginBottom: 20 }}>
          <AlertBanner type="warning">
            <strong>{fmt(pendingAmt)}</strong> pending from wholesale buyers —{' '}
            <Link to="/shop/wholesale" style={{ color: 'inherit', fontWeight: 700 }}>view now</Link>
          </AlertBanner>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div style={kpiGrid}>
        <KpiCard
          label="Today Revenue"
          value={loading ? '—' : fmt(totalRevenue)}
          icon={<IndianRupee size={16} />}
          iconColor="green"
          loading={loading}
        />
        <KpiCard
          label="Milk Stock"
          value={loading ? '—' : fmtL(milkAvailable)}
          sub="Available after wholesale"
          icon={<Milk size={16} />}
          iconColor="blue"
          loading={loading}
        />
        <KpiCard
          label="Net Profit"
          value={loading ? '—' : fmt(profit)}
          icon={<TrendingUp size={16} />}
          iconColor={profit >= 0 ? 'green' : 'red'}
          loading={loading}
        />
        <KpiCard
          label="Pending Payments"
          value={loading ? '—' : fmt(pendingAmt)}
          icon={<Clock size={16} />}
          iconColor={pendingAmt > 0 ? 'amber' : 'green'}
          loading={loading}
        />
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: 24 }}>
        <p style={sectionLabel}>Quick Actions</p>
        <div style={actionsGrid}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
              <div
                style={actionCard}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow  = '0 6px 20px rgba(0,0,0,0.10)'
                  el.style.transform  = 'translateY(-3px)'
                  el.style.borderColor = a.color
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow  = 'none'
                  el.style.transform  = 'translateY(0)'
                  el.style.borderColor = SHOP_COLORS.gray200
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <a.Icon size={20} style={{ color: a.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: SHOP_COLORS.gray900, margin: '0 0 2px' }}>{a.label}</p>
                  <p style={{ fontSize: 11, color: SHOP_COLORS.gray400, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.sub}</p>
                </div>
                <ChevronRight size={15} style={{ color: SHOP_COLORS.gray300, flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Summary grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {/* Milk summary */}
        <SectionCard title="Milk Today" subtitle="Auto-synced from Dairy module">
          <div style={{ padding: 16 }}>
            {loading ? (
              <><div style={{ height: 12, background: SHOP_COLORS.gray100, borderRadius: 4, marginBottom: 10 }} /><div style={{ height: 12, background: SHOP_COLORS.gray100, borderRadius: 4, marginBottom: 10 }} /><div style={{ height: 12, background: SHOP_COLORS.gray100, borderRadius: 4 }} /></>
            ) : (
              <>
                <StatRow label="Collected" value={<span style={{ color: SHOP_COLORS.blue }}>{fmtL(milkCollected)}</span>} />
                <StatRow label="Wholesaled" value={fmtL(milkWholesaled)} />
                <StatRow label="Available" value={<span style={{ color: SHOP_COLORS.green, fontWeight: 700 }}>{fmtL(milkAvailable)}</span>} />
                <div style={{ marginTop: 12, padding: '10px 14px', background: SHOP_COLORS.blueLight, borderRadius: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: SHOP_COLORS.blue, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>Making Price</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: SHOP_COLORS.blue, margin: 0 }}>₹{Number(makingPrice).toFixed(2)}/L</p>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Sales summary */}
        <SectionCard title="Sales Today">
          <div style={{ padding: 16 }}>
            {loading ? (
              <><div style={{ height: 12, background: SHOP_COLORS.gray100, borderRadius: 4, marginBottom: 10 }} /><div style={{ height: 12, background: SHOP_COLORS.gray100, borderRadius: 4, marginBottom: 10 }} /><div style={{ height: 12, background: SHOP_COLORS.gray100, borderRadius: 4 }} /></>
            ) : (
              <>
                <StatRow label="Retail transactions" value={String(retailTxn)} />
                <StatRow label="Retail revenue" value={<span style={{ color: SHOP_COLORS.green }}>{fmt(retailRev)}</span>} />
                <StatRow label="Wholesale revenue" value={<span style={{ color: SHOP_COLORS.amber }}>{fmt(wholesaleRev)}</span>} />
                <div style={{ padding: '10px 0 0', borderTop: `1px solid ${SHOP_COLORS.gray100}`, marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: SHOP_COLORS.gray700 }}>Total Revenue</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: SHOP_COLORS.green }}>{fmt(totalRevenue)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Finance summary */}
        <SectionCard title="Financials Today">
          <div style={{ padding: 16 }}>
            {loading ? (
              <><div style={{ height: 12, background: SHOP_COLORS.gray100, borderRadius: 4, marginBottom: 10 }} /><div style={{ height: 12, background: SHOP_COLORS.gray100, borderRadius: 4, marginBottom: 10 }} /><div style={{ height: 12, background: SHOP_COLORS.gray100, borderRadius: 4 }} /></>
            ) : (
              <>
                <StatRow label="Total expenses" value={fmt(expenseTotal)} />
                <StatRow label="Net profit" value={<span style={{ color: profit >= 0 ? SHOP_COLORS.green : SHOP_COLORS.red, fontWeight: 700 }}>{fmt(profit)}</span>} />
                <StatRow label="Pending payments" value={<span style={{ color: pendingAmt > 0 ? SHOP_COLORS.amber : SHOP_COLORS.green }}>{fmt(pendingAmt)}</span>} />
                {pendingAmt > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <Badge variant="amber" dot>Payment pending</Badge>
                  </div>
                )}
              </>
            )}
          </div>
        </SectionCard>
      </div>

      <style>{`
        @keyframes shopSkeletonShimmer {
          0%   { background-position: -400% 0 }
          100% { background-position:  400% 0 }
        }
      `}</style>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const pageWrap: React.CSSProperties = {
  padding: '24px 28px',
  background: SHOP_COLORS.gray50,
  minHeight: '100%',
}

const kpiGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 14,
  marginBottom: 24,
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: SHOP_COLORS.gray500,
  textTransform: 'uppercase', letterSpacing: '0.10em',
  marginBottom: 12,
}

const actionsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 12,
}

const actionCard: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14,
  background: SHOP_COLORS.white,
  border: `1px solid ${SHOP_COLORS.gray200}`,
  borderRadius: 12, padding: '14px 16px',
  cursor: 'pointer', transition: 'all 0.2s',
}