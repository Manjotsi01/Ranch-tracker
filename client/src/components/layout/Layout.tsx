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

  const SW = isMobile ? 0 : collapsed ? 60 : 230;

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        background: '#f0f4f8',
        position: 'relative',
      }}
    >
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 98,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          style={{
            width: SW,
            minWidth: SW,
            maxWidth: SW,
            height: '100dvh',
            flexShrink: 0,
            zIndex: 10,
            transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s, max-width 0.22s',
            overflow: 'hidden',
          }}
        >
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(c => !c)}
          />
        </div>
      )}

      {/* Mobile Sidebar drawer */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100dvh',
            width: 240,
            zIndex: 99,
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            isMobile
            onClose={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content column */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <Topbar
          collapsed={collapsed}
          onMenuClick={() =>
            isMobile ? setMobileOpen(o => !o) : setCollapsed(c => !c)
          }
          isMobile={isMobile}
        />

        {/* Page content */}
        <main
          className="scrollbar-light"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#f0f4f8',
            padding: isMobile ? '16px 14px' : '24px 28px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}