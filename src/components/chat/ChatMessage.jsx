/** 채팅 화면 내 메시지 표시 */

import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { formatChatTimestamp } from '../../utils/timeUtils';

const ChatMessage = memo(function ChatMessage({ type, text, timestamp, showTime, isMobile }) {
    const isSent = type === 'sent';

    return (
        <Box
            display="flex"
            justifyContent={isSent ? 'flex-end' : 'flex-start'}
            alignItems="flex-end"
            mb={1}
            gap={isMobile ? 0.3 : 0.5}
        >
            {/* 내 메시지인 경우: 시간 + 메시지 순서 */}
            {isSent && (
                <>
                    {showTime && (
                        <Typography
                            fontSize={isMobile ? 9 : 10}
                            color="#777"
                            sx={{
                                mb: 0.5,
                                minWidth: 'fit-content'
                            }}
                        >
                            {formatChatTimestamp(timestamp)}
                        </Typography>
                    )}

                    <Box
                        sx={{
                            backgroundColor: '#fff',
                            color: '#000',
                            px: isMobile ? 1.5 : 2,
                            py: 1,
                            borderRadius: 1,
                            maxWidth: isMobile ? '80%' : '70%',
                            wordBreak: 'break-word'
                        }}
                    >
                        {text}
                    </Box>
                </>
            )}

            {/* 상대방 메시지인 경우: 메시지 + 시간 순서 */}
            {!isSent && (
                <>
                    <Box
                        sx={{
                            backgroundColor: '#3b3c4f',
                            color: '#fff',
                            px: isMobile ? 1.5 : 2,
                            py: 1,
                            borderRadius: 1,
                            maxWidth: isMobile ? '80%' : '70%',
                            wordBreak: 'break-word'
                        }}
                    >
                        {text}
                    </Box>

                    {showTime && (
                        <Typography
                            fontSize={isMobile ? 9 : 10}
                            color="#777"
                            sx={{
                                mb: 0.5,
                                minWidth: 'fit-content'
                            }}
                        >
                            {formatChatTimestamp(timestamp)}
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
});

export default ChatMessage;
