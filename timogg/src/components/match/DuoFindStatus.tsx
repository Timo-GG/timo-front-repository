import { useEffect, useState } from 'react';
import { MikeIcon, SupportPositionIcon } from '../../assets/svgs/assets';

interface MatchInfo {
  id: number;
  score: string;
  timeAgo: string;
  win: boolean;
}
const matchHistory = [
  { id: 1, score: '3/8/9', timeAgo: '3일전', win: false },
  { id: 2, score: '3/8/9', timeAgo: '3일전', win: true },
  { id: 3, score: '3/8/9', timeAgo: '3일전', win: true },
  { id: 4, score: '3/8/9', timeAgo: '3일전', win: true },
  { id: 5, score: '3/8/9', timeAgo: '3일전', win: true },
];

const Profile = () => (
  <div className="flex flex-col items-baseline gap-15">
    <div className="flex items-center gap-4">
      <div className="w-10 h-8 bg-gray-600 rounded-md" />
      <div className="text-primary-white text-sm">마스터1</div>
    </div>
    {/* 프로필 영역 */}
    <div className="flex flex-col items-center gap-20">
      {/* 닉네임 */}
      <div className="mt-4 text-primary-white flex items-baseline gap-4">
        <span>롤10년차고인물</span>
        <span className="text-body3-13-regular">#KR1</span>
      </div>
      {/* 포지션 아이콘 */}
      <div className="mt-4 flex justify-center">
        <SupportPositionIcon />
      </div>
      {/* 유저 상태 */}
      <div className="flex gap-12">
        {['즐겜', '첫판'].map(tag => (
          <div
            key={tag}
            className="w-104 h-32 flex items-center justify-center px-10 py-10 bg-white text-black rounded-12 text-body1-16-medium"
          >
            {tag}
          </div>
        ))}
        <MikeIcon />
      </div>
    </div>
  </div>
);

const RecentMatch = () => (
  <div className="w-232">
    <h3 className="text-primary-white text-body1-16-regular mb-12">
      최근 전적
    </h3>
    <div className="space-y-8 ">
      {matchHistory.map(matchInfo => (
        <MatchItem key={matchInfo.id} matchInfo={matchInfo} />
      ))}
    </div>
  </div>
);
interface MatchItemProps {
  matchInfo: MatchInfo;
}

const MatchItem = ({ matchInfo }: MatchItemProps) => (
  <div
    className={`flex items-center h-30 ${matchInfo.win ? 'bg-[#315D7F]' : 'bg-[#7F4242]'} rounded-r-5 overflow-hidden pr-12`}
  >
    <div className="flex items-center gap-8">
      {/* 챔피언 아이콘 */}
      <div className="w-8 h-8 bg-gray-500 rounded-full" />
      {/* 최근 전적 포지션 */}
      <SupportPositionIcon className="w-21 h-21" />
    </div>
    <div className="ml-auto flex items-center gap-12 text-primary-white text-body3-13-regular">
      <span>{matchInfo.score}</span>
      <span>{matchInfo.timeAgo}</span>
    </div>
  </div>
);

interface TimeBarProps {
  leftTime: number;
  initialTime: number;
}
const TimeBar = ({ leftTime, initialTime }: TimeBarProps) => {
  let timeToPercent = (leftTime / initialTime) * 100;
  return (
    <div className="h-11 w-272 bg-[#8A8A8A] rounded-full overflow-hidden">
      <div
        className={`last:h-full bg-primary-green`}
        style={{ width: `${timeToPercent}%`, transition: 'width 1s linear' }}
      />
    </div>
  );
};
export default function DuoFindStatus({
  onClickMatchAccept,
  onClickMatchReject,
}: {
  onClickMatchAccept: () => void;
  onClickMatchReject: () => void;
}) {
  let initialTime = 20;
  let [leftTime, setLeftTime] = useState(initialTime);
  useEffect(() => {
    const interval = setInterval(() => {
      if (leftTime < 0) {
        clearInterval(interval);
        return;
      }
      setLeftTime(leftTime => leftTime - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <div className="flex flex-col gap-24 items-center w-full">
        <Profile />
        <RecentMatch />
        <TimeBar leftTime={leftTime} initialTime={initialTime} />
        <div className="flex gap-6">
          <button
            className="w-140 py-8 flex-1 bg-red-600 text-primary-white text-body1-16-bold rounded-10 hover:bg-red-500"
            onClick={onClickMatchReject}
          >
            매칭 거절
          </button>
          <button
            className="w-140 py-8 flex-1 bg-secondary-green text-primary-white text-body1-16-bold rounded-10 hover:bg-primary-green"
            onClick={onClickMatchAccept}
          >
            매칭 수락
          </button>
        </div>
      </div>
    </>
  );
}
