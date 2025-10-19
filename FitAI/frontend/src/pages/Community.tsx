import { useState, useEffect, useRef } from "react";

function Community() {
  // 게시물 목록 상태
  const [postList, setPostList] = useState<any[]>([]);
  // 현재 페이지 번호
  const [currentPage, setCurrentPage] = useState(1);
  // 로딩 중인지 여부
  const [isLoading, setIsLoading] = useState(false);
  // 더 불러올 데이터가 있는지 여부
  const [hasMoreData, setHasMoreData] = useState(true);
  // 선택된 게시물 (모달용)
  const [selectedPostData, setSelectedPostData] = useState<any>(null);
  // 무한 스크롤을 감지할 요소
  const scrollObserverTarget = useRef<HTMLDivElement>(null);

  // 가짜 게시물 데이터를 생성하는 함수
  const createFakePosts = (pageNumber: number) => {
    const newPostList = [];

    // 5개의 게시물 생성
    for (let index = 0; index < 5; index++) {
      const postNumber = (pageNumber - 1) * 5 + index + 1;
      const hasImage = Math.random() > 0.4; // 60% 확률로 이미지 있음

      newPostList.push({
        id: postNumber,
        userName: `FitAI 사용자${postNumber}`,
        timeAgo: `${Math.floor(Math.random() * 60) + 1}분전`,
        postContent: [
          "오늘의 운동🔥",
          "스쿼트 100개 완료!💪",
          "아침 러닝 완료😊",
          "플랭크 3분 성공!",
          "홈트 시작합니다!",
          "운동 후 스트레칭",
        ][Math.floor(Math.random() * 6)],
        hasImage: hasImage,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      });
    }

    return newPostList;
  };

  // 컴포넌트가 처음 렌더링될 때 초기 데이터 불러오기
  useEffect(() => {
    setPostList(createFakePosts(1));
  }, []);

  // 더 많은 게시물을 불러오는 함수
  const loadMorePosts = () => {
    // 이미 로딩 중이거나 더 이상 데이터가 없으면 중단
    if (isLoading || !hasMoreData) return;

    setIsLoading(true);

    // 서버 요청을 시뮬레이션 (1초 후에 데이터 로드)
    setTimeout(() => {
      const nextPageNumber = currentPage + 1;
      const newPosts = createFakePosts(nextPageNumber);

      // 기존 게시물 목록에 새 게시물 추가
      setPostList((previousPosts) => [...previousPosts, ...newPosts]);
      setCurrentPage(nextPageNumber);
      setIsLoading(false);

      // 10페이지(50개 게시물) 이후에는 더 이상 로드하지 않음
      if (nextPageNumber >= 10) {
        setHasMoreData(false);
      }
    }, 1000);
  };

  // 무한 스크롤 감지 설정
  useEffect(() => {
    // Intersection Observer: 특정 요소가 화면에 보이는지 감지하는 브라우저 API
    const scrollObserver = new IntersectionObserver(
      (entries) => {
        // 타겟 요소가 화면에 보이면 더 많은 데이터 로드
        if (entries[0].isIntersecting && hasMoreData && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 } // 요소의 10%가 보이면 감지
    );

    // 관찰 시작
    if (scrollObserverTarget.current) {
      scrollObserver.observe(scrollObserverTarget.current);
    }

    // 컴포넌트가 사라질 때 관찰 중단
    return () => {
      if (scrollObserverTarget.current) {
        scrollObserver.unobserve(scrollObserverTarget.current);
      }
    };
  }, [isLoading, hasMoreData, currentPage]);

  return (
    <>
      <div className="bg-[#1E1F23] text-white min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* 게시물 목록 */}
          <div className="space-y-4">
            {postList.map((post) => (
              <div
                key={post.id}
                className="bg-[#2A2B30] rounded-2xl overflow-hidden cursor-pointer hover:bg-[#33343a] transition"
                onClick={() => setSelectedPostData(post)}
              >
                {/* 게시물 헤더 (프로필, 이름, 시간) */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {post.userName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {post.timeAgo}
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 text-xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    ⋯
                  </button>
                </div>

                {/* 게시물 내용 */}
                <div className="px-4 pb-3">
                  <p className="text-sm">{post.postContent}</p>
                </div>

                {/* 이미지 영역 (이미지가 있을 때만 표시) */}
                {post.hasImage && (
                  <div className="bg-gray-700 h-64 flex items-center justify-center text-gray-500">
                    [이미지]
                  </div>
                )}

                {/* 댓글 정보 */}
                <div className="px-4 py-2 text-xs text-gray-400">
                  <span>아직 댓글이 없습니다</span>
                </div>

                {/* 좋아요, 댓글, 공유 버튼 */}
                <div className="flex items-center justify-around py-3 border-t border-gray-700">
                  <button
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition"
                    onClick={(event) => event.stopPropagation()}
                  >
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
                    <span className="text-xs">{post.likeCount}</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition"
                    onClick={(event) => event.stopPropagation()}
                  >
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
                    <span className="text-xs">{post.commentCount}</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition"
                    onClick={(event) => event.stopPropagation()}
                  >
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
                    <span className="text-xs">{post.shareCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 로딩 중일 때 표시 */}
          {isLoading && (
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

          {/* 더 이상 데이터가 없을 때 표시 */}
          {!hasMoreData && (
            <div className="text-center py-8 text-gray-500">
              모든 게시물을 불러왔습니다
            </div>
          )}

          {/* 무한 스크롤을 감지하기 위한 타겟 요소 */}
          <div ref={scrollObserverTarget} className="h-4"></div>
        </div>

        {/* 게시물 작성 플로팅 버튼 */}
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

      {/* 게시물 상세보기 모달 */}
      {selectedPostData && (
        <div className="fixed inset-0 bg-[#1E1F23] z-50 overflow-y-auto flex flex-col">
          {/* 모달 헤더 */}
          <div className="bg-[#1E1F23] border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-8 h-18 flex items-center">
              <button
                onClick={() => setSelectedPostData(null)}
                className="text-white hover:text-orange-500 transition flex items-center gap-2"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>뒤로가기</span>
              </button>
            </div>
          </div>

          {/* 모달 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto pb-20 px-8 py-6">
              {/* 게시물 상세 내용 */}
              <div className="bg-[#2A2B30]">
                {/* 게시물 헤더 */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">
                        {selectedPostData.userName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {selectedPostData.timeAgo}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 text-xl">⋯</button>
                </div>

                {/* 게시물 내용 */}
                <div className="px-4 pb-3">
                  <p className="text-sm text-white">
                    {selectedPostData.postContent}
                  </p>
                </div>

                {/* 이미지 영역 (이미지가 있을 때만 표시) */}
                {selectedPostData.hasImage && (
                  <div className="bg-gray-700 h-96 flex items-center justify-center text-gray-500">
                    [이미지]
                  </div>
                )}

                {/* 댓글 정보 */}
                <div className="px-4 py-2 text-xs text-gray-400">
                  <span>아직 댓글이 없습니다</span>
                </div>

                {/* 좋아요, 댓글, 공유 버튼 */}
                <div className="flex items-center justify-around py-3 border-t border-gray-700">
                  <button className="flex items-center gap-2 text-gray-400 hover:text-white transition">
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
                    <span className="text-sm">
                      {selectedPostData.likeCount}
                    </span>
                  </button>

                  <button className="flex items-center gap-2 text-gray-400 hover:text-white transition">
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
                    <span className="text-sm">
                      {selectedPostData.commentCount}
                    </span>
                  </button>

                  <button className="flex items-center gap-2 text-gray-400 hover:text-white transition">
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
                    <span className="text-sm">
                      {selectedPostData.shareCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* 댓글 섹션 */}
              <div className="mt-4 px-4">
                <h3 className="text-lg font-semibold mb-4 text-white">댓글</h3>

                {/* 댓글 예시 */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">👤</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#2A2B30] rounded-2xl px-4 py-3">
                        <div className="font-semibold text-sm mb-1 text-white">
                          FitAI 사용자2
                        </div>
                        <p className="text-sm text-gray-300">좋아요 👍</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>2025.03.17 2:47 오후</span>
                        <button className="hover:text-white transition">
                          좋아요 (1)
                        </button>
                        <button className="hover:text-white transition">
                          답글 달기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 댓글 입력창 */}
          <div className="bg-[#2A2B30] border-t border-gray-700 p-4">
            <div className="max-w-7xl mx-auto flex gap-3 px-8">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs">👤</span>
              </div>
              <input
                type="text"
                placeholder="댓글을 입력하세요..."
                className="flex-1 bg-[#1E1F23] text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="text-orange-500 font-semibold px-4 hover:opacity-80 transition">
                게시
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Community;
