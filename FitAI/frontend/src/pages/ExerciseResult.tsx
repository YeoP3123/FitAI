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
  sets?: number;        // ✅ 추가
  reps?: number;        // ✅ 추가
  restTime?: number;    // ✅ 추가
}


function ExerciseResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const user = auth.user?.profile;
  const userId = user?.sub;

  const [exerciseScores, setExerciseScores] = useState<ExerciseScore[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

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
  }, [location.state, navigate]);

  // ✅ 평균 계산
  const calculateAverage = (scores: number[]) => {
    if (!scores || scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

const saveSession = async (totalScore: number) => {
  try {
    const sessionData = {
      session_id: `S${Date.now()}`, // ✅ 고유 세션 ID
      user_id: userId,
      session_start: new Date().toISOString(),
      session_end: new Date().toISOString(),
      session_score: totalScore,
      session_note: "",
      exercises: selectedExercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        exercise_type: ex.exercise_type,
        exercise_sets: ex.sets || 0,
        exercise_reps: ex.reps || 0,
        exercise_rest_time: ex.restTime || 0,
        average_score: 0, // 초기값 (AI 분석 없을 때)
      })),
      feedbacks: exerciseScores.map((ex) => ({
        exercise_id: ex.exercise_id,
        lost_score: 100 - calculateAverage(ex.scores),
        feedback_text: `평균 ${calculateAverage(ex.scores)}점`,
      })),
    };

    console.log("🧾 세션 전송 데이터:", sessionData);

    const res = await fetch(`${API_BASE}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData),
    });

    const result = await res.json();
    console.log("📦 세션 저장 결과:", result);

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "운동 기록 저장 완료!",
        text: `평균 점수: ${totalScore}점`,
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
    avgShoulders: calculateAverage(
      exerciseScores.flatMap((e) => e.shouldersScores || [])
    ),
    avgHips: calculateAverage(
      exerciseScores.flatMap((e) => e.hipsScores || [])
    ),
    avgSpine: calculateAverage(
      exerciseScores.flatMap((e) => e.spineScores || [])
    ),
    avgElbows: calculateAverage(
      exerciseScores.flatMap((e) => e.elbowsScores || [])
    ),
  };

  // ✅ 최고/최저 부위
  const bodyParts = [
    { name: "어깨", score: overallStats.avgShoulders, icon: "💪" },
    { name: "골반", score: overallStats.avgHips, icon: "🦴" },
    { name: "척추", score: overallStats.avgSpine, icon: "🎯" },
    { name: "팔", score: overallStats.avgElbows, icon: "💪" },
  ];

  const bestPart = bodyParts.reduce((prev, curr) =>
    curr.score > prev.score ? curr : prev
  );
  const worstPart = bodyParts.reduce((prev, curr) =>
    curr.score < prev.score ? curr : prev
  );

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

  // ✅ 페이지 진입 시 자동 저장 (AI 유무 관계없이)
  useEffect(() => {
    if (selectedExercises.length > 0) {
      const totalScore =
        exerciseScores.length > 0
          ? calculateAverage(exerciseScores.flatMap((e) => e.scores))
          : 0; // AI 분석 없을 경우 0점 처리
      saveSession(totalScore);
    }
  }, [exerciseScores, selectedExercises]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">운동 완료!</h2>
          <p className="text-gray-400">
            총 {selectedExercises.length}개의 운동을 완료했습니다
          </p>
        </div>

        {/* 평균 점수 */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-8 mb-8 text-center">
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

        {/* 최고/최저 부위 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-500/10 border border-green-500 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{bestPart.icon}</div>
              <div>
                <p className="text-sm text-gray-400">가장 잘한 부위</p>
                <p className="text-2xl font-bold text-green-400">
                  {bestPart.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-green-400">
                {bestPart.score}
              </span>
              <span className="text-gray-400 ml-2">/ 25</span>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{worstPart.icon}</div>
              <div>
                <p className="text-sm text-gray-400">개선이 필요한 부위</p>
                <p className="text-2xl font-bold text-red-400">
                  {worstPart.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-red-400">
                {worstPart.score}
              </span>
              <span className="text-gray-400 ml-2">/ 25</span>
            </div>
          </div>
        </div>

        {/* 상세 점수 */}
        <div className="bg-[#2A2B30] rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-6">운동별 상세 결과</h3>
          {exerciseScores.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              AI 분석 데이터가 없어 세부 점수를 표시할 수 없습니다.
            </p>
          ) : (
            <div className="space-y-4">
              {exerciseScores.map((exercise) => {
                const avgScore = calculateAverage(exercise.scores);
                return (
                  <div
                    key={exercise.exercise_id}
                    className={`border rounded-lg p-5 ${getScoreBgColor(
                      avgScore
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">
                        {exercise.exercise_name}
                      </h4>
                      <div className="text-right">
                        <span
                          className={`text-3xl font-bold ${getScoreColor(
                            avgScore
                          )}`}
                        >
                          {avgScore}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">점</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      총 {exercise.scores.length}회 측정
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
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
