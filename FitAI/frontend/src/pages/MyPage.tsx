"use client";
import React, { useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import { useCognitoActions } from "../hooks/useCognitoActions";

const MyPage: React.FC = () => {
  const auth = useAuth();
  const { saveName, saveEmail, verifyEmail, changePw, startResetPw, confirmResetPw } =
    useCognitoActions(auth);

  const profile = auth.user?.profile;
  const username = useMemo(
    () =>
      (profile && (profile["cognito:username"] as string)) ||
      (profile?.preferred_username as string) ||
      (profile?.email as string) ||
      "",
    [profile]
  );

  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [emailCode, setEmailCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [resetCode, setResetCode] = useState("");
  const [resetNewPw, setResetNewPw] = useState("");
  const [showResetPw, setShowResetPw] = useState(false);

// ✅ 완전 로그아웃 (Cognito + OIDC 모두)
const handleLogout = async () => {
  const clientId = "4ms22p52tnirk6qric8oq420j1";
  const logoutUri =
    window.location.hostname === "localhost"
      ? "http://localhost:5173/"
      : "https://main.dka06770r9jf2.amplifyapp.com/";
  const cognitoDomain =
    "https://ap-northeast-2mzuhxhxiv.auth.ap-northeast-2.amazoncognito.com";

  try {
    // 1️⃣ 먼저 OIDC 세션 제거
    await auth.removeUser();

    // 2️⃣ Cognito 세션 완전 종료
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  } catch (error) {
    console.error("❌ 로그아웃 중 오류:", error);
  }
};


  // ✅ 이메일 인증 처리
  const handleVerifyEmail = async () => {
    const verified = await verifyEmail(emailCode);
    if (verified) setEmailVerified(true);
  };

  // ✅ 이메일 저장 (인증 완료 필수)
  const handleSaveEmail = async () => {
    if (!emailVerified) {
      Swal.fire("인증 필요", "이메일 변경 전 인증이 필요합니다.", "warning");
      return;
    }
    await saveEmail(email, profile);
  };

  // ✅ 비밀번호 초기화 완료 시 자동 로그아웃
  const handleConfirmResetPw = async () => {
    const success = await confirmResetPw(username, resetCode, resetNewPw);
    if (success) handleLogout();
  };

  return (
    <div className="min-h-screen bg-[#1E1F23] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-orange-500">마이페이지</h1>
          <button
            onClick={handleLogout}
            className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
          >
            로그아웃
          </button>
        </div>

        {/* ✅ 이름 수정 */}
        <section className="bg-[#2A2B30] border border-gray-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">이름 변경</h2>
          <input
            className="mt-1 w-full bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={() => saveName(name, profile)}
            className="mt-2 w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 rounded-lg font-semibold hover:opacity-90"
          >
            이름 변경
          </button>
        </section>

        {/* ✅ 이메일 변경 */}
        <section className="bg-[#2A2B30] border border-gray-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">이메일 변경</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleSaveEmail}
              className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg"
            >
              인증 코드 발송
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <input
              placeholder="인증 코드 6자리"
              className="flex-1 bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
            />
            <button
              onClick={handleVerifyEmail}
              className="bg-gradient-to-r from-orange-500 to-red-500 px-4 rounded-lg"
            >
              인증 완료
            </button>
          </div>
        </section>

        {/* ✅ 비밀번호 변경 / 초기화 */}
        <section className="bg-[#2A2B30] border border-gray-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">비밀번호 변경 / 초기화</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <input
                type={showOldPw ? "text" : "password"}
                placeholder="현재 비밀번호"
                className="w-full bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2 pr-10"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
              />
              <div
                className="absolute right-3 top-3 cursor-pointer text-gray-400"
                onClick={() => setShowOldPw(!showOldPw)}
              >
                {showOldPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                placeholder="새 비밀번호"
                className="w-full bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2 pr-10"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <div
                className="absolute right-3 top-3 cursor-pointer text-gray-400"
                onClick={() => setShowNewPw(!showNewPw)}
              >
                {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <button
            onClick={() => changePw(oldPw, newPw)}
            className="w-full md:w-auto bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg"
          >
            비밀번호 변경
          </button>

          <div className="pt-4 border-t border-gray-700 space-y-3">
            <button
              onClick={() => startResetPw(username)}
              className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 rounded-lg font-semibold hover:opacity-90"
            >
              초기화 코드 받기
            </button>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                placeholder="인증 코드"
                className="bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
              />
              <div className="relative">
                <input
                  type={showResetPw ? "text" : "password"}
                  placeholder="새 비밀번호"
                  className="w-full bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={resetNewPw}
                  onChange={(e) => setResetNewPw(e.target.value)}
                />
                <div
                  className="absolute right-3 top-3  cursor-pointer text-gray-400 hover:text-white"
                  onClick={() => setShowResetPw(!showResetPw)}
                >
                  {showResetPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmResetPw}
              className="w-full md:w-auto bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg"
            >
              초기화 완료
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyPage;
