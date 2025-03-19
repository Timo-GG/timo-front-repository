import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebars/Sidebar';
import Chat from '../components/chat/Chat';
import useMatchingSocket from '../hooks/useMatchingSocket';
export default function ContentLayout() {
  const {
    socketRef,
    roomId,
    setRoomId,
    matchInfo,
    setMatchInfo,
    duoInfo,
    setDuoInfo,
  } = useMatchingSocket();
  return (
    <>
      <div className={`flex flex-row gap-16`}>
        <Sidebar
          socket={socketRef.current}
          roomId={roomId}
          setRoomId={setRoomId}
          matchInfo={matchInfo}
          setMatchInfo={setMatchInfo}
          duoInfo={duoInfo}
          setDuoInfo={setDuoInfo}
        />
        {/* 매칭중인 플레이어 헤더 */}
        {/* todo: 듀오가 시작됐을때 화면에 표시 */}
        <div className="pl-40 relative flex flex-col gap-20 justify-center items-center">
          {roomId !== 0 && (
            <Chat
              roomId={roomId}
              socket={socketRef.current}
              duoInfo={duoInfo}
            />
          )}
          <Outlet />
        </div>
      </div>
    </>
  );
}
