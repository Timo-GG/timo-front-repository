import { useMutation } from '@tanstack/react-query';

import {
  acceptMatchingApi,
  cancelMatchingApi,
  createMatchingOptionApi,
  getMatchingOptionsApi,
  getMatchingQueueApi,
  rejectMatchingApi,
  startMatchingApi,
} from '../apis/matching';

export default function useMatching() {
  // 매칭 옵션 받아오기
  let getMatchingOptions = useMutation({
    mutationFn: getMatchingOptionsApi,
    onSuccess: data => {
      console.log('매칭 옵션 받아오기 성공', data);
    },
    onError: error => {
      console.log('매칭 옵션 받아오기 실패', error);
    },
  });
  // 매칭 옵션 생성
  let createMatchingOption = useMutation({
    mutationFn: createMatchingOptionApi,
    onSuccess: data => {
      console.log('매칭 옵션 생성 성공', data);
    },
    onError: error => {
      console.log('매칭 옵션 생성 실패', error);
    },
  });
  // 매칭 시작
  let startMatching = useMutation({
    mutationFn: startMatchingApi,
    onSuccess: data => {
      console.log('매칭 시작 성공', data);
    },
    onError: error => {
      console.log('매칭 시작 실패', error);
    },
  });
  // 매칭 중단
  let cancelMatching = useMutation({
    mutationFn: cancelMatchingApi,
    onSuccess: data => {
      console.log('매칭 중단 성공', data);
    },
    onError: error => {
      console.log('매칭 중단 실패', error);
    },
  });
  // 매칭 수락
  let acceptMatching = useMutation({
    mutationFn: acceptMatchingApi,
    onSuccess: data => {
      console.log('매칭 수락 성공', data);
    },
    onError: error => {
      console.log('매칭 수락 실패', error);
    },
  });
  // 매칭 거절
  let rejectMatching = useMutation({
    mutationFn: rejectMatchingApi,
    onSuccess: data => {
      console.log('매칭 거절 성공', data);
    },
    onError: error => {
      console.log('매칭 거절 실패', error);
    },
  });
  // 매칭 대기열 조회
  let getMatchingQueue = useMutation({
    mutationFn: getMatchingQueueApi,
    onSuccess: data => {
      console.log('매칭 대기열 조회 성공', data);
    },
    onError: error => {
      console.log('매칭 대기열 조회 실패', error);
    },
  });
  return {
    getMatchingOptions,
    createMatchingOption,
    startMatching,
    cancelMatching,
    acceptMatching,
    rejectMatching,
    getMatchingQueue,
  };
}
