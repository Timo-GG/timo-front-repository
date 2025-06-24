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


            addMessage: (roomId, message) =>
                set((state) => {
                    const chatList = state.chatList ?? [];
                    const existingRoom = chatList.find((chat) => chat && chat.id === roomId);

                    if (!existingRoom) {
                        return {
                            chatList: [
                                ...chatList,
                                {
                                    id: roomId,
                                    messages: [message],
                                },
                            ],
                        };
                    }

                    // 중복 메시지 체크
                    const existingMessages = existingRoom.messages || [];
                    const isDuplicate = existingMessages.some(existing =>
                        existing && message &&
                        existing.timestamp === message.timestamp &&
                        existing.text === message.text &&
                        existing.type === message.type
                    );

                    if (isDuplicate) {
                        console.log('[중복 메시지 무시]', message.text);
                        return state; // 중복이면 상태 변경 없음
                    }

                    return {
                        chatList: chatList.map((chat) =>
                            chat && chat.id === roomId
                                ? {
                                    ...chat,
                                    messages: [...existingMessages, message].sort((a, b) => {
                                        if (!a?.timestamp || !b?.timestamp) return 0;
                                        return new Date(a.timestamp) - new Date(b.timestamp);
                                    })
                                }
                                : chat
                        ),
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
