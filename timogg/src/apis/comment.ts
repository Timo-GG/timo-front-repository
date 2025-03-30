import { axiosInstance } from '.';

interface CreateCommentApiBody {
  content: string;
  memberId: number;
  postId: number;
}

interface CommentFilterDto {
  commentId?: number; // Optional
  postId?: number; // Optional
  memberId?: number; // Optional
  sortBy?: string; // Comment 엔티티 변수 필드명, Optional, default = regDate
  sortOrder?: boolean; // True가 오름차순, Optional, default = true
}
interface Pageable {
  page: number; // 페이지 번호 (0부터 시작)
  size: number; // 페이지당 데이터 개수
}
interface CommentResponseDto {
  id: number; // 댓글 ID
  content: string; // 댓글 내용
  postId: number; // 게시글 ID
  memberId: number; // 작성자 ID
  regDate: string; // 등록일
  modDate: string; // 수정일
}
// 댓글 작성
export async function createCommentApi(body: CreateCommentApiBody) {
  const response = await axiosInstance.post('/comments', body, {
    withAuth: true,
  });
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
  const response = await axiosInstance.put('/comments/' + commentId, body, {
    withAuth: true,
  });
  return response.data;
}

// 댓글 삭제
export async function deleteCommentApi(commentId: string) {
  const response = await axiosInstance.delete('/comments/' + commentId, {});
  return response.data;
}

// 댓글 조회
export async function getCommentApi({
  CommentFilterDto,
  pageable,
}: {
  CommentFilterDto?: CommentFilterDto;
  pageable?: Pageable;
}): Promise<{
  success: boolean;
  message: string;
  errorCode: number;
  data: CommentResponseDto[];
}> {
  const response = await axiosInstance.get('/comments/public', {
    params: { ...CommentFilterDto, ...pageable },
  });
  return response.data;
}
