import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
}

function ExerciseResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const exerciseScores = location.state?.exerciseScores as ExerciseScore[] || [];
  const selectedExercises = location.state?.selectedExercises as Exercise[] || [];

  useEffect(() => {
    if (exerciseScores.length === 0) {
      navigate('/exercise');
    }
  }, [exerciseScores, navigate]);

  // 평균 계산 함수
  const calculateAverage = (scores: number[]) => {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // 전체 통계 계산
  const overallStats = {
    totalScore: calculateAverage(exerciseScores.flatMap(e => e.scores)),
    avgShoulders: calculateAverage(exerciseScores.flatMap(e => e.shouldersScores)),
    avgHips: calculateAverage(exerciseScores.flatMap(e => e.hipsScores)),
    avgSpine: calculateAverage(exerciseScores.flatMap(e => e.spineScores)),
    avgElbows: calculateAverage(exerciseScores.flatMap(e => e.elbowsScores)),
  };

  // 최고/최저 부위 찾기
  const bodyParts = [
    { name: '어깨', score: overallStats.avgShoulders, icon: '💪' },
    { name: '골반', score: overallStats.avgHips, icon: '🦴' },
    { name: '척추', score: overallStats.avgSpine, icon: '🎯' },
    { name: '팔', score: overallStats.avgElbows, icon: '💪' },
  ];

  const bestPart = bodyParts.reduce((prev, current) => 
    current.score > prev.score ? current : prev
  );

  const worstPart = bodyParts.reduce((prev, current) => 
    current.score < prev.score ? current : prev
  );

  // 점수 색상
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
              onClick={() => navigate('/exercise')}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              운동 선택으로
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 축하 메시지 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">운동 완료!</h2>
          <p className="text-gray-400">총 {selectedExercises.length}개의 운동을 완료했습니다</p>
        </div>

        {/* 전체 점수 카드 */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-8 mb-8 text-center">
          <p className="text-gray-400 mb-2">전체 평균 점수</p>
          <div className={`text-7xl font-bold ${getScoreColor(overallStats.totalScore)}`}>
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
                <p className="text-2xl font-bold text-green-400">{bestPart.name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-green-400">{bestPart.score}</span>
              <span className="text-gray-400 ml-2">/ 25</span>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{worstPart.icon}</div>
              <div>
                <p className="text-sm text-gray-400">개선이 필요한 부위</p>
                <p className="text-2xl font-bold text-red-400">{worstPart.name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-red-400">{worstPart.score}</span>
              <span className="text-gray-400 ml-2">/ 25</span>
            </div>
          </div>
        </div>

        {/* 부위별 점수 */}
        <div className="bg-[#2A2B30] rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-6">부위별 평균 점수</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bodyParts.map((part) => (
              <div key={part.name} className="text-center">
                <div className="text-3xl mb-2">{part.icon}</div>
                <p className="text-sm text-gray-400 mb-1">{part.name}</p>
                <div className={`text-2xl font-bold ${getScoreColor(part.score)}`}>
                  {part.score}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className={`h-full rounded-full ${
                      part.score >= 20 ? 'bg-green-500' :
                      part.score >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(part.score / 25) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 운동별 상세 결과 */}
        <div className="bg-[#2A2B30] rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">운동별 상세 결과</h3>
          <div className="space-y-4">
            {exerciseScores.map((exercise) => {
              const avgScore = calculateAverage(exercise.scores);
              const avgShoulders = calculateAverage(exercise.shouldersScores);
              const avgHips = calculateAverage(exercise.hipsScores);
              const avgSpine = calculateAverage(exercise.spineScores);
              const avgElbows = calculateAverage(exercise.elbowsScores);

              return (
                <div
                  key={exercise.exercise_id}
                  className={`border rounded-lg p-5 ${getScoreBgColor(avgScore)}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold">{exercise.exercise_name}</h4>
                    <div className="text-right">
                      <span className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
                        {avgScore}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">점</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 mb-1">어깨</p>
                      <p className="font-bold text-lg">{avgShoulders}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 mb-1">골반</p>
                      <p className="font-bold text-lg">{avgHips}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 mb-1">척추</p>
                      <p className="font-bold text-lg">{avgSpine}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 mb-1">팔</p>
                      <p className="font-bold text-lg">{avgElbows}</p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    총 {exercise.scores.length}회 측정
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate('/mypage')}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-4 rounded-xl font-semibold transition"
          >
            마이페이지
          </button>
          <button
            onClick={() => navigate('/exercise')}
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