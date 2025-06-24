// src/apis/chatAPI.js
import axiosInstance from './axiosInstance';

// 채팅방 목록 조회
export const fetchChatRooms = async () => {
    const res = await axiosInstance.get('/chat/rooms', {
        withAuth: true,
    });

    console.log('[fetchChatRooms] 원본 API 응답:', res.data);

    // APIDataResponse<List<ChatRoomResponse>> 구조 처리
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
        return { data: res.data.data };
    }

    // 직접 배열이 반환되는 경우 (fallback)
    if (Array.isArray(res.data)) {
        return { data: res.data };
    }

    console.warn('[fetchChatRooms] 예상과 다른 응답 구조:', res.data);
    return { data: [] };
};

// 채팅방 메시지 조회 (페이징)
export const fetchChatMessages = async (roomId, page = 0) => {
    const res = await axiosInstance.get(`/chat/rooms/${roomId}/messages?page=${page}`, {
        withAuth: true,
    });

    // List<ChatMessageDTO> 직접 반환
    return Array.isArray(res.data) ? res.data : [];
};

// 채팅방 안 읽은 메시지 수 조회
export const fetchUnreadCount = async (roomId) => {
    const res = await axiosInstance.get(`/chat/rooms/${roomId}/unread`, {
        withAuth: true,
    });
    return res.data; // APIDataResponse<Integer>
};

// 채팅방 나가기
export const leaveChatRoom = async (roomId) => {
    const res = await axiosInstance.post(`/chat/rooms/${roomId}/leave`, {}, {
        withAuth: true,
    });
    return res.data; // APIDataResponse<Void>
};

// 특정 시간 이후 메시지 조회
export const fetchMessagesSince = async (roomId, since) => {
    const res = await axiosInstance.get(`/chat/rooms/${roomId}/messages/since?since=${since}`, {
        withAuth: true,
    });
    return Array.isArray(res.data) ? res.data : [];
};

