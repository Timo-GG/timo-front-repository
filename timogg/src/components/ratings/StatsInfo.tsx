export interface StatsInfoProps {
  image?: string;
  winRate: string;
  win: string;
  lose: string;
  label: string;
}

function StatsInfo({ image, winRate, win, lose, label }: StatsInfoProps) {
  return (
    <div className="flex gap-[6px] items-center">
      <img
        src={image}
        alt="champion"
        className="w-[30px] h-[30px] rounded-[4px]"
      />
      <div>
        <div className="flex gap-[10px] items-center">
          <p className="text-[13px] font-medium text-[#ff0000]">{winRate}%</p>
          <p className="text-[10px] font-light text-[#9aa4af] truncate">
            {win}승 {lose}패
          </p>
        </div>
        <p className="text-[10px] font-light text-[#00ffd0]">{label}</p>
      </div>
    </div>
  );
}

StatsInfo.defaultProps = {
  image: 'https://placeholder.pics/svg/30',
};

export default StatsInfo;
