import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1E1F23] text-gray-400 py-12 px-8">
      <div className="max-w-7xl mx-auto">
        {/* 상단 영역: 로고 + 링크 */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          {/* 왼쪽 로고 */}
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            </div>
            <span className="text-lg font-semibold text-white">FitAI</span>
          </div>

          {/* 오른쪽 링크 */}
          <div className="flex space-x-8 text-sm">
            <a href="#" className="hover:text-white transition">
              개인정보처리방침
            </a>
            <a href="#" className="hover:text-white transition">
              이용약관
            </a>
            <a href="#" className="hover:text-white transition">
              고객지원
            </a>
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
