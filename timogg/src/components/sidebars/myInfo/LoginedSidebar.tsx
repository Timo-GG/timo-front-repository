export default function LoginedSidebar() {
  return (
    <div
      id="logined-sidebar"
      className="flex flex-col gap-16 bg-secondary-realdarkgray"
    >
      {/* 프로필, 이름 */}
      <div className="flex gap-16 items-center ">
        <div className="w-40 h-40 bg-secondary-darkgray rounded-full"></div>
        <div className="flex flex-col gap-4">
          <div className="text-primary-white text-body1-16-bold">이름</div>
        </div>
      </div>
      {/* 내가쓴글, 내가 쓴 댓글, 내 평점 */}
      <div className="flex flex-col gap-16">
        <button className="flex items-center justify-between">
          <div className="text-primary-white text-body1-16-bold">
            내가 쓴 글
          </div>
          <div className="text-primary-white text-body1-16">0</div>
        </button>

        <button className="flex items-center justify-between">
          <div className="text-primary-white text-body1-16-bold">
            내가 쓴 댓글
          </div>
          <div className="text-primary-white text-body1-16">0</div>
        </button>

        <button className="flex items-center justify-between">
          <div className="text-primary-white text-body1-16-bold">내 평점</div>
          <div className="text-primary-white text-body1-16">0</div>
        </button>
      </div>
      {/* 연동된 라이엇 계정 */}
      {/* 연동된 계정이 없을 때 */}
      <div className="flex flex-col gap-16">
        <div className="text-primary-white text-body1-16-bold">
          연동된 라이엇 계정
        </div>
        <div className="text-primary-white text-body1-16">
          라이엇 계정이 연동되어 있지 않습니다.
        </div>
        <button className="h-42 py-8 rounded-10">
          <div className="text-secondary-green text-body1-16-bold">
            연동하기
          </div>
        </button>
      </div>
      {/* 연동된 계정이 있을 때 */}
    </div>
  );
}
