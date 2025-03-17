export interface UserInfoProps {
  nickname?: string;
  tag?: string;
  country?: string;
  rank?: string;
  rankPercentage?: string;
  duoId: number;
  matchId: number;
}

function UserInfo({
  nickname,
  tag,
  country,
  rank,
  rankPercentage,
  duoId,
  matchId,
}: UserInfoProps) {
  return (
    <div className="flex items-center gap-[18px]">
      <img
        src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg"
        alt="user"
        className="w-[70px] h-[70px] rounded-full"
      />
      <div className="flex flex-col justify-between gap-[7px]">
        <div className="flex items-center gap-[10px] text-[20px]">
          <p className="font-medium truncate">{nickname}</p>
          <p className="font-extralight text-[#9aa4af] truncate">#{tag}</p>
        </div>
        <div className="flex gap-[8px] items-center">
          <p className="text-[13px] text-[#dddddd] font-light truncate">
            {country}
          </p>
          <div className="w-[1px] h-[12px] bg-[#dddddd]" />
          <p className="text-[13px] text-[#dddddd] font-light truncate">
            레더 랭킹 상위 {rank}위 (상위 {rankPercentage}%)
          </p>
        </div>
      </div>
    </div>
  );
}

UserInfo.defaultProps = {
  nickname: 'Unknown',
  tag: '0000',
  country: 'NA',
  rank: '0',
  rankPercentage: '0',
  duoId: 0,
  matchId: 0,
};

export default UserInfo;
