import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises } from "../services/api";

interface Exercise {
  exercise_id: string;
  exercise_name: string;
  exercise_info: string;
  exercise_type: string;
  exercise_code: string;
}

function Exercise() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // exercise_type별로 그룹화
  const groupedExercises = exercises.reduce((acc, exercise) => {
    const type = exercise.exercise_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  // 타입별 한글 이름 매핑
  const typeNameMap: Record<string, string> = {
    upper_body: "상체",
    lower_body: "하체",
    abs: "복근",
    cardio: "유산소",
    full_body: "전신"
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("📄 운동 데이터 로딩 시작...");
        const data = await getExercises();
        console.log("✅ 받은 데이터:", data);
        console.log("📊 데이터 타입:", typeof data, Array.isArray(data));
        
        if (Array.isArray(data)) {
          setExercises(data);
          console.log(`✅ ${data.length}개의 운동 로드 완료`);
        } else {
          console.error("❌ 데이터가 배열이 아닙니다:", data);
          setExercises([]);
        }
      } catch (err: any) {
        console.error("❌ 에러 발생:", err);
        setError(err.message || "데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, []);

  const handleTypeClick = (type: string) => {
    console.log("🎯 선택된 운동 타입:", type);
    navigate(`/exercise/${type}`);
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
            onClick={() => window.location.reload()}
            className="bg-orange-500 px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors w-full"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 메인 화면
  return (
    <div className="bg-[#1E1F23] text-white min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* 제목 */}
        <h1 className="text-3xl font-bold mb-10">
          운동 부위를 선택해주세요
        </h1>

        {/* 디버그 정보 */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg text-sm">
          <p>✅ 총 운동 개수: <span className="font-bold text-orange-500">{exercises.length}개</span></p>
          <p>✅ 운동 타입 개수: <span className="font-bold text-orange-500">{Object.keys(groupedExercises).length}개</span></p>
          {Object.keys(groupedExercises).length > 0 && (
            <p className="mt-2">
              📂 타입: {Object.keys(groupedExercises).join(", ")}
            </p>
          )}
        </div>

        {/* 운동이 있는 경우 */}
        {Object.keys(groupedExercises).length > 0 ? (
          <div className="space-y-5 mb-12">
            {Object.entries(groupedExercises).map(([type, typeExercises]) => (
              <div
                key={type}
                className="bg-[#3A3B40] rounded-xl overflow-hidden hover:bg-[#44454a] transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                onClick={() => handleTypeClick(type)}
              >
                <div className="flex items-center gap-6 p-6">
                  {/* 이모지 아이콘 */}
                  <div className="w-28 h-28 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-5xl">
                      {type === "upper_body" && "💪"}
                      {type === "lower_body" && "🦵"}
                      {type === "abs" && "🔥"}
                      {type === "cardio" && "🏃"}
                      {type === "full_body" && "🏋️"}
                      {!["upper_body", "lower_body", "abs", "cardio", "full_body"].includes(type) && "🎯"}
                    </span>
                  </div>

                  {/* 운동 정보 */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      {typeNameMap[type] || type}
                    </h2>
                    <p className="text-base text-gray-300 mb-2">
                      {typeExercises.length}개의 운동
                    </p>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {typeExercises.map(e => e.exercise_name).join(" · ")}
                    </p>
                  </div>

                  {/* 선택 버튼 */}
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTypeClick(type);
                    }}
                  >
                    선택하기 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 운동이 없는 경우 */
          <div className="text-center text-gray-400 py-20">
            <div className="text-6xl mb-4">🔭</div>
            <p className="text-xl mb-2">등록된 운동이 없습니다</p>
            <p className="text-sm">관리자에게 문의하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Exercise;