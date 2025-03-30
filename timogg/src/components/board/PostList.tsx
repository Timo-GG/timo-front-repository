import { EyeIcon, LikeIcon, PictureIcon } from '../../assets/svgs/assets';

interface Post {
  id: number;
  title: string;
  content: string;
  memberId: number;
  memberName: string;
  category: string;
  isHaveImg: boolean;
  commentCount: number;
  viewCount: number;
  likeCount: number;
  regDate: string;
  modDate: string;
}

export default function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="w-full flex flex-col gap-8">
      {posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
//필요한 정보 : 유저 아이디, 댓글 수, 사진이 있는지 없는지 여부,
// 필요 없는 정보 : 글 내용, memberID,
function PostItem({ post }: { post: Post }) {
  return (
    <div className="w-full flex flex-row gap-4 justify-between">
      <div className="flex flex-col gap-4 ">
        <div className="flex flex-row gap-4 items-end text-body1-16-regular">
          {post.isHaveImg && <PictureIcon />}
          <div>{post.title}</div>
          <div className="text-primary-green text-body3-13-regular pb-2">
            {post.commentCount ? `[${post.commentCount}]` : ''}
          </div>
        </div>
        <div className="text-body4-12-demilight flex flex-row gap-8">
          <div className="inline">{post.memberName}</div>
          <div className="inline">|</div>
          <div className="inline">
            {new Date(post.regDate).toLocaleDateString()}
          </div>
          <div className="inline">|</div>
          <div className="flex flex-row gap-2">
            <EyeIcon />
            {post.viewCount}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center justify-center">
        <LikeIcon />
        {post.likeCount}
      </div>
    </div>
  );
}
