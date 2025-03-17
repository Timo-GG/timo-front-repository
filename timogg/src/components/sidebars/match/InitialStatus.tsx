import { useState } from 'react';
import DuoHistory from './DuoHistory';
import { DropdownIcon } from '../../../assets/svgs/assets';

export default function InitialStatus({ onClickDuoFindStartBtn }: any) {
  const [isDuohistoryOpen, setIsDuohistoryOpen] = useState(false);

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
      <button
        className="w-270 h-42 py-8 flex justify-between items-center"
        onClick={() => setIsDuohistoryOpen(!isDuohistoryOpen)}
      >
        <div>함께한 듀오 목록</div>
        {isDuohistoryOpen ? (
          <DropdownIcon className="transform rotate-180" />
        ) : (
          <DropdownIcon />
        )}
      </button>
      {isDuohistoryOpen && <DuoHistory />}
    </>
  );
}
