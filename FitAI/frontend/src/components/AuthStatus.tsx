import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";

const AuthStatus: React.FC = () => {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState(auth.user?.profile.name);

  useEffect(() => {
    // ✅ 로컬 스토리지에 저장된 이름 불러오기
    const savedName = localStorage.getItem("userName");
    if (savedName) setDisplayName(savedName);
    else if (auth.user?.profile.name) setDisplayName(auth.user.profile.name);
  }, [auth.user]);

  if (auth.isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/MyPage"
          className="text-sm text-gray-100 hover:text-orange-500 transition"
        >
          👋 {displayName} 님
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={() => auth.signinRedirect()}
      className="text-white text-sm hover:text-orange-500 transition"
    >
      로그인
    </button>
  );
};

export default AuthStatus;
