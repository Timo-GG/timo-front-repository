import React, { useState, useEffect } from 'react';
import {
    Dialog, Box, Typography, TextField, Select, MenuItem,
    Button, IconButton, Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TierBadge from '../TierBadge';
import PositionFilterBar from '../duo/PositionFilterBar';
import ChampionIconList from '../champion/ChampionIconList';
import theme from '../../theme';
import { fetchCompactPlayerHistory } from '../../apis/compactPlayerHistory';
import useAuthStore from "../../storage/useAuthStore.jsx";
import {createScrimBoard, sendScrimRequest} from "../../apis/redisAPI.js";

const defaultMember = {
    gameName: '',
    tagLine: '',
    profileUrl: 'default.png',
    rankInfo: {
        tier: '',
        rank: '',
        lp: 0,
        wins: 0,
        losses: 0,
    },
    most3Champ: [],
    myPosition: 'NOTHING',
};

export default function ApplyScrimModal({ open, handleClose, targetScrim, onSendScrim }) {
    const [memo, setMemo] = useState('');
    const [myPosition, setMyPosition] = useState('nothing');
    const [errors, setErrors] = useState({});
    const [summonerInputs, setSummonerInputs] = useState([]);
    const [partyMembers, setPartyMembers] = useState([]);

    const people = targetScrim?.headCount === 3 ? '3:3' : '5:5';
    const partyLimit = people === '3:3' ? 2 : 4;

    useEffect(() => {
        setPartyMembers(Array(partyLimit).fill(null).map(() => ({ ...defaultMember, rankInfo: { ...defaultMember.rankInfo } })));
        setSummonerInputs(Array(partyLimit).fill(""));
    }, [targetScrim]);

    const handleVerifySummoner = async (index) => {
        const input = summonerInputs[index];
        if (!input.includes('#')) {
            setErrors(prev => ({ ...prev, [index]: '형식이 올바르지 않습니다 (예: 소환사이름#태그)' }));
            return;
        }

        const [gameName, tagLine] = input.split('#').map(s => s.trim());
        if (!gameName || !tagLine) {
            setErrors(prev => ({ ...prev, [index]: '형식이 올바르지 않습니다 (예: 소환사이름#태그)' }));
            return;
        }

        try {
            const { avatarUrl, rankInfo, most3Champ } = await fetchCompactPlayerHistory({ gameName, tagLine });

            const updated = [...partyMembers];
            updated[index] = {
                gameName,
                tagLine,
                profileUrl: avatarUrl || '/default.png',
                rankInfo: {
                    tier: rankInfo?.tier || 'Unranked',
                    rank: rankInfo?.rank || '',
                    lp: rankInfo?.lp || 0,
                    wins: rankInfo?.wins || 0,
                    losses: rankInfo?.losses || 0,
                },
                most3Champ: most3Champ || [],
                myPosition: 'NOTHING'
            };
            setPartyMembers(updated);

            const updatedInputs = [...summonerInputs];
            updatedInputs[index] = '';
            setSummonerInputs(updatedInputs);
            setErrors(prev => ({ ...prev, [index]: '' }));
        } catch (error) {
            console.error("소환사 조회 실패:", error);
            setErrors(prev => ({ ...prev, [index]: '조회 실패' }));
        }
    };

    const { userData: me } = useAuthStore();
    const riot = me?.riotAccount;

    console.log(me);

    const handleSubmit = async () => {
        const headCount = targetScrim.headCount;
        const gameName = riot?.accountName || '';
        const tagLine = riot?.accountTag || '';

        try {
            const { avatarUrl, rankInfo, most3Champ } = await fetchCompactPlayerHistory({ gameName, tagLine });

            const author = {
                gameName,
                tagLine,
                profileUrl: avatarUrl || '/default.png',
                rankInfo: {
                    tier: rankInfo?.tier || 'Unranked',
                    rank: rankInfo?.rank || '',
                    lp: rankInfo?.lp || 0,
                    wins: rankInfo?.wins || 0,
                    losses: rankInfo?.losses || 0
                },
                most3Champ: most3Champ || [],
                myPosition: myPosition?.toUpperCase() || 'NOTHING'
            };

            // 멤버들 가공
            const formattedMembers = partyMembers.slice(0, headCount - 1).map(m => ({
                gameName: m.gameName,
                tagLine: m.tagLine,
                profileUrl: m.profileUrl || '/default.png',
                rankInfo: {
                    tier: m.rankInfo?.tier || 'Unranked',
                    rank: m.rankInfo?.rank || '',
                    lp: m.rankInfo?.lp || 0,
                    wins: m.rankInfo?.wins || 0,
                    losses: m.rankInfo?.losses || 0,
                },
                most3Champ: m.most3Champ || [],
                myPosition: m.myPosition?.toUpperCase() || 'NOTHING'
            }));

            const requestBody = {
                boardUUID: targetScrim.id,
                requestorId: me.memberId,
                partyInfo: [author, ...formattedMembers],
                requestorMemo: memo
            };

            const res = await sendScrimRequest(requestBody);
            const formatted = transformScrimPageForFrontend(res.data);
            alert('내전 신청 완료되었습니다.');
            onSendScrim?.(formatted);
            handleClose();
        } catch (e) {
            alert('내전 신청 실패하였습니다.');

        }
    };

    const transformScrimPageForFrontend = (scrim) => {
        const { myPageUUID, headCount, mapCode, matchingCategory, matchingStatus, requestorMemo, acceptorMemo, requestor, acceptor, updatedAt } = scrim;

        const transformMember = (memberData) => {
            if (!memberData) return null;

            const riot = memberData.memberInfo?.riotAccount || {};
            const rankInfo = memberData.memberInfo?.rankInfo || {};
            const most3Champ = memberData.memberInfo?.most3Champ || [];

            return {
                gameName: riot.gameName || '',
                tagLine: riot.tagLine || '',
                profileUrl: riot.profileUrl || '/default.png',
                tier: rankInfo.tier || 'Unranked',
                rank: rankInfo.rank || '',
                lp: rankInfo.lp || 0,
                wins: rankInfo.wins || 0,
                losses: rankInfo.losses || 0,
                champions: most3Champ,
            };
        };

        const transformParty = (partyInfo) =>
            (partyInfo || []).map((p) => ({
                gameName: p.gameName || '',
                tagLine: p.tagLine || '',
                profileUrl: p.profileUrl || '/default.png',
                tier: p.rankInfo?.tier || 'Unranked',
                rank: p.rankInfo?.rank || '',
                lp: p.rankInfo?.lp || 0,
                wins: p.rankInfo?.wins || 0,
                losses: p.rankInfo?.losses || 0,
                myPosition: (p.myPosition || 'NOTHING').toLowerCase(),
                champions: p.most3Champ || []
            }));

        return {
            id: myPageUUID,
            headCount,
            queueType: mapCode === 'RIFT' ? '소환사 협곡' : '칼바람 나락',
            category: matchingCategory === 'SCRIM' ? '내전' : '듀오',
            status: matchingStatus.toLowerCase(),
            updatedAt,
            requestorMemo,
            acceptorMemo,
            requestor: {
                member: transformMember(requestor),
                party: transformParty(requestor?.partyInfo)
            },
            acceptor: {
                member: transformMember(acceptor),
                party: transformParty(acceptor?.partyInfo)
            }
        };
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <Box sx={{ backgroundColor: '#31313E', pl: 3, pr: 3, pt: 2, pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontSize="1.1rem" fontWeight="bold" color="#fff">내전 신청하기</Typography>
                    <IconButton onClick={handleClose}><CloseIcon sx={{ color: '#aaa' }} /></IconButton>
                </Box>
            </Box>
            <Box sx={{ height: '1px', backgroundColor: '#171717' }} />
            <Box sx={{ backgroundColor: '#31313E', pl: 3, pr: 3, pb: 1 }}>
                <TextField
                    placeholder="메모를 입력해주세요."
                    fullWidth
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    variant="outlined"
                    sx={{
                        my: 2,
                        borderRadius: 1,
                        bgcolor: '#282830',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'transparent' },
                            '&:hover fieldset': { borderColor: 'transparent' },
                            '&.Mui-focused fieldset': { borderColor: 'transparent' }
                        },
                        input: { color: '#fff' }
                    }}
                />

                <Box mb={2}>
                    <Typography fontSize="0.85rem" color="#aaa" mb={0.5}>나의 포지션</Typography>
                    <PositionFilterBar
                        positionFilter={myPosition}
                        onPositionClick={setMyPosition}
                        selectedColor="#42E6B5"
                        unselectedColor="#31313E"
                    />
                </Box>

                {/* 테이블 헤더 */}
                <Box display="flex" alignItems="center" px={1.5} py={1} color="#888" fontSize="0.85rem"
                     sx={{ backgroundColor: "#28282F" }}>
                    <Box width="25%">소환사 이름</Box>
                    <Box width="10%" textAlign="center">티어</Box>
                    <Box width="20%" textAlign="center">모스트 챔피언</Box>
                    <Box width="45%" textAlign="center">포지션</Box>
                </Box>

                {/* 멤버 리스트 */}
                {partyMembers.map((member, i) => (
                    <Box key={i} display="flex" alignItems="center" px={1.5} py={1.2} borderTop="1px solid #393946">
                        <Box width="25%" display="flex" alignItems="center" gap={1}>
                            {member.gameName ? (
                                <>
                                    <Avatar src={member.profileUrl} sx={{ width: 32, height: 32 }} />
                                    <Box>
                                        <Typography fontSize="0.9rem" color="#fff">{member.gameName}</Typography>
                                        <Typography fontSize="0.75rem" color="#888">#{member.tagLine}</Typography>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', height: '40px', width: '100%' }}>
                                    <TextField
                                        fullWidth
                                        placeholder="소환사 이름#태그"
                                        variant="outlined"
                                        value={summonerInputs[i]}
                                        onChange={(e) => {
                                            const updated = [...summonerInputs];
                                            updated[i] = e.target.value;
                                            setSummonerInputs(updated);
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '100%',
                                                borderRadius: '10px 0 0 10px',
                                                backgroundColor: theme.palette.background.input,
                                                border: `1px solid ${theme.palette.border.main}`,
                                                '& fieldset': { borderColor: 'transparent' },
                                                '& input': {
                                                    color: theme.palette.text.primary,
                                                    padding: '10px 12px',
                                                    fontSize: '0.875rem',
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={() => handleVerifySummoner(i)}
                                        sx={{
                                            height: '100%',
                                            borderRadius: '0 10px 10px 0',
                                            backgroundColor: theme.palette.background.input,
                                            color: theme.palette.text.secondary,
                                            border: `1px solid ${theme.palette.border.main}`,
                                            borderLeft: 'none',
                                            px: 2,
                                            minWidth: '64px',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        등록
                                    </Button>
                                </Box>
                            )}
                        </Box>
                        <Box width="10%" textAlign="center">
                            <TierBadge
                                tier={(member.rankInfo?.tier || 'unrank').toLowerCase()}
                                score={member.rankInfo?.lp || 0}
                                rank={member.rankInfo?.rank}
                            />
                        </Box>
                        <Box width="20%" display="flex" justifyContent="center">
                            <ChampionIconList championNames={member.most3Champ || []} />
                        </Box>
                        <Box width="45%" display="flex" justifyContent="space-between" alignItems="center">
                            <PositionFilterBar
                                positionFilter={member.myPosition || 'nothing'}
                                onPositionClick={(pos) => {
                                    const updated = [...partyMembers];
                                    updated[i] = { ...updated[i], myPosition: pos };
                                    setPartyMembers(updated);
                                }}
                                selectedColor="#42E6B5"
                                unselectedColor="#31313E"
                            />
                            {member.gameName && (
                                <Button
                                    onClick={() => {
                                        const updated = [...partyMembers];
                                        updated[i] = defaultMember;
                                        setPartyMembers(updated);
                                    }}
                                    sx={{
                                        ml: 1,
                                        minWidth: 0,
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        color: '#aaa',
                                        fontSize: '0.8rem',
                                        '&:hover': { backgroundColor: '#3a3a4a' }
                                    }}
                                >
                                    ✕
                                </Button>
                            )}
                        </Box>
                    </Box>
                ))}

                <Box display="flex" gap={2} mt={4}>
                    <Button fullWidth onClick={handleClose} sx={{
                        border: `1px solid ${theme.palette.border.main}`,
                        bgcolor: '#2A2B31', color: '#fff', height: 48, fontWeight: 'bold'
                    }}>
                        취소
                    </Button>
                    <Button fullWidth onClick={handleSubmit} sx={{ bgcolor: '#42E6B5', color: '#000', height: 48, fontWeight: 'bold' }}>
                        <Typography fontWeight="bold" color="white">신청</Typography>
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
