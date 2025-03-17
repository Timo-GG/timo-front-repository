import Modal from '../common/Modal.tsx';
import UserInfo from './UserInfo.tsx';
import RankMark from '../../assets/images/default-rank.png';
import StatsInfo from './StatsInfo.tsx';
import Button from '../common/Button.tsx';
import StarRating from './StarRating.tsx';

function UserInfoModal() {
  return (
    <Modal>
      {/* Upper part of the modal */}
      <div className="max-w-[960px] w-full m-10">
        {/* UserInfo */}
        <div className="bg-black rounded-t-[15px] p-[50px] pb-0">
          <UserInfo />
        </div>

        {/* Rank */}
        <div className="bg-black flex gap-[48px] py-[25px] pl-[50px] pr-[72px] items-center">
          <div className="flex gap-[24px]">
            <img src={RankMark} alt="challenger" />
            <div className="flex flex-col items-start justify-between gap-[12px]">
              <div>
                <p className="text-[18px] font-bold text-[#00ffd0] pb-[4px]">
                  Challenger
                </p>
                <p className="text-[12px] font-light text-[#dddddd]">
                  2,031 점
                </p>
              </div>
              <p className="text-[12px] text-[#9aa4af]">
                레더 랭킹 1위 (상위 0%)
              </p>
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="mb-[12px]">
              <p className="text-[20px] font-bold mb-[8px]">
                승률 <span className="text-[#ff0000]">50%</span>
              </p>
              <p className="text-[11px] font-light text-[#9aa4af]">5승 5패</p>
            </div>
            <div className="flex gap-[4px] text-[12px] flex-col">
              <p className="font-medium text-[15px] text-white">평점 2.94:1</p>
              <p className="text-[#9aa4af]">
                <span>8.0</span> / <span className="text-[#ff0000]">6.4</span> /
                <span>10.8</span>
              </p>
              <p className="text-[#ff0000] font-medium">평균킬 50%</p>
            </div>
          </div>

          {/* MostChampion */}
          <div>
            <h2 className="mb-[12px] font-medium text-[15px] truncate">
              주 챔피언
            </h2>
            <div className="grid grid-cols-2 gap-x-[12px] gap-y-[13px]">
              <StatsInfo winRate="50" win="5" lose="5" label="3.63 평점" />
              <StatsInfo winRate="50" win="5" lose="5" label="3.63 평점" />
              <StatsInfo winRate="50" win="5" lose="5" label="3.63 평점" />
              <StatsInfo winRate="50" win="5" lose="5" label="3.63 평점" />
            </div>
          </div>

          {/* Position */}
          <div>
            <h2 className="mb-[12px] font-medium text-[15px] truncate">
              주 포지션
            </h2>
            <div className="flex flex-col gap-[13px]">
              <StatsInfo winRate="50" win="5" lose="5" label="원거리 딜러" />
              <StatsInfo winRate="50" win="5" lose="5" label="서포터" />
            </div>
          </div>
        </div>

        {/* Bottom part of the modal */}
        <div className="bg-[#2c2c2c] rounded-b-[15px] p-[50px] pt-[25px] flex items-center justify-between gap-10">
          {/* Star Rating */}
          <div className="text-center">
            <p className="mb-[28px] font-bold text-[18px]">소환사 매너점수</p>
            <StarRating width="48" height="45" />
          </div>
          {/* User Review */}
          <div className="flex flex-col gap-[12px]">
            <div className="flex gap-[12px] text-[16px]">
              <p className="font-bold text-[#9aafaf]">태도</p>
              <p className="font-light">성실하게 임해요</p>
            </div>
            <div className="flex gap-[12px] text-[16px]">
              <p className="font-bold text-[#9aafaf]">언행</p>
              <p className="font-light">공격적인 소환사</p>
            </div>
            <div className="flex gap-[12px] text-[16px]">
              <p className="font-bold text-[#9aafaf]">실력</p>
              <p className="font-light">한 수 배우고 갑니다</p>
            </div>
          </div>
          {/* Play Together */}
          <Button label="함께 플레이하고 평점 남기기" width={241} />
        </div>
      </div>
    </Modal>
  );
}

export default UserInfoModal;
