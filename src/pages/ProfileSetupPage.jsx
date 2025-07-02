import { schoolDepartmentsJson } from '../data/schoolDepartmentsJson.cleaned';
import { useEffect } from 'react';
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Select,
    MenuItem,
    IconButton,
    TextField,
    List,
    ListItem,
    Paper,
    ListItemText
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PositionFilterBar from '../components/duo/PositionFilterBar';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { updateRankingInfo } from '/src/apis/rankAPI';
import { getMyInfo } from '../apis/authAPI';
import useAuthStore from '../storage/useAuthStore';

const POSITION_LIST = ['nothing', 'top', 'jungle', 'mid', 'bottom', 'support'];

export default function ProfileSetupPage() {
    const [position, setPosition] = useState('nothing');
    const [department, setDepartment] = useState('');
    const [selectedGender, setSelectedGender] = useState('비밀');
    const [selectedMbti, setSelectedMbti] = useState([]);
    const [memo, setMemo] = useState('');
    const [search, setSearch] = useState('');
    const [filteredDepts, setFilteredDepts] = useState([]);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [isUniversityVerified, setIsUniversityVerified] = useState(false);
    const navigate = useNavigate();
    const { userData } = useAuthStore();

    // 사용자의 인증된 대학교 정보 가져오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await getMyInfo();
                const profile = res.data;

                if (profile.certifiedUnivInfo) {
                    const { univName } = profile.certifiedUnivInfo;
                    setSelectedUniversity(univName);
                    setIsUniversityVerified(true);
                } else {
                    setIsUniversityVerified(false);
                }
            } catch (error) {
                console.error('사용자 정보 가져오기 실패:', error);
                setIsUniversityVerified(false);
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (!search || !selectedUniversity || !schoolDepartmentsJson[selectedUniversity]) {
            setFilteredDepts([]);
            return;
        }

        const allDepts = schoolDepartmentsJson[selectedUniversity];
        const result = allDepts.filter((dept) =>
            dept.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredDepts(result);
    }, [search, selectedUniversity]);

    const toggleMbti = (type) => {
        const groupMap = {
            E: ['E', 'I'], I: ['E', 'I'],
            N: ['N', 'S'], S: ['N', 'S'],
            F: ['F', 'T'], T: ['F', 'T'],
            P: ['P', 'J'], J: ['P', 'J'],
        };
        const group = groupMap[type];
        const updated = selectedMbti.filter((t) => !group.includes(t));
        setSelectedMbti([...updated, type]);
    };

    const handleSubmit = async () => {
        try {
            const mbtiString = [
                selectedMbti.find((type) => type === 'E' || type === 'I') || '',
                selectedMbti.find((type) => type === 'N' || type === 'S') || '',
                selectedMbti.find((type) => type === 'F' || type === 'T') || '',
                selectedMbti.find((type) => type === 'P' || type === 'J') || '',
            ].join('');

            const genderMap = {
                '남자': 'MALE',
                '여자': 'FEMALE',
                '비밀': 'SECRET',
            };

            const dto = {
                position: position.toUpperCase(),
                department,
                gender: genderMap[selectedGender],
                mbti: mbtiString,
                memo,
            };

            await updateRankingInfo(dto);
            alert('정보가 성공적으로 등록되었습니다.');
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('정보 등록에 실패했습니다.');
        }
    };



    return (
        <Box sx={{ backgroundColor: '#12121a', minHeight: '100vh', px: 2, py: 6, maxWidth: 460, mx: 'auto' }}>
            <Typography variant="h5" fontWeight="bold" color="#fff" mb={1}>
                내 정보 (선택사항)
            </Typography>
            <Typography fontSize="0.75rem" color="#888" mb={1}>
                랭킹페이지 > 내 정보 수정하기에서 변경할 수 있습니다.
            </Typography>

            {/* 주 포지션 */}
            <Typography mb={0.5} color="#aaa" fontSize="0.8rem">주 포지션</Typography>
            <Box display="flex" gap={1} mb={3}>
                <PositionFilterBar
                    positionFilter={position}
                    onPositionClick={setPosition}
                    selectedColor="#42E6B5"
                    unselectedColor="#31313D"
                    hoverColor="#42E6B5"
                    iconSize={26}
                    iconInvert={true}
                />
            </Box>

            {/* 학과 */}
            <Typography mb={0.5} color="#aaa" fontSize="0.8rem">학과</Typography>
            <Box sx={{ position: 'relative', mb: 3 }}>
                <TextField
                    fullWidth
                    size="small"
                    value={search}
                    disabled={!isUniversityVerified}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setDepartment('');
                        setFocusedIndex(-1);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                            setFocusedIndex((prev) => Math.min(prev + 1, filteredDepts.length - 1));
                        } else if (e.key === 'ArrowUp') {
                            setFocusedIndex((prev) => Math.max(prev - 1, 0));
                        } else if (e.key === 'Enter' && focusedIndex >= 0) {
                            const selected = filteredDepts[focusedIndex];
                            setDepartment(selected);
                            setSearch(selected);
                            setFilteredDepts([]);
                            setFocusedIndex(-1);
                        }
                    }}
                    placeholder={isUniversityVerified ? "학과명을 입력하세요" : "대학교 인증 후 이용 가능합니다"}
                    InputProps={{
                        startAdornment: (
                            <SearchIcon sx={{ color: '#888', mr: 1 }} />
                        ),
                    }}
                    sx={{
                        backgroundColor: isUniversityVerified ? '#2A2B31' : '#1A1A1A',
                        color: '#fff',
                        fontSize: '0.8rem',
                        input: { color: isUniversityVerified ? '#fff' : '#666' },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '6px',
                            '& fieldset': {
                                border: '1px solid #424254',
                                borderRadius: '6px'
                            },
                            '&:hover fieldset': {
                                border: '1px solid #424254',
                            },
                            '&.Mui-focused fieldset': {
                                border: '1px solid #424254',
                            },
                            '&.Mui-disabled fieldset': {
                                border: '1px solid #424254',
                            },
                        },
                    }}
                />

                {filteredDepts.length > 0 && search !== department && isUniversityVerified && (
                    <Paper
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 10,
                            backgroundColor: '#2A2B31',
                            border: '1px solid #424254',
                            borderTop: 'none',
                            borderBottomLeftRadius: 6,
                            borderBottomRightRadius: 6,
                            color: '#fff',
                            maxHeight: 180,
                            overflowY: 'auto',
                        }}
                    >
                        <List dense>
                            {filteredDepts.map((dept, index) => (
                                <ListItem
                                    key={index}
                                    selected={focusedIndex === index}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    onClick={() => {
                                        setDepartment(dept);
                                        setSearch(dept);
                                        setFilteredDepts([]);
                                        setFocusedIndex(-1);
                                    }}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        bgcolor: focusedIndex === index ? '#42E6B5' : 'inherit',
                                        color: focusedIndex === index ? '#000' : '#fff',
                                    }}
                                >
                                    <ListItemText primary={dept} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>

            {/* 성별 */}
            <Typography mb={0.5} color="#aaa" fontSize="0.8rem">성별</Typography>
            <Box display="flex" justifyContent="space-between" p={0.5} borderRadius={1} bgcolor="#424254" mb={3}>
                {['남자', '여자', '비밀'].map((g) => (
                    <Box
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        sx={{
                            flex: 1,
                            textAlign: 'center',
                            py: 1,
                            cursor: 'pointer',
                            borderRadius: 1,
                            fontSize: '0.85rem',
                            color: selectedGender === g ? '#fff' : '#888',
                            fontWeight: selectedGender === g ? 'bold' : 'normal',
                            backgroundColor: selectedGender === g ? '#42E6B5' : 'transparent',
                        }}
                    >
                        {g}
                    </Box>
                ))}
            </Box>

            {/* MBTI */}
            <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography color="#aaa" fontSize="0.8rem">MBTI</Typography>
                    <Box display="flex" alignItems="center">
                        <Typography color="#aaa" fontSize="0.8rem">초기화</Typography>
                        <IconButton size="small" onClick={() => setSelectedMbti([])}>
                            <RestartAltIcon sx={{ color: '#7B7B8E', fontSize: 18 }} />
                        </IconButton>
                    </Box>
                </Box>

                <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={0.5} textAlign="center" mb={0.5}>
                    {['외향', '직관', '감성', '탐색'].map((label, i) => (
                        <Typography key={i} fontSize="0.7rem" color="#888" lineHeight={1.2}>{label}</Typography>
                    ))}
                </Box>

                <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" rowGap={1} mb={0.5}>
                    {['E', 'N', 'F', 'P', 'I', 'S', 'T', 'J'].map((type) => (
                        <Button
                            key={type}
                            onClick={() => toggleMbti(type)}
                            sx={{
                                width: 50,
                                height: 50,
                                bgcolor: selectedMbti.includes(type) ? '#42E6B5' : '#2A2B31',
                                color: selectedMbti.includes(type) ? '#fff' : '#B7B7C9',
                                borderRadius: 0.5,
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                mx: 'auto',
                                minWidth: 0,
                                p: 0,
                            }}
                        >
                            {type}
                        </Button>
                    ))}
                </Box>

                <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={0.5} textAlign="center">
                    {['내향', '현실', '이성', '계획'].map((label, i) => (
                        <Typography key={i} fontSize="0.7rem" color="#888" lineHeight={1.2}>{label}</Typography>
                    ))}
                </Box>
            </Box>

            {/* 메모 */}
            <Typography mb={0.5} color="#aaa" fontSize="0.8rem">한 줄 소개</Typography>
            <TextField
                fullWidth
                size="small"
                rows={1}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                sx={{
                    bgcolor: '#424254',
                    color: '#fff',
                    borderRadius: 1,
                    input: { color: '#fff' },
                    fontSize: '0.8rem',
                }}
            />

            {/* 등록 및 건너뛰기 버튼 */}
            <Box display="flex" gap={1.5} mt={4}>
                <Button
                    fullWidth
                    onClick={() => navigate('/')}
                    sx={{
                        bgcolor: '#2A2B31',
                        color: '#fff',
                        fontWeight: 'bold',
                        height: 44,
                        fontSize: '1rem'
                    }}
                >
                    건너뛰기
                </Button>
                <Button
                    fullWidth
                    onClick={handleSubmit}
                    sx={{
                        bgcolor: '#42E6B5',
                        color: '#fff',
                        fontWeight: 'bold',
                        height: 44,
                        fontSize: '1rem'
                    }}
                >
                    완료
                </Button>
            </Box>
        </Box>
    );
}