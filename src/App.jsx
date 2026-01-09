import React from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './hooks/useAuth';
// Corrected the import path for ThemeProvider below
import { ThemeProvider } from './contexts/ThemeContext';
import Toast from './components/Toast';

function AppContent() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {(
        <Dashboard onLogout={logout} />
      )}
      <Toast />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

