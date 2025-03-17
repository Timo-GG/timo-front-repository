import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { socialLogin } from '../apis/auth';
import useAuthStore from '../storage/useAuthStore';
import { myInfo } from '../apis/member';
import axios from 'axios';

function AuthCallback() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const { login, setUserData } = useAuthStore();
  const router = useNavigate();

  const code = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    const handleLogin = async () => {
      switch (provider) {
        case 'naver':
          if (code && state) {
            const data = await socialLogin(provider, code, state);

            login(data!.accessToken, data!.refreshToken);

            const userData = await myInfo();

            setUserData(userData);

            router('/', { replace: true });
          }
          break;
        case 'kakao':
          if (code) {
            const data = await socialLogin(provider, code);

            console.log(data);

            login(data!.accessToken, data!.refreshToken);

            const userData = await myInfo();

            setUserData(userData);

            router('/', { replace: true });
          }
          break;
        default:
          break;
      }
    };

    handleLogin();
  }, [provider, code, state]);

  return null;
}

export default AuthCallback;
