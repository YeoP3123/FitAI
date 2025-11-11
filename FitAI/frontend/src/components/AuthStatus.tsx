"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";

const AuthStatus: React.FC = () => {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    // ✅ 로그인 시 최초 1회만 이름 설정
    if (auth.isAuthenticated && auth.user?.profile?.name) {
      setDisplayName(auth.user.profile.name);
    }
  }, [auth.isAuthenticated, auth.user?.profile?.name]);

  // ✅ 로그인 상태
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

  // ✅ 비로그인 상태
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
