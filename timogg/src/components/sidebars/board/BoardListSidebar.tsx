import { Link } from 'react-router-dom';
import { DropdownIcon } from '../../../assets/svgs/assets';

export default function BoardListSidebar() {
  //정보 게시판, 자유 게시판, 창작 게시판
  return (
    <div className="w-295 bg-secondary-realdarkgray rounded-10 flex flex-col items-center gap-16 px-24 py-12">
      <div className="flex flex-col gap-4  w-full">
        <Link to="/board/info" className="flex justify-between">
          <a className="text-primary-white text-body2-15-medium">정보 게시판</a>
          <DropdownIcon className="-rotate-90 -z-10" />
        </Link>

        <Link to="/board/free" className="flex justify-between">
          <a className="text-primary-white text-body2-15-medium">자유 게시판</a>
          <DropdownIcon className="-rotate-90 -z-10" />
        </Link>

        <Link to="/board/create" className="flex justify-between">
          <a className="text-primary-white text-body2-15-medium">창작 게시판</a>
          <DropdownIcon className="-rotate-90 -z-10" />
        </Link>
      </div>
    </div>
  );
}
