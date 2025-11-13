import axiosInstance from './axiosInstance';

/**
 * @param {{ gameName: string; tagLine: string; }} dto
 * @returns {Promise<{avatarUrl, rankInfo, most3Champ}>}
 */
export const fetchCompactPlayerHistory = async (dto) => {
    const response = await axiosInstance.post('/riot/compact-history', dto);
    const data = response.data.data;

    return {
        avatarUrl: data.avatarUrl,
        rankInfo: data.rankInfo,
        most3Champ: data.most3Champ,
    };
};