import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {useSearchParams, useLocation, useNavigate} from 'react-router-dom';
import {
    Box,
    Typography,
    IconButton,
    Button,
    TextField,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useChatStore from '../storage/useChatStore';
import useAuthStore from '../storage/useAuthStore';
import SummonerInfo from '../components/SummonerInfo';
import ChatMessage from '../components/chat/ChatMessage';
import SystemMessage from '../components/chat/SystemMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import {sendMessage, leaveChatRoom, joinChatRoom} from '../socket/chatSocket';
import {getSocket} from '../socket/socket';
import {
    fetchChatRooms,
    fetchChatMessages,
    leaveChatRoom as apiLeaveChatRoom,
    fetchMessagesSince,
} from '../apis/chatAPI';
import {initializeChatSocket} from '../socket/chatSocket';
import {formatRelativeTime, shouldShowDateSeparator, shouldShowTimestamp} from '../utils/timeUtils';
import DateSeparator from "../components/chat/DateSeparater.jsx";

export default function ChatPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { chatList, setChatList, addMessage, updateMessages, removeChatRoom } = useChatStore();
    const {userData} = useAuthStore();

    // ✅ 상태 최적화 - 불필요한 계산 제거
    const roomIdFromUrl = useMemo(() => {
        const id = parseInt(searchParams.get('roomId'), 10);
        return isNaN(id) ? null : id;
    }, [searchParams]);

    const shouldJoin = location.state?.shouldJoin === true;
    const [selectedChatId, setSelectedChatId] = useState(shouldJoin ? roomIdFromUrl : null);
    const [chatInput, setChatInput] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const [anchorEls, setAnchorEls] = useState({});
    const [openConfirm, setOpenConfirm] = useState(false);
    const [targetChatId, setTargetChatId] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showChatRoom, setShowChatRoom] = useState(false);

    // Refs
    const chatContainerRef = useRef(null);
    const isFetching = useRef(false);
    const isInitialLoad = useRef(true);
    const isPaging = useRef(false);

    // ✅ 메모이제이션 최적화 - 캐시 적용
    const safeChatList = useMemo(() => {
        if (!Array.isArray(chatList)) return [];
        return chatList.filter(chat =>
            chat &&
            chat.id !== null &&
            chat.id !== undefined &&
            typeof chat.id === 'number'
        );
    }, [chatList]);

    const selectedChat = useMemo(() => {
        if (!selectedChatId || !safeChatList.length) return null;
        return safeChatList.find(chat => chat?.id === selectedChatId) || null;
    }, [safeChatList, selectedChatId]);

    // ✅ 메시지 처리 최적화 - 메모이제이션 캐시 적용
    const processedMessages = useMemo(() => {
        if (!selectedChat?.messages?.length) return [];

        // 캐시를 사용하여 중복 계산 방지
        const messageCache = new Map();

        return selectedChat.messages.map((msg, idx) => {
            const cacheKey = `${msg.timestamp}-${idx}-${isMobile}`;

            if (messageCache.has(cacheKey)) {
                return messageCache.get(cacheKey);
            }

            const previousMsg = idx > 0 ? selectedChat.messages[idx - 1] : null;
            const showTime = shouldShowTimestamp(msg, previousMsg, isMobile);
            const showDateSep = shouldShowDateSeparator(msg, previousMsg);

            const result = {
                ...msg,
                showTime,
                showDateSep,
                id: `${msg.timestamp}-${idx}`
            };

            messageCache.set(cacheKey, result);
            return result;
        });
    }, [selectedChat?.messages, isMobile]);

    // ✅ 핸들러 최적화 - useCallback으로 리렌더링 방지
    const handleChatRoomClick = useCallback((chatId) => {
        sessionStorage.setItem(`shouldJoin:${chatId}`, 'true');
        setSelectedChatId(chatId);
        if (isMobile) {
            setShowChatRoom(true);
        }
    }, [isMobile]);

    const handleBackToList = useCallback(() => {
        setShowChatRoom(false);
        setSelectedChatId(null);
    }, []);

    // ✅ 스크롤 핸들러 최적화 - 쓰로틀링 적용
    const handleScroll = useCallback(() => {
        const container = chatContainerRef.current;
        if (!container || isFetching.current || !hasMore) return;

        if (container.scrollTop < 50) {
            const prevScrollHeight = container.scrollHeight;
            const prevScrollTop = container.scrollTop;

            isPaging.current = true;
            isFetching.current = true;

            fetchChatMessages(selectedChatId, page)
                .then((rawMessages) => {
                    const formatted = rawMessages.map(msg => ({
                        type: msg.senderId === userData?.memberId ? 'sent' : 'received',
                        text: msg.content,
                        timestamp: msg.timestamp,
                    }));

                    if (formatted.length === 0) {
                        setHasMore(false);
                    } else {
                        updateMessages(selectedChatId, formatted, true);
                        setPage(prev => prev + 1);

                        setTimeout(() => {
                            const newScrollHeight = container.scrollHeight;
                            const scrollDelta = newScrollHeight - prevScrollHeight;
                            container.scrollTop = prevScrollTop + scrollDelta;
                            isPaging.current = false;
                        }, 0);
                    }
                })
                .catch((err) => console.error('[페이징 메시지 로딩 실패]', err))
                .finally(() => {
                    isFetching.current = false;
                });
        }
    }, [selectedChatId, page, hasMore, updateMessages, userData?.memberId]);

    // ✅ 메시지 전송 최적화 - 낙관적 업데이트
    const handleSendMessage = useCallback(() => {
        const trimmedInput = chatInput?.trim();
        if (!trimmedInput || !selectedChatId) return;

        // 낙관적 업데이트: 즉시 UI에 표시
        const optimisticMessage = {
            type: 'sent',
            text: trimmedInput,
            timestamp: new Date().toISOString(),
            id: `temp-${Date.now()}`,
            isOptimistic: true
        };

        addMessage(selectedChatId, optimisticMessage);
        setChatInput(''); // 즉시 입력창 비우기

        // 서버 전송
        const socket = getSocket();
        if (socket) {
            socket.emit('send_message', {
                roomId: selectedChatId,
                content: trimmedInput,
            });
        }
    }, [chatInput, selectedChatId, addMessage]);

    const handleDelete = useCallback(async (id) => {
        try {
            await apiLeaveChatRoom(id);
            removeChatRoom(id);

            if (selectedChatId === id) {
                setSelectedChatId(null);
                if (isMobile) {
                    setShowChatRoom(false);
                }
            }

            sessionStorage.removeItem(`shouldJoin:${id}`);
            setAnchorEls(prev => ({...prev, [id]: null}));
            navigate('/mypage?tab=chat');
        } catch (err) {
            console.error(`[ChatPage] 채팅방 ${id} 나가기 실패:`, err);
            alert('채팅방 나가기에 실패했습니다.');
        }
    }, [selectedChatId, isMobile, removeChatRoom, navigate]);

    // ✅ 메시지 동기화 최적화
    const syncMissedMessages = useCallback(async (roomId) => {
        try {
            const currentChat = chatList.find(chat => chat.id === roomId);
            const lastMessage = currentChat?.messages?.slice(-1)[0];
            const lastTimestamp = lastMessage?.timestamp;

            if (!lastTimestamp) {
                const rawMessages = await fetchChatMessages(roomId, 0);
                const formatted = rawMessages
                    .map(msg => ({
                        type: msg.senderId === userData?.memberId ? 'sent' : 'received',
                        text: msg.content,
                        timestamp: msg.timestamp,
                    }))
                    .reverse();
                updateMessages(roomId, formatted, false);
                return;
            }

            const newMessages = await fetchMessagesSince(roomId, lastTimestamp);
            if (newMessages.length > 0) {
                const formatted = newMessages.map(msg => ({
                    type: msg.senderId === userData?.memberId ? 'sent' : 'received',
                    text: msg.content,
                    timestamp: msg.timestamp,
                }));
                updateMessages(roomId, formatted, false);
            }
        } catch (error) {
            console.error('[메시지 동기화 실패]', error);
        }
    }, [chatList, userData?.memberId, updateMessages]);

    // ✅ useEffect 최적화 - 의존성 최소화
    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container || !selectedChat?.messages?.length) return;

        if (isInitialLoad.current && !isPaging.current) {
            isInitialLoad.current = false;
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 0);
            return;
        }

        const threshold = 100;
        const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceToBottom < threshold) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 0);
        }
    }, [selectedChat?.messages?.length]); // 길이만 의존성으로

    useEffect(() => {
        fetchChatRooms()
            .then((response) => {
                const rooms = response.data;
                if (!Array.isArray(rooms)) {
                    setChatList([]);
                    return;
                }

                const formatted = rooms
                    .filter(room => room?.roomId && typeof room.roomId === 'number')
                    .map((room) => {
                        const existing = chatList.find((c) => c?.id === room.roomId);
                        return {
                            id: room.roomId,
                            messages: existing?.messages || [],
                            user: {
                                name: room.opponentGameName || '알 수 없음',
                                tag: room.opponentTagLine || '',
                                avatarUrl: room.opponentProfileUrl || '',
                                school: room.opponentUnivName || '미인증',
                            },
                            lastMessage: room.lastMessage || '',
                            lastTime: room.lastMessageTime || '',
                            lastTimeFormatted: room.lastMessageTime ?
                                formatRelativeTime(room.lastMessageTime) : '',
                            unreadCount: room.unreadCount || 0,
                        };
                    });

                setChatList(formatted);
            })
            .catch((err) => {
                console.error('[ChatPage] 채팅방 목록 로딩 실패:', err);
                setChatList([]);
            });
    }, []); // 빈 의존성 배열로 한 번만 실행

    useEffect(() => {
        if (!selectedChatId) return;

        const shouldJoinFromStorage = sessionStorage.getItem(`shouldJoin:${selectedChatId}`) === 'true';
        if (!shouldJoinFromStorage) return;

        const socket = getSocket();
        if (!socket) return;

        joinChatRoom(selectedChatId);
        sessionStorage.removeItem(`shouldJoin:${selectedChatId}`);

        setPage(1);
        setHasMore(true);
        isInitialLoad.current = true;

        fetchChatMessages(selectedChatId, 0)
            .then((rawMessages) => {
                const formatted = rawMessages
                    .map(msg => ({
                        type: msg.senderId === userData?.memberId ? 'sent' : 'received',
                        text: msg.content,
                        timestamp: msg.timestamp,
                    }))
                    .reverse();

                updateMessages(selectedChatId, formatted, false);
                setPage(1);
            })
            .catch((err) => console.error('[ChatPage] 초기 메시지 로딩 실패:', err));

        return () => {
            leaveChatRoom(selectedChatId);
        };
    }, [selectedChatId]); // 최소 의존성

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && selectedChatId) {
                const socket = getSocket();
                if (socket && !socket.connected) {
                    socket.connect();
                    setTimeout(() => {
                        joinChatRoom(selectedChatId);
                    }, 500);
                }

                setTimeout(() => {
                    syncMissedMessages(selectedChatId);
                }, 1000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [selectedChatId, syncMissedMessages]);

    useEffect(() => {
        initializeChatSocket();
    }, []);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // ✅ 렌더링 최적화 - 컴포넌트 분리
    const renderChatListItem = useCallback((chat) => (
        <Box
            key={chat.id}
            onClick={() => handleChatRoomClick(chat.id)}
            sx={{
                p: 2,
                cursor: 'pointer',
                backgroundColor: selectedChatId === chat.id ? '#28282F' : 'transparent',
                borderBottom: '1px solid #2c2c3a',
                '&:hover': {
                    backgroundColor: '#28282F',
                },
                position: 'relative'
            }}
        >
            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                <SummonerInfo {...chat.user} />
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        setAnchorEls(prev => ({...prev, [chat.id]: e.currentTarget}));
                    }}
                >
                    <MoreVertIcon sx={{color: '#aaa'}}/>
                </IconButton>
            </Box>
            <Menu
                anchorEl={anchorEls[chat.id]}
                open={Boolean(anchorEls[chat.id])}
                onClose={() => setAnchorEls(prev => ({...prev, [chat.id]: null}))}
            >
                <MenuItem onClick={() => {
                    setTargetChatId(chat.id);
                    setOpenConfirm(true);
                }}>
                    나가기
                </MenuItem>
            </Menu>
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography fontSize={14} color="#aaa" sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '70%'
                }}>
                    {chat.lastMessage}
                </Typography>
                <Typography fontSize={14} color="#666">
                    {chat.lastTimeFormatted}
                </Typography>
            </Box>
        </Box>
    ), [selectedChatId, anchorEls, handleChatRoomClick]);

    const renderMessages = useCallback(() => (
        <Box ref={chatContainerRef} sx={{flex: 1, p: 2, overflowY: 'auto'}}>
            <SystemMessage message="채팅방이 생성되었습니다."/>
            {processedMessages.length > 0 ? (
                processedMessages.map((msg) => (
                    <React.Fragment key={msg.id}>
                        {msg.showDateSep && <DateSeparator date={msg.timestamp} />}
                        <ChatMessage
                            type={msg.type}
                            text={msg.text}
                            timestamp={msg.timestamp}
                            showTime={msg.showTime}
                        />
                    </React.Fragment>
                ))
            ) : (
                <Typography variant="body2" color="#aaa">메시지가 없습니다.</Typography>
            )}
        </Box>
    ), [processedMessages]);

    const renderMessageInput = useCallback(() => (
        <Box sx={{
            display: 'flex',
            p: 2,
            borderTop: '1px solid #3b3c4f',
            backgroundColor: '#2c2c3a',
            ...(isMobile && { position: 'sticky', bottom: 0, zIndex: 1000 })
        }}>
            <TextField
                fullWidth
                placeholder="메시지를 입력하세요..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                    if (isComposing) return;
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                InputProps={{
                    sx: {
                        color: '#fff',
                        backgroundColor: '#3b3c4f',
                        borderRadius: 1,
                        pl: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                        }
                    },
                }}
                sx={{
                    '& .MuiInputBase-input': {
                        fontSize: isMobile ? '16px' : '14px',
                    }
                }}
            />
            <IconButton
                sx={{color: '#42E6B5', ml: 1}}
                onClick={handleSendMessage}
            >
                <SendIcon/>
            </IconButton>
        </Box>
    ), [chatInput, isComposing, isMobile, handleSendMessage]);

    // 모바일에서 채팅방 리스트만 보여주는 경우
    if (isMobile && !showChatRoom) {
        return (
            <Box sx={{height: '100vh', backgroundColor: '#2c2c3a'}}>
                {safeChatList.length > 0 ? (
                    safeChatList.map(renderChatListItem)
                ) : (
                    <Box sx={{p: 2, textAlign: 'center'}}>
                        <Typography variant="body1" color="#aaa">채팅방이 없습니다.</Typography>
                    </Box>
                )}

                <ConfirmDialog
                    open={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    onConfirm={() => {
                        if (targetChatId) handleDelete(targetChatId);
                        setOpenConfirm(false);
                    }}
                    title="정말 나가시겠습니까?"
                    message="채팅방에서 나가면 대화 내용이 사라집니다."
                    confirmText="나가기"
                    cancelText="취소"
                    danger
                />
            </Box>
        );
    }

    // 모바일에서 개별 채팅방을 보여주는 경우
    if (isMobile && showChatRoom && selectedChat) {
        return (
            <Box sx={{height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#2c2c3a'}}>
                {/* 모바일 헤더 */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: '1px solid #3b3c4f',
                    backgroundColor: '#2c2c3a'
                }}>
                    <IconButton
                        onClick={handleBackToList}
                        sx={{ mr: 2, color: '#fff' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <SummonerInfo {...selectedChat.user} />
                    <Button
                        size="small"
                        sx={{ ml: 'auto', color: '#fff' }}
                        onClick={() => {
                            setTargetChatId(selectedChat.id);
                            setOpenConfirm(true);
                        }}
                    >
                        나가기
                    </Button>
                </Box>

                {/* 메시지 영역 */}
                {renderMessages()}

                {/* 메시지 입력 영역 */}
                {renderMessageInput()}

                <ConfirmDialog
                    open={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    onConfirm={() => {
                        if (targetChatId) handleDelete(targetChatId);
                        setOpenConfirm(false);
                    }}
                    title="정말 나가시겠습니까?"
                    message="채팅방에서 나가면 대화 내용이 사라집니다."
                    confirmText="나가기"
                    cancelText="취소"
                    danger
                />
            </Box>
        );
    }

    // 데스크톱 기존 구조 그대로 유지
    return (
        <Box sx={{display: 'flex', height: 700, overflow: 'hidden', backgroundColor: '#2c2c3a'}}>
            {/* 왼쪽 채팅방 리스트 */}
            <Box sx={{width: 500, backgroundColor: '#2c2c3a', borderRight: '2px solid #171717'}}>
                <Box sx={{height: 700, backgroundColor: '#2c2c3a'}}>
                    {safeChatList.length > 0 ? (
                        safeChatList.map(renderChatListItem)
                    ) : (
                        <Box sx={{p: 2, textAlign: 'center'}}>
                            <Typography variant="body1" color="#aaa">채팅방이 없습니다.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* 오른쪽 채팅방 */}
            <Box sx={{flex: 1}}>
                {selectedChat ? (
                    <Box sx={{height: 700, display: 'flex', flexDirection: 'column', backgroundColor: '#2c2c3a'}}>
                        {/* 채팅방 헤더 */}
                        <Box sx={{p: 2, borderBottom: '1px solid #3b3c4f', display: 'flex', alignItems: 'center'}}>
                            <SummonerInfo {...selectedChat.user} />
                            <Button
                                size="small"
                                sx={{ml: 'auto', color: '#fff'}}
                                onClick={() => {
                                    setTargetChatId(selectedChat.id);
                                    setOpenConfirm(true);
                                }}
                            >
                                나가기
                            </Button>
                        </Box>

                        {/* 메시지 영역 */}
                        {renderMessages()}

                        {/* 메시지 입력 영역 */}
                        {renderMessageInput()}
                    </Box>
                ) : (
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#aaa',
                        height: '100%',
                        backgroundColor: '#2c2c3a'
                    }}>
                        <Typography>대화방을 선택해주세요.</Typography>
                    </Box>
                )}
            </Box>

            {/* 채팅방 나가기 확인 다이얼로그 */}
            <ConfirmDialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                onConfirm={() => {
                    if (targetChatId) handleDelete(targetChatId);
                    setOpenConfirm(false);
                }}
                title="정말 나가시겠습니까?"
                message="채팅방에서 나가면 대화 내용이 사라집니다."
                confirmText="나가기"
                cancelText="취소"
                danger
            />
        </Box>
    );
}
