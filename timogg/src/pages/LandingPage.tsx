import React, { useState } from 'react';
import { DropdownIcon, TimoLogoBig } from '../assets/svgs/assets.ts';
import Header from '../components/common/Header.tsx';
import Timo from '../assets/images/timo.png';

function LandingPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('KR');
  const options = ['KR'];

  const handleOptionClick = (option: string) => {
    setSelectedCountry(option);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full bg-primary-blue flex flex-col items-center justify-center">
        <div>
          <TimoLogoBig className="mb-[8px]" />
          <h2 className="text-primary-white text-title-1-24-regular mb-[89px]">
            빠른 챔피언 분석, 빠른 파티 매칭은 TIMO.GG
            <br />
            지금 바로 만나보세요!
          </h2>
          <div className="w-[942px] rounded-[30px] bg-primary-white shadow-[0_2px_2px_rgba(0,0,0,0.25)] flex p-[10px] relative">
            <div className="relative">
              <button
                type="button"
                className="border-r-[1px] border-secondary-gray px-[25px] py-[16.49px] flex gap-[12px] cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="text-black text-title2-20-bold">
                  {selectedCountry}
                </div>
                <DropdownIcon />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-[-3px] mt-3 w-full bg-white shadow-lg rounded-lg z-10 flex flex-col">
                  {options.map(option => (
                    <button
                      key={option}
                      type="button"
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black rounded-lg"
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              className="flex items-center justify-center text-[#303039] text-title2-20-regular text-center placeholder-opacity-[63.92%] outline-none m-0 p-0 w-[765px]"
              placeholder={`플레이어 이름 + #${selectedCountry}1로 검색`}
            />
            <img
              src={Timo}
              alt="timo"
              className="absolute bottom-[-80px] right-[-270px]"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
