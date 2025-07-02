import React, { memo } from 'react';
import { Box, Typography, Divider } from '@mui/material';

const DateSeparator = memo(function DateSeparator({ date, isMobile }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();

        if (date.toDateString() === today.toDateString()) {
            return '오늘';
        } else {
            return date.toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
            });
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            my: 2,
            gap: 2
        }}>
            <Divider sx={{ flex: 1, borderColor: '#444' }} />
            <Typography
                variant="caption"
                sx={{
                    color: '#888',
                    backgroundColor: '#2c2c3a',
                    px: isMobile ? 1.5 : 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: isMobile ? '11px' : '12px'
                }}
            >
                {formatDate(date)}
            </Typography>
            <Divider sx={{ flex: 1, borderColor: '#444' }} />
        </Box>
    );
});

export default DateSeparator;
