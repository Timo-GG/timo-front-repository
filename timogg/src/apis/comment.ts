import { axiosInstance } from '.';

interface CreateCommentApiBody {
  content: string;
  memberId: number;
  postId: number;
}
// 댓글 작성
export async function createCommentApi(body: CreateCommentApiBody) {
  const response = await axiosInstance.post('/comments', body);
  return response.data;
}

interface UpdateCommentApiBody {
  content: string;
  memberId: number;
  postId: number;
}
// 댓글 수정
export async function updateCommentApi({
  commentId,
  body,
}: {
  commentId: string;
  data: UpdateCommentApiBody;
}) {
  const response = await axiosInstance.put('/comments/' + commentId, body);
  return response.data;
}

// 댓글 삭제
export async function deleteCommentApi(commentId: string) {
  const response = await axiosInstance.delete('/comments/' + commentId);
  return response.data;
}

// 단일 댓글 조회
export async function getCommentApi(commentId: string) {
  const response = await axiosInstance.get('/comments/public/' + commentId);
  return response.data;
}

// 댓글 전체 조회
export async function getCommentsApi() {
  const response = await axiosInstance.get('/comments/public');
  return response.data;
}
