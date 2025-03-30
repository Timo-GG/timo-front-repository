import { use, useEffect, useState } from 'react';
import { SearchIcon } from '../../../assets/svgs/assets';
import UserReview from '../../ratings/UserReviewModal';
import useRatings from '../../../hooks/useRatings';
export default function DuoHistory({
  onClickRating,
}: (name: string, tag: string, profile: string) => void) {
  let { getDuosList } = useRatings();
  const { data: duoList, isLoading, error } = getDuosList();
  console.log('듀오 리스트', duoList);
  // parent에서 모달 상태 관리
  return (
    <>
      {/* 듀오 검색 */}
      {/* <div className="flex flex-row gap-4 items-center bg-secondary-darkgray ">
        <input
          type="text"
          placeholder="듀오 검색"
          className="w-270 h-42 px-16 bg-transparent rounded-10 text-primary-white text-body1-16 focus:outline-none"
        />
        <button className="flex justify-center items-center rounded-10">
          <SearchIcon />
        </button>
      </div> */}
      {/* 듀오 히스토리 리스트 */}
      <div className="w-full flex flex-col gap-16 items-center justify-between px-16">
        {duoList?.data.map(
          (duo: {
            id: number;
            duoId: number;
            duoProfileImg: number;
            isRated: boolean;
            matchId: string;
            playerName: string;
            playerTag: string;
          }) => (
            <div className="w-full flex flex-row gap-16 items-center justify-between">
              <div className="flex flex-row gap-12 items-center">
                {/* 프로필 */}
                <div className="w-40 h-40 bg-secondary-darkgray rounded-full">
                  {duo.duoProfileImg}
                </div>
                <div className="flex flex-col gap-4">
                  {/* 플레이어 이름 */}
                  <div className="text-primary-white text-body2-15-regular">
                    {duo.playerName}
                  </div>
                  {/* 플레이어 태그 */}
                  <div className="text-primary-white text-body3-13-regular">
                    {duo.playerTag}
                  </div>
                </div>
              </div>
              {/* 평가하기 */}
              {!duo.isRated && (
                <button
                  className="h-42 py-8 rounded-10"
                  onClick={() =>
                    onClickRating({
                      duoProfileImg: duo.duoProfileImg,
                      playerName: duo.playerName,
                      playerTag: duo.playerTag,
                      duoId: duo.duoId,
                      matchId: duo.matchId,
                    })
                  }
                >
                  <div className="text-secondary-green text-body3-13-bold">
                    평가하기
                  </div>
                </button>
              )}
            </div>
          ),
        )}
      </div>
    </>
  );
}
