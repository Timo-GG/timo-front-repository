import axios from 'axios';
import useAuthStore from '../storage/useAuthStore';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    withAuth?: boolean;
  }
}

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(config => {
  if (config.withAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
