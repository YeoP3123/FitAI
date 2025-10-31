"use client";
import React from "react";
import { Link } from "react-router-dom";

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-[#1E1F23] text-gray-200 font-['Inter'] min-h-screen px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-orange-500 text-center">
          이용약관
        </h1>

        <p className="text-sm text-gray-400 mb-10 text-center">
          시행일자: <span className="text-gray-300 font-medium">2025년 10월 31일</span>
        </p>

        <section className="space-y-10 text-lg leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">1. 목적</h2>
            <p>
              본 약관은 FitAI(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항,
              서비스 이용조건과 절차 등 기본적인 사항을 규정함을 목적으로 합니다.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">2. 용어의 정의</h2>
            <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-300">
              <li>“서비스”란 FitAI가 제공하는 인공지능 기반 홈트레이닝 플랫폼을 의미합니다.</li>
              <li>“이용자”란 본 약관에 따라 서비스를 이용하는 개인을 말합니다.</li>
              <li>“회원”이란 AWS Cognito를 통해 로그인하여 서비스를 이용하는 사용자를 의미합니다.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">3. 약관의 효력 및 변경</h2>
            <p>
              본 약관은 서비스를 이용하고자 하는 모든 이용자에게 효력이 발생합니다.
              FitAI는 관련 법령을 위배하지 않는 범위 내에서 약관을 개정할 수 있으며,
              개정된 약관은 공지 후 효력이 발생합니다.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">4. 회원가입 및 계정관리</h2>
            <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-300">
              <li>회원가입은 이용자가 약관과 개인정보처리방침에 동의한 후 절차에 따라 계정을 생성함으로써 성립됩니다.</li>
              <li>회원은 등록정보를 정확하게 입력해야 하며, 허위 정보로 인한 불이익은 본인에게 책임이 있습니다.</li>
              <li>계정은 본인만 사용할 수 있으며, 제3자에게 양도 또는 공유할 수 없습니다.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">5. 서비스의 제공 및 변경</h2>
            <p>
              FitAI는 인공지능 운동 분석, 개인 맞춤 루틴 추천 등 다양한 서비스를 제공합니다.
              서비스 내용은 기술적 필요 또는 정책적 판단에 따라 변경될 수 있으며,
              중요한 변경 시 사전 공지합니다.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">6. 이용자의 의무</h2>
            <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-300">
              <li>이용자는 관련 법령, 본 약관, 서비스 이용 안내사항을 준수해야 합니다.</li>
              <li>타인의 개인정보를 도용하거나 부정한 목적으로 서비스를 이용해서는 안 됩니다.</li>
              <li>서비스의 안정적 운영을 방해하는 행위를 해서는 안 됩니다.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">7. 서비스 이용의 제한</h2>
            <p>
              FitAI는 이용자가 본 약관을 위반하거나, 서비스 운영을 방해하는 경우
              서비스 이용을 제한하거나 회원 자격을 정지할 수 있습니다.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">8. 저작권 및 콘텐츠 관리</h2>
            <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-300">
              <li>서비스 내 콘텐츠(텍스트, 이미지, 영상 등)의 저작권은 FitAI 또는 해당 권리자에게 있습니다.</li>
              <li>이용자는 FitAI의 허락 없이 콘텐츠를 무단으로 복제, 배포, 전송할 수 없습니다.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">9. 면책조항</h2>
            <p>
              FitAI는 천재지변, 서버 장애, 이용자의 과실 등으로 인한 서비스 중단이나 데이터 손실에 대해 책임을 지지 않습니다.
              또한 AI 분석 결과는 참고용이며, 전문 트레이너의 진단을 대체하지 않습니다.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-white">10. 준거법 및 분쟁 해결</h2>
            <p>
              본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련된 분쟁은
              관할 법원(서울중앙지방법원 등)에 제기할 수 있습니다.
            </p>
          </div>
        </section>

        <p className="mt-20 text-center text-sm text-gray-500">
          본 약관은 2025년 10월 31일부터 시행됩니다.
        </p>

        <div className="text-center mt-10">
          <Link
            to="/"
            className="text-orange-500 hover:underline hover:text-orange-400 transition"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
