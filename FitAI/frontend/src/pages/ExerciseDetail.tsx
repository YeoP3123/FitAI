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

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface PoseAnalysis {
  score: number;
  shoulders: number;
  hips: number;
  spine: number;
  elbows: number;
  errorCodes: number[];
  hints: string[];
}

interface PoseResult {
  success: boolean;
  landmarks?: Landmark[];
  analysis?: PoseAnalysis;
}

interface ExerciseScore {
  exercise_id: string;
  exercise_name: string;
  scores: number[];
  shouldersScores: number[];
  hipsScores: number[];
  spineScores: number[];
  elbowsScores: number[];
}
// MediaPipe 포즈 분석을 위한 상수
const THRESH_SHOULDERS_ERR = 0.08;
const THRESH_HIPS_ERR = 0.10;
const THRESH_SPINE_ANGLE = 30;
const TARGET_ELBOW_DEG = 160;
const WIDTH_ELBOW_SIGM = 35;
const MIN_ELBOW_SCORE = 6;
const TARGET_KNEE_DEG = 175;
const ALLOW_KNEE_DEVI = 20;

function ExerciseDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedExercises = (location.state?.selectedExercises as ExerciseWithSettings[]) || [];
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  
  // 포즈 분석 상태
  const [poseAnalysis, setPoseAnalysis] = useState<PoseAnalysis>({
    score: 0,
    shoulders: 0,
    hips: 0,
    spine: 0,
    elbows: 0,
    errorCodes: [],
    hints: []
  });
  
  const [isPoseDetecting, setIsPoseDetecting] = useState(false);
  const landmarkerRef = useRef<any>(null);
  const rafIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 포즈 분석 상태
  const [poseAnalysis, setPoseAnalysis] = useState<PoseAnalysis | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 📊 점수 기록
  const [exerciseScores, setExerciseScores] = useState<ExerciseScore[]>([]);
  
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

  const currentExercise = selectedExercises[currentExerciseIndex];
  const nextExercise = selectedExercises[currentExerciseIndex + 1];

  const typeNameMap: Record<string, string> = {
    upper_body: "상체",
    lower_body: "하체",
    abs: "복근",
    cardio: "유산소",
    full_body: "전신"
  };

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  useEffect(() => {
    if (selectedExercises.length === 0) {
      showToast("선택된 운동이 없습니다.", "warning");
      setTimeout(() => navigate('/exercise'), 1500);
    }
  }, [selectedExercises, navigate]);

  // 스켈레톤 연결선 정의 (MediaPipe Pose 기준)
  const POSE_CONNECTIONS = [
    [11, 12], // 어깨
    [11, 13], [13, 15], // 왼팔
    [12, 14], [14, 16], // 오른팔
    [11, 23], [12, 24], // 몸통
    [23, 24], // 골반
    [23, 25], [25, 27], // 왼다리
    [24, 26], [26, 28], // 오른다리
  ];

  // 스켈레톤 그리기
  const drawSkeleton = (landmarks: Landmark[], errorCodes: number[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
  // MediaPipe 초기화
  const initMediaPipe = async () => {
    try {
      // @ts-ignore
      const { FilesetResolver, PoseLandmarker } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.13/vision_bundle.mjs');
      
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.13/wasm"
      );
      
      const landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });
      
      landmarkerRef.current = landmarker;
      setIsPoseDetecting(true);
      showToast("AI 포즈 분석 준비 완료", "success");
    } catch (error) {
      console.error("MediaPipe 초기화 실패:", error);
      showToast("AI 분석 초기화 실패", "warning");
    }
  };

  // 포즈 분석 로직
  const analyzePose = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return null;

    const lm = landmarks[0];
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const getLandmark = (i: number) => {
      const p = lm[i];
      return { x: p.x * W, y: p.y * H, v: p.visibility ?? 1 };
    };

    const LS = getLandmark(11), RS = getLandmark(12);
    const LE = getLandmark(13), RE = getLandmark(14);
    const LW = getLandmark(15), RW = getLandmark(16);
    const LH = getLandmark(23), RH = getLandmark(24);
    const LK = getLandmark(25), RK = getLandmark(26);
    const LA = getLandmark(27), RA = getLandmark(28);

    const midSh = { x: (LS.x + RS.x) / 2, y: (LS.y + RS.y) / 2 };
    const midHp = { x: (LH.x + RH.x) / 2, y: (LH.y + RH.y) / 2 };

    const len2 = (ax: number, ay: number, bx: number, by: number) => {
      return Math.hypot(ax - bx, ay - by);
    };

    const angleDeg = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
      const bax = ax - bx, bay = ay - by;
      const bcx = cx - bx, bcy = cy - by;
      const na = Math.hypot(bax, bay), nb = Math.hypot(bcx, bcy);
      if (!na || !nb) return null;
      let cos = (bax * bcx + bay * bcy) / (na * nb);
      cos = Math.max(-1, Math.min(1, cos));
      return Math.acos(cos) * 180 / Math.PI;
    };

    const shoulderW = len2(LS.x, LS.y, RS.x, RS.y);
    const torso = len2(midSh.x, midSh.y, midHp.x, midHp.y);
    const scale = Math.max(1e-6, 0.5 * (shoulderW + torso));

    const shouldersErr = Math.abs(LS.y - RS.y) / scale;
    const hipsErr = Math.abs(LH.y - RH.y) / scale;

    const huberLike = (err: number, delta: number) => {
      const a = Math.abs(err);
      return a <= delta ? 1 - a / (2 * delta) : Math.max(0, 0.5 * (delta / a));
    };

    const shScore = 25 * huberLike(shouldersErr, THRESH_SHOULDERS_ERR);
    const hpScore = 25 * huberLike(hipsErr, THRESH_HIPS_ERR) * (20 / 25);

    const v = { x: midSh.x - midHp.x, y: midSh.y - midHp.y };
    const angVert = Math.abs(Math.atan2(Math.abs(v.x), Math.abs(v.y)) * 180 / Math.PI);
    const spScore = 25 * huberLike(angVert, THRESH_SPINE_ANGLE);

    const L_ang = angleDeg(LS.x, LS.y, LE.x, LE.y, LW.x, LW.y);
    const R_ang = angleDeg(RS.x, RS.y, RE.x, RE.y, RW.x, RW.y);

    const sigmoidScore = (x: number, center: number, width: number, maxScore: number) => {
      const s = 1 / (1 + Math.exp(Math.abs(x - center) / Math.max(1e-6, width)));
      return maxScore * s;
    };

    const L_el = L_ang ? sigmoidScore(L_ang, TARGET_ELBOW_DEG, WIDTH_ELBOW_SIGM, 15) : 0;
    const R_el = R_ang ? sigmoidScore(R_ang, TARGET_ELBOW_DEG, WIDTH_ELBOW_SIGM, 15) : 0;
    const elScore = L_el + R_el;

    const L_knee = angleDeg(LH.x, LH.y, LK.x, LK.y, LA.x, LA.y);
    const R_knee = angleDeg(RH.x, RH.y, RK.x, RK.y, RA.x, RA.y);
    const L_knee_bad = L_knee != null && Math.abs(L_knee - TARGET_KNEE_DEG) > ALLOW_KNEE_DEVI;
    const R_knee_bad = R_knee != null && Math.abs(R_knee - TARGET_KNEE_DEG) > ALLOW_KNEE_DEVI;

    const leftArmBad = L_el < MIN_ELBOW_SCORE;
    const rightArmBad = R_el < MIN_ELBOW_SCORE;

    const total = Math.min(100, Math.max(0, shScore + hpScore + spScore + elScore));

    const errorCodes: number[] = [];
    const hints: string[] = [];

    if (leftArmBad) {
      errorCodes.push(1);
      hints.push("왼팔 팔꿈치 각도 교정 필요");
    }
    if (rightArmBad) {
      errorCodes.push(2);
      hints.push("오른팔 팔꿈치 각도 교정 필요");
    }
    if (L_knee_bad) {
      errorCodes.push(3);
      hints.push("왼쪽 무릎 각도 교정 필요");
    }
    if (R_knee_bad) {
      errorCodes.push(4);
      hints.push("오른쪽 무릎 각도 교정 필요");
    }

    return {
      score: Math.round(total),
      shoulders: Math.round(shScore),
      hips: Math.round(hpScore),
      spine: Math.round(spScore),
      elbows: Math.round(elScore),
      errorCodes,
      hints,
      landmarks: lm,
      shoulderBad: shouldersErr > THRESH_SHOULDERS_ERR * 1.2,
      hipBad: hipsErr > THRESH_HIPS_ERR * 1.2,
      spineBad: angVert > THRESH_SPINE_ANGLE * 1.2,
      leftArmBad,
      rightArmBad,
      leftLegBad: L_knee_bad,
      rightLegBad: R_knee_bad,
      points: { LS, RS, LE, RE, LW, RW, LH, RH, LK, RK, LA, RA, midSh, midHp }
    };
  };

  // 캔버스에 포즈 그리기
  const drawPose = (analysis: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hasLeftArmError = errorCodes.includes(1);
    const hasRightArmError = errorCodes.includes(2);
    const hasLeftLegError = errorCodes.includes(3);
    const hasRightLegError = errorCodes.includes(4);

    ctx.lineWidth = 3;
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start.visibility > 0.5 && end.visibility > 0.5) {
        const startX = start.x * canvas.width;
        const startY = start.y * canvas.height;
        const endX = end.x * canvas.width;
        const endY = end.y * canvas.height;

        let color = '#00ff88';

        if ((startIdx === 11 && endIdx === 13) || (startIdx === 13 && endIdx === 15)) {
          if (hasLeftArmError) color = '#ff3333';
        }
        else if ((startIdx === 12 && endIdx === 14) || (startIdx === 14 && endIdx === 16)) {
          if (hasRightArmError) color = '#ff3333';
        }
        else if ((startIdx === 23 && endIdx === 25) || (startIdx === 25 && endIdx === 27)) {
          if (hasLeftLegError) color = '#ff3333';
        }
        else if ((startIdx === 24 && endIdx === 26) || (startIdx === 26 && endIdx === 28)) {
          if (hasRightLegError) color = '#ff3333';
        }

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });

    landmarks.forEach((landmark, index) => {
      if (landmark.visibility > 0.5) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;

        let color = '#ffffff';
        let radius = 4;

        if (index === 13 && hasLeftArmError) {
          color = '#ff3333';
          radius = 6;
        } else if (index === 14 && hasRightArmError) {
          color = '#ff3333';
          radius = 6;
        }
        else if (index === 25 && hasLeftLegError) {
          color = '#ff3333';
          radius = 6;
        } else if (index === 26 && hasRightLegError) {
          color = '#ff3333';
          radius = 6;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  // 백엔드로 프레임 전송 및 포즈 분석
  const analyzePoseFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraOn || isAnalyzing) {
    // 캔버스 크기 조정
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    if (!analysis || !analysis.landmarks) return;

    const { landmarks, points, leftArmBad, rightArmBad, leftLegBad, rightLegBad, shoulderBad, hipBad, spineBad } = analysis;

    // 기본 스켈레톤
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
      [24, 26], [26, 28]
    ];

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    connections.forEach(([a, b]) => {
      const pa = landmarks[a];
      const pb = landmarks[b];
      ctx.beginPath();
      ctx.moveTo(pa.x * rect.width, pa.y * rect.height);
      ctx.lineTo(pb.x * rect.width, pb.y * rect.height);
      ctx.stroke();
    });

    // 관절점
    ctx.fillStyle = '#ffffff';
    landmarks.forEach((p: any) => {
      ctx.beginPath();
      ctx.arc(p.x * rect.width, p.y * rect.height, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 오류 강조
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 10;

    const drawErrorLine = (p1: any, p2: any) => {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    if (shoulderBad) drawErrorLine(points.LS, points.RS);
    if (hipBad) drawErrorLine(points.LH, points.RH);
    if (spineBad) drawErrorLine(points.midSh, points.midHp);
    if (leftArmBad) {
      drawErrorLine(points.LS, points.LE);
      drawErrorLine(points.LE, points.LW);
    }
    if (rightArmBad) {
      drawErrorLine(points.RS, points.RE);
      drawErrorLine(points.RE, points.RW);
    }
    if (leftLegBad) {
      drawErrorLine(points.LH, points.LK);
      drawErrorLine(points.LK, points.LA);
    }
    if (rightLegBad) {
      drawErrorLine(points.RH, points.RK);
      drawErrorLine(points.RK, points.RA);
    }

    ctx.shadowBlur = 0;
  };

  // 포즈 검출 루프
  const detectPose = () => {
    if (!landmarkerRef.current || !videoRef.current || !isCameraOn) return;

    const video = videoRef.current;
    const now = performance.now();

    if (video.currentTime !== video.currentTime) {
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const video = videoRef.current;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return;
      
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      const imageData = tempCanvas.toDataURL('image/jpeg', 0.8);
      
      const response = await fetch('http://localhost:8000/api/analyze-pose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });
      
      const result: PoseResult = await response.json();
      
      if (result.success && result.landmarks && result.analysis) {
        setLandmarks(result.landmarks);
        setPoseAnalysis(result.analysis);
        
        // 📊 점수 기록
        recordScore(result.analysis);
        
        drawSkeleton(result.landmarks, result.analysis.errorCodes);
      } else {
        setLandmarks(null);
        setPoseAnalysis(null);
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      
    } catch (error) {
      console.error('포즈 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 📊 점수 기록 함수
  const recordScore = (analysis: PoseAnalysis) => {
    if (!currentExercise) return;

    setExerciseScores(prev => {
      const existingIndex = prev.findIndex(
        item => item.exercise_id === currentExercise.exercise_id
      );

      if (existingIndex >= 0) {
        // 기존 운동에 점수 추가
        const updated = [...prev];
        updated[existingIndex].scores.push(analysis.score);
        updated[existingIndex].shouldersScores.push(analysis.shoulders);
        updated[existingIndex].hipsScores.push(analysis.hips);
        updated[existingIndex].spineScores.push(analysis.spine);
        updated[existingIndex].elbowsScores.push(analysis.elbows);
        return updated;
      } else {
        // 새 운동 추가
        return [
          ...prev,
          {
            exercise_id: currentExercise.exercise_id,
            exercise_name: currentExercise.exercise_name,
            scores: [analysis.score],
            shouldersScores: [analysis.shoulders],
            hipsScores: [analysis.hips],
            spineScores: [analysis.spine],
            elbowsScores: [analysis.elbows],
          },
        ];
      }
    });
  };

  useEffect(() => {
    if (!isCameraOn) return;
    
    const interval = setInterval(() => {
      analyzePoseFrame();
    }, 200);
    
    return () => clearInterval(interval);
  }, [isCameraOn, isAnalyzing]);

      const result = landmarkerRef.current.detectForVideo(video, now);
      
      if (result && result.landmarks && result.landmarks.length > 0) {
        const analysis = analyzePose(result.landmarks);
        if (analysis) {
          setPoseAnalysis({
            score: analysis.score,
            shoulders: analysis.shoulders,
            hips: analysis.hips,
            spine: analysis.spine,
            elbows: analysis.elbows,
            errorCodes: analysis.errorCodes,
            hints: analysis.hints
          });
          drawPose(analysis);
        }
      } else {
        setPoseAnalysis({
          score: 0,
          shoulders: 0,
          hips: 0,
          spine: 0,
          elbows: 0,
          errorCodes: [],
          hints: []
        });
      }
    } catch (error) {
      console.error("포즈 검출 오류:", error);
    }

    rafIdRef.current = requestAnimationFrame(detectPose);
  };

  // 카메라 시작
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
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraOn(true);
        showToast("카메라가 시작되었습니다", "success");
        
        // MediaPipe 초기화 및 포즈 검출 시작
        if (!landmarkerRef.current) {
          await initMediaPipe();
        }
        
        setTimeout(() => {
          detectPose();
        }, 500);
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

  // 카메라 중지
  const stopCamera = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    setIsCameraOn(false);
    setIsPoseDetecting(false);
    setCameraError("");
    setPoseAnalysis(null);
    setLandmarks(null);
    
    setPoseAnalysis({
      score: 0,
      shoulders: 0,
      hips: 0,
      spine: 0,
      elbows: 0,
      errorCodes: [],
      hints: []
    });
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCompleteCurrentExercise = () => {
    if (!currentExercise) return;

    setCompletedExercises(prev => [...prev, currentExercise.exercise_id]);

    if (currentExerciseIndex < selectedExercises.length - 1) {
      showToast(`✅ ${currentExercise.exercise_name} 완료! 다음: ${nextExercise?.exercise_name}`, "success");
      setTimeout(() => {
        setCurrentExerciseIndex(prev => prev + 1);
      }, 500);
    } else {
      // 📊 모든 운동 완료 → 결과 페이지로 이동
      showToast(`🎉 모든 운동 완료! 결과를 확인하세요`, "success");
      showToast(`🎉 모든 운동 완료! 총 ${selectedExercises.length}개 완료`, "success");
      stopCamera();
      setTimeout(() => {
        navigate('/exercise-result', {
          state: {
            exerciseScores,
            selectedExercises
          }
        });
      }, 1500);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      showToast("이전 운동으로 이동", "info");
    }
  };

  const handleFinishWorkout = () => {
    if (completedExercises.length < selectedExercises.length) {
      const confirmed = confirm("아직 완료하지 않은 운동이 있습니다. 종료하시겠습니까?");
      if (!confirmed) return;
    }

    stopCamera();
    
    // 📊 결과 페이지로 이동
    if (exerciseScores.length > 0) {
      navigate('/exercise-result', {
        state: {
          exerciseScores,
          selectedExercises
        }
      });
    } else {
      showToast(`운동 종료!`, "success");
      setTimeout(() => {
        navigate('/exercise');
      }, 1500);
    }
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
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-down">
          <div className={`rounded-xl px-6 py-4 shadow-2xl backdrop-blur-sm flex items-center gap-3 ${
            toast.type === "success" 
              ? "bg-green-500/90 text-white" 
              : toast.type === "info"
              ? "bg-blue-500/90 text-white"
              : "bg-orange-500/90 text-white"
          }`}>
            <span className="text-xl">
              {toast.type === "success" ? "✓" : toast.type === "info" ? "ℹ" : "⚠"}
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="bg-[#2A2B30] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="bg-white text-black px-3 py-1 rounded-md font-bold text-sm">
                FITAI
              </div>
              <span className="text-gray-400 text-sm font-semibold">
                {currentExerciseIndex + 1} / {selectedExercises.length}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
              {selectedExercises.map((exercise, index) => {
                const isCompleted = completedExercises.includes(exercise.exercise_id);
                const isCurrent = index === currentExerciseIndex;
                return (
                  <div key={exercise.exercise_id} className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                        isCurrent
                          ? "bg-orange-500 text-white shadow-lg"
                          : isCompleted
                          ? "bg-green-500/20 text-green-400 line-through"
                          : "bg-transparent text-gray-500"
                      }`}
                    >
                      {exercise.exercise_name}
                    </div>
                    {index < selectedExercises.length - 1 && (
                      <svg
                        className={`w-4 h-4 flex-shrink-0 ${
                          index < currentExerciseIndex ? "text-green-500" : "text-gray-600"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">운동 진행 중</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              {currentExerciseIndex + 1} / {selectedExercises.length}
            </span>
            <button
              onClick={handleFinishWorkout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              운동 종료
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 진행률 */}
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

        {/* 좌측: 운동 자세 영상 / 우측: 스켈레톤 웹캠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 좌측: 운동 자세 영상 (정사각형) */}
          <div>
            <h3 className="text-lg font-bold mb-3">🎞️ 운동 자세</h3>
            <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
              <video
                key={currentExercise.exercise_code}
                src={`/${currentExercise.exercise_code}.mp4`}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 우측: 스켈레톤 웹캠 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">🎥 AI 자세 교정</h3>
              {!isCameraOn ? (
                <button
                  onClick={startCamera}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  카메라 시작
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  카메라 종료
                </button>
              )}
            </div>

            <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                style={{ transform: 'scaleX(-1)' }}
              />

              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📹</div>
                    <p className="text-xl font-semibold mb-2">카메라를 시작해주세요</p>
                    {cameraError && (
                      <p className="text-red-400 text-sm">{cameraError}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 포즈 분석 HUD */}
              {isCameraOn && poseAnalysis && (
                <div className="absolute left-3 top-3 bg-black/70 backdrop-blur-md rounded-lg p-3 text-xs min-w-[200px]">
                  <div className="mb-2">
                    <span className="font-bold text-purple-400">점수:</span>
                    <span className="ml-2 text-green-400 font-bold text-base">{poseAnalysis.score}</span>
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div>어깨: <span className="text-green-400">{poseAnalysis.shoulders}</span></div>
                    <div>골반: <span className="text-green-400">{poseAnalysis.hips}</span></div>
                    <div>척추: <span className="text-green-400">{poseAnalysis.spine}</span></div>
                    <div>팔: <span className="text-green-400">{poseAnalysis.elbows}</span></div>
                  </div>
                  
                  {poseAnalysis.errorCodes.length > 0 && (
                    <>
                      <hr className="my-2 border-gray-600" />
                      <div className="text-[11px]">
                        <div className="text-red-400 font-semibold">오류: {poseAnalysis.errorCodes.join(', ')}</div>
                      </div>
                    </>
                  )}
                  
                  {poseAnalysis.hints.length > 0 && (
                    <>
                      <hr className="my-2 border-gray-600" />
                      <div className="text-[11px]">
                        <ul className="space-y-0.5">
                          {poseAnalysis.hints.map((hint, idx) => (
                            <li key={idx} className="text-yellow-300">• {hint}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

        {/* 웹캠 영역 */}
        <div className="mb-6">
          <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />

            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-xl font-semibold mb-2">카메라를 시작해주세요</p>
                  {cameraError && (
                    <p className="text-red-400 text-sm">{cameraError}</p>
                  )}
                </div>
              </div>
            )}

            {isCameraOn && isPoseDetecting && (
              <>
                {/* AI 분석 HUD */}
                <div className="absolute left-4 top-4 bg-black/70 backdrop-blur-md rounded-xl p-4 text-sm space-y-2 min-w-[250px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg">AI 자세 분석</span>
                    <span className="text-2xl font-bold text-green-400">{poseAnalysis.score}</span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>어깨 수평:</span>
                      <span className="text-green-400 font-semibold">{poseAnalysis.shoulders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>골반 수평:</span>
                      <span className="text-green-400 font-semibold">{poseAnalysis.hips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>척추 수직:</span>
                      <span className="text-green-400 font-semibold">{poseAnalysis.spine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>팔꿈치 각도:</span>
                      <span className="text-green-400 font-semibold">{poseAnalysis.elbows}</span>
                    </div>
                  </div>

                  {poseAnalysis.errorCodes.length > 0 && (
                    <>
                      <hr className="border-gray-600 my-2" />
                      <div>
                        <div className="font-semibold text-red-400 mb-1">
                          오류 부위: [{poseAnalysis.errorCodes.join(', ')}]
                        </div>
                        <div className="text-xs text-gray-400">
                          1=왼팔, 2=오른팔, 3=왼다리, 4=오른다리
                        </div>
                      </div>
                    </>
                  )}

                  {poseAnalysis.hints.length > 0 && (
                    <>
                      <hr className="border-gray-600 my-2" />
                      <div>
                        <div className="font-semibold mb-1">교정 안내</div>
                        <ul className="space-y-1">
                          {poseAnalysis.hints.map((hint, i) => (
                            <li key={i} className="text-yellow-400 text-xs">• {hint}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                {/* AI 분석 중 표시 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  AI 자세 분석 중
                </div>
              </>
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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#2A2B30] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{currentExercise.exercise_name}</h2>
                <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                  {typeNameMap[currentExercise.exercise_type] || currentExercise.exercise_type}
                </span>
              </div>
              
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

      <style>{`
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