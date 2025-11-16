"use client";
import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#1E1F23] text-white font-['Inter']">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          <span className="text-orange-500">AI와 함께하는</span>
          <br />
          <span className="text-white">완벽한 홈트</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
          웹캠만으로 실시간 자세 분석부터 개인 맞춤 운동까지. <br />
          언제 어디서나 퍼스널 트레이너가 함께합니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/exercise")}
            className="bg-gradient-to-r from-orange-500 to-red-500 px-10 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition"
          >
            지금 시작하기
          </button>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8 mt-20 max-w-4xl">
          {[
            { number: "95%", label: "자세 정확도" },
            { number: "24/7", label: "언제든지" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-1">
                {stat.number}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 운동 모드 섹션 */}
      <section className="py-24 px-6 bg-[#1E1F23]">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-orange-500">
            운동의 새로운 경험
          </h2>
          <p className="text-lg text-gray-400">
            AI 기술로 완전히 새로워진 홈트레이닝을 경험해보세요.
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
          {/* 운동 모드 */}
          <div className="bg-[#2A2B30] p-10 rounded-3xl border border-gray-700 hover:bg-gray-750 transition">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">운동 모드</h3>
            <p className="text-gray-300 mb-6">
              AI가 실시간으로 자세를 분석해 완벽한 운동을 도와드려요.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-orange-500 font-semibold">6가지 운동</span>
              <button
                onClick={() => navigate("/exercise")}
                className="px-6 py-2 bg-white/10 rounded-lg hover:bg-orange-500/30 transition"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center bg-[#1E1F23]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-orange-500">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg text-gray-300 mb-10">
            회원가입 후 바로 AI 트레이너와 함께 운동을 시작할 수 있어요. <br />
            첫 달은 완전 무료입니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/exercise")}
              className="bg-gradient-to-r from-orange-500 to-red-500 px-10 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition"
            >
              무료로 시작하기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
