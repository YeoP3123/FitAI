import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
dayjs.extend(relativeTime);
dayjs.locale("ko");

const API_BASE = import.meta.env.VITE_API_URL;

function Community() {
  const navigate = useNavigate();
  const auth = useAuth();

  // ✅ 로그인 사용자 정보
  const user = auth.user?.profile;
  const accessToken = auth.user?.access_token;
  const userId = user?.sub;

  const [postList, setPostList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [selectedPostData, setSelectedPostData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const scrollObserverTarget = useRef<HTMLDivElement>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [menuOpenPostId, setMenuOpenPostId] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  // ========================
  // 게시물 불러오기 (페이지네이션 대응)
  // ========================
  const fetchPosts = async (pageNumber: number) => {
    if (isLoading || !hasMoreData) return;
    setIsLoading(true);
    try {
      // ✅ lastKey를 URL에 포함
      const url = lastKey
        ? `${API_BASE}/posts?limit=5&last_key=${encodeURIComponent(
            JSON.stringify(lastKey)
          )}`
        : `${API_BASE}/posts?limit=5`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        setPostList((prev) => {
          const newPosts = json.data.filter(
            (p: any) => !prev.some((item) => item.post_id === p.post_id)
          );
          return [...prev, ...newPosts];
        });

        // ✅ 다음 페이지 키 저장
        if (json.last_key) {
          setLastKey(json.last_key);
        } else {
          setHasMoreData(false);
        }
      } else {
        setHasMoreData(false);
      }
    } catch (err) {
      console.error("게시물 불러오기 실패:", err);
      setHasMoreData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 1. observer: 페이지 번호만 올리기
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreData && !isLoading) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    const target = scrollObserverTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [isLoading, hasMoreData]);

  // ✅ 2. currentPage 변경 시에만 fetch 실행
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  // 메뉴 외부 클릭 시 자동 닫기
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenPostId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // ========================
  // 게시물 상세보기
  // ========================
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

  const handleToggleLike = async (post: any) => {
    if (!accessToken) {
      Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다",
        text: "이 기능을 이용하려면 로그인해주세요.",
        confirmButtonColor: "#f97316",
        confirmButtonText: "확인",
      });
      return;
    }

    const isCurrentlyLiked = likedPosts[post.post_id] || false;
    const newLikeState = !isCurrentlyLiked;

    try {
      // ✅ UI 즉시 반영
      setLikedPosts((prev) => ({ ...prev, [post.post_id]: newLikeState }));

      // ✅ 게시물 목록 내 좋아요 수 변경
      setPostList((prevList) =>
        prevList.map((p) =>
          p.post_id === post.post_id
            ? {
                ...p,
                post_like_count:
                  (p.post_like_count || 0) + (newLikeState ? 1 : -1),
              }
            : p
        )
      );

      // ✅ 상세보기 상태 반영 추가 (⭐ 이 부분이 핵심)
      setSelectedPostData((prev: any) =>
        prev && prev.post_id === post.post_id
          ? {
              ...prev,
              post_like_count:
                (prev.post_like_count || 0) + (newLikeState ? 1 : -1),
            }
          : prev
      );

      // ✅ 서버 반영
      await fetch(`${API_BASE}/posts/${post.post_id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user_id: userId,
          is_liked: newLikeState,
        }),
      });
    } catch (err) {
      console.error("좋아요 토글 실패:", err);
    }
  };

  // ✅ handleAddComment 수정 버전
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPostData) return;

    if (!accessToken) {
      Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다",
        text: "이 기능을 이용하려면 로그인해주세요.",
        confirmButtonColor: "#f97316",
        confirmButtonText: "확인",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          post_id: selectedPostData.post_id,
          comment_id: `C${Date.now()}`,
          user_id: userId,
          user_name: user?.name || "익명 사용자", // ✅ 추가
          comment_text: newComment.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        // ✅ 댓글 목록 추가
        setComments((prev) => [...prev, json.data]);
        setNewComment("");

        // ✅ 상세보기 모달의 댓글 수 증가
        setSelectedPostData((prev: any) =>
          prev
            ? {
                ...prev,
                post_comment_count: (prev.post_comment_count || 0) + 1,
              }
            : prev
        );

        // ✅ 메인 목록(postList) 내 댓글 수 증가
        setPostList((prevList) =>
          prevList.map((p) =>
            p.post_id === selectedPostData.post_id
              ? { ...p, post_comment_count: (p.post_comment_count || 0) + 1 }
              : p
          )
        );
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "댓글 작성 실패",
        text: "댓글을 작성하는 중 오류가 발생했습니다.",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const handleEditComment = async (comment: any) => {
    if (!accessToken) {
      Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다",
        text: "이 기능을 이용하려면 로그인해주세요.",
        confirmButtonColor: "#f97316",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!editText.trim()) return;

    try {
      await fetch(`${API_BASE}/comments`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          post_id: selectedPostData.post_id,
          comment_id: comment.comment_id,
          comment_text: editText.trim(),
        }),
      });

      // ✅ UI 즉시 반영
      setComments((prev) =>
        prev.map((c) =>
          c.comment_id === comment.comment_id
            ? { ...c, comment_text: editText.trim() }
            : c
        )
      );

      setEditingCommentId(null);
      setEditText("");
    } catch (err) {
      console.error("댓글 수정 실패:", err);
    }
  };

  const handleDeleteComment = async (comment_id: string) => {
    if (!accessToken) {
      Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다",
        text: "이 기능을 이용하려면 로그인해주세요.",
        confirmButtonColor: "#f97316",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!selectedPostData) return;

    // ✅ 삭제 전 확인 창 추가
    const result = await Swal.fire({
      title: "댓글 삭제",
      text: "정말 이 댓글을 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(
        `${API_BASE}/comments/post/${selectedPostData.post_id}/${comment_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setComments((prev) => prev.filter((c) => c.comment_id !== comment_id));

      // ✅ 상세보기 댓글 수 감소
      setSelectedPostData((prev: any) =>
        prev
          ? {
              ...prev,
              post_comment_count: Math.max(
                (prev.post_comment_count || 1) - 1,
                0
              ),
            }
          : prev
      );

      // ✅ 메인 목록(postList) 댓글 수 동기화 추가
      setPostList((prevList) =>
        prevList.map((p) =>
          p.post_id === selectedPostData.post_id
            ? {
                ...p,
                post_comment_count: Math.max(
                  (p.post_comment_count || 1) - 1,
                  0
                ),
              }
            : p
        )
      );

      Swal.fire({
        icon: "success",
        title: "삭제 완료",
        text: "댓글이 삭제되었습니다.",
        confirmButtonColor: "#f97316",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "댓글 삭제 실패",
        text: "댓글 삭제 중 문제가 발생했습니다.",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const handleReplySubmit = async (parent_id: string) => {
    if (!accessToken) {
      Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다",
        text: "이 기능을 이용하려면 로그인해주세요.",
        confirmButtonColor: "#f97316",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!replyText.trim()) return; // ✅ 여기 수정!!

    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          post_id: selectedPostData.post_id,
          comment_id: `C${Date.now()}`,
          user_id: userId,
          user_name: user?.name || "익명 사용자",
          comment_text: replyText.trim(), // ✅ replyText로 변경
          parent_comment_id: parent_id,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setComments((prev) => [...prev, json.data]);
        setReplyText(""); // ✅ replyText 초기화
        setReplyTo(null);

        // ✅ 댓글 수 갱신
        setSelectedPostData((prev: any) =>
          prev
            ? {
                ...prev,
                post_comment_count: (prev.post_comment_count || 0) + 1,
              }
            : prev
        );

        setPostList((prevList) =>
          prevList.map((p) =>
            p.post_id === selectedPostData.post_id
              ? { ...p, post_comment_count: (p.post_comment_count || 0) + 1 }
              : p
          )
        );
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "대댓글 작성 실패",
        text: "답글 작성 중 문제가 발생했습니다.",
        confirmButtonColor: "#f97316",
      });
    }
  };

  // ✅ 부모-자식 구조로 댓글 계층화
  const buildCommentTree = (comments: any[]) => {
    const map: Record<string, any> = {};
    const roots: any[] = [];

    comments.forEach((c) => {
      map[c.comment_id] = { ...c, replies: [] };
    });

    comments.forEach((c) => {
      if (c.parent_comment_id) {
        if (map[c.parent_comment_id]) {
          map[c.parent_comment_id].replies.push(map[c.comment_id]);
        }
      } else {
        roots.push(map[c.comment_id]);
      }
    });

    return roots;
  };

  const commentTree = buildCommentTree(comments);

  // ✅ 댓글 렌더링 재귀 함수
  const renderComments = (commentList: any[]): React.ReactNode =>
    commentList.map((c) => (
      <div
        key={c.comment_id}
        className={`flex gap-3 ${c.parent_comment_id ? "ml-10" : ""}`}
      >
        {/* 프로필 */}
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs">👤</span>
        </div>

        {/* 댓글 본문 */}
        <div className="flex-1">
          <div className="bg-[#2A2B30] rounded-2xl px-4 py-3 relative">
            {/* 상단: 이름 + 수정/삭제 버튼 */}
            <div className="flex justify-between items-start">
              <div className="font-semibold text-sm text-white">
                {c.user_name || "익명 사용자"}
              </div>

              {/* 수정/삭제 버튼 → 오른쪽 상단 */}
              {userId === c.user_id && (
                <div className="flex gap-3 text-xs text-gray-400">
                  <button
                    onClick={() => {
                      setEditingCommentId(c.comment_id);
                      setEditText(c.comment_text);
                    }}
                    className="hover:text-orange-400 transition"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteComment(c.comment_id)}
                    className="hover:text-red-400 transition"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {/* 본문 or 수정 중 입력창 */}
            {editingCommentId === c.comment_id ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // 폼 리렌더 방지
                      handleEditComment(c); // ✅ 수정: 이 댓글을 저장
                    }
                  }}
                  className="flex-1 bg-[#1E1F23] text-white px-3 py-1 rounded outline-none"
                  placeholder="댓글을 수정하세요..."
                />
                <button
                  onClick={() => handleEditComment(c)}
                  className="text-orange-500 text-sm hover:text-orange-400 transition"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditingCommentId(null)}
                  className="text-gray-400 text-sm hover:text-gray-300 transition"
                >
                  취소
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-300 mt-1">{c.comment_text}</p>
            )}

            {/* 하단: 답글 / 시간 */}
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <button
                onClick={() => {
                  if (!accessToken) {
                    Swal.fire({
                      icon: "warning",
                      title: "로그인이 필요합니다",
                      text: "이 기능을 이용하려면 로그인해주세요.",
                      confirmButtonColor: "#f97316",
                      confirmButtonText: "확인",
                    });
                    return;
                  }
                  setReplyTo(c.comment_id);
                  setReplyText("");
                }}
                className="hover:text-orange-400 transition"
              >
                답글
              </button>
              <span>{dayjs(c.comment_created).fromNow()}</span>
            </div>
          </div>

          {/* ✅ 답글 입력창 (배경 경계 추가됨) */}
          {replyTo === c.comment_id && (
            <div className="mt-3 ml-10">
              <div className="bg-[#1F2024] rounded-2xl p-3 border border-gray-700 shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">👤</span>
                  </div>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleReplySubmit(c.comment_id); // ✅ 수정: 답글용 함수 호출
                      }
                    }}
                    placeholder="답글을 입력하세요..."
                    className="flex-1 bg-[#2A2B30] text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <button
                    onClick={() => handleReplySubmit(c.comment_id)}
                    className="text-orange-500 text-sm font-semibold hover:text-orange-400 transition"
                  >
                    게시
                  </button>
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setReplyText("");
                    }}
                    className="text-gray-400 text-sm hover:text-gray-300 transition"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 자식 댓글 재귀 */}
          {c.replies?.length > 0 && (
            <div className="ml-8 mt-3 space-y-2">
              {renderComments(c.replies)}
            </div>
          )}
        </div>
      </div>
    ));

  const handleEditPost = (post: any) => {
    // 수정 페이지 이동 (state로 게시글 정보 넘김)
    navigate(`/edit-post/${post.post_id}`, { state: post });
  };

  const handleDeletePost = async (post_id: string) => {
    if (!accessToken) {
      Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다",
        text: "이 기능을 이용하려면 로그인해주세요.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    const result = await Swal.fire({
      title: "게시글 삭제",
      text: "정말로 이 게시글을 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/posts/${post_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();

      if (json.success) {
        setPostList((prev) => prev.filter((p) => p.post_id !== post_id));
        if (selectedPostData?.post_id === post_id) setSelectedPostData(null);

        Swal.fire({
          icon: "success",
          title: "삭제 완료",
          text: "게시글이 삭제되었습니다.",
          confirmButtonColor: "#f97316",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "삭제 실패",
          text: json.message || "게시글 삭제에 실패했습니다.",
          confirmButtonColor: "#f97316",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "삭제 실패",
        text: "게시글 삭제 중 오류가 발생했습니다.",
        confirmButtonColor: "#f97316",
      });
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
                        {post.user_name || "FitAI 사용자"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(post.post_created).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* ⋯ 버튼 + 토글 메뉴 */}
                  <div className="relative">
                    <button
                      className="text-gray-400 text-xl hover:text-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenPostId(
                          menuOpenPostId === post.post_id ? null : post.post_id
                        );
                      }}
                    >
                      ⋯
                    </button>

                    {menuOpenPostId === post.post_id && (
                      <div className="absolute right-0 mt-2 w-32 bg-[#2A2B30] border border-gray-700 rounded-lg shadow-lg z-20">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenPostId(null);
                            handleEditPost(post);
                          }}
                        >
                          ✏️ 게시글 수정
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenPostId(null);
                            handleDeletePost(post.post_id);
                          }}
                        >
                          🗑️ 게시글 삭제
                        </button>
                      </div>
                    )}
                  </div>
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

                {/* 댓글 수 */}
                <div className="px-4 py-2 text-xs text-gray-400">
                  <span>{post.post_comment_count || 0}개의 댓글</span>
                </div>

                {/* 좋아요 / 댓글 / 공유 */}
                <div
                  className="flex items-center justify-around py-1 border-t border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 좋아요 */}
                  <button
                    className={`flex flex-col items-center gap-1 transition cursor-pointer ${
                      likedPosts[post.post_id]
                        ? "text-red-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    style={{ padding: "8px 16px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLike(post);
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill={likedPosts[post.post_id] ? "currentColor" : "none"}
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
                    <span className="text-xs">{post.post_like_count || 0}</span>
                  </button>
                  {/* 댓글 (상세보기 이동) */}
                  <button
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition cursor-pointer"
                    style={{ padding: "8px 16px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openPostDetail(post);
                    }}
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
                    <span className="text-xs">
                      {post.post_comment_count || 0}
                    </span>
                  </button>

                  {/* 공유 */}
                  <button
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition cursor-pointer"
                    style={{ padding: "8px 16px" }}
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
        <button
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition cursor-pointer"
          onClick={() => navigate("/create-post")}
        >
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

      {/* 상세보기 모달 (기존 유지) */}
      {selectedPostData && (
        <div className="fixed inset-0 bg-[#1E1F23] z-50 overflow-y-auto flex flex-col">
          <div className="bg-[#1E1F23] border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-8 h-18 flex items-center">
              <button
                onClick={() => setSelectedPostData(null)}
                className="text-white hover:text-orange-500 transition flex items-center gap-2 cursor-pointer"
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
                        {selectedPostData.user_name || "FitAI 사용자"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(
                          selectedPostData.post_created
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* ⋯ 버튼 + 메뉴 */}
                  <div className="relative">
                    <button
                      className="text-gray-400 text-xl hover:text-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenPostId(
                          menuOpenPostId === selectedPostData.post_id
                            ? null
                            : selectedPostData.post_id
                        );
                      }}
                    >
                      ⋯
                    </button>

                    {menuOpenPostId === selectedPostData.post_id && (
                      <div className="absolute right-0 mt-2 w-32 bg-[#2A2B30] border border-gray-700 rounded-lg shadow-lg z-20">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenPostId(null);
                            handleEditPost(selectedPostData);
                          }}
                        >
                          ✏️ 게시글 수정
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenPostId(null);
                            handleDeletePost(selectedPostData.post_id);
                          }}
                        >
                          🗑️ 게시글 삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 내용 */}
                <div className="px-4 pb-3">
                  <p className="text-sm text-white">
                    {selectedPostData.post_text}
                  </p>
                </div>

                {/* 이미지 */}
                {selectedPostData.post_image_url && (
                  <div className="bg-gray-700 h-96 flex items-center justify-center text-gray-500">
                    <img
                      src={selectedPostData.post_image_url}
                      alt="게시물 이미지"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                {/* 댓글 수 */}
                <div className="px-4 py-2 text-xs text-gray-400">
                  <span>{comments.length}개의 댓글</span>
                </div>

                {/* 좋아요 / 댓글 / 공유 버튼 */}
                <div className="flex items-center justify-around py-1 border-t border-gray-700">
                  {/* 좋아요 */}
                  <button
                    className={`flex items-center gap-2 transition cursor-pointer ${
                      likedPosts[selectedPostData.post_id]
                        ? "text-red-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    style={{ padding: "8px 16px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLike(selectedPostData);
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill={
                        likedPosts[selectedPostData.post_id]
                          ? "currentColor"
                          : "none"
                      }
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
                    <span className="text-xs">
                      {selectedPostData.post_like_count || 0}
                    </span>
                  </button>

                  {/* 댓글 버튼 (디자인 통일, 클릭 시 이동 없음) */}
                  <button
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition cursor-pointer"
                    style={{ padding: "8px 16px" }}
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
                    <span className="text-xs">
                      {selectedPostData.post_comment_count || 0}
                    </span>
                  </button>

                  {/* 공유 버튼 */}
                  <button
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition cursor-pointer"
                    style={{ padding: "8px 16px" }}
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
                    <span className="text-xs">
                      {selectedPostData.shareCount || 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* 댓글 섹션 */}
              <div className="mt-4 px-4">
                <h3 className="text-lg font-semibold mb-4 text-white">댓글</h3>
                <div className="space-y-4">
                  {commentTree.length > 0 ? (
                    renderComments(commentTree)
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // ✅ 폼 제출/리렌더 방지
                    handleAddComment();
                  }
                }}
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
