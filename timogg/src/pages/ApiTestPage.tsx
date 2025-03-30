import { useState } from 'react';
import { getMyInfo, testLogin } from '../apis/auth';
import useComments from '../hooks/useComments';
import useMatching from '../hooks/useMatching';
import usePosts from '../hooks/usePosts';
import useRatings from '../hooks/useRatings';
import useAuthStore from '../storage/useAuthStore';
import { axiosInstance } from '../apis';
import { myInfo } from '../apis/member';

export default function ApiTestPage() {
  const { createPost, updatePost, deletePost, getPost, getPosts } = usePosts();
  const {
    createComment,
    updateComment,
    deleteComment,
    getComments,
    getComment,
  } = useComments();
  const { createRating, deleteRating, getRatings } = useRatings();
  const {
    getMatchingOptions,
    createMatchingOption,
    startMatching,
    cancelMatching,
    acceptMatching,
    rejectMatching,
    getMatchingQueue,
  } = useMatching();

  // ✅ 입력값 상태 관리
  const [postId, setPostId] = useState('');
  const [commentId, setCommentId] = useState('');
  const [matchingId, setMatchingId] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const { login, setUserData } = useAuthStore();

  return (
    <div>
      <div>로그인</div>
      <div className="flex flex-col">
        <button
          onClick={async () => {
            const data = await testLogin();

            login(data!.accessToken, data!.refreshToken);

            const userData = await myInfo();

            setUserData(userData);
          }}
        >
          로그인
        </button>
        <button
          onClick={async () => {
            let data = await getMyInfo();
            setResponse(data);
          }}
        >
          내 정보
        </button>
        <button
          onClick={async () => {
            useAuthStore.getState().logout();
            axiosInstance.defaults.headers.common['Authorization'] = '';
            console.log('로그아웃 성공');
          }}
        >
          로그아웃
        </button>
      </div>

      {/* ✅ 입력 필드 */}
      <div className="flex flex-col">
        <label>Post ID:</label>
        <input
          type="text"
          value={postId}
          onChange={e => setPostId(e.target.value)}
          className="text-black"
        />
        <label>Comment ID:</label>
        <input
          type="text"
          value={commentId}
          onChange={e => setCommentId(e.target.value)}
          className="text-black"
        />
        <label>Matching ID:</label>
        <input
          type="text"
          value={matchingId}
          onChange={e => setMatchingId(e.target.value)}
          className="text-black"
        />
        <label>Request Body (JSON 형식):</label>
        <textarea
          value={requestBody}
          onChange={e => setRequestBody(e.target.value)}
          className="text-black"
        />
      </div>

      <div>포스트 API</div>
      <div className="flex flex-col">
        <button
          onClick={() =>
            createPost.mutate(JSON.parse(requestBody), {
              onSuccess: data => setResponse(data),
            })
          }
        >
          포스트 생성
        </button>
        <button
          onClick={() =>
            updatePost.mutate(
              { id: Number(postId), ...JSON.parse(requestBody) },
              {
                onSuccess: data => setResponse(data),
              },
            )
          }
        >
          포스트 수정
        </button>
        <button
          onClick={() =>
            deletePost.mutate(Number(postId), { onSuccess: setResponse })
          }
        >
          포스트 삭제
        </button>
        <button
          onClick={() =>
            getPost.mutate(Number(postId), { onSuccess: setResponse })
          }
        >
          포스트 조회
        </button>
        <button onClick={() => getPosts.mutate({}, { onSuccess: setResponse })}>
          전체 포스트 조회
        </button>
      </div>

      <div>댓글 API</div>
      <div className="flex flex-col">
        <button
          onClick={() =>
            createComment.mutate(JSON.parse(requestBody), {
              onSuccess: setResponse,
            })
          }
        >
          댓글 생성
        </button>
        <button
          onClick={() =>
            updateComment.mutate(
              { id: Number(commentId), ...JSON.parse(requestBody) },
              {
                onSuccess: setResponse,
              },
            )
          }
        >
          댓글 수정
        </button>
        <button
          onClick={() =>
            deleteComment.mutate(Number(commentId), { onSuccess: setResponse })
          }
        >
          댓글 삭제
        </button>
        <button
          onClick={() =>
            getComment.mutate(Number(commentId), { onSuccess: setResponse })
          }
        >
          단일 댓글 조회
        </button>
        <button
          onClick={() => getComments.mutate({}, { onSuccess: setResponse })}
        >
          댓글 전체 조회
        </button>
      </div>

      <div>평가 API</div>
      <div className="flex flex-col">
        <button
          onClick={() =>
            createRating.mutate(JSON.parse(requestBody), {
              onSuccess: setResponse,
            })
          }
        >
          평가 생성
        </button>
        <button
          onClick={() =>
            deleteRating.mutate(Number(postId), { onSuccess: setResponse })
          }
        >
          평가 삭제
        </button>
        <button
          onClick={() => getRatings.mutate({}, { onSuccess: setResponse })}
        >
          평가 조회
        </button>
      </div>

      <div>매칭 API</div>
      <div className="flex flex-col">
        <button
          onClick={() => startMatching.mutate({}, { onSuccess: setResponse })}
        >
          매칭 요청
        </button>
        <button
          onClick={() => cancelMatching.mutate({}, { onSuccess: setResponse })}
        >
          매칭 취소
        </button>
        <button
          onClick={() =>
            acceptMatching.mutate(Number(matchingId), {
              onSuccess: setResponse,
            })
          }
        >
          매칭 수락
        </button>
        <button
          onClick={() =>
            rejectMatching.mutate(Number(matchingId), {
              onSuccess: setResponse,
            })
          }
        >
          매칭 거절
        </button>
        <button
          onClick={() =>
            getMatchingOptions.mutate(Number(matchingId), {
              onSuccess: setResponse,
            })
          }
        >
          매칭 옵션 조회
        </button>
        <button
          onClick={() =>
            createMatchingOption.mutate(JSON.parse(requestBody), {
              onSuccess: setResponse,
            })
          }
        >
          매칭 옵션 생성
        </button>
        <button
          onClick={() =>
            getMatchingQueue.mutate({}, { onSuccess: setResponse })
          }
        >
          매칭 대기열 조회
        </button>
      </div>

      {/* ✅ API 응답 표시 */}
      <div>
        <h3>📌 API 응답</h3>
        <pre>{response ? JSON.stringify(response, null, 2) : '응답 없음'}</pre>
      </div>
    </div>
  );
}
