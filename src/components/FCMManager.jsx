import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import useAuthStore from '../storage/useAuthStore';
import { saveFCMToken } from '../apis/fcmAPI';

const FCMManager = () => {
    const { userData, accessToken } = useAuthStore();
    const [showNotificationButton, setShowNotificationButton] = useState(false);
    const [deniedCount, setDeniedCount] = useState(0);
    const [lastDeniedTime, setLastDeniedTime] = useState(null);

    useEffect(() => {
        if (!userData?.memberId || !accessToken) return;

        // 로컬 스토리지에서 거절 이력 확인
        const storedDeniedCount = localStorage.getItem('fcm-denied-count') || 0;
        const storedLastDenied = localStorage.getItem('fcm-last-denied');

        setDeniedCount(parseInt(storedDeniedCount));
        setLastDeniedTime(storedLastDenied);

        // 알림 권한 상태 확인
        if (Notification.permission === 'default') {
            setShowNotificationButton(true);
        } else if (Notification.permission === 'denied') {
            // 거절된 경우 재표시 조건 확인
            const shouldShowAgain = checkShouldShowAgain(storedDeniedCount, storedLastDenied);
            setShowNotificationButton(shouldShowAgain);
        } else if (Notification.permission === 'granted') {
            requestFCMToken();
        }
    }, [userData?.memberId, accessToken]);

    const checkShouldShowAgain = (count, lastDenied) => {
        if (count === 0) return true; // 첫 번째는 항상 표시
        if (!lastDenied) return true;

        const now = Date.now();
        const lastDeniedTime = new Date(lastDenied).getTime();
        const daysPassed = (now - lastDeniedTime) / (1000 * 60 * 60 * 24);

        // 거절 횟수에 따른 재표시 간격
        if (count === 1 && daysPassed >= 1) return true;      // 1일 후
        if (count === 2 && daysPassed >= 7) return true;      // 1주일 후
        if (count >= 3 && daysPassed >= 30) return true;      // 1개월 후

        return false;
    };

    const handleNotificationRequest = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setShowNotificationButton(false);
                await requestFCMToken();
                // 성공 시 거절 이력 초기화
                localStorage.removeItem('fcm-denied-count');
                localStorage.removeItem('fcm-last-denied');
            } else {
                // 거절 시 이력 저장
                const newCount = deniedCount + 1;
                setDeniedCount(newCount);
                setLastDeniedTime(new Date().toISOString());

                localStorage.setItem('fcm-denied-count', newCount.toString());
                localStorage.setItem('fcm-last-denied', new Date().toISOString());

                setShowNotificationButton(false);

                // 사용자에게 안내 메시지
                if (newCount === 1) {
                    alert('알림을 허용하시면 실시간으로 메시지를 받을 수 있습니다.');
                } else {
                    alert('브라우저 설정에서 언제든지 알림을 허용할 수 있습니다.');
                }
            }
        } catch (error) {
            console.error('알림 권한 요청 실패:', error);
        }
    };

    const requestFCMToken = async () => {
        try {
            // Service Worker 등록 확인
            const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
            console.log('Service Worker 등록 상태:', registration);

            const token = await getToken(messaging, {
                vapidKey: 'BIsRY-4xcw8XtbG6V1df8DJowCRznf6I1P9LyiSRWnBySxikgZ6uhxqS8od7qN92R6ypeaYD6smH0GZO572WkqQ'
            });

            if (token) {
                try {
                    await saveFCMToken(token);
                    console.log('FCM 토큰 저장 완료:', token);
                } catch (error) {
                    console.error('FCM 토큰 저장 실패:', error);
                }
            }
        } catch (error) {
            console.error('FCM 토큰 생성 실패:', error);
        }
    };

    // 포그라운드 메시지 처리
    useEffect(() => {
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('포그라운드 메시지 수신:', payload);

            // 커스텀 알림 표시
            if (payload.notification) {
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: '/timo-logo-notification.png',
                    tag: 'chat-notification'
                });
            }
        });

        return () => unsubscribe();
    }, []);

    // 버튼 텍스트를 거절 횟수에 따라 변경
    const getButtonText = () => {
        if (deniedCount === 0) return '알림 허용하기';
        if (deniedCount === 1) return '알림 다시 허용하기';
        return '알림 설정하기';
    };

    const getDescriptionText = () => {
        if (deniedCount === 0) return '새로운 채팅 메시지를 놓치지 마세요';
        if (deniedCount === 1) return '실시간 알림으로 더 빠른 소통이 가능합니다';
        return '브라우저 설정에서 알림을 허용해주세요';
    };

    if (showNotificationButton) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '12px',
                padding: '16px 20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                }}>
                    <div style={{
                        fontSize: '24px'
                    }}>🔔</div>
                    <div>
                        <div style={{
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '4px'
                        }}>
                            실시간 알림 받기
                        </div>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '12px'
                        }}>
                            {getDescriptionText()}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleNotificationRequest}
                    style={{
                        width: '100%',
                        backgroundColor: '#00D2FF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0, 210, 255, 0.3)'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#00B8E6';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 210, 255, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#00D2FF';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 210, 255, 0.3)';
                    }}
                >
                    {getButtonText()}
                </button>
            </div>
        );
    }

    return null;
};

export default FCMManager;
