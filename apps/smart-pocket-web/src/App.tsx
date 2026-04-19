/**
 * Root App Component
 * Wraps the entire application with AuthProvider and Router
 */

import { AuthProvider } from './components/AuthProvider';
import { Router } from './router';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
