import React, {useState, useEffect} from 'react';
import {
    Box,
    Typography,
    TextField,
    CircularProgress,
    Button,
    Paper,
    useTheme,
} from '@mui/material';
import WithdrawConfirmDialog from '../components/WithdrawConfirmDialog';
import useAuthStore from '../storage/useAuthStore';
import {
    updateUsername,
    verifyAccount,
    resetRiotAccount,
    registerRanking,
    deleteAccount,
    updateNotificationEmail
} from '../apis/accountAPI';
import {
    checkUniv,
    requestUnivVerification,
    verifyUnivCode,
    updateUnivAccount,
    deleteUnivAccount
} from '../apis/univAPI';
import {getMyInfo} from '../apis/authAPI';
import {deleteMyRanking} from '../apis/rankAPI';
import {getSocket} from "../socket/socket.js";
import {useNavigate} from "react-router-dom";
import useNotificationStore from "../storage/useNotification.jsx";
import SummonerInfo from '../components/SummonerInfo';
import { linkRiotAccount, updateVerificationType } from '../apis/accountAPI';


export default function MySettingPage() {
    const theme = useTheme();
    const {userData, setUserData, logout} = useAuthStore();
    const clearNotifications = useNotificationStore((state) => state.clearNotifications);

    // ━━━━━━━━━━━ 기본 프로필 관련 상태 ━━━━━━━━━━━
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');

    // ━━━━━━━━━━━ 소환사(롤 계정) 인증 관련 상태 ━━━━━━━━━━━
    const [riotAccountInput, setRiotAccountInput] = useState('');
    const [isSummonerVerified, setIsSummonerVerified] = useState(false);
    const [summonerStatusMsg, setSummonerStatusMsg] = useState('');

    // ━━━━━━━━━━━ 학교명 확인 관련 상태 ━━━━━━━━━━━
    const [univName, setUnivName] = useState('');
    const [isUnivNameValid, setIsUnivNameValid] = useState(false);
    const [isUnivNameLocked, setIsUnivNameLocked] = useState(false);
    const [univNameStatus, setUnivNameStatus] = useState('');

    // ━━━━━━━━━━━ 학교 이메일 인증 관련 상태 ━━━━━━━━━━━
    const [univEmail, setUnivEmail] = useState('');
    const [isUnivEmailSent, setIsUnivEmailSent] = useState(false);
    const [showUnivCodeInput, setShowUnivCodeInput] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [emailError, setEmailError] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [isUnivEmailVerified, setIsUnivEmailVerified] = useState(false);

    // ━━━━━━━━━━━ 계정 탈퇴 다이얼로그 ━━━━━━━━━━━
    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

    // ━━━━━━━━━━━ 알림 이메일 관련 상태 추가 ━━━━━━━━━━━
    const [notificationEmail, setNotificationEmail] = useState('');
    const [isNotificationEmailSet, setIsNotificationEmailSet] = useState(false);
    const [notificationEmailError, setNotificationEmailError] = useState('');
    const [notificationEmailStatus, setNotificationEmailStatus] = useState('');

    const [hasProcessedRSO, setHasProcessedRSO] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const navigate = useNavigate();


    // OAuth 연동 핸들러 함수 수정
    const handleRiotOAuthLink = async () => {
        localStorage.setItem('riotLinkMode', 'true');
        window.location.href = `https://auth.riotgames.com/authorize?client_id=${import.meta.env.VITE_RIOT_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_RIOT_REDIRECT_URI}&response_type=code&scope=openid&prompt=login`;
    };

    // ━━━━━━━━━━━ userData 로부터 초기값 세팅 ━━━━━━━━━━━
    useEffect(() => {
        if (!userData) return;

        // 1) 닉네임
        setUsername(userData.username || '');

        // 2) 소환사(롤) 계정 상태에 따른 초기화
        const verificationType = userData.riotAccount?.verificationType;

        if (verificationType === 'API_PARSED' || verificationType === 'RSO_VERIFIED') {
            const {accountName, accountTag} = userData.riotAccount;
            setRiotAccountInput(`${accountName}#${accountTag}`);
            setIsSummonerVerified(true);

            if (verificationType === 'RSO_VERIFIED') {
                setSummonerStatusMsg('');
            }
        } else {
            // NONE 상태
            setRiotAccountInput('');
            setIsSummonerVerified(false);
            setSummonerStatusMsg('');
        }

        // 3) 인증된 학교 정보 처리는 기존과 동일
        if (userData.certifiedUnivInfo) {
            const {univName: savedName, univCertifiedEmail: savedEmail} = userData.certifiedUnivInfo;
            setUnivName(savedName);
            setUnivEmail(savedEmail);
            setIsUnivNameValid(true);
            setIsUnivNameLocked(true);
            setIsUnivEmailVerified(true);
            setIsUnivEmailSent(false);
            setShowUnivCodeInput(false);
        } else {
            setIsUnivNameValid(false);
            setIsUnivNameLocked(false);
            setIsUnivEmailVerified(false);
            setIsUnivEmailSent(false);
            setShowUnivCodeInput(false);
            setUnivNameStatus('');
            setUnivEmail('');
        }

        // 알림 이메일 초기화 추가
        if (userData.notificationEmail) {
            setNotificationEmail(userData.notificationEmail);
            setIsNotificationEmailSet(true);
            setNotificationEmailStatus('');
        } else {
            setNotificationEmail('');
            setIsNotificationEmailSet(false);
            setNotificationEmailStatus('');
        }

    }, [userData]);

    // ━━━━━━━━━━━ 소환사(롤 계정) 등록/해제 핸들러 ━━━━━━━━━━━
    async function handleSummonerRegister() {
        setSummonerStatusMsg('');
        const [accountName, accountTag] = riotAccountInput.split('#');
        if (!accountName || !accountTag) {
            setSummonerStatusMsg('형식이 올바르지 않습니다. 예: 짱아깨비#KR1');
            return;
        }
        try {
            const res = await verifyAccount({accountName, tagLine: accountTag});
            if (!res.success) {
                setSummonerStatusMsg('소환사 정보를 찾을 수 없습니다.');
                return;
            }
            // 인증 성공 → 내 정보 갱신
            const {data: profile} = await getMyInfo();
            setUserData(profile);
            setIsSummonerVerified(true);
            setSummonerStatusMsg('✔️ 소환사 인증 완료');

            // 이미 학교 인증된 상태라면, 푸유아이디가 있으면 랭킹 등록
            if (profile.certifiedUnivInfo) {
                try {
                    const puuid = profile.riotAccount.puuid;
                    await registerRanking(puuid);
                } catch (e) {
                    console.error('⚠️ 랭킹 등록 실패', e);
                }
            }
        } catch (error) {
            // “이미 사용중인 소환사 계정입니다.” 등 서버 메시지를 그대로 보여주기
            const apiMsg =
                error.response?.data?.message ||
                '소환사 인증 중 오류가 발생했습니다.';
            setSummonerStatusMsg(apiMsg);
        }
    }

    async function handleSummonerReset() {
        setSummonerStatusMsg('');
        try {
            await resetRiotAccount();
            try {
                await deleteMyRanking();
            } catch (e) {
                console.error('⚠️ 랭킹 삭제 실패', e);
            }
            const {data: profile} = await getMyInfo();
            setUserData(profile);
            setRiotAccountInput('');
            setIsSummonerVerified(false);
            setSummonerStatusMsg('소환사 인증이 취소되었습니다.');
        } catch (error) {
            console.error('소환사 해제 중 오류:', error);
            setSummonerStatusMsg('소환사 해제 중 오류가 발생했습니다.');
        }
    }

    // ━━━━━━━━━━━ 학교명 확인/해제 핸들러 ━━━━━━━━━━━
    async function handleUniversityCheck() {
        // 이미 “학교명 인증 완료” 상태라면 → 해제
        if (isUnivNameLocked) {
            try {
                await deleteUnivAccount();
                await updateUnivAccount({univName: null, univEmail: null});
                // UI 초기화
                setIsUnivNameLocked(false);
                setIsUnivNameValid(false);
                setUnivName('');
                setUnivEmail('');
                setIsUnivEmailSent(false);
                setShowUnivCodeInput(false);
                setIsUnivEmailVerified(false);
                setUnivNameStatus('');

                // 프로필 다시 가져오기
                const {data: profile} = await getMyInfo();
                setUserData(profile);
            } catch (error) {
                console.error('대학교 해제 실패:', error);
                setUnivNameStatus('대학교 해제 중 오류가 발생했습니다.');
            }
            return;
        }

        // 학교명 입력 후 “확인” 버튼 눌렀을 때
        setUnivNameStatus('');
        if (!univName.trim()) {
            setUnivNameStatus('학교명을 입력해주세요.');
            return;
        }
        try {
            const res = await checkUniv({univName});
            if (res.success) {
                setIsUnivNameValid(true);
                setIsUnivNameLocked(true);
                setUnivNameStatus('✔️ 존재하는 대학교입니다.');
            } else {
                setUnivNameStatus('존재하지 않는 대학교입니다.');
            }
        } catch {
            setUnivNameStatus('대학교 확인 중 오류가 발생했습니다.');
        }
    }

    // ━━━━━━━━━━━ 학교 이메일 등록/해제 핸들러 ━━━━━━━━━━━
    async function handleEmailRegister() {
        // 이미 이메일 인증된 상태라면 → 해제
        if (isUnivEmailVerified) {
            try {
                await deleteUnivAccount();
                await updateUnivAccount({univName: null, univEmail: null});
                // UI 초기화
                setIsUnivEmailVerified(false);
                setUnivEmail('');
                setEmailError('');
                setIsUnivEmailSent(false);
                setShowUnivCodeInput(false);
                setVerificationCode('');
                setUnivNameStatus(''); // 잠시 초기화
                // 프로필 다시 가져오기
                const {data: profile} = await getMyInfo();
                setUserData(profile);
            } catch (error) {
                console.error('학교 이메일 해제 실패:', error);
                setEmailError('학교 이메일 해제 중 오류가 발생했습니다.');
            }
            return;
        }
        // 이메일 형식 체크
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(univEmail)) {
            setEmailError('올바른 이메일을 입력해주세요.');
            return;
        }
        setEmailError('');

        setIsSending(true);
        try {
            const res = await requestUnivVerification({univName, univEmail});
            if (res.success) {
                setIsUnivEmailSent(true);
                setShowUnivCodeInput(true);
            } else if (res.errorCode === 902) {
                setEmailError(res.message);
            } else if (res.errorCode === 1001) {
                setEmailError(res.message);
            } else {
                setEmailError('학교명 또는 이메일이 올바르지 않습니다.');
            }
        } catch (error) {
            if (error.response?.status === 400) {
                const msg = error.response.data?.message || '요청 처리 중 오류가 발생했습니다.';
                setEmailError(msg);
            } else {
                setEmailError('네트워크 오류가 발생했습니다.');
            }
        }finally {
            setIsSending(false);
        }
    }

    // ━━━━━━━━━━━ 인증 코드 확인 핸들러 ━━━━━━━━━━━
    async function handleVerificationConfirm() {
        setVerificationError('');
        setIsVerifying(true);
        try {
            await verifyUnivCode(verificationCode, { univName, univEmail });

            // --- 인증 성공 후 로직 ---
            setIsUnivEmailVerified(true);
            setShowUnivCodeInput(false);
            setIsUnivEmailSent(false);
            setEmailError('');

            // 프로필 동기화
            const { data: profile } = await getMyInfo();
            setUserData(profile);
            setUnivNameStatus('✔️ 학교 이메일 인증 완료');

            if (profile.riotAccount?.puuid) {
                try {
                    await registerRanking(profile.riotAccount.puuid);
                    console.log('✅ 대학 인증 후, 기존 소환사 정보로 랭킹 등록 완료');
                } catch (e) {
                    console.error('⚠️ 대학 인증 후 랭킹 등록 실패', e);
                    // 필요하다면 사용자에게 실패 알림을 표시할 수 있습니다.
                }
            }

        } catch {
            setVerificationError('인증 코드가 올바르지 않거나 만료되었습니다.');
        } finally {
            setIsVerifying(false);
        }
    }

    // ━━━━━━━━━━━ 회원 탈퇴 핸들러 ━━━━━━━━━━━
    const handleWithdraw = async () => {
        setIsWithdrawDialogOpen(false);

        try {
            // deleteUnivAccount 실패 시 무시하고 계속 진행
            try {
                await deleteUnivAccount();
            } catch (univError) {
                console.warn('⚠️ 대학 계정 삭제 실패 (무시하고 계속 진행):', univError.message);
            }

            // 메인 계정 삭제는 반드시 성공해야 함
            try {
                deleteMyRanking();
            } catch (e) {
                console.warn('랭킹 삭제 실패', e);
            }
            await deleteAccount();

            const socket = getSocket();
            const memberId = userData?.memberId;
            if (socket && socket.connected && memberId) {
                console.log('📤 [Header] leave_online 이벤트 발송:', memberId);
                socket.emit('leave_online', {memberId});
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
            alert('탈퇴가 완료되었습니다.');

        } catch (error) {
            console.error('❌ 계정 삭제 실패:', error);
            alert('탈퇴 처리 중 오류가 발생했습니다.');
        }
    };

    // ━━━━━━━━━━━ 알림 이메일 등록/해제 핸들러 ━━━━━━━━━━━
    async function handleNotificationEmailToggle() {
        setNotificationEmailError('');
        setNotificationEmailStatus('');

        if (isNotificationEmailSet) {
            // 해제
            try {
                await updateNotificationEmail(null);
                setIsNotificationEmailSet(false);
                setNotificationEmail('');
                setNotificationEmailStatus('알림 이메일이 해제되었습니다.');

                // 사용자 정보 업데이트
                const {data: profile} = await getMyInfo();
                setUserData(profile);
            } catch (error) {
                console.error('알림 이메일 해제 실패:', error);
                setNotificationEmailError('알림 이메일 해제 중 오류가 발생했습니다.');
            }
        } else {
            // 등록
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(notificationEmail)) {
                setNotificationEmailError('올바른 이메일 형식을 입력해주세요.');
                return;
            }

            try {
                await updateNotificationEmail(notificationEmail);
                setIsNotificationEmailSet(true);
                setNotificationEmailStatus('✔️ 알림 이메일이 설정되었습니다.');

                // 사용자 정보 업데이트
                const {data: profile} = await getMyInfo();
                setUserData(profile);
            } catch (error) {
                console.error('알림 이메일 설정 실패:', error);
                if (error.response?.data?.message) {
                    setNotificationEmailError(error.response.data.message);
                } else {
                    setNotificationEmailError('알림 이메일 설정 중 오류가 발생했습니다.');
                }
            }
        }
    }

    const renderSummonerSection = () => {
        const verificationType = userData?.riotAccount?.verificationType;

        return (
            <Box>
                <Typography color="text.secondary" sx={{mb: 1}}>소환사 이름</Typography>

                {/* NONE 상태: 두 가지 옵션 모두 표시 */}
                {(verificationType === 'NONE' || !verificationType) && (
                    <>
                        {/* 기존 API 파싱 방식 */}
                        <Box sx={{display: 'flex', height: '56px', mb: 2}}>
                            <TextField
                                fullWidth
                                placeholder="ex) 짱아깨비#KR"
                                value={riotAccountInput}
                                onChange={(e) => {
                                    setRiotAccountInput(e.target.value);
                                    setSummonerStatusMsg('');
                                }}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '100%',
                                        borderRadius: '12px 0 0 12px',
                                        backgroundColor: theme.palette.background.input,
                                        border: `1px solid ${theme.palette.border.main}`,
                                        '& fieldset': {borderColor: 'transparent'},
                                        '& input': {color: theme.palette.text.primary, padding: '12px 14px'},
                                    },
                                }}
                            />
                            <Button
                                onClick={handleSummonerRegister}
                                sx={{
                                    height: '100%',
                                    borderRadius: '0 12px 12px 0',
                                    backgroundColor: theme.palette.background.input,
                                    color: theme.palette.text.secondary,
                                    border: `1px solid ${theme.palette.border.main}`,
                                    borderLeft: 'none',
                                    px: 3,
                                    minWidth: '80px',
                                }}
                            >
                                등록
                            </Button>
                        </Box>

                        <Box sx={{textAlign: 'center', mb: 2}}>
                            <Typography variant="body2" color="text.secondary">
                                또는
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            onClick={handleRiotOAuthLink}
                            startIcon={
                                <img
                                    src="/assets/social/riot-logo.svg"
                                    alt="Riot"
                                    style={{ width: '20px', height: '20px' }}
                                />
                            }
                            sx={{
                                width: '100%',
                                height: '52px',
                                borderRadius: '12px',
                                border: `1px solid ${theme.palette.border.main}`,
                                backgroundColor: 'transparent',
                                color: theme.palette.text.primary,
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                    border: `1px solid ${theme.palette.border.main}`,
                                },
                            }}
                        >
                            내 소환사 계정 연동하기
                        </Button>
                    </>
                )}

                {/* API_PARSED 상태 */}
                {verificationType === 'API_PARSED' && (
                    <>
                        {/* SummonerInfo 컴포넌트로 현재 계정 정보 표시 */}
                        <Box sx={{
                            p: 2.5,
                            backgroundColor: theme.palette.background.input,
                            borderRadius: '16px',
                            border: `1px solid ${theme.palette.border.main}`,
                            mb: 2,
                            position: 'relative'
                        }}>
                            <Typography variant="body2" color="text.secondary" sx={{mb: 1.5, fontWeight: 500}}>
                                현재 등록된 소환사
                            </Typography>

                            <SummonerInfo
                                name={userData?.riotAccount?.accountName || ''}
                                tag={userData?.riotAccount?.accountTag || ''}
                                avatarUrl={userData?.riotAccount?.profileUrl}
                                school={userData?.certifiedUnivInfo?.univName || ''}
                                copyable={true}
                                verificationType={userData?.riotAccount?.verificationType}
                            />

                            {/* API 인증 배지 */}
                            <Box sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                px: 1.5,
                                py: 0.5,
                                backgroundColor: theme.palette.warning.main + '20',
                                borderRadius: '20px',
                                border: `1px solid ${theme.palette.warning.main}40`
                            }}>
                                <Typography variant="caption" sx={{
                                    color: theme.palette.warning.main,
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                }}>
                                    인증 안됨
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="outlined"
                            onClick={handleRiotOAuthLink}
                            sx={{
                                width: '100%',
                                height: '52px',
                                borderRadius: '12px',
                                border: `1px solid ${theme.palette.primary.main}`,
                                backgroundColor: 'transparent',
                                color: theme.palette.primary.main,
                                mb: 1,
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white',
                                },
                            }}
                        >
                            내 소환사 계정 연동하기
                        </Button>

                        <Button
                            variant="text"
                            onClick={handleSummonerReset}
                            sx={{
                                width: '100%',
                                color: theme.palette.error.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.error.main + '10',
                                },
                            }}
                        >
                            소환사 계정 해제
                        </Button>
                    </>
                )}

                {/* RSO_VERIFIED 상태 */}
                {verificationType === 'RSO_VERIFIED' && (
                    <>
                        {/* SummonerInfo 컴포넌트로 인증된 계정 정보 표시 */}
                        <Box sx={{
                            p: 2.5,
                            backgroundColor: theme.palette.success.main + '08',
                            borderRadius: '16px',
                            border: `1px solid ${theme.palette.success.main}40`,
                            mb: 2,
                            position: 'relative',
                            boxShadow: `0 0 0 1px ${theme.palette.success.main}20`
                        }}>
                            <Typography variant="body2" color="text.secondary" sx={{mb: 1.5, fontWeight: 500}}>
                                연동된 소환사 계정
                            </Typography>

                            <SummonerInfo
                                name={userData?.riotAccount?.accountName || ''}
                                tag={userData?.riotAccount?.accountTag || ''}
                                avatarUrl={userData?.riotAccount?.profileUrl}
                                school={userData?.certifiedUnivInfo?.univName || ''}
                                copyable={true}
                                verificationType={userData?.riotAccount?.verificationType}
                            />

                            {/* RSO 인증 배지 */}
                            <Box sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                px: 1.5,
                                py: 0.5,
                                backgroundColor: theme.palette.success.main + '20',
                                borderRadius: '20px',
                                border: `1px solid ${theme.palette.success.main}60`
                            }}>
                                <Typography variant="caption" sx={{
                                    color: theme.palette.success.main,
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                }}>
                                    인증 완료
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="outlined"
                            onClick={handleSummonerReset}
                            sx={{
                                width: '100%',
                                height: '52px',
                                borderRadius: '12px',
                                border: `1px solid ${theme.palette.error.main}`,
                                backgroundColor: 'transparent',
                                color: theme.palette.error.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.error.main,
                                    color: 'white',
                                },
                            }}
                        >
                            소환사 계정 연동 해제
                        </Button>
                    </>
                )}

                {/* 상태 메시지 */}
                {summonerStatusMsg && (
                    <Typography
                        variant="caption"
                        sx={{
                            mt: 1,
                            color: summonerStatusMsg.includes('✔️')
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                            display: 'block'
                        }}
                    >
                        {summonerStatusMsg}
                    </Typography>
                )}
            </Box>
        );
    };

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.default,
                minHeight: '100vh',
                pt: 5,
                px: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: 460,
                    p: 4,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2
                }}
            >
                <Typography variant="h5" fontWeight="bold" mb={4} color="text.primary">
                    내 계정
                </Typography>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                    {/* ───────────────────────────────── 이메일(로그인) 출력 ───────────────────────────────── */}
                    <Box>
                        <Typography color="text.secondary" sx={{mb: 1}}>이메일</Typography>
                        <TextField
                            fullWidth
                            disabled
                            value={userData?.email || ''}
                            variant="outlined"
                            sx={{
                                "& .MuiInputBase-input.Mui-disabled": {
                                    WebkitTextFillColor: theme.palette.text.disabled,
                                },
                                '& .MuiOutlinedInput-root': {
                                    height: '56px',
                                    borderRadius: '12px',
                                    backgroundColor: theme.palette.background.inputDisabled,
                                }
                            }}
                        />
                    </Box>

                    {/* ───────────────────────────────── 닉네임 ───────────────────────────────── */}
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <Typography color="text.secondary">닉네임</Typography>
                        <Box sx={{display: 'flex', height: '56px'}}>
                            <TextField
                                fullWidth
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setUsernameError('');
                                    setUsernameMessage('');
                                }}
                                error={Boolean(usernameError)}
                                helperText={''} // 별도 Typography로 표현
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '100%',
                                        borderRadius: '12px 0 0 12px',
                                        backgroundColor: theme.palette.background.input,
                                        border: `1px solid ${theme.palette.border.main}`,
                                        '& fieldset': {borderColor: 'transparent'},
                                        '& input': {
                                            color: theme.palette.text.primary,
                                            padding: '12px 14px',
                                        },
                                    },
                                }}
                            />
                            <Button
                                onClick={async () => {
                                    try {
                                        await updateUsername(username);
                                        setUsernameMessage('닉네임이 성공적으로 변경되었습니다!');
                                        setUsernameError('');
                                        setUserData({...userData, username});
                                    } catch {
                                        setUsernameError('이미 사용 중인 닉네임입니다.');
                                        setUsernameMessage('');
                                    }
                                }}
                                sx={{
                                    height: '100%',
                                    borderRadius: '0 12px 12px 0',
                                    backgroundColor: theme.palette.background.input,
                                    color: theme.palette.text.secondary,
                                    border: `1px solid ${theme.palette.border.main}`,
                                    borderLeft: 'none',
                                    px: 3,
                                    minWidth: '80px',
                                }}
                            >
                                수정
                            </Button>
                        </Box>
                        {(usernameMessage || usernameError) && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: usernameError ? theme.palette.error.main : theme.palette.success.main,
                                    minHeight: '20px',
                                    pl: 1,
                                }}
                            >
                                {usernameError || usernameMessage}
                            </Typography>
                        )}
                    </Box>

                    {/* ───────────────────────────────── 알림 수신 이메일 ───────────────────────────────── */}
                    <Box>
                        <Typography color="text.secondary" sx={{mb: 1}}>알림 수신 이메일</Typography>
                        <Box sx={{display: 'flex', height: '56px'}}>
                            <TextField
                                fullWidth
                                placeholder="알림을 받을 이메일 주소를 입력하세요"
                                value={isNotificationEmailSet ?
                                    (notificationEmail || '설정된 알림 이메일') :
                                    notificationEmail
                                }
                                onChange={(e) => {
                                    if (!isNotificationEmailSet) {
                                        setNotificationEmail(e.target.value);
                                        setNotificationEmailError('');
                                        setNotificationEmailStatus('');
                                    }
                                }}
                                disabled={isNotificationEmailSet}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '100%',
                                        borderRadius: '12px 0 0 12px',
                                        backgroundColor: isNotificationEmailSet
                                            ? theme.palette.background.inputDisabled
                                            : theme.palette.background.input,
                                        border: `1px solid ${theme.palette.border.main}`,
                                        '& fieldset': {borderColor: 'transparent'},
                                        '& input': {
                                            color: isNotificationEmailSet
                                                ? theme.palette.text.disabled
                                                : theme.palette.text.primary,
                                            padding: '12px 14px',
                                        },
                                    },
                                }}
                            />
                            <Button
                                onClick={handleNotificationEmailToggle}
                                sx={{
                                    height: '100%',
                                    borderRadius: '0 12px 12px 0',
                                    backgroundColor: theme.palette.background.input,
                                    color: theme.palette.text.secondary,
                                    border: `1px solid ${theme.palette.border.main}`,
                                    borderLeft: 'none',
                                    px: 3,
                                    minWidth: '80px',
                                }}
                            >
                                {isNotificationEmailSet ? '해제' : '등록'}
                            </Button>
                        </Box>

                        <Box sx={{minHeight: 20, mt: 1}}>
                            {notificationEmailError && (
                                <Typography variant="caption" color={theme.palette.error.main}>
                                    {notificationEmailError}
                                </Typography>
                            )}
                            {!notificationEmailError && notificationEmailStatus && (
                                <Typography
                                    variant="caption"
                                    color={notificationEmailStatus.includes('✔️') ?
                                        theme.palette.success.main :
                                        theme.palette.info.main
                                    }
                                >
                                    {notificationEmailStatus}
                                </Typography>
                            )}
                            {!notificationEmailError && !notificationEmailStatus && !isNotificationEmailSet && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        pl: 1
                                    }}
                                >
                                    매칭 관련 상태, 채팅 알림 등을 받을 수 있습니다.
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* ───────────────────────────────── 소환사 이름 ───────────────────────────────── */}
                    {renderSummonerSection()}

                    {/* ───────────────────────────────── 학교명 확인 ───────────────────────────────── */}
                    <Box>
                        <Typography color="text.secondary" sx={{mb: 1}}>학교명</Typography>
                        <Box sx={{display: 'flex', height: '56px'}}>
                            <TextField
                                fullWidth
                                placeholder="서울과학기술대학교"
                                value={univName}
                                onChange={(e) => {
                                    setUnivName(e.target.value);
                                    setUnivNameStatus('');
                                }}
                                disabled={isUnivNameLocked}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '100%',
                                        borderRadius: '12px 0 0 12px',
                                        backgroundColor: theme.palette.background.input,
                                        border: `1px solid ${theme.palette.border.main}`,
                                        '& fieldset': {borderColor: 'transparent'},
                                        '& input': {color: theme.palette.text.primary, padding: '12px 14px'},
                                    },
                                }}
                            />
                            <Button
                                onClick={handleUniversityCheck}
                                sx={{
                                    height: '100%',
                                    borderRadius: '0 12px 12px 0',
                                    backgroundColor: theme.palette.background.input,
                                    color: theme.palette.text.secondary,
                                    border: `1px solid ${theme.palette.border.main}`,
                                    borderLeft: 'none',
                                    px: 3,
                                    minWidth: '80px',
                                }}
                            >
                                {isUnivNameLocked ? '해제' : '확인'}
                            </Button>
                        </Box>
                        {univNameStatus && (
                            <Typography
                                variant="caption"
                                sx={{
                                    mt: 1,
                                    color: univNameStatus.includes('존재하지')
                                        ? theme.palette.error.main
                                        : theme.palette.success.main,
                                }}
                            >
                                {univNameStatus}
                            </Typography>
                        )}
                    </Box>

                    {/* ───────────────────────────────── 학교 이메일 입력 ───────────────────────────────── */}
                    {isUnivNameValid && !isUnivEmailVerified && (
                        <Box>
                            <Typography color="text.secondary" sx={{mb: 1}}>학교 이메일</Typography>
                            <Box sx={{display: 'flex', height: '56px'}}>
                                <TextField
                                    fullWidth
                                    placeholder="예) hong@seoultech.ac.kr"
                                    value={univEmail}
                                    onChange={(e) => {
                                        setUnivEmail(e.target.value);
                                        setEmailError('');
                                        setIsUnivEmailSent(false);
                                        setShowUnivCodeInput(false);
                                        setVerificationError('');
                                    }}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '100%',
                                            borderRadius: showUnivCodeInput ? '12px 0 0 12px' : '12px 0 0 12px',
                                            backgroundColor: theme.palette.background.input,
                                            border: `1px solid ${theme.palette.border.main}`,
                                            '& fieldset': {
                                                borderColor: 'transparent',
                                            },
                                            '& input': {color: theme.palette.text.primary, padding: '12px 14px'},
                                        },
                                    }}
                                    error={Boolean(emailError)}
                                    helperText={emailError}
                                />
                                <Button
                                    onClick={handleEmailRegister}
                                    disabled={!isUnivNameValid || isSending}
                                    sx={{
                                        height: '100%',
                                        borderRadius: '0 12px 12px 0',
                                        backgroundColor: theme.palette.background.input,
                                        color: theme.palette.text.secondary,
                                        border: `1px solid ${theme.palette.border.main}`,
                                        borderLeft: 'none',
                                        px: 3,
                                        minWidth: '80px',
                                    }}
                                >
                                    등록
                                </Button>
                            </Box>
                            {isUnivEmailSent && (
                                <Typography variant="caption" color={theme.palette.info.main} sx={{mt: 1}}>
                                    인증 코드를 전송했습니다.
                                </Typography>
                            )}
                        </Box>
                    )}

                    {isSending && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {/* ───────────────────────────────── 인증 코드 입력 ───────────────────────────────── */}
                    {!isSending && showUnivCodeInput && !isUnivEmailVerified && (
                        <Box sx={{ minHeight: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box sx={{ width: '100%' }}>
                            <Typography color="text.secondary" sx={{ mb: 1 }}>인증 코드</Typography>
                            <Box sx={{ display: 'flex', height: '56px' }}>
                                <TextField
                                    fullWidth
                                    placeholder="인증 코드를 입력하세요"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        setVerificationCode(e.target.value);
                                        setVerificationError('');
                                    }}
                                    variant="outlined"
                                    error={Boolean(verificationError)}
                                    helperText={verificationError}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '100%',
                                            borderRadius: '12px 0 0 12px',
                                            backgroundColor: theme.palette.background.input,
                                            border: `1px solid ${theme.palette.border.main}`,
                                            '& fieldset': { borderColor: 'transparent' },
                                            '& input': { color: theme.palette.text.primary, padding: '12px 14px' },
                                        }
                                    }}
                                />
                                <Button
                                    onClick={handleVerificationConfirm}
                                    sx={{
                                        height: '100%',
                                        borderRadius: '0 12px 12px 0',
                                        backgroundColor: theme.palette.background.input,
                                        color: theme.palette.text.secondary,
                                        border: `1px solid ${theme.palette.border.main}`,
                                        borderLeft: 'none',
                                        px: 3,
                                        minWidth: '80px',
                                    }}
                                >
                                    확인
                                </Button>
                            </Box>
                        </Box>

                        </Box>
                    )}

                    {/* ───────────────────────────────── 계정 삭제 ───────────────────────────────── */}
                    <Box>
                        <Typography color="text.secondary" sx={{mb: 1}}>계정 삭제</Typography>
                        <Button
                            variant="contained"
                            color="error"
                            sx={{borderRadius: 1}}
                            onClick={() => setIsWithdrawDialogOpen(true)}
                        >
                            회원 탈퇴
                        </Button>
                    </Box>
                </Box>

            </Paper>

            <WithdrawConfirmDialog
                open={isWithdrawDialogOpen}
                onClose={() => setIsWithdrawDialogOpen(false)}
                onConfirm={handleWithdraw}
            />
        </Box>
    );
}
