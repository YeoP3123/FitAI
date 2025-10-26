import React from "react";
import { Link } from "react-router-dom";
import AuthStatus from "./AuthStatus"; // ✅ 로그인/로그아웃 담당 컴포넌트

const Header: React.FC = () => {
  return (
    <header className="bg-[#1E1F23] h-18 flex items-center justify-between px-8">
      {/* 로고 */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-white">FitAI</span>
      </div>

<<<<<<< HEAD
      {/* 네비게이션 */}
      <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
        <a href="#" className="text-white hover:text-orange-500 transition">운동</a>
        <a href="#" className="text-white hover:text-orange-500 transition">자세교정</a>
        <Link to="/community" className="text-white hover:text-orange-500 transition">커뮤니티</Link>
        <a href="#" className="text-white hover:text-orange-500 transition">내 기록</a>
      </nav>
=======
        {/* 가운데 메뉴 */}
        <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
          <a href="#" className="text-white hover:text-orange-500 transition">운동</a>
          <a href="#" className="text-white hover:text-orange-500 transition">자세교정</a>
          <Link to="/community" className="text-white hover:text-orange-500 transition">커뮤니티</Link>
          <a href="#" className="text-white hover:text-orange-500 transition">내 기록</a>
        </nav>
>>>>>>> 756c521c6e38904e672fe675047b495c87ef23fd

      {/* 로그인/로그아웃 + 시작하기 */}
      <div className="flex items-center space-x-4">
        <AuthStatus /> {/* ✅ 로그인/로그아웃 상태 표시 */}
        <button
          onClick={() => window.location.href = "/start"} // “시작하기” 동작 (필요 시 라우팅 변경 가능)
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition"
        >
          시작하기
        </button>
      </div>
    </header>
  );
};

export default Header;
