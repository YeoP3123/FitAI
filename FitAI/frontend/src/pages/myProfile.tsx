import { useNavigate } from "react-router-dom";
import { useState } from "react";

function MyProfile() {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);

  // 사용자 정보 (임시 데이터)
  const [userInfo, setUserInfo] = useState({
    name: "홍길동",
    email: "hong@example.com",
    profileImage: "",
    level: "중급",
    joinDate: "2024.01.15",
    totalWorkouts: 47,
    totalTime: 1420, // 분
    favoriteExercise: "상체",
    weeklyGoal: 4,
    currentStreak: 7,
  });

  const [editForm, setEditForm] = useState({
    name: userInfo.name,
    email: userInfo.email,
    weeklyGoal: userInfo.weeklyGoal.toString(),
  });

  const handleSaveProfile = () => {
    setUserInfo({
      ...userInfo,
      name: editForm.name,
      email: editForm.email,
      weeklyGoal: parseInt(editForm.weeklyGoal),
    });
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: userInfo.name,
      email: userInfo.email,
      weeklyGoal: userInfo.weeklyGoal.toString(),
    });
    setIsEditMode(false);
  };

  // 총 운동 시간을 시간과 분으로 변환
  const hours = Math.floor(userInfo.totalTime / 60);
  const minutes = userInfo.totalTime % 60;

  return (
    <div className="bg-[#1E1F23] text-white min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold">마이 프로필</h1>
          {!isEditMode ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="bg-orange-500 hover:bg-orange-600 px-4 md:px-6 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-sm md:text-base">수정</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm md:text-base transition"
              >
                취소
              </button>
              <button
                onClick={handleSaveProfile}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm md:text-base transition"
              >
                저장
              </button>
            </div>
          )}
        </div>

        {/* 프로필 카드 */}
        <div className="bg-[#3A3B40] rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* 프로필 이미지 */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold">
                {userInfo.name.charAt(0)}
              </div>
              {isEditMode && (
                <button className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 p-2 rounded-full transition">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1 text-center md:text-left">
              {!isEditMode ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {userInfo.name}
                  </h2>
                  <p className="text-gray-400 mb-4">{userInfo.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-sm">
                      {userInfo.level}
                    </span>
                    <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-sm">
                      {userInfo.joinDate} 가입
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-left">
                      이름
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full bg-[#1E1F23] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-left">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full bg-[#1E1F23] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#3A3B40] rounded-xl p-4 md:p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">
              {userInfo.totalWorkouts}
            </div>
            <div className="text-sm md:text-base text-gray-400">총 운동</div>
          </div>

          <div className="bg-[#3A3B40] rounded-xl p-4 md:p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">
              {hours}h {minutes}m
            </div>
            <div className="text-sm md:text-base text-gray-400">총 시간</div>
          </div>

          <div className="bg-[#3A3B40] rounded-xl p-4 md:p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2">
              {userInfo.currentStreak}일
            </div>
            <div className="text-sm md:text-base text-gray-400">연속 기록</div>
          </div>

          <div className="bg-[#3A3B40] rounded-xl p-4 md:p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-500 mb-2">
              {userInfo.favoriteExercise}
            </div>
            <div className="text-sm md:text-base text-gray-400">선호 운동</div>
          </div>
        </div>

        {/* 주간 목표 */}
        <div className="bg-[#3A3B40] rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl md:text-2xl font-bold">주간 목표</h3>
            {!isEditMode && (
              <span className="text-gray-400">
                주 {userInfo.weeklyGoal}회
              </span>
            )}
          </div>

          {isEditMode ? (
            <div>
              <label className="block text-sm font-medium mb-2">
                주간 운동 목표 (회)
              </label>
              <input
                type="number"
                value={editForm.weeklyGoal}
                onChange={(e) =>
                  setEditForm({ ...editForm, weeklyGoal: e.target.value })
                }
                className="w-full bg-[#1E1F23] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max="7"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-[#1E1F23] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(3 / userInfo.weeklyGoal) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  3/{userInfo.weeklyGoal}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                이번 주 {userInfo.weeklyGoal - 3}회 더 운동하면 목표 달성!
              </p>
            </>
          )}
        </div>

        {/* 설정 메뉴 */}
        <div className="bg-[#3A3B40] rounded-2xl overflow-hidden mb-6">
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#44454a] transition text-left">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span>알림 설정</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div className="border-t border-gray-700"></div>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#44454a] transition text-left">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>개인정보 보호</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div className="border-t border-gray-700"></div>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#44454a] transition text-left">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>고객 지원</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* 로그아웃 버튼 */}
        <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-xl font-semibold transition">
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default MyProfile;