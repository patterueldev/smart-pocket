/**
 * Router Configuration for Smart Pocket Web
 * Defines all routes and their protection levels
 * 
 * Uses React Router's basename to handle subpath routing (/ui/)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Setup } from './pages/Setup';
import { Dashboard } from './pages/Dashboard';
import { Sync } from './pages/Sync';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RootRoute } from './components/RootRoute';
import { getBasename } from './config/routing';

export function Router() {
  const basename = getBasename();

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Root - smart redirect based on auth state */}
        <Route path="/" element={<RootRoute />} />

        {/* Setup page - public */}
        <Route path="/setup" element={<Setup />} />

        {/* Dashboard - protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Sheets Sync - protected */}
        <Route
          path="/sheets-sync"
          element={
            <ProtectedRoute>
              <Sync />
            </ProtectedRoute>
          }
        />

        {/* Catch-all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
