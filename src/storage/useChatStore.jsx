import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useChatStore = create(
    persist(
        (set, get) => ({
            chatList: [],
            currentRoomId: null,

            setChatList: (newList) => set({ chatList: newList }),

            // 안전한 채팅방 삭제 함수 추가
            removeChatRoom: (roomId) => set((state) => {
                const currentList = state.chatList || [];
                const filteredList = currentList.filter(chat => chat.id !== roomId);
                console.log('채팅방 삭제 전:', currentList.length, '삭제 후:', filteredList.length);
                return { chatList: filteredList };
            }),

            // useChatStore.js 수정
            updateMessages: (roomId, newMessages, prepend = false) =>
                set((state) => {
                    console.log(`[updateMessages] 룸 ${roomId}, 새 메시지 ${newMessages.length}개, prepend: ${prepend}`);

                    const targetRoom = state.chatList.find(room => room && room.id === roomId);
                    if (!targetRoom) {
                        console.warn(`[updateMessages] 룸 ${roomId}을 찾을 수 없음`);
                        // ✅ 룸이 없으면 새로 생성
                        return {
                            chatList: [...state.chatList, {
                                id: roomId,
                                messages: newMessages.sort((a, b) => {
                                    if (!a?.timestamp || !b?.timestamp) return 0;
                                    return new Date(a.timestamp) - new Date(b.timestamp);
                                }),
                                user: { name: '알 수 없음', tag: '', avatarUrl: '', school: '' },
                                lastMessage: '',
                                lastTime: '',
                                lastTimeFormatted: '',
                                unreadCount: 0
                            }]
                        };
                    }

                    const existingMessages = targetRoom.messages || [];
                    let updatedMessages;

                    if (prepend) {
                        // ✅ 페이징 시 중복 제거 후 앞에 추가
                        const filteredNew = newMessages.filter(newMsg =>
                            !existingMessages.some(existing =>
                                existing?.timestamp === newMsg?.timestamp
                            )
                        );
                        updatedMessages = [...filteredNew, ...existingMessages];
                    } else {
                        // 최신 메시지 동기화 시 중복 제거하여 병합
                        const combined = [...existingMessages];

                        newMessages.forEach(newMsg => {
                            const exists = combined.some(existing =>
                                existing && newMsg &&
                                existing.timestamp === newMsg.timestamp &&
                                existing.text === newMsg.text &&
                                existing.type === newMsg.type
                            );
                            if (!exists) {
                                combined.push(newMsg);
                            }
                        });

                        // 시간순 정렬
                        updatedMessages = combined.sort((a, b) => {
                            if (!a?.timestamp || !b?.timestamp) return 0;
                            return new Date(a.timestamp) - new Date(b.timestamp);
                        });
                    }

                    console.log(`[updateMessages] 최종 메시지 수: ${updatedMessages.length}`);

                    return {
                        chatList: state.chatList.map(room =>
                            room && room.id === roomId ? { ...room, messages: updatedMessages } : room
                        )
                    };
                }),

            // 중복 제거 로직이 추가된 addMessage 함수
            addMessage: (roomId, message) =>
                set((state) => {
                    const chatList = state.chatList ?? [];
                    const existingRoomIndex = chatList.findIndex((chat) => chat && chat.id === roomId);

                    if (existingRoomIndex === -1) {
                        // 새 채팅방 생성
                        const newRoom = {
                            id: roomId,
                            messages: [message],
                            lastMessage: message.text,
                            lastTime: message.timestamp,
                            lastMessageTimestamp: new Date(message.timestamp).getTime(),
                        };

                        // 최신순으로 맨 앞에 추가
                        return {
                            chatList: [newRoom, ...chatList]
                        };
                    }

                    // 기존 채팅방에서 중복 메시지 검사
                    const existingRoom = chatList[existingRoomIndex];
                    const existingMessages = existingRoom.messages || [];

                    // 중복 메시지 검사 로직
                    const isDuplicate = existingMessages.some(existingMsg => {
                        // messageId가 있는 경우 우선 비교
                        if (existingMsg.messageId && message.messageId) {
                            return existingMsg.messageId === message.messageId;
                        }

                        // messageId가 없는 경우 내용과 시간으로 비교
                        if (existingMsg.text === message.text &&
                            existingMsg.type === message.type) {
                            // 시간차가 1초 이내인 경우 중복으로 판단
                            const timeDiff = Math.abs(
                                new Date(existingMsg.timestamp).getTime() -
                                new Date(message.timestamp).getTime()
                            );
                            return timeDiff < 1000;
                        }

                        return false;
                    });

                    if (isDuplicate) {
                        console.log('[중복 메시지 감지] 추가하지 않음:', message.text);
                        return state; // 상태 변경 없이 반환
                    }

                    // 기존 채팅방 업데이트
                    const updatedChatList = [...chatList];

                    // 메시지 추가 및 마지막 메시지 정보 업데이트
                    const updatedRoom = {
                        ...existingRoom,
                        messages: [...existingMessages, message],
                        lastMessage: message.text,
                        lastTime: message.timestamp,
                        lastMessageTimestamp: new Date(message.timestamp).getTime(),
                    };

                    // 해당 채팅방을 배열에서 제거하고 맨 앞에 추가 (최신순 유지)
                    updatedChatList.splice(existingRoomIndex, 1);
                    updatedChatList.unshift(updatedRoom);

                    return {
                        chatList: updatedChatList
                    };
                }),

        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => localStorage),
            // 상태 복원 시 로그 추가
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('채팅 스토어 복원 실패:', error);
                } else {
                    console.log('채팅 스토어 복원 성공:', state?.chatList?.length || 0, '개 채팅방');
                }
            },
        }
    )
);

export default useChatStore;
