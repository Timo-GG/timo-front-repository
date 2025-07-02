import axiosInstance from './axiosInstance';


export const verifyAccount = async ({ accountName, tagLine }) => {
  const response = await axiosInstance.post(
    '/members/player/verify',
    {
      gameName: accountName,
      tagLine: tagLine,
    },
    {withAuth: true}
  );
  return response.data;
};

export const updateUsername = async (newName) => {
  const res = await axiosInstance.put("/members/username", newName, {
    withAuth: true,
    headers: { 'Content-Type': 'text/plain' },
  });
  return res.data;
};

export const resetRiotAccount = () => {
  return axiosInstance.post('/members/riot/reset', null,{
    withAuth: true,
  });
};

export const registerRanking = async (puuid) => {
  const res = await axiosInstance.post(
      '/ranking', // "/api/v1"는 이미 axiosInstance에 베이스 URL로 있을 것으로 가정
      null,
      {
        params: { puuid },
        withAuth: true,
      }
  );
  return res.data;
};

export const fetchRecentMatchFull = async (gameName, tagLine) => {
    const response = await axiosInstance.post('/riot/recent-match', {
        gameName,
        tagLine,
    });
    return response.data.data;
};

export const updateUserAgreement = async () => {
    const response = await axiosInstance.put('/members/userAgreement', null, {
        withAuth: true,
    });
    return response.data;
}

export const deleteAccount = async () => {
    const response = await axiosInstance.delete('/members/userAgreement/soft', {
        withAuth: true,
    });
    return response.data;
}

export const linkRiotAccount = async (authorizationCode) => {
    const response = await axiosInstance.post('/members/riot/link', {
        authorizationCode
    }, { withAuth: true });
    return response.data;
};

// 알림 이메일 설정 업데이트
export const updateNotificationEmail = async (notificationEmail) => {
    const response = await axiosInstance.put(
        '/members/notification-email',
        { notificationEmail },
        { withAuth: true }
    );
    return response.data;
};

// 알림 이메일 설정 조회
export const getNotificationEmailSettings = async () => {
    const response = await axiosInstance.get(
        '/members/notification-email',
        { withAuth: true }
    );
    return response.data;
};

export const updateVerificationType = async (verificationType) => {
    const response = await axiosInstance.post('/members/verification-type', null, {
        params: { verificationType },
        withAuth: true
    });
    return response.data;
};