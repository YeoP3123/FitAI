import React from "react";
import { X, Mail, Lock } from "lucide-react";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitchToSignup }) => {
  return (
    <div className="fixed inset-0 bg-[#1E1F23]/30 backdrop-blur-sm flex justify-center items-center z-50 transition-all">
      <div className="bg-white/95 w-[500px] h-[500px] rounded-2xl shadow-2xl p-8 relative flex flex-col justify-center items-center border border-gray-200">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-orange-500 mb-8">로그인</h2>

        {/* 이메일 */}
        <div className="w-3/4 mb-6">
          <label className="text-sm text-orange-500 font-medium flex items-center gap-2 mb-1">
            <Mail size={16} />
            이메일
          </label>
          <input
            type="email"
            className="w-full border-b-2 border-orange-400 focus:outline-none focus:border-orange-500 py-1 bg-transparent"
            placeholder="이메일을 입력하세요"
          />
        </div>

        {/* 비밀번호 */}
        <div className="w-3/4 mb-2">
          <label className="text-sm text-orange-500 font-medium flex items-center gap-2 mb-1">
            <Lock size={16} />
            비밀번호
          </label>
          <input
            type="password"
            className="w-full border-b-2 border-orange-400 focus:outline-none focus:border-orange-500 py-1 bg-transparent"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        <div className="w-3/4 text-right text-xs text-orange-400 mb-8">
          <a href="#" className="hover:underline">
            비밀번호를 잊으셨나요?
          </a>
        </div>

        <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white font-semibold py-2 px-8 rounded-full mb-4 transition">
          로그인
        </button>

        <p className="text-sm text-gray-600">
          아직 계정이 없으신가요?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-orange-500 hover:underline font-medium"
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
