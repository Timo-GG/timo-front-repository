import { axiosInstance } from '.';

// 평점 매기기
interface CreateRatingApiBody {
  score: number;
  attitude: string;
  speech: string;
  skill: string;
  duoId: number;
  matchId: number;
}
export async function createRatingApi(body: CreateRatingApiBody) {
  const response = await axiosInstance.post('/ratings', body);
  return response.data;
}

// 평점 삭제
export async function deleteRatingApi(ratingId: string) {
  const response = await axiosInstance.delete('/ratings/' + ratingId);
  return response.data;
}

// 내 평점 조회
export async function getRatingApi() {
  const response = await axiosInstance.get('/ratings');
  return response.data;
}
