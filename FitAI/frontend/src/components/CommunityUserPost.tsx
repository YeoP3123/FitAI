import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  // 가짜 데이터 생성 함수
  const generatePosts = (pageNum: number) => {
    const newPosts = [];
    for (let i = 0; i < 5; i++) {
      const postId = (pageNum - 1) * 5 + i + 1;
      newPosts.push({
        id: postId,
        user: `FitAI 사용자${postId}`,
        time: `${Math.floor(Math.random() * 60) + 1}분전`,
        content: [
          "오늘의 운동",
          "스쿼트 100개 완료!💪",
          "아침 러닝 완료😊",
          "플랭크 3분 성공!",
          "홈트 시작합니다!",
          "운동 후 스트레칭",
        ][Math.floor(Math.random() * 6)],
        image: true,
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
      });
    }
    return newPosts;
  };

  // 초기 데이터 로드
  useEffect(() => {
    setPosts(generatePosts(1));
  }, []);

  // 더 많은 데이터 로드
  const loadMorePosts = () => {
    if (loading || !hasMore) return;

    setLoading(true);

    // 서버 요청을 시뮬레이션 (1초 딜레이)
    setTimeout(() => {
      const nextPage = page + 1;
      const newPosts = generatePosts(nextPage);

      setPosts((prev) => [...prev, ...newPosts]);
      setPage(nextPage);
      setLoading(false);

      // 10페이지(50개 포스트) 이후에는 더 이상 로드하지 않음
      if (nextPage >= 10) {
        setHasMore(false);
      }
    }, 1000);
  };

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loading, hasMore, page]);

  return (
    <div className="bg-[#1E1F23] text-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* 포스트 목록 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#2A2B30] rounded-2xl overflow-hidden"
            >
              {/* 포스트 헤더 */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{post.user}</div>
                    <div className="text-xs text-gray-400">{post.time}</div>
                  </div>
                </div>
                <button className="text-gray-400 text-xl">⋯</button>
              </div>

              {/* 포스트 내용 */}
              <div className="px-4 pb-3">
                <p className="text-sm">{post.content}</p>
              </div>

              {/* 이미지 영역 */}
              <div className="bg-gray-700 h-64 flex items-center justify-center text-gray-500">
                [이미지]
              </div>

              {/* 아래쪽 댓글 정보 */}
              <div className="px-4 py-2 text-xs text-gray-400">
                {post.comments > 0 ? (
                  <span>댓글 {post.comments}개</span>
                ) : (
                  <span>아직 댓글이 없습니다</span>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center justify-around py-3 border-t border-gray-700">
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xs">{post.likes}</span>
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-xs">{post.comments}</span>
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span className="text-xs">{post.shares}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-400 flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>불러오는 중...</span>
            </div>
          </div>
        )}

        {/* 더 이상 데이터가 없을 때 */}
        {!hasMore && (
          <div className="text-center py-8 text-gray-500">
            모든 게시물을 불러왔습니다
          </div>
        )}

        {/* Intersection Observer 타겟 */}
        <div ref={observerRef} className="h-4"></div>
      </div>

      {/* 플로팅 작성 버튼 */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}

export default Community;
