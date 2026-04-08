// client/src/lib/utils.ts
// FIXED: All date/string helpers are now null-safe — no more .replace() on undefined

import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const formatLiters = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return '0.0 L';
  return `${value.toFixed(1)} L`;
};

export function formatCurrency(amount: number, compact = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  if (compact) {
    if (Math.abs(amount) >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
    if (Math.abs(amount) >= 100_000)    return `₹${(amount / 100_000).toFixed(1)}L`;
    if (Math.abs(amount) >= 1_000)      return `₹${(amount / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number, decimals = 0): string {
  if (n === undefined || n === null || isNaN(n)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
  }).format(n);
}

/**
 * FIX: Guard against undefined/null/empty dateStr.
 * Previously: parseISO(undefined) threw, catch returned undefined,
 * then .replace() on undefined crashed the app.
 */
export function formatDate(
  dateStr: string | null | undefined,
  fmt = 'd MMM yyyy'
): string {
  // Guard: return dash for missing values
  if (!dateStr) return '—';

  try {
    const parsed = parseISO(dateStr);
    // Guard: isValid catches NaN dates (e.g. parseISO(''))
    if (!isValid(parsed)) return '—';
    return format(parsed, fmt);
  } catch {
    return '—';
  }
}

/**
 * FIX: Same null-safety for relative time formatting.
 */
export function formatRelativeTime(
  dateStr: string | null | undefined
): string {
  if (!dateStr) return '—';
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return '—';
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return '—';
  }
}

export function formatPercent(value: number, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function getTrendColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-slate-400';
}

export function getModuleColor(module: string): string {
  const map: Record<string, string> = {
    agriculture: '#4ade80',
    dairy:       '#38bdf8',
    poultry:     '#fb923c',
    shop:        '#fbbf24',
    machinery:   '#94a3b8',
    labour:      '#a78bfa',
    reports:     '#64748b',
    inventory:   '#34d399',
  };
  return map[(module ?? '').toLowerCase()] ?? '#64748b';
}

export function getModuleBg(module: string): string {
  const map: Record<string, string> = {
    agriculture: 'bg-emerald-500/10 border-emerald-500/20',
    dairy:       'bg-sky-500/10 border-sky-500/20',
    shop:        'bg-amber-500/10 border-amber-500/20',
  };
  return map[(module ?? '').toLowerCase()] ?? 'bg-slate-500/10 border-slate-500/20';
}

export function getAlertColor(type: string) {
  switch (type) {
    case 'danger':  return { border: 'border-red-500/30',     bg: 'bg-red-500/8',     dot: 'bg-red-400',     text: 'text-red-300'     };
    case 'warning': return { border: 'border-amber-500/30',   bg: 'bg-amber-500/8',   dot: 'bg-amber-400',   text: 'text-amber-300'   };
    case 'info':    return { border: 'border-sky-500/30',     bg: 'bg-sky-500/8',     dot: 'bg-sky-400',     text: 'text-sky-300'     };
    case 'success': return { border: 'border-emerald-500/30', bg: 'bg-emerald-500/8', dot: 'bg-emerald-400', text: 'text-emerald-300' };
    default:        return { border: 'border-slate-500/30',   bg: 'bg-slate-500/8',   dot: 'bg-slate-400',   text: 'text-slate-300'   };
  }
}

export const formatDateRange = (
  start: string | null | undefined,
  end:   string | null | undefined
): string => {
  return `${formatDate(start)} – ${formatDate(end)}`;
};

export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    PLANNED:   'bg-slate-500/20 text-slate-300 border-slate-500/30',
    ACTIVE:    'bg-agri-500/20 text-agri-300 border-agri-500/30',
    HARVESTED: 'bg-harvest-500/20 text-harvest-300 border-harvest-500/30',
    COMPLETED: 'bg-agri-700/20 text-agri-400 border-agri-700/30',
    ABANDONED: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return map[status] ?? 'bg-slate-500/20 text-slate-300';
};

export const expenseCategoryColor = (cat: string): string => {
  const map: Record<string, string> = {
    LAND_PREP:    'text-soil-400',
    SEEDS:        'text-agri-400',
    FERTILIZER:   'text-harvest-400',
    IRRIGATION:   'text-blue-400',
    LABOR:        'text-purple-400',
    PEST_CONTROL: 'text-red-400',
    HARVESTING:   'text-orange-400',
    TRANSPORT:    'text-cyan-400',
    OTHER:        'text-slate-400',
  };
  return map[cat] ?? 'text-slate-400';
};

export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
};

export const daysUntil = (dateStr: string | null | undefined): number => {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const PRODUCT_LABELS: Record<string, string> = {
  PANEER:     'Paneer',
  GHEE:       'Ghee',
  DAHI:       'Dahi',
  BUTTER:     'Butter',
  MAKKAN:     'Makkan',
  KHOYA:      'Khoya',
  CREAM:      'Cream',
  LASSI:      'Lassi',
  KULFI:      'Kulfi',
  KHEER:      'Kheer',
  ICE_CREAM:  'Ice Cream',
  HOT_MILK:   'Flavored Hot Milk',
  BAKERY:     'Bakery',
  CHAAT:      'Chaat',
  RESTAURANT: 'Restaurant',
};

export const getProductLabel = (type: string): string =>
  PRODUCT_LABELS[type] ?? type;

export const PAYMENT_COLORS: Record<string, string> = {
  CASH:   'green',
  UPI:    'blue',
  CARD:   'indigo',
  CREDIT: 'amber',
};

export const BATCH_STATUS_STYLES: Record<string, string> = {
  PROCESSING: 'bg-amber-100 text-amber-700 border-amber-200',
  READY:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  EXPIRED:    'bg-red-100 text-red-700 border-red-200',
};

export const marginPct = (cost: number, price: number): number =>
  price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

export const uid = (): string =>
  Math.random().toString(36).slice(2, 10);