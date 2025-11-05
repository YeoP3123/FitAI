import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  // ✅ 로고 클릭 시 홈으로 이동 + 맨 위로 스크롤
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 기본 링크 이동 막고
    navigate("/"); // 홈으로 이동
    window.scrollTo({ top: 0, behavior: "smooth" }); // 스크롤 맨 위로 부드럽게 이동
  };

  return (
    <footer className="bg-[#1E1F23] text-gray-400 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 상단 영역: 로고 + 링크 */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          {/* 왼쪽 로고 */}
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center space-x-3 mb-6 md:mb-0 hover:opacity-90 transition"
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
            <span className="text-lg font-semibold text-white">FitAI</span>
          </a>

          {/* 오른쪽 링크 */}
          <div className="flex space-x-8 text-sm">
            <Link
              to="/privacy-policy"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="text-sm text-gray-400 hover:text-orange-400"
            >
              개인정보 처리방침
            </Link>
            <Link
              to="/terms-of-service"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="hover:text-orange-400"
            >
              이용약관
            </Link>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © 2025 FitAI. 모든 권리 보유.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
