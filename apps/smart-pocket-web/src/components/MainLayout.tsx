/**
 * MainLayout Component
 * Provides consistent layout structure for all authenticated pages
 * Includes header, navigation, and content area
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './MainLayout.css';

interface MainLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showNavigation?: boolean;
}

export function MainLayout({
  title,
  subtitle,
  children,
  showNavigation = true,
}: MainLayoutProps) {
  const navigate = useNavigate();
  const authContext = useAuth();

  const handleLogout = async () => {
    await authContext.logout();
    navigate('/setup', { replace: true });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="main-layout">
      {/* Header with title and navigation */}
      <header className="main-header">
        <div className="main-header-content">
          <div className="main-header-title-group">
            <h1 className="main-header-title">{title}</h1>
            {subtitle && <p className="main-header-subtitle">{subtitle}</p>}
          </div>
        </div>

        {/* Header actions */}
        <div className="main-header-actions">
          <button onClick={handleLogout} className="main-header-logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Navigation tabs (for authenticated pages) */}
      {showNavigation && (
        <nav className="main-navigation">
          <div className="main-navigation-content">
            <button
              className="main-nav-item"
              onClick={() => handleNavigation('/dashboard')}
            >
              Dashboard
            </button>
            <button
              className="main-nav-item"
              onClick={() => handleNavigation('/sync')}
            >
              Google Sheets Sync
            </button>
          </div>
        </nav>
      )}

      {/* Main content area */}
      <main className="main-content">
        <div className="main-content-inner">{children}</div>
      </main>
    </div>
  );
}
