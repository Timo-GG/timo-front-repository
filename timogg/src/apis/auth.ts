import { axiosInstance } from '.';
import useAuthStore from '../storage/useAuthStore';

export const socialLoginCallback = async (provider: string) => {
  switch (provider) {
    case 'naver':
      window.location.href = `http://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.REACT_APP_NAVER_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_NAVER_REDIRECT_URI}&state=${process.env.REACT_APP_NAVER_STATE}`;
      break;
    case 'kakao':
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_REDIRECT_URI}&response_type=code`;
      break;
    case 'discord':
      window.location.href = `https://discord.com/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_DISCORD_REDIRECT_URI}&scope=email+identify`;
      break;
    default:
      break;
  }
};

export const socialLogin = async (
  provider: string,
  authorizationCode: string,
  state?: string,
) => {
  switch (provider) {
    case 'naver':
      try {
        const response = await axiosInstance.post('/auth/naver', {
          authorizationCode,
          state,
        });
        return response.data;
      } catch (error) {
        alert('로그인에 실패했습니다.');
        window.location.href = '/';
        throw error;
      }
    case 'kakao':
      try {
        const response = await axiosInstance.post('/auth/kakao', {
          authorizationCode,
        });
        return response.data;
      } catch (error) {
        alert('로그인에 실패했습니다.');
        window.location.href = '/';
        throw error;
      }
    case 'discord':
      try {
        const response = await axiosInstance.post('/auth/discord', {
          authorizationCode,
        });
        return response.data;
      } catch (error) {
        alert('로그인에 실패했습니다.');
        window.location.href = '/';
        throw error;
      }
    default:
      return { accessToken: '', refreshToken: '' };
  }
};

export async function logout() {
  useAuthStore.getState().logout();
  axiosInstance.defaults.headers.common['Authorization'] = '';
  console.log('로그아웃 성공');
}

export async function testLogin() {
  const response = await axiosInstance.get('/auth/test');
  axiosInstance.defaults.headers.common['Authorization'] =
    `Bearer ${response.data.accessToken}`;
  useAuthStore.setState({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });
  console.log('테스트 로그인 성공', response.data);
}

export async function getMyInfo() {
  const response = await axiosInstance.get('/members/me');
  console.log('내 정보 조회 성공', response.data);
  return response.data;
}

// 액세스 토큰 만료 시 토큰 재발급 시도
export async function refreshToken() {
  const response = await axiosInstance.post('/auth/refresh');
  axiosInstance.defaults.headers.common['Authorization'] =
    `Bearer ${response.data.accessToken}`;
  useAuthStore.setState({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });
  //리프레쉬 토큰도 만료시 로그아웃, 로그인 페이지로 이동
  if (response.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = '/';
  }
  return response;
}

//axios interceptors를 사용하여 액세스 토큰 만료 시 토큰 재발급
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      //리프레시 토큰으로 요청 날리기
      axiosInstance.defaults.headers.common['Refresh-Token'] =
        `Bearer ${useAuthStore.getState().refreshToken}`;
      originalRequest._retry = true;
      await refreshToken();
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  },
);
