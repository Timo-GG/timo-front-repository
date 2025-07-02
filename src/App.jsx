import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import SearchPage from './pages/SearchPage';
import MySettingPage from './pages/MySettingPage';
import RankingPage from './pages/RankingPage';
import MyPage from './pages/MyPage';
import ScrimPage from './pages/ScrimPage';
import DuoPage from './pages/DuoPage';
import SignupPage from './pages/SignupPage';
import ProfileSetup from './pages/ProfileSetupPage';
import TestPage from './pages/TestPage';
import NotificationListener from './socket/NotificationListener';
import AuthCallback from './pages/AuthCallback';
import useAuthStore from './storage/useAuthStore';
import { connectSocket, disconnectSocket } from './socket/socket';
import useOnlineStore from './storage/useOnlineStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Footer from "./components/Footer.jsx";
import TermsModal from './components/TermsModal';

// Router 내부에서 사용할 컴포넌트 분리
function AppContent() {
    const { accessToken, userData, initializeAuth } = useAuthStore();
    const { setOnlineCount } = useOnlineStore();
    const socketRef = useRef(null);
    const isJoinedRef = useRef(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isPrivacyModalOpen = location.pathname === '/privacy';
    const isTermsModalOpen = location.pathname === '/tos';

    const closeModal = () => {
        if (isPrivacyModalOpen) {
            navigate('/'); // 개인정보 처리방침 모달 닫기
        } else if (isTermsModalOpen) {
            navigate('/'); // 이용약관 모달 닫기
        }
    };

    useEffect(() => {
        initializeAuth();
    }, []);

    useEffect(() => {
        const socket = connectSocket(accessToken);
        socketRef.current = socket;
        isJoinedRef.current = false;

        // 온라인 카운트 리스너 등록
        socket.on('online_count', (data) => {
            if (data && typeof data.count === 'number') {
                setOnlineCount(data.count);
            }
        });

        // 연결 완료 후 즉시 처리
        socket.on('connect', () => {
            console.log('✅ 소켓 연결 완료');

            // ✅ 연결 즉시 현재 온라인 카운트 요청 (인증 여부 무관)
            socket.emit('request_online_count');

            // ✅ 인증된 사용자라면 join_online 이벤트 발송 (선택적)
            if (accessToken && userData?.memberId && !isJoinedRef.current) {
                socket.emit('join_online', { memberId: userData.memberId });
                isJoinedRef.current = true;
            }
        });

        // 연결 해제 시 처리
        socket.on('disconnect', (reason) => {
            console.log('소켓 연결 해제:', reason);
            isJoinedRef.current = false;
        });

        // 정리 함수
        return () => {
            console.log('소켓 정리 시작');

            if (socketRef.current && socketRef.current.connected) {
                if (accessToken && userData?.memberId && isJoinedRef.current) {
                    console.log('leave_online 이벤트 발송:', userData.memberId);
                    socketRef.current.emit('leave_online', { memberId: userData.memberId });
                }
            }

            // 이벤트 리스너 제거
            if (socketRef.current) {
                socketRef.current.off('online_count');
                socketRef.current.off('connect');
                socketRef.current.off('disconnect');
            }

            disconnectSocket();
            socketRef.current = null;
            isJoinedRef.current = false;
        };
    }, [accessToken, userData?.memberId]);

    function ChatRouteWrapper() {
        const location = useLocation();
        const searchParams = new URLSearchParams(location.search);
        const roomId = parseInt(searchParams.get('roomId'), 10);
        const defaultTab = searchParams.get('tab') === 'chat' ? 2 : 0;
        return <MyPage defaultTab={defaultTab} initialRoomId={roomId} />;
    }

    return (
        <>
            <Header />
            <NotificationListener />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/mysetting" element={<MySettingPage />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/duo" element={<DuoPage />} />
                <Route path="/scrim" element={<ScrimPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/auth/callback/:provider" element={<AuthCallback />} />
                <Route path="/chat" element={<ChatRouteWrapper />} />
            </Routes>
            <Footer />
            <TermsModal
                open={isPrivacyModalOpen}
                onClose={closeModal}
                type="privacy"
            />
            <TermsModal
                open={isTermsModalOpen}
                onClose={closeModal}
                type="terms"
            />
        </>
    );
}

function App() {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AppContent />
            </Router>
        </QueryClientProvider>
    );
}

export default App;
