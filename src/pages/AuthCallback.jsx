import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { socialLogin, getMyInfo } from '../apis/authAPI';
import useAuthStore from '../storage/useAuthStore';
import {linkRiotAccount, registerRanking} from '../apis/accountAPI';
import {deleteMyRanking} from "../apis/rankAPI.js";

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
                // 1. 책임: 백엔드에 '계정 정보 변경'만을 요청합니다.
                console.log('🔗 1. 계정 정보 연동을 요청합니다.');
                await linkRiotAccount(code);
                console.log('✅ 1. 계정 정보 연동 완료.');

                // 2. 책임: '기존 랭킹 삭제' API를 호출합니다.
                console.log('🔗 2. 기존 랭킹 삭제를 요청합니다.');
                try {
                    await deleteMyRanking();
                    console.log('✅ 2. 기존 랭킹이 성공적으로 삭제되었습니다.');
                } catch (e) {
                    // 기존 랭킹이 없는 경우 실패할 수 있으므로, 경고만 하고 넘어갑니다.
                    console.warn('⚠️ 2. 삭제할 기존 랭킹이 없거나 삭제에 실패했습니다 (무시하고 진행):', e);
                }

                // 3. 책임: '최신 회원 정보'를 다시 가져옵니다. (새로운 puuid를 확보하기 위함)
                console.log('🔗 3. 새로운 puuid를 포함한 최신 회원 정보를 가져옵니다.');
                const { data: updatedProfile } = await getMyInfo();
                console.log('✅ 3. 최신 회원 정보 수신 완료.');

                // 4. 책임: 학교 인증이 되어있다면, '신규 랭킹 등록' API를 호출합니다.
                if (updatedProfile.certifiedUnivInfo && updatedProfile.riotAccount?.puuid) {
                    console.log('🔗 4. 새로운 계정으로 랭킹 등록을 요청합니다.');
                    try {
                        await registerRanking(updatedProfile.riotAccount.puuid);
                        console.log('✅ 4. 새로운 랭킹이 성공적으로 등록되었습니다.');
                    } catch (e) {
                        console.error('❌ 4. 새로운 랭킹 등록에 실패했습니다:', e);
                        // 사용자에게 실패 사실을 알려주는 것이 좋습니다.
                        alert('계정은 연동되었으나, 랭킹 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
                    }
                }

                // 5. 책임: 최종적으로 업데이트된 상태를 전역 스토어에 반영합니다.
                setUserData(updatedProfile);
                console.log('✅ 5. 모든 과정 완료. 전역 상태를 업데이트합니다.');

                localStorage.removeItem('riotLinkMode');
                alert('Riot 계정 연동이 완료되었습니다!');
                navigate('/mysetting');

            } catch (error) {
                console.error('❌ Riot 계정 연동 과정 중 오류 발생:', error);
                alert('계정 연동에 실패했습니다.');
                localStorage.removeItem('riotLinkMode');
                navigate('/mysetting');
            }
        };

        handleCallback();
    }, [provider, location.search, navigate, login, setUserData]); // 🔥 query 대신 location.search 사용

    return null;
}
