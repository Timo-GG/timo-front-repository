export default function DuoFindStartStatus({ onClickDuoFindStartBtn }: any) {
  return (
    <>
      <button
        className="w-270 h-42 py-8 flex justify-center items-center bg-secondary-green hover:bg-primary-green rounded-10"
        onClick={onClickDuoFindStartBtn}
      >
        <div className="text-primary-white text-body1-16-bold">
          듀오 찾기 시작
        </div>
      </button>
    </>
  );
}
