import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage.tsx';
import LoginPage from './LoginPage.tsx';
import RegisterPage from './RegisterPage.tsx';
import MatchPage from './MatchPage.tsx';
import BoardPage from './BoardPage.tsx';
import AuthCallback from '../utils/authCallback.tsx';
import ApiTestPage from './ApiTestPage.tsx';
import { checkRegister } from '../utils/checkRegister.tsx';
import useAuthStore from '../storage/useAuthStore.tsx';

function Router() {
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn && window.location.pathname !== '/register') {
      checkRegister().then(result => {
        if (!result) {
          window.location.href = '/register';
        }
      });
    }
  }, [isLoggedIn]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/match" element={<MatchPage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="/auth/callback/:provider" element={<AuthCallback />} />
      <Route path="/api" element={<ApiTestPage />} />
    </Routes>
  );
}

export default Router;
