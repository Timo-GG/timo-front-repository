import { useEffect } from 'react';
import {
  AnyPositionIcon,
  BottomPositionIcon,
  HeadsetIcon,
  JunglePositionIcon,
  MidPositionIcon,
  MikeIcon,
  MikeMuteIcon,
  SupportPositionIcon,
  TopPositionIcon,
} from '../../assets/svgs/assets.ts';
import useMatchReducer from '../../hooks/useMatchReducer.ts';

export default function MatchOptionStatus({ onClickFindDuoBtn }: any) {
  let [state, dispatch] = useMatchReducer();
  const onClickBtn = () => {
    localStorage.setItem('matchOption', JSON.stringify(state));
    onClickFindDuoBtn();
  };
  const handleClick = (type: string, value: string) => {
    dispatch({ type, value });
  };

  useEffect(() => {
    let matchOption = JSON.parse(localStorage.getItem('matchOption'));
    if (matchOption) {
      dispatch({ type: 'queueType', value: matchOption.queueType });
      dispatch({ type: 'myPosition', value: matchOption.myPosition });
      dispatch({ type: 'playStyle', value: matchOption.playStyle });
      dispatch({ type: 'gameStatus', value: matchOption.gameStatus });
      dispatch({ type: 'mic', value: matchOption.mic });
      dispatch({ type: 'duoPosition', value: matchOption.duoPosition });
      dispatch({ type: 'duoStyle', value: matchOption.duoStyle });
    }
  }, []);
  return (
    <>
      <Section label="큐 타입" changeStyle={'flex flex-col gap-0'}>
        <ButtonBox
          items={[
            { label: '솔로랭크' },
            { label: '자유랭크' },
            { label: '일반' },
            { label: '상관없음' },
          ]}
          type="queueType"
          onClick={handleClick}
          state={state}
        />
      </Section>
      <Section label="내정보">
        <IconBox
          iconType="position"
          label="포지션"
          type="myPosition"
          onClick={handleClick}
          state={state}
        />
        <ButtonBox
          label="플레이스타일"
          items={[{ label: '즐겜' }, { label: '빡겜' }, { label: '상관없음' }]}
          type="playStyle"
          onClick={handleClick}
          state={state}
        />
        <ButtonBox
          label="내 상태"
          items={[
            { label: '첫판' },
            { label: '계속 플레이' },
            { label: '마지막판' },
          ]}
          type="gameStatus"
          onClick={handleClick}
          state={state}
        />
        <IconBox
          iconType="mic"
          label="마이크"
          type="mic"
          onClick={handleClick}
          state={state}
        />
      </Section>
      <Section label="듀오 찾기">
        <IconBox
          iconType="position"
          label="포지션"
          type="duoPosition"
          onClick={handleClick}
          state={state}
        />
        <ButtonBox
          label="듀오 스타일"
          items={[
            { label: '친목/잡담' },
            { label: '오더/보이스' },
            { label: '즐겜/빡겜' },
          ]}
          type="duoStyle"
          onClick={handleClick}
          state={state}
        />
      </Section>
      <button
        className="w-270 h-42 px-25 py-10 bg-secondary-green rounded-10 flex justify-center items-center hover:bg-primary-green"
        onClick={onClickBtn}
      >
        <div className="text-primary-white text-body1-16-bold">듀오 찾기</div>
      </button>
    </>
  );
}

interface BoxItemProps {
  label: string;
  type: string;
  state: any;
  onClick: (type: string, value: string) => void;
}
interface IconBoxProps {
  label?: string;
  iconType: 'position' | 'mic';
  type: string;
  state: any;
  onClick: (type: string, value: string) => void;
}
interface ButtonBoxProps {
  label?: string;
  items: { label: string }[];
  type: string;
  state: any;
  onClick: (type: string, value: string) => void;
}
interface SectionProps {
  label: string;
  changeStyle?: string;
  children: React.ReactNode;
}

const Section = ({ label, changeStyle, children }: SectionProps) => {
  return (
    <div className={changeStyle ? changeStyle : 'flex flex-col gap-12'}>
      <div className="text-body1-16-bold text-secondary-green">{label}</div>
      <>{children}</>
    </div>
  );
};
const ButtonBoxItem = ({ label, type, onClick, state }: BoxItemProps) => {
  return (
    <div
      className={`w-full h-full flex justify-center items-center px-10 ${state[type] === label ? 'bg-secondary-green' : 'bg-primary-white'} hover:bg-primary-lightgray`}
      // state[type] === label일때 색상 변경
      onClick={() => onClick(type, label)}
    >
      <div className="text-black text-body3-13-regular">{label}</div>
    </div>
  );
};
const IconBox = ({ label, iconType, type, onClick, state }: IconBoxProps) => {
  let onHover = 'hover:bg-primary-lightgray rounded-5';
  let positionIcon = [
    <AnyPositionIcon />,
    <TopPositionIcon />,
    <JunglePositionIcon />,
    <MidPositionIcon />,
    <BottomPositionIcon />,
    <SupportPositionIcon />,
  ];
  let positionLabel = ['상관없음', '탑', '정글', '미드', '원딜', '서폿'];
  let micLabel = ['마이크 ON', '마이크 OFF', '헤드셋'];
  let micIcon = [<MikeIcon />, <MikeMuteIcon />, <HeadsetIcon />];
  return (
    <div className="flex-col flex gap-8">
      <div className="text-body3-13-bold text-primary-white ">{label}</div>
      {/* 타입이 포지션일때 표시 */}
      {iconType === 'position' && (
        <div className="w-271 h-33 flex justify-between items-center">
          {positionIcon.map((icon, index) => (
            <div
              key={index}
              className={`px-2 py-2 flex justify-center items-center ${onHover} ${
                state[type] === positionLabel[index] ? 'bg-secondary-green' : ''
              }`}
              onClick={() => onClick(type, positionLabel[index])}
            >
              {icon}
            </div>
          ))}
        </div>
      )}
      {/* 타입이 마이크일때 */}
      {iconType === 'mic' && (
        <div className="w-217 h-33 flex self-center justify-between items-center gap-72">
          {micIcon.map((icon, index) => (
            <div
              key={index}
              className={`px-2 py-2 flex justify-center items-center ${onHover} ${
                state[type] === micLabel[index] ? 'bg-secondary-green' : ''
              }`}
              onClick={() => onClick(type, micLabel[index])}
            >
              {icon}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const ButtonBox = ({ label, items, type, state, onClick }: ButtonBoxProps) => {
  return (
    <div className="flex-col flex gap-8">
      <div className="text-body3-13-bold text-primary-white ">{label}</div>
      <div className="w-271 h-33 flex justify-between items-center rounded-10 overflow-hidden">
        {items.map((item, index) => (
          <ButtonBoxItem
            key={index}
            label={item.label}
            type={type}
            onClick={onClick}
            state={state}
          />
        ))}
      </div>
    </div>
  );
};
