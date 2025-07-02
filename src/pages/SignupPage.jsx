import React, {useState, useEffect, useCallback} from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    useTheme,
    Checkbox,
    FormControlLabel,
    Paper,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {
    updateUsername,
    verifyAccount,
    resetRiotAccount,
    registerRanking,
    updateUserAgreement,
    updateNotificationEmail
} from '../apis/accountAPI';
import {deleteMyRanking} from '../apis/rankAPI';
import {
    requestUnivVerification,
    verifyUnivCode,
    checkUniv,
    updateUnivAccount,
    deleteUnivAccount
} from '../apis/univAPI';
import {getMyInfo} from '../apis/authAPI';
import useAuthStore from '../storage/useAuthStore';
import TermsModal from '../components/TermsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { univJson } from '../data/univJson'; // univJson.js 파일 경로에 맞게 수정

export default function SignupPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const {setUserData, setEmailVerified, setSummonerVerified} = useAuthStore();

    const [oauthEmail, setOauthEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [summonerName, setSummonerName] = useState('');
    const [university, setUniversity] = useState('');
    const [schoolEmail, setSchoolEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const [emailError, setEmailError] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [universityStatus, setUniversityStatus] = useState('');
    const [isUniversityValid, setIsUniversityValid] = useState(false);
    const [isUniversityLocked, setIsUniversityLocked] = useState(false);
    const [isUniversityVerified, setIsUniversityVerified] = useState(false);

    const [isSummonerVerified, setIsSummonerVerified] = useState(false);
    const [summonerStatusMsg, setSummonerStatusMsg] = useState('');

    const [nicknameStatus, setNicknameStatus] = useState('');
    const [nicknameError, setNicknameError] = useState('');

    const [skipDialogOpen, setSkipDialogOpen] = useState(false);

    const [allAgreed, setAllAgreed] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');

    const [universitySearch, setUniversitySearch] = useState('');
    const [filteredUniversities, setFilteredUniversities] = useState([]);
    const [focusedUniversityIndex, setFocusedUniversityIndex] = useState(-1);
    const universities = univJson.universities; // 배열 추출

    const [notificationEmail, setNotificationEmail] = useState('');
    const [useOAuthForNotification, setUseOAuthForNotification] = useState(true);
    const [notificationEmailError, setNotificationEmailError] = useState('');
    const [notificationEmailStatus, setNotificationEmailStatus] = useState('');
    const [isNotificationEmailSet, setIsNotificationEmailSet] = useState(false);


    const openModal = (type) => {
        setModalType(type);
        setModalOpen(true);
    };

    const isFormComplete = () => {
        return (
            nickname.trim() !== '' &&
            isSummonerVerified &&
            isUniversityVerified &&
            termsAgreed &&
            privacyAgreed
        );
    };


    const handleNext = () => {
        if (!isFormComplete()) {
            alert('모든 필수 항목을 완료해주세요.\n- 닉네임 설정\n- 소환사 계정 인증\n- 대학교 인증\n- 개인정보 동의');
            return;
        }

        // 🚀 즉시 다음 페이지로 이동 (차단하지 않음)
        navigate('/profile-setup', {
            state: {
                nickname,
                summonerName,
                university,
                schoolEmail,
                oauthEmail,
                notificationEmail: useOAuthForNotification ? oauthEmail : notificationEmail
            },
        });

        // 🔄 백그라운드에서 비동기 처리 (페이지 이동과 병렬 실행)
        (async () => {
            try {
                // 1. 알림 이메일 설정 (선택사항)
                if (useOAuthForNotification && !isNotificationEmailSet) {
                    try {
                        await updateNotificationEmail(oauthEmail);
                        console.log('✅ 알림 이메일 설정 완료:', oauthEmail);
                    } catch (error) {
                        console.warn('⚠️ 알림 이메일 설정 실패 (선택사항):', error);
                    }
                }

                // 2. 랭킹 등록 (양쪽 인증 완료 시)
                if (isSummonerVerified && isUniversityVerified) {
                    try {
                        const info = await getMyInfo();
                        const puuid = info.data.riotAccount?.puuid;
                        if (puuid) {
                            await registerRanking(puuid);
                            console.log('✅ 랭킹 등록 완료');
                        }
                    } catch (err) {
                        console.error('❌ 랭킹 등록 실패:', err);
                    }
                }
            } catch (error) {
                console.error('❌ 백그라운드 처리 중 오류:', error);
                // 사용자는 이미 다음 페이지로 이동했으므로 별도 알림 없음
            }
        })();
    };

    const handleSkipConfirm = () => {
        navigate('/')
    };

    // 초기 사용자 정보 로드
    useEffect(() => {
        (async () => {
            try {
                const res = await getMyInfo();
                const profile = res.data;
                setUserData(profile);
                setOauthEmail(profile.email || '');
                setNickname(profile.username || '');

                if (profile.notificationEmail) {
                    setNotificationEmail(profile.notificationEmail);
                    setIsNotificationEmailSet(true);
                    setUseOAuthForNotification(profile.notificationEmail === profile.email);
                    setNotificationEmailStatus('✔️ 알림 이메일이 설정되었습니다.');
                } else {
                    setNotificationEmail(profile.email || '');
                    setUseOAuthForNotification(true);
                    setIsNotificationEmailSet(false);
                }

                // 🔥 RiotAccount null 체크 추가
                if (profile.riotAccount &&
                    profile.riotAccount.accountName &&
                    profile.riotAccount.accountTag &&
                    profile.riotAccount.accountName !== 'null' &&
                    profile.riotAccount.accountTag !== 'null') {

                    const {accountName, accountTag, puuid} = profile.riotAccount;
                    setSummonerName(`${accountName}#${accountTag}`);
                    setIsSummonerVerified(true);
                    setSummonerVerified(true);
                    setSummonerStatusMsg('✔️ 인증 완료되었습니다.');
                } else {
                    // RiotAccount가 null이거나 값이 유효하지 않은 경우
                    setSummonerName('');
                    setIsSummonerVerified(false);
                    setSummonerStatusMsg('');
                }

                if (profile.certifiedUnivInfo) {
                    const {univName, univCertifiedEmail} = profile.certifiedUnivInfo;
                    setUniversity(univName);
                    setSchoolEmail(univCertifiedEmail);
                    setIsUniversityLocked(true);
                    setIsUniversityValid(true);
                    setIsUniversityVerified(true);
                    setUniversityStatus('✔️ 이미 인증이 완료된 대학교 계정입니다.');
                    setEmailError('');
                }
            } catch (err) {
                console.error('유저 정보 불러오기 실패:', err);
            }
        })();
    }, []);

    const handleNotificationEmailToggle = useCallback(async () => {
        setNotificationEmailError('');
        setNotificationEmailStatus('');

        if (isNotificationEmailSet) {
            // 해제
            try {
                await updateNotificationEmail(null);
                setIsNotificationEmailSet(false);
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
            const finalEmail = useOAuthForNotification ? oauthEmail : notificationEmail;

            // 이메일 유효성 검사
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(finalEmail)) {
                setNotificationEmailError('올바르지 않은 이메일 형식입니다.');
                return;
            }

            try {
                await updateNotificationEmail(finalEmail);
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
    }, [isNotificationEmailSet, useOAuthForNotification, oauthEmail, notificationEmail]);

    useEffect(() => {
        if (!universitySearch || !universities) {
            setFilteredUniversities([]);
            return;
        }

        const result = universities.filter((univ) =>
            univ.toLowerCase().includes(universitySearch.toLowerCase())
        );
        setFilteredUniversities(result.slice(0, 10)); // 최대 10개만 표시
    }, [universitySearch]);

    // 소환사 인증/해제 핸들러
    const handleSummonerToggle = useCallback(async () => {
        setSummonerStatusMsg('');
        if (isSummonerVerified) {
            try {
                await resetRiotAccount();
                await deleteMyRanking();
                setIsSummonerVerified(false);
                setSummonerName('');
                setSummonerStatusMsg('소환사 인증이 취소되었습니다.');
            } catch {
                setSummonerStatusMsg('소환사 취소 중 오류가 발생했습니다.');
            }
        } else {
            const [name, tag] = summonerName.split('#');
            if (!name || !tag) {
                setSummonerStatusMsg('형식이 올바르지 않습니다. 예: 짱아깨비#KR1');
                return;
            }
            try {
                const res = await verifyAccount({accountName: name, tagLine: tag});
                if (!res.success) {
                    setSummonerStatusMsg('소환사 정보를 찾을 수 없습니다.');
                    return;
                }
                setIsSummonerVerified(true);
                setSummonerVerified(true);
                setSummonerStatusMsg('✔️ 소환사 인증 완료');
                const {data: profile} = await getMyInfo()
                setUserData(profile);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    const errorMessage = error.response.data?.message || '소환사 인증 중 오류가 발생했습니다.';
                    setSummonerStatusMsg(errorMessage);
                } else {
                    setSummonerStatusMsg('소환사 인증 중 오류가 발생했습니다.');
                }
            }
        }
    }, [isSummonerVerified, summonerName]);

    // 대학교 확인/해제 핸들러
    // 대학교 확인/해제 핸들러 수정
    const handleUniversityCheck = useCallback(async () => {
        if (isUniversityLocked) {
            try {
                await updateUnivAccount({univName: null, univEmail: null});
                setIsUniversityLocked(false);
                setIsUniversityValid(false);
                setIsUniversityVerified(false);
                setUniversity('');
                setUniversitySearch(''); // 검색어도 초기화
                setSchoolEmail('');
                setEmailError('');
                setEmailSent(false);
                setShowVerificationInput(false);
                setUniversityStatus('');
                setFilteredUniversities([]); // 필터된 목록도 초기화

                const {data: profile} = await getMyInfo();
                setUserData(profile);

                console.log('대학교 인증이 해제되었습니다.');
            } catch (error) {
                console.error('대학교 해제 실패:', error);
                setUniversityStatus('대학교 해제 중 오류가 발생했습니다.');
            }
            return;
        }

        try {
            const res = await checkUniv({univName: university});
            if (res.success) {
                setUniversityStatus('존재하는 대학교입니다.');
                setIsUniversityValid(true);
                setIsUniversityLocked(true);
            } else {
                setUniversityStatus('존재하지 않는 대학교입니다.');
            }
        } catch {
            setUniversityStatus('대학교 확인 중 오류가 발생했습니다.');
        }
    }, [isUniversityLocked, university]);

    // 학교 이메일 등록/해제 핸들러도 수정
    const handleEmailRegister = useCallback(async () => {
        // 이미 인증된 상태라면 해제 처리
        if (isUniversityVerified) {
            try {
                // 대학 이메일 초기화 API 호출
                await deleteUnivAccount();
                await updateUnivAccount({univName: null, univEmail: null});
                // 상태 초기화
                setIsUniversityVerified(false);
                setIsUniversityLocked(false);
                setIsUniversityValid(false);
                setUniversity('');
                setSchoolEmail('');
                setEmailError('');
                setEmailSent(false);
                setShowVerificationInput(false);
                setUniversityStatus('');

                // 사용자 정보 업데이트
                const {data: profile} = await getMyInfo();
                setUserData(profile);

                console.log('학교 이메일 인증이 해제되었습니다.');
            } catch (error) {
                console.error('학교 이메일 해제 실패:', error);
                setEmailError('학교 이메일 해제 중 오류가 발생했습니다.');
            }
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(schoolEmail)) {
            setEmailError('올바르지 않은 이메일 입니다.');
            return;
        }
        setEmailError('');

        try {
            const res = await requestUnivVerification({univName: university, univEmail: schoolEmail});
            if (res.success) {
                setEmailSent(true);
                setShowVerificationInput(true);
            } else if (res.errorCode === 902) {
                setEmailError(res.message);
            } else if (res.errorCode === 1001) {
                setEmailError(res.message);
            } else {
                setEmailError('학교명 또는 이메일이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('handleEmailRegister에서 잡힌 에러:', error);
            if (error.response) {
                console.error('서버 응답 상태:', error.response.status, error.response.data);
                setEmailError(error.response.data?.message || '서버 오류가 발생했습니다.');
            } else if (error.request) {
                console.error('요청이 나갔으나 응답이 없습니다:', error.request);
                setEmailError('네트워크 오류가 발생했습니다.');
            } else {
                console.error('요청 설정 중 예외 발생:', error.message);
                setEmailError('예기치 못한 오류가 발생했습니다.');
            }
        }
    }, [university, schoolEmail, isUniversityVerified]);

    // 인증 코드 확인 핸들러
    const handleVerificationConfirm = useCallback(async () => {
        try {
            await verifyUnivCode(verificationCode, {univName: university, univEmail: schoolEmail});
            await updateUnivAccount({univName: university, univEmail: schoolEmail});
            const {data: profile} = await getMyInfo()
            setUserData(profile);
            setIsUniversityVerified(true);
            setShowVerificationInput(false);
            setEmailSent(false);
            setEmailError(''); // 에러 메시지 초기화
        } catch {
            setVerificationError('인증코드가 올바르지 않거나 만료되었습니다.');
        }
    }, [verificationCode, university, schoolEmail]);

    useEffect(() => {
        if (termsAgreed && privacyAgreed) {
            updateUserAgreement();
        }
    }, [termsAgreed, privacyAgreed, updateUserAgreement]);

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.default,
                minHeight: '100vh',
                pt: 6,
                px: 2,
                maxWidth: 460,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">회원가입</Typography>
                <Button
                    variant="text"
                    onClick={() => setSkipDialogOpen(true)}
                    sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.9rem',
                        textDecoration: 'underline',
                        '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline',
                        }
                    }}
                >
                    다음에 하기
                </Button>
            </Box>

            {/* 개인정보 동의 */}
            <Box sx={{ mt: 3 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>개인정보 동의</Typography>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={termsAgreed}
                            onChange={(e) => setTermsAgreed(e.target.checked)}
                            sx={{
                                color: theme.palette.text.secondary,
                                '&.Mui-checked': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{color: theme.palette.text.secondary}}>
                            <span
                                onClick={() => openModal('terms')}
                                style={{
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                서비스 이용약관
                            </span>에 동의합니다. (필수)
                        </Typography>
                    }
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={privacyAgreed}
                            onChange={(e) => setPrivacyAgreed(e.target.checked)}
                            sx={{
                                color: theme.palette.text.secondary,
                                '&.Mui-checked': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{color: theme.palette.text.secondary}}>
                            <span
                                onClick={() => openModal('privacy')}
                                style={{
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                개인정보 수집·이용
                            </span>에 동의합니다. (필수)
                        </Typography>
                    }
                />
            </Box>

            {/* 알림 수신 이메일 */}
            <Box sx={{ mt: 1 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    알림 수신 이메일 (선택사항)
                </Typography>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useOAuthForNotification}
                            onChange={(e) => {
                                setUseOAuthForNotification(e.target.checked);
                                if (e.target.checked) {
                                    setNotificationEmail(oauthEmail);
                                    setNotificationEmailError('');
                                } else {
                                    setNotificationEmail('');
                                }
                            }}
                            disabled={isNotificationEmailSet}
                            sx={{
                                color: theme.palette.text.secondary,
                                '&.Mui-checked': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            가입한 이메일로 알림 받기
                        </Typography>
                    }
                />



                {!useOAuthForNotification && !isNotificationEmailSet && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', height: '56px' }}>
                            <TextField
                                fullWidth
                                value={notificationEmail}
                                onChange={(e) => {
                                    setNotificationEmail(e.target.value);
                                    setNotificationEmailError('');
                                }}
                                variant="outlined"
                                placeholder="알림을 받을 이메일 주소를 입력하세요"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '100%',
                                        borderRadius: '12px 0 0 12px',
                                        backgroundColor: theme.palette.background.input,
                                        border: `1px solid ${theme.palette.border.main}`,
                                        '& fieldset': { borderColor: 'transparent' },
                                        '& input': {
                                            color: theme.palette.text.primary,
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
                                등록
                            </Button>
                        </Box>
                    </Box>
                )}

                {isNotificationEmailSet && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', height: '56px' }}>
                            <TextField
                                fullWidth
                                value={notificationEmail || '설정된 알림 이메일'}
                                disabled={true}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '100%',
                                        borderRadius: '12px 0 0 12px',
                                        backgroundColor: theme.palette.background.inputDisabled,
                                        border: `1px solid ${theme.palette.border.main}`,
                                        '& fieldset': { borderColor: 'transparent' },
                                        '& input': {
                                            color: theme.palette.text.disabled,
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
                                해제
                            </Button>
                        </Box>
                    </Box>
                )}

                <Box sx={{ minHeight: 20, mt: 1 }}>
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
                    {!notificationEmailError && !notificationEmailStatus && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                display: 'block',
                                pl: 1
                            }}
                        >
                            매칭 관련 상태, 채팅 알림 등을 받을 수 있습니다.
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* 이메일 */}
            <Box>
                <Typography color="text.secondary" mb={1}>이메일</Typography>
                <TextField
                    fullWidth
                    disabled
                    value={oauthEmail}
                    variant="outlined"
                    sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: theme.palette.text.disabled,
                        },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: theme.palette.background.inputDisabled,
                        }
                    }}
                />
            </Box>

            {/* 닉네임 */}
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                <Typography color="text.secondary">닉네임</Typography>
                <Box sx={{display: 'flex', height: '56px'}}>
                    <TextField
                        fullWidth
                        value={nickname}
                        onChange={(e) => {
                            setNickname(e.target.value);
                            setNicknameError('');
                            setNicknameStatus('');
                        }}
                        variant="outlined"
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
                                await updateUsername(nickname);
                                const res = await getMyInfo();
                                setUserData(res.data);
                                setNicknameStatus('닉네임이 성공적으로 변경되었습니다.');
                                setNicknameError('');
                            } catch (err) {
                                console.log(err);
                                setNicknameError('이미 사용 중인 닉네임입니다.');
                                setNicknameStatus('');
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
                {(nicknameStatus || nicknameError) && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: nicknameError
                                ? theme.palette.error.main
                                : theme.palette.success.main,
                            pl: 1,
                        }}
                    >
                        {nicknameError || nicknameStatus}
                    </Typography>
                )}
            </Box>

            {/* 소환사 이름 */}
            <Box>
                <Typography color="text.secondary" sx={{mb: 1}}>소환사 이름</Typography>
                <Box sx={{display: 'flex', height: '56px'}}>
                    <TextField
                        fullWidth
                        placeholder="짱아깨비#KR1"
                        value={summonerName}
                        disabled={isSummonerVerified}
                        onChange={(e) => {
                            setSummonerName(e.target.value);
                            setIsSummonerVerified(false);
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
                        onClick={handleSummonerToggle}
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
                        {isSummonerVerified ? '해제' : '확인'}
                    </Button>
                </Box>
                {summonerStatusMsg && (
                    <Typography
                        variant="caption"
                        sx={{
                            mt: 1,
                            color: summonerStatusMsg.includes('✔️')
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                        }}
                    >
                        {summonerStatusMsg}
                    </Typography>
                )}
            </Box>

            {/* 대학교 */}
            <Box>
                <Typography color="text.secondary" sx={{mb: 1}}>대학교</Typography>
                <Box sx={{ position: 'relative' }}>
                    <Box sx={{display: 'flex', height: '56px'}}>
                        <TextField
                            fullWidth
                            value={universitySearch}
                            onChange={(e) => {
                                setUniversitySearch(e.target.value);
                                setUniversity('');
                                setUniversityStatus('');
                                setFocusedUniversityIndex(-1);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowDown') {
                                    setFocusedUniversityIndex((prev) =>
                                        Math.min(prev + 1, filteredUniversities.length - 1)
                                    );
                                } else if (e.key === 'ArrowUp') {
                                    setFocusedUniversityIndex((prev) => Math.max(prev - 1, 0));
                                } else if (e.key === 'Enter' && focusedUniversityIndex >= 0) {
                                    const selected = filteredUniversities[focusedUniversityIndex];
                                    setUniversity(selected);
                                    setUniversitySearch(selected);
                                    setFilteredUniversities([]);
                                    setFocusedUniversityIndex(-1);
                                }
                            }}
                            disabled={isUniversityLocked}
                            variant="outlined"
                            placeholder="서울과학기술대학교"
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
                            {isUniversityLocked ? '해제' : '확인'}
                        </Button>
                    </Box>

                    {/* 대학교 검색 결과 드롭다운 */}
                    {filteredUniversities.length > 0 && universitySearch !== university && !isUniversityLocked && (
                        <Paper
                            sx={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 10,
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.border.main}`,
                                borderTop: 'none',
                                borderBottomLeftRadius: 12,
                                borderBottomRightRadius: 12,
                                maxHeight: 200,
                                overflowY: 'auto',
                                boxShadow: theme.shadows[4],
                            }}
                        >
                            <List dense>
                                {filteredUniversities.map((univ, index) => (
                                    <ListItem
                                        key={index}
                                        selected={focusedUniversityIndex === index}
                                        onMouseEnter={() => setFocusedUniversityIndex(index)}
                                        onClick={() => {
                                            setUniversity(univ);
                                            setUniversitySearch(univ);
                                            setFilteredUniversities([]);
                                            setFocusedUniversityIndex(-1);
                                        }}
                                        sx={{
                                            px: 2,
                                            py: 1,
                                            cursor: 'pointer',
                                            bgcolor: focusedUniversityIndex === index
                                                ? theme.palette.action.hover
                                                : 'inherit',
                                            '&:hover': {
                                                bgcolor: theme.palette.action.hover,
                                            },
                                        }}
                                    >
                                        <ListItemText
                                            primary={univ}
                                            sx={{
                                                '& .MuiListItemText-primary': {
                                                    fontSize: '0.9rem',
                                                    color: theme.palette.text.primary,
                                                }
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                </Box>

                {universityStatus && (
                    <Typography
                        variant="caption"
                        sx={{
                            mt: 1,
                            color: universityStatus.includes('존재하지')
                                ? theme.palette.error.main
                                : theme.palette.info.main,
                        }}
                    >
                        {universityStatus}
                    </Typography>
                )}
            </Box>

            {/* 학교 이메일 */}
            <Box>
                <Typography color="text.secondary" sx={{mb: 1}}>학교 이메일</Typography>
                <Box sx={{display: 'flex', height: '56px'}}>
                    <TextField
                        fullWidth
                        value={schoolEmail}
                        onChange={(e) => {
                            setSchoolEmail(e.target.value);
                            setEmailError('');
                            setEmailSent(false);
                        }}
                        disabled={!isUniversityValid || isUniversityVerified}
                        variant="outlined"
                        placeholder="학교 이메일 입력"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: '100%',
                                borderRadius: isUniversityVerified ? '12px' : '12px 0 0 12px', // 버튼이 없으면 전체 둥글게
                                backgroundColor: (!isUniversityValid || isUniversityVerified)
                                    ? theme.palette.background.inputDisabled
                                    : theme.palette.background.input,
                                border: `1px solid ${theme.palette.border.main}`,
                                '& fieldset': {borderColor: 'transparent'},
                                '& input': {
                                    color: (!isUniversityValid || isUniversityVerified)
                                        ? theme.palette.text.disabled
                                        : theme.palette.text.primary,
                                    padding: '12px 14px'
                                },
                            },
                        }}
                    />
                    {/* 인증 완료 시 버튼 숨기기 */}
                    {!isUniversityVerified && (
                        <Button
                            onClick={handleEmailRegister}
                            disabled={!isUniversityValid}
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
                    )}
                </Box>
                <Box sx={{minHeight: 20, mt: 1}}>
                    {emailError && (
                        <Typography variant="caption" color={theme.palette.error.main}>
                            {emailError}
                        </Typography>
                    )}
                    {!emailError && emailSent && (
                        <Typography variant="caption" color={theme.palette.info.main}>
                            인증코드를 전송하였습니다.
                        </Typography>
                    )}
                    {!emailError && !emailSent && isUniversityVerified && (
                        <Typography variant="caption" color={theme.palette.success.main}>
                            ✔️ 인증 완료되었습니다.
                        </Typography>
                    )}
                </Box>
            </Box>


            {/* 인증 코드 */}
            {showVerificationInput && (
                <Box>
                    <Typography color="text.secondary" mb={1}>인증 코드</Typography>
                    <Box sx={{display: 'flex', height: '56px'}}>
                        <TextField
                            fullWidth
                            value={verificationCode}
                            onChange={(e) => {
                                setVerificationCode(e.target.value);
                                setVerificationError('');
                            }}
                            variant="outlined"
                            placeholder="인증 코드를 입력하세요"
                            error={Boolean(verificationError)}
                            helperText={verificationError}
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
            )}

            {/* 다음 버튼 */}
            <Button
                variant="contained"
                fullWidth
                disabled={!isFormComplete()} // 🔥 조건부 비활성화
                sx={{
                    height: '56px',
                    borderRadius: '12px',
                    backgroundColor: isFormComplete()
                        ? theme.palette.primary.main
                        : theme.palette.action.disabled,
                    color: isFormComplete() ? 'white' : theme.palette.text.disabled,
                    fontWeight: 'bold',
                    mt: 4,
                    '&:disabled': {
                        backgroundColor: '#424254',
                        color: theme.palette.text.disabled,
                    }
                }}
                onClick={handleNext}
            >
                다음 {!isFormComplete() && '(모든 항목을 완료해주세요)'}
            </Button>

            {/* 🔥 다음에 하기 확인 다이얼로그 */}
            <ConfirmDialog
                open={skipDialogOpen}
                onClose={() => setSkipDialogOpen(false)}
                onConfirm={handleSkipConfirm}
                title="정말 다음에 하시겠습니까?"
                message="저희 서비스를 원활하게 이용하려면 소환사 계정 인증과 대학교 인증이 필요합니다. 나중에 마이페이지에서 언제든지 인증하실 수 있습니다."
                confirmText="다음에 하기"
                cancelText="계속 작성하기"
                danger={false}
            />

            {/* 모달 */}
            <TermsModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                type={modalType}
            />
        </Box>
    );
}
