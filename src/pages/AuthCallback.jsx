import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { socialLogin } from '../apis/authAPI';
import useAuthStore from '../storage/useAuthStore';
import { getMyInfo } from '../apis/authAPI';
import { linkRiotAccount } from '../apis/accountAPI';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function AuthCallback() {
    const { provider } = useParams();
    const navigate = useNavigate();
    const query = useQuery();
    const { login, setUserData } = useAuthStore();
    const hasProcessed = useRef(false);

    console.log('🔥 AuthCallback 컴포넌트 렌더링됨!');
    console.log('현재 URL:', window.location.href);

    useEffect(() => {
        if (hasProcessed.current) return; // 이미 처리했으면 중단
        hasProcessed.current = true; // 🔥 처리 시작 플래그 설정

        const handleCallback = async () => {
            const code = query.get('code');
            const state = query.get('state');

            if (!provider || !code) {
                console.warn('provider 또는 code 누락');
                navigate('/');
                return;
            }

            // 연동 모드인지 확인
            const isLinkMode = localStorage.getItem('riotLinkMode') === 'true';

            try {
                if (provider === 'riot' && isLinkMode) {
                    console.log('🔗 Riot 계정 연동 모드');
                    await handleRiotLink(code);
                } else {
                    console.log('🚪 일반 로그인 모드');
                    await handleLogin(code, state, provider);
                }
            } catch (error) {
                console.error('처리 실패:', error);
                // 🔥 에러 시에도 플래그 제거하고 적절한 페이지로 이동
                if (provider === 'riot' && isLinkMode) {
                    localStorage.removeItem('riotLinkMode');
                    navigate('/mysetting');
                } else {
                    navigate('/login');
                }
            }
        };

        const handleLogin = async (code, state, provider) => {
            const { accessToken, refreshToken, newUser } = await socialLogin(provider, code, state);
            console.log('📌 isNewUser:', newUser);

            login(accessToken, refreshToken);

            const userInfo = await getMyInfo();
            setUserData(userInfo.data);

            if (userInfo.data.term === null || userInfo.data.term === "REMOVABLE") {
                console.log('약관 동의가 필요한 사용자입니다.');
                navigate('/signup');
            } else {
                console.log('로그인 성공');
                const redirectPath = localStorage.getItem('redirectAfterLogin');
                if (redirectPath) {
                    localStorage.removeItem('redirectAfterLogin');
                    navigate(redirectPath);
                } else {
                    navigate('/');
                }
            }
        };

        const handleRiotLink = async (code) => {
            const response = await linkRiotAccount(code);

            alert('Riot 계정 연동이 완료되었습니다!');

            const userInfo = await getMyInfo();
            setUserData(userInfo.data);

            localStorage.removeItem('riotLinkMode');
            navigate('/mysetting');
        };

        handleCallback();
    }, [provider, query, navigate, login, setUserData]);

    return ;
}
