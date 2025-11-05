import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  restTime: number;
}

function ExerciseDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedExercises = location.state?.selectedExercises as ExerciseWithSettings[] || [];
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Toast 알림
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "info" | "warning";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // 현재 운동과 다음 운동
  const currentExercise = selectedExercises[currentExerciseIndex];
  const nextExercise = selectedExercises[currentExerciseIndex + 1];

  // 타입별 한글 이름 매핑
  const typeNameMap: Record<string, string> = {
    upper_body: "상체",
    lower_body: "하체",
    abs: "복근",
    cardio: "유산소",
    full_body: "전신"
  };

  // Toast 표시 함수
  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000); // 3초 후 자동 사라짐
  };

  // 선택된 운동이 없으면 목록으로 이동
  useEffect(() => {
    if (selectedExercises.length === 0) {
      showToast("선택된 운동이 없습니다.", "warning");
      setTimeout(() => navigate('/exercise'), 1500);
    }
  }, [selectedExercises, navigate]);

  // 웹캠 시작
  const startCamera = async () => {
    try {
      setCameraError("");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        
        try {
          await videoRef.current.play();
          showToast("카메라가 시작되었습니다", "success");
        } catch (playError) {
          console.error("❌ 비디오 재생 실패:", playError);
        }
      }
    } catch (error: any) {
      let errorMessage = "카메라에 접근할 수 없습니다.";
      
      if (error.name === "NotAllowedError") {
        errorMessage = "카메라 권한이 거부되었습니다.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "카메라를 찾을 수 없습니다.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "카메라가 다른 앱에서 사용 중입니다.";
      }
      
      setCameraError(errorMessage);
      showToast(errorMessage, "warning");
    }
  };

  // 웹캠 중지
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOn(false);
    setCameraError("");
  };

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 현재 운동 완료
  const handleCompleteCurrentExercise = () => {
    if (!currentExercise) return;

    // 완료 목록에 추가
    setCompletedExercises(prev => [...prev, currentExercise.exercise_id]);

    // 다음 운동으로 이동
    if (currentExerciseIndex < selectedExercises.length - 1) {
      showToast(`✅ ${currentExercise.exercise_name} 완료! 다음: ${nextExercise?.exercise_name}`, "success");
      setTimeout(() => {
        setCurrentExerciseIndex(prev => prev + 1);
      }, 500);
    } else {
      // 모든 운동 완료
      showToast(`🎉 모든 운동 완료! 총 ${selectedExercises.length}개 완료`, "success");
      stopCamera();
      setTimeout(() => {
        navigate('/exercise');
      }, 2000);
    }
  };

  // 이전 운동으로 이동
  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      showToast("이전 운동으로 이동", "info");
    }
  };

  // 운동 종료
  const handleFinishWorkout = () => {
    if (completedExercises.length < selectedExercises.length) {
      const confirmed = confirm("아직 완료하지 않은 운동이 있습니다. 종료하시겠습니까?");
      if (!confirmed) return;
    }

    stopCamera();
    showToast(`운동 종료! ${completedExercises.length}/${selectedExercises.length}개 완료`, "success");
    setTimeout(() => {
      navigate('/exercise');
    }, 1500);
  };

  if (!currentExercise) {
    return (
      <div className="bg-[#1E1F23] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl mb-6">선택된 운동이 없습니다</p>
          <button
            onClick={() => navigate('/exercise')}
            className="bg-orange-500 px-6 py-3 rounded-lg hover:bg-orange-600"
          >
            운동 선택하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1F23] text-white min-h-screen">
      {/* Toast 알림 */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-down">
          <div className={`rounded-xl px-6 py-4 shadow-2xl backdrop-blur-sm flex items-center gap-3 ${
            toast.type === "success" 
              ? "bg-green-500/90 text-white" 
              : toast.type === "warning"
              ? "bg-yellow-500/90 text-white"
              : "bg-blue-500/90 text-white"
          }`}>
            {toast.type === "success" && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === "warning" && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {toast.type === "info" && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="font-semibold text-lg">{toast.message}</p>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="bg-[#2A2B30] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* 왼쪽: FITAI 로고 + 진행 상황 */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="bg-white text-black px-3 py-1 rounded-md font-bold text-sm">
                FITAI
              </div>
              <span className="text-gray-400 text-sm font-semibold">
                {currentExerciseIndex + 1} / {selectedExercises.length}
              </span>
            </div>

            {/* 중앙: 운동 목록 */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
              {selectedExercises.map((exercise, index) => {
                const isCompleted = completedExercises.includes(exercise.exercise_id);
                const isCurrent = index === currentExerciseIndex;

                return (
                  <div key={exercise.exercise_id} className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                        isCurrent
                          ? 'bg-orange-500 text-white shadow-lg'
                          : isCompleted
                          ? 'bg-green-500/20 text-green-400 line-through'
                          : 'bg-transparent text-gray-500'
                      }`}
                    >
                      {exercise.exercise_name}
                    </div>
                    
                    {/* 화살표 */}
                    {index < selectedExercises.length - 1 && (
                      <svg 
                        className={`w-4 h-4 flex-shrink-0 ${
                          index < currentExerciseIndex ? 'text-green-500' : 'text-gray-600'
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 오른쪽: 종료 버튼 */}
            <button
              onClick={handleFinishWorkout}
              className="text-red-400 hover:text-red-300 transition flex items-center gap-2 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">종료</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 진행 상황 바 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">전체 진행률</p>
            <p className="text-sm font-bold text-orange-500">
              {Math.round((completedExercises.length / selectedExercises.length) * 100)}%
            </p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-500"
              style={{ width: `${(completedExercises.length / selectedExercises.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 웹캠 영역 */}
        <div className="mb-8">
          <div className="relative w-full bg-black rounded-xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
            {/* 비디오 */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                transform: 'scaleX(-1)',
                display: isCameraOn ? 'block' : 'none'
              }}
            />
            
            {/* 카메라 OFF 상태 */}
            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-800 to-gray-900">
                <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-lg mb-1">운동 자세 분석 준비</p>
                <p className="text-sm text-gray-500 mb-4">카메라를 통해 실시간으로 자세를 분석합니다</p>
                <p className="text-2xl font-bold text-white mb-2">{currentExercise.exercise_name}</p>
                {cameraError && (
                  <p className="text-sm text-red-500 mt-4 max-w-md text-center px-4">
                    {cameraError}
                  </p>
                )}
              </div>
            )}
            
            {/* 카메라 ON 상태 오버레이 */}
            {isCameraOn && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 상단 중앙: 현재 운동 -> 다음 운동 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">현재 운동</p>
                      <p className="text-xl font-bold text-orange-500">{currentExercise.exercise_name}</p>
                    </div>
                    
                    {nextExercise && (
                      <>
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">다음 운동</p>
                          <p className="text-lg font-semibold text-gray-300">{nextExercise.exercise_name}</p>
                        </div>
                      </>
                    )}
                    
                    {!nextExercise && (
                      <>
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">다음</p>
                          <p className="text-lg font-semibold text-green-400">마지막 운동!</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* AI 분석 중 표시 */}
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  AI 자세 분석 중
                </div>

                {/* 4개의 마커 */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div className="absolute bottom-4 left-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
              </div>
            )}
          </div>

          {/* 카메라 제어 버튼 */}
          <div className="flex gap-3 mt-4 justify-center">
            {!isCameraOn ? (
              <button
                onClick={startCamera}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                카메라 시작
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                카메라 종료
              </button>
            )}
          </div>
        </div>

        {/* 운동 정보 및 컨트롤 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 운동 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 현재 운동 정보 */}
            <div className="bg-[#2A2B30] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{currentExercise.exercise_name}</h2>
                <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                  {typeNameMap[currentExercise.exercise_type] || currentExercise.exercise_type}
                </span>
              </div>
              
              {/* 세트/횟수/휴식 정보 */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-[#3A3B40] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">{currentExercise.sets}</p>
                  <p className="text-xs text-gray-400 mt-1">세트</p>
                </div>
                <div className="flex-1 bg-[#3A3B40] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">{currentExercise.reps}</p>
                  <p className="text-xs text-gray-400 mt-1">회</p>
                </div>
                <div className="flex-1 bg-[#3A3B40] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">{currentExercise.restTime}초</p>
                  <p className="text-xs text-gray-400 mt-1">휴식</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">운동 설명</h3>
                  <p className="text-gray-300 leading-relaxed">{currentExercise.exercise_info}</p>
                </div>
                
                {currentExercise.exercise_guide && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">운동 가이드</h3>
                    <p className="text-gray-300 leading-relaxed">{currentExercise.exercise_guide}</p>
                  </div>
                )}
                
                {currentExercise.exercise_start && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">시작 자세</h3>
                    <p className="text-gray-300 leading-relaxed">{currentExercise.exercise_start}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 운동 컨트롤 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
                className={`flex-1 py-4 rounded-xl font-semibold transition ${
                  currentExerciseIndex === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
              >
                ← 이전 운동
              </button>
              
              <button
                onClick={handleCompleteCurrentExercise}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white py-4 rounded-xl font-semibold transition shadow-lg"
              >
                {nextExercise ? '완료하고 다음으로 →' : '마지막 운동 완료! ✓'}
              </button>
            </div>
          </div>

          {/* 오른쪽: 운동 목록 */}
          <div className="bg-[#2A2B30] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">운동 목록</h3>
            <div className="space-y-3">
              {selectedExercises.map((exercise, index) => {
                const isCompleted = completedExercises.includes(exercise.exercise_id);
                const isCurrent = index === currentExerciseIndex;

                return (
                  <div
                    key={exercise.exercise_id}
                    className={`p-3 rounded-lg transition ${
                      isCompleted 
                        ? 'bg-green-500/20 border border-green-500' 
                        : isCurrent
                        ? 'bg-orange-500/20 border border-orange-500'
                        : 'bg-gray-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-600 text-gray-400'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-orange-500' : 'text-white'
                        }`}>
                          {exercise.exercise_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {exercise.sets}세트 × {exercise.reps}회
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CSS 추가 */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ExerciseDetail;