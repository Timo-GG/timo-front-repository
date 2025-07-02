/** 소셜 로그인 버튼 */

import React from 'react';
import { Button, Box, useTheme } from '@mui/material';
import KakaoLogo from '/public/assets/social/kakao-logo.svg?react';
import NaverLogo from '/public/assets/social/naver-logo.svg?react';
import DiscordLogo from '/public/assets/social/discord-logo.svg?react';
import RiotLogo from '/public/assets/social/riot-logo.svg?react'; // ⬅️ 1. 라이엇 로고 임포트 추가

export default function SocialButton({ provider, onClick }) {
    const theme = useTheme();

    // 각 소셜 로고 이미지 반환
    const getLogo = () => {
        switch (provider) {
            case 'naver':
                return (
                    <Box
                        component="img"
                        src={NaverLogo}
                        alt="naver"
                        sx={{ width: 48, height: 48 }}
                    />
                );
            case 'kakao':
                return (
                    <Box
                        component="img"
                        src={KakaoLogo}
                        alt="kakao"
                        sx={{ width: 48, height: 48 }}
                    />
                );
            case 'discord':
                return (
                    <Box
                        component="img"
                        src={DiscordLogo}
                        alt="discord"
                        sx={{ width: 48, height: 48 }}
                    />
                );
            case 'riot': // ⬅️ 2. 라이엇 케이스 추가
                return (
                    <Box
                        component="img"
                        src={RiotLogo}
                        alt="riot"
                        sx={{ width: 42, height: 42, borderRadius: '50%' }} // 로고 자체가 사각형일 경우를 대비해 원형으로 잘라줌
                    />
                );
            default:
                return null;
        }
    };

    // ... (기존 배경색 관련 코드는 그대로 두시면 됩니다)

    const bgColor = theme.palette.background.paper;

    return (
        <Button
            variant="contained"
            disableElevation
            onClick={onClick}
            sx={{
                minWidth: 0,
                width: 52,
                height: 52,
                borderRadius: '50%',
                p: 0,
                backgroundColor: bgColor,
                transition: 'opacity 0.3s',
                '&:hover': {
                    opacity: 0.8,
                    backgroundColor: bgColor,
                },
            }}
        >
            {getLogo()}
        </Button>
    );
}