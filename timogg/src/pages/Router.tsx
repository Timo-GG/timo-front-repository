import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage.tsx';
import LoginPage from './LoginPage.tsx';
import RegisterPage from './RegisterPage.tsx';
import MatchPage from './MatchPage.tsx';
import BoardPage from './BoardPage.tsx';
import AuthCallback from '../utils/authCallback.tsx';
import ApiTestPage from './ApiTestPage.tsx';
import { checkRegister } from '../utils/checkRegister.tsx';
import useAuthStore from '../storage/useAuthStore.tsx';
import OuterLayout from './OuterLayout.tsx';
import { useEffect } from 'react';
import ContentLayout from './ContentLayout.tsx';

function Router() {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn && window.location.pathname !== '/register') {
      checkRegister().then(result => {
        if (!result) {
          navigate('/register');
        }
      });
    }
  }, [isLoggedIn]);

  return (
    <Routes>
      <Route element={<OuterLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ContentLayout />}>
          <Route path="/match" element={<MatchPage />} />
          <Route path="/board" element={<BoardPage />} />
        </Route>
        <Route path="/auth/callback/:provider" element={<AuthCallback />} />
        <Route path="/api" element={<ApiTestPage />} />
      </Route>
    </Routes>
  );
}

export default Router;
