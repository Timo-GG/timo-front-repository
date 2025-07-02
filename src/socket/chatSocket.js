// src/socket/chatSocket.js
import { getSocket } from './socket';
import useChatStore from '../storage/useChatStore';
import useAuthStore from '../storage/useAuthStore';

let isInitialized = false;

export const initializeChatSocket = () => {
    const socket = getSocket();
    if (!socket || isInitialized) return;

    // 기존 리스너 제거
    socket.off('receive_message');
    socket.off('leave');

    // 1. 메시지 수신
    socket.on('receive_message', (data) => {
        console.log('[💬 메시지 도착] 원본 데이터:', data);
        const { roomId, payload } = data;
        const { userData } = useAuthStore.getState();

        if (!payload || !roomId) {
            console.error('[💬 메시지 수신 오류] payload 또는 roomId가 없습니다:', data);
            return;
        }

        const message = {
            type: payload.senderId === userData?.memberId ? 'sent' : 'received',
            messageId: payload.messageId,
            text: payload.content,
            timestamp: payload.timestamp || new Date().toISOString(),
        };

        console.log('[💬 변환된 메시지]', message);
        useChatStore.getState().addMessage(roomId, message);
    });

    // 2. 시스템 알림: 퇴장 등
    socket.on('leave', (data) => {
        console.log('[❌ 퇴장 이벤트]', data);
    });

    isInitialized = true;
    console.log('[💬 채팅 소켓 초기화 완료]');
};

export const joinChatRoom = (roomId) => {
    const socket = getSocket();
    if (!socket) {
        console.error('[🚪 채팅방 입장 실패] 소켓이 없습니다');
        return;
    }

    // ✅ 소켓 연결 상태 확인
    console.log('[🔍 소켓 상태 확인]', {
        connected: socket.connected,
        id: socket.id,
        roomId: roomId
    });

    if (!socket.connected) {
        console.error('[🚪 채팅방 입장 실패] 소켓이 연결되지 않았습니다');
        return;
    }

    console.log(`[🚪 채팅방 입장] roomId: ${roomId}`);
    socket.emit('join_room', { roomId });
};

export const sendMessage = ({ roomId, content }) => {
    const socket = getSocket();
    if (!socket) return;

    console.log('[📤 메시지 전송]', { roomId, content });
    socket.emit('send_message', { roomId, content });
};

export const sendReadReceipt = ({ roomId, messageId }) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('read_message', { roomId, messageId });
};

export const leaveChatRoom = ({ roomId }) => {
    const socket = getSocket();
    if (!socket) return;

    console.log(`[🚪 채팅방 퇴장] roomId: ${roomId}`);
    socket.emit('leave_room', { roomId });
};

// 초기화 상태 리셋 (필요시)
export const resetChatSocket = () => {
    isInitialized = false;
};
