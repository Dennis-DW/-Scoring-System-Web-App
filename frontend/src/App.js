// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ROUTES, ROUTE_PROTECTION } from './constants/routes';

// Component imports
import AdminPanel from './components/AdminPanel';
import JudgePortal from './components/JudgePortal';
import MainContent from './components/MainContent';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import NotFound from './components/NotFound';

import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN.path} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.SCOREBOARD.path} replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {user && (
        <>
          <Sidebar 
            open={mobileSidebarOpen} 
            onClose={() => setMobileSidebarOpen(false)} 
          />
          <Header onToggleSidebar={() => setMobileSidebarOpen(true)} />
        </>
      )}
      <main className={`${user ? 'pt-20 lg:pl-64' : ''}`}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.SCOREBOARD.path} element={<MainContent />} />
            <Route path={ROUTES.LOGIN.path} element={<Login />} />

            {/* Protected Routes */}
            <Route 
              path={`${ROUTES.ADMIN_PANEL.path}/*`}
              element={
                <ProtectedRoute allowedRoles={[ROUTE_PROTECTION.ADMIN]}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={`${ROUTES.JUDGE_PORTAL.path}/*`}
              element={
                <ProtectedRoute allowedRoles={[ROUTE_PROTECTION.ADMIN, ROUTE_PROTECTION.JUDGE]}>
                  <JudgePortal />
                </ProtectedRoute>
              } 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;