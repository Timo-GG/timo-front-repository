import { axiosInstance } from '.';

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
  searchingFilterDto: number;
  pageable: string;
}) {
  const response = await axiosInstance.get('/posts/public', {
    params: { searchingFilterDto, Pageable: pageable },
  });
  return response.data;
}
