import DropdownMenu from '../components/common/DropdownMenu';
import PostList from '../components/board/PostList';

let testPosts = [
  {
    id: 1,
    title: '테스트 제목: 1',
    content: '테스트 내용...1',
    memberId: 1,
    category: 'NORMAL',
    commentCount: 33,
    isHaveImg: true,
    viewCount: 50,
    likeCount: 0,
    regDate: '2025-02-21T03:33:41',
    modDate: '2025-02-21T03:33:41',
  },
  {
    id: 2,
    title: '테스트 제목: 2',
    content: '테스트 내용...2',
    memberId: 2,
    category: 'NORMAL',
    commentCount: 33,
    isHaveImg: true,
    viewCount: 100,
    likeCount: 0,
    regDate: '2025-02-21T03:33:41',
    modDate: '2025-02-21T03:33:41',
  },
  {
    id: 3,
    title: '테스트 제목: 3',
    content: '테스트 내용...3',
    memberId: 3,
    category: 'NORMAL',
    commentCount: 33,
    isHaveImg: true,
    viewCount: 150,
    likeCount: 0,
    regDate: '2025-02-21T03:33:41',
    modDate: '2025-02-21T03:33:41',
  },
  {
    id: 4,
    title: 'test tile',
    content: 'test content',
    memberId: 1,
    category: 'NORMAL',
    commentCount: 33,
    isHaveImg: true,
    viewCount: 0,
    likeCount: 0,
    regDate: '2025-02-21T12:33:42.541055',
    modDate: '2025-02-21T12:33:42.541055',
  },
];
import PostCreate from '../components/board/PostCreate';

const BoardPage = () => {
  let boardItems = ['정보 게시판', '자유 게시판 ', '창작 게시판'];
  let navItems = ['최신순', '높은 티어 순', '평점 높은순'];
  return (
    <div>
      <h1>Board Page</h1>
    </div>
  );
};

export default BoardPage;
