export default function DuoEndConfirmStatus({
  onClickDuoEndConfirmBtn,
  onClickDuoEndCancelBtn,
}: any) {
  return (
    <>
      <div className="flex flex-col gap-16 items-center">
        <div className="text-body1-16-bold text-primary-white">
          듀오를 종료하시겠습니까?
        </div>
        <button
          className="w-270 h-42 py-8 flex justify-center items-center rounded-10 bg-[#CF4646] hover:bg-[#FF5A5A]"
          onClick={onClickDuoEndConfirmBtn}
        >
          <div
            className="text-primary-white text-body1-16-bold"
            onClick={onClickDuoEndConfirmBtn}
          >
            듀오 종료
          </div>
        </button>
        <button
          className="w-270 h-42 py-8 flex justify-center items-center rounded-10 bg-[#8A8A8A] hover:bg-secondary-gray"
          onClick={onClickDuoEndCancelBtn}
        >
          <div className="text-primary-white text-body1-16-bold">취소</div>
        </button>
      </div>
    </>
  );
}
