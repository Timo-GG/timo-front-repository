import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createCommentApi,
  deleteCommentApi,
  getCommentApi,
  updateCommentApi,
} from '../apis/comment';

export default function useComments() {
  // 댓글 생성
  let createComment = useMutation({
    mutationFn: createCommentApi,
    onSuccess: data => {
      console.log('댓글 생성 성공', data);
    },
    onError: error => {
      console.log('댓글 생성 실패', error);
    },
  });
  // 댓글 업데이트
  let updateComment = useMutation({
    mutationFn: updateCommentApi,
    onSuccess: data => {
      console.log('댓글 업데이트 성공', data);
    },
    onError: error => {
      console.log('댓글 업데이트 실패', error);
    },
  });
  // 댓글 삭제
  let deleteComment = useMutation({
    mutationFn: deleteCommentApi,
    onSuccess: data => {
      console.log('댓글 삭제 성공', data);
    },
    onError: error => {
      console.log('댓글 삭제 실패', error);
    },
  });
  // 단일 댓글 조회
  let getComment = (postId: number) => {
    return useQuery({
      queryKey: ['comment', postId],
      queryFn: () => getCommentApi({ CommentFilterDto: { postId } }),
      staleTime: 1000 * 60 * 5, // 5분
    });
  };
  return {
    createComment,
    updateComment,
    deleteComment,
    getComment,
  };
}
