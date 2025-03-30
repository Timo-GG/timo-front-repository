import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import {
  createRatingApi,
  deleteRatingApi,
  getDuosListApi,
  getMyRatingApi,
} from '../apis/rating';

export default function useRatings() {
  // 평가 생성
  let createRating = useMutation({
    mutationFn: createRatingApi,
    onSuccess: data => {
      console.log('평가 생성 성공', data);
    },
    onError: error => {
      console.log('평가 생성 실패', error);
    },
  });
  // 평가 삭제
  let deleteRating = useMutation({
    mutationFn: deleteRatingApi,
    onSuccess: data => {
      console.log('평가 삭제 성공', data);
    },
    onError: error => {
      console.log('평가 삭제 실패', error);
    },
  });
  // 내 평가 조회
  let getRatings = () => {
    return useQuery({
      queryKey: ['ratings'],
      queryFn: getMyRatingApi,
    });
  };
  // 듀오 리스트 조회
  let getDuosList = () => {
    return useQuery({
      queryKey: ['duos'],
      queryFn: getDuosListApi,
      staleTime: 1000 * 60 * 5, // 5분
    });
  };
  return { createRating, deleteRating, getRatings, getDuosList };
}
