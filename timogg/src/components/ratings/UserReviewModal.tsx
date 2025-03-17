import { useEffect, useState } from 'react';
import Modal from '../common/Modal.tsx';
import ReviewQuestion from './ReviewQuestion.tsx';
import StarRating from './StarRating.tsx';
import UserInfo, { UserInfoProps } from './UserInfo.tsx';
import Button from '../common/Button.tsx';
import useRatings from '../../hooks/useRatings.ts';

function UserReview(userInfo: UserInfoProps) {
  const [attitude, setAttitude] = useState('');
  const [speech, setSpeech] = useState('');
  const [skill, setSkill] = useState('');
  const [rating, setRating] = useState(0);
  const { createRating } = useRatings();
  // useEffect(() => {}, [attitude, speech, skill, rating]);
  const onClickRating = () =>
    createRating.mutate({
      score: rating,
      attitude,
      speech,
      skill,
      duoId: userInfo.duoId,
      matchId: userInfo.matchId,
    });
  return (
    <Modal>
      <div
        className="max-w-[960px] w-full m-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-[120px] bg-black rounded-t-[15px] px-[50px] py-[25px] ">
          <UserInfo
            nickname={userInfo.nickname}
            tag={userInfo.tag}
            country={userInfo.country}
            rank={userInfo.rank}
            rankPercentage={userInfo.rankPercentage}
          />
        </div>
        <div className="h-[365px] bg-[#2c2c2c] rounded-b-[15px] px-[56px] pt-[25px] pb-[40px] flex items-center justify-between gap-10">
          <div className="flex flex-col gap-[24px]">
            <ReviewQuestion
              title="소환사분의 태도는 어떤가요?"
              options={[
                { label: '성실하게 임해요', value: 'GOOD' },
                { label: '노력해요', value: 'TRY_HARD' },
                { label: '집중하지 않아요', value: 'BAD' },
              ]}
              onChange={setAttitude}
            />
            <ReviewQuestion
              title="소환사분의 말투는 어떤가요?"
              options={[
                { label: '매너있는 소환사', value: 'MANNERS' },
                { label: '평범한 소환사', value: 'ORDINARY' },
                { label: '공격적인 소환사', value: 'AGGRESSIVE' },
              ]}
              onChange={setSpeech}
            />
            <ReviewQuestion
              title="소환사분의 실력은 어떤가요?"
              options={[
                { label: '한 수 배우고 갑니다', value: 'LEARNING' },
                { label: '무난한 플레이', value: 'NORMAL' },
                { label: '고의 트롤을 해요', value: 'TROLL' },
              ]}
              onChange={setSkill}
            />
          </div>
          <div className="text-center text-[16px]">
            <p className="font-bold mb-[12px]">
              소환사의 매너 점수를 남겨주세요
            </p>
            <StarRating defaultRating={rating} onChange={setRating} />
            <Button label="평점 남기기" onSubmit={onClickRating} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UserReview;
