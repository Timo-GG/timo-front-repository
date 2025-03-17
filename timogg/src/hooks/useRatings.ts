import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import {
  createRatingApi,
  deleteRatingApi,
  getDuosListApi,
  getMyRatingApi,
  getRatingApi,
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
    let { data, isLoading, error } = useQuery({
      queryKey: ['ratings'],
      queryFn: getMyRatingApi,
    });
    return { data, isLoading, error };
  };
  // 듀오 리스트 조회
  let getDuosList = () => {
    let { data, isLoading, error } = useQuery({
      queryKey: ['duos'],
      queryFn: getDuosListApi,
    });
    return { data, isLoading, error };
  };
  return { createRating, deleteRating, getRatings, getDuosList };
}
