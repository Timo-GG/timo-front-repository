import axiosInstance from './axiosInstance';

export const fetchRankingList = async (page = 1, size = 10) => {
    const offset = (page - 1) * size;
    const response = await axiosInstance.get('/ranking/top', {
        params: { offset, limit: size },
    });
    const { list, totalCount } = response.data.data;

    return {
        list: list.map((item, index) => ({
            ranking: offset + index + 1,
            name: item.gameName,
            avatarUrl: item.profileIconUrl || '/assets/default.png',
            tag: item.tagLine,
            verificationType: item.verificationType,
            position: item.position?.toLowerCase() || 'unknown',
            tier: item.tier.toLowerCase() || 'unknown',
            score: item.score,
            rank: item.rank,
            lp: item.lp,
            university: item.university,
            department: item.department,
            champions: item.mostChampions,
            mbti: item.mbti,
            gender: item.gender,
            message: item.memo || '',
            time: '방금 전',
            wins: item.wins,
            losses: item.losses,
        })),
        totalCount,
    };
};

export const fetchRankingByUniversity = async (university, page = 1, size = 10) => {
    const offset = (page - 1) * size;
    const response = await axiosInstance.get('/ranking/top/univ', {
        params: { university, offset, limit: size },
        withAuth: true,
    });

    const { list, totalCount } = response.data.data;

    return {
        list: list.map((item, index) => ({
            ranking: offset + index + 1,
            name: item.gameName,
            avatarUrl: item.profileIconUrl || '/assets/default.png',
            tag: item.tagLine,
            verificationType: item.verificationType,
            position: item.position?.toLowerCase() || 'unknown',
            tier: item.tier.toLowerCase() || 'unknown',
            score: item.score,
            rank: item.rank,
            lp: item.lp,
            university: item.university,
            department: item.department,
            champions: item.mostChampions,
            mbti: item.mbti,
            gender: item.gender,
            message: item.memo || '',
            time: '방금 전',
            wins: item.wins,
            losses: item.losses,
        })),
        totalCount,
    };
};


export const updateRankingInfo = async (dto) => {
    await axiosInstance.post('/ranking/update', dto, { withAuth: true });
};

export async function fetchMyRankingInfo() {
    const response = await axiosInstance.get('/ranking/me', {withAuth: true});
    return response.data.data;
}

export const deleteMyRanking = () => {
    return axiosInstance.delete(
        '/ranking',    // baseURL에 /api/v1 가 이미 붙어 있다고 가정
        {
            withAuth: true,
        }
    );
};

export const fetchRankingPosition = async (name, tag) => {
    const response = await axiosInstance.get('/ranking/position', {
        params: { name, tag },
    });

    return response.data.data; // 실제 순위 (int)
};

