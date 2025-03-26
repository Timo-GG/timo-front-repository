interface MatchingPlayerTableItemProps {
  playerName: string;
  playerTag: string;
  tier: string;
  gamePlayed: number;
  winRate: number;
  lastPlayed: string;
}
export default function MatchingPlayerTableItem({
  playerName,
  playerTag,
  tier,
  gamePlayed,
  winRate,
  lastPlayed,
}: MatchingPlayerTableItemProps) {
  let lolTier = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Emerald',
    'Diamond',
    'Master',
    'Grandmaster',
    'Challenger',
  ];
  let tierColor = [
    'text-tier-iron',
    'text-tier-bronze',
    'text-tier-silver',
    'text-tier-gold',
    'text-tier-platinum',
    'text-tier-emerald',
    'text-tier-diamond',
    'text-tier-master',
    'text-tier-grandmaster',
    'text-tier-challenger',
  ];
  let tierIndex = lolTier.indexOf(tier);
  let tierColorIndex = tierIndex < 0 ? 0 : tierIndex;
  let tierColorClass = tierColor[tierColorIndex];
  let tierClass = `text-body2-15-regular ${tierColorClass}`;

  return (
    <div className="w-full flex items-center justify-between px-24 py-16 border-b storke-1 border-[#5C5C5C]">
      <div className="flex flex-row gap-24 items-center">
        {/* 소환사 닉네임 */}
        <div className="flex items-center gap-8">
          <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
          <div className="flex flex-row gap-4 items-baseline">
            <div className="text-body2-15-regular text-primary-white">
              {playerName}
            </div>
            <div className="text-body5-10-regular text-secondary-gray">
              {playerTag}
            </div>
          </div>
        </div>
        {/* 티어 */}
        <div className={tierClass}>{tier}</div>
      </div>

      <div className="flex gap-24">
        {/* 게임 횟수 */}
        <div className="text-body2-15-regular text-secondary-gray">
          {gamePlayed}
        </div>
        {/* 승률 */}
        <div
          className={`text-body2-15-regular ${winRate < 46 && 'text-red-500'} ${winRate > 55 ? 'text-green-500' : 'text-primary-white'}`}
        >
          {winRate}%
        </div>
        {/* 최근 플레이 */}
        <div className="text-body2-15-regular text-secondary-gray">
          {lastPlayed}
        </div>
      </div>
    </div>
  );
}
