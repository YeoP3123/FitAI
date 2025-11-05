import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExercises } from "../services/api";

interface Exercise {
  exercise_id: string;
  exercise_name: string;
  exercise_info: string;
  exercise_type: string;
  exercise_code: string;
}

function ExerciseDetail() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 타입별 한글 이름 매핑
  const typeNameMap: Record<string, string> = {
    upper_body: "상체 운동",
    lower_body: "하체 운동",
    abs: "복근 운동",
    cardio: "유산소 운동",
    full_body: "전신 운동"
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        console.log("📄 운동 타입:", type);
        
        const data = await getExercises();
        console.log("✅ 전체 운동 데이터:", data);
        
        // 현재 타입에 해당하는 운동만 필터링
        const filtered = data.filter((ex: Exercise) => ex.exercise_type === type);
        console.log(`✅ ${type} 운동 ${filtered.length}개 찾음:`, filtered);
        
        setExercises(filtered);
      } catch (err: any) {
        console.error("❌ 에러:", err);
        setError(err.message || "운동 데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (type) {
      fetchExercises();
    }
  }, [type]);

  // 운동 시작 핸들러
  const handleStartExercise = (exerciseId: string, exerciseName: string) => {
    console.log("🏋️ 운동 시작:", exerciseName, "ID:", exerciseId);
    navigate(`/posture-correction/${exerciseId}`);
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="bg-[#1E1F23] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">운동 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="bg-[#1E1F23] text-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">오류가 발생했습니다</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/exercise")}
            className="bg-orange-500 px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 운동이 없는 경우
  if (exercises.length === 0) {
    return (
      <div className="bg-[#1E1F23] text-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔭</div>
          <h2 className="text-xl font-bold mb-2">운동이 없습니다</h2>
          <p className="text-gray-400 mb-6">
            {typeNameMap[type || ""] || type}에 등록된 운동이 없습니다.
          </p>
          <button
            onClick={() => navigate("/exercise")}
            className="bg-orange-500 px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1F23] text-white min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate("/exercise")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>돌아가기</span>
        </button>

        {/* 제목 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            {typeNameMap[type || ""] || type}
          </h1>
          <p className="text-gray-400">
            총 {exercises.length}개의 운동
          </p>
        </div>

        {/* 디버그 정보 */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg text-sm">
          <p>✅ 운동 타입: <span className="font-bold text-orange-500">{type}</span></p>
          <p>✅ 운동 개수: <span className="font-bold text-orange-500">{exercises.length}개</span></p>
        </div>

        {/* 운동 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exercises.map((exercise) => (
            <div
              key={exercise.exercise_id}
              className="bg-[#3A3B40] rounded-xl p-6 hover:bg-[#44454a] transition-all duration-200"
            >
              {/* 운동 정보 */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2">
                  {exercise.exercise_name}
                </h3>
                {exercise.exercise_info && (
                  <p className="text-sm text-gray-400 mb-2">
                    {exercise.exercise_info}
                  </p>
                )}
                {exercise.exercise_code && (
                  <p className="text-xs text-gray-500">
                    코드: {exercise.exercise_code}
                  </p>
                )}
              </div>

              {/* 운동 시작 버튼 */}
              <button
                onClick={() => handleStartExercise(exercise.exercise_id, exercise.exercise_name)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                운동 시작 →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetail;