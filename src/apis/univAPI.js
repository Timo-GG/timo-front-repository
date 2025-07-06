import axiosInstance from './axiosInstance';

export const requestUnivVerification = async ({ univName, univEmail }) => {
  const response = await axiosInstance.post(
      '/auth/univ/request',
      { univName, univEmail },
      { withAuth: true }
  );
  return response.data;
};

export const verifyUnivCode = async (code, { univName, univEmail }) => {
  const response = await axiosInstance.post(
      `/auth/univ/verify/me?code=${code}`,
      { univName, univEmail },
      { withAuth: true }
  );
  return response.data;
};

export const checkUniv = async ({ univName }) => {
  const response = await axiosInstance.post(
      '/auth/univ/checkUniv',
      { univName },
      { withAuth: true }
  );
  return response.data;
};

export const deleteUnivAccount = async () => {
  const res = await axiosInstance.delete('/auth/univ/delete/me', { withAuth: true });
  return res.data;
};

export const updateUnivAccount = async (payload) => {
  const res = await axiosInstance.put(
      '/members/univ',
      payload,
      { withAuth: true }
  );
  return res.data;
};
