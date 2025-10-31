"use client";
import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-[#1E1F23] text-gray-200 font-['Inter'] min-h-screen px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-orange-500 text-center">
          개인정보 처리방침
        </h1>

        <p className="text-sm text-gray-400 mb-10 text-center">
          시행일자: <span className="text-gray-300 font-medium">2025년 10월 31일</span>
        </p>

        <section className="space-y-10 text-lg leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">1. 개인정보의 수집 및 이용 목적</h2>
            <p>FitAI는 다음의 목적을 위하여 개인정보를 수집·이용합니다.</p>
            <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-300">
              <li>회원 관리 및 로그인 인증 (AWS Cognito 사용)</li>
              <li>AI 운동 분석 서비스 제공 (영상 및 자세 분석)</li>
              <li>서비스 품질 향상 및 맞춤형 피드백 제공</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">2. 수집하는 개인정보 항목</h2>
            <table className="w-full border border-gray-700 text-gray-300 text-sm md:text-base">
              <thead className="bg-[#2A2B30] text-orange-400">
                <tr>
                  <th className="border border-gray-700 p-3">구분</th>
                  <th className="border border-gray-700 p-3">수집 항목</th>
                  <th className="border border-gray-700 p-3">수집 목적</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-700 p-3">필수</td>
                  <td className="border border-gray-700 p-3">이름, 이메일</td>
                  <td className="border border-gray-700 p-3">회원 식별 및 로그인 인증</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 p-3">선택</td>
                  <td className="border border-gray-700 p-3">운동 데이터, 이미지, 영상</td>
                  <td className="border border-gray-700 p-3">AI 운동 분석 및 개인 맞춤 피드백</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">3. 개인정보의 보유 및 이용 기간</h2>
            <p>
              FitAI는 개인정보의 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 서비스 운영 및 분석을 위해 다음과 같이 일정 기간 동안 보관할 수 있습니다.
            </p>
            <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-300">
              <li>회원 정보 (이름, 이메일): 1년</li>
              <li>운동 데이터, 이미지·영상 데이터: 6개월</li>
              <li>로그 데이터: 3개월</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">4. 개인정보의 제3자 제공</h2>
            <p>
              FitAI는 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
              단, 법령에 따라 수사기관이 정당한 절차를 거쳐 요청하는 경우는 예외로 합니다.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">5. 개인정보의 처리 위탁</h2>
            <p>
              FitAI는 개인정보 처리를 외부에 위탁하지 않습니다. 다만 서비스 운영을 위한 클라우드 인프라 제공(AWS)은 예외로 하며,
              AWS는 국제 보안 인증(ISO 27001, ISO 27701 등)을 취득한 환경에서 데이터를 관리합니다.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">6. 개인정보의 안전성 확보 조치</h2>
            <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-300">
              <li>암호화 저장(AWS Cognito, S3), 접근 통제</li>
              <li>개발 환경 내 접근 권한 최소화</li>
              <li>클라우드 기반 보안 및 백업 시스템 운영</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">7. 이용자의 권리 및 행사 방법</h2>
            <p>
              이용자는 본인의 개인정보에 대해 열람, 수정, 삭제를 요청할 수 있으며 FitAI는 지체 없이 이에 응합니다.
              삭제된 개인정보는 복구되지 않습니다.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">8. 개인정보 처리방침의 변경</h2>
            <p>법령·정책·보안기술 변경 시 수정될 수 있으며, 변경 시 웹사이트를 통해 공지됩니다.</p>
          </div>
        </section>

        <p className="mt-20 text-center text-sm text-gray-500">본 방침은 2025년 10월 31일부터 시행됩니다.</p>

        <div className="text-center mt-10">
          <Link to="/" className="text-orange-500 hover:underline hover:text-orange-400 transition">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
