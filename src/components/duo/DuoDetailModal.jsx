import React from 'react';
import {
    Dialog,
    Box,
    Typography,
    IconButton,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import SummonerInfo from '../SummonerInfo';
import TierBadge from '../TierBadge';
import ChampionIconList from '../champion/ChampionIconList';
import PositionIcon from '../PositionIcon';

export default function DuoDetailModal({
                                           open,
                                           handleClose,
                                           partyData,
                                           isMyPageView = false
                                       }) {
    const theme = useTheme();
    if (!partyData) return null;
    const genderDisplay = {
        MALE: '남자',
        FEMALE: '여자',
        SECRET: '비밀',
    };

    const playStyleDisplay = {
        fun: '즐겜',
        hardcore: '빡겜',
        none: '상관없음'
    };

    const statusDisplay = {
        first: "첫판",
        continue: "계속 플레이",
        last: "마지막판"
    };
    const {
        queueType,
        school = 'XX대학교',
        department = 'XX학과',
        memo,
        playStyle,
        status,
        lookingForStyle,
        mic,
        gender,
        mbti,
        name,
        tag,
        avatarUrl,
        tier,
        leaguePoint,
        rank,
        position,
        champions,
    } = partyData;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <Box sx={{backgroundColor: '#2B2C3C', p: {xs: 1.5, sm: 2}, mx: 1}}>
                {/* 헤더 */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ml: 1, mr: 1}}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontSize="0.75rem" color="#888">
                            큐 타입
                        </Typography>
                        <Typography fontSize="0.75rem" color="#fff">
                            {queueType || ''}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose}>
                        <CloseIcon sx={{color: '#fff'}}/>
                    </IconButton>
                </Box>
            </Box>

            <Box
                mb={1}
                sx={{
                    height: '1.2px',
                    backgroundColor: '#171717',
                    width: '100%',
                }}
            />

            <Box sx={{backgroundColor: '#2B2C3C', p: {xs: 1.5, sm: 2}, mx: 1}}>
                {/* 대학교 / 학과 제목 */}
                <Box sx={{textAlign: 'center', mb: 2}}>
                    <Typography fontSize={{xs: '0.9rem', sm: '1rem'}} color="#A5A5A5">
                        {`${school} ${department}`}
                    </Typography>
                </Box>

                {/* 메시지 영역 */}
                <Box mb={2}>
                    <Box
                        sx={{
                            backgroundColor: '#424254',
                            p: {xs: 1.5, sm: 2},
                            borderRadius: 0.8,
                            color: '#fff',
                            fontSize: {xs: '0.85rem', sm: '0.9rem'},
                            lineHeight: 1.5,
                            textAlign: 'left',
                            minHeight: '60px',
                            whiteSpace: 'pre-line',
                        }}
                    >
                        {memo || ''}
                    </Box>
                </Box>

                {/* 추가 정보 영역 - 그리드 레이아웃 */}
                <Box mb={3}>
                    <Box
                        display="grid"
                        gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }}
                        columnGap={2}
                        rowGap={2}
                        sx={{
                            backgroundColor: '#282830',
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: 1,
                            fontSize: '0.85rem',
                            color: '#DDD',
                        }}
                    >
                        <Box>
                            <Typography color="#888" sx={{ fontSize: '0.8rem', mb: 0.5 }}>플레이 스타일</Typography>
                            <Typography>{playStyleDisplay[playStyle] || '-'}</Typography>
                        </Box>
                        <Box>
                            <Typography color="#888" sx={{ fontSize: '0.8rem', mb: 0.5 }}>내 상태</Typography>
                            <Typography>{statusDisplay[status] || '-'}</Typography>
                        </Box>
                        <Box>
                            <Typography color="#888" sx={{ fontSize: '0.8rem', mb: 0.5 }}>마이크</Typography>
                            <Typography>{mic || '-'}</Typography>
                        </Box>
                        <Box>
                            <Typography color="#888" sx={{ fontSize: '0.8rem', mb: 0.5 }}>성별</Typography>
                            <Typography>{genderDisplay[gender] || '-'}</Typography>
                        </Box>
                        <Box>
                            <Typography color="#888" sx={{ fontSize: '0.8rem', mb: 0.5 }}>MBTI</Typography>
                            <Typography>{mbti === "UNKNOWN" ? "비밀" : mbti || '-'}</Typography>
                        </Box>
                        {!isMyPageView && (
                            <Box>
                                <Typography color="#888" sx={{ fontSize: '0.8rem', mb: 0.5 }}>선호 스타일</Typography>
                                <Typography>{playStyleDisplay[lookingForStyle] || '-'}</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* 소환사 정보 테이블 - 가로 스크롤 적용 */}
                <Box sx={{overflowX: 'auto'}}>
                    <Box sx={{minWidth: '500px'}}>
                        {/* 테이블 헤더 */}
                        <Box
                            sx={{
                                px: 0,
                                py: 1,
                                display: 'flex',
                                backgroundColor: '#28282F',
                                color: '#999',
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            <Box width="30%" textAlign="center">소환사</Box>
                            <Box width="20%" textAlign="center">주 포지션</Box>
                            <Box width="20%" textAlign="center">티어</Box>
                            <Box width="30%" textAlign="center">모스트 챔피언</Box>
                        </Box>

                        {/* 소환사 정보 데이터 */}
                        <Box
                            sx={{
                                px: 0,
                                py: {xs: 0.5, sm: 1.5},
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: theme.palette.background.paper,
                                color: '#fff',
                                fontSize: {xs: 11, sm: 14},
                                borderTop: '1px solid #3c3d4e',
                            }}
                        >
                            <Box sx={{width: '30%', minWidth: 100, display: 'flex', justifyContent: 'center'}}>
                                <SummonerInfo name={name} tag={tag} avatarUrl={avatarUrl}/>
                            </Box>
                            <Box sx={{width: '20%', minWidth: 80, textAlign: 'center'}}>
                                <PositionIcon position={position} iconSize={20}/>
                            </Box>
                            <Box sx={{width: '20%', minWidth: 80, textAlign: 'center'}}>
                                {tier ? (
                                    <TierBadge tier={tier} score={leaguePoint} rank={rank} size="small"/>
                                ) : (
                                    <TierBadge tier="unrank" size="small"/>
                                )}
                            </Box>
                            <Box sx={{width: '30%', minWidth: 100, textAlign: 'center'}}>
                                <ChampionIconList championNames={champions || []} iconSize={20}/>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
