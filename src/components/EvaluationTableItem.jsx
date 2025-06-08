import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SummonerInfo from './SummonerInfo';
import PositionIcon from './PositionIcon';
import Rating from '@mui/material/Rating';

export default function EvaluationTableItem({ user, evaluation, status, onEvaluate }) {
    const columns = [1.5, 1, 1, 1.5, 1.5, 1, 1.5, 1];

    const handleEvaluateClick = (event) => {
        event.stopPropagation();
        onEvaluate({
            ...user,
            evaluationId: evaluation.id,
            mode: evaluation.mode,
            reviewData: evaluation.reviewData,
            reviewStatus: evaluation.reviewStatus
        });
    };

    // ✅ 받은 평가 클릭 핸들러 추가
    const handleReceivedEvaluationClick = (event) => {
        event.stopPropagation();
        onEvaluate({
            ...user,
            evaluationId: evaluation.id,
            mode: 'received',
            reviewData: evaluation.reviewData,
            reviewStatus: 'completed' // 받은 평가는 항상 완료 상태
        });
    };

    // ✅ 완료된 보낸 평가 클릭 핸들러 추가
    const handleCompletedSentEvaluationClick = (event) => {
        event.stopPropagation();
        onEvaluate({
            ...user,
            evaluationId: evaluation.id,
            mode: 'sent',
            reviewData: evaluation.reviewData,
            reviewStatus: 'completed'
        });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#2B2C3C',
                px: 2,
                py: 1,
                borderBottom: '1px solid #12121a',
                transition: 'background-color 0.2s',
                '&:hover': {
                    backgroundColor: '#2E2E38',
                },
                // ✅ 받은 평가일 때 클릭 가능하도록 커서 설정
                cursor: (status === '받은 평가' || evaluation.reviewStatus === 'completed') ? 'pointer' : 'default',
            }}
            // ✅ 받은 평가일 때 전체 행 클릭 가능
            onClick={
                status === '받은 평가'
                    ? handleReceivedEvaluationClick
                    : evaluation.reviewStatus === 'completed'
                        ? handleCompletedSentEvaluationClick
                        : undefined
            }
        >
            {/* 소환사 */}
            <Box sx={{ flex: columns[0], display: 'flex', alignItems: 'center', gap: 1 }}>
                <SummonerInfo
                    name={user.name}
                    tag={user.tag}
                    avatarUrl={user.avatarUrl}
                />
            </Box>
            {/* 포지션 */}
            <Box sx={{ flex: columns[1], textAlign: 'center' }}>
                <PositionIcon position={user.position} iconSize={20} />
            </Box>
            {/* 맵 */}
            <Box sx={{ flex: columns[2], textAlign: 'center' }}>
                <Typography color="#aaa" sx={{ fontSize: 12 }}>
                    {evaluation.map}
                </Typography>
            </Box>
            {/* 대학교 */}
            <Box sx={{ flex: columns[3], textAlign: 'center' }}>
                <Typography color="#aaa" sx={{ fontSize: 12 }}>
                    {user.school}
                </Typography>
            </Box>
            {/* 학과 */}
            <Box sx={{ flex: columns[4], textAlign: 'center' }}>
                <Typography color="#aaa" sx={{ fontSize: 12 }}>
                    {user.department}
                </Typography>
            </Box>
            {/* 분류 (ex. 듀오/내전) */}
            <Box sx={{ flex: columns[5], textAlign: 'center' }}>
                <Typography color="#aaa" sx={{ fontSize: 12 }}>
                    {evaluation.type}
                </Typography>
            </Box>
            {/* 등록 일시 */}
            <Box sx={{ flex: columns[6], textAlign: 'center' }}>
                <Typography color="#aaa" sx={{ fontSize: 12 }}>
                    {evaluation.createdAt}
                </Typography>
            </Box>
            {/* 평가 상태 버튼 */}
            <Box sx={{ flex: columns[7], display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {status === '받은 평가' ? (
                    <Rating
                        value={evaluation.reviewData?.evaluation_score || 0} // ✅ 리뷰 데이터에서 점수 가져오기
                        readOnly
                        size="small"
                        sx={{
                            color: '#42E6B5',
                            '& .MuiRating-icon': {
                                fontSize: '1.2rem',
                            },
                        }}
                    />
                ) : (
                    evaluation.reviewStatus === 'pending' ? (
                        <Button
                            variant="text"
                            onClick={handleEvaluateClick}
                            sx={{ color: '#42E6B5', fontWeight: 'bold' }}
                        >
                            평가하기
                        </Button>
                    ) : (
                        <Typography color="#666" sx={{ fontSize: 13}}>
                            평가 완료
                        </Typography>
                    )
                )}
            </Box>
        </Box>
    );
}
