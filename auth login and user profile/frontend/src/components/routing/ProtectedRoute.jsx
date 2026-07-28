import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, bootstrapped, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect un-onboarded users to onboarding if trying to access protected pages
  if (user && !user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
