interface DuoEndedStatusProps {
  duoName: string;
  onConfirm: () => void;
}

export default function DuoEndedStatus({
  duoName,
  onConfirm,
}: DuoEndedStatusProps) {
  return (
    <>
      <div className="text-body1-16-bold mb-16 text-primary-white">
        {duoName}님과의 듀오가 종료되었습니다.
      </div>
      <button
        onClick={onConfirm}
        className="w-270 h-42 py-8 flex justify-center items-center rounded-10 bg-secondary-green hover:bg-primary-green"
      >
        <div className="text-primary-white text-body1-16-bold">확인</div>
      </button>
    </>
  );
}
