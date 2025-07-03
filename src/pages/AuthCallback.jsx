import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { socialLogin, getMyInfo } from '../apis/authAPI';
import useAuthStore from '../storage/useAuthStore';
import { linkRiotAccount } from '../apis/accountAPI';

export default function AuthCallback() {
    const { provider } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // 🔥 useLocation 직접 사용
    const { login, setUserData } = useAuthStore();
    const hasProcessed = useRef(false);

    console.log('🔥 AuthCallback 컴포넌트 렌더링됨!');
    console.log('현재 URL:', window.location.href);

    useEffect(() => {
        if (hasProcessed.current) {
            console.log('⚠️ 이미 처리됨, 중단');
            return;
        }
        hasProcessed.current = true;

        console.log('🚀 useEffect에서 콜백 처리 시작');

        const handleCallback = async () => {
            // 🔥 useEffect 내부에서 직접 파라미터 추출
            const urlParams = new URLSearchParams(location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');

            console.log('📋 파라미터 확인:', { provider, code: !!code, state: !!state });

            if (!provider || !code) {
                console.warn('provider 또는 code 누락');
                navigate('/');
                return;
            }

            const isLinkMode = localStorage.getItem('riotLinkMode') === 'true';
            console.log('🔍 연동 모드 확인:', { provider, isLinkMode });

            try {
                if (provider === 'riot' && isLinkMode) {
                    console.log('🔗 Riot 계정 연동 모드 진입');
                    await handleRiotLink(code);
                } else {
                    console.log('🚪 일반 로그인 모드 진입');
                    await handleLogin(code, state, provider);
                }
            } catch (error) {
                console.error('❌ 처리 실패:', error);
                if (provider === 'riot' && isLinkMode) {
                    localStorage.removeItem('riotLinkMode');
                    navigate('/mysetting');
                } else {
                    navigate('/login');
                }
            }
        };

        const handleLogin = async (code, state, provider) => {
            try {
                console.log(`🚪 ${provider} 일반 로그인 처리 시작`);
                const result = await socialLogin(provider, code, state);
                console.log('📌 socialLogin 결과:', result);

                login(result.accessToken, result.refreshToken);
                console.log('✅ 토큰 저장 완료');

                const userInfo = await getMyInfo();
                setUserData(userInfo.data);
                console.log('✅ 사용자 정보 저장 완료:', userInfo.data);

                if (userInfo.data.term === null || userInfo.data.term === "REMOVABLE") {
                    console.log('📝 약관 동의가 필요하여 /signup으로 이동합니다.');
                    navigate('/signup');
                } else {
                    console.log('✅ 로그인 성공');
                    const redirectPath = localStorage.getItem('redirectAfterLogin');
                    if (redirectPath) {
                        console.log(`↪️ 로그인 후 ${redirectPath}로 이동합니다.`);
                        localStorage.removeItem('redirectAfterLogin');
                        navigate(redirectPath);
                    } else {
                        console.log('🏠 메인 페이지로 이동합니다.');
                        navigate('/');
                    }
                }
            } catch (error) {
                console.error('❌ 로그인 처리 실패:', error);
                alert('로그인에 실패했습니다. 다시 시도해주세요.');
                navigate('/login');
            }
        };

        const handleRiotLink = async (code) => {
            try {
                console.log('🔗 Riot 계정 연동 처리 시작');
                await linkRiotAccount(code);
                console.log('✅ linkRiotAccount 완료');

                const userInfo = await getMyInfo();
                setUserData(userInfo.data);
                console.log('✅ 사용자 정보 업데이트 완료');

                localStorage.removeItem('riotLinkMode');
                alert('Riot 계정 연동이 완료되었습니다!');
                navigate('/mysetting');
            } catch (error) {
                console.error('❌ Riot 계정 연동 실패:', error);
                alert('계정 연동에 실패했습니다.');
                localStorage.removeItem('riotLinkMode');
                navigate('/mysetting');
            }
        };

        handleCallback();
    }, [provider, location.search, navigate, login, setUserData]); // 🔥 query 대신 location.search 사용

    return null;
}
