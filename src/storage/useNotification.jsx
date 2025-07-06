import { create } from 'zustand';

const useNotificationStore = create((set) => ({
    notifications: [],
    addNotification: (newNoti) => set((state) => {
        // 스토어에 추가하려는 알림과 같은 id를 가진 알림이 이미 있는지 확인합니다.
        // SSE로 받는 실시간 알림은 id가 null일 수 있으므로, id가 있을 때만 체크합니다.
        const isDuplicate = newNoti.id != null && state.notifications.some(noti => noti.id === newNoti.id);

        if (!isDuplicate) {
            return { notifications: [newNoti, ...state.notifications] };
        }

        return state;
    }),

    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((noti) => noti.id !== id),
    })),

    clearNotifications: () => set({ notifications: [] }),
}));

export default useNotificationStore;