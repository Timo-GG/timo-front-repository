// src/components/scrim/ScrimRequestModal.jsx
import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import SummonerInfo from '../SummonerInfo';
import TierBadge from '../TierBadge';
import ChampionIconList from '../champion/ChampionIconList';
import PositionIcon from '../PositionIcon';
import TruncatedMessageBox from '../TruncatedMessageBox';

export default function ScrimRequestModal({
                                              open,
                                              handleClose,
                                              scrimData = null,
                                          }) {
    if (!scrimData) return null;

    // API 데이터에서 필요한 정보 추출
    const {
        mapCode,
        headCount,
        acceptor,
        requestor,
        acceptorMemo,
        requestorMemo
    } = scrimData;

    // 맵 코드를 한글로 변환
    const mapName = mapCode === 'RIFT' ? '소환사 협곡' : '칼바람 나락';

    // 인원수 표시 (예: "5:5")
    const peopleCount = `${headCount}:${headCount}`;

    // acceptor 팀 정보 (게시글 작성자 팀)
    const acceptorTeam = acceptor?.partyInfo || [];
    const acceptorSchool = acceptor?.memberInfo?.univName || '미인증';
    const acceptorDepartment = acceptor?.memberInfo?.department || '';

    // requestor 팀 정보 (신청자 팀)
    const requestorTeam = requestor?.partyInfo || [];
    const requestorSchool = requestor?.memberInfo?.univName || '미인증';
    const requestorDepartment = requestor?.memberInfo?.department || '';

    // 팀 멤버 데이터 변환 함수
    const transformMemberData = (member) => ({
        name: member.gameName || '',
        tag: member.tagLine || '',
        avatarUrl: member.profileUrl || '/default.png',
        position: member.myPosition?.toLowerCase() || 'nothing',
        tier: member.rankInfo?.tier?.toLowerCase() || 'unranked',
        rank: member.rankInfo?.rank || '',
        lp: member.rankInfo?.lp || 0,
        wins: member.rankInfo?.wins || 0,
        losses: member.rankInfo?.losses || 0,
        champions: member.most3Champ || []
    });

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
            {/* 상단 헤더 영역 */}
            <Box sx={{ backgroundColor: '#2B2C3C', px: 3, py: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    {/* 왼쪽: 큐 타입과 내전 인원을 한 줄에 표시 */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize="0.75rem" color="#888">
                                맵
                            </Typography>
                            <Typography fontSize="0.75rem" color="#fff">
                                {mapName}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize="0.75rem" color="#888">
                                내전 인원
                            </Typography>
                            <Typography fontSize="0.75rem" color="#fff">
                                {peopleCount}
                            </Typography>
                        </Box>
                    </Box>

                    {/* 오른쪽: 닫기 버튼 */}
                    <IconButton onClick={handleClose} sx={{ color: '#aaa' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* 구분선 */}
            <Box sx={{ height: '1px', backgroundColor: '#171717' }} />

            {/* 내용 영역: 좌우 패널로 구분 */}
            <DialogContent sx={{ backgroundColor: '#2B2C3C' }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    {/* ---------------- 왼쪽 패널: acceptor 팀 (게시글 작성자) ---------------- */}
                    <Box sx={{ flex: 1 }}>
                        {/* 학교/학과 */}
                        <Typography
                            fontSize="0.85rem"
                            color="#A5A5A5"
                            sx={{ textAlign: 'center', mb: 1 }}
                        >
                            {`${acceptorSchool} ${acceptorDepartment}`}
                        </Typography>

                        {/* 메모 - 기존 TruncatedMessageBox 사용 */}
                        {acceptorMemo && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <TruncatedMessageBox message={acceptorMemo} />
                            </Box>
                        )}

                        {/* 테이블 헤더 */}
                        <Box
                            display="flex"
                            alignItems="center"
                            px={1.5}
                            py={0.5}
                            color="#888"
                            fontSize="0.85rem"
                            sx={{ backgroundColor: '#282830' }}
                        >
                            <Box width="30%">소환사 이름</Box>
                            <Box width="10%" textAlign="center">
                                포지션
                            </Box>
                            <Box width="15%" textAlign="center">
                                티어
                            </Box>
                            <Box width="40%" textAlign="center">
                                모스트 챔피언
                            </Box>
                        </Box>

                        {/* acceptor 팀 멤버 목록 */}
                        <Box>
                            {acceptorTeam.map((member, idx) => {
                                const transformedMember = transformMemberData(member);

                                // 빈 멤버는 표시하지 않음
                                if (!transformedMember.name) return null;

                                return (
                                    <Box
                                        key={idx}
                                        display="flex"
                                        alignItems="center"
                                        px={1.5}
                                        py={0.5}
                                        borderTop="1px solid #393946"
                                    >
                                        {/* 소환사 이름 */}
                                        <Box width="30%" display="flex" alignItems="center" gap={1}>
                                            <SummonerInfo
                                                name={transformedMember.name}
                                                avatarUrl={transformedMember.avatarUrl}
                                                tag={transformedMember.tag}
                                                copyable
                                            />
                                        </Box>

                                        {/* 포지션 */}
                                        <Box width="10%" textAlign="center">
                                            <PositionIcon position={transformedMember.position} />
                                        </Box>

                                        {/* 티어 */}
                                        <Box width="15%" textAlign="center">
                                            <TierBadge
                                                tier={transformedMember.tier}
                                                score={transformedMember.lp}
                                                rank={transformedMember.rank}
                                            />
                                        </Box>

                                        {/* 모스트 챔피언 */}
                                        <Box width="40%" display="flex" justifyContent="center">
                                            <ChampionIconList championNames={transformedMember.champions} />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* ---------------- 오른쪽 패널: requestor 팀 (신청자) ---------------- */}
                    <Box sx={{ flex: 1 }}>
                        {/* 학교/학과 */}
                        <Typography
                            fontSize="0.85rem"
                            color="#A5A5A5"
                            sx={{ textAlign: 'center', mb: 1 }}
                        >
                            {`${requestorSchool} ${requestorDepartment}`}
                        </Typography>

                        {/* 메모 - 기존 TruncatedMessageBox 사용 */}
                        {requestorMemo && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <TruncatedMessageBox message={requestorMemo} />
                            </Box>
                        )}

                        {/* 테이블 헤더 */}
                        <Box
                            display="flex"
                            alignItems="center"
                            px={1.5}
                            py={0.5}
                            color="#888"
                            fontSize="0.85rem"
                            sx={{ backgroundColor: '#282830' }}
                        >
                            <Box width="30%">소환사 이름</Box>
                            <Box width="10%" textAlign="center">
                                포지션
                            </Box>
                            <Box width="15%" textAlign="center">
                                티어
                            </Box>
                            <Box width="40%" textAlign="center">
                                모스트 챔피언
                            </Box>
                        </Box>

                        {/* requestor 팀 멤버 목록 */}
                        <Box>
                            {requestorTeam.map((member, idx) => {
                                const transformedMember = transformMemberData(member);

                                // 빈 멤버는 표시하지 않음
                                if (!transformedMember.name) return null;

                                return (
                                    <Box
                                        key={idx}
                                        display="flex"
                                        alignItems="center"
                                        px={1.5}
                                        py={0.5}
                                        borderTop="1px solid #393946"
                                    >
                                        {/* 소환사 이름 */}
                                        <Box width="30%" display="flex" alignItems="center" gap={1}>
                                            <SummonerInfo
                                                name={transformedMember.name}
                                                avatarUrl={transformedMember.avatarUrl}
                                                tag={transformedMember.tag}
                                                copyable
                                            />
                                        </Box>

                                        {/* 포지션 */}
                                        <Box width="10%" textAlign="center">
                                            <PositionIcon position={transformedMember.position} />
                                        </Box>

                                        {/* 티어 */}
                                        <Box width="15%" textAlign="center">
                                            <TierBadge
                                                tier={transformedMember.tier}
                                                score={transformedMember.lp}
                                                rank={transformedMember.rank}
                                            />
                                        </Box>

                                        {/* 모스트 챔피언 */}
                                        <Box width="40%" display="flex" justifyContent="center">
                                            <ChampionIconList championNames={transformedMember.champions} />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
