import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createPostApi,
  deletePostApi,
  getPostsApi,
  updatePostApi,
} from '../apis/post';
import useAuthStore from '../storage/useAuthStore';

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

  let getPost = (postId: number) => {
    //todo: 포스트 상세 조회 api 호출
    return useQuery({
      queryKey: ['post'],
      queryFn: () => getPostsApi({ searchingFilterDto: { postId } }),
      staleTime: 1000 * 60 * 5, // 5분
    });
  };

  // 포스트 페이지 조회
  let getPosts = ({
    category,
    sortBy,
    sortOrder = true,
    page,
  }: {
    category: 'info' | 'free' | 'create' | undefined;
    sortBy: string;
    sortOrder?: boolean; // true = 오름차순, false = 내림차순
    page: number; // 페이지 번호
  }) => {
    let categoryList: Record<
      'info' | 'free' | 'create' | 'default',
      '' | 'INFO' | 'NORMAL' | 'CREATIVITY'
    > = {
      info: 'INFO',
      free: 'NORMAL',
      create: 'CREATIVITY',
      default: '',
    };
    return useQuery({
      queryKey: ['posts', category, sortBy, sortOrder, page],
      queryFn: () =>
        getPostsApi({
          searchingFilterDto: {
            category: categoryList[category ?? 'default'],
            sortBy,
            sortOrder,
          },
          pageable: { page, size: 10 },
        }),
      staleTime: 1000 * 60 * 5, // 5분
    });
  };

  // 내가 쓴 포스트 조회
  let getMyPosts = (page: 1) => {
    return useQuery({
      queryKey: ['myPosts'],
      queryFn: () =>
        getPostsApi({
          searchingFilterDto: { memberId: useAuthStore().userData.id },
          pageable: { page, size: 10 },
        }),
      staleTime: 1000 * 60 * 5, // 5분
    });
  };

  // 포스트 검색 조회
  let getSearchPosts = (keyword: string, page: number) => {
    return useQuery({
      queryKey: ['searchPosts', keyword],
      queryFn: () =>
        getPostsApi({
          searchingFilterDto: { title: keyword },
          pageable: { page, size: 10 },
        }),
      staleTime: 1000 * 60 * 5, // 5분
    });
  };

  return {
    createPost,
    updatePost,
    deletePost,
    getPost,
    getPosts,
    getMyPosts,
    getSearchPosts,
  };
}
