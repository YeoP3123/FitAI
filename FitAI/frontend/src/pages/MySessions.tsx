import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

const API_BASE = import.meta.env.VITE_API_URL;

interface Exercise {
  exercise_id?: string;
  exercise_name: string;
  exercise_type?: string;
  exercise_sets: number;
  exercise_reps: number;
  average_score?: number;
}

interface Session {
  session_id: string;
  user_id: string;
  session_start: string;
  session_end: string;
  session_score: number;
  session_note?: string;
  exercises: Exercise[];
}

const MySessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  // ✅ 세션 데이터 불러오기
  const loadSessions = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        Swal.fire("로그인 필요", "운동 기록을 보려면 로그인하세요.", "warning");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/sessions/user/${userId}`);
      const json = await res.json();

      if (json.success) {
        setSessions(json.data);
      } else {
        Swal.fire("불러오기 실패", "운동 기록을 가져올 수 없습니다.", "error");
      }
    } catch (err) {
      console.error("세션 불러오기 오류:", err);
      Swal.fire("오류", "데이터를 불러오는 중 문제가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 세션 상세 보기
  const openSessionDetail = (session: Session) => {
    setSelectedSession(session);
  };

  // ✅ 모달 닫기
  const closeModal = () => {
    setSelectedSession(null);
  };

  return (
    <div className="min-h-screen bg-[#1E1F23] text-white p-6 font-['Inter']">
      <h1 className="text-3xl font-bold mb-6 text-center">🏋️ 나의 운동 기록</h1>

      {loading ? (
        <p className="text-center text-gray-400">불러오는 중...</p>
      ) : sessions.length === 0 ? (
        <p className="text-center text-gray-400">운동 기록이 없습니다.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              onClick={() => openSessionDetail(session)}
              className="bg-[#2A2B2F] hover:bg-[#34363A] transition-all p-5 rounded-2xl shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {session.session_note || "운동 세션"}
                </h2>
                <p className="text-sm text-gray-400">
                  {dayjs(session.session_start).format("YYYY.MM.DD HH:mm")}
                </p>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-300">
                <span>총점: {session.session_score}</span>
                <span>
                  운동 수: {session.exercises ? session.exercises.length : 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ 상세 모달 */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2A2B2F] w-[90%] md:w-[600px] rounded-2xl p-6 shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-5 text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-2">
              {selectedSession.session_note || "운동 세션 상세"}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              {dayjs(selectedSession.session_start).format(
                "YYYY.MM.DD HH:mm"
              )}{" "}
              ~{" "}
              {dayjs(selectedSession.session_end).format(
                "HH:mm"
              )}
            </p>

            <div className="border-t border-gray-600 my-4"></div>

            {/* 운동 목록 */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {selectedSession.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="bg-[#1F2023] p-4 rounded-xl border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-semibold text-orange-400">
                      {ex.exercise_name}
                    </h3>
                    <span className="text-gray-400 text-sm">
                      {ex.exercise_type || "일반 운동"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300">
                    세트: <span className="text-white">{ex.exercise_sets}</span> |{" "}
                    반복: <span className="text-white">{ex.exercise_reps}</span>회
                  </p>

                  {ex.average_score !== undefined && (
                    <p className="text-sm text-green-400 mt-1">
                      평균 점수: {ex.average_score}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-600 mt-5 pt-4 text-center">
              <p className="text-gray-400 text-sm">
                {selectedSession.exercises.some((ex) => ex.average_score && ex.average_score > 0)
                  ? "AI 분석 결과가 포함된 세션입니다 🤖"
                  : "AI 없이 수행한 세션입니다 💪"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;
