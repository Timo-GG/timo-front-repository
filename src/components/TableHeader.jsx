import React from 'react';
import { Box } from '@mui/material';

export default function TableHeader() {
    const columns = [1.5, 1, 1.5, 1.5, 2, 0.5, 1, 1.5];
    const headers = ['소환사', '티어', '승률', '모스트 챔피언', '한 줄 소개', '분류', '등록 일시', '듀오 신청'];

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 500,
            color: '#999',
            backgroundColor: '#28282F',
            minWidth: { xs: '900px', sm: 'auto' },
        }}>
            {headers.map((text, i) => (
                <Box key={i} sx={{ flex: columns[i], textAlign: 'center' }}>{text}</Box>
            ))}
        </Box>
    );
}