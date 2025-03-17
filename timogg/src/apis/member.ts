import { axiosInstance } from '.';

export const myInfo = async () => {
  try {
    const res = await axiosInstance.get('/members/me', {
      withAuth: true,
    });

    return res.data.data.memberProfile;
  } catch (error) {
    throw error;
  }
};

export const getDuoInfo = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/members/${id}`, {
      withAuth: true,
    });

    return res.data.data;
  } catch (error) {
    throw error;
  }
};

export const checkSummoner = async (gameName: string, tagLine: string) => {
  try {
    const res = await axiosInstance.get('/members/player/verify', {
      params: {
        gameName,
        tagLine,
      },
    });

    return res.data.data;
  } catch (error) {
    throw error;
  }
};

export const checkNickname = async (nickname: string) => {
  try {
    const res = await axiosInstance.get('/members/nickname/check', {
      params: {
        nickname,
      },
    });

    return res.data.data;
  } catch (error) {
    throw error;
  }
};

export const putMyInfo = async (
  nickname: string,
  playerName: string,
  playerTag: string,
) => {
  try {
    const res = await axiosInstance.put(
      '/members/me/info',
      {
        nickname,
        playerName,
        playerTag,
      },
      {
        withAuth: true,
      },
    );

    return res.data.data;
  } catch (error) {
    throw error;
  }
};
