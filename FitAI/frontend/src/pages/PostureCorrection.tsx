import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExerciseById } from "../services/api";

function PostureCorrection() {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  
  // DB에서 가져올 데이터
  const [exerciseName, setExerciseName] = useState<string>("운동 이름");
  const [exerciseInfo, setExerciseInfo] = useState<string>("운동 설명을 불러오는 중...");
  const [loading, setLoading] = useState<boolean>(false);

  // DynamoDB에서 exercise_name과 exercise_info 가져오기
  useEffect(() => {
    const fetchExercise = async () => {
      if (!exerciseId) {
        console.log("⚠️ exerciseId가 없습니다. 기본값 사용");
        setExerciseName("운동");
        setExerciseInfo("운동 정보를 불러올 수 없습니다.");
        return;
      }

      try {
        setLoading(true);
        
        console.log("📄 운동 데이터 로딩 시작... ID:", exerciseId);
        const data = await getExerciseById(exerciseId);
        console.log("✅ 받은 데이터:", data);
        
        if (data) {
          setExerciseName(data.exercise_name || "운동");
          setExerciseInfo(data.exercise_info || "운동 설명이 없습니다.");
          console.log(`✅ 운동 이름: ${data.exercise_name}`);
          console.log(`✅ 운동 설명: ${data.exercise_info}`);
        } else {
          setExerciseName("운동");
          setExerciseInfo("운동 데이터를 불러올 수 없습니다.");
        }
      } catch (err: any) {
        console.error("❌ 에러 발생:", err);
        setExerciseName("운동");
        setExerciseInfo("운동 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  // 웹캠 시작 - 단순화
  const startCamera = async () => {
    try {
      setCameraError("");
      console.log("📹 카메라 시작 요청...");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false,
      });
      
      console.log("✅ 카메라 스트림 획득 성공");
      console.log("📺 비디오 트랙:", stream.getVideoTracks());
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("✅ 비디오 요소에 스트림 연결");
        
        // 즉시 카메라 상태를 켜짐으로 변경
        setIsCameraOn(true);
        console.log("✅ isCameraOn = true 설정 완료");
        
        // 비디오 재생
        try {
          await videoRef.current.play();
          console.log("✅ 비디오 재생 시작");
        } catch (playError) {
          console.error("❌ 비디오 재생 실패:", playError);
        }
      } else {
        console.error("❌ videoRef.current가 null입니다");
      }
    } catch (error: any) {
      console.error("❌ 카메라 접근 오류:", error);
      
      let errorMessage = "카메라에 접근할 수 없습니다.";
      
      if (error.name === "NotAllowedError") {
        errorMessage = "카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "카메라를 찾을 수 없습니다.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "카메라가 다른 앱에서 사용 중입니다.";
      }
      
      setCameraError(errorMessage);
      alert(errorMessage);
    }
  };

  // 웹캠 중지
  const stopCamera = () => {
    console.log("⏹️ 카메라 중지");
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        console.log("🛑 트랙 중지:", track.kind);
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOn(false);
    setCameraError("");
    console.log("✅ isCameraOn = false 설정 완료");
  };

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      console.log("🧹 컴포넌트 언마운트 - 카메라 정리");
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-[#1E1F23] text-white min-h-screen">
      {/* 헤더 */}
      <header className="bg-[#2A2B30] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white text-black px-3 py-1 rounded-md font-bold text-sm">
                FITAI
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <button className="text-gray-300 hover:text-white transition">홈</button>
              <button className="text-gray-300 hover:text-white transition">자세교정</button>
              <button className="text-gray-300 hover:text-white transition">커뮤니티</button>
              <button className="text-gray-300 hover:text-white transition">내 정보</button>
            </nav>

            <div className="flex items-center gap-4">
              <button className="text-gray-300 hover:text-white transition">로그인</button>
              <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-semibold transition">
                회원가입
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 운동 이름 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">
              {exerciseName}
              {loading && <span className="text-sm text-gray-400 ml-3">불러오는 중...</span>}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 웹캠 영역 */}
        <div className="mb-8">
          <div className="relative w-full bg-black rounded-xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
            {/* 비디오는 항상 렌더링 */}
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
            
            {/* 카메라 OFF 상태 오버레이 */}
            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-[#E5E5E5]">
                <svg
                  className="w-20 h-20 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg mb-1 text-gray-600">운동 자세 분석하기</p>
                <p className="text-sm text-gray-500">카메라를 통해 실시간으로 자세를 분석합니다</p>
                {cameraError && (
                  <p className="text-sm text-red-500 mt-4 max-w-md text-center px-4">
                    {cameraError}
                  </p>
                )}
              </div>
            )}
            
            {/* 카메라 ON 상태 오버레이 (마커 등) */}
            {isCameraOn && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 4개의 빨간 마커 */}
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

                {/* 상단 중앙 알림 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  AI 분석 진행 중
                </div>
              </div>
            )}
          </div>

          {/* 카메라 제어 버튼 */}
          <div className="flex gap-3 mt-4 justify-center">
            {!isCameraOn ? (
              <button
                onClick={startCamera}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                카메라 시작
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                카메라 종료
              </button>
            )}
          </div>

          {/* 디버그 정보 */}
          <div className="mt-4 p-3 bg-gray-800 rounded text-xs space-y-1">
            <p>📹 isCameraOn 상태: <span className={`font-bold ${isCameraOn ? 'text-green-400' : 'text-red-400'}`}>{isCameraOn ? "✅ TRUE (켜짐)" : "❌ FALSE (꺼짐)"}</span></p>
            <p>🎥 비디오 요소: <span className="font-bold">{videoRef.current ? "✅ 존재함" : "❌ 없음"}</span></p>
            <p>🔊 스트림 연결: <span className="font-bold">{videoRef.current?.srcObject ? "✅ 연결됨" : "❌ 끊김"}</span></p>
            {videoRef.current?.srcObject && (
              <p>📺 비디오 트랙: <span className="font-bold text-green-400">
                {(videoRef.current.srcObject as MediaStream).getVideoTracks().length}개
              </span></p>
            )}
            {videoRef.current?.videoWidth && videoRef.current?.videoHeight && (
              <p>📐 비디오 크기: <span className="font-bold text-green-400">{videoRef.current.videoWidth}x{videoRef.current.videoHeight}</span></p>
            )}
          </div>
        </div>

        {/* 운동 정보 섹션 */}
        <div className="bg-[#2A2B30] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">운동 방법</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">
            {exerciseInfo}
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-[#2A2B30] border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white text-black px-3 py-1 rounded-md font-bold text-sm">
                FITAI
              </div>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-400">
              <button className="hover:text-white transition">개인정보처리방침</button>
              <button className="hover:text-white transition">이용약관</button>
              <button className="hover:text-white transition">고객지원</button>
            </div>
            
            <p className="text-sm text-gray-500">© 2025 FITAI. 모든 권리 보유.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PostureCorrection;