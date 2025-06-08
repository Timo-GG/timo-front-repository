// src/pages/MyPage.jsx
import React, {useState, useEffect} from 'react';
import {Box, Container, Tabs, Tab, useTheme, Typography} from '@mui/material';
import {useSearchParams} from 'react-router-dom';
import TabHeader from '../components/TabHeader';
import TableHeader from '../components/TableHeader';
import TableItem from '../components/TableItem';
import ChatPage from './ChatPage';
import DuoDetailModal from '../components/duo/DuoDetailModal';
import ScrimRequestModal from '../components/scrim/ScrimRequestModal';
import ReviewModal from '../components/ReviewModal';
import useAuthStore from '../storage/useAuthStore';
import EvaluationTableHeader from '../components/EvaluationTableHeader.jsx';
import EvaluationTableItem from '../components/EvaluationTableItem.jsx';
import {fetchReceivedRequests, fetchSentRequests} from "../apis/redisAPI.js";
import {fetchEvaluationData} from "../apis/reviewAPI.js";
import {useQuery} from "@tanstack/react-query";

function TabPanel({children, value, index}) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{pt: 0}}>{children}</Box>}
        </div>
    );
}

export default function MyPage({defaultTab, initialRoomId}) {
    const theme = useTheme();
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedScrim, setSelectedScrim] = useState(null);
    const [reviewUser, setReviewUser] = useState(null);
    const {userData} = useAuthStore();
    const memberId = userData?.memberId;
    const [mainTab, setMainTab] = useState(defaultTab || 0);
    const [requestSubTab, setRequestSubTab] = useState(0); // 0: 받은 요청, 1: 보낸 요청
    const [evaluationSubTab, setEvaluationSubTab] = useState(0); // 0: 받은 평가, 1: 보낸 평가
    const [searchParams] = useSearchParams();
    const roomIdFromURL = searchParams.get('roomId') ? parseInt(searchParams.get('roomId'), 10) : null;
    const roomIdFromProps = typeof initialRoomId === 'number' ? initialRoomId : roomIdFromURL;
    const currentUserPuuid = userData?.riotAccount?.puuid;
    const {data: receivedUsers = [], refetch: refetchReceived} = useQuery({
        queryKey: ['receivedRequests', memberId],
        queryFn: () => fetchReceivedRequests(memberId),
        enabled: !!memberId,
    });
    const {data: sentUsers = [], refetch: refetchSent} = useQuery({
        queryKey: ['sentRequests', memberId],
        queryFn: () => fetchSentRequests(memberId),
        enabled: !!memberId,
    });

    const {data: evaluationData = {received: [], sent: []}, refetch: refetchEvaluation} = useQuery({
        queryKey: ['evaluationData', currentUserPuuid],
        queryFn: () => fetchEvaluationData(currentUserPuuid),
        enabled: !!currentUserPuuid, // puuid가 있어야 호출
    });

    useEffect(() => {
        if (searchParams.get('tab') === 'chat') {
            setMainTab(2);
        }
    }, [searchParams]);

    const handleRowClick = (user) => {
        if (user.type === '듀오') {
            setSelectedUser(user);
        } else if (user.type === '내전') {
            setSelectedScrim(user);
        }
    };

    const handleEvaluate = (user) => {
        setReviewUser(user);
    };

    const renderSubTabs = (subTab, setSubTab, labels) => (
        <Box
            sx={{
                backgroundColor: '#2B2C3C',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                pt: 0,
                pr: 1,
                pb: 1,
                pl: 1,
                mb: 2,
            }}
        >
            <Tabs
                value={subTab}
                onChange={(_, newValue) => setSubTab(newValue)}
                textColor="inherit"
                TabIndicatorProps={{style: {backgroundColor: '#ffffff'}}}
                sx={{
                    '.MuiTabs-indicator': {
                        backgroundColor: '#ffffff',
                    },
                }}
            >
                <Tab label={labels[0]}/>
                <Tab label={labels[1]}/>
            </Tabs>
        </Box>
    );
    return (
        <Box sx={{backgroundColor: theme.palette.background.default, minHeight: '100vh', pt: 5}}>
            <Container maxWidth="lg" sx={{px: {xs: 1, sm: 3}}}>
                <TabHeader
                    tab={mainTab}
                    onTabChange={(_, newValue) => setMainTab(newValue)}
                    firstLabel="요청"
                    secondLabel="평가"
                    thirdLabel="채팅"
                />

                {mainTab === 0 && (
                    <>
                        {renderSubTabs(requestSubTab, setRequestSubTab, ['받은 요청', '보낸 요청'])}
                        <TabPanel value={requestSubTab} index={0}>
                            <Box sx={{overflowX: {xs: 'auto', sm: 'visible'}}}>
                                <Box sx={{minWidth: {xs: '900px', sm: 'auto'}}}>
                                    <TableHeader/>
                                    {receivedUsers.length === 0 ? (
                                        <Box sx={{
                                            textAlign: 'center',
                                            py: 4,
                                            color: '#666',
                                            backgroundColor: '#2B2C3C',
                                            borderBottomLeftRadius: 10,
                                            borderBottomRightRadius: 10
                                        }}>
                                            <Typography>받은 요청이 없습니다.</Typography>
                                        </Box>
                                    ) : (
                                        receivedUsers.map(user => (
                                            <Box key={user.id} onClick={() => handleRowClick(user)}
                                                 sx={{cursor: 'pointer'}}>
                                                <TableItem
                                                    received={true}
                                                    user={user}
                                                    onEvaluate={handleEvaluate}
                                                    onRequestUpdate={refetchReceived}
                                                />
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            </Box>
                        </TabPanel>

                        {/* 보낸 요청 탭 */}
                        <TabPanel value={requestSubTab} index={1}>
                            <Box sx={{overflowX: {xs: 'auto', sm: 'visible'}}}>
                                <Box sx={{minWidth: {xs: '900px', sm: 'auto'}}}>
                                    <TableHeader/>
                                    {sentUsers.length === 0 ? (
                                        <Box sx={{
                                            textAlign: 'center',
                                            py: 4,
                                            color: '#666',
                                            backgroundColor: '#2B2C3C',
                                            borderBottomLeftRadius: 10,
                                            borderBottomRightRadius: 10
                                        }}>
                                            <Typography>보낸 요청이 없습니다.</Typography>
                                        </Box>
                                    ) : (
                                        sentUsers.map(user => (
                                            <Box key={user.id} onClick={() => handleRowClick(user)}
                                                 sx={{cursor: 'pointer'}}>
                                                <TableItem
                                                    received={false}
                                                    user={user}
                                                    onEvaluate={handleEvaluate}
                                                    onRequestUpdate={refetchSent}
                                                />
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            </Box>
                        </TabPanel>
                    </>
                )}

                {mainTab === 1 && (
                    <>
                        {renderSubTabs(evaluationSubTab, setEvaluationSubTab, ['받은 평가', '보낸 평가'])}
                        {/* 평가 탭 - 받은 평가 */}
                        <TabPanel value={evaluationSubTab} index={0}>
                            <Box sx={{overflowX: {xs: 'auto', sm: 'visible'}}}>
                                <Box sx={{minWidth: {xs: '900px', sm: 'auto'}}}>
                                    <EvaluationTableHeader/>
                                    {evaluationData.received.length === 0 ? (
                                        <Box sx={{
                                            textAlign: 'center',
                                            py: 4,
                                            color: '#666',
                                            backgroundColor: '#2B2C3C',
                                            borderBottomLeftRadius: 10,
                                            borderBottomRightRadius: 10
                                        }}>
                                            <Typography>받은 평가가 없습니다.</Typography>
                                        </Box>
                                    ) : (
                                        evaluationData.received.map(evaluation => (
                                            <Box key={evaluation.id}> {/* onClick 제거 */}
                                                <EvaluationTableItem
                                                    user={evaluation.otherUser}
                                                    evaluation={evaluation}
                                                    status="받은 평가"
                                                    onEvaluate={handleEvaluate}
                                                />
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            </Box>
                        </TabPanel>

                        {/* 평가 탭 - 보낸 평가 */}
                        <TabPanel value={evaluationSubTab} index={1}>
                            <Box sx={{overflowX: {xs: 'auto', sm: 'visible'}}}>
                                <Box sx={{minWidth: {xs: '900px', sm: 'auto'}}}>
                                    <EvaluationTableHeader/>
                                    {evaluationData.sent.length === 0 ? (
                                        <Box sx={{
                                            textAlign: 'center',
                                            py: 4,
                                            color: '#666',
                                            backgroundColor: '#2B2C3C',
                                            borderBottomLeftRadius: 10,
                                            borderBottomRightRadius: 10
                                        }}>
                                            <Typography>보낸 평가가 없습니다.</Typography>
                                        </Box>
                                    ) : (
                                        evaluationData.sent.map(evaluation => (
                                            <Box key={evaluation.id}> {/* onClick 제거, cursor 스타일 제거 */}
                                                <EvaluationTableItem
                                                    user={evaluation.otherUser}
                                                    evaluation={evaluation}
                                                    status="보낸 평가"
                                                    onEvaluate={handleEvaluate}
                                                />
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            </Box>
                        </TabPanel>
                    </>
                )}

                {mainTab === 2 && (
                    <TabPanel value={mainTab} index={2}>
                        <ChatPage initialRoomId={roomIdFromProps}/>
                    </TabPanel>
                )}
            </Container>

            {selectedUser && (
                <DuoDetailModal open handleClose={() => setSelectedUser(null)} partyData={selectedUser}                     isMyPageView={true}
                />
            )}
            {selectedScrim && (
                <ScrimRequestModal open handleClose={() => setSelectedScrim(null)} partyId={selectedScrim.id}
                                   scrims={[selectedScrim]}/>
            )}
            <ReviewModal
                open={Boolean(reviewUser)}
                handleClose={() => setReviewUser(null)}
                user={reviewUser}
                onSubmitSuccess={refetchEvaluation}
            />
        </Box>
    );
}
