import React, { useEffect } from "react";
import { useAuth } from "react-oidc-context";

const AuthStatus: React.FC = () => {
  const auth = useAuth();

const isDev = window.location.hostname === "localhost";

useEffect(() => {
    if (auth.isAuthenticated && auth.user?.profile) {
      console.log("✅ 사용자 프로필 정보:", auth.user.profile);
    }
  }, [auth.isAuthenticated, auth.user]);

const signOutRedirect = () => {
  auth.removeUser();
  const clientId = "4ms22p52tnirk6qric8oq420j1";
  const logoutUri = isDev
    ? "http://localhost:5173/"
    : "https://main.dka06770r9jf2.amplifyapp.com/";
  const cognitoDomain = "https://ap-northeast-2mzuhxhxiv.auth.ap-northeast-2.amazoncognito.com";
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};



  // ✅ 로그인 상태
  if (auth.isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-100">👋 {auth.user?.profile.name} 님</span>
        <button
          onClick={signOutRedirect}
          className="text-white text-sm hover:text-orange-500 transition"
        >
          로그아웃
        </button>
      </div>
    );
  }

  // ✅ 비로그인 상태
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
