import axiosInstance from './axiosInstance';

// FCM 토큰 저장
export const saveFCMToken = async (token) => {
    const response = await axiosInstance.post('/fcm/token', { token }, { withAuth: true });
    return response.data;
};

// FCM 토큰 삭제
export const deleteFCMToken = async (token) => {
    const response = await axiosInstance.delete('/fcm/token', {
        data: { token },
        withAuth: true
    });
    return response.data;
};