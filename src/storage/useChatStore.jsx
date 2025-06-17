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

            updateMessages: (roomId, newMessages, prepend = false) =>
                set((state) => {
                    const targetRoom = state.chatList.find(room => room.id === roomId);
                    if (!targetRoom) return state;
                    const updatedMessages = prepend
                        ? [...newMessages, ...targetRoom.messages]
                        : [...targetRoom.messages, ...newMessages];
                    return {
                        chatList: state.chatList.map(room =>
                            room.id === roomId ? { ...room, messages: updatedMessages } : room
                        )
                    };
                }),

            addMessage: (roomId, message) =>
                set((state) => {
                    const chatList = state.chatList ?? [];
                    const exists = chatList.find((chat) => chat.id === roomId);
                    if (!exists) {
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

                    return {
                        chatList: chatList.map((chat) =>
                            chat.id === roomId
                                ? { ...chat, messages: [...(chat.messages ?? []), message] }
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
