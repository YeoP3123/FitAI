import React from "react";

const Header: React.FC = () => {
  return (
    <header className="relative z-50 px-6 py-4">
      <nav className="flex items-center justify-between max-w-7xl mx-auto animate-on-load">
        {/* 로고 */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center animate-glow">
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
          <span className="text-2xl font-bold">FitAI</span>
        </div>

        {/* 네비게이션 메뉴 */}
        <div className="hidden md:flex items-center space-x-8">
          {["운동", "자세교정", "커뮤니티", "내 기록"].map((menu, idx) => (
            <a
              key={idx}
              href="#"
              className="hover:text-orange-500 transition-colors duration-300 relative group"
            >
              {menu}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* 버튼 영역 */}
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm font-medium hover:text-orange-500 transition-colors duration-300">
            로그인
          </button>
          <button className="btn-primary px-6 py-2 rounded-full text-sm font-medium text-white">
            시작하기
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
