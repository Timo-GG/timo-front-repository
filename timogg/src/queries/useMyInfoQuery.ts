import { useQuery } from '@tanstack/react-query';
import { getMyDetailInfo } from '../apis/member';

export const useMyInfoQuery = () => {
  return useQuery({
    queryKey: ['myInfo'],
    queryFn: getMyDetailInfo,
    staleTime: 1000 * 60 * 5, // 5분
  });
};
