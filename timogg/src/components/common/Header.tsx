import { Link } from 'react-router-dom';
import defaultProfile from '../../assets/images/default-profile.png';
import { TimoLogo } from '../../assets/svgs/assets.ts';
import useAuthStore from '../../storage/useAuthStore.tsx';
import { useEffect } from 'react';
import { logout } from '../../apis/auth.ts';

function Header() {
  const { isLoggedIn, accessToken, refreshToken, userData } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      console.log('로그인 되었습니다.');
      console.log('accessToken: ', accessToken);
      console.log('refreshToken: ', refreshToken);
      console.log('userData: ', userData);
    }
  });

  return (
    <>
      <header className="w-screen top-0 left-0 bg-[#3C3A3A] text-primary-lightgray flex items-center px-70 py-10 justify-between z-10 mb-40">
        <div className="flex items-center max-w-586 w-full justify-between">
          <TimoLogo />
          <Menu />
        </div>
        <div className="flex items-center gap-8">
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="cursor-pointer hover:text-white transition-colors truncate"
              draggable="false"
            >
              로그인
              {/* <img
                src={defaultProfile}
                alt="user profile"
                className="rounded-full"
              /> */}
            </Link>
          ) : (
            <button
              onClick={() => {
                logout();
              }}
              className="cursor-pointer hover:text-white transition-colors truncate"
            >
              로그아웃
            </button>
          )}
        </div>
      </header>
    </>
  );
}

interface MenuItemProps {
  to: string;
  label: string;
}

function MenuItem({ to, label }: MenuItemProps) {
  return (
    <Link
      to={to}
      className="cursor-pointer hover:text-white transition-colors truncate"
      draggable="false"
    >
      {label}
    </Link>
  );
}

function Menu() {
  const menuItems = [
    { to: '/', label: '홈' },
    { to: '/champion-analysis', label: '챔피언 분석' },
    { to: '/champion-tier', label: '챔피언 티어' },
    { to: '/match', label: '파티찾기' },
    { to: '/board', label: '커뮤니티' },
  ];

  return (
    <div className="flex items-center gap-23">
      {menuItems.map(item => (
        <MenuItem key={item.to} to={item.to} label={item.label} />
      ))}
    </div>
  );
}

export default Header;
