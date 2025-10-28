"use client";
import React, { useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import Swal from "sweetalert2";
import {
  updateUserAttributes,
  verifyUserAttribute,
  changePassword,
  forgotPassword,
  confirmForgotPassword,
} from "../api/cognito";

// ✅ 사용자 친화적인 에러 메시지 매핑 함수
function getFriendlyErrorMessage(error: any): string {
  const code = error?.code || error?.name || "";
  const msg = error?.message || error?.toString() || "";

  if (code === "NotAuthorizedException" || code === "LimitExceededException")
    return "현재 비밀번호가 올바르지 않습니다. 다시 입력해주세요.";
  if (code === "CodeMismatchException")
    return "입력하신 인증 코드가 올바르지 않습니다. 다시 확인해주세요.";
  if (code === "ExpiredCodeException")
    return "인증 코드가 만료되었습니다. 새 코드를 요청해주세요.";
  if (code === "UserNotFoundException") return "등록되지 않은 사용자입니다.";
  if (code === "InvalidParameterException")
    return "입력값이 올바르지 않습니다. 다시 확인해주세요.";
  if (code === "TooManyRequestsException")
    return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  if (code === "NotAuthorizedException")
    return "권한이 없습니다. 다시 로그인해주세요.";
  if (msg.includes("Access Token does not have required scopes"))
    return "세션이 만료되었습니다. 다시 로그인해주세요.";
  if (msg.includes("Incorrect username or password"))
    return "비밀번호가 올바르지 않습니다.";
  if (msg.includes("Invalid verification code"))
    return "입력하신 인증 코드가 잘못되었습니다. 다시 확인해주세요.";
  if (msg.includes("Invalid code provided"))
    return "인증 코드가 올바르지 않습니다. 새 코드를 요청해주세요.";
  return "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

const MyPage: React.FC = () => {
  const auth = useAuth();
  const isDev = window.location.hostname === "localhost";

  const accessToken = auth.user?.access_token || "";
  const profile = auth.user?.profile;
  const username = useMemo(
    () =>
      (profile && (profile["cognito:username"] as string)) ||
      (profile?.preferred_username as string) ||
      (profile?.email as string) ||
      "",
    [profile]
  );

  const [name, setName] = useState<string>((profile?.name as string) || "");
  const [email, setEmail] = useState<string>((profile?.email as string) || "");
  const [emailCode, setEmailCode] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPw, setResetNewPw] = useState("");

  // ✅ 로그아웃
const handleLogout = async () => {
  try {
    const clientId = "4ms22p52tnirk6qric8oq420j1";
    const logoutUri =
      window.location.hostname === "localhost"
        ? "http://localhost:5173/"
        : "https://main.dka06770r9jf2.amplifyapp.com/";
    const cognitoDomain =
      "https://ap-northeast-2mzuhxhxiv.auth.ap-northeast-2.amazoncognito.com";

    // 1️⃣ OIDC localStorage 세션 제거
    await auth.removeUser();

    // 2️⃣ Cognito 세션 쿠키 제거 및 홈으로 리다이렉트
    window.location.assign(
      `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
        logoutUri
      )}`
    );
  } catch (error) {
    console.error("로그아웃 중 오류:", error);
  }
};



  /** 프로필 저장 */
  const onSaveProfile = async () => {
    if (!accessToken)
      return Swal.fire("로그인 필요", "세션이 만료되었습니다. 다시 로그인해주세요.", "warning");

    const attrs: Record<string, string> = {};
    if (name && name !== profile?.name) attrs["name"] = name;
    if (email && email !== profile?.email) attrs["email"] = email;
    if (Object.keys(attrs).length === 0)
      return Swal.fire("알림", "변경된 항목이 없습니다.", "info");

    try {
      await updateUserAttributes(accessToken, attrs);
      Swal.fire("저장 완료", "변경사항이 저장되었습니다.", "success");

      // ✅ Cognito에서 최신 프로필 재조회
      await auth.signinSilent();
    } catch (e: any) {
      Swal.fire("오류", getFriendlyErrorMessage(e), "error");
    }
  };

  /** 이메일 인증 */
  const onVerifyEmail = async () => {
    if (!accessToken)
      return Swal.fire("로그인 필요", "세션이 만료되었습니다.", "warning");
    if (!emailCode)
      return Swal.fire("입력 필요", "이메일 인증 코드를 입력하세요.", "info");

    try {
      await verifyUserAttribute(accessToken, "email", emailCode);
      Swal.fire("인증 완료", "이메일 인증이 완료되었습니다.", "success");
      await auth.signinSilent(); // ✅ 인증 후 프로필 새로고침
    } catch (e: any) {
      Swal.fire("오류", getFriendlyErrorMessage(e), "error");
    }
  };

  /** 비밀번호 변경 */
  const onChangePassword = async () => {
    if (!accessToken)
      return Swal.fire("로그인 필요", "세션이 만료되었습니다.", "warning");
    if (!oldPw || !newPw)
      return Swal.fire("입력 필요", "현재 비밀번호와 새 비밀번호를 모두 입력하세요.", "info");

    try {
      await changePassword(accessToken, oldPw, newPw);
      Swal.fire("성공", "비밀번호가 변경되었습니다.", "success");
      setOldPw("");
      setNewPw("");
    } catch (e: any) {
      Swal.fire("오류", getFriendlyErrorMessage(e), "error");
    }
  };

  /** 비밀번호 초기화 요청 */
  const onStartResetPassword = async () => {
    if (!username)
      return Swal.fire("오류", "사용자 이름을 확인할 수 없습니다.", "error");

    try {
      await forgotPassword(username);
      Swal.fire(
        "코드 발송",
        "이메일로 인증 코드가 전송되었습니다. 코드를 입력해 새 비밀번호를 설정하세요.",
        "info"
      );
    } catch (e: any) {
      Swal.fire("오류", getFriendlyErrorMessage(e), "error");
    }
  };

  /** 비밀번호 초기화 완료 */
  const onConfirmResetPassword = async () => {
    if (!username)
      return Swal.fire("오류", "사용자 이름을 확인할 수 없습니다.", "error");
    if (!resetCode || !resetNewPw)
      return Swal.fire("입력 필요", "코드와 새 비밀번호를 모두 입력하세요.", "info");

    try {
      await confirmForgotPassword(username, resetCode, resetNewPw);
      Swal.fire("성공", "비밀번호가 초기화되었습니다. 새 비밀번호로 로그인해주세요.", "success");
      setResetCode("");
      setResetNewPw("");
    } catch (e: any) {
      Swal.fire("오류", getFriendlyErrorMessage(e), "error");
    }
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

        {/* 프로필 수정 */}
        <section className="bg-[#2A2B30] border border-gray-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">프로필 수정</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400">이름</label>
              <input
                className="mt-1 w-full bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">이메일</label>
              <input
                className="mt-1 w-full bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={onSaveProfile}
            className="mt-2 w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 rounded-lg font-semibold hover:opacity-90"
          >
            변경 사항 저장
          </button>

          {/* 이메일 인증 */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-2">
              이메일 변경 시 인증 코드를 입력하세요.
            </p>
            <div className="flex gap-2">
              <input
                placeholder="인증 코드 6자리"
                className="flex-1 bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
              />
              <button
                onClick={onVerifyEmail}
                className="bg-white/10 hover:bg-white/20 px-4 rounded-lg"
              >
                인증 완료
              </button>
            </div>
          </div>
        </section>

        {/* 비밀번호 변경/초기화 */}
        <section className="bg-[#2A2B30] border border-gray-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">비밀번호 변경 / 초기화</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400">현재 비밀번호</label>
              <input
                type="password"
                className="mt-1 w-full bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">새 비밀번호</label>
              <input
                type="password"
                className="mt-1 w-full bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={onChangePassword}
            className="w-full md:w-auto bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg"
          >
            비밀번호 변경
          </button>

          <div className="pt-4 border-t border-gray-700 space-y-3">
            <button
              onClick={onStartResetPassword}
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
              <input
                placeholder="새 비밀번호"
                type="password"
                className="bg-[#1E1F23] border border-gray-700 rounded-lg px-4 py-2"
                value={resetNewPw}
                onChange={(e) => setResetNewPw(e.target.value)}
              />
            </div>

            <button
              onClick={onConfirmResetPassword}
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
