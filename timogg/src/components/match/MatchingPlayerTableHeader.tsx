export default function MatchingPlayerTableHeader() {
  return (
    <div
      id="tb-title"
      className="w-full flex items-center justify-between px-24 py-16 border-b storke-1 border-[#5C5C5C]"
    >
      <div className="flex flex-row gap-24 items-center">
        <div className="text-body2-15-regular text-primary-white">
          소환사 닉네임
        </div>
        <div className="text-body2-15-regular text-primary-white">티어</div>
      </div>
      <div className="flex gap-24">
        <div className="text-body2-15-regular text-secondary-gray">
          게임 횟수
        </div>
        <div className="text-body2-15-regular text-secondary-gray">승률</div>
        <div className="text-body2-15-regular text-secondary-gray">
          최근 플레이
        </div>
      </div>
    </div>
  );
}
