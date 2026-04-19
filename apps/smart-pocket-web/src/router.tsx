/**
 * Router Configuration for Smart Pocket Web
 * Defines all routes and their protection levels
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Setup } from './pages/Setup';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root - redirect to setup or dashboard based on auth state */}
        <Route path="/" element={<Navigate to="/setup" replace />} />

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

        {/* Catch-all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
