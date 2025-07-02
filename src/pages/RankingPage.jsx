import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {
    InputBase,
    IconButton,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    useTheme,
    Container,
    Avatar,
    Pagination,
    useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import useAuthStore from '../storage/useAuthStore';
import {Collapse} from '@mui/material';
import LoginModal from '../components/login/LoginModal';
import axios from 'axios';
import TierBadge from '../components/TierBadge';
import ChampionIconList from '/src/components/champion/ChampionIconList';
import PositionIcon from '../components/PositionIcon';
import EditProfileModal from '../components/rank/EditProfileModal';
import RankingDetailModal from '../components/rank/RankingDetailModal';
import WinRateBar from '../components/WinRateBar';
import ConfirmRequiredDialog from '../components/ConfirmRequiredDialog';
import {fetchRankingList, fetchRankingByUniversity, fetchMyRankingInfo, fetchRankingPosition} from '../apis/rankAPI';
import SummonerInfo from '../components/SummonerInfo';
import { useQueryClient } from '@tanstack/react-query';

export default function RankingPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:768px)');
    const {accessToken, userData} = useAuthStore();

    const [tab, setTab] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [detailOpen, setDetailOpen] = React.useState(false);
    const [selectedData, setSelectedData] = React.useState(null);
    const [searchText, setSearchText] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [requiredOpen, setRequiredOpen] = React.useState(false);
    const [loginOpen, setLoginOpen] = React.useState(false);
    const itemsPerPage = 50;
    const myUniversity = userData?.certifiedUnivInfo?.univName || '우리 학교';
    const [searchTarget, setSearchTarget] = React.useState(null);
    const rowRefs = React.useRef({});
    const queryClient = useQueryClient();

    // 모바일에서 대학교명 치환 함수
    const replaceMobileUnivName = (text) => {
        if (!text) return text;
        return isMobile ? text.replace('서울과학기술대학교', '서울과기대') : text;
    };

    const {
        data: responseData = {},
    } = useQuery({
        queryKey: ['rankingList', tab, userData?.certifiedUnivInfo?.univName, currentPage],
        queryFn: () =>
            tab === 0
                ? fetchRankingList(currentPage, itemsPerPage)
                : fetchRankingByUniversity(userData.certifiedUnivInfo.univName, currentPage, itemsPerPage),
        enabled: tab === 0 || !!userData?.certifiedUnivInfo,
        refetchInterval: 5000,
    });

    const rankingData = {
        list: responseData?.list || [],
        totalCount: responseData?.totalCount || 0,
    };

    const totalPages = Math.ceil(rankingData.totalCount / itemsPerPage);

    const {
        data: myProfileData,
    } = useQuery({
        queryKey: ['myProfile'],
        queryFn: fetchMyRankingInfo,
        enabled: !!accessToken,
    });

    const handleTabChange = (event, newValue) => {
        if (!accessToken) return setLoginOpen(true);
        if (newValue === 1 && !userData?.certifiedUnivInfo) return setRequiredOpen(true);
        setTab(newValue);
        setCurrentPage(1);
    };

    const handleEditClick = () => {
        if (!accessToken) return setLoginOpen(true);
        if (!userData?.riotAccount || !userData?.certifiedUnivInfo) return setRequiredOpen(true);
        setOpen(true);
        queryClient.invalidateQueries(['myProfile']);
        setOpen(true);
    };

    const handleEditSuccess = () => {
        queryClient.invalidateQueries(['myProfile']);
        queryClient.invalidateQueries(['rankingList']);
        setOpen(false);
    };

    const handleRowClick = (row) => {
        setSelectedData(row);
        setDetailOpen(true);
    };

    React.useEffect(() => {
        if (!searchTarget || !rankingData.list.length) return;

        const exists = rankingData.list.some(item => {
            // 띄어쓰기를 제거하지 않고 비교
            const full = `${item.name}#${item.tag}`;
            return full === searchTarget;
        });

        if (!exists) {
            setSearchTarget(null);
        } else {
            // ref 키도 띄어쓰기를 제거하지 않도록 수정
            const targetElement = rowRefs.current[searchTarget];
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }, 100);
            }
        }
    }, [rankingData.list, searchTarget, currentPage]);

    const handleSearch = async () => {
        if (!searchText.trim() || !searchText.includes('#')) return;

        const [name, tag] = searchText.split('#').map(s => s.trim());

        try {
            // 띄어쓰기를 제거하지 않고 그대로 전송
            const rank = await fetchRankingPosition(name, tag);
            const page = Math.ceil(rank / itemsPerPage);

            setCurrentPage(page);
            // 검색 타겟도 띄어쓰기를 제거하지 않고 설정
            setSearchTarget(`${name}#${tag}`);
        } catch (err) {
            alert('해당 소환사를 찾을 수 없습니다.');
        }
    };

    return (
        <Box sx={{backgroundColor: theme.palette.background.default, minHeight: '100vh', pt: 5}}>
            <Container maxWidth="lg" sx={{px: {xs: 1, sm: 3}}}>
                {/* 탭 영역 */}
                <Box sx={{
                    backgroundColor: theme.palette.background.paper,
                    p: 1,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10
                }}>
                    <Tabs
                        value={tab}
                        onChange={handleTabChange}
                        textColor="inherit"
                        TabIndicatorProps={{style: {backgroundColor: '#ffffff'}}}
                    >
                        <Tab label="전체 대학교" sx={{
                            fontSize: "1.1rem",
                            color: tab === 0 ? '#ffffff' : '#B7B7C9',
                            fontWeight: tab === 0 ? 'bold' : 'normal'
                        }}/>
                        <Tab label="우리 학교" sx={{
                            fontSize: "1.1rem",
                            color: tab === 1 ? '#ffffff' : '#B7B7C9',
                            fontWeight: tab === 1 ? 'bold' : 'normal'
                        }}/>
                    </Tabs>
                </Box>

                <Box sx={{height: '1px', backgroundColor: '#171717', width: '100%'}}/>

                {/* 헤더 */}
                <Box sx={{p: 2, backgroundColor: theme.palette.background.paper}}>
                    <Box sx={{
                        ml: 1,
                        display: 'flex',
                        flexDirection: {xs: 'column', sm: 'row'},
                        justifyContent: 'space-between',
                        alignItems: {xs: 'flex-start', sm: 'center'},
                        gap: {xs: 2, sm: 0},
                    }}>
                        <Box>
                            <Typography variant="h7" color="#42E6B5">콜로세움 순위표</Typography>
                            <Typography variant="h5" fontWeight="bold" color="white">
                                {tab === 0 ? '전체 대학교' : replaceMobileUnivName(myUniversity)}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#888888',
                                    fontSize: '0.75rem',
                                    display: 'block',
                                    mt: 0.5
                                }}
                            >
                                순위는 주기적으로 업데이트 됩니다.
                            </Typography>
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, width: {xs: '100%', sm: 'auto'}}}>
                            <Box
                                sx={{
                                    backgroundColor: '#2B2C3C',
                                    border: '1px solid #424254',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 40,
                                    pl: 1.5,
                                    pr: 1.5,
                                    minWidth: 120,
                                    flex: {xs: 1.8, sm: 'none'},
                                }}
                            >
                                <IconButton
                                    onClick={handleSearch}
                                    sx={{
                                        padding: '2px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.04)'
                                        }
                                    }}
                                >
                                    <SearchIcon sx={{color: '#424254'}}/>
                                </IconButton>
                                <InputBase
                                    placeholder="플레이어 이름 + #태그"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch();
                                    }}
                                    sx={{
                                        flex: 1,
                                        color: '#fff',
                                        fontSize: {xs: '0.7rem', sm: '0.9rem'},
                                        fontWeight: 'bold',
                                        ml: 1,
                                        mr: 1
                                    }}
                                />
                            </Box>

                            <Button
                                sx={{
                                    backgroundColor: '#88849B',
                                    color: '#fff',
                                    borderRadius: 0.5,
                                    fontWeight: 'bold',
                                    px: 2,
                                    py: 1.4,
                                    height: 40,
                                    width: {xs: '100%', sm: 'auto'},
                                    flex: {xs: 1.2, sm: 'none'},
                                }}
                                onClick={handleEditClick}
                            >
                                <Typography variant="h7" fontWeight="bold" color="white">
                                    내 정보 수정하기
                                </Typography>
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* 테이블 영역 - 가로 스크롤 적용 */}
                <Box sx={{overflowX: {xs: 'auto', sm: 'visible'}}}>
                    <Box sx={{minWidth: {xs: '1100px', sm: 'auto'}}}>
                        {/* 테이블 헤더 */}
                        <Box sx={{
                            px: 0,
                            py: 1.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            backgroundColor: '#28282F',
                            color: '#999',
                            fontSize: 14,
                            fontWeight: 500
                        }}>
                            <Box width="5%" textAlign="center">순위</Box>
                            <Box width="15%" textAlign="center">소환사</Box>
                            <Box width="10%" textAlign="center">주 포지션</Box>
                            <Box width="5%" textAlign="center">티어</Box>
                            <Box width="10%" textAlign="center">{tab === 0 ? '대학교' : '학과'}</Box>
                            <Box width="10%" textAlign="center">모스트 챔피언</Box>
                            <Box width="15%" textAlign="center">승률</Box>
                            <Box width="20%" textAlign="center">한 줄 소개</Box>
                        </Box>

                        {/* 테이블 바디 */}
                        {rankingData.list.map(row => {
                            // 띄어쓰기를 제거하지 않고 키 생성
                            const full = `${row.name}#${row.tag}`;
                            const isHighlighted = full === searchTarget;
                            return (
                                <Collapse key={full} in={true}>
                                    <Box
                                        ref={(el) => {
                                            if (el) {
                                                rowRefs.current[full] = el; // 띄어쓰기 포함된 키 사용
                                            }
                                        }}
                                        onClick={() => handleRowClick(row)}
                                        sx={{
                                            px: 0,
                                            py: 1,
                                            pr: 1,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: 14,
                                            borderBottom: '2px solid #12121a',
                                            cursor: 'pointer',
                                            color: '#fff',
                                            backgroundColor: isHighlighted ? '#28282F' : theme.palette.background.paper,
                                            ...(isHighlighted
                                                ? {}
                                                : {
                                                    '&:hover': {
                                                        backgroundColor: '#28282F',
                                                    },
                                                }),
                                        }}
                                    >
                                        <Box width="5%" textAlign="center">{row.ranking}</Box>
                                        <Box width="15%" display="flex">
                                            <SummonerInfo name={row.name} tag={row.tag} avatarUrl={row.avatarUrl} verificationType={row.verificationType}/>
                                        </Box>
                                        <Box width="10%" textAlign="center">
                                            <PositionIcon position={row.position}/>
                                        </Box>
                                        <Box width="5%" textAlign="center">
                                            <TierBadge tier={row.tier} score={row.lp} rank={row.rank}/>
                                        </Box>
                                        <Box width="10%" textAlign="center">
                                            {tab === 0 ? replaceMobileUnivName(row.university) : row.department}
                                        </Box>
                                        <Box width="10%" textAlign="center">
                                            <ChampionIconList championNames={row.champions}/>
                                        </Box>
                                        <Box width="15%" textAlign="center">
                                            <WinRateBar wins={row.wins} losses={row.losses}/>
                                        </Box>
                                        <Box width="20%" textAlign="center">
                                            <Box sx={{
                                                backgroundColor: '#424254',
                                                p: 1,
                                                borderRadius: 1,
                                                color: '#fff',
                                                fontSize: '0.85rem',
                                                lineHeight: 1.4,
                                                textAlign: 'left',
                                                display: '-webkit-inline-box',
                                                WebkitBoxOrient: 'vertical',
                                                WebkitLineClamp: 2,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'normal',
                                                maxHeight: '3.6em'
                                            }}>
                                                {row.message}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Collapse>
                            );
                        })}
                    </Box>
                </Box>

                {/* 페이지네이션 */}
                <Box sx={{display: 'flex', justifyContent: 'center', py: 3}}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(e, value) => setCurrentPage(value)}
                        shape="rounded"
                        color="primary"
                        sx={{
                            '& .MuiPaginationItem-root': {color: '#fff'},
                            '& .Mui-selected': {backgroundColor: '#42E6B5', color: '#000'}
                        }}
                    />
                </Box>
            </Container>

            <RankingDetailModal open={detailOpen} handleClose={() => setDetailOpen(false)} data={selectedData}/>
            <ConfirmRequiredDialog open={requiredOpen} onClose={() => setRequiredOpen(false)}/>
            <EditProfileModal open={open} handleClose={() => setOpen(false)} userProfileData={myProfileData}/>
            <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)}/>
        </Box>
    );
}
