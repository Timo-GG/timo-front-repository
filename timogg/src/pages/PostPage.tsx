import { useLocation, useParams } from 'react-router-dom';
import useComments from '../hooks/useComments';
import usePosts from '../hooks/usePosts';

export const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const { getPostDetail } = usePosts();
  const { data: response } = getPostDetail(Number(postId));
  const location = useLocation();
  const post = response === undefined ? location.state.post : response.data;
  console.log('post: ', location);

  const { getComment } = useComments();
  const { data: comments, isLoading, error } = getComment(Number(postId));
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  console.log('comment: ', comments);
  // todo : 댓글 작성, 수정, 삭제 기능 추가
  // todo : 게시글 수정, 삭제 기능 추가
  // todo :  게시글 좋아요 기능 추가
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 mb-4">{post.content}</p>
      <p className="text-sm text-gray-500">By {post?.memberName}</p>

      {/* 댓글 */}
      <div className="mt-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        {comments?.data.map(comment => (
          <div key={comment.id} className="border-b py-2">
            <p className="text-gray-700">{comment.content}</p>
            <p className="text-sm text-gray-500">By {comment.memberId}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
