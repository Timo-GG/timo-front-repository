import React from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    Divider,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Timo from '/public/assets/character.png';
import SocialButton from './SocialButton';
// useNavigate는 현재 코드에서 사용되지 않으므로 제거하거나 그대로 두셔도 됩니다.
// import { useNavigate } from 'react-router-dom';


export default function LoginModal({ open, onClose, redirectTo}) {
    const theme = useTheme();

    // 소셜 로그인 버튼 클릭 시 호출되는 핸들러
    const handleSocialClick = (provider) => {

        if (redirectTo) {
            localStorage.setItem('redirectAfterLogin', redirectTo);
        }

        switch (provider) {
            case 'kakao':
                window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_REST_API_KEY}&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}&response_type=code`;
                break;
            case 'naver':
                window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${import.meta.env.VITE_NAVER_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_NAVER_REDIRECT_URI}&state=${import.meta.env.VITE_NAVER_STATE}`;
                break;
            case 'discord':
                window.location.href = `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${import.meta.env.VITE_DISCORD_REDIRECT_URI}&scope=email+identify`;
                break;
            case 'riot':
                window.location.href = `https://auth.riotgames.com/authorize?client_id=${import.meta.env.VITE_RIOT_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_RIOT_REDIRECT_URI}&response_type=code&scope=openid`;
                break;
            default:
                break;
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 4,
                    width: { xs: '90%', sm: 400 },
                    boxShadow: 24,
                    outline: 'none',
                    textAlign: 'center',
                }}
            >
                {/* 닫기 버튼 */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: theme.palette.text.primary,
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* 제목과 서브타이틀 */}
                <Typography variant="h5" fontWeight="bold" mb={1}>
                    TIMOGG에 어서오세요
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    가입하고 유저들과 의견을 나누어보세요!
                </Typography>

                {/* 캐릭터 이미지 */}
                <Box
                    component="img"
                    src={Timo}
                    alt="timo"
                    sx={{
                        display: 'block',
                        mx: 'auto',
                        maxWidth: '60%',
                        height: 'auto',
                        mb: 3,
                    }}
                />

                {/* 구분선과 텍스트 */}
                <Divider
                    sx={{
                        borderColor: 'grey.700',
                        '&::before, &::after': {
                            borderColor: 'grey.700',
                        },
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                        소셜 계정으로 로그인
                    </Typography>
                </Divider>

                {/* 소셜 로그인 버튼들 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <SocialButton
                        provider="naver"
                        onClick={() => handleSocialClick('naver')}
                    />
                    <SocialButton
                        provider="kakao"
                        onClick={() => handleSocialClick('kakao')}
                    />
                    <SocialButton
                        provider="discord"
                        onClick={() => handleSocialClick('discord')}
                    />
                    <SocialButton
                        provider="riot" // ⬅️ 라이엇 로그인 버튼 추가
                        onClick={() => handleSocialClick('riot')}
                    />
                </Box>
            </Box>
        </Modal>
    );
}