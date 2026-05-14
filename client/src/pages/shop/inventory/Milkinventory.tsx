// src/pages/shop/inventory/MilkInventoryTab.tsx
// Milk Inventory — auto-synced from Dairy module
// Uses: shopApi.getMilkEntries, getMilkStock  (unchanged)
// Dairy sync: milk records come from /dairy/animals/:id/milk and aggregate here
// NO manual milk entry — only display + Dairy-synced data

import React, { useEffect, useState, useCallback } from 'react'
import { Droplets, RefreshCw, Activity, Milk } from 'lucide-react'
import { shopApi } from '../../../lib/api'
import {
  SectionCard, AlertBanner, EmptyState, Badge, ShopButton,
  SkeletonBlock, SHOP_COLORS,
} from '../../../components/shop/ShopUI'

const fmtL    = (n: number)  => `${Number(n || 0).toFixed(1)} L`
const fmtTime = (s: string)  => {
  try {
    return new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
  } catch { return '—' }
}

// Animal type derived from the API response animalType field
// Dairy module stores 'COW' | 'BUFFALO' on each milk record
function getAnimalTypeBadge(type?: string) {
  if (!type) return <Badge variant="gray">Unknown</Badge>
  if (type.toUpperCase() === 'milk')     return <Badge variant="purple">milk</Badge>
  if (type.toUpperCase() === 'BUFFALO') return <Badge variant="sky">Buffalo</Badge>
  return <Badge variant="gray">{type}</Badge>
}

function getShiftBadge(shift?: string) {
  if (shift === 'MORNING') return <Badge variant="amber">Morning</Badge>
  if (shift === 'EVENING') return <Badge variant="blue">Evening</Badge>
  return <Badge variant="gray">{shift ?? '—'}</Badge>
}

export default function MilkInventoryTab() {
  const [entries, setEntries] = useState<any[]>([])
  const [stock,   setStock]   = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().slice(0, 10)

  // Cow / buffalo split derived from entries
  const cowTotal = entries
    .filter(e => (e.animalType ?? e.animal?.type ?? '').toUpperCase() === 'milk')
    .reduce((s, e) => s + (e.quantityLiters ?? e.quantity ?? 0), 0)

  const buffaloTotal = entries
    .filter(e => (e.animalType ?? e.animal?.type ?? '').toUpperCase() === 'BUFFALO')
    .reduce((s, e) => s + (e.quantityLiters ?? e.quantity ?? 0), 0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [e, s] = await Promise.all([
        shopApi.getMilkEntries(),
        shopApi.getMilkStock(today),
      ])
      setEntries(Array.isArray(e) ? e : [])
      setStock(s)
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => { load() }, [load])

  const collected  = stock?.collected  ?? 0
  const wholesaled = stock?.wholesaled ?? 0
  const available  = stock?.available  ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Auto-sync notice */}
      <AlertBanner type="info">
        <strong>Auto-synced from Dairy module.</strong> Milk is recorded per animal (Cow/Buffalo) in the Dairy section and aggregated here automatically. No manual entry needed.
      </AlertBanner>

      {/* Big stock banner */}
      <div style={stockBanner}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 6px' }}>
              Available Milk Stock
            </p>
            {loading ? (
              <div style={{ width: 140, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.15)' }} />
            ) : (
              <p style={{ fontSize: 42, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1, letterSpacing: '-1px' }}>
                {fmtL(available)}
              </p>
            )}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '6px 0 0' }}>
              Last updated: {new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Droplets size={64} style={{ color: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>

        {/* Breakdown strip */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              { label: '🐄 Cow Milk',    value: fmtL(cowTotal),    color: '#C4B5FD' },
              { label: '🐃 Buffalo Milk', value: fmtL(buffaloTotal), color: '#BAE6FD' },
              { label: '📦 Total Stock',  value: fmtL(collected),   color: '#fff'    },
            ].map(b => (
              <div key={b.label} style={breakdownCard}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{b.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: b.color, margin: 0 }}>{b.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wholesale deducted info */}
      {!loading && wholesaled > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div style={miniStatCard}>
            <p style={miniStatLabel}>Collected Today</p>
            <p style={{ ...miniStatVal, color: SHOP_COLORS.blue }}>{fmtL(collected)}</p>
          </div>
          <div style={miniStatCard}>
            <p style={miniStatLabel}>Wholesaled</p>
            <p style={{ ...miniStatVal, color: SHOP_COLORS.amber }}>{fmtL(wholesaled)}</p>
          </div>
          <div style={miniStatCard}>
            <p style={miniStatLabel}>Net Available</p>
            <p style={{ ...miniStatVal, color: SHOP_COLORS.green }}>{fmtL(available)}</p>
          </div>
        </div>
      )}

      {/* Recent entries table */}
      <SectionCard
        title="Recent Dairy Entries"
        subtitle="Synced from Dairy module per animal"
        action={
          <ShopButton variant="ghost" size="xs" leftIcon={<RefreshCw size={11} />} onClick={load} loading={loading}>
            Refresh
          </ShopButton>
        }
        noPadding
      >
        {loading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} height={38} radius={6} />)}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Droplets size={26} style={{ color: SHOP_COLORS.gray300 }} />}
            title="No milk entries yet"
            sub="Milk entries will appear here once recorded in the Dairy module"
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: SHOP_COLORS.gray50 }}>
                  <th style={thStyle}>Animal ID</th>
                  <th style={thStyle}>Animal Type</th>
                  <th style={thStyle}>Shift</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>FAT %</th>
                  <th style={thStyle}>SNF %</th>
                  <th style={thStyle}>Recorded</th>
                  <th style={thStyle}>Source</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => {
                  const animalId   = e.animalId ?? e.animal?._id ?? '—'
                  const animalType = e.animalType ?? e.animal?.type ?? ''
                  const qty        = e.quantityLiters ?? e.quantity ?? 0
                  const fat        = e.fat ?? '—'
                  const snf        = e.snf ?? '—'
                  const recorded   = e.createdAt ?? e.date
                  const source     = e.source ?? 'OWN'

                  return (
                    <tr
                      key={e._id ?? idx}
                      style={{ borderBottom: `1px solid ${SHOP_COLORS.gray100}` }}
                      onMouseEnter={e2 => { (e2.currentTarget as HTMLElement).style.background = SHOP_COLORS.gray50 }}
                      onMouseLeave={e2 => { (e2.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, background: SHOP_COLORS.gray100, padding: '2px 8px', borderRadius: 4 }}>
                          {animalId}
                        </span>
                      </td>
                      <td style={tdStyle}>{getAnimalTypeBadge(animalType)}</td>
                      <td style={tdStyle}>{getShiftBadge(e.shift)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: SHOP_COLORS.blue }}>
                        {Number(qty).toFixed(1)} L
                      </td>
                      <td style={tdStyle}>{fat !== '—' ? `${fat}%` : <span style={{ color: SHOP_COLORS.gray300 }}>—</span>}</td>
                      <td style={tdStyle}>{snf !== '—' ? `${snf}%` : <span style={{ color: SHOP_COLORS.gray300 }}>—</span>}</td>
                      <td style={{ ...tdStyle, color: SHOP_COLORS.gray400 }}>{fmtTime(recorded)}</td>
                      <td style={tdStyle}>
                        <Badge variant={source === 'OWN' ? 'green' : 'gray'}>{source}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Explanation card */}
      <SectionCard title="How milk sync works">
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { icon: <Milk size={20} style={{ color: SHOP_COLORS.purple }} />, bg: SHOP_COLORS.purpleLight, title: '1. Record in Dairy', desc: 'Milk is recorded per animal (Cow/Buffalo) in the Dairy module morning & evening sessions' },
            { icon: <Activity size={20} style={{ color: SHOP_COLORS.blue }} />, bg: SHOP_COLORS.blueLight, title: '2. Auto Aggregation', desc: 'Shop module automatically aggregates all records — cow and buffalo milk tracked separately' },
            { icon: <Droplets size={20} style={{ color: SHOP_COLORS.green }} />, bg: SHOP_COLORS.greenLight, title: '3. Stock Available', desc: 'Available stock = Total collected − Wholesale sold. Updates in real-time as sales are recorded' },
          ].map(s => (
            <div key={s.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: SHOP_COLORS.gray800, margin: '0 0 4px' }}>{s.title}</p>
                <p style={{ fontSize: 11, color: SHOP_COLORS.gray500, margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const stockBanner: React.CSSProperties = {
  background:   SHOP_COLORS.blue,
  borderRadius: 14,
  padding:      '22px 26px',
}

const breakdownCard: React.CSSProperties = {
  background:   'rgba(255,255,255,0.12)',
  borderRadius: 10,
  padding:      '12px 16px',
  backdropFilter: 'blur(8px)',
}

const miniStatCard: React.CSSProperties = {
  background: SHOP_COLORS.white,
  border:     `1px solid ${SHOP_COLORS.gray200}`,
  borderRadius: 10,
  padding:    '14px 18px',
}

const miniStatLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: SHOP_COLORS.gray400,
  textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px',
}

const miniStatVal: React.CSSProperties = {
  fontSize: 22, fontWeight: 700, margin: 0,
}

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse',
}

const thStyle: React.CSSProperties = {
  padding: '10px 18px', textAlign: 'left',
  fontSize: 10, fontWeight: 600, color: SHOP_COLORS.gray400,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  borderBottom: `1px solid ${SHOP_COLORS.gray200}`,
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '11px 18px', fontSize: 12, color: SHOP_COLORS.gray700,
}