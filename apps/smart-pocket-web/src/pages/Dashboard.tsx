/**
 * Dashboard Screen
 * Main entry point after setup
 * Shows available features and services
 */

import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import './Dashboard.css';

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  enabled: boolean;
}

const FEATURES: Feature[] = [
  {
    id: 'sheets-sync',
    title: 'Google Sheets Sync',
    subtitle: 'Sync Actual Budget accounts to Google Sheets',
    route: '/sync',
    icon: '📊',
    enabled: true,
  },
  {
    id: 'budgets',
    title: 'Budget Management',
    subtitle: 'Coming soon...',
    route: '/budgets',
    icon: '💰',
    enabled: false,
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    subtitle: 'Coming soon...',
    route: '/reports',
    icon: '📈',
    enabled: false,
  },
];

export function Dashboard() {
  const navigate = useNavigate();

  const handleFeatureClick = (route: string, enabled: boolean) => {
    if (enabled) {
      navigate(route);
    }
  };

  return (
    <MainLayout title="Dashboard" subtitle="Welcome back, 👋" showNavigation={true}>
      {/* Features Grid */}
      <div className="dashboard-features">
        {FEATURES.map((feature) => (
          <button
            key={feature.id}
            onClick={() => handleFeatureClick(feature.route, feature.enabled)}
            disabled={!feature.enabled}
            className={`dashboard-feature-card ${!feature.enabled ? 'disabled' : ''}`}
          >
            <div className="feature-card-header">
              <span className="feature-card-icon">{feature.icon}</span>
              <div className="feature-card-content">
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-subtitle">{feature.subtitle}</p>
              </div>
            </div>
            {feature.enabled && <span className="feature-card-arrow">→</span>}
          </button>
        ))}
      </div>
    </MainLayout>
  );
}
