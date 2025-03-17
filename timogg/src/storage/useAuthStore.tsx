import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserData = {
  email?: string;
  id?: number;
  nickname?: string;
  playerName?: string;
  playerTag?: string;
  username?: string;
};

type AuthStore = {
  isLoggedIn: boolean;
  userData: UserData;
  accessToken?: string;
  refreshToken?: string;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUserData: (userData: Partial<UserData>) => void;
  setUserDataValue: (key: keyof UserData, value: any) => void;
  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
};

const useAuthStore = create(
  persist<AuthStore>(
    set => ({
      isLoggedIn: false,
      userData: {},
      accessToken: '',
      refreshToken: '',
      login: (accessToken: string, refreshToken: string) =>
        set({
          isLoggedIn: true,
          accessToken: accessToken,
          refreshToken: refreshToken,
        }),
      logout: () =>
        set({
          isLoggedIn: false,
          userData: {},
          accessToken: '',
          refreshToken: '',
        }),
      setUserData: userData => set({ userData }),
      setUserDataValue: (key, value) =>
        set(state => ({
          userData: {
            ...state.userData,
            [key]: value,
          },
        })),
      setAccessToken: accessToken => set({ accessToken }),

      setRefreshToken: refreshToken => set({ refreshToken }),
    }),
    {
      name: 'userInfoStorage',
    },
  ),
);

export default useAuthStore;
