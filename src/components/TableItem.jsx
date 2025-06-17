import React, {useEffect, useState} from 'react';
import { Box, Typography, Button } from '@mui/material';
import SummonerInfo from './SummonerInfo';
import { useNavigate } from 'react-router-dom';
import TierBadge from './TierBadge';
import WinRateBar from './WinRateBar';
import ChampionIconList from './champion/ChampionIconList';
import TruncatedMessageBox from './TruncatedMessageBox';
import ScrimRequestModal from './scrim/ScrimRequestModal';
import { acceptMatchingRequest, rejectMatchingRequest } from '../apis/redisAPI';
import {formatRelativeTime} from '../utils/timeUtils';

export default function TableItem({ received, user, onRequestUpdate }) {
    const [isLoading, setIsLoading] = useState(false);
    const [scrimModalOpen, setScrimModalOpen] = useState(false);
    const [scrimModalData, setScrimModalData] = useState(null);
    const navigate = useNavigate();
    const columns = [1.5, 1, 1.5, 1.5, 2, 0.5, 1, 1.5];

    const handleAccept = async (event) => {
        event.stopPropagation();
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await acceptMatchingRequest(user.id);
            console.log('요청이 수락되었습니다.');

            const roomId = response.data.roomId;
            if (onRequestUpdate) {
                onRequestUpdate();
            }
            navigate(`/chat?tab=chat&roomId=${roomId}`);
        } catch (error) {
            console.error('수락 중 오류가 발생했습니다:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (event) => {
        event.stopPropagation();
        if (isLoading) return;

        setIsLoading(true);
        try {
            await rejectMatchingRequest(user.id);
            console.log('요청이 거절되었습니다.');
            if (onRequestUpdate) {
                onRequestUpdate();
            }
        } catch (error) {
            console.error('거절 중 오류가 발생했습니다:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (event) => {
        event.stopPropagation();
        if (isLoading) return;

        setIsLoading(true);
        try {
            await rejectMatchingRequest(user.id);
            console.log('요청이 취소되었습니다.');
            if (onRequestUpdate) {
                onRequestUpdate();
            }
        } catch (error) {
            console.error('취소 중 오류가 발생했습니다:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 내전 요청인 경우 모달 열기
    const handleScrimModalOpen = (event) => {
        event.stopPropagation();
        if (user.type === '내전') {
            // 원본 API 데이터를 모달에 전달
            setScrimModalData(user.originalData || user);
            setScrimModalOpen(true);
        }
    };

    // 행 클릭 핸들러
    const handleRowClick = () => {
        if (user.type === '내전') {
            setScrimModalData(user.originalData || user);
            setScrimModalOpen(true);
        }
    };

    const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(user.updatedAt));

    useEffect(() => {
        const interval = setInterval(() => {
            setRelativeTime(formatRelativeTime(user.updatedAt));
        }, 30000);

        return () => clearInterval(interval);
    }, [user.updatedAt]);

    return (
        <>
            <Box
                onClick={handleRowClick}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#2B2C3C',
                    px: 2,
                    py: 1,
                    borderBottom: '2px solid #12121a',
                    transition: 'background-color 0.2s',
                    '&:hover': { backgroundColor: '#2E2E38' },
                    minWidth: { xs: '900px', sm: 'auto' },
                    cursor: user.type === '내전' ? 'pointer' : 'default',
                }}
            >
                <Box sx={{ flex: columns[0], display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <SummonerInfo name={user.name} tag={user.tag} avatarUrl={user.avatarUrl} />
                </Box>
                <Box sx={{ flex: columns[1], display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                    <TierBadge tier={user.tier} score={user.leaguePoint} rank={user.rank} />
                </Box>
                <Box sx={{ flex: columns[3], textAlign: 'center', minWidth: 0 }}>
                    <WinRateBar wins={user.wins || 0} losses={user.losses || 0} />
                </Box>
                <Box sx={{ flex: columns[2], display: 'flex', justifyContent: 'center', gap: 0.5, minWidth: 0 }}>
                    <ChampionIconList championNames={user.champions} />
                </Box>
                <Box sx={{ flex: columns[4], display: 'flex', justifyContent: 'center', minWidth: 0 }}>
                    <TruncatedMessageBox message={user.memo} />
                </Box>
                <Box sx={{ flex: columns[5], textAlign: 'center', minWidth: 0 }}>
                    <Typography color="#aaa" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {user.type}
                    </Typography>
                </Box>
                <Box sx={{ flex: columns[6], textAlign: 'center', minWidth: 0 }}>
                    <Typography color="#aaa" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {relativeTime}
                    </Typography>
                </Box>
                <Box sx={{ flex: columns[7], display: 'flex', gap: 0.5, justifyContent: 'center', minWidth: 0 }}>
                    {received ? (
                        <>
                            <Button
                                variant="contained"
                                onClick={handleAccept}
                                disabled={isLoading}
                                sx={{
                                    backgroundColor: '#424254',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    px: { xs: 1, sm: 2 },
                                    py: { xs: 0.5, sm: 1 },
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    '&:disabled': {
                                        backgroundColor: '#333',
                                        color: '#666',
                                    },
                                }}
                            >
                                {isLoading ? '처리중' : '수락'}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleReject}
                                disabled={isLoading}
                                sx={{
                                    backgroundColor: '#F96568',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    px: { xs: 1, sm: 2 },
                                    py: { xs: 0.5, sm: 1 },
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    '&:disabled': {
                                        backgroundColor: '#333',
                                        color: '#666',
                                    },
                                }}
                            >
                                {isLoading ? '처리중' : '거절'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleCancel}
                            disabled={isLoading}
                            sx={{
                                backgroundColor: '#39394C',
                                color: '#fff',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                px: { xs: 1, sm: 2 },
                                py: { xs: 0.5, sm: 1 },
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                '&:disabled': {
                                    backgroundColor: '#333',
                                    color: '#666',
                                },
                            }}
                        >
                            {isLoading ? '처리중' : '취소하기'}
                        </Button>
                    )}
                </Box>
            </Box>

            {/* 내전 모달 */}
            <ScrimRequestModal
                open={scrimModalOpen}
                handleClose={() => setScrimModalOpen(false)}
                scrimData={scrimModalData}
            />
        </>
    );
}
