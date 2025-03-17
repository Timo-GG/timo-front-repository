import { useEffect, useRef, useState } from 'react';
import MatchSidebar from '../components/sidebars/match/MatchSidebar';
import Header from '../components/common/Header';
import MatchingPlayerHeader from '../components/match/MatchingPlayerHeader';
import MatchingPlayerTableHeader from '../components/match/MatchingPlayerTableHeader';
import MatchingPlayerTableItem from '../components/match/MatchingPlayerTableItem';

import Chat from '../components/chat/Chat';
import BoardListSidebar from '../components/sidebars/board/BoardListSidebar';
import NotLoginedSidebar from '../components/sidebars/myInfo/NotLoginedSidebar';
import useAuthStore, { UserData } from '../storage/useAuthStore';
import io from 'socket.io-client';
import { getMatchingStatus } from '../apis/matching';

let matchingPlayers = Array.from({ length: 20 }, (_, i) => ({
  playerName: `Player${i + 1}`,
  playerTag: `#KR1`,
  tier: [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Emerald',
    'Diamond',
    'Master',
    'Grandmaster',
    'Challenger',
  ][Math.floor(Math.random() * 10)],
  gamePlayed: 10,
  //45~60
  winRate: Math.floor(Math.random() * 16) + 45,
  lastPlayed: '1시간 전',
}));
const MatchPage = () => {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(0);
  const [matchInfo, setMatchInfo] = useState({
    matchId: 0,
    matchUserId: 0,
  });
  const [duoInfo, setDuoInfo] = useState<UserData | null>(null);

  useEffect(() => {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      return;
    }

    if (!socketRef.current) {
      const newSocket = io('ws://3.34.183.7:8085?token=' + accessToken, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      newSocket.on('connect', () => {
        console.log('WebSocket 연결 성공');
        setIsConnected(true);
      });

      newSocket.on('connect_error', error => {
        console.error('WebSocket 연결 실패:', error);
        setIsConnected(false);
      });

      newSocket.onAny((event, ...args) => {
        console.log(`소켓 이벤트: ${event}`, args);
      });

      socketRef.current = newSocket;
    }

    async function getMatchingStatusData() {
      const response = await getMatchingStatus();
      console.log(response);
    }

    getMatchingStatusData();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, []);
  return (
    <>
      <Header />

      <div className="pl-40 relative flex flex-col gap-20 justify-center items-center">
        <div
          id="sidebar"
          className="absolute top-20 left-30 h-full w-307 flex flex-col gap-16"
        >
          <MatchSidebar
            socket={socketRef.current}
            roomId={roomId}
            setRoomId={setRoomId}
            matchInfo={matchInfo}
            setMatchInfo={setMatchInfo}
            duoInfo={duoInfo}
            setDuoInfo={setDuoInfo}
          />
          <NotLoginedSidebar />
          <BoardListSidebar />
        </div>
        {/* 매칭중인 플레이어 헤더 */}
        {/* todo: 듀오가 시작됐을때 화면에 표시 */}
        {roomId !== 0 && (
          <Chat roomId={roomId} socket={socketRef.current} duoInfo={duoInfo} />
        )}
        <MatchingPlayerHeader />
        <div className="w-874 px-10 bg-secondary-realdarkgray flex flex-col items-center">
          {/* 매칭중인 플레이어 테이블 */}
          <MatchingPlayerTableHeader />
          {matchingPlayers.map((player, i) => (
            <MatchingPlayerTableItem key={i} {...player} />
          ))}
        </div>
      </div>
    </>
  );
};

export default MatchPage;
