import axiosInstance from './axiosInstance';

/**
 * 평가 페이지 조회 - 모든 평가 데이터
 */
export const fetchEvaluationData = async (currentUserPuuid) => {
    const response = await axiosInstance.get('/matching/db/review', {
        withAuth: true,
    });
    const data = response.data.data;
    const receivedEvaluations = [];
    const sentEvaluations = [];

    data.forEach(group => {
        group.dtoList.forEach(item => {
            const transformedItem = transformEvaluationToFrontend(item);
            const acceptorPuuid = item.acceptor?.memberInfo?.riotAccount?.puuid;
            const requestorPuuid = item.requestor?.memberInfo?.riotAccount?.puuid;

            let otherUser = null;
            let isCurrentUserAcceptor = false;

            if (acceptorPuuid === currentUserPuuid) {
                // 현재 유저가 acceptor인 경우
                otherUser = transformUserInfo(item.requestor, item.requestorId, item.mypageId);
                isCurrentUserAcceptor = true;
            } else if (requestorPuuid === currentUserPuuid) {
                // 현재 유저가 requestor인 경우
                otherUser = transformUserInfo(item.acceptor, item.acceptorId, item.mypageId);
                isCurrentUserAcceptor = false;
            }

            if (otherUser) {
                // 받은 리뷰 처리
                const receivedReview = isCurrentUserAcceptor ? item.requestorReview : item.acceptorReview;
                if (hasReviewContent(receivedReview)) {
                    receivedEvaluations.push({
                        ...transformedItem,
                        mode: 'received',
                        otherUser: otherUser,
                        reviewData: receivedReview,
                        score: receivedReview.evaluation_score // ✅ score 필드 설정

                    });
                }

                // 보낸 리뷰 처리 (항상 표시)
                const sentReview = isCurrentUserAcceptor ? item.acceptorReview : item.requestorReview;
                const hasSentReview = hasReviewContent(sentReview);

                sentEvaluations.push({
                    ...transformedItem,
                    mode: 'sent',
                    otherUser: otherUser,
                    reviewData: sentReview,
                    reviewStatus: hasSentReview ? 'completed' : 'pending'
                });
            }
        });
    });

    return {
        received: receivedEvaluations,
        sent: sentEvaluations
    };
};

// 리뷰 내용이 있는지 확인하는 헬퍼 함수
const hasReviewContent = (review) => {
    if (!review) return false;
    return review.attitude_score !== null ||
        review.conversation_score !== null ||
        review.talent_score !== null ||
        review.evaluation_score !== null ||
        (review.memo !== null && review.memo.trim() !== '');
};

const transformEvaluationToFrontend = (item) => {
    const { mypageId, mapCode, matchingCategory, matchingStatus, reviewStatus } = item;

    return {
        id: mypageId,
        map: mapCode === 'RANK' ? '랭크' : mapCode === 'NORMAL' ? '일반' : '칼바람',
        type: matchingCategory === 'DUO' ? '듀오' : '내전',
        status: matchingStatus,
        createdAt: new Date().toLocaleDateString('ko-KR'),
        reviewStatus: reviewStatus, // 백엔드의 ReviewStatus 사용
        score: null // 나중에 받은 리뷰 처리에서 설정됨
    };
};

const transformUserInfo = (userObj, otherUserid, mypageId) => {
    if (!userObj) return {};

    const riot = userObj.memberInfo?.riotAccount || {};
    const memberInfo = userObj.memberInfo || {};
    const userInfo = userObj.userInfo || {};

    return {
        memberId: otherUserid,
        mypageId: mypageId,
        name: riot.gameName || '알 수 없음',
        tag: riot.tagLine || '',
        avatarUrl: riot.profileUrl || '',
        school: userObj.univName || '미인증',
        department: userObj.department || '미설정',
        position: (userInfo.myPosition || 'NOTHING').toLowerCase(),
        tier: memberInfo.rankInfo?.tier || 'UNRANKED',
        leaguePoint: memberInfo.rankInfo?.lp || 0,
        rank: memberInfo.rankInfo?.rank || '',
        champions: memberInfo.most3Champ || [],
        wins: memberInfo.rankInfo?.wins || 0,
        losses: memberInfo.rankInfo?.losses || 0,
    };
};

/**
 * 평가 작성/수정 - URL 수정
 */
export const submitEvaluation = async (evaluationData) => {
    const response = await axiosInstance.post(`/reviews/${evaluationData.mypageId}`, {
        attitudeScore: evaluationData.attitudeScore,
        conversationScore: evaluationData.conversationScore,
        talentScore: evaluationData.talentScore,
        evaluationScore: evaluationData.evaluationScore,
        memo: evaluationData.memo
    }, {
        withAuth: true,
    });
    return response.data;
};
