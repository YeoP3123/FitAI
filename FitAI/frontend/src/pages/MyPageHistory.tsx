import React, { useEffect, useState } from "react";
import { getMySessions } from "../services/api";

interface SessionFeedback {
  exercise_id: string;
  lost_score: number;
  feedback_text: string;
}

interface Session {
  session_id: string;
  user_id: string;
  session_start: string;
  session_end: string;
  session_score?: number;
  session_note?: string;
  feedbacks?: SessionFeedback[];
}

const MyPageHistory: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMySessions();
      setSessions(data || []);
    } catch (err: any) {
      console.error("세션 로딩 실패:", err);
      setError(err.message || "운동 기록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const minutes = Math.round((endTime - startTime) / 1000 / 60);
    return minutes;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-red-500/20 border-red-500';
  };

  if (loading) {
    return (
      <section className="bg-[#2A2B30] border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">운동 기록</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">운동 기록을 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#2A2B30] border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">운동 기록</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadSessions}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition"
          >
            다시 시도
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#2A2B30] border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">운동 기록</h2>
        <button
          onClick={loadSessions}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          🔄 새로고침
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏋️</div>
          <p className="text-gray-400 mb-2">아직 운동 기록이 없습니다</p>
          <p className="text-sm text-gray-500">운동을 완료하고 기록을 저장해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {sessions
            .sort((a, b) => new Date(b.session_start).getTime() - new Date(a.session_start).getTime())
            .map((session) => {
              const score = session.session_score || 0;
              const duration = calculateDuration(session.session_start, session.session_end);

              return (
                <div
                  key={session.session_id}
                  className={`border rounded-lg p-5 ${getScoreBgColor(score)}`}
                >
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">
                        {formatDate(session.session_start)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        운동 시간: {duration}분
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
                        {score}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">점</span>
                    </div>
                  </div>

                  {/* 노트 */}
                  {session.session_note && (
                    <p className="text-sm text-gray-300 mb-3">
                      {session.session_note}
                    </p>
                  )}

                  {/* 피드백 */}
                  {session.feedbacks && session.feedbacks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400 mb-2">
                        운동별 피드백:
                      </p>
                      {session.feedbacks.map((feedback, idx) => (
                        <div
                          key={idx}
                          className="bg-black/20 rounded-lg p-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">
                              운동 #{idx + 1}
                            </span>
                            <span className="text-xs text-gray-400">
                              감점: {feedback.lost_score}점
                            </span>
                          </div>
                          <p className="text-gray-300 text-xs">
                            {feedback.feedback_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
};

export default MyPageHistory;