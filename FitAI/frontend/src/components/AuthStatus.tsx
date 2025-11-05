"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";

const AuthStatus: React.FC = () => {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    // ✅ 프로필 최신화 시도 (로그인 상태일 때만)
    const refreshProfile = async () => {
      if (auth.isAuthenticated) {
        try {
          await auth.signinSilent(); // 새 토큰 요청 및 프로필 갱신
        } catch (e) {
          console.warn("프로필 갱신 실패:", e);
        }
      }
    };

    refreshProfile();

    if (auth.user?.profile?.name) {
      setDisplayName(auth.user.profile.name);
    }
  }, [auth.user, auth.isAuthenticated]);

  if (auth.isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/MyPage"
          className="text-sm text-gray-100 hover:text-orange-500 transition"
        >
          👋 {displayName || "사용자"} 님
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={() => auth.signinRedirect()}
      className="text-white text-sm hover:text-orange-500 transition cursor-pointer"
    >
      로그인
    </button>
  );
};

export default AuthStatus;
