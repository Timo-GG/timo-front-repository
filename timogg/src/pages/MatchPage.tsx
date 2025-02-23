import { useState } from 'react';
import MatchSidebar from '../components/match/MatchSidebar';
import MatchingPlayerItem from '../components/match/MatchingPlayerItem';
import Header from '../components/common/Header';
let matchingPlayers = Array.from({ length: 20 }, (_, i) => ({
  playerName: `Player${i + 1}`,
  playerTag: `#KR1`,
  tier: [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Emerald',
    'Diamond',
    'Master',
    'Grandmaster',
    'Challenger',
  ][Math.floor(Math.random() * 10)],
  gamePlayed: 10,
  //45~60
  winRate: Math.floor(Math.random() * 16) + 45,
  lastPlayed: '1시간 전',
}));
const MatchPage = () => {
  return (
    <>
      <Header />
      <div className="pl-40 relative flex flex-col gap-20 justify-center items-center">
        <div id="sidebar" className="absolute top-0 left-30 h-full w-307">
          <MatchSidebar />
        </div>
        <div className="w-874 px-10 bg-secondary-realdarkgray flex flex-col items-center">
          <div
            id="tb-title"
            className="w-820 flex items-center justify-between px-24 py-16 border-b storke-1 border-[#5C5C5C]"
          >
            <div className="flex flex-row gap-24 items-center">
              <div className="text-body2-15-regular text-primary-white">
                소환사 닉네임
              </div>
              <div className="text-body2-15-regular text-primary-white">
                티어
              </div>
            </div>
            <div className="flex gap-24">
              <div className="text-body2-15-regular text-secondary-gray">
                게임 횟수
              </div>
              <div className="text-body2-15-regular text-secondary-gray">
                승률
              </div>
              <div className="text-body2-15-regular text-secondary-gray">
                최근 플레이
              </div>
            </div>
          </div>
          {matchingPlayers.map((player, i) => (
            <MatchingPlayerItem key={i} {...player} />
          ))}
        </div>
      </div>
    </>
  );
};

export default MatchPage;
