import React, { useState } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const Header: React.FC = () => {
  const [modal, setModal] = useState<"login" | "signup" | null>(null);

  return (
    <>
      <header className="bg-[#1E1F23] h-18 flex items-center justify-between px-8">
        {/* 왼쪽 로고 */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">FitAI</span>
        </div>

        {/* 가운데 메뉴 */}
        <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
          <a href="#" className="text-white hover:text-orange-500 transition">운동</a>
          <a href="#" className="text-white hover:text-orange-500 transition">자세교정</a>
          <a href="#" className="text-white hover:text-orange-500 transition">커뮤니티</a>
          <a href="#" className="text-white hover:text-orange-500 transition">내 기록</a>
        </nav>

        {/* 오른쪽 로그인 / 시작하기 */}
        <div className="flex items-center space-x-4">
          <button onClick={() => setModal("login")} className="text-white text-sm hover:text-orange-500 transition">
            로그인
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition">
            시작하기
          </button>
        </div>
      </header>

      {modal === "login" && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToSignup={() => setModal("signup")}
        />
      )}

      {modal === "signup" && (
        <SignupModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </>
  );
};

export default Header;
