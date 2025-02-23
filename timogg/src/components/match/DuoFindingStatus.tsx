import { useEffect, useState } from 'react';

export default function DuoFindingStatus({ onClickDuoFindCancelBtn }: any) {
  let [timer, setTimer] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(timer => timer + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <div className="text-body1-16-bold text-primary-white">
        조건과 비슷한 듀오 찾는 중
        {timer % 3 === 0 ? '.' : timer % 3 === 1 ? '..' : '...'}
      </div>
      <button
        className="w-270 h-42 py-8 flex justify-center items-center rounded-10 bg-[#CF4646] hover:bg-[#FF5A5A]"
        onClick={onClickDuoFindCancelBtn}
      >
        <div
          className="text-primary-white text-body1-16-bold"
          onClick={onClickDuoFindCancelBtn}
        >
          듀오 찾기 취소
        </div>
      </button>
    </>
  );
}
