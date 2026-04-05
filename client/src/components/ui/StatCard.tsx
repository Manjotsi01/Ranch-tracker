// client/src/components/ui/StatCard.tsx
import { cn, formatCurrency, formatNumber, formatPercent, getTrendColor } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  accentColor?: string;
  format?: 'currency' | 'number' | 'raw';
  compact?: boolean;
  className?: string;
  loading?: boolean;
  animIndex?: number;
}

export default function StatCard({
  label,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  icon,
  accentColor = '#4ade80',
  format = 'raw',
  compact = true,
  className,
  loading = false,
  animIndex = 0,
}: StatCardProps) {
  const formattedValue = (() => {
    if (loading) return '';
    if (typeof value === 'number') {
      if (format === 'currency') return formatCurrency(value, compact);
      if (format === 'number') return formatNumber(value);
    }
    return String(value);
  })();

  const TrendIcon =
    trend === undefined ? null
    : trend > 0 ? TrendingUp
    : trend < 0 ? TrendingDown
    : Minus;

  if (loading) {
    return (
      <div className={cn(
        'rounded-2xl p-4 border border-white/5 bg-[#0d1117]',
        className
      )}>
        <div className="skeleton h-2.5 w-20 mb-4 rounded" />
        <div className="skeleton h-7 w-28 mb-3 rounded" />
        <div className="skeleton h-2 w-16 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-2xl p-4 border border-white/5 overflow-hidden',
        'hover:border-white/10 transition-all duration-300 group cursor-default',
        'animate-fade-up',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #111820 100%)',
        animationDelay: `${animIndex * 0.06}s`,
        animationFillMode: 'both',
      }}
      role="figure"
      aria-label={`${label}: ${formattedValue}${suffix ?? ''}`}
    >
      {/* Background glow */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-[0.07] group-hover:opacity-[0.14] transition-opacity duration-500"
        style={{ background: accentColor }}
        aria-hidden="true"
      />

      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-16 h-16 opacity-[0.03]"
        style={{
          background: `radial-gradient(circle at top right, ${accentColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative">
        {/* Label + Icon row */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3a4a5a] font-display leading-none">
            {label}
          </p>
          {icon && (
            <div
              className="p-1.5 rounded-lg flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
              style={{ background: `${accentColor}18` }}
            >
              <span style={{ color: accentColor }} className="block w-3.5 h-3.5">
                {icon}
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-2">
          {prefix && (
            <span className="text-xs" style={{ color: `${accentColor}80` }}>{prefix}</span>
          )}
          <span
            className="text-2xl font-bold font-display leading-none tracking-tight"
            style={{ color: accentColor }}
          >
            {formattedValue}
          </span>
          {suffix && (
            <span className="text-xs" style={{ color: `${accentColor}80` }}>{suffix}</span>
          )}
        </div>

        {/* Trend */}
        {trend !== undefined && TrendIcon && (
          <div className={cn('flex items-center gap-1.5 text-[11px]', getTrendColor(trend))}>
            <TrendIcon className="w-3 h-3 flex-shrink-0" />
            <span className="font-semibold">{formatPercent(trend)}</span>
            {trendLabel && (
              <span className="text-[#2a3545]">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { StatCard };