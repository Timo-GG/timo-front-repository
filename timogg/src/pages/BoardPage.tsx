import PostList from '../components/board/PostList';
import { useParams } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import { useEffect, useState } from 'react';

const BoardPage = () => {
  let params = useParams();
  let boardItems = ['정보 게시판', '자유 게시판 ', '창작 게시판'];
  let navItems = ['최신순', '높은 티어 순', '평점 높은순'];
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  let boardType = params.type;
  let page = Number(params.page);
  let { getPosts } = usePosts();
  let { data: response } = getPosts({
    category: boardType,
    sortBy: 'regDate',
    sortOrder: false,
    page: page ?? 0,
  });
  // todo: page이 바뀔 때마다 posts를 업데이트 해줘야 함
  useEffect(() => {
    if (response) {
      setPosts(response.data);
    }
  }, [response, boardType, page]);
  console.log('data', response);
  return (
    <>
      <h1>Board Page</h1>
      <div>{params.type}</div>
      <PostList posts={posts} />
      {/* <PostCreate /> */}
    </>
  );
};

export default BoardPage;
