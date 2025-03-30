import { useEffect, useState } from 'react';
import Button from '../../common/Button';
import { useMyInfoQuery } from '../../../queries/useMyInfoQuery';

export default function LoginedSidebar() {
  const { data, isLoading } = useMyInfoQuery();
  const [myInfo, setMyInfo] = useState({
    nickname: '',
    playerName: '',
    playerTag: '',
    postCount: 0,
    commentCount: 0,
    ratingAverage: 0,
  });
  console.log('내 정보', data);
  useEffect(() => {
    if (data) {
      setMyInfo({
        nickname: data.memberProfile.nickname,
        playerName: data.memberProfile.playerName,
        playerTag: data.memberProfile.playerTag,
        postCount: data.postCount,
        commentCount: data.commentCount,
        ratingAverage: data.ratingAverage,
      });
    }
  }, [data]);
  return (
    <div
      id="logined-sidebar"
      className="flex flex-col gap-16 bg-secondary-realdarkgray rounded-15 px-24 py-25"
    >
      {/* 프로필, 이름 */}
      <div className="flex gap-8 items-center ">
        <div className="w-48 h-48 bg-secondary-darkgray rounded-full"></div>
        <div className="flex flex-col gap-4">
          <div className="text-primary-white text-body1-16-regular">
            {myInfo.nickname}
          </div>
        </div>
      </div>
      {/* 내가쓴글, 내가 쓴 댓글, 내 평점 */}
      <div className="flex flex-col gap-8">
        <button className="flex items-center justify-between">
          <div className="text-primary-lightgray text-body3-13-regular">
            내가 쓴 글
          </div>
          <div className="text-primary-lightgray text-body3-13-regular">
            {myInfo.postCount}개
          </div>
        </button>

        <button className="flex items-center justify-between">
          <div className="text-primary-lightgray text-body3-13-regular">
            내가 쓴 댓글
          </div>
          <div className="text-primary-lightgray text-body3-13-regular">
            {myInfo.commentCount}개
          </div>
        </button>

        <button className="flex items-center justify-between">
          <div className="text-primary-lightgray text-body3-13-regular">
            내 평점
          </div>
          <div className="text-primary-lightgray text-body3-13-regular">
            {myInfo.ratingAverage}점
          </div>
        </button>
      </div>
      {/* 연동된 라이엇 계정 */}
      {/* 연동된 계정이 없을 때 */}
      {/* <div className="flex flex-col gap-16">
        <div className="text-secondary-gray text-body2-13-regular">
          연동된 라이엇 계정이 없습니다.
        </div>
        <Button label="연동하기" height={42} />
      </div> */}
      {/* 연동된 계정이 있을 때 */}
      <div className="flex flex-col gap-16">
        <div className="text-secondary-gray text-body3-13-regular">
          연동된 라이엇 계정
        </div>
        <div className="flex gap-14 items-start">
          <div className="w-30 h-30 rounded-4 bg-white" />
          <div>
            <div className="text-primary-white text-body3-13-medium">
              {myInfo.playerName}
            </div>
            <div className="text-secondary-gray text-body5-10-regular">
              #{myInfo.playerTag}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
