// src/components/Header.jsx
import React, {useState, useEffect} from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import useAuthStore from '../storage/useAuthStore';
import {getMyInfo} from '../apis/authAPI';
import { useMediaQuery, useTheme, Link } from '@mui/material';
import useNotificationStore from '../storage/useNotification';
import { fetchUnreadNotifications, markNotificationAsRead } from '../apis/notificationAPI';
import { formatRelativeTime } from '../utils/timeUtils.js'
import {
    AppBar,
    Toolbar,
    Box,
    Container,
    Typography,
    Button,
    IconButton,
    Badge,
    Menu,
    MenuItem,
} from '@mui/material';
import {useLocation, useNavigate} from 'react-router-dom';
import logo from '../../public/assets/logo.png';
import LoginModal from './login/LoginModal';
import { getSocket } from '../socket/socket'; // ✅ connectSocket, disconnectSocket 제거
import useOnlineStore from '../storage/useOnlineStore';

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const {accessToken, userData, logout} = useAuthStore();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const userMenuOpen = Boolean(anchorEl);
    const {onlineCount} = useOnlineStore(); // Zustand에서 가져옴
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // sm 이하 (모바일)

    const handleUserMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMySetting = () => {
        handleUserMenuClose();
        navigate('/mysetting');
    };

    const handleLogout = () => {
        handleUserMenuClose();

        // ✅ App.js에서 관리하는 소켓을 통해 leave_online 이벤트만 전송
        const socket = getSocket();
        const memberId = userData?.memberId;
        if (socket && socket.connected && memberId) {
            socket.emit('leave_online', { memberId });
        }

        // Zustand 상태 초기화
        logout();

        // 알림 상태 초기화
        clearNotifications();

        // 로컬스토리지에서 토큰 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // 홈으로 이동
        navigate('/');
    };

    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const notificationOpen = Boolean(notificationAnchorEl);

    const handleNotificationClick = (event) => {
        setNotificationAnchorEl(notificationAnchorEl ? null : event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchorEl(null);
    };
    const notifications = useNotificationStore((state) => state.notifications);
    const addNotification = useNotificationStore((state) => state.addNotification);
    const removeNotification = useNotificationStore((state) => state.removeNotification);
    const clearNotifications = useNotificationStore((state) => state.clearNotifications);

    const handleRemoveNotification = async (id) => {
        try {
            await markNotificationAsRead(id);
            removeNotification(id);
        } catch (err) {
            console.error('알림 읽음 처리 실패', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await Promise.all(
                notifications.map((noti) => markNotificationAsRead(noti.id))
            );
            clearNotifications();
        } catch (err) {
            console.error('모두 읽음 처리 실패', err);
        }
    };

    const menuItems = [
        {label: '전적 검색', path: '/'},
        {label: '랭킹', path: '/ranking'},
        {label: '내전', path: '/scrim'},
        {label: '듀오 찾기', path: '/duo'},
        {label: '마이페이지', path: '/mypage'},
    ];

    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;
    const NoticeBanner = () => {
        const [isVisible, setIsVisible] = useState(true);

        if (!isVisible) return null;

        return (
            <Box sx={{
                backgroundColor: '#ff6b35',
                color: '#fff',
                py: 1,
                px: 2,
                textAlign: 'center',
                position: 'relative',
                borderBottom: '1px solid #e55a2b'
            }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                    }}
                >
                    추가기능 도입 예정 (시험기간 후)
                    <Link
                        href="https://url.kr/cwo6rj"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: '#fff',
                            marginLeft: '16px',
                            textDecoration: 'underline',
                            '&:hover': {
                                color: '#ffe0d6'
                            }
                        }}
                    >
                        건의사항 링크
                    </Link>
                </Typography>
                <IconButton
                    size="small"
                    onClick={() => setIsVisible(false)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#fff',
                        fontSize: '0.8rem',
                        p: 0.5
                    }}
                >
                    ✕
                </IconButton>
            </Box>
        );
    };

    useEffect(() => {
        if (!accessToken) return;

        async function loadUnreadNotifications() {
            try {
                const unreadList = await fetchUnreadNotifications();

                unreadList.forEach((noti) => {
                    addNotification({
                        id: noti.id,
                        message: noti.message,
                        time: new Date(noti.regDate),
                        redirectUrl: noti.redirectUrl,
                    });
                });
            } catch (err) {
                console.error('알림 불러오기 실패', err);
            }
        }

        loadUnreadNotifications();
    }, [accessToken, addNotification]);
    return (
        <>
            <AppBar position="sticky" sx={{backgroundColor: '#2b2c3c', padding: 0, overflow: 'visible'}}>
                <Box sx={{borderBottom: '1px solid #3c3d4e'}}>
                    <Container maxWidth="lg">
                        <Toolbar sx={{minHeight: '72px', px: 0, py: 1}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%'
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <img
                                        src={logo}
                                        alt="TIMO.GG logo"
                                        style={{
                                            height: 42,
                                            cursor: 'pointer'  // 마우스 커서를 포인터로 변경
                                        }}
                                        onClick={() => navigate('/')}  // 클릭 시 메인 페이지로 이동
                                    />                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <BarChartIcon sx={{fontSize: 20, color: '#aaa'}}/>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#aaa',
                                                fontSize: {xs: '0.75rem', sm: '0.875rem'},  // 모바일용 조금 줄임
                                                lineHeight: {xs: 1.2, sm: 1.4},             // 모바일에서 약간 더 조밀하게
                                            }}
                                        >
                                            현재 접속중 <span style={{color: '#ff5b5b'}}>{onlineCount}</span>
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ marginLeft: 'auto' }}>
                                    {accessToken ? (
                                        <>
                                            <Button
                                                onClick={handleUserMenuClick}
                                                size="large"
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: '#3b3c4f',
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                    fontSize: { xs: '0.85rem', sm: '1rem' },
                                                    minHeight: { xs: '40px', sm: '48px' },
                                                    padding: { xs: '3px 10px', sm: '8px 20px' },
                                                    maxWidth: { xs: '48px', sm: 'none' },
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    ':hover': { backgroundColor: '#50516a' },
                                                }}
                                            >
                                                {isMobile ? (
                                                    <PersonIcon />
                                                ) : (
                                                    <>
                                                        <PersonIcon sx={{ mr: 1 }} />
                                                        {userData?.username || '유저'}
                                                    </>
                                                )}
                                            </Button>
                                            <Menu
                                                anchorEl={anchorEl}
                                                open={userMenuOpen}
                                                onClose={handleUserMenuClose}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                PaperProps={{
                                                    sx: {
                                                        backgroundColor: '#2b2c3c',
                                                        borderRadius: 2,
                                                        mt: 1,
                                                    },
                                                }}
                                            >
                                                <MenuItem
                                                    onClick={handleMySetting}
                                                    sx={{
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem',
                                                        px: 3,
                                                        py: 1.5,
                                                        ':hover': { backgroundColor: '#3b3c4f' },
                                                    }}
                                                >
                                                    내 계정
                                                </MenuItem>
                                                <Box sx={{ height: '1px', backgroundColor: '#3b3c4f', mx: 1 }} />
                                                <MenuItem
                                                    onClick={handleLogout}
                                                    sx={{
                                                        color: '#fff',
                                                        fontSize: '1rem',
                                                        px: 3,
                                                        py: 1.5,
                                                        ':hover': { backgroundColor: '#3b3c4f' },
                                                    }}
                                                >
                                                    로그아웃
                                                </MenuItem>
                                            </Menu>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => setIsLoginModalOpen(true)}
                                            size="large"
                                            variant="contained"
                                            sx={{
                                                backgroundColor: '#3b3c4f',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: { xs: '0.85rem', sm: '1rem' },
                                                minHeight: { xs: '40px', sm: '48px' },
                                                padding: { xs: '3px 13px', sm: '8px 20px' },
                                                ':hover': { backgroundColor: '#50516a' },
                                            }}
                                        >
                                            로그인
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Toolbar>
                    </Container>
                </Box>

                <Box sx={{backgroundColor: '#2d2d32'}}>
                    <Container maxWidth="lg">
                        <Toolbar sx={{minHeight: {xs: '48px', sm: '48px'}, px: 0}}>
                            <Box     sx={{
                                display: 'flex',
                                overflowX: 'auto',
                                whiteSpace: 'nowrap',
                                gap: { xs: 3, sm: 4 },
                                flexGrow: 1,
                                '&::-webkit-scrollbar': {
                                    display: 'none',  // 크롬, 사파리 등에서 스크롤바 숨김
                                },
                                '-ms-overflow-style': 'none',  // IE/엣지
                                'scrollbar-width': 'none',     // 파이어폭스
                            }}>
                                {menuItems.map((item) => {
                                    let isActive = false;
                                    if (item.path === '/mypage') {
                                        isActive = location.pathname === '/mypage' || location.pathname === '/chat';
                                    } else {
                                        isActive = location.pathname === item.path;
                                    }


                                    return (
                                        <Typography
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            variant="body1"
                                            sx={{
                                                cursor: 'pointer',
                                                color: isActive ? '#ffffff' : '#B7B7C9',
                                                fontWeight: isActive ? 'bold' : 'normal',
                                                borderBottom: isActive ? '2px solid #ffffff' : 'none',
                                                pb: 0.5,
                                                fontSize: {xs: '0.9rem', sm: '1rem'},
                                            }}
                                        >
                                            {item.label}
                                        </Typography>
                                    );
                                })}
                            </Box>

                            <Box sx={{marginLeft: 'auto'}}>
                                <IconButton onClick={handleNotificationClick} sx={{p: {xs: '6px', sm: '8px'}}}>
                                    <Badge badgeContent={notifications.length} color="error">
                                        <NotificationsIcon
                                            sx={{color: '#fff', fontSize: {xs: '1.2rem', sm: '1.5rem'}}}/>
                                    </Badge>
                                </IconButton>
                                <Menu
                                    anchorEl={notificationAnchorEl}
                                    open={notificationOpen}
                                    onClose={handleNotificationClose}
                                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                    transformOrigin={{vertical: 'top', horizontal: 'right'}}
                                    PaperProps={{
                                        sx: {
                                            backgroundColor: '#2d2d32',
                                            color: '#fff',
                                            width: {xs: 260, sm: 320},
                                            boxShadow: 3,
                                            borderRadius: 1,
                                            overflow: 'visible',

                                        },
                                    }}
                                >
                                    <Box sx={{px: 2, pt: 1, pb: 1}}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{fontWeight: 'bold', fontSize: {xs: '0.95rem', sm: '1rem'}}}
                                        >
                                            알림
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            px: 2,
                                            maxHeight: 290,
                                            overflowY: 'auto',
                                            pr: 1,
                                            '&::-webkit-scrollbar': {
                                                width: '6px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                backgroundColor: '#C1C1C1',
                                                borderRadius: 4,
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                backgroundColor: '#2d2d32',
                                            },
                                        }}
                                    >
                                        {notifications.length > 0 ? (
                                            notifications.map((noti) => (
                                                <Box
                                                    key={noti.id}
                                                    sx={{
                                                        backgroundColor: '#3b3c4f',
                                                        borderRadius: 2,
                                                        p: {xs: 1, sm: 1.5},
                                                        pr: {xs: 4, sm: 4},
                                                        mb: 1,
                                                        fontSize: {xs: '0.8rem', sm: '0.87rem'},
                                                        position: 'relative',
                                                        cursor: 'pointer',
                                                        wordWrap: 'break-word',
                                                        overflowWrap: 'break-word',
                                                    }}
                                                    onClick={async () => {
                                                        try {
                                                            await markNotificationAsRead(noti.id);
                                                            removeNotification(noti.id);
                                                            const fullUrl = noti.redirectUrl.startsWith('http')
                                                                ? noti.redirectUrl
                                                                : `${window.location.origin}${noti.redirectUrl}`;
                                                            window.location.href = fullUrl;
                                                            handleNotificationClose();
                                                        } catch (err) {
                                                            console.error('알림 이동/읽음 처리 실패', err);
                                                        }
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            wordWrap: 'break-word',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'break-word'

                                                        }}
                                                    >
                                                        {noti.message}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{color: '#aaa'}}>
                                                        {formatRelativeTime(noti.time)}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveNotification(noti.id);}}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            color: '#aaa',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        ✕
                                                    </IconButton>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" sx={{color: '#aaa', px: 1, py: 2}}>
                                                새로운 알림이 없습니다.
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{textAlign: 'center', py: 1}}>
                                        <Button
                                            size="small"
                                            onClick={handleMarkAllAsRead}
                                            sx={{
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: {xs: '0.8rem', sm: '0.85rem'},
                                                ':hover': {backgroundColor: '#3b3c4f'},
                                            }}
                                        >
                                            모두 읽음
                                        </Button>
                                    </Box>
                                </Menu>
                            </Box>
                        </Toolbar>
                    </Container>

                </Box>
            </AppBar>
            <NoticeBanner />
            <LoginModal
                open={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    );
}
