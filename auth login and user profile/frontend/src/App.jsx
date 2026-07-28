import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { fetchMe } from './redux/slices/authSlice';
import { ProtectedRoute } from './components/routing/ProtectedRoute';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfilePage } from './pages/ProfilePage';

function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('fitai_token')) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthBootstrap />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0F172A',
              color: '#F8FAFC',
              border: '1px solid #1E293B',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
