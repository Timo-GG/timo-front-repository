import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Container,
    Tabs,
    Tab,
    Menu,
    MenuItem,
    CircularProgress,
    useMediaQuery
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SummonerInfo from '../components/SummonerInfo';
import TierBadge from '../components/TierBadge';
import CreateScrimModal from '/src/components/scrim/CreateScrimModal';
import ApplyScrimModal from '/src/components/scrim/ApplyScrimModal';
import ScrimDetailModal from '/src/components/scrim/ScrimDetailModal';
import {useTheme} from '@mui/material/styles';
import useAuthStore from '../storage/useAuthStore';
import ConfirmRequiredDialog from '../components/ConfirmRequiredDialog';
import {
    deleteMyScrimBoard,
    fetchAllScrimBoards, fetchScrimBoard,
    fetchUnivScrimBoards,
    isExistMyScimBoard,
    refreshScrimBoard
} from '../apis/redisAPI.js';
import {
    canRefreshBoard,
    formatCooldownTime,
    formatRelativeTime,
    formatTimeUntilExpiry,
    getExpiryColor,
    getRefreshCooldownTime
} from '../utils/timeUtils';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from "react-toastify";
import LoginModal from '../components/login/LoginModal';

export default function ScrimPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:768px)');
    const [tab, setTab] = useState(0);
    const [open, setOpen] = useState(false);
    const [applyOpen, setApplyOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuTargetId, setMenuTargetId] = useState(null);
    const [selectedPartyId, setSelectedPartyId] = useState(null);
    const [editScrim, setEditScrim] = useState(null);
    const [selectedScrim, setSelectedScrim] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [hasExistingBoard, setHasExistingBoard] = useState(false);
    const [isCheckingBoard, setIsCheckingBoard] = useState(true);

    // 쿨다운 관련 상태 추가
    const [cooldownTime, setCooldownTime] = useState(null);
    const [canRefresh, setCanRefresh] = useState(true);

    const location = useLocation();
    const userData = useAuthStore(state => state.userData);
    const {isLoggedIn} = useAuthStore();
    const myMemberId = userData?.memberId;
    const queryClient = useQueryClient();
    const [loginOpen, setLoginOpen] = useState(false);
    const [requiredOpen, setRequiredOpen] = useState(false);

    // 페이징 관련 상태 추가
    const [allScrims, setAllScrims] = useState([]);
    const [displayedScrims, setDisplayedScrims] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const pageSize = 50;

    const [editingScrim, setEditingScrim] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const isUserLoggedIn = Boolean(userData?.memberId);

    // 내 게시물의 updatedAt 찾기
    const myBoardData = displayedScrims.find(scrim => scrim.memberId === myMemberId);
    const myUpdatedAt = myBoardData?.updatedAt;

    // 쿨다운 시간 실시간 업데이트
    useEffect(() => {
        if (!myUpdatedAt || !hasExistingBoard) {
            setCooldownTime(null);
            setCanRefresh(true);
            return;
        }

        const updateCooldown = () => {
            const canRefreshNow = canRefreshBoard(myUpdatedAt);
            const cooldown = getRefreshCooldownTime(myUpdatedAt);

            setCanRefresh(canRefreshNow);
            setCooldownTime(cooldown);
        };

        // 즉시 실행
        updateCooldown();

        // 1초마다 업데이트
        const interval = setInterval(updateCooldown, 1000);

        return () => clearInterval(interval);
    }, [myUpdatedAt, hasExistingBoard]);

    // 모바일에서 대학교명 치환 함수
    const replaceMobileUnivName = (text) => {
        if (!text) return text;
        return isMobile ? text.replace('서울과학기술대학교', '서울과기대') : text;
    };

    const handleTabChange = (event, newValue) => {
        if (!isLoggedIn) return setLoginOpen(true);
        if (newValue === 1 && !userData?.certifiedUnivInfo) return setRequiredOpen(true);
        setTab(newValue);
        // 탭 변경 시 페이징 상태 초기화
        setCurrentPage(0);
        setHasMore(true);
    };

    // 기존 게시물 존재 여부 확인 쿼리
    const {
        data: hasExistingScrimBoardData,
        isLoading: isCheckingExistingBoard,
        refetch: refetchBoardStatus
    } = useQuery({
        queryKey: ['hasMyScrimBoard'],
        queryFn: isExistMyScimBoard,
        enabled: isUserLoggedIn,
        refetchInterval: 10000,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });

    // 로그아웃 시 상태 초기화
    useEffect(() => {
        if (!isUserLoggedIn) {
            setIsCheckingBoard(false);
            setHasExistingBoard(false);
        }
    }, [isUserLoggedIn]);

    // 페이지 진입 시 데이터 새로고침 (로그인된 경우만)
    useEffect(() => {
        if (isUserLoggedIn) {
            setIsCheckingBoard(true);
            refetchBoardStatus();
        }
    }, [location.pathname]);

    // React Query 결과 처리
    useEffect(() => {
        if (!isCheckingExistingBoard && isUserLoggedIn) {
            setIsCheckingBoard(false);
            setHasExistingBoard(hasExistingScrimBoardData || false);
        }
    }, [hasExistingScrimBoardData, isCheckingExistingBoard, isUserLoggedIn]);

    const handleRefreshScrim = async () => {
        if (!canRefresh) {
            toast.warning('15분 후에 다시 끌어올릴 수 있습니다.');
            return;
        }

        try {
            setIsRefreshing(true);
            const currentTime = new Date().toISOString();

            if (myMemberId) {
                setDisplayedScrims(prev => {
                    const updated = prev.map(scrim => {
                        if (scrim.memberId === myMemberId) {
                            return {...scrim, updatedAt: currentTime};
                        }
                        return scrim;
                    });
                    return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                });
            }

            await refreshScrimBoard();
            queryClient.invalidateQueries(['scrimBoards']);
            toast.success('스크림 게시글이 끌어올려졌습니다!');
            setHasExistingBoard(true);

        } catch (err) {
            console.error("스크림 끌어올리기 실패", err);
            toast.error("끌어올리기에 실패했습니다.");
            queryClient.invalidateQueries(['scrimBoards']);

            if (err.response?.status === 401) {
                setLoginOpen(true);
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    // 초기 데이터 로드
    const {data: initialData, isLoading} = useQuery({
        queryKey: ['scrimBoards', tab, 0],
        queryFn: () =>
            tab === 0
                ? fetchAllScrimBoards(0, pageSize)
                : fetchUnivScrimBoards(0, pageSize, userData.certifiedUnivInfo?.univName || ''),
        enabled: tab === 0 || (!!userData?.certifiedUnivInfo && isLoggedIn),
        refetchInterval: 5000,
    });

    // 초기 데이터 설정
    useEffect(() => {
        if (initialData && initialData.content) {
            setAllScrims(initialData.content);
            setDisplayedScrims(initialData.content);
            setHasMore(initialData.content.length === pageSize && !initialData.last);
        }
    }, [initialData, pageSize]);

    // 더 많은 데이터 로드
    const handleLoadMore = async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const moreData = tab === 0
                ? await fetchAllScrimBoards(nextPage, pageSize)
                : await fetchUnivScrimBoards(nextPage, pageSize, userData.certifiedUnivInfo?.univName || '');

            if (moreData && moreData.content && moreData.content.length > 0) {
                setAllScrims(prev => [...prev, ...moreData.content]);
                setDisplayedScrims(prev => [...prev, ...moreData.content]);
                setCurrentPage(nextPage);
                setHasMore(!moreData.last && moreData.content.length === pageSize);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('더 많은 데이터 로드 실패:', error);
            toast.error('데이터를 불러오는데 실패했습니다.');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const scrims = displayedScrims || [];

    const handleAddScrim = () => {
        queryClient.invalidateQueries(['scrimBoards']);
        queryClient.invalidateQueries(['hasMyScrimBoard']);
    };

    const handleDeleteScrim = async (id) => {
        if (window.confirm('정말로 게시글을 삭제하시겠습니까?')) {

                queryClient.setQueryData(['scrimBoards', tab], old => {
                if (!old || !old.content) return old;
                return {...old, content: old.content.filter(item => item.id !== id)};
            });

            try {
                await deleteMyScrimBoard();
                toast.success('게시글이 삭제되었습니다.');
            } catch (e) {
                console.error('스크림 삭제 실패:', e);
                toast.error('삭제에 실패했습니다.');
            } finally {
                queryClient.invalidateQueries(['scrimBoards']);
                queryClient.invalidateQueries(['hasMyScrimBoard']);
            }
        } else {
            handleClose();
        }

    };

    const handleEditScrim = async (boardUUID) => {
        try {
            const scrimData = await fetchScrimBoard(boardUUID);
            setEditingScrim(scrimData);
            setIsEditMode(true);
            setOpen(true);
        } catch (error) {
            console.error('스크림 게시글 조회 실패:', error);
            toast.error('게시글 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleUpdateScrim = (updatedData) => {
        if (!updatedData) return;
        queryClient.setQueryData(['scrimBoards', tab], old => {
            if (!old || !old.content) return old;
            const newContent = old.content.map(item =>
                item.id === updatedData.id ? {...item, ...updatedData} : item
            );
            return {...old, content: newContent};
        });
        queryClient.invalidateQueries(['hasMyScrimBoard']);
        toast.success("게시글이 수정되었습니다.");
    };

    const handleMenuClick = (event, id) => {
        setAnchorEl(event.currentTarget);
        setMenuTargetId(id);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setMenuTargetId(null);
    };

    const handleModalClose = () => {
        setOpen(false);
        setEditingScrim(null);
        setIsEditMode(false);
    };

    const handleModalSuccess = async (newScrimData) => {
        try {
            if (isEditMode) {
                setDisplayedScrims(prev =>
                    prev.map(scrim =>
                        scrim.id === newScrimData.id ? newScrimData : scrim
                    )
                );
                setAllScrims(prev =>
                    prev.map(scrim =>
                        scrim.id === newScrimData.id ? newScrimData : scrim
                    )
                );
                toast.success('게시글이 수정되었습니다.');
            } else {
                setHasExistingBoard(true);
                if (newScrimData) {
                    setDisplayedScrims(prev => {
                        const exists = prev.some(scrim => scrim.id === newScrimData.id);
                        if (!exists) {
                            return [newScrimData, ...prev];
                        }
                        return prev;
                    });
                    setAllScrims(prev => {
                        const exists = prev.some(scrim => scrim.id === newScrimData.id);
                        if (!exists) {
                            return [newScrimData, ...prev];
                        }
                        return prev;
                    });
                }
            }

            queryClient.cancelQueries(['scrimBoards']);
            setTimeout(() => {
                queryClient.invalidateQueries(['scrimBoards']);
            }, 1000);

        } catch (error) {
            console.log('게시물 상태 업데이트 실패:', error);
        }
    };

    const handleEditScrimFromMenu = (id) => {
        const found = scrims.find(scrim => scrim.id === id);
        if (found) {
            handleEditScrim(found.boardUUID || found.id);
        }
        handleClose();
    };

    // 버튼 텍스트 및 비활성화 상태 결정
    const getButtonText = () => {
        if (!isUserLoggedIn) return '파티 생성하기';
        if (isCheckingBoard) return '확인 중...';
        if (isRefreshing) return '끌어올리는 중...';

        // 쿨다운 중이면 남은 시간 표시
        if (hasExistingBoard && cooldownTime) {
            return formatCooldownTime(cooldownTime);
        }

        return hasExistingBoard ? '게시물 끌어올리기' : '파티 생성하기';
    };

    const isButtonDisabled = isRefreshing || isCheckingBoard || (hasExistingBoard && !canRefresh);

    const getButtonStyle = () => {
        // 쿨다운 중일 때 시간에 따른 색깔 변화
        if (hasExistingBoard && cooldownTime) {
            const { totalMs } = cooldownTime;
            const maxCooldown = 15 * 60 * 1000; // 15분
            const progress = (maxCooldown - totalMs) / maxCooldown; // 0~1 사이 값

            // 시간 경과에 따른 색깔 변화 (회색 → 주황색 → 원래색)
            if (progress < 0.3) {
                // 초기 4.5분: 회색
                return {
                    background: '#666',
                    color: '#999',
                    cursor: 'not-allowed',
                    '&:hover': {
                        background: '#666',
                    },
                    '&:disabled': {
                        background: '#666',
                        color: '#999'
                    }
                };
            } else if (progress < 0.8) {
                // 중간 7.5분: 주황색으로 변화
                const orangeIntensity = (progress - 0.3) / 0.5; // 0~1
                const red = Math.floor(255 * orangeIntensity + 102 * (1 - orangeIntensity));
                const green = Math.floor(165 * orangeIntensity + 102 * (1 - orangeIntensity));
                const blue = 102;

                return {
                    background: `rgb(${red}, ${green}, ${blue})`,
                    color: '#fff',
                    cursor: 'not-allowed',
                    '&:hover': {
                        background: `rgb(${red}, ${green}, ${blue})`,
                    },
                    '&:disabled': {
                        background: `rgb(${red}, ${green}, ${blue})`,
                        color: '#fff'
                    }
                };
            } else {
                // 마지막 3분: 원래 색깔로 변화
                const finalIntensity = (progress - 0.8) / 0.2; // 0~1
                const baseColor = hasExistingBoard
                    ? 'linear-gradient(90deg, #FF8A5A 0%, #FFB85A 100%)'
                    : 'linear-gradient(90deg, #A35AFF 0%, #FF5AC8 100%)';

                return {
                    background: baseColor,
                    opacity: 0.5 + 0.5 * finalIntensity, // 50%에서 100%로
                    color: '#fff',
                    cursor: 'not-allowed',
                    '&:hover': {
                        background: baseColor,
                        opacity: 0.5 + 0.5 * finalIntensity,
                    },
                    '&:disabled': {
                        background: baseColor,
                        opacity: 0.5 + 0.5 * finalIntensity,
                        color: '#fff'
                    }
                };
            }
        }

        // 기본 스타일 (쿨다운이 아닐 때)
        return {
            background: hasExistingBoard && isLoggedIn
                ? 'linear-gradient(90deg, #FF8A5A 0%, #FFB85A 100%)'
                : 'linear-gradient(90deg, #A35AFF 0%, #FF5AC8 100%)',
            '&:hover': {
                background: hasExistingBoard && isLoggedIn
                    ? 'linear-gradient(90deg, #FF9B6B 0%, #FFC96B 100%)'
                    : 'linear-gradient(90deg, #B36BFF 0%, #FF6BD5 100%)',
            },
            '&:disabled': {
                background: '#666',
                color: '#999'
            }
        };
    };

    return (
        <Box sx={{backgroundColor: theme.palette.background.default, minHeight: '100vh', pt: 5}}>
            <Container maxWidth="lg" sx={{px: {xs: 1, sm: 3}}}>
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
                        sx={{px: {xs: 1, sm: 2}}}
                    >
                        <Tab label="전체 대학교" sx={{
                            fontSize: '1.1rem',
                            color: tab === 0 ? '#ffffff' : '#B7B7C9',
                            fontWeight: tab === 0 ? 'bold' : 'normal'
                        }}/>
                        <Tab label="우리 학교" sx={{
                            fontSize: '1.1rem',
                            color: tab === 1 ? '#ffffff' : '#B7B7C9',
                            fontWeight: tab === 1 ? 'bold' : 'normal'
                        }}/>
                    </Tabs>
                </Box>

                <Box sx={{height: '1px', backgroundColor: '#171717', width: '100%'}}/>

                <Box sx={{p: 2, backgroundColor: theme.palette.background.paper}}>
                    <Box sx={{ml: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Box>
                            <Typography variant="h7" color="#42E6B5">콜로세움 게시판</Typography>
                            <Typography variant="h5" fontWeight="bold" color="white">
                                {tab === 0 ? '전체 대학교' : replaceMobileUnivName(userData?.certifiedUnivInfo?.univName)}
                            </Typography>
                        </Box>
                        <Button
                            sx={{
                                borderRadius: 0.5,
                                fontWeight: 'bold',
                                px: 2,
                                py: 1.4,
                                ...getButtonStyle()
                            }}
                            disabled={isButtonDisabled}
                            onClick={() => {
                                if (!isUserLoggedIn) return setLoginOpen(true);
                                if (!userData?.riotAccount || !userData?.certifiedUnivInfo) return setRequiredOpen(true);
                                if (hasExistingBoard) {
                                    handleRefreshScrim();
                                } else {
                                    setOpen(true);
                                }
                            }}
                        >
                            <Typography variant="h7" fontWeight="bold" color="white">
                                {getButtonText()}
                            </Typography>
                        </Button>
                    </Box>
                </Box>

                <Box sx={{overflowX: {xs: 'auto', sm: 'visible'}}}>
                    <Box sx={{minWidth: {xs: '900px', sm: 'auto'}}}>
                        <Box sx={{
                            px: 3,
                            py: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            backgroundColor: '#28282F',
                            color: '#999',
                            fontSize: {xs: 12, sm: 14},
                            fontWeight: 500
                        }}>
                            <Box width="15%" textAlign="center">소환사</Box>
                            <Box width="10%" textAlign="center">맵</Box>
                            <Box width="10%" textAlign="center">인원</Box>
                            <Box width="10%" textAlign="center">티어</Box>
                            <Box width="15%" textAlign="center">{tab === 0 ? '대학교' : '학과'}</Box>
                            <Box width="20%" textAlign="center">한 줄 소개</Box>
                            <Box width="10%" textAlign="center">등록 일시</Box>
                            <Box width="10%" textAlign="center">만료 일시</Box>
                            <Box width="10%" textAlign="center">듀오 신청</Box>
                            <Box width="2%" textAlign="center"></Box>
                        </Box>
                        {isLoading ? (
                            <Box sx={{textAlign: 'center', py: 4, color: '#fff'}}>
                                <CircularProgress sx={{color: '#A35AFF'}}/>
                            </Box>
                        ) : scrims.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                py: 4,
                                color: '#666',
                                backgroundColor: '#2B2C3C',
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10
                            }}>
                                <Typography>등록된 내전 게시물이 없습니다.</Typography>
                            </Box>
                        ) : (
                            scrims.map((row) => {
                                const isMine = row.memberId === myMemberId;
                                return (
                                    <Box key={row.id} onClick={() => {
                                        setSelectedPartyId(row.id);
                                        setDetailOpen(true);
                                    }} sx={{
                                        px: 3,
                                        py: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: theme.palette.background.paper,
                                        color: '#fff',
                                        fontSize: 14,
                                        borderBottom: '2px solid #12121a',
                                        cursor: 'pointer',
                                        '&:hover': {backgroundColor: '#28282F'}
                                    }}>
                                        <Box width="15%" display="flex">
                                            <SummonerInfo name={row.name} tag={row.tag} avatarUrl={row.avatarUrl}/>
                                        </Box>
                                        <Box width="10%" textAlign="center">{row.queueType}</Box>
                                        <Box width="10%"
                                             textAlign="center">{row.headCount ? `${row.headCount}:${row.headCount}` : ''}</Box>
                                        <Box width="10%" textAlign="center">
                                            <TierBadge tier={row.party?.[0]?.tier} score={row.party?.[0]?.lp}
                                                       rank={row.party?.[0]?.rank}/>
                                        </Box>
                                        <Box width="15%" textAlign="center">
                                            {tab === 0 ? replaceMobileUnivName(row.school) : row.department}
                                        </Box>
                                        <Box width="20%" textAlign="center">
                                            <Box
                                                sx={{
                                                    backgroundColor: '#424254',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    fontSize: '0.85rem',
                                                    lineHeight: 1.4,
                                                    textAlign: 'left',
                                                    display: '-webkit-inline-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'normal',
                                                    maxHeight: {xs: '3.2em', sm: '3.6em'}
                                                }}
                                            >{row.message}</Box>
                                        </Box>
                                        <Box width="10%" textAlign="center"
                                             sx={{
                                                 fontSize: {xs: '0.7rem', sm: '0.75rem'}
                                             }}
                                        >{formatRelativeTime(row.updatedAt)}</Box>
                                        <Box width="10%" textAlign="center" sx={{
                                            fontSize: {xs: '0.7rem', sm: '0.75rem'},
                                            color: getExpiryColor(row.updatedAt)
                                        }}>{formatTimeUntilExpiry(row.updatedAt)}</Box>
                                        <Box width="10%" textAlign="center">
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedScrim(row);
                                                    setApplyOpen(true);
                                                }}
                                                sx={{
                                                    backgroundColor: '#424254',
                                                    color: '#fff',
                                                    borderRadius: 0.8,
                                                    fontWeight: 'bold',
                                                    px: 2,
                                                    py: { xs: 0.8, sm: 1 },
                                                    fontSize: { xs: '0.8rem', sm: '0.95rem' },
                                                    border: '1px solid #71717D'
                                                }}
                                            >신청</Button>
                                        </Box>
                                        <Box width="2%" textAlign="center">
                                            {isMine && (
                                                <>
                                                    <IconButton onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMenuClick(e, row.id);
                                                    }}>
                                                        <MoreVertIcon sx={{color: '#aaa'}}/>
                                                    </IconButton>
                                                    <Menu anchorEl={anchorEl} open={menuTargetId === row.id}
                                                          onClose={handleClose}>
                                                        <MenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditScrimFromMenu(row.id);
                                                        }}>수정</MenuItem>
                                                        <MenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteScrim(row.id);
                                                        }}>삭제</MenuItem>
                                                    </Menu>
                                                </>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                </Box>

                {/* Load More 버튼 */}
                {hasMore && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 3,
                        mb: 2
                    }}>
                        <Button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            sx={{
                                backgroundColor: '#2B2C3C',
                                color: '#fff',
                                border: '1px solid #424254',
                                borderRadius: 4,
                                px: 1,
                                py: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': {
                                    backgroundColor: '#424254',
                                },
                                '&:disabled': {
                                    backgroundColor: '#1a1a1a',
                                    color: '#666',
                                }
                            }}
                        >
                            {isLoadingMore ? (
                                <CircularProgress size={20} sx={{color: '#A35AFF'}}/>
                            ) : (
                                <KeyboardArrowDownIcon sx={{fontSize: 18}}/>
                            )}
                        </Button>
                    </Box>
                )}

                {!hasMore && displayedScrims.length > 0 && (
                    <Box sx={{
                        textAlign: 'center',
                        py: 3,
                        color: '#666',
                        fontSize: '0.9rem'
                    }}>
                        모든 게시물을 확인했습니다.
                    </Box>
                )}
            </Container>
            <CreateScrimModal
                open={open}
                handleClose={handleModalClose}
                onCreateScrim={handleModalSuccess}
                currentTab={tab}
                editData={editingScrim}
                isEditMode={isEditMode}
            />
            <ApplyScrimModal open={applyOpen}
                             handleClose={() => {
                                 setApplyOpen(false);
                                 setEditScrim(null);
                                 setSelectedScrim(null);
                             }} targetScrim={selectedScrim} editScrim={editScrim} onUpdateScrim={handleUpdateScrim}/>
            <ScrimDetailModal open={detailOpen} handleClose={() => setDetailOpen(false)} partyId={selectedPartyId}
                              scrims={scrims}/>
            <ConfirmRequiredDialog open={requiredOpen} onClose={() => setRequiredOpen(false)}/>
            <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)}/>
        </Box>
    );
}
