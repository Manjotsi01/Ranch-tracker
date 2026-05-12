// client/src/components/shared/AlertPanel.tsx
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { getAlertColor, formatRelativeTime, getModuleColor } from '../../lib/utils';
import type { Alert } from '../../types';

interface AlertPanelProps {
  alerts?:   Alert[];
  onDismiss?: (id: string) => void;
  loading?:  boolean;
  /** Compact variant — smaller padding, used in right sidebar */
  compact?:  boolean;
}

const AlertIcon = ({ type }: { type: string }) => {
  const size = 14;
  switch (type) {
    case 'danger':  return <XCircle       size={size} />;
    case 'warning': return <AlertTriangle size={size} />;
    case 'success': return <CheckCircle   size={size} />;
    default:        return <Info          size={size} />;
  }
};

const TYPE_STYLES: Record<string, {
  bg: string; border: string; icon: string; badge: string; badgeText: string;
}> = {
  danger: {
    bg:        '#fef2f2',
    border:    '#fecaca',
    icon:      '#ef4444',
    badge:     '#fee2e2',
    badgeText: '#b91c1c',
  },
  warning: {
    bg:        '#fffbeb',
    border:    '#fde68a',
    icon:      '#f59e0b',
    badge:     '#fef3c7',
    badgeText: '#92400e',
  },
  success: {
    bg:        '#ecfdf5',
    border:    '#a7f3d0',
    icon:      '#10b981',
    badge:     '#d1fae5',
    badgeText: '#065f46',
  },
  info: {
    bg:        '#eff6ff',
    border:    '#bfdbfe',
    icon:      '#3b82f6',
    badge:     '#dbeafe',
    badgeText: '#1e40af',
  },
};

export default function AlertPanel({
  alerts  = [],
  onDismiss,
  loading = false,
  compact = false,
}: AlertPanelProps) {
  /* ── Loading skeletons ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-busy="true">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="skeleton"
            style={{ height: compact ? 52 : 64, borderRadius: 12 }}
          />
        ))}
      </div>
    );
  }

  /* ── Empty state ── */
  if (alerts.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 16px',
          gap: 8,
        }}
        role="status"
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle size={20} style={{ color: '#10b981' }} />
        </div>
        <p style={{ fontSize: 13, color: '#10b981', fontWeight: 600, margin: 0 }}>All clear</p>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>No active alerts</p>
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      role="list"
      aria-label="System alerts"
    >
      {alerts.map(alert => {
        const styles      = TYPE_STYLES[alert.type] ?? TYPE_STYLES.info;
        const moduleColor = getModuleColor(alert.module);

        return (
          <div
            key={alert.id}
            role="listitem"
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: compact ? '10px 12px' : '12px 14px',
              borderRadius: 12,
              background: styles.bg,
              border: `1px solid ${styles.border}`,
              position: 'relative',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Icon */}
            <span
              style={{ color: styles.icon, flexShrink: 0, marginTop: 1 }}
              aria-hidden="true"
            >
              <AlertIcon type={alert.type} />
            </span>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                {/* Module badge */}
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '2px 7px',
                    borderRadius: 20,
                    background: styles.badge,
                    color: styles.badgeText,
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {alert.module}
                </span>
                {/* Time */}
                <time
                  style={{ fontSize: 10, color: '#94a3b8' }}
                  dateTime={alert.createdAt}
                >
                  {formatRelativeTime(alert.createdAt)}
                </time>
              </div>

              <p
                style={{
                  fontSize: compact ? 12 : 13,
                  color: '#374151',
                  lineHeight: 1.5,
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {alert.message}
              </p>
            </div>

            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                aria-label={`Dismiss: ${alert.message}`}
                style={{
                  flexShrink: 0,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#374151';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = '#9ca3af';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { AlertPanel };