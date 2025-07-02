import React from 'react';
import {Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RiotLogo from '/public/assets/social/riot-logo.svg';

export default function SummonerInfo({
                                         name = '',
                                         tag = '',
                                         avatarUrl,
                                         school = '',
                                         copyable = false,
                                         verificationType = null, // 🔥 추가: 인증 타입
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

    // 🔥 RSO 인증 여부 확인
    const isRSOVerified = verificationType === 'RSO_VERIFIED';

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            minWidth: 0,
            overflow: 'hidden'
        }}>
            <Avatar src={avatarUrl} alt={name} sx={{width: 32, height: 32, flexShrink: 0}}/>
            <Box sx={{
                lineHeight: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minWidth: 0,
                flex: 1,
                overflow: 'hidden'
            }}>
                {/* 🔥 소환사 이름과 인증 배지 */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    minWidth: 0,
                    overflow: 'hidden'
                }}>
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
                            style={{textDecoration: 'none', color: 'inherit', minWidth: 0}}
                        >
                            <Typography
                                fontSize="0.95rem"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1.2,
                                    '&:hover': {textDecoration: 'underline', color: '#42E6B5'},
                                }}
                            >
                                {name}
                            </Typography>
                        </a>
                    </Tooltip>

                    {/* 🔥 RSO 인증 배지 */}
                    {isRSOVerified && (
                        <Tooltip
                            title="인증됨"
                            arrow
                            placement="top"
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                flexShrink: 0
                            }}>
                                <img
                                    src="/assets/social/riot-logo.svg"
                                    alt="Riot 인증"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                    }}
                                />
                            </Box>
                        </Tooltip>
                    )}
                </Box>

                {/* 태그 + 학교 (텍스트만) */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    minWidth: 0,
                    overflow: 'hidden'
                }}>
                    <Typography
                        fontSize="0.8rem"
                        color="#B7B7C9"
                        sx={{
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
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
                                    flexShrink: 0
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
