import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebars/Sidebar';
import Chat from '../components/chat/Chat';
import useMatchingSocket from '../hooks/useMatchingSocket';
export default function ContentLayout() {
  const {
    socket,
    roomId,
    setRoomId,
    matchInfo,
    setMatchInfo,
    duoInfo,
    setDuoInfo,
  } = useMatchingSocket();
  return (
    <>
      <div className={`px-40 flex flex-row gap-16`}>
        <Sidebar
          socket={socket}
          roomId={roomId}
          setRoomId={setRoomId}
          matchInfo={matchInfo}
          setMatchInfo={setMatchInfo}
          duoInfo={duoInfo}
          setDuoInfo={setDuoInfo}
        />
        {/* 매칭중인 플레이어 헤더 */}
        {/* todo: 듀오가 시작됐을때 화면에 표시 */}
        <div className="px-40 relative w-full flex flex-col gap-20 justify-baseline items-center">
          {roomId !== 0 && (
            <Chat roomId={roomId} socket={socket} duoInfo={duoInfo} />
          )}
          <Outlet />
        </div>
      </div>
    </>
  );
}
