/**
 * Header component
 * App-level header with title and navigation tabs for mode switching.
 * Uses React Router Link/useLocation so the active tab reflects the current route.
 */

import { Link, useLocation } from 'react-router-dom';

/** Top-level app header with navigation between Single Battle and Trainer Battle modes. */
export function Header() {
  const { pathname } = useLocation();

  const navItems = [
    { label: 'Single Battle', to: '/' },
    { label: 'Trainer Battle', to: '/trainer' },
  ];

  return (
    <header
      className="shrink-0 shadow-md"
      style={{
        backgroundColor: 'var(--md-sys-color-primary)',
        color: 'var(--md-sys-color-on-primary)',
      }}
    >
      <div style={{ padding: '16px 20px 0 20px' }}>
        <div className="flex items-baseline gap-4 mb-2">
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Mezastar Helper</h1>
          <p style={{ fontSize: '13px', opacity: 0.85 }}>Find the best Pokemon for your battles</p>
        </div>
        <nav className="flex gap-1" aria-label="Mode selection">
          {navItems.map(({ label, to }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px 6px 0 0',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background-color 0.15s, color 0.15s',
                  backgroundColor: isActive
                    ? 'var(--md-sys-color-background)'
                    : 'rgba(255,255,255,0.15)',
                  color: isActive ? 'var(--md-sys-color-primary)' : 'rgba(255,255,255,0.85)',
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
