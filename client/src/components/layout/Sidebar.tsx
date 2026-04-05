// client/src/components/layout/Sidebar.tsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Leaf, Milk, ShoppingCart,
  ChevronLeft, X, Menu,
} from 'lucide-react';

const nav = [
  { key: 'dashboard',   label: 'Dashboard',  path: '/dashboard',   icon: LayoutDashboard, color: '#4ade80', glow: 'rgba(74,222,128,0.15)' },
  { key: 'agriculture', label: 'Agriculture', path: '/agriculture',  icon: Leaf,            color: '#86efac', glow: 'rgba(134,239,172,0.15)' },
  { key: 'dairy',       label: 'Dairy',       path: '/dairy',        icon: Milk,            color: '#38bdf8', glow: 'rgba(56,189,248,0.15)' },
  { key: 'shop',        label: 'Shop & POS',  path: '/shop',         icon: ShoppingCart,    color: '#fbbf24', glow: 'rgba(251,191,36,0.15)' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ collapsed, onToggle, isMobile, onClose }: Props) {
  const loc = useLocation();

  return (
    <aside style={{
      width: '100%',
      height: '100%',
      background: isMobile
        ? 'linear-gradient(180deg, #090e14 0%, #0a1018 100%)'
        : 'linear-gradient(180deg, #080c10 0%, #090d13 100%)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: isMobile ? '4px 0 40px rgba(0,0,0,0.5)' : 'none',
    }}>

      {/* Logo / Brand */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: collapsed && !isMobile ? '0 14px' : '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        gap: 10,
        flexShrink: 0,
        justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {/* Logo mark */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(34,197,94,0.35), 0 2px 8px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
            }} />
            <span style={{
              fontSize: 13,
              fontWeight: 900,
              color: '#000',
              fontFamily: "'Syne', sans-serif",
              letterSpacing: '-0.5px',
              position: 'relative',
              zIndex: 1,
            }}>RT</span>
          </div>

          {(!collapsed || isMobile) && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <p style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#e8f5ee',
                fontFamily: "'Syne', sans-serif",
                lineHeight: 1,
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
              }}>Ranch</p>
              <p style={{
                fontSize: 9,
                color: '#2a4a35',
                letterSpacing: '0.2em',
                fontFamily: "'Syne', sans-serif",
                textTransform: 'uppercase',
                marginTop: 1,
              }}>TRACKER</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4a5a6a',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#8a9aaa';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#4a5a6a';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
            }}
            aria-label="Close sidebar"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{ flex: 1, overflowY: 'auto', padding: '10px 8px', scrollbarWidth: 'none' }}
        aria-label="Main navigation"
      >
        {(!collapsed || isMobile) && (
          <p style={{
            fontSize: 9,
            color: '#1e2d3a',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '4px 8px 8px',
            fontFamily: "'Syne', sans-serif",
          }}>Navigation</p>
        )}

        {nav.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.path === '/dashboard'
            ? loc.pathname === '/dashboard' || loc.pathname === '/'
            : loc.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.key}
              to={item.path}
              title={collapsed && !isMobile ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed && !isMobile ? '10px 0' : '9px 10px',
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                borderRadius: 9,
                marginBottom: 2,
                textDecoration: 'none',
                background: isActive ? item.glow : 'transparent',
                color: isActive ? '#e8f0fe' : '#3a4a5a',
                position: 'relative',
                transition: 'all 0.18s ease',
                outline: 'none',
                animationDelay: `${idx * 0.06}s`,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#6a7a8a';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#3a4a5a';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              {/* Active indicator bar */}
              {isActive && (!collapsed || isMobile) && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 18,
                  background: item.color,
                  borderRadius: '0 2px 2px 0',
                  boxShadow: `0 0 8px ${item.color}80`,
                }} />
              )}

              <Icon
                size={15}
                style={{
                  color: isActive ? item.color : 'inherit',
                  flexShrink: 0,
                  filter: isActive ? `drop-shadow(0 0 4px ${item.color}60)` : 'none',
                  transition: 'all 0.15s',
                }}
              />

              {(!collapsed || isMobile) && (
                <span style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  flex: 1,
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: 'nowrap',
                  letterSpacing: isActive ? '-0.1px' : 0,
                }}>
                  {item.label}
                </span>
              )}

              {/* Active dot for collapsed */}
              {isActive && collapsed && !isMobile && (
                <span style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 6px ${item.color}`,
                }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Farm info footer */}
      {(!collapsed || isMobile) && (
        <div style={{
          padding: '8px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '8px 10px',
            borderRadius: 9,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1a2535, #0f1820)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', fontFamily: "'Syne', sans-serif" }}>N</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#5a7a6a', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>Nandha Farm</p>
              <p style={{ fontSize: 9, color: '#1e3028', whiteSpace: 'nowrap' }}>Fatehpur · Patiala</p>
            </div>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              flexShrink: 0,
              marginLeft: 'auto',
            }} />
          </div>
        </div>
      )}

      {/* Desktop collapse toggle */}
      {!isMobile && (
        <button
          onClick={onToggle}
          style={{
            height: 38,
            border: 'none',
            background: 'rgba(255,255,255,0.01)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1e2d3a',
            transition: 'color 0.15s, background 0.15s',
            flexShrink: 0,
            gap: 6,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#4ade80';
            (e.currentTarget as HTMLElement).style.background = 'rgba(74,222,128,0.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#1e2d3a';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.01)';
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <Menu size={13} />
            : <ChevronLeft size={13} />
          }
          {!collapsed && (
            <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em' }}>Collapse</span>
          )}
        </button>
      )}
    </aside>
  );
}