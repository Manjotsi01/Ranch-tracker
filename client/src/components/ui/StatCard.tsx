// client/src/components/ui/StatCard.tsx
import { cn, formatCurrency, formatNumber, formatPercent, getTrendColor } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

/* ── Tiny SVG Sparkline ─────────────────────────────────── */
interface SparkProps {
  data: number[];
  color: string;
  height?: number;
}

function Sparkline({ data, color, height = 36 }: SparkProps) {
  if (!data || data.length < 2) return null;
  const w = 80;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const areaPath =
    `M${points.join('L')} ` +
    `L${w},${h} L0,${h} Z`;

  const uid = color.replace(/[^a-z0-9]/gi, '');

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: 'visible', flexShrink: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${uid})`} />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Main StatCard ──────────────────────────────────────── */
interface StatCardProps {
  label:       string;
  value:       string | number;
  prefix?:     string;
  suffix?:     string;
  trend?:      number;
  trendLabel?: string;
  icon?:       ReactNode;
  accentColor?: string;
  format?:     'currency' | 'number' | 'raw';
  compact?:    boolean;
  className?:  string;
  loading?:    boolean;
  animIndex?:  number;
  /** Optional sparkline data (array of numbers, recent first → oldest last OR oldest first) */
  sparkData?:  number[];
}

export default function StatCard({
  label,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  icon,
  accentColor = '#10b981',
  format = 'raw',
  compact = true,
  className,
  loading = false,
  animIndex = 0,
  sparkData,
}: StatCardProps) {
  /* Format value */
  const formattedValue = (() => {
    if (loading) return '';
    if (typeof value === 'number') {
      if (format === 'currency') return formatCurrency(value, compact);
      if (format === 'number')   return formatNumber(value);
    }
    return String(value);
  })();

  const TrendIcon =
    trend === undefined ? null
    : trend > 0 ? TrendingUp
    : trend < 0 ? TrendingDown
    : Minus;

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-2xl p-5 border border-slate-100 bg-white',
          className
        )}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div className="skeleton h-2.5 w-24 mb-4 rounded-md" />
        <div className="skeleton h-8 w-32 mb-3 rounded-md" />
        <div className="skeleton h-2 w-16 rounded-md" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'kpi-card relative rounded-2xl overflow-hidden group cursor-default animate-fade-up',
        'transition-all duration-250',
        className
      )}
      style={{
        background: '#ffffff',
        border: '1px solid #e8eef5',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.04)',
        animationDelay: `${animIndex * 0.07}s`,
        animationFillMode: 'both',
        padding: '20px 20px 16px',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 4px 12px 0 rgba(0,0,0,0.08), 0 1px 3px -1px rgba(0,0,0,0.05)';
        (e.currentTarget as HTMLElement).style.borderColor = accentColor + '40';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLElement).style.borderColor = '#e8eef5';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
      role="figure"
      aria-label={`${label}: ${formattedValue}${suffix ?? ''}`}
    >
      {/* Accent top border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accentColor,
          borderRadius: '14px 14px 0 0',
          opacity: 0.7,
        }}
        aria-hidden="true"
      />

      {/* Label + Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: "'Syne', sans-serif",
            lineHeight: 1,
          }}
        >
          {label}
        </p>

        {icon && (
          <div
            style={{
              padding: '7px',
              borderRadius: 10,
              background: accentColor + '14',
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <span style={{ display: 'block', width: 16, height: 16, color: accentColor }}>
              {icon}
            </span>
          </div>
        )}
      </div>

      {/* Value row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 10 }}>
        {prefix && (
          <span style={{ fontSize: 15, color: accentColor + 'bb', fontWeight: 600 }}>
            {prefix}
          </span>
        )}
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#0f172a',
            fontFamily: "'Syne', sans-serif",
            lineHeight: 1,
            letterSpacing: '-0.5px',
          }}
        >
          {formattedValue}
        </span>
        {suffix && (
          <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Trend + Sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          {trend !== undefined && TrendIcon && (
            <div
              className={cn('flex items-center gap-1.5', getTrendColor(trend))}
              style={{ fontSize: 12 }}
            >
              <TrendIcon style={{ width: 13, height: 13, flexShrink: 0 }} />
              <span style={{ fontWeight: 700 }}>{formatPercent(trend)}</span>
              {trendLabel && (
                <span style={{ color: '#94a3b8', fontWeight: 400 }}>{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {sparkData && sparkData.length >= 2 && (
          <div className="kpi-sparkline">
            <Sparkline data={sparkData} color={accentColor} height={36} />
          </div>
        )}
      </div>
    </div>
  );
}

export { StatCard };