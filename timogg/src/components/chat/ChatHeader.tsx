import { CopyIcon } from '../../assets/svgs/assets';

interface ChatHeaderProps {
  playerName: string;
  playerTag: string;
}
export default function ChatHeader({ playerName, playerTag }: ChatHeaderProps) {
  return (
    <div className="w-full px-16 bg-secondary-realdarkgray flex justify-between items-center">
      <div className="flex items-center gap-2">
        {/* 플레이어 이름, 태그 */}
        <div className="text-white text-2xl font-bold">{playerName}</div>
        <div className="text-secondary-gray text-lg font-bold ml-4">
          #{playerTag}
        </div>
        {/* 플레이어 이름 복사 버튼 */}
        <button
          className="ml-4"
          onClick={() => {
            navigator.clipboard.writeText(playerName);
          }}
        >
          <CopyIcon />
        </button>
      </div>
      {/* 신고 버튼 */}
      {/* <button>
        <img src="/images/hamburger.svg" alt="hamburger" />
      </button> */}
    </div>
  );
}
