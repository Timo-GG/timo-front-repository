import useAuthStore from "../storage/useAuthStore.jsx";
import useNotificationStore from "../storage/useNotification.jsx";
import {useEffect} from "react";

export default function NotificationListener() {
    const { accessToken } = useAuthStore();
    const addNotification = useNotificationStore((state) => state.addNotification);

    useEffect(() => {
        if (!accessToken) return;

        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const subscribeUrl = `${baseUrl}/api/v1/notifications/subscribe?token=${accessToken}`;
        const eventSource = new EventSource(subscribeUrl);

        eventSource.onopen = () => console.log('✅ SSE 연결됨');

        // ⭐️ 모든 알림을 처리할 공통 핸들러
        const handleNewNotification = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(`📩 ${event.type || 'message'} 알림 수신:`, data);

                addNotification({
                    // ✅ 1. id가 null이면, 임시로 고유한 현재 시간 값을 key로 사용
                    id: data.id || Date.now(),
                    message: data.message,
                    redirectUrl: data.redirectUrl,
                    // ✅ 2. 서버에서 받은 regDate를 Date 객체로 변환
                    time: new Date(data.regDate)
                });
            } catch (e) {
                console.error('알림 데이터 처리 오류:', e);
            }
        };

        // ⭐️ 모든 이벤트에 공통 핸들러 등록
        eventSource.onmessage = handleNewNotification; // 이름 없는 일반 메시지
        eventSource.addEventListener('DUO_ACCEPTED', handleNewNotification);
        eventSource.addEventListener('RANKING_UPDATED', handleNewNotification);
        eventSource.addEventListener('DUO_REJECTED', handleNewNotification);
        eventSource.addEventListener('RANKING_REGISTERED', handleNewNotification);

        eventSource.onerror = (err) => {
            console.error('❗ SSE 연결 오류:', err);
            eventSource.close();
        };

        return () => {
            console.log('❗ SSE 연결 해제');
            eventSource.close();
        };
    }, [accessToken, addNotification]);

    return null;
}