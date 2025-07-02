import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {
    Box,
    Container,
    Button,
    IconButton,
    useTheme,
    Select,
    MenuItem,
    FormControl,
    Menu,
    CircularProgress,
    Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateDuoModal from '/src/components/duo/CreateDuoModal';
import DuoDetailModal from '/src/components/duo/DuoDetailModal';
import SendDuoModal from '/src/components/duo/SendDuoModal';
import SummonerInfo from '/src/components/SummonerInfo';
import LoginModal from '../components/login/LoginModal';
import TierBadge from '/src/components/TierBadge';
import PositionIcon from '/src/components/PositionIcon';
import PositionFilterBar from '/src/components/duo/PositionFilterBar';
import useAuthStore from '../storage/useAuthStore';
import ConfirmRequiredDialog from '../components/ConfirmRequiredDialog';
import {useQuery} from '@tanstack/react-query';
import {fetchAllDuoBoards, isExistMyBoard, refreshDuoBoards, deleteMyDuoBoard, fetchDuoBoard, checkAlreadyApplied} from '../apis/redisAPI';
import {getMyInfo} from '../apis/authAPI';
import {useQueryClient} from '@tanstack/react-query';
import {
    canRefreshBoard, formatCooldownTime,
    formatRelativeTime,
    formatTimeUntilExpiry,
    getExpiryColor, getRefreshCooldownTime,
    isExpired
} from '../utils/timeUtils';
import {toast} from 'react-toastify';

export default function DuoPage() {
    const theme = useTheme();
    const [positionFilter, setPositionFilter] = useState('nothing');
    const [rankType, setRankType] = useState('all');
    const [schoolFilter, setSchoolFilter] = useState('all');

    // 페이징 관련 상태
    const [allDuoUsers, setAllDuoUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const pageSize = 50;

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openSendModal, setOpenSendModal] = useState(false);
    const [currentBoardUUID, setCurrentBoardUUID] = useState(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [hasExistingBoard, setHasExistingBoard] = useState(false);
    const [isCheckingBoard, setIsCheckingBoard] = useState(true); // 추가: 게시물 확인 중 상태
    const [isRefreshing, setIsRefreshing] = useState(false);

    const location = useLocation();
    const userData = useAuthStore(state => state.userData);
    const {setUserData} = useAuthStore();
    const currentUser = useAuthStore(state => state.userData);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [isCreatingBoard, setIsCreatingBoard] = useState(false);

    const [editingDuo, setEditingDuo] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const queryClient = useQueryClient();

    const isUserLoggedIn = Boolean(userData?.memberId);

    const myBoardData = displayedUsers.find(user => user.memberId === currentUser?.memberId);
    const myUpdatedAt = myBoardData?.updatedAt;

    const [cooldownTime, setCooldownTime] = useState(null);
    const [canRefresh, setCanRefresh] = useState(true);

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



    // 기존 게시물 존재 여부 확인 쿼리
    const {
        data: hasExistingBoardData,
        isLoading: isCheckingExistingBoard,
        refetch: refetchBoardStatus
    } = useQuery({
        queryKey: ['hasMyDuoBoard'],
        queryFn: isExistMyBoard,
        enabled: isUserLoggedIn,
        refetchInterval: 10000,
        staleTime: 0, // 캐시 무효화
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
            setHasExistingBoard(hasExistingBoardData || false);
        }
    }, [hasExistingBoardData, isCheckingExistingBoard, isUserLoggedIn]);

    useEffect(() => {
        if (!isCheckingExistingBoard && isUserLoggedIn) {
            setIsCheckingBoard(false);
            setHasExistingBoard(hasExistingBoardData || false);
        }
    }, [hasExistingBoardData, isCheckingExistingBoard, isUserLoggedIn]);

    useEffect(() => {
        const handleAuthError = (event) => {
            console.log('인증 에러 발생:', event.detail);
            setLoginModalOpen(true);
            toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
        };

        window.addEventListener('authError', handleAuthError);
        return () => {
            window.removeEventListener('authError', handleAuthError);
        };
    }, []);

    useEffect(() => {
        const fetchAndUpdateUser = async () => {
            if (isUserLoggedIn) {
                try {
                    const updated = await getMyInfo();
                    setUserData(updated.data);
                } catch (error) {
                    console.log('사용자 정보 업데이트 실패:', error);
                }
            }
        };
        fetchAndUpdateUser();
    }, []);

    const {data: initialData, isLoading} = useQuery({
        queryKey: ['duoUsers', 0],
        queryFn: () => fetchAllDuoBoards(0, pageSize),
        refetchInterval: 5000,
    });

    useEffect(() => {
        if (initialData && initialData.content && !isCreatingBoard) {
            setAllDuoUsers(initialData.content);
            setDisplayedUsers(initialData.content);
            setHasMore(initialData.content.length === pageSize && !initialData.last);
        }
    }, [initialData, pageSize, isCreatingBoard]);

    const handleLoadMore = async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const moreData = await fetchAllDuoBoards(nextPage, pageSize);

            if (moreData && moreData.content && moreData.content.length > 0) {
                setAllDuoUsers(prev => [...prev, ...moreData.content]);
                setDisplayedUsers(prev => [...prev, ...moreData.content]);
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

    const handleRefresh = async () => {
        if (!canRefresh) {
            toast.warning('15분 후에 다시 끌어올릴 수 있습니다.');
            return;
        }

        try {
            setIsRefreshing(true);
            const currentTime = new Date().toISOString();
            const currentUserId = currentUser?.memberId;

            if (currentUserId) {
                setDisplayedUsers(prev => {
                    const updated = prev.map(user => {
                        if (user.memberId === currentUserId) {
                            return {...user, updatedAt: currentTime};
                        }
                        return user;
                    });
                    return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                });
            }

            await refreshDuoBoards();
            queryClient.invalidateQueries(['duoUsers']);
            toast.success('게시물이 끌어올려졌습니다!');
            setHasExistingBoard(true);

        } catch (error) {
            console.error('끌어올리기 실패:', error);
            queryClient.invalidateQueries(['duoUsers']);

            if (error.response?.status === 401) {
                setLoginModalOpen(true);
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleRegisterDuo = () => {
        if (!isUserLoggedIn) {
            setLoginModalOpen(true);
            return;
        }

        // 라이엇 계정과 대학 인증 확인 추가
        if (!userData?.riotAccount || !userData?.certifiedUnivInfo) {
            setOpenConfirmDialog(true); // ConfirmRequiredDialog 모달 열기
            return;
        }

        if (hasExistingBoard) {
            handleRefresh();
        } else {
            setCreateModalOpen(true);
        }
    };

    const handleEditDuo = async (boardUUID) => {
        try {
            const duoData = await fetchDuoBoard(boardUUID);
            setEditingDuo(duoData);
            setIsEditMode(true);
            setCreateModalOpen(true);
        } catch (error) {
            console.error('듀오 게시글 조회 실패:', error);
            toast.error('게시글 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleModalClose = () => {
        setCreateModalOpen(false);
        setEditingDuo(null);
        setIsEditMode(false);
    };

    const handleUserClick = (user) => {
        if (user.name === currentUser.name && user.tag === currentUser.tag) return;
        setSelectedUser(user);
    };

    const handleApplyDuo = async (user, boardUUID) => {
        if (!isUserLoggedIn) {
            setLoginModalOpen(true);
            return;
        }

        try {
            const alreadyApplied = await checkAlreadyApplied(boardUUID);
            if (alreadyApplied) {
                alert('이미 신청한 게시글입니다.');
                return;
            }
        } catch (error) {
            console.error('중복 신청 체크 실패:', error);
            // 에러가 발생해도 신청은 진행 (서버에서 한번 더 체크하므로)
        }

        setSelectedUser(user);
        setCurrentBoardUUID(boardUUID);
        setOpenSendModal(true);
    };

    const handleLoginModalClose = () => {
        setLoginModalOpen(false);
    };

    const handleModalSuccess = async (newBoardData) => {
        if (isUserLoggedIn) {
            try {
                if (isEditMode) {
                    setDisplayedUsers(prev =>
                        prev.map(user =>
                            user.id === newBoardData.id ? newBoardData : user
                        )
                    );
                    setAllDuoUsers(prev =>
                        prev.map(user =>
                            user.id === newBoardData.id ? newBoardData : user
                        )
                    );
                    toast.success('게시글이 수정되었습니다.');
                } else {
                    setHasExistingBoard(true);
                    if (newBoardData) {
                        setDisplayedUsers(prev => {
                            const exists = prev.some(user => user.id === newBoardData.id);
                            if (!exists) {
                                return [newBoardData, ...prev];
                            }
                            return prev;
                        });
                        setAllDuoUsers(prev => {
                            const exists = prev.some(user => user.id === newBoardData.id);
                            if (!exists) {
                                return [newBoardData, ...prev];
                            }
                            return prev;
                        });
                    }
                }

                queryClient.cancelQueries(['duoUsers']);
                setTimeout(() => {
                    queryClient.invalidateQueries(['duoUsers']);
                }, 1000);

            } catch (error) {
                console.log('게시물 상태 업데이트 실패:', error);
            }
        }
    };

    const handleDeleteSuccess = async (deletedUserId) => {
        try {
            setSelectedUser(null);
            setDisplayedUsers(prev => prev.filter(user => user.id !== deletedUserId));
            setAllDuoUsers(prev => prev.filter(user => user.id !== deletedUserId));
            setHasExistingBoard(false);
            queryClient.invalidateQueries(['duoUsers']);
        } catch (error) {
            console.log('삭제 후 상태 업데이트 실패:', error);
        }
    };

    const filteredUsers = displayedUsers.filter(u => {
        // 포지션 필터
        const positionMatch = positionFilter === 'nothing' || u.position?.toLowerCase() === positionFilter;

        // 큐 타입 필터
        const queueMatch = rankType === 'all' ||
            (rankType === 'solo' && u.queueType === '랭크') ||
            (rankType === 'normal' && u.queueType === '일반') ||
            (rankType === 'aram' && u.queueType === '칼바람');

        // 티어 필터
        const tierMatch = schoolFilter === 'all' ||
            u.tier?.toLowerCase() === schoolFilter.toLowerCase();

        return positionMatch && queueMatch && tierMatch;
    });

    return (
        <Box sx={{backgroundColor: theme.palette.background.default, minHeight: '100vh', pt: 5}}>
            <Container maxWidth="lg" sx={{px: {xs: 1, sm: 3}}}>
                <FilterBar
                    positionFilter={positionFilter}
                    onPositionClick={setPositionFilter}
                    rankType={rankType}
                    setRankType={setRankType}
                    schoolFilter={schoolFilter}
                    setSchoolFilter={setSchoolFilter}
                    onRegisterDuo={handleRegisterDuo}
                    hasExistingBoard={hasExistingBoard}
                    isLoggedIn={isUserLoggedIn}
                    isRefreshing={isRefreshing}
                    isCheckingBoard={isCheckingBoard} // 추가 prop
                    canRefresh={canRefresh}
                    cooldownTime={cooldownTime}
                />

                {/* 테이블 영역 - 가로 스크롤 적용 */}
                <Box sx={{overflowX: {xs: 'auto', sm: 'visible'}}}>
                    <Box sx={{minWidth: {xs: '900px', sm: 'auto'}}}>
                        <DuoHeader/>

                        {isCreatingBoard && (
                            <Box sx={{
                                ...itemRowStyle,
                                backgroundColor: '#3A3B4F',
                                border: '2px solid #42E6B5',
                                justifyContent: 'center',
                                py: 2,
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    color: '#42E6B5'
                                }}>
                                    <CircularProgress
                                        size={24}
                                        sx={{ color: '#42E6B5' }}
                                    />
                                    <Typography sx={{
                                        fontSize: '0.9rem',
                                        fontWeight: 500
                                    }}>
                                        게시글을 등록하고 있습니다...
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {isLoading ? (
                            <Box sx={{textAlign: 'center', py: 4, color: '#fff'}}>
                                <CircularProgress sx={{color: '#A35AFF'}}/>
                            </Box>
                        ) : (
                            <>
                                {filteredUsers.length === 0 ? (
                                    <Box sx={{
                                        textAlign: 'center',
                                        py: 4,
                                        color: '#666',
                                        backgroundColor: '#2B2C3C',
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10
                                    }}>
                                        <Typography>등록된 듀오 게시물이 없습니다.</Typography>
                                    </Box>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <DuoItem
                                            key={user.id}
                                            user={user}
                                            currentUser={currentUser}
                                            onApplyDuo={() => handleApplyDuo(user, user.id)}
                                            onUserClick={handleUserClick}
                                            onDelete={handleDeleteSuccess}
                                            onEdit={handleEditDuo}
                                        />
                                    ))
                                )}
                            </>
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

                {!hasMore && displayedUsers.length > 0 && (
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

            {/* 모달들 */}
            <CreateDuoModal
                open={isCreateModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                onLoadingStart={setIsCreatingBoard}
                editData={editingDuo}
                isEditMode={isEditMode}
            />

            {selectedUser && !openSendModal && (
                <DuoDetailModal
                    open={Boolean(selectedUser)}
                    handleClose={() => setSelectedUser(null)}
                    partyData={selectedUser}
                />
            )}

            {openSendModal && (
                <SendDuoModal
                    open={openSendModal}
                    boardUUID={currentBoardUUID}
                    userData={selectedUser}
                    handleClose={() => {
                        setOpenSendModal(false);
                        setSelectedUser(null);
                        setCurrentBoardUUID(null);
                    }}
                />
            )}

            <LoginModal
                open={loginModalOpen}
                onClose={handleLoginModalClose}
                redirectTo={location.pathname}
            />

            <ConfirmRequiredDialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
            />
        </Box>
    );
}

// 수정된 FilterBar 컴포넌트
function FilterBar({
                       positionFilter,
                       onPositionClick,
                       rankType,
                       setRankType,
                       schoolFilter,
                       setSchoolFilter,
                       onRegisterDuo,
                       hasExistingBoard,
                       isLoggedIn,
                       isRefreshing,
                       isCheckingBoard,
                       canRefresh,
                       cooldownTime
                   }) {
    const getButtonText = () => {
        if (!isLoggedIn) return '듀오등록하기';
        if (isCheckingBoard) return '확인 중...';
        if (isRefreshing) return '끌어올리는 중...';

        // 쿨다운 중이면 남은 시간 표시
        if (hasExistingBoard && cooldownTime) {
            return formatCooldownTime(cooldownTime);
        }

        return hasExistingBoard ? '게시물 끌어올리기' : '듀오등록하기';
    };
    const tierOptions = [
        {value: 'all', label: '전체 티어'},
        {value: 'iron', label: '아이언'},
        {value: 'bronze', label: '브론즈'},
        {value: 'silver', label: '실버'},
        {value: 'gold', label: '골드'},
        {value: 'platinum', label: '플래티넘'},
        {value: 'emerald', label: '에메랄드'},
        {value: 'diamond', label: '다이아몬드'},
        {value: 'master', label: '마스터'},
        {value: 'grandmaster', label: '그랜드마스터'},
        {value: 'challenger', label: '챌린저'}
    ];
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
        <Box sx={{mb: 3}}>
            {/* 데스크톱 버전 */}
            <Box sx={{
                display: {xs: 'none', sm: 'flex'},
                alignItems: 'center',
                gap: 2
            }}>
                <PositionFilterBar positionFilter={positionFilter} onPositionClick={onPositionClick}/>

                <FormControl variant="outlined" size="small" sx={{height: 48, minWidth: 120}}>
                    <Select
                        value={rankType}
                        onChange={(e) => setRankType(e.target.value)}
                        sx={selectStyle}
                    >
                        <MenuItem value="all">큐 타입</MenuItem>
                        <MenuItem value="solo">랭크</MenuItem>
                        <MenuItem value="normal">일반</MenuItem>
                        <MenuItem value="aram">칼바람</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="outlined" size="small" sx={{height: 48, minWidth: 140}}>
                    <Select
                        value={schoolFilter}
                        onChange={(e) => setSchoolFilter(e.target.value)}
                        sx={selectStyle}
                    >
                        {tierOptions.map((tier) => (
                            <MenuItem key={tier.value} value={tier.value}>
                                {tier.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    disabled={isButtonDisabled}
                    sx={{
                        ...registerBtnStyle,
                        ...getButtonStyle()
                    }}
                    onClick={onRegisterDuo}
                >
                    {getButtonText()}
                </Button>
            </Box>

            {/* 모바일 버전 */}
            <Box sx={{display: {xs: 'block', sm: 'none'}}}>
                <Box sx={{mb: 2}}>
                    <PositionFilterBar positionFilter={positionFilter} onPositionClick={onPositionClick}/>
                </Box>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'space-between'
                }}>
                    <FormControl variant="outlined" size="small" sx={{height: 40, flex: 1, minWidth: 80}}>
                        <Select
                            value={rankType}
                            onChange={(e) => setRankType(e.target.value)}
                            sx={{
                                ...selectStyle,
                                height: 40,
                                fontSize: '0.85rem'
                            }}
                        >
                            <MenuItem value="all">큐 타입</MenuItem>
                            <MenuItem value="solo">랭크</MenuItem>
                            <MenuItem value="normal">일반</MenuItem>
                            <MenuItem value="aram">칼바람</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" size="small" sx={{height: 40, flex: 1, minWidth: 90}}>
                        <Select
                            value={schoolFilter}
                            onChange={(e) => setSchoolFilter(e.target.value)}
                            sx={{
                                ...selectStyle,
                                height: 40,
                                fontSize: '0.85rem'
                            }}
                        >
                            {tierOptions.map((tier) => (
                                <MenuItem key={tier.value} value={tier.value}>
                                    {tier.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        disabled={isButtonDisabled}
                        sx={{
                            fontWeight: 'bold',
                            height: 40,
                            px: 2,
                            color: '#fff',
                            fontSize: '0.85rem',
                            borderRadius: 0.8,
                            minWidth: 100,
                            ...getButtonStyle()
                        }}
                        onClick={onRegisterDuo}
                    >
                        {getButtonText()}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

function DuoHeader() {
    const columns = [2, 1, 1, 1, 1, 3, 1, 1, 1.1, 0.5];
    const headers = ['소환사', '큐 타입', '주 포지션', '티어', '찾는 포지션', '한 줄 소개', '등록 일시', '만료 일시', '듀오 신청', ''];
    return (
        <Box sx={headerRowStyle}>
            {headers.map((text, i) => (
                <Box
                    key={i}
                    sx={{
                        flex: `${columns[i]} 0 0`, // ✅ flex-grow, flex-shrink, flex-basis 명시
                        textAlign: 'center',
                        minWidth: 0, // ✅ 텍스트 오버플로우 방지
                        // ✅ 각 컬럼별 최소 너비 설정
                        ...(i === 0 && { minWidth: '180px' }), // 소환사
                        ...(i === 5 && { minWidth: '200px' }), // 한 줄 소개
                    }}
                >
                    {text}
                </Box>
            ))}
        </Box>
    );
}

function DuoItem({user, currentUser, onApplyDuo, onUserClick, onDelete, onEdit}) {
    const columns = [2, 1, 1, 1, 1, 3, 1, 1, 1.1, 0.5];
    const isMine = user.memberId === currentUser.memberId;

    const [anchorEl, setAnchorEl] = useState(null);
    const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(user.updatedAt));
    const [expiryTime, setExpiryTime] = useState(() => formatTimeUntilExpiry(user.updatedAt));
    const [expired, setExpired] = useState(() => isExpired(user.updatedAt));

    useEffect(() => {
        const updateTimes = () => {
            setRelativeTime(formatRelativeTime(user.updatedAt));
            setExpiryTime(formatTimeUntilExpiry(user.updatedAt));
            setExpired(isExpired(user.updatedAt));
        };

        updateTimes();
        const interval = setInterval(updateTimes, 60000);
        return () => clearInterval(interval);
    }, [user.updatedAt]);

    const handleEdit = async () => {
        setAnchorEl(null);
        if (onEdit) {
            onEdit(user.id);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('정말로 게시글을 삭제하시겠습니까?')) {
            try {
                await deleteMyDuoBoard();
                toast.success('게시글이 삭제되었습니다.');
                setAnchorEl(null);
                if (onDelete) onDelete(user.id);
            } catch (error) {
                console.error('게시글 삭제 실패:', error);
                toast.error('게시글 삭제에 실패했습니다.');
                setAnchorEl(null);
            }
        } else {
            setAnchorEl(null);
        }
    };

    return (
        <Box
            onClick={() => onUserClick(user)}
            sx={{
                ...itemRowStyle,
                opacity: expired ? 0.6 : 1,
                backgroundColor: expired ? '#1a1a1a' : '#2B2C3C',
                '&:hover': {
                    backgroundColor: expired ? '#1e1e1e' : '#28282F'
                }
            }}
        >
            <Box sx={{
                flex: `${columns[0]} 0 0`,
                minWidth: '180px', // 소환사 정보 최소 너비
                overflow: 'hidden',
                textOverflow: 'ellipsis', // ✅ 텍스트가 넘치면 ... 표시
                whiteSpace: 'nowrap',     // ✅ 텍스트 줄바꿈 방지
            }}>

                <SummonerInfo name={user.name} avatarUrl={user.avatarUrl} tag={user.tag} school={user.school} verificationType={user.verificationType}/>
            </Box>
            <Box sx={{flex: columns[1], textAlign: 'center'}}>{user.queueType}</Box>
            <Box sx={{flex: columns[2], textAlign: 'center'}}>
                <PositionIcon position={user.position}/>
            </Box>
            <Box sx={{flex: columns[3], textAlign: 'center'}}>
                <TierBadge tier={user.tier} score={user.leaguePoint} rank={user.rank}/>
            </Box>
            <Box sx={{flex: columns[4], textAlign: 'center'}}>
                <PositionIcon position={user.lookingForPosition}/>
            </Box>
            <Box sx={{
                flex: columns[5],
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
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
                    {user.memo}
                </Box>
            </Box>
            <Box sx={{
                flex: columns[6],
                textAlign: 'center',
                fontSize: {xs: '0.7rem', sm: '0.75rem'}
            }}>{relativeTime}</Box>

            <Box sx={{
                flex: columns[7],
                textAlign: 'center',
                fontSize: {xs: '0.7rem', sm: '0.75rem'},
                color: getExpiryColor(expiryTime)
            }}>
                {expiryTime}
            </Box>
            <Box sx={{flex: columns[8], textAlign: 'center'}}>
                {!isMine ? ( // ✅ 내 게시글이 아닐 때만 신청 버튼 표시
                    <Button variant="contained" sx={applyBtnStyle} onClick={(e) => {
                        e.stopPropagation();
                        onApplyDuo();
                    }}>
                        신청
                    </Button>
                ) : (
                    <Box sx={{ color: '#666', fontSize: '0.85rem' }}>내 게시글</Box>
                )}
            </Box>
            <Box sx={{flex: columns[9], textAlign: 'right'}}>
                {isMine && (
                    <>
                        <IconButton onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(e.currentTarget);
                        }}>
                            <MoreVertIcon sx={{color: '#aaa'}}/>
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                            <MenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit();
                                }}
                            >
                                수정
                            </MenuItem>
                            <MenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                            >
                                삭제
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Box>
        </Box>
    );
}

// 스타일 상수들
const selectStyle = {
    backgroundColor: '#2c2c3a',
    color: '#fff',
    borderRadius: 0.8,
    height: 48,
    '.MuiOutlinedInput-notchedOutline': {borderColor: '#424254'},
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: '#42E6B5'},
    '.MuiSelect-select': {display: 'flex', alignItems: 'center', padding: '0 32px 0 14px', height: '100%'},
    '& .MuiSelect-icon': {color: '#7B7B8E'},
};

const registerBtnStyle = {
    ml: 'auto',
    fontWeight: 'bold',
    height: 56,
    px: 3,
    background: 'linear-gradient(90deg, #A35AFF 0%, #FF5AC8 100%)',
    color: '#fff',
    fontSize: 16,
    borderRadius: 0.8,
    '&:hover': {
        background: 'linear-gradient(90deg, #B36BFF 0%, #FF6BD5 100%)',
    },
};

const headerRowStyle = {
    display: 'flex',
    alignItems: 'center',
    px: 2,
    py: 1.5,
    fontSize: 14,
    fontWeight: 500,
    color: '#999',
    backgroundColor: '#28282F',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    minWidth: 'fit-content',
};

const itemRowStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2B2C3C',
    px: 2,
    py: 1,
    borderBottom: '2px solid #12121a',
    cursor: 'pointer',
    '&:hover': {backgroundColor: '#2E2E38'},
    minWidth: 'fit-content',
};

const applyBtnStyle = {
    backgroundColor: '#424254',
    color: '#fff',
    borderRadius: 0.8,
    fontWeight: 'bold',
    px: 2,
    py: 1,
    border: '1px solid #71717D',
};
