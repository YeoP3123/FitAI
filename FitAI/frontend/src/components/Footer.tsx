import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800 py-16 px-6 animate-on-load">
      <div className="max-w-7xl mx-auto">
        {/* 상단 로고 + 메뉴 */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 space-y-6 md:space-y-0">
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

          {/* 메뉴 */}
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              개인정보처리방침
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              이용약관
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              고객지원
            </a>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 FitAI. 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
