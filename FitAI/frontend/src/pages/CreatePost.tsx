import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";

const API_BASE = import.meta.env.VITE_API_URL;

function CreatePost() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Cognito 로그인 유저 정보
  const accessToken = auth.user?.access_token;
  const userId = auth.user?.profile.sub; // Cognito user_id
  const userName = auth.user?.profile.name || "익명 사용자";

  // ✅ 게시글 작성 요청
  const handleSubmit = async () => {
    if (!auth.isAuthenticated) {
      alert("로그인 후 이용할 수 있습니다.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const postId = "POST" + Date.now();

      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // ✅ 인증 헤더 추가
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          user_name: userName,
          post_title: title,
          post_text: content,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert("✅ 게시글이 등록되었습니다!");
        navigate("/community");
      } else {
        alert("❌ 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error("❌ 게시글 등록 실패:", err);
      alert("에러가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1E1F23] min-h-screen text-white pb-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-6">게시글 작성</h1>

        {/* ✅ 로그인 확인 */}
        {!auth.isAuthenticated ? (
          <div className="text-gray-400">
            사용자 정보를 불러오는 중입니다... (로그인이 필요합니다)
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="space-y-6">
              {/* 제목 */}
              <div>
                <label className="block mb-2 text-gray-400 text-sm">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full bg-[#2A2B30] text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block mb-2 text-gray-400 text-sm">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={8}
                  className="w-full bg-[#2A2B30] text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/community")}
                  className="bg-gray-600 px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 transition ${
                    isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "등록 중..." : "등록"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
