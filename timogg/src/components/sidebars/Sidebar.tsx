import useAuthStore from '../../storage/useAuthStore';
import BoardListSidebar from './board/BoardListSidebar';
import MatchSidebar from './match/MatchSidebar';
import LoginedSidebar from './myInfo/LoginedSidebar';
import NotLoginedSidebar from './myInfo/NotLoginedSidebar';

export default function Sidebar() {
  const { isLoggedIn } = useAuthStore();
  return (
    <div id="sidebar" className="w-307 flex flex-col gap-16">
      <MatchSidebar />
      {isLoggedIn ? <LoginedSidebar /> : <NotLoginedSidebar />}
      <BoardListSidebar />
    </div>
  );
}
