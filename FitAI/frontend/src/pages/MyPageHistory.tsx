import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import Swal from "sweetalert2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface SessionFeedback {
  exercise_id: string;
  lost_score: number;
  feedback_text: string;
}

interface ExerciseItem {
  exercise_id: string;
  exercise_name: string;
  exercise_type?: string;
  exercise_sets?: number;
  exercise_reps?: number;
  average_score?: number;
}

interface Session {
  session_id?: string;
  user_id: string;
  session_start: string;
  session_end: string;
  session_score?: number;
  session_note?: string;
  exercises?: ExerciseItem[];
  feedbacks?: SessionFeedback[];
}

const API_BASE = import.meta.env.VITE_API_URL;

const MyPageHistory: React.FC = () => {
  const auth = useAuth();
  const accessToken = auth.user?.access_token;
  const userId = auth.user?.profile?.sub;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  // ✅ 운동 기록 불러오기
  const loadSessions = async () => {
    if (!accessToken || !userId) {
      Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다",
        text: "운동 기록을 확인하려면 로그인해주세요.",
        confirmButtonColor: "#f97316",
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/sessions/user/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const json = await res.json();

      if (json.success) setSessions(json.data || []);
      else throw new Error(json.message || "운동 기록을 불러올 수 없습니다.");
    } catch (err: any) {
      console.error("❌ 세션 로딩 실패:", err);
      setError(err.message || "운동 기록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const minutes = Math.max(Math.round((endTime - startTime) / 60000), 1);
    return minutes;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number | null, isAIUsed: boolean) => {
    if (!isAIUsed) return "border-gray-600";
    if (score && score >= 80) return "border-green-500/50";
    if (score && score >= 60) return "border-yellow-500/50";
    return "border-red-500/50";
  };

  const closeModal = () => setSelectedSession(null);

  // ✅ 로딩 & 에러 처리
  if (loading)
    return (
      <main className="bg-[#1E1F23] min-h-screen flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-gray-400">운동 기록을 불러오는 중...</p>
      </main>
    );

  if (error)
    return (
      <main className="bg-[#1E1F23] min-h-screen flex flex-col items-center justify-center text-white">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadSessions}
          className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg transition"
        >
          다시 시도
        </button>
      </main>
    );

  // ✅ 메인 UI
  return (
    <main className="bg-[#1E1F23] text-white min-h-screen pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-3">
          <h2 className="text-2xl font-bold">운동 기록</h2>
          <button
            onClick={loadSessions}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            🔄 새로고침
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🏋️</div>
            <p className="text-gray-400 mb-2">아직 운동 기록이 없습니다</p>
            <p className="text-sm text-gray-500">
              운동을 완료하고 기록을 저장해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions
              .sort(
                (a, b) =>
                  new Date(b.session_start).getTime() -
                  new Date(a.session_start).getTime()
              )
              .map((session, idx) => {
                const isAIUsed = !!(
                  session.feedbacks && session.feedbacks.length > 0
                );
                const score = isAIUsed ? session.session_score || 0 : null;
                const duration = calculateDuration(
                  session.session_start,
                  session.session_end
                );

                return (
                  <div
                    key={idx}
                    className={`border ${getScoreBgColor(
                      score,
                      isAIUsed
                    )} bg-[#2A2B30] p-6 cursor-pointer hover:bg-[#323338] transition rounded-2xl shadow-md`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <p className="text-sm text-gray-400">
                          {formatDate(session.session_start)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          운동 시간: {duration}분
                        </p>
                      </div>
                      <div className="text-right mt-3 sm:mt-0">
                        {isAIUsed ? (
                          <>
                            <span
                              className={`text-4xl font-bold ${getScoreColor(
                                score || 0
                              )}`}
                            >
                              {score}
                            </span>
                            <span className="text-gray-400 text-sm ml-1">
                              점
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm italic">
                            AI 분석 미적용
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs mt-2 mb-3">
                      {isAIUsed ? (
                        <span className="text-green-400">🤖 AI 분석 적용</span>
                      ) : (
                        <span className="text-gray-400">⚪ AI 분석 미적용</span>
                      )}
                    </div>

                    {session.exercises && session.exercises.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-400 mb-2">
                          수행한 운동
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {session.exercises.map((ex, i) => (
                            <div
                              key={i}
                              className="bg-[#1E1F23] border border-gray-700 rounded-xl p-3 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-semibold text-sm">
                                  {i + 1}. {ex.exercise_name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  세트: {ex.exercise_sets || 0} | 반복:{" "}
                                  {ex.exercise_reps || 0}
                                </p>
                              </div>
                              <div className="text-right">
                                {isAIUsed ? (
                                  <span
                                    className={`text-sm font-bold ${getScoreColor(
                                      ex.average_score || 0
                                    )}`}
                                  >
                                    {ex.average_score ?? "-"}점
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-xs italic">
                                    AI 미적용
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ✅ 상세 모달 */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#2A2B30] border border-gray-700 w-full max-w-4xl p-6 relative rounded-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✖
            </button>
            <h3 className="text-2xl font-bold mb-4 text-orange-400">
              운동 세션 상세 ({formatDate(selectedSession.session_start)})
            </h3>

            {/* ✅ 그래프 */}
            {selectedSession.feedbacks &&
            selectedSession.feedbacks.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={selectedSession.feedbacks.map((f) => ({
                    name: f.exercise_id || "운동",
                    score: 100 - f.lost_score,
                  }))}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis domain={[0, 100]} stroke="#ccc" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2A2B30",
                      border: "1px solid #555",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="score" fill="#f97316" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 mt-6 text-center">
                AI 분석 데이터가 없습니다.
              </p>
            )}

            {/* ✅ 세부 운동 정보 */}
            {selectedSession.exercises && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-3">
                  세부 운동 정보
                </h4>
                {selectedSession.exercises.map((ex, i) => {
                  const feedback = selectedSession.feedbacks?.find(
                    (f) => f.exercise_id === ex.exercise_id
                  );
                  return (
                    <div
                      key={i}
                      className="border border-gray-700 bg-[#1E1F23] rounded-xl p-4"
                    >
                      <div className="flex flex-wrap justify-between items-center">
                        <div>
                          <p className="font-semibold text-lg">
                            {i + 1}. {ex.exercise_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            세트: {ex.exercise_sets || "-"} / 반복:{" "}
                            {ex.exercise_reps || "-"}
                          </p>
                        </div>
                        <div className="text-right">
                          {selectedSession.feedbacks &&
                          selectedSession.feedbacks.length > 0 ? (
                            <>
                              <span
                                className={`text-3xl font-bold ${getScoreColor(
                                  ex.average_score || 0
                                )}`}
                              >
                                {ex.average_score ?? "-"}
                              </span>
                              <span className="text-sm text-gray-400 ml-1">
                                점
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500 italic">
                              AI 미적용
                            </span>
                          )}
                        </div>
                      </div>

                      {feedback && (
                        <p className="text-sm text-gray-300 mt-2">
                          💬 {feedback.feedback_text}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={closeModal}
                className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MyPageHistory;
