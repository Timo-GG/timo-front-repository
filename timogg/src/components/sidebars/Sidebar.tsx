import useAuthStore from '../../storage/useAuthStore';
import BoardListSidebar from './board/BoardListSidebar';
import MatchSidebar from './match/MatchSidebar';
import LoginedSidebar from './myInfo/LoginedSidebar';
import NotLoginedSidebar from './myInfo/NotLoginedSidebar';

import { UserData } from '../../storage/useAuthStore';
import { io } from 'socket.io-client';
interface SidebarProps {
  socket: ReturnType<typeof io> | null;
  roomId: number;
  setRoomId: React.Dispatch<React.SetStateAction<number>>;
  matchInfo: {
    matchId: number;
    matchUserId: number;
  };
  setMatchInfo: React.Dispatch<
    React.SetStateAction<{
      matchId: number;
      matchUserId: number;
    }>
  >;
  duoInfo: UserData | null;
  setDuoInfo: React.Dispatch<React.SetStateAction<UserData | null>>;
}
export default function Sidebar({
  socket,
  roomId,
  setRoomId,
  matchInfo,
  setMatchInfo,
  duoInfo,
  setDuoInfo,
}: SidebarProps) {
  const { isLoggedIn } = useAuthStore();
  return (
    <div id="sidebar" className="w-307 flex flex-col gap-16">
      <MatchSidebar
        socket={socket}
        roomId={roomId}
        setRoomId={setRoomId}
        matchInfo={matchInfo}
        setMatchInfo={setMatchInfo}
        duoInfo={duoInfo}
        setDuoInfo={setDuoInfo}
      />
      {isLoggedIn ? <LoginedSidebar /> : <NotLoginedSidebar />}
      <BoardListSidebar />
    </div>
  );
}
