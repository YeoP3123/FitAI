import { useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const API_BASE = import.meta.env.VITE_API_URL;

function EditPost() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { state } = useLocation();
  const auth = useAuth();

  // ✅ 로그인 사용자 정보
  const accessToken = auth.user?.access_token;
  const userId = auth.user?.profile.sub;
  const userName = auth.user?.profile.name || "익명 사용자";

  // ✅ 기존 게시글 상태
  const [title, setTitle] = useState(state?.post_title || "");
  const [content, setContent] = useState(state?.post_text || "");
  const [existingImage, setExistingImage] = useState(state?.post_image_url || null);
  const [originalImageUrl] = useState(state?.post_image_url || null); // 삭제 체크용 원본 URL
  const [shouldDeleteOldImage, setShouldDeleteOldImage] = useState(false);

  // ✅ 새 이미지 업로드 관련 상태
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropRef = useRef<HTMLDivElement | null>(null);

  // ✅ 이미지 선택 / 드래그 처리
  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // ✅ 삭제 버튼 클릭 (즉시 삭제 ❌, 수정 완료 시 삭제)
  const handleRemoveExistingImage = async () => {
    const result = await Swal.fire({
      title: "이미지 삭제",
      text: "이 이미지를 삭제하시겠습니까? 수정 완료 시 반영됩니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff5a1f",
      cancelButtonColor: "#555",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (result.isConfirmed) {
      setExistingImage(null);
      setShouldDeleteOldImage(true);
      Swal.fire({
        icon: "success",
        title: "삭제 예정",
        text: "이미지는 수정 완료 시 실제로 삭제됩니다.",
        confirmButtonColor: "#ff5a1f",
      });
    }
  };

  // ✅ S3 업로드
  const uploadImageToS3 = async (file: File): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error("Presigned URL 발급 실패");

      const { uploadURL, fileURL } = json;

      const formData = new FormData();
      Object.entries(uploadURL.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);

      const uploadRes = await fetch(uploadURL.url, {
        method: "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        console.log("✅ S3 업로드 완료:", fileURL);
        return fileURL;
      } else {
        throw new Error("S3 업로드 실패");
      }
    } catch (err) {
      console.error("❌ 이미지 업로드 실패:", err);
      Swal.fire({
        icon: "error",
        title: "이미지 업로드 실패",
        text: "이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.",
        confirmButtonColor: "#ff5a1f",
      });
      return null;
    }
  };

  // ✅ 게시글 수정
  const handleUpdate = async () => {
    if (!auth.isAuthenticated) {
      Swal.fire({
        icon: "warning",
        title: "로그인 필요",
        text: "로그인 후 이용할 수 있습니다.",
        confirmButtonColor: "#ff5a1f",
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      Swal.fire({
        icon: "warning",
        title: "입력 오류",
        text: "제목과 내용을 모두 입력해주세요.",
        confirmButtonColor: "#ff5a1f",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      Swal.fire({
        title: "게시글 수정 중...",
        text: "잠시만 기다려주세요.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      let imageUrl = existingImage;

      // ✅ 1️⃣ 삭제 예정 이미지가 있다면 수정 시점에 실제 삭제
      if (shouldDeleteOldImage && originalImageUrl) {
        try {
          await fetch(`${API_BASE}/delete-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ image_url: originalImageUrl }),
          });
          console.log("🗑️ 기존 이미지 삭제 완료");
        } catch (err) {
          console.error("❌ 기존 이미지 삭제 실패:", err);
        }
      }

      // ✅ 2️⃣ 새 이미지 업로드
      if (imageFile) {
        if (existingImage && !shouldDeleteOldImage) {
          try {
            await fetch(`${API_BASE}/delete-image`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ image_url: existingImage }),
            });
            console.log("🗑️ 기존 이미지 자동 삭제 완료 (새 이미지 업로드 전)");
          } catch (err) {
            console.error("❌ 기존 이미지 자동 삭제 실패:", err);
          }
        }

        imageUrl = await uploadImageToS3(imageFile);
        if (!imageUrl) {
          setIsSubmitting(false);
          Swal.close();
          return;
        }
      }

      // ✅ 3️⃣ 최종 수정 요청
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          post_title: title,
          post_text: content,
          post_image_url: imageUrl,
          user_id: userId,
          user_name: userName,
        }),
      });

      const json = await res.json();
      Swal.close();

      if (json.success) {
        await Swal.fire({
          icon: "success",
          title: "수정 완료",
          text: "게시글이 성공적으로 수정되었습니다!",
          confirmButtonColor: "#ff5a1f",
        });
        navigate("/community");
      } else {
        Swal.fire({
          icon: "error",
          title: "수정 실패",
          text: "게시글 수정에 실패했습니다. 다시 시도해주세요.",
          confirmButtonColor: "#ff5a1f",
        });
      }
    } catch (err) {
      console.error("게시글 수정 실패:", err);
      Swal.fire({
        icon: "error",
        title: "에러 발생",
        text: "게시글 수정 중 문제가 발생했습니다. 다시 시도해주세요.",
        confirmButtonColor: "#ff5a1f",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1E1F23] min-h-screen text-white pb-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>

        {!auth.isAuthenticated ? (
          <div className="text-gray-400">로그인이 필요합니다.</div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
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

              {/* 기존 이미지 */}
              {existingImage && (
                <div>
                  <label className="block mb-2 text-gray-400 text-sm">
                    기존 이미지
                  </label>
                  <div className="relative w-full flex justify-center">
                    <img
                      src={existingImage}
                      alt="기존 이미지"
                      className="max-h-60 rounded-lg border border-gray-600 object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveExistingImage}
                      className="absolute top-2 right-2 bg-black/60 text-sm text-red-400 hover:text-red-500 px-2 py-1 rounded"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}

              {/* 새 이미지 업로드 */}
              <div>
                <label className="block mb-2 text-gray-400 text-sm">
                  새 이미지 업로드 (선택)
                </label>

                <div
                  ref={dropRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition cursor-pointer
                    ${
                      isDragging
                        ? "border-orange-400 bg-[#2A2B30]/50"
                        : "border-gray-600 bg-[#2A2B30]"
                    } hover:border-orange-500`}
                  onClick={() =>
                    dropRef.current
                      ?.querySelector<HTMLInputElement>("#imageInput")
                      ?.click()
                  }
                >
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {imageFile ? (
                    <div className="text-gray-300 text-sm flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-orange-400"
                      >
                        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM6 12l4 4 8-8-1.5-1.5L10 13l-2.5-2.5L6 12z" />
                      </svg>
                      {imageFile.name}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="w-7 h-7 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 16v-4m0 0V8m0 4h4m-4 0H8m-2 4v2a2 2 0 002 2h8a2 2 0 002-2v-2m-2-8a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 012-2h12z"
                        />
                      </svg>
                      <p>이미지를 여기에 드롭하거나 클릭하여 업로드</p>
                    </div>
                  )}
                </div>

                {/* 미리보기 */}
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="max-h-64 rounded-lg border border-gray-600 shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() =>
                    Swal.fire({
                      title: "수정 취소",
                      text: "수정을 취소하시겠습니까?",
                      icon: "question",
                      showCancelButton: true,
                      confirmButtonText: "예, 취소합니다",
                      cancelButtonText: "아니요",
                      confirmButtonColor: "#ff5a1f",
                      cancelButtonColor: "#555",
                    }).then((result) => {
                      if (result.isConfirmed) navigate("/community");
                    })
                  }
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
                  {isSubmitting ? "수정 중..." : "수정 완료"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditPost;
