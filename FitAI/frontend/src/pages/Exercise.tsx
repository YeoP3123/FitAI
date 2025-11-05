import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises } from "../services/api";

interface Exercise {
  exercise_id: string;
  exercise_name: string;
  exercise_info: string;
  exercise_type: string;
  exercise_code: string;
  exercise_guide?: string;
  exercise_start?: string;
}

interface ExerciseWithSettings extends Exercise {
  sets: number;
  reps: number;
  restTime: number; // 초 단위
}

function Exercise() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 설정 모달
  const [settingsModal, setSettingsModal] = useState<{
    show: boolean;
    exercise: ExerciseWithSettings | null;
    index: number;
  }>({
    show: false,
    exercise: null,
    index: -1,
  });

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
        
        const data = await getExercises();
        
        if (Array.isArray(data)) {
          setExercises(data);
        } else {
          setExercises([]);
        }
      } catch (err: any) {
        setError(err.message || "데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, []);

  // 운동 선택/해제
  const toggleExercise = (exercise: Exercise) => {
    const isSelected = selectedExercises.some(ex => ex.exercise_id === exercise.exercise_id);

    if (isSelected) {
      // 선택 해제
      setSelectedExercises(prev => 
        prev.filter(ex => ex.exercise_id !== exercise.exercise_id)
      );
    } else {
      // 선택 - 기본값으로 추가
      setSelectedExercises(prev => [
        ...prev,
        {
          ...exercise,
          sets: 3,
          reps: 15,
          restTime: 60, // 60초
        }
      ]);
    }
  };

  // 운동 순서 변경
  const moveExercise = (index: number, direction: "up" | "down") => {
    const newExercises = [...selectedExercises];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newExercises.length) return;

    // 위치 교환
    [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
    setSelectedExercises(newExercises);
  };

  // 설정 모달 열기
  const openSettings = (exercise: ExerciseWithSettings, index: number) => {
    setSettingsModal({
      show: true,
      exercise: { ...exercise },
      index,
    });
  };

  // 설정 저장
  const saveSettings = () => {
    if (settingsModal.exercise && settingsModal.index !== -1) {
      const newExercises = [...selectedExercises];
      newExercises[settingsModal.index] = settingsModal.exercise;
      setSelectedExercises(newExercises);
      setSettingsModal({ show: false, exercise: null, index: -1 });
    }
  };

  // 운동 시작하기
  const handleStartWorkout = () => {
    if (selectedExercises.length === 0) {
      alert("운동을 최소 1개 이상 선택해주세요!");
      return;
    }

    navigate('/exercise/workout', { 
      state: { 
        selectedExercises: selectedExercises 
      } 
    });
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

  return (
    <div className="bg-[#1E1F23] text-white min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 전체 운동 목록 */}
          <div>
            <h1 className="text-3xl font-bold mb-6">운동 선택</h1>
            
            <div className="space-y-4">
              {exercises.map((exercise) => {
                const isSelected = selectedExercises.some(ex => ex.exercise_id === exercise.exercise_id);
                
                return (
                  <div
                    key={exercise.exercise_id}
                    className={`rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-orange-500/20 border-2 border-orange-500' 
                        : 'bg-[#3A3B40] border-2 border-transparent hover:bg-[#44454a]'
                    }`}
                    onClick={() => toggleExercise(exercise)}
                  >
                    <div className="flex items-center gap-6 p-6">
                      {/* 체크박스 */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-orange-500' : 'bg-gray-600'
                      }`}>
                        {isSelected ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                        )}
                      </div>

                      {/* 운동 타입 아이콘 */}
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">
                          {exercise.exercise_type === "upper_body" && "💪"}
                          {exercise.exercise_type === "lower_body" && "🦵"}
                          {exercise.exercise_type === "abs" && "🔥"}
                          {exercise.exercise_type === "cardio" && "🏃"}
                          {exercise.exercise_type === "full_body" && "🏋️"}
                          {!["upper_body", "lower_body", "abs", "cardio", "full_body"].includes(exercise.exercise_type) && "🎯"}
                        </span>
                      </div>

                      {/* 운동 정보 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold">
                            {exercise.exercise_name}
                          </h2>
                          <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded-full">
                            {typeNameMap[exercise.exercise_type] || exercise.exercise_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {exercise.exercise_info}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 오른쪽: 선택된 운동 목록 (순서 조정 가능) */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-[#2A2B30] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">선택한 운동</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-400">총 운동</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {selectedExercises.length}개
                  </p>
                </div>
              </div>

              {selectedExercises.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p>운동을 선택해주세요</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {selectedExercises.map((exercise, index) => (
                    <div
                      key={exercise.exercise_id}
                      className="bg-[#3A3B40] rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* 순서 변경 버튼 */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveExercise(index, "up")}
                            disabled={index === 0}
                            className={`p-1 rounded transition ${
                              index === 0
                                ? "text-gray-600 cursor-not-allowed"
                                : "text-gray-400 hover:text-white hover:bg-gray-600"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveExercise(index, "down")}
                            disabled={index === selectedExercises.length - 1}
                            className={`p-1 rounded transition ${
                              index === selectedExercises.length - 1
                                ? "text-gray-600 cursor-not-allowed"
                                : "text-gray-400 hover:text-white hover:bg-gray-600"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* 순서 번호 */}
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>

                        {/* 운동 정보 */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{exercise.exercise_name}</p>
                          <p className="text-xs text-gray-400">
                            {exercise.sets}세트 × {exercise.reps}회 | 휴식 {exercise.restTime}초
                          </p>
                        </div>

                        {/* 설정 버튼 */}
                        <button
                          onClick={() => openSettings(exercise, index)}
                          className="text-gray-400 hover:text-white transition p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => toggleExercise(exercise)}
                          className="text-red-400 hover:text-red-300 transition p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 운동 시작 버튼 */}
              <button
                onClick={handleStartWorkout}
                disabled={selectedExercises.length === 0}
                className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                  selectedExercises.length > 0
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedExercises.length > 0 
                  ? `운동 시작하기! (${selectedExercises.length}개)` 
                  : '운동을 선택해주세요'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 설정 모달 */}
      {settingsModal.show && settingsModal.exercise && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#2A2B30] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{settingsModal.exercise.exercise_name} 설정</h2>
              <button
                onClick={() => setSettingsModal({ show: false, exercise: null, index: -1 })}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 운동 정보 */}
            <div className="bg-[#3A3B40] rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">운동 설명</h3>
              <p className="text-gray-300 mb-4">{settingsModal.exercise.exercise_info}</p>
              
              {settingsModal.exercise.exercise_guide && (
                <>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">운동 가이드</h3>
                  <p className="text-gray-300 mb-4">{settingsModal.exercise.exercise_guide}</p>
                </>
              )}
              
              {settingsModal.exercise.exercise_start && (
                <>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">시작 자세</h3>
                  <p className="text-gray-300">{settingsModal.exercise.exercise_start}</p>
                </>
              )}
            </div>

            {/* 세트 수 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">세트 수</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (settingsModal.exercise && settingsModal.exercise.sets > 1) {
                      setSettingsModal({
                        ...settingsModal,
                        exercise: { ...settingsModal.exercise, sets: settingsModal.exercise.sets - 1 }
                      });
                    }
                  }}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition"
                >
                  -
                </button>
                <div className="flex-1 bg-[#3A3B40] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-orange-500">{settingsModal.exercise.sets}</p>
                  <p className="text-xs text-gray-400 mt-1">세트</p>
                </div>
                <button
                  onClick={() => {
                    if (settingsModal.exercise) {
                      setSettingsModal({
                        ...settingsModal,
                        exercise: { ...settingsModal.exercise, sets: settingsModal.exercise.sets + 1 }
                      });
                    }
                  }}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* 반복 횟수 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">반복 횟수</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (settingsModal.exercise && settingsModal.exercise.reps > 1) {
                      setSettingsModal({
                        ...settingsModal,
                        exercise: { ...settingsModal.exercise, reps: settingsModal.exercise.reps - 1 }
                      });
                    }
                  }}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition"
                >
                  -
                </button>
                <div className="flex-1 bg-[#3A3B40] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-orange-500">{settingsModal.exercise.reps}</p>
                  <p className="text-xs text-gray-400 mt-1">회</p>
                </div>
                <button
                  onClick={() => {
                    if (settingsModal.exercise) {
                      setSettingsModal({
                        ...settingsModal,
                        exercise: { ...settingsModal.exercise, reps: settingsModal.exercise.reps + 1 }
                      });
                    }
                  }}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* 휴식 시간 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">휴식 시간</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (settingsModal.exercise && settingsModal.exercise.restTime > 10) {
                      setSettingsModal({
                        ...settingsModal,
                        exercise: { ...settingsModal.exercise, restTime: settingsModal.exercise.restTime - 10 }
                      });
                    }
                  }}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition"
                >
                  -
                </button>
                <div className="flex-1 bg-[#3A3B40] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-orange-500">{settingsModal.exercise.restTime}</p>
                  <p className="text-xs text-gray-400 mt-1">초</p>
                </div>
                <button
                  onClick={() => {
                    if (settingsModal.exercise) {
                      setSettingsModal({
                        ...settingsModal,
                        exercise: { ...settingsModal.exercise, restTime: settingsModal.exercise.restTime + 10 }
                      });
                    }
                  }}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setSettingsModal({ show: false, exercise: null, index: -1 })}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition"
              >
                취소
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition font-semibold"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Exercise;