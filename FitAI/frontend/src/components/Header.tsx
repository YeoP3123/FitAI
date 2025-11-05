import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthStatus from "./AuthStatus";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 열기/닫기 토글
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // 링크 클릭 시 메뉴 자동 닫기
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="bg-[#1E1F23] h-18 flex items-center justify-between px-8">
        {/* 왼쪽 로고 */}
        <Link to="/" className="flex items-center space-x-3">
    <header className="bg-[#1E1F23] h-18 px-6 md:px-8 flex items-center justify-center relative z-50">
      {/* 1️⃣ 로고 (왼쪽 고정) */}
      <div className="absolute left-6 md:left-8 flex items-center space-x-3">
        <Link
          to="/"
          className="flex items-center space-x-3 hover:opacity-90 transition"
          onClick={closeMenu}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">FitAI</span>
        </Link>

        {/* 가운데 메뉴 */}
        <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
          <Link to="/exercise" className="text-white hover:text-orange-500 transition">운동</Link>
          <Link to="/posture" className="text-white hover:text-orange-500 transition">자세교정</Link>
          <Link to="/community" className="text-white hover:text-orange-500 transition">커뮤니티</Link>
          <Link to="/profile" className="text-white hover:text-orange-500 transition">내 기록</Link>        
        </nav>

        {/* 오른쪽 로그인 / 시작하기 */}
        <div className="flex items-center space-x-4">
          <button onClick={() => setModal("login")} className="text-white text-sm hover:text-orange-500 transition">
            로그인
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition">
      </div>

      {/* 2️⃣ 메뉴 (가운데 - 큰 화면에서만 보임) */}
      <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
        <a href="#" className="text-white hover:text-orange-500 transition">
          운동
        </a>
        <a href="#" className="text-white hover:text-orange-500 transition">
          자세교정
        </a>
        <Link
          to="/community"
          className="text-white hover:text-orange-500 transition"
        >
          커뮤니티
        </Link>
        <a href="#" className="text-white hover:text-orange-500 transition">
          내 기록
        </a>
      </nav>

      {/* 3️⃣ 로그인/시작하기 (오른쪽 고정) */}
      <div className="absolute right-6 md:right-8 flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-4">
          <AuthStatus />
          <button
            onClick={() => (window.location.href = "/start")}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition cursor-pointer active:scale-95"
          >
            시작하기
          </button>
        </div>

        {/* 4️⃣ 모바일 메뉴 버튼 (햄버거 아이콘) */}
        <button
          onClick={toggleMenu}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            // 닫기 아이콘 (X)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // 햄버거 아이콘 (☰)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* 5️⃣ 모바일 사이드바 메뉴 */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#1E1F23] shadow-lg transform ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full py-8 px-6 space-y-8">
          {/* 닫기 버튼 */}
          <button
            onClick={toggleMenu}
            className="self-end text-gray-400 hover:text-orange-400"
          >
            ✕
          </button>

          {/* 메뉴 항목 */}
          <nav className="flex flex-col space-y-6 text-lg font-medium">
            <a
              href="#"
              onClick={closeMenu}
              className="text-white hover:text-orange-500 transition"
            >
              운동
            </a>
            <a
              href="#"
              onClick={closeMenu}
              className="text-white hover:text-orange-500 transition"
            >
              자세교정
            </a>
            <Link
              to="/community"
              onClick={closeMenu}
              className="text-white hover:text-orange-500 transition"
            >
              커뮤니티
            </Link>
            <a
              href="#"
              onClick={closeMenu}
              className="text-white hover:text-orange-500 transition"
            >
              내 기록
            </a>
          </nav>

          {/* 로그인 / 시작하기 버튼 */}
          <div className="mt-auto pt-10 border-t border-gray-700 flex flex-col space-y-4">
            <AuthStatus />
            <button
              onClick={() => {
                closeMenu();
                window.location.href = "/start";
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition cursor-pointer active:scale-95"
            >
              시작하기
            </button>
          </div>
        </div>
      </div>

      {/* 6️⃣ 사이드바 열릴 때 배경 블러 효과 */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-30"
          onClick={closeMenu}
        />
      )}
    </header>
  );
};

export default Header;