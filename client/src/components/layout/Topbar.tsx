// client/src/components/layout/Topbar.tsx
import { useLocation } from 'react-router-dom';
import { Bell, Settings, Menu, Search, ChevronRight, Sun } from 'lucide-react';
import { useState } from 'react';

interface TopbarProps {
  collapsed: boolean;
  onMenuClick: () => void;
  isMobile?: boolean;
}

const routeTree: Record<string, { label: string; parent?: string; parentPath?: string }> = {
  '/dashboard':       { label: 'Dashboard' },
  '/agriculture':     { label: 'Agriculture' },
  '/dairy':           { label: 'Dairy' },
  '/shop':            { label: 'Shop & POS' },
  '/shop/pos':        { label: 'Point of Sale',    parent: 'Shop',  parentPath: '/shop' },
  '/shop/processing': { label: 'Batch Processing', parent: 'Shop',  parentPath: '/shop' },
  '/shop/sales':      { label: 'Sales History',    parent: 'Shop',  parentPath: '/shop' },
  '/dairy/fodder':    { label: 'Fodder & Feed',    parent: 'Dairy', parentPath: '/dairy' },
};

function getRouteInfo(pathname: string) {
  if (routeTree[pathname]) return routeTree[pathname];
  const match = Object.keys(routeTree)
    .sort((a, b) => b.length - a.length)
    .find(k => pathname.startsWith(k));
  return match ? routeTree[match] : { label: 'Ranch Tracker' };
}

const moduleAccent: Record<string, string> = {
  '/dashboard':   '#10b981',
  '/agriculture': '#34d399',
  '/dairy':       '#22d3ee',
  '/shop':        '#f59e0b',
};

function getAccent(pathname: string): string {
  const match = Object.keys(moduleAccent)
    .sort((a, b) => b.length - a.length)
    .find(k => pathname.startsWith(k));
  return match ? moduleAccent[match] : '#10b981';
}

export default function Topbar({ onMenuClick, isMobile }: TopbarProps) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifCount] = useState(3);

  const info   = getRouteInfo(location.pathname);
  const accent = getAccent(location.pathname);

  return (
    <header
      style={{
        height: 60,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 14px' : '0 24px',
        background: '#ffffff',
        borderBottom: '1px solid #e8eef5',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
        gap: 12,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Left: menu + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {/* Menu toggle */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle menu"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#e2e8f0';
            (e.currentTarget as HTMLElement).style.color = '#0f172a';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
            (e.currentTarget as HTMLElement).style.color = '#64748b';
          }}
        >
          <Menu size={15} />
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          {info.parent && !isMobile && (
            <>
              <span
                style={{
                  fontSize: 13,
                  color: '#94a3b8',
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: 'nowrap',
                }}
              >
                {info.parent}
              </span>
              <ChevronRight size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} />
            </>
          )}

          <span
            style={{
              fontSize: isMobile ? 14 : 15,
              fontWeight: 700,
              color: '#0f172a',
              fontFamily: "'Syne', sans-serif",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {info.label}
          </span>

          {/* Accent dot */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: accent,
              flexShrink: 0,
              marginLeft: 2,
              boxShadow: `0 0 5px ${accent}80`,
            }}
          />
        </div>
      </div>

      {/* Right: weather + search + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

        {/* Weather pill (desktop only) */}
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 20,
              fontSize: 12,
              color: '#92400e',
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Sun size={13} style={{ color: '#f59e0b' }} />
            <span style={{ fontWeight: 700, color: '#d97706' }}>28°C</span>
            <span style={{ color: '#a16207' }}>Sunny</span>
          </div>
        )}

        {/* Date (desktop only) */}
        {!isMobile && (
          <div
            style={{
              padding: '5px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              fontSize: 12,
              color: '#64748b',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        )}

        {/* Search */}
        {!isMobile && (
          <div
            className="topbar-search"
            style={{ width: searchOpen ? 200 : 130, transition: 'width 0.2s ease' }}
            onClick={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          >
            <Search size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              placeholder={searchOpen ? 'Search anything…' : 'Search…'}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        )}

        {/* Notifications */}
        <button
          aria-label={`${notifCount} notifications`}
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
            (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
            (e.currentTarget as HTMLElement).style.color = '#0f172a';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#64748b';
          }}
        >
          <Bell size={16} />
          {notifCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #fff',
              }}
            />
          )}
        </button>

        {/* Settings */}
        <button
          aria-label="Settings"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
            (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
            (e.currentTarget as HTMLElement).style.color = '#0f172a';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#64748b';
          }}
        >
          <Settings size={16} />
        </button>

        {/* User avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: "'Syne', sans-serif",
            boxShadow: '0 1px 3px rgba(16,185,129,0.3)',
          }}
          title="Farm Manager"
        >
          NF
        </div>
      </div>
    </header>
  );
}