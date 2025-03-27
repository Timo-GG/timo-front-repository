import Button from '../../common/Button';

export default function LoginedSidebar() {
  return (
    <div
      id="logined-sidebar"
      className="flex flex-col gap-16 bg-secondary-realdarkgray rounded-15 px-24 py-25"
    >
      {/* 프로필, 이름 */}
      <div className="flex gap-8 items-center ">
        <div className="w-48 h-48 bg-secondary-darkgray rounded-full"></div>
        <div className="flex flex-col gap-4">
          <div className="text-primary-white text-body1-16-regular">이름</div>
        </div>
      </div>
      {/* 내가쓴글, 내가 쓴 댓글, 내 평점 */}
      <div className="flex flex-col gap-8">
        <button className="flex items-center justify-between">
          <div className="text-primary-lightgray text-body3-13-regular">
            내가 쓴 글
          </div>
          <div className="text-primary-lightgray text-body3-13-regular">
            0개
          </div>
        </button>

        <button className="flex items-center justify-between">
          <div className="text-primary-lightgray text-body3-13-regular">
            내가 쓴 댓글
          </div>
          <div className="text-primary-lightgray text-body3-13-regular">
            0개
          </div>
        </button>

        <button className="flex items-center justify-between">
          <div className="text-primary-lightgray text-body3-13-regular">
            내 평점
          </div>
          <div className="text-primary-lightgray text-body3-13-regular">
            0개
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
              내여친 아칼리
            </div>
            <div className="text-secondary-gray text-body5-10-regular">
              #kr1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
