import { axiosInstance } from '.';
import useAuthStore from '../storage/useAuthStore';

export const socialLoginCallback = async (provider: string) => {
  switch (provider) {
    case 'naver':
      window.location.href = `http://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.REACT_APP_NAVER_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_NAVER_REDIRECT_URI}&state=${process.env.REACT_APP_NAVER_STATE}`;
      break;
    case 'kakao':
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_RECIRECT_URI}&response_type=code`;
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
      break;
    default:
      return { accessToken: '', refreshToken: '' };
  }
};

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

// 리프레시 토큰 만료 시 토큰 재발급
export async function refreshToken() {
  const response = await axiosInstance.post('/auth/refresh');
  axiosInstance.defaults.headers.common['Authorization'] =
    `Bearer ${response.data.accessToken}`;
  useAuthStore.setState({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });
  console.log('토큰 재발급 성공', response.data);
}

//axios interceptors를 사용하여 토큰 만료 시 토큰 재발급
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshToken();
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  },
);
