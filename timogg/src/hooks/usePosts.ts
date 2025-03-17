import { useMutation } from '@tanstack/react-query';
import {
  createPostApi,
  deletePostApi,
  getPostsApi,
  updatePostApi,
} from '../apis/post';

export default function usePosts() {
  // 포스트 생성
  let createPost = useMutation({
    mutationFn: createPostApi,
    onSuccess: data => {
      console.log('포스트 생성 성공', data);
    },
    onError: error => {
      console.log('포스트 생성 실패', error);
    },
  });
  // 포스트 업데이트
  let updatePost = useMutation({
    mutationFn: updatePostApi,
    onSuccess: data => {
      console.log('포스트 업데이트 성공', data);
    },
    onError: error => {
      console.log('포스트 업데이트 실패', error);
    },
  });
  // 포스트 삭제
  let deletePost = useMutation({
    mutationFn: deletePostApi,
    onSuccess: data => {
      console.log('포스트 삭제 성공', data);
    },
    onError: error => {
      console.log('포스트 삭제 실패', error);
    },
  });
  //포스트 상세 조회
  let getPost = useMutation(
    //todo: 포스트 상세 조회 api 호출
    {
      mutationFn: getPostsApi,
      onSuccess: data => {
        console.log('포스트 상세 조회 성공', data);
      },
      onError: error => {
        console.log('포스트 상세 조회 실패', error);
      },
    },
  );
  // 포스트 페이지 검색 조회
  let getPosts = useMutation({
    mutationFn: getPostsApi,
    onSuccess: data => {
      console.log('포스트 페이지 검색 조회 성공', data);
    },
    onError: error => {
      console.log('포스트 페이지 검색 조회 실패', error);
    },
  });
  return { createPost, updatePost, deletePost, getPost, getPosts };
}
