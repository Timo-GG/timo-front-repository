import { Link } from 'react-router-dom';

export default function NotLoginedSidebar() {
  //로그인 후 글쓰기
  //로그인 버튼
  return (
    <div className="w-295 bg-secondary-realdarkgray rounded-10 flex flex-col items-center gap-10 px-24 py-24">
      <div className="text-primary-white text-body1-16-bold">내 정보 확인</div>
      <Link to="/login">
        <button className="w-270 h-42 py-8 flex justify-center items-center bg-secondary-green hover:bg-primary-green rounded-10">
          <a className="text-primary-white text-body1-16">로그인</a>
        </button>
      </Link>
    </div>
  );
}
