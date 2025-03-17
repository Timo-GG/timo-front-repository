interface DuoPlayingStatusProps {
  duoName: string;
  duoTag: string;
  onClickDuoEndBtn: () => void;
}

export default function DuoPlayingStatus({
  duoName,
  duoTag,
  onClickDuoEndBtn,
}: DuoPlayingStatusProps) {
  return (
    <>
      <h1 className="text-primary-white text-h1-24-bold mb-20">
        {duoName} {' #'}
        {duoTag}
      </h1>
      <button
        className="w-140 h-42 py-8 flex justify-center items-center rounded-10 bg-[#CF4646] hover:bg-[#FF5A5A]"
        onClick={onClickDuoEndBtn}
      >
        <div className="text-primary-white text-body1-16-bold">듀오 종료</div>
      </button>
    </>
  );
}
