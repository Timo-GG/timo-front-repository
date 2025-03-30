import { axiosInstance } from '.';

export interface SearchingFilterDto {
  postId?: number;
  memberId?: number;
  title?: string; // 해당 문자열을 포함하는 제목을 찾음.
  category?: 'INFO' | 'NORMAL' | 'CREATIVITY' | ''; // Optional, default = ''
  sortBy?: string; // Post 엔티티 변수 필드명, Optional, default = regDate
  sortOrder?: boolean; // True가 오름차순, Optional, default = true
}
export interface Pageable {
  page: number; // Optional, default = 0
  size: number; // Optional, default = 10
}
export interface PostResponseDto {
  id: number;
  title: string;
  content: string;
  memberId: number;
  memberName: string;
  category: 'INFO' | 'NORMAL' | 'CREATIVITY';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  imageCount: number;
  regDate: string; // ISO Date String
  modDate: string; // ISO Date String
}
// 포스트 작성
interface CreatePostApiBody {
  title: string;
  content: string;
  category: string;
  membetId: number;
}
export async function createPostApi(body: CreatePostApiBody) {
  const response = await axiosInstance.post('/posts', body);
  return response.data;
}

interface UpdatePostApiBody {
  title: string;
  content: string;
  category: string;
  membetId: number;
}

// 포스트 수정
export async function updatePostApi({
  postId,
  data,
}: {
  postId: string;
  data: UpdatePostApiBody;
}) {
  const response = await axiosInstance.put('/posts/' + postId, data);
  return response.data;
}

// 포스트 삭제
export async function deletePostApi(postId: string) {
  const response = await axiosInstance.delete('/posts/' + postId);
  return response.data;
}

// 포스트 페이지 검색 조회
export async function getPostsApi({
  searchingFilterDto,
  pageable,
}: {
  searchingFilterDto?: SearchingFilterDto;
  pageable?: Pageable;
}): Promise<{
  data: PostResponseDto[];
  success: boolean;
  message: string;
  errorCode: number;
}> {
  const response = await axiosInstance.get('/posts/public', {
    params: { ...searchingFilterDto, ...pageable },
  });
  return response.data;
}
