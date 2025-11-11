import { useState, useEffect, useRef } from "react";
import { getUserId, getUserInfo } from "../utils/auth"; // ⚙️ Cognito 유틸 import

const API_BASE = import.meta.env.VITE_API_URL;

function Community() {
  const [postList, setPostList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [selectedPostData, setSelectedPostData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const scrollObserverTarget = useRef<HTMLDivElement>(null);

  // 로그인 사용자
  const [userInfo, setUserInfo] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const info = await getUserInfo();
      setUserInfo(info);
    };
    fetchUser();
  }, []);

  // 게시물 불러오기
  const fetchPosts = async (pageNumber: number) => {
    if (isLoading || !hasMoreData) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/posts?page=${pageNumber}&limit=5`);
      const json = await res.json();
      if (json.success && json.data) {
        setPostList((prev) => {
  const newPosts = json.data.filter(
    (p: any) => !prev.some((item) => item.post_id === p.post_id)
  );
  return [...prev, ...newPosts];
});

        if (json.data.length < 5) setHasMoreData(false);
      } else setHasMoreData(false);
    } catch (err) {
      console.error("게시물 불러오기 실패:", err);
      setHasMoreData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 게시물
  useEffect(() => {
    fetchPosts(1);
  }, []);

  // 무한 스크롤
  useEffect(() => {
    const scrollObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreData && !isLoading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchPosts(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (scrollObserverTarget.current)
      scrollObserver.observe(scrollObserverTarget.current);

    return () => {
      if (scrollObserverTarget.current)
        scrollObserver.unobserve(scrollObserverTarget.current);
    };
  }, [isLoading, hasMoreData, currentPage]);

  // 상세보기 열기
  const openPostDetail = async (post: any) => {
    setSelectedPostData(post);
    try {
      const res = await fetch(`${API_BASE}/comments/post/${post.post_id}`);
      const json = await res.json();
      if (json.success && json.data) setComments(json.data);
      else setComments([]);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
      setComments([]);
    }
  };

  // 댓글 작성
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPostData) return;
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: selectedPostData.post_id,
          user_id: userInfo?.userId || "guest",
          comment_text: newComment.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setComments((prev) => [...prev, json.data]);
        setNewComment("");
      }
    } catch (err) {
      console.error("댓글 작성 실패:", err);
    }
  };

  return (
    <>
      <div className="bg-[#1E1F23] text-white min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* 게시물 목록 */}
          <div className="space-y-4">
            {postList.map((post) => (
              <div
                key={post.post_id}
                className="bg-[#2A2B30] rounded-2xl overflow-hidden cursor-pointer hover:bg-[#33343a] transition"
                onClick={() => openPostDetail(post)}
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {post.user_id || "FitAI 사용자"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(post.post_created).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 text-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ⋯
                  </button>
                </div>

                {/* 내용 */}
                <div className="px-4 pb-3">
                  <p className="text-sm">{post.post_text}</p>
                </div>

                {/* 이미지 */}
                {post.post_image_url && (
                  <div className="bg-gray-700 h-64 flex items-center justify-center text-gray-500">
                    <img
                      src={post.post_image_url}
                      alt="게시물 이미지"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                {/* 댓글 영역 */}
                <div className="px-4 py-2 text-xs text-gray-400">
                  <span>{post.comment_count || 0}개의 댓글</span>
                </div>

                {/* 좋아요, 댓글, 공유 버튼 */}
                <div className="flex items-center justify-around py-3 border-t border-gray-700">
                  <button
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition"
                    onClick={(e) => e.stopPropagation()}
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
                    <span className="text-xs">{post.like_count || 0}</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition"
                    onClick={(e) => e.stopPropagation()}
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
                    <span className="text-xs">{post.comment_count || 0}</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition"
                    onClick={(e) => e.stopPropagation()}
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
                    <span className="text-xs">{post.shareCount || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 로딩 */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-400 flex items-center gap-2">
                <span>불러오는 중...</span>
              </div>
            </div>
          )}

          {/* 더 이상 데이터 없음 */}
          {!hasMoreData && (
            <div className="text-center py-8 text-gray-500">
              모든 게시물을 불러왔습니다
            </div>
          )}
          <div ref={scrollObserverTarget} className="h-4"></div>
        </div>

        {/* 플로팅 버튼 */}
        <button className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* 상세보기 모달 */}
      {selectedPostData && (
        <div className="fixed inset-0 bg-[#1E1F23] z-50 overflow-y-auto flex flex-col">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>뒤로가기</span>
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto pb-20 px-8 py-6">
              <div className="bg-[#2A2B30]">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">
                        {selectedPostData.user_id}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(selectedPostData.post_created).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 text-xl">⋯</button>
                </div>

                <div className="px-4 pb-3">
                  <p className="text-sm text-white">{selectedPostData.post_text}</p>
                </div>

                {selectedPostData.post_image_url && (
                  <div className="bg-gray-700 h-96 flex items-center justify-center text-gray-500">
                    <img
                      src={selectedPostData.post_image_url}
                      alt="게시물 이미지"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div className="px-4 py-2 text-xs text-gray-400">
                  <span>{comments.length}개의 댓글</span>
                </div>

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
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((c) => (
                      <div key={c.comment_id} className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">👤</span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-[#2A2B30] rounded-2xl px-4 py-3">
                            <div className="font-semibold text-sm mb-1 text-white">
                              {c.user_id}
                            </div>
                            <p className="text-sm text-gray-300">
                              {c.comment_text}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>
                              {new Date(c.comment_created).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">아직 댓글이 없습니다</p>
                  )}
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
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="flex-1 bg-[#1E1F23] text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleAddComment}
                className="text-orange-500 font-semibold px-4 hover:opacity-80 transition"
              >
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
