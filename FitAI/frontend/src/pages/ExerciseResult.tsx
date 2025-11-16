import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "react-oidc-context";

const API_BASE = import.meta.env.VITE_API_URL;

interface ExerciseScore {
  exercise_id: string;
  exercise_name: string;
  scores: number[];
  shouldersScores: number[];
  hipsScores: number[];
  spineScores: number[];
  elbowsScores: number[];
}

interface Exercise {
  exercise_id: string;
  exercise_name: string;
  exercise_type: string;
  sets?: number;
  reps?: number;
  restTime?: number;
}

function ExerciseResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const user = auth.user?.profile;
  const userId = user?.sub;

  const [exerciseScores, setExerciseScores] = useState<ExerciseScore[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const startTime = location.state?.startTime || Date.now(); // ✅ 운동 시작 시간 복원

  // ✅ 새로고침 복원
  useEffect(() => {
    const stateScores = location.state?.exerciseScores;
    const stateExercises = location.state?.selectedExercises;

    if (stateScores && stateExercises) {
      setExerciseScores(stateScores);
      setSelectedExercises(stateExercises);
      sessionStorage.setItem(
        "exerciseResult",
        JSON.stringify({
          exerciseScores: stateScores,
          selectedExercises: stateExercises,
          startTime: startTime,
        })
      );
    } else {
      const saved = sessionStorage.getItem("exerciseResult");
      if (saved) {
        const parsed = JSON.parse(saved);
        setExerciseScores(parsed.exerciseScores || []);
        setSelectedExercises(parsed.selectedExercises || []);
      } else {
        navigate("/exercise");
      }
    }
  }, [location.state, navigate, startTime]);

  // ✅ 평균 계산
  const calculateAverage = (scores: number[]) => {
    if (!scores || scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // ✅ 세션 저장
  const saveSession = async (totalScore: number) => {
    try {
      const endTime = Date.now();
      const sessionData = {
        session_id: `S${Date.now()}`,
        user_id: userId,
        session_start: new Date(startTime).toISOString(),
        session_end: new Date(endTime).toISOString(),
        session_score: totalScore,
        session_note: "",
        exercises: selectedExercises.map((ex, index) => ({
          exercise_order: index + 1, // ✅ 수행 순서
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          exercise_type: ex.exercise_type,
          exercise_sets: ex.sets || 0,
          exercise_reps: ex.reps || 0,
          exercise_rest_time: ex.restTime || 0,
          average_score:
            exerciseScores.length > 0
              ? calculateAverage(
                  exerciseScores.find((s) => s.exercise_id === ex.exercise_id)
                    ?.scores || []
                )
              : 0,
        })),
        feedbacks: exerciseScores.map((ex) => ({
          exercise_id: ex.exercise_id,
          lost_score: 100 - calculateAverage(ex.scores),
          feedback_text: `평균 ${calculateAverage(ex.scores)}점`,
        })),
      };

      const res = await fetch(`${API_BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      const result = await res.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "운동 기록 저장 완료!",
          text:
            exerciseScores.length > 0
              ? `평균 점수: ${totalScore}점`
              : "AI 분석 없이 기록이 저장되었습니다.",
          confirmButtonText: "확인",
          confirmButtonColor: "#f97316",
        });
      } else {
        throw new Error(result.error || "저장 실패");
      }
    } catch (err: any) {
      console.error("❌ 세션 저장 실패:", err);
      Swal.fire({
        icon: "error",
        title: "기록 저장 실패",
        text: err.message || "네트워크 오류가 발생했습니다.",
      });
    }
  };

  // ✅ 전체 점수 계산
  const overallStats = {
    totalScore: calculateAverage(exerciseScores.flatMap((e) => e.scores || [])),
  };

  // ✅ 색상 함수
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-500";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500";
    return "bg-red-500/20 border-red-500";
  };

  // ✅ 페이지 진입 시 자동 저장
  useEffect(() => {
    if (selectedExercises.length > 0) {
      const totalScore =
        exerciseScores.length > 0
          ? calculateAverage(exerciseScores.flatMap((e) => e.scores))
          : 0;
      saveSession(totalScore);
    }
  }, [exerciseScores, selectedExercises]);

  // ✅ 운동 시간 계산
  const totalMinutes = Math.max(
    Math.round((Date.now() - startTime) / 60000),
    1
  );

  // ✅ 렌더링
  return (
    <div className="bg-[#1E1F23] text-white min-h-screen">
      {/* 헤더 */}
      <header className="bg-[#2A2B30] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="bg-white text-black px-3 py-1 rounded-md font-bold text-sm">
                FITAI
              </div>
              <h1 className="text-xl font-bold">운동 결과</h1>
            </div>
            <button
              onClick={() => navigate("/exercise")}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              운동 선택으로
            </button>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">운동 완료!</h2>
          <p className="text-gray-400">
            총 {selectedExercises.length}개의 운동을 완료했습니다 <br />
            (소요 시간: 약 {totalMinutes}분)
          </p>
        </div>

        {/* ✅ 운동 순서 기반 요약 */}
        <div className="bg-[#2A2B30] rounded-2xl p-6 mb-10">
          <h3 className="text-2xl font-bold mb-6 text-center text-orange-400">
            운동 순서 및 결과
          </h3>

          <div className="flex flex-col gap-4">
            {selectedExercises.map((ex, index) => {
              const found = exerciseScores.find(
                (s) => s.exercise_id === ex.exercise_id
              );
              const avgScore = found ? calculateAverage(found.scores) : null;
              const hasAI = found && found.scores && found.scores.length > 0;

              return (
                <div
                  key={ex.exercise_id}
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-xl p-5 transition ${
                    hasAI
                      ? getScoreBgColor(avgScore || 0)
                      : "bg-[#26272B] border-gray-600"
                  }`}
                >
                  {/* 왼쪽: 순서 + 운동명 */}
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">{ex.exercise_name}</h4>
                      <p className="text-gray-400 text-sm">
                        세트:{" "}
                        <span className="text-orange-400 font-semibold">
                          {ex.sets || 0}
                        </span>{" "}
                        | 반복:{" "}
                        <span className="text-orange-400 font-semibold">
                          {ex.reps || 0}
                        </span>{" "}
                        | 휴식:{" "}
                        <span className="text-orange-400 font-semibold">
                          {ex.restTime || 0}초
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* 오른쪽: 점수 */}
                  {hasAI ? (
                    <div className="text-right">
                      <p
                        className={`text-3xl font-bold ${getScoreColor(
                          avgScore || 0
                        )}`}
                      >
                        {avgScore}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">AI 분석 점수</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      AI 분석 미적용
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ 전체 평균 점수 */}
        {exerciseScores.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-8 mb-10 text-center">
            <p className="text-gray-400 mb-2">전체 평균 점수</p>
            <div
              className={`text-7xl font-bold ${getScoreColor(
                overallStats.totalScore
              )}`}
            >
              {overallStats.totalScore}
            </div>
            <p className="text-gray-400 mt-2">/ 100</p>
          </div>
        )}

        {/* ✅ 하단 버튼 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate("/MyPageHistory")}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-4 rounded-xl font-semibold transition"
          >
            운동 기록 보기
          </button>
          <button
            onClick={() => navigate("/exercise")}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white py-4 rounded-xl font-semibold transition shadow-lg"
          >
            새로운 운동 시작
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseResult;
