import React from 'react';
import {Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function SummonerInfo({
                                         name = '',
                                         tag = '',
                                         avatarUrl,
                                         school = '',
                                         copyable = false,
                                     }) {
    const handleCopy = () => {
        const fullTag = `${name}#${tag}`;
        navigator.clipboard.writeText(fullTag)
            .then(() => console.log('복사됨:', fullTag))
            .catch((err) => console.error('복사 실패:', err));
    };

    const encodedName = encodeURIComponent(name);
    const encodedTag = encodeURIComponent(tag.replace(/\s/g, ''));
    const opggUrl = `https://op.gg/ko/lol/summoners/kr/${encodedName}-${encodedTag}`;

    const isMobile = useMediaQuery('(max-width:768px)');
    const displaySchool = isMobile
        ? school.replace('서울과학기술대학교', '서울과기대')
        : school;

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',        // ✅ 전체 너비 사용
            minWidth: 0,          // ✅ flex 아이템이 축소될 수 있도록
            overflow: 'hidden'    // ✅ 컨테이너 오버플로우 방지
        }}>
            <Avatar src={avatarUrl} alt={name} sx={{width: 32, height: 32, flexShrink: 0}}/>
            <Box sx={{
                lineHeight: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minWidth: 0,          // ✅ 텍스트가 축소될 수 있도록
                flex: 1,              // ✅ 남은 공간 모두 사용
                overflow: 'hidden'    // ✅ 텍스트 오버플로우 방지
            }}>
                {/* ✅ 툴팁 추가된 링크 */}
                <Tooltip
                    title={
                        <Box sx={{px: 0.5, py: 0.5}}>OP.GG에서 자세히 보기</Box>
                    }
                    arrow
                >
                    <a
                        href={opggUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{textDecoration: 'none', color: 'inherit'}}
                    >
                        <Typography
                            fontSize="0.95rem"
                            sx={{
                                overflow: 'hidden',           // ✅ 오버플로우 숨김
                                textOverflow: 'ellipsis',     // ✅ ... 표시
                                whiteSpace: 'nowrap',         // ✅ 줄바꿈 방지
                                lineHeight: 1.2,
                                '&:hover': {textDecoration: 'underline', color: '#42E6B5'},
                            }}
                        >
                            {name}
                        </Typography>
                    </a>
                </Tooltip>

                {/* 태그 + 학교 (텍스트만) */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    minWidth: 0,              // ✅ 축소 가능
                    overflow: 'hidden'        // ✅ 오버플로우 방지
                }}>
                    <Typography
                        fontSize="0.8rem"
                        color="#B7B7C9"
                        sx={{
                            lineHeight: 1.2,
                            overflow: 'hidden',       // ✅ 오버플로우 숨김
                            textOverflow: 'ellipsis', // ✅ ... 표시
                            whiteSpace: 'nowrap',     // ✅ 줄바꿈 방지
                            flex: 1,                  // ✅ 남은 공간 사용
                        }}
                    >
                        #{tag}{displaySchool ? ` | ${displaySchool}` : ''}
                    </Typography>

                    {copyable && (
                        <Tooltip title="복사" arrow>
                            <IconButton
                                size="small"
                                onClick={handleCopy}
                                sx={{
                                    p: 0.3,
                                    color: '#888',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0     // ✅ 아이콘은 축소되지 않도록
                                }}
                            >
                                <ContentCopyIcon fontSize="inherit"/>
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
