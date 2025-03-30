import { Outlet } from 'react-router-dom';
import Chat from '../components/chat/Chat';
import useMatchingSocket from '../hooks/useMatchingSocket';
import { useState } from 'react';
import UserReview from '../components/ratings/UserReviewModal';
import useAuthStore from '../storage/useAuthStore';
import MatchSidebar from '../components/sidebars/match/MatchSidebar';
import LoginedSidebar from '../components/sidebars/myInfo/LoginedSidebar';
import NotLoginedSidebar from '../components/sidebars/myInfo/NotLoginedSidebar';
import BoardListSidebar from '../components/sidebars/board/BoardListSidebar';
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

  const { isLoggedIn } = useAuthStore();

  let [modalOpen, setModalOpen] = useState(false);
  let [selectedUserInfo, setSelectedUserInfo] = useState({
    nickname: '',
    tag: '',
    duoId: 0,
    matchId: 0,
  });
  const onClickRating = ({
    duoProfileImg,
    playerName,
    playerTag,
    duoId,
    matchId,
  }: {
    duoProfileImg: number;
    playerName: string;
    playerTag: string;
    duoId: number;
    matchId: number;
  }) => {
    console.log('duoProfileImg', playerName, playerTag);
    setModalOpen(true);
    setSelectedUserInfo({
      nickname: playerName,
      tag: playerTag,
      duoId: duoId,
      matchId: matchId,
    });
    console.log('selectedUserInfo', selectedUserInfo);
  };
  const onClickSubmitRating = isSuccess => {
    if (isSuccess) {
      alert('평가가 완료되었습니다.');
      setModalOpen(false);
    } else {
      alert('평가에 실패했습니다.');
    }
  };

  return (
    <>
      <div className={`px-40 flex flex-row gap-16`}>
        <div id="sidebar" className="w-307 flex flex-col gap-16">
          <MatchSidebar
            socket={socket}
            roomId={roomId}
            setRoomId={setRoomId}
            matchInfo={matchInfo}
            setMatchInfo={setMatchInfo}
            duoInfo={duoInfo}
            setDuoInfo={setDuoInfo}
            onClickRating={onClickRating}
          />
          {isLoggedIn ? <LoginedSidebar /> : <NotLoginedSidebar />}
          {RegExp(/\/board/).test(window.location.pathname) && (
            <BoardListSidebar />
          )}
        </div>
        {/* 유저리뷰 모달창 */}
        {modalOpen && (
          <div
            className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-40`}
            onClick={() => setModalOpen(false)} // 배경 클릭 시 모달 닫힘
          >
            {/* 내부 클릭 시 닫히지 않음 */}
            <UserReview
              userInfo={selectedUserInfo}
              onClickSubmitRating={onClickSubmitRating}
            />
          </div>
        )}

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
