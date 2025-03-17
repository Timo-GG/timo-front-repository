// {
//     "success": true,
//     "errorCode": 0,
//     "message": "Ok",
//     "data": [
//         {
//             "id": 1,
//             "title": "테스트 제목: 1",
//             "content": "테스트 내용...1",
//             "memberId": 1,
//             "category": "NORMAL",
//             "viewCount": 50,
//             "likeCount": 0,
//             "regDate": "2025-02-21T03:33:41",
//             "modDate": "2025-02-21T03:33:41"
//         },
//         {
//             "id": 2,
//             "title": "테스트 제목: 2",
//             "content": "테스트 내용...2",
//             "memberId": 2,
//             "category": "NORMAL",
//             "viewCount": 100,
//             "likeCount": 0,
//             "regDate": "2025-02-21T03:33:41",
//             "modDate": "2025-02-21T03:33:41"
//         },
//         {
//             "id": 3,
//             "title": "테스트 제목: 3",
//             "content": "테스트 내용...3",
//             "memberId": 3,
//             "category": "NORMAL",
//             "viewCount": 150,
//             "likeCount": 0,
//             "regDate": "2025-02-21T03:33:41",
//             "modDate": "2025-02-21T03:33:41"
//         },
//         {
//             "id": 4,
//             "title": "test tile",
//             "content": "test content",
//             "memberId": 1,
//             "category": "NORMAL",
//             "viewCount": 0,
//             "likeCount": 0,
//             "regDate": "2025-02-21T12:33:42.541055",
//             "modDate": "2025-02-21T12:33:42.541055"
//         }
//     ]
// }

import { EyeIcon, LikeIcon, PictureIcon } from '../../assets/svgs/assets';

interface Post {
  id: number;
  title: string;
  content: string;
  memberId: number;
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
    <div className="flex flex-col gap-8">
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
    <div className="flex flex-row gap-4 justify-between">
      <div className="flex flex-col gap-4 ">
        <div className="flex flex-row gap-4 items-end text-body1-16-regular">
          {post.isHaveImg && <PictureIcon />}
          <div>{post.title}</div>
          {/* todo : 댓글 수 표시 */}
          <div className="text-primary-green text-body3-13-regular pb-2">
            {post.commentCount && `[${post.commentCount}]`}
          </div>
        </div>
        <div className="text-body4-12-demilight flex flex-row gap-8">
          <div className="inline">{post.memberId}</div>
          <div className="inline">|</div>
          <div className="inline">
            {new Date(post.regDate).toLocaleDateString()}
          </div>
          <div className="inline">|</div>
          <div className="inline flex flex-row gap-2">
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
