import { useEffect, useRef, useState } from 'react';
import MatchSidebar from '../components/match/MatchSidebar';
import Header from '../components/common/Header';
import MatchingPlayerHeader from '../components/match/MatchingPlayerHeader';
import MatchingPlayerTableHeader from '../components/match/MatchingPlayerTableHeader';
import MatchingPlayerTableItem from '../components/match/MatchingPlayerTableItem';
import io from 'socket.io-client';

import Chat from '../components/chat/Chat';
import useAuthStore from '../storage/useAuthStore';
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

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;

    if (!token) {
      console.error('Access Token이 없습니다.');
      return;
    }

    if (!socketRef.current) {
      const newSocket = io('ws://3.34.183.7:8085?token=' + token, {
        reconnectionAttempts: 5, // 재연결 시도 횟수 설정
        reconnectionDelay: 2000, // 재연결 대기 시간 (2초)
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

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Header />

      <div className="pl-40 relative flex flex-col gap-20 justify-center items-center">
        <div id="sidebar" className="absolute top-0 left-30 h-full w-307">
          <MatchSidebar socket={socketRef.current} />
        </div>
        {/* 매칭중인 플레이어 헤더 */}
        {/* todo: 듀오가 시작됐을때 화면에 표시 */}
        <Chat />
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
