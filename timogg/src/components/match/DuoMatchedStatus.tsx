export default function DuoMatchedStatus({ onClickDuoEndBtn }: any) {
  return (
    <>
      <h1>Matched</h1>
      <button
        className="w-140 h-42 py-8 flex justify-center items-center bg-secondary-green hover:bg-primary-green rounded-10"
        onClick={onClickDuoEndBtn}
      >
        <div className="text-primary-white text-body1-16-bold">듀오 종료</div>
      </button>
    </>
  );
}
