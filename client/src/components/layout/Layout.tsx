// client/src/components/layout/Layout.tsx
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile]);

  const SW = isMobile ? 0 : collapsed ? 60 : 220;

  return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      width: '100vw',
      overflow: 'hidden',
      background: '#080c10',
      position: 'relative',
    }}>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 98,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={{
          width: SW,
          minWidth: SW,
          maxWidth: SW,
          flexShrink: 0,
          height: '100dvh',
          zIndex: 10,
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1), max-width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}>
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(c => !c)}
            isMobile={false}
          />
        </div>
      )}

      {/* Mobile Sidebar (drawer overlay) */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100dvh',
          zIndex: 99,
          width: 240,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}>
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            isMobile={true}
            onClose={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content column */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
      }}>
        {/* Topbar */}
        <Topbar
          collapsed={collapsed}
          onMenuClick={() => isMobile ? setMobileOpen(o => !o) : setCollapsed(c => !c)}
          isMobile={isMobile}
        />

        {/* Scrollable page content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isMobile ? '16px 14px' : '20px 24px',
          background: '#080c10',
          scrollbarWidth: 'thin',
          scrollbarColor: '#1e2d3d #0d1117',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}