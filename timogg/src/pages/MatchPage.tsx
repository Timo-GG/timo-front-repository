import MatchingPlayerHeader from '../components/match/MatchingPlayerHeader';
import MatchingPlayerTableHeader from '../components/match/MatchingPlayerTableHeader';
import MatchingPlayerTableItem from '../components/match/MatchingPlayerTableItem';

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
    <div id="match-page" className="w-full">
      <MatchingPlayerHeader />
      <div className="w-full bg-secondary-realdarkgray flex flex-col items-center">
        {/* 매칭중인 플레이어 테이블 */}
        <MatchingPlayerTableHeader />
        {matchingPlayers.map((player, i) => (
          <MatchingPlayerTableItem key={i} {...player} />
        ))}
      </div>
    </div>
  );
};

export default MatchPage;
