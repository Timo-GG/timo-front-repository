// src/components/chat/ChatPage.jsx
import React, {useState, useRef, useEffect, useMemo} from 'react';
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
    Toolbar,
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
} from '../apis/chatAPI';
import {initializeChatSocket} from '../socket/chatSocket';
import {formatRelativeTime} from '../utils/timeUtils';

export default function ChatPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { chatList, setChatList, addMessage, updateMessages, removeChatRoom } = useChatStore();
    const {userData} = useAuthStore();

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
    const chatContainerRef = useRef(null);
    const isFetching = useRef(false);
    const isInitialLoad = useRef(true);
    const isPaging = useRef(false);

    // 모바일 뷰 상태
    const [showChatRoom, setShowChatRoom] = useState(false);

    const safeChatList = useMemo(() => (Array.isArray(chatList) ? chatList : []), [chatList]);
    const selectedChat = useMemo(
        () => safeChatList.find(chat => chat.id === selectedChatId) || null,
        [safeChatList, selectedChatId]
    );

    const handleChatRoomClick = (chatId) => {
        console.log(`[ChatPage] 채팅방 클릭 -> setSelectedChatId(${chatId})`);
        sessionStorage.setItem(`shouldJoin:${chatId}`, 'true');
        setSelectedChatId(chatId);

        if (isMobile) {
            setShowChatRoom(true);
        }
    };

    const handleBackToList = () => {
        setShowChatRoom(false);
        setSelectedChatId(null);
    };

    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (!container || isFetching.current || !hasMore) return;

        if (container.scrollTop < 50) {
            const prevScrollHeight = container.scrollHeight;
            const prevScrollTop = container.scrollTop;

            isPaging.current = true;
            isFetching.current = true;

            fetchChatMessages(selectedChatId, page)
                .then((rawMessages) => {
                    const formatted = rawMessages
                        .map(msg => ({
                            type: msg.senderId === userData?.memberId ? 'sent' : 'received',
                            text: msg.content,
                            timestamp: msg.timestamp,
                        }))
                        .reverse();

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
    };

    const handleSendMessage = () => {
        const text = chatInput.trim();
        if (!text || !selectedChatId) return;

        const message = {
            type: 'sent',
            text,
            timestamp: new Date().toISOString(),
        };
        addMessage(selectedChatId, message);
        sendMessage({roomId: selectedChatId, content: text});
        setChatInput('');
    };

    const handleDelete = async (id) => {
        try {
            // API 호출 전에 현재 상태 백업
            const currentChatList = [...chatList];
            console.log('채팅방 나가기 시작:', id, '현재 채팅방 수:', currentChatList.length);

            // API 호출
            await apiLeaveChatRoom(id);

            // 성공 시에만 상태 업데이트
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

            console.log('채팅방 나가기 완료');
        } catch (err) {
            console.error(`[ChatPage] 채팅방 ${id} 나가기 실패:`, err);
            alert('채팅방 나가기에 실패했습니다.');

            // 실패 시 상태 복원 (필요한 경우)
            // setChatList(currentChatList);
        }
    };

    // 기존 useEffect들 유지
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
    }, [selectedChat?.messages]);

    useEffect(() => {
        fetchChatRooms()
            .then((response) => {
                const rooms = response.data;
                if (!Array.isArray(rooms)) return;

                const formatted = rooms.map((room) => {
                    const existing = chatList.find((c) => c.id === room.roomId);
                    return {
                        id: room.roomId,
                        messages: existing?.messages || [],
                        user: {
                            name: `${room.opponentGameName}`,
                            tag: room.opponentTagLine,
                            avatarUrl: room.opponentProfileUrl,
                            school: room.opponentUnivName,
                        },
                        lastMessage: room.lastMessage,
                        lastTime: room.lastMessageTime,
                        lastTimeFormatted: formatRelativeTime(room.lastMessageTime),
                        unreadCount: room.unreadCount,
                    };
                });

                setChatList(formatted);
            })
            .catch((err) => console.error('[ChatPage] 채팅방 목록 로딩 실패:', err));
    }, [setChatList]);

    useEffect(() => {
        if (!selectedChatId) return;

        const shouldJoinFromStorage = sessionStorage.getItem(`shouldJoin:${selectedChatId}`) === 'true';
        if (!shouldJoinFromStorage) return;

        console.log(`[ChatPage] 채팅방 ${selectedChatId} 입장 시도`);

        const socket = getSocket();
        if (!socket) {
            console.error('[ChatPage] 소켓이 초기화되지 않았습니다.');
            return;
        }

        joinChatRoom(selectedChatId);
        sessionStorage.removeItem(`shouldJoin:${selectedChatId}`);

        setPage(1);
        setHasMore(true);
        isInitialLoad.current = true;

        fetchChatMessages(selectedChatId, 1)
            .then((rawMessages) => {
                const formatted = rawMessages
                    .map(msg => ({
                        type: msg.senderId === userData?.memberId ? 'sent' : 'received',
                        text: msg.content,
                        timestamp: msg.timestamp,
                    }))
                    .reverse();

                updateMessages(selectedChatId, formatted, false);
                setPage(2);
            })
            .catch((err) => console.error('[ChatPage] 초기 메시지 로딩 실패:', err));

        return () => {
            console.log(`[ChatPage] 채팅방 ${selectedChatId} 정리`);
            leaveChatRoom(selectedChatId);
        };
    }, [selectedChatId, updateMessages, userData?.memberId]);

    useEffect(() => {
        initializeChatSocket();
    }, []);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [selectedChatId, page, hasMore]);

    // 모바일에서 채팅방 리스트만 보여주는 경우
    if (isMobile && !showChatRoom) {
        return (
            <Box sx={{height: '100vh', backgroundColor: '#2c2c3a'}}>
                {safeChatList.length > 0 ? (
                    safeChatList.map(chat => (
                        <Box
                            key={chat.id}
                            onClick={() => handleChatRoomClick(chat.id)}
                            sx={{
                                p: 2,
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
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
                    ))
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
                <Box
                    ref={chatContainerRef}
                    sx={{
                        flex: 1,
                        p: 2,
                        overflowY: 'auto',
                        backgroundColor: '#2c2c3a'
                    }}
                >
                    <SystemMessage message="채팅방이 생성되었습니다."/>
                    {selectedChat?.messages.length > 0 ? (
                        selectedChat.messages.map((msg, idx) => (
                            <ChatMessage key={idx} {...msg} />
                        ))
                    ) : (
                        <Typography variant="body2" color="#aaa">메시지가 없습니다.</Typography>
                    )}
                </Box>

                {/* 메시지 입력 영역 - 키보드 문제 해결 */}
                <Box sx={{
                    display: 'flex',
                    p: 2,
                    borderTop: '1px solid #3b3c4f',
                    backgroundColor: '#2c2c3a',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 1000
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
                                fontSize: '16px', // iOS 줌 방지
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
                        safeChatList.map(chat => (
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
                        ))
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
                        <Box ref={chatContainerRef} sx={{flex: 1, p: 2, overflowY: 'auto'}}>
                            <SystemMessage message="채팅방이 생성되었습니다."/>
                            {selectedChat?.messages.length > 0 ? (
                                selectedChat.messages.map((msg, idx) => (
                                    <ChatMessage key={idx} {...msg} />
                                ))
                            ) : (
                                <Typography variant="body2" color="#aaa">메시지가 없습니다.</Typography>
                            )}
                        </Box>

                        {/* 메시지 입력 영역 */}
                        <Box sx={{
                            display: 'flex',
                            p: 2,
                            borderTop: '1px solid #3b3c4f',
                            backgroundColor: '#2c2c3a'
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
                                    sx: {color: '#fff', backgroundColor: '#3b3c4f', borderRadius: 1, pl: 2},
                                }}
                            />
                            <IconButton sx={{color: '#42E6B5', ml: 1}} onClick={handleSendMessage}>
                                <SendIcon/>
                            </IconButton>
                        </Box>
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
