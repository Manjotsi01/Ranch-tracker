// client/src/components/layout/Topbar.tsx
import { useLocation } from 'react-router-dom';
import { Bell, Settings, Menu, Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface TopbarProps {
  collapsed: boolean;
  onMenuClick: () => void;
  isMobile?: boolean;
}

const routeTree: Record<string, { label: string; parent?: string; parentPath?: string }> = {
  '/dashboard':   { label: 'Dashboard' },
  '/agriculture': { label: 'Agriculture' },
  '/dairy':       { label: 'Dairy' },
  '/shop':        { label: 'Shop & POS' },
  '/shop/pos':        { label: 'Point of Sale',      parent: 'Shop',        parentPath: '/shop' },
  '/shop/processing': { label: 'Batch Processing',   parent: 'Shop',        parentPath: '/shop' },
  '/shop/sales':      { label: 'Sales History',      parent: 'Shop',        parentPath: '/shop' },
  '/dairy/fodder':    { label: 'Fodder & Feed',      parent: 'Dairy',       parentPath: '/dairy' },
};

function getRouteInfo(pathname: string) {
  // Exact match first
  if (routeTree[pathname]) return routeTree[pathname];
  // Longest prefix match
  const match = Object.keys(routeTree)
    .sort((a, b) => b.length - a.length)
    .find(key => pathname.startsWith(key));
  return match ? routeTree[match] : { label: 'Ranch Tracker' };
}

// Module accent colors
const moduleAccent: Record<string, string> = {
  '/dashboard':   '#4ade80',
  '/agriculture': '#86efac',
  '/dairy':       '#38bdf8',
  '/shop':        '#fbbf24',
};

function getAccent(pathname: string): string {
  const match = Object.keys(moduleAccent)
    .sort((a, b) => b.length - a.length)
    .find(k => pathname.startsWith(k));
  return match ? moduleAccent[match] : '#4ade80';
}

export default function Topbar({ onMenuClick, isMobile }: TopbarProps) {
  const location = useLocation();
  const [notifCount] = useState(3);
  const [searchOpen, setSearchOpen] = useState(false);

  const info = getRouteInfo(location.pathname);
  const accent = getAccent(location.pathname);

  return (
    <header style={{
      height: 52,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 14px' : '0 20px',
      background: 'rgba(8,12,16,0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      gap: 12,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Left: hamburger + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {/* Menu toggle */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle menu"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4a7c5a',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = accent;
            (e.currentTarget as HTMLElement).style.background = `${accent}12`;
            (e.currentTarget as HTMLElement).style.borderColor = `${accent}30`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#4a7c5a';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
          }}
        >
          <Menu size={15} />
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
          {info.parent && !isMobile && (
            <>
              <span style={{ fontSize: 12, color: '#2a4a3a', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                {info.parent}
              </span>
              <ChevronRight size={11} style={{ color: '#1a3028', flexShrink: 0 }} />
            </>
          )}
          <span style={{
            fontSize: isMobile ? 13 : 14,
            fontWeight: 700,
            color: '#d8ede4',
            fontFamily: "'Syne', sans-serif",
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {info.label}
          </span>

          {/* Live accent dot */}
          <div style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: accent,
            boxShadow: `0 0 6px ${accent}80`,
            flexShrink: 0,
            marginLeft: 3,
          }} />
        </div>
      </div>

      {/* Right: search + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Search (hide on small mobile) */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: searchOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${searchOpen ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 8,
            padding: '0 10px',
            height: 32,
            transition: 'all 0.2s',
            cursor: 'text',
            overflow: 'hidden',
            width: searchOpen ? 180 : 32,
          }}
            onClick={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          >
            <Search size={13} style={{ color: '#3a5a4a', flexShrink: 0 }} />
            {searchOpen && (
              <input
                autoFocus
                placeholder="Search…"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  color: '#c8d8e8',
                  fontFamily: "'DM Sans', sans-serif",
                  width: '100%',
                  caretColor: '#4ade80',
                }}
              />
            )}
          </div>
        )}

        {/* Notifications */}
        <button
          aria-label={`Notifications (${notifCount} unread)`}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#3a5a4a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#86efac';
            (e.currentTarget as HTMLElement).style.background = 'rgba(134,239,172,0.06)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#3a5a4a';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Bell size={15} />
          {notifCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 6px rgba(239,68,68,0.6)',
              border: '1.5px solid #080c10',
            }} />
          )}
        </button>

        {/* Settings */}
        <button
          aria-label="Settings"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#3a5a4a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#86efac';
            (e.currentTarget as HTMLElement).style.background = 'rgba(134,239,172,0.06)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#3a5a4a';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}