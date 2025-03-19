import { use, useEffect, useState } from 'react';
import { SearchIcon } from '../../../assets/svgs/assets';
import UserReview from '../../ratings/UserReviewModal';
import useRatings from '../../../hooks/useRatings';

export default function DuoHistory() {
  let selectedUserInfo;
  const onClickRating = (name: string, tag: string, profile: string) => {
    setModalOpen(true);
    selectedUserInfo = { nickname: name, tag, profile };
  };
  let [modalOpen, setModalOpen] = useState(false);
  let { getDuosList } = useRatings();
  const { data: duoList, isLoading, error } = getDuosList();
  return (
    <>
      {/* 듀오 검색 */}
      <div className="flex flex-row gap-4 items-center bg-secondary-darkgray ">
        <input
          type="text"
          placeholder="듀오 검색"
          className="w-270 h-42 px-16 bg-transparent rounded-10 text-primary-white text-body1-16 focus:outline-none"
        />
        <button className="flex justify-center items-center rounded-10">
          <SearchIcon />
        </button>
      </div>
      {/* 듀오 히스토리 리스트 */}
      <div className="w-full flex gap-16 items-center justify-between">
        {duoList?.map((duo: any) => (
          <>
            <div className="flex gap-16 items-center justify-between">
              {/* 프로필 */}
              <div className="w-40 h-40 bg-secondary-darkgray rounded-full"></div>
              <div className="flex flex-col gap-4">
                {/* 플레이어 이름 */}
                <div className="text-primary-white text-body1-16-bold">
                  {duo.name}
                </div>
                {/* 플레이어 태그 */}
                <div className="text-primary-white text-body1-16">
                  {duo.tag}
                </div>
              </div>
            </div>
            {/* 평가하기 */}
            <button className="h-42 py-8 rounded-10" onClick={onClickRating}>
              <div className="text-secondary-green text-body1-16-bold">
                평가하기
              </div>
            </button>
          </>
        ))}
      </div>
      {/* 유저리뷰 모달창 */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center ${
          modalOpen ? '' : 'hidden'
        }`}
        onClick={() => setModalOpen(false)} // 배경 클릭 시 모달 닫힘
      >
        {/* 내부 클릭 시 닫히지 않음 */}
        <UserReview userInfo={selectedUserInfo} />
      </div>
    </>
  );
}
