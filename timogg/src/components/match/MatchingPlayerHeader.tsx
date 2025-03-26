import { useState } from 'react';
import DropdownMenu from '../common/DropdownMenu';
import { SearchIcon } from '../../assets/svgs/assets';

export default function MatchingPlayerHeader() {
  let navItems = ['최신순', '높은 티어 순', '평점 높은순'];
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(navItems[0]);

  return (
    <div className="w-full h-36 flex flex-row items-center justify-baseline gap-12 mt-16">
      <div className="flex flex-row items-center gap-24">
        <div className="text-title1-24-medium whitespace-nowrap">
          매칭 중인 플레이어
        </div>
        {/* 정렬 네비게이션 메뉴, 최신순, 높은 티어 순, 평점 높은순 */}
        <DropdownMenu navItems={navItems} />
      </div>

      {/* <div className="flex flex-row items-center gap-24">
        {/* 소환사 검색창 
        <div className="w-430 h-32 flex flex-row items-center gap-4 bg-primary-gray rounded-10 overflow-hidden px-20">
          <input
            type="text"
            placeholder="소환사 검색"
            className="h-full w-full px-4 border placeholder-primary-lightgray border-primary-gray bg-primary-gray focus:outline-none text-body3-13-regular"
          />
          <button className="">
            <SearchIcon />
          </button>
        </div>
        {/* 방 만들기 버튼 
        <button className="px-20 py-10 h-32 bg-secondary-green flex justify-center items-center rounded-10">
          <div className="text-body3-13-bold text-primary-white">방 만들기</div>
        </button>
      </div> */}
    </div>
  );
}
