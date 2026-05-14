// src/components/shop/ShopUI.tsx
// Shared UI primitives for the Shop & POS module.
// All components are self-contained — no dark-theme variables used.

import React from "react";
import type {
  InputHTMLAttributes,
  ReactNode
} from "react";
import {
  TrendingUp, TrendingDown, Minus, PackageOpen,
  AlertCircle, CheckCircle, Info, AlertTriangle,
  Loader2,
} from 'lucide-react'

// ─── Design tokens (light SaaS palette) ────────────────────────────────────
export const SHOP_COLORS = {
  blue:        '#2563EB',
  blueLight:   '#EFF6FF',
  blueMid:     '#DBEAFE',
  blueDark:    '#1D4ED8',
  green:       '#059669',
  greenLight:  '#ECFDF5',
  amber:       '#D97706',
  amberLight:  '#FFFBEB',
  red:         '#DC2626',
  redLight:    '#FEF2F2',
  purple:      '#7C3AED',
  purpleLight: '#F5F3FF',
  sky:         '#0369A1',
  skyLight:    '#E0F2FE',
  white:       '#FFFFFF',
  gray50:      '#F9FAFB',
  gray100:     '#F3F4F6',
  gray200:     '#E5E7EB',
  gray300:     '#D1D5DB',
  gray400:     '#9CA3AF',
  gray500:     '#6B7280',
  gray600:     '#4B5563',
  gray700:     '#374151',
  gray800:     '#1F2937',
  gray900:     '#111827',
} as const

// ─── KPI Card ───────────────────────────────────────────────────────────────
interface KpiCardProps {
  label:       string
  value:       string | number
  sub?:        string
  icon?:       ReactNode
  iconColor?:  'blue' | 'green' | 'amber' | 'red' | 'purple' | 'sky'
  trend?:      number
  trendLabel?: string
  loading?:    boolean
  onClick?:    () => void
}

const ICON_STYLES: Record<string, { bg: string; color: string }> = {
  blue:   { bg: SHOP_COLORS.blueLight,   color: SHOP_COLORS.blue   },
  green:  { bg: SHOP_COLORS.greenLight,  color: SHOP_COLORS.green  },
  amber:  { bg: SHOP_COLORS.amberLight,  color: SHOP_COLORS.amber  },
  red:    { bg: SHOP_COLORS.redLight,    color: SHOP_COLORS.red    },
  purple: { bg: SHOP_COLORS.purpleLight, color: SHOP_COLORS.purple },
  sky:    { bg: SHOP_COLORS.skyLight,    color: SHOP_COLORS.sky    },
}

export function KpiCard({
  label, value, sub, icon, iconColor = 'blue',
  trend, trendLabel, loading = false, onClick,
}: KpiCardProps) {
  const ic = ICON_STYLES[iconColor]

  if (loading) {
    return (
      <div style={styles.kpiCard}>
        <div style={styles.skeleton(12, 80)} />
        <div style={{ ...styles.skeleton(32, 100), margin: '12px 0 8px' }} />
        <div style={styles.skeleton(12, 60)} />
      </div>
    )
  }

  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend === undefined ? SHOP_COLORS.gray400
    : trend > 0 ? SHOP_COLORS.green : trend < 0 ? SHOP_COLORS.red : SHOP_COLORS.gray400

  return (
    <div
      style={{ ...styles.kpiCard, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
        el.style.transform  = 'translateY(-2px)'
        if (onClick) el.style.borderColor = SHOP_COLORS.blue
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = 'none'
        el.style.transform  = 'translateY(0)'
        el.style.borderColor = SHOP_COLORS.gray200
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={styles.kpiLabel}>{label}</span>
        {icon && (
          <span style={{ ...styles.kpiIcon, background: ic.bg, color: ic.color }}>
            {icon}
          </span>
        )}
      </div>
      <div style={styles.kpiValue}>{value}</div>
      {sub && <div style={styles.kpiSub}>{sub}</div>}
      {trend !== undefined && TrendIcon && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <span style={{ ...styles.trendPill, background: trend > 0 ? '#ECFDF5' : trend < 0 ? '#FEF2F2' : SHOP_COLORS.gray100, color: trendColor }}>
            <TrendIcon size={11} />
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          {trendLabel && <span style={{ fontSize: 11, color: SHOP_COLORS.gray400 }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}

// ─── Section Card (white container with optional header) ────────────────────
interface SectionCardProps {
  title?:       string
  subtitle?:    string
  action?:      ReactNode
  children:     ReactNode
  padding?:     number
  noPadding?:   boolean
}

export function SectionCard({ title, subtitle, action, children, padding = 20, noPadding = false }: SectionCardProps) {
  return (
    <div style={styles.sectionCard}>
      {(title || action) && (
        <div style={styles.sectionCardHeader}>
          <div>
            {title    && <div style={styles.sectionCardTitle}>{title}</div>}
            {subtitle && <div style={styles.sectionCardSubtitle}>{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={noPadding ? {} : { padding }}>{children}</div>
    </div>
  )
}

// ─── Badge ──────────────────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'sky' | 'gray'

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  green:  { bg: SHOP_COLORS.greenLight,  color: '#065F46', border: '#A7F3D0' },
  amber:  { bg: SHOP_COLORS.amberLight,  color: '#92400E', border: '#FDE68A' },
  red:    { bg: SHOP_COLORS.redLight,    color: '#991B1B', border: '#FECACA' },
  blue:   { bg: SHOP_COLORS.blueLight,   color: '#1E40AF', border: SHOP_COLORS.blueMid   },
  purple: { bg: SHOP_COLORS.purpleLight, color: '#5B21B6', border: '#DDD6FE' },
  sky:    { bg: SHOP_COLORS.skyLight,    color: '#075985', border: '#BAE6FD' },
  gray:   { bg: SHOP_COLORS.gray100,     color: SHOP_COLORS.gray600, border: SHOP_COLORS.gray200 },
}

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  dot?:     boolean
}

export function Badge({ children, variant = 'gray', dot = false }: BadgeProps) {
  const s = BADGE_STYLES[variant]
  return (
    <span style={{ ...styles.badge, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />}
      {children}
    </span>
  )
}

// ─── Button ─────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type BtnSize    = 'xs' | 'sm' | 'md' | 'lg'

const BTN_BASE: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: 6, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
  border: 'none', transition: 'all 0.15s', fontFamily: 'inherit',
  whiteSpace: 'nowrap',
}

const BTN_VARIANTS: Record<BtnVariant, React.CSSProperties> = {
  primary:   { background: SHOP_COLORS.blue,     color: '#fff',               border: `1px solid ${SHOP_COLORS.blue}` },
  secondary: { background: SHOP_COLORS.gray100,  color: SHOP_COLORS.gray700,  border: `1px solid ${SHOP_COLORS.gray200}` },
  ghost:     { background: 'transparent',         color: SHOP_COLORS.gray600,  border: '1px solid transparent' },
  danger:    { background: SHOP_COLORS.redLight,  color: SHOP_COLORS.red,      border: `1px solid #FECACA` },
  outline:   { background: '#fff',               color: SHOP_COLORS.gray700,  border: `1px solid ${SHOP_COLORS.gray300}` },
}

const BTN_SIZES: Record<BtnSize, React.CSSProperties> = {
  xs: { height: 28, padding: '0 10px', fontSize: 11 },
  sm: { height: 32, padding: '0 14px', fontSize: 12 },
  md: { height: 38, padding: '0 18px', fontSize: 13 },
  lg: { height: 44, padding: '0 22px', fontSize: 14 },
}

interface ShopButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  BtnVariant
  size?:     BtnSize
  loading?:  boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function ShopButton({
  variant = 'primary', size = 'md', loading = false,
  leftIcon, rightIcon, children, style, ...rest
}: ShopButtonProps) {
  return (
    <button
      style={{ ...BTN_BASE, ...BTN_VARIANTS[variant], ...BTN_SIZES[size], opacity: rest.disabled ? 0.5 : 1, ...style }}
      disabled={rest.disabled || loading}
      onMouseEnter={e => {
        const el = e.currentTarget
        if (variant === 'primary')   { el.style.background = SHOP_COLORS.blueDark }
        if (variant === 'secondary') { el.style.background = SHOP_COLORS.gray200 }
        if (variant === 'outline')   { el.style.borderColor = SHOP_COLORS.blue; el.style.color = SHOP_COLORS.blue }
        if (variant === 'ghost')     { el.style.background = SHOP_COLORS.gray100 }
        if (variant === 'danger')    { el.style.background = '#FECACA' }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        const v = BTN_VARIANTS[variant]
        el.style.background   = v.background as string
        el.style.borderColor  = (v.border as string).replace('1px solid ', '')
        el.style.color        = v.color as string
      }}
      {...rest}
    >
      {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}

// ─── Input ──────────────────────────────────────────────────────────────────
// ─── Input ──────────────────────────────────────────────────────────────────
interface ShopInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function ShopInput({ label, error, prefix, suffix, style, id, ...rest }: ShopInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label htmlFor={inputId} style={styles.fieldLabel}>
          {label}{rest.required && <span style={{ color: SHOP_COLORS.red }}> *</span>}
        </label>
      )}
      <div style={{ ...styles.inputWrap, borderColor: error ? SHOP_COLORS.red : SHOP_COLORS.gray200 }}>
        {prefix && <span style={{ color: SHOP_COLORS.gray400, flexShrink: 0 }}>{prefix}</span>}
        <input id={inputId} style={{ ...styles.inputEl, ...style }} {...rest} />
        {suffix && <span style={{ color: SHOP_COLORS.gray400, flexShrink: 0 }}>{suffix}</span>}
      </div>
      {error && <span style={{ fontSize: 11, color: SHOP_COLORS.red }}>{error}</span>}
    </div>
  )
}

// ─── Select ─────────────────────────────────────────────────────────────────
interface ShopSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string
  error?:   string
  options:  { value: string; label: string }[]
  placeholder?: string
}

export function ShopSelect({ label, error, options, placeholder, id, ...rest }: ShopSelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '_')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label htmlFor={selectId} style={styles.fieldLabel}>{label}</label>}
      <select
        id={selectId}
        style={{ ...styles.selectEl, borderColor: error ? SHOP_COLORS.red : SHOP_COLORS.gray200 }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span style={{ fontSize: 11, color: SHOP_COLORS.red }}>{error}</span>}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?:    ReactNode
  title:    string
  sub?:     string
  action?:  ReactNode
}

export function EmptyState({ icon, title, sub, action }: EmptyStateProps) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>{icon ?? <PackageOpen size={28} style={{ color: SHOP_COLORS.gray300 }} />}</div>
      <p style={{ fontSize: 14, fontWeight: 600, color: SHOP_COLORS.gray500, margin: '0 0 4px' }}>{title}</p>
      {sub && <p style={{ fontSize: 12, color: SHOP_COLORS.gray400, margin: 0 }}>{sub}</p>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  )
}

// ─── Alert Banner ────────────────────────────────────────────────────────────
type AlertType = 'info' | 'success' | 'warning' | 'error'

const ALERT_CFG: Record<AlertType, { bg: string; border: string; color: string; Icon: typeof Info }> = {
  info:    { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', Icon: Info },
  success: { bg: '#ECFDF5', border: '#A7F3D0', color: '#065F46', Icon: CheckCircle },
  warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', Icon: AlertTriangle },
  error:   { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', Icon: AlertCircle },
}

interface AlertBannerProps {
  type?:     AlertType
  children:  ReactNode
}

export function AlertBanner({ type = 'info', children }: AlertBannerProps) {
  const cfg = ALERT_CFG[type]
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: cfg.color }}>
      <cfg.Icon size={15} style={{ flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  )
}

// ─── Page Header ─────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title:    string
  subtitle?: string
  action?:  ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: SHOP_COLORS.gray900, margin: '0 0 4px' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: SHOP_COLORS.gray500, margin: 0 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
export function SkeletonBlock({ height = 14, width = '100%', radius = 6 }: { height?: number; width?: number | string; radius?: number }) {
  return <div style={styles.skeleton(height, width, radius)} />
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ margin = 16 }: { margin?: number }) {
  return <div style={{ borderTop: `1px solid ${SHOP_COLORS.gray100}`, margin: `${margin}px 0` }} />
}

// ─── Stat Row (label + value inline) ─────────────────────────────────────────
export function StatRow({ label, value, valueColor }: { label: string; value: ReactNode; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${SHOP_COLORS.gray100}` }}>
      <span style={{ fontSize: 12, color: SHOP_COLORS.gray500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: valueColor ?? SHOP_COLORS.gray800 }}>{value}</span>
    </div>
  )
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────
interface TabBarProps {
  tabs:     { key: string; label: string; icon?: ReactNode }[]
  active:   string
  onChange: (key: string) => void
  pill?:    boolean
}

export function TabBar({ tabs, active, onChange, pill = false }: TabBarProps) {
  if (pill) {
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              ...BTN_BASE,
              ...BTN_SIZES.sm,
              background:   active === t.key ? SHOP_COLORS.blue     : SHOP_COLORS.white,
              color:        active === t.key ? '#fff'                : SHOP_COLORS.gray600,
              border:       `1px solid ${active === t.key ? SHOP_COLORS.blue : SHOP_COLORS.gray200}`,
              borderRadius: 20,
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 2, background: SHOP_COLORS.gray100, borderRadius: 10, padding: 4 }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            ...BTN_BASE,
            ...BTN_SIZES.sm,
            background:  active === t.key ? SHOP_COLORS.white : 'transparent',
            color:       active === t.key ? SHOP_COLORS.blue  : SHOP_COLORS.gray500,
            fontWeight:  active === t.key ? 600               : 500,
            boxShadow:   active === t.key ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            border:      'none',
            flex: 1,
          }}
        >
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Search Input ─────────────────────────────────────────────────────────────
interface SearchInputProps {
  value:       string
  onChange:    (v: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }: SearchInputProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: SHOP_COLORS.white, border: `1px solid ${SHOP_COLORS.gray200}`, borderRadius: 8, padding: '0 12px', height: 38 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SHOP_COLORS.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ border: 'none', outline: 'none', fontSize: 13, color: SHOP_COLORS.gray700, flex: 1, background: 'transparent' }}
      />
    </div>
  )
}

// ─── Styles object ────────────────────────────────────────────────────────────
const styles = {
  kpiCard: {
    background:    SHOP_COLORS.white,
    border:        `1px solid ${SHOP_COLORS.gray200}`,
    borderRadius:  12,
    padding:       18,
    transition:    'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
    cursor:        'default',
  } as React.CSSProperties,

  kpiLabel: {
    fontSize: 11, fontWeight: 600, color: SHOP_COLORS.gray500,
    textTransform: 'uppercase', letterSpacing: '0.07em',
  } as React.CSSProperties,

  kpiIcon: {
    width: 34, height: 34, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,

  kpiValue: {
    fontSize: 26, fontWeight: 700, color: SHOP_COLORS.gray900,
    lineHeight: 1, marginBottom: 6, letterSpacing: '-0.5px',
  } as React.CSSProperties,

  kpiSub: {
    fontSize: 11, color: SHOP_COLORS.gray400, marginTop: 2,
  } as React.CSSProperties,

  trendPill: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    padding: '2px 7px', borderRadius: 20, fontSize: 11, fontWeight: 600,
  } as React.CSSProperties,

  sectionCard: {
    background: SHOP_COLORS.white,
    border:     `1px solid ${SHOP_COLORS.gray200}`,
    borderRadius: 12,
    overflow:   'hidden',
  } as React.CSSProperties,

  sectionCardHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', borderBottom: `1px solid ${SHOP_COLORS.gray100}`,
  } as React.CSSProperties,

  sectionCardTitle: {
    fontSize: 13, fontWeight: 600, color: SHOP_COLORS.gray800,
  } as React.CSSProperties,

  sectionCardSubtitle: {
    fontSize: 11, color: SHOP_COLORS.gray400, marginTop: 2,
  } as React.CSSProperties,

  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
  } as React.CSSProperties,

  fieldLabel: {
    fontSize: 11, fontWeight: 600, color: SHOP_COLORS.gray600,
    textTransform: 'uppercase', letterSpacing: '0.07em',
  } as React.CSSProperties,

  inputWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    border: `1px solid ${SHOP_COLORS.gray200}`, borderRadius: 8,
    padding: '0 12px', height: 38, background: SHOP_COLORS.white,
    transition: 'border-color 0.15s',
  } as React.CSSProperties,

  inputEl: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: 13, color: SHOP_COLORS.gray800, background: 'transparent',
    fontFamily: 'inherit', minWidth: 0,
  } as React.CSSProperties,

  selectEl: {
    width: '100%', height: 38, borderRadius: 8,
    border: `1px solid ${SHOP_COLORS.gray200}`,
    padding: '0 12px', fontSize: 13, color: SHOP_COLORS.gray800,
    background: SHOP_COLORS.white, outline: 'none',
    fontFamily: 'inherit', cursor: 'pointer', appearance: 'none',
  } as React.CSSProperties,

  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
  } as React.CSSProperties,

  emptyIcon: {
    width: 56, height: 56, borderRadius: '50%',
    background: SHOP_COLORS.gray100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  } as React.CSSProperties,

  skeleton: (h: number, w: number | string, r = 6) => ({
    height: h, width: w, borderRadius: r,
    background: `linear-gradient(90deg, ${SHOP_COLORS.gray100} 25%, ${SHOP_COLORS.gray200} 50%, ${SHOP_COLORS.gray100} 75%)`,
    backgroundSize: '400% 100%',
    animation: 'shopSkeletonShimmer 1.6s ease infinite',
  } as React.CSSProperties),
}