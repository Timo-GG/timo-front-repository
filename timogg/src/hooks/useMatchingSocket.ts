import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import useAuthStore, { UserData } from '../storage/useAuthStore';
import { getMatchingStatus } from '../apis/matching';
export default function useMatchingSocket() {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
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

    if (!socket) {
      const newSocket = io('wss://timo-api.duckdns.org?token=' + accessToken, {
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

      setSocket(newSocket);
    }

    async function getMatchingStatusData() {
      const response = await getMatchingStatus();
      console.log(response);
    }

    getMatchingStatusData();

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, []);
  return {
    isConnected,
    roomId,
    matchInfo,
    duoInfo,
    setDuoInfo,
    setMatchInfo,
    setRoomId,
    socket,
  };
}
