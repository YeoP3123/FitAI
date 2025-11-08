from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/pose-analysis", response_class=HTMLResponse)
async def pose_analysis():
    """실시간 포즈 분석 페이지"""
    html_content = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FITAI - 실시간 자세 분석</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Noto Sans KR', system-ui, -apple-system, sans-serif;
            background: #0f0f0f;
            color: #fff;
            padding: 20px;
        }
        #pose-app {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .controls {
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        button {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
        }
        #btnStart {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        #btnStart:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        #btnStop {
            background: #ff4757;
            color: white;
        }
        #btnStop:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        select {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #333;
            background: #1a1a1a;
            color: white;
            cursor: pointer;
        }
        .video-container {
            position: relative;
            width: 100%;
            aspect-ratio: 16/9;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        video, canvas {
            width: 100%;
            height: 100%;
        }
        video {
            object-fit: cover;
        }
        canvas {
            position: absolute;
            left: 0;
            top: 0;
        }
        #hud {
            position: absolute;
            left: 20px;
            top: 20px;
            padding: 16px 20px;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.6;
            min-width: 280px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        #hud b { color: #667eea; }
        #hud hr {
            border: none;
            border-top: 1px solid rgba(255,255,255,0.1);
            margin: 12px 0;
        }
        .score-value {
            display: inline-block;
            min-width: 40px;
            text-align: right;
            font-weight: 600;
            color: #00ff88;
        }
        #errText {
            color: #ff4757;
            font-weight: 600;
            margin-top: 8px;
        }
        #hints {
            list-style: none;
            padding-left: 0;
        }
        #hints li {
            padding: 4px 0;
            color: #ffd166;
        }
        .info {
            font-size: 13px;
            color: #888;
            margin-top: 16px;
            line-height: 1.6;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            background: rgba(102, 126, 234, 0.2);
            color: #667eea;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div id="pose-app">
        <h1>🏋️ FITAI - 실시간 자세 분석</h1>
        
        <div class="controls">
            <button id="btnStart">카메라 시작</button>
            <button id="btnStop" disabled>중지</button>
            <label>
                해상도:
                <select id="selRes">
                    <option value="640x480">640×480</option>
                    <option value="960x540">960×540</option>
                    <option value="1280x720" selected>1280×720</option>
                </select>
            </label>
            <label>
                FPS:
                <select id="selFps">
                    <option>15</option>
                    <option selected>30</option>
                    <option>60</option>
                </select>
            </label>
            <span id="status" class="status">대기 중</span>
        </div>

        <div class="video-container">
            <video id="cam" playsinline autoplay muted></video>
            <canvas id="overlay"></canvas>

            <div id="hud">
                <div style="margin-bottom: 12px;">
                    <b>종합 점수</b>: <span id="score" class="score-value">0.0</span>
                </div>
                <div>어깨 수평: <span id="s_sh" class="score-value">0</span></div>
                <div>골반 수평: <span id="s_hp" class="score-value">0</span></div>
                <div>척추 수직: <span id="s_sp" class="score-value">0</span></div>
                <div>팔꿈치 각도: <span id="s_el" class="score-value">0</span></div>
                
                <hr>
                
                <div>
                    <b>오류 부위</b> 
                    <small>(1=왼팔, 2=오른팔, 3=왼다리, 4=오른다리)</small>
                </div>
                <div id="errText">ERR: []</div>
                <div id="errCodes" style="display:none;"></div>
                
                <hr>
                
                <div><b>교정 안내</b></div>
                <ul id="hints"></ul>
            </div>
        </div>

        <p class="info">
            💡 모든 처리는 브라우저에서 실시간으로 수행됩니다.<br>
            틀린 부위는 <span style="color:#ff3333;">빨간색</span>으로 강조되며, 
            오류코드가 실시간으로 표시됩니다.
        </p>
    </div>

<script type="module">
/* ================== 임계값 ================== */
const THRESH_SHOULDERS_ERR = 0.08;
const THRESH_HIPS_ERR      = 0.10;
const THRESH_SPINE_ANGLE   = 30;
const TARGET_ELBOW_DEG     = 160;
const WIDTH_ELBOW_SIGM     = 35;
const MIN_ELBOW_SCORE      = 6;

const TARGET_KNEE_DEG      = 175;
const ALLOW_KNEE_DEVI      = 20;

/* ================== MediaPipe ================== */
import {
  FilesetResolver,
  PoseLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.13/vision_bundle.mjs";

/* ================== DOM ================== */
const btnStart = document.getElementById("btnStart");
const btnStop  = document.getElementById("btnStop");
const selRes   = document.getElementById("selRes");
const selFps   = document.getElementById("selFps");
const statusEl = document.getElementById("status");

const video  = document.getElementById("cam");
const canvas = document.getElementById("overlay");
const ctx    = canvas.getContext("2d");
const scoreEl= document.getElementById("score");
const s_sh   = document.getElementById("s_sh");
const s_hp   = document.getElementById("s_hp");
const s_sp   = document.getElementById("s_sp");
const s_el   = document.getElementById("s_el");
const hintsUl= document.getElementById("hints");
const errText= document.getElementById("errText");
const errCodesEl = document.getElementById("errCodes");

/* ================== 상태 ================== */
let landmarker = null, running = false, lastVideoTime = -1, emaScore = null, stream = null, rafId = null;

/* ================== 색상/연결 ================== */
const C_WHITE = "#ffffff", C_GOOD="#00ff88", C_WARN="#ffd166", C_BAD="#ff3333", C_OKCONN="#00ff00";
const CONN = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];

/* ================== 유틸 ================== */
function lerp(a,b,t){ return a+(b-a)*t; }
function ema(prev, curr, alpha=0.3){ return (prev==null)? curr : lerp(prev, curr, alpha); }
function clamp(x, lo, hi){ return Math.max(lo, Math.min(hi, x)); }

function resizeCanvasToDisplaySize() {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}
function len2(ax,ay, bx,by){ const dx=ax-bx, dy=ay-by; return Math.hypot(dx,dy); }
function angleDeg(ax,ay, bx,by, cx,cy){
  const bax=ax-bx, bay=ay-by, bcx=cx-bx, bcy=cy-by;
  const na=Math.hypot(bax,bay), nb=Math.hypot(bcx,bcy);
  if(!na||!nb) return null;
  let cos=(bax*bcx + bay*bcy)/(na*nb);
  cos=clamp(cos,-1,1);
  return Math.acos(cos)*180/Math.PI;
}
function huberLike(err, delta){ const a=Math.abs(err); return (a<=delta)? 1-(a/(2*delta)) : Math.max(0, 0.5*(delta/a)); }
function sigmoidScore(x, center, width, maxScore){
  const s = 1 / (1 + Math.exp(Math.abs(x-center)/Math.max(1e-6,width)));
  return maxScore * s;
}

/* ================== 스코어링 & 플래그 ================== */
function scoreAndFlags(lm){
  const I = { LS:11, RS:12, LE:13, RE:14, LW:15, RW:16, LH:23, RH:24, LK:25, RK:26, LA:27, RA:28 };
  const W = canvas.clientWidth, H = canvas.clientHeight;
  function P(i){ const p = lm[i]; return {x:p.x*W, y:p.y*H, v:p.visibility??1}; }

  const LS=P(I.LS), RS=P(I.RS), LE=P(I.LE), RE=P(I.RE), LW=P(I.LW), RW=P(I.RW),
        LH=P(I.LH), RH=P(I.RH), LK=P(I.LK), RK=P(I.RK), LA=P(I.LA), RA=P(I.RA);

  const midSh = {x:(LS.x+RS.x)/2, y:(LS.y+RS.y)/2};
  const midHp = {x:(LH.x+RH.x)/2, y:(LH.y+RH.y)/2};

  const shoulderW = len2(LS.x,LS.y, RS.x,RS.y);
  const torso     = len2(midSh.x,midSh.y, midHp.x,midHp.y);
  const scale     = Math.max(1e-6, 0.5*(shoulderW + torso));

  const shouldersErr = Math.abs(LS.y - RS.y) / scale;
  const hipsErr      = Math.abs(LH.y - RH.y) / scale;

  const shScore  = 25 * huberLike(shouldersErr, THRESH_SHOULDERS_ERR);
  const hpScore  = 25 * huberLike(hipsErr,      THRESH_HIPS_ERR) * (20/25);

  const v = {x: midSh.x - midHp.x, y: midSh.y - midHp.y};
  const angVert = Math.abs(Math.atan2(Math.abs(v.x), Math.abs(v.y))*180/Math.PI);
  const spScore = 25 * huberLike(angVert, THRESH_SPINE_ANGLE);

  const L_ang = angleDeg(LS.x,LS.y, LE.x,LE.y, LW.x,LW.y);
  const R_ang = angleDeg(RS.x,RS.y, RE.x,RE.y, RW.x,RW.y);
  const L_el  = L_ang? sigmoidScore(L_ang, TARGET_ELBOW_DEG, WIDTH_ELBOW_SIGM, 15):0;
  const R_el  = R_ang? sigmoidScore(R_ang, TARGET_ELBOW_DEG, WIDTH_ELBOW_SIGM, 15):0;
  const elScore = L_el + R_el;

  const L_knee = angleDeg(LH.x,LH.y, LK.x,LK.y, LA.x,LA.y);
  const R_knee = angleDeg(RH.x,RH.y, RK.x,RK.y, RA.x,RA.y);
  const L_knee_bad = (L_knee!=null) && (Math.abs(L_knee - TARGET_KNEE_DEG) > ALLOW_KNEE_DEVI);
  const R_knee_bad = (R_knee!=null) && (Math.abs(R_knee - TARGET_KNEE_DEG) > ALLOW_KNEE_DEVI);

  const visAvg = (LS.v+RS.v+LH.v+RH.v+LE.v+RE.v+LW.v+RW.v+LK.v+RK.v+LA.v+RA.v)/12;
  const visW   = clamp(0.7 + 0.3*visAvg, 0.7, 1.0);

  const comps = {
    shoulders_level: Math.round(shScore),
    hips_level:      Math.round(hpScore),
    spine_vertical:  Math.round(spScore),
    elbows_angle:    Math.round(elScore),
  };
  let total = (comps.shoulders_level + comps.hips_level + comps.spine_vertical + comps.elbows_angle) * visW;
  total = clamp(total, 0, 100);

  const leftArmBad  = (L_el < MIN_ELBOW_SCORE);
  const rightArmBad = (R_el < MIN_ELBOW_SCORE);
  const leftLegBad  = !!L_knee_bad;
  const rightLegBad = !!R_knee_bad;

  return {
    total, comps,
    points: {LS,RS,LE,RE,LW,RW,LH,RH,LK,RK,LA,RA, midSh, midHp},
    issues: {leftArmBad, rightArmBad, leftLegBad, rightLegBad,
             shouldersErr, hipsErr, angVert}
  };
}

/* ================== 그리기 헬퍼 ================== */
function drawGrid(){
  ctx.strokeStyle = "rgba(255,255,255,.15)";
  ctx.lineWidth = 1;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  ctx.beginPath();
  ctx.moveTo(W/3, 0);   ctx.lineTo(W/3, H);
  ctx.moveTo(2*W/3, 0); ctx.lineTo(2*W/3, H);
  ctx.moveTo(0, H/3);   ctx.lineTo(W, H/3);
  ctx.moveTo(0, 2*H/3); ctx.lineTo(W, 2*H/3);
  ctx.stroke();
}
function dot(x,y,r,color,glow=true){
  if(glow){ ctx.shadowColor = color; ctx.shadowBlur = 12; }
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
}
function strokeLine(x1,y1,x2,y2,color,width=3,glow=true){
  ctx.lineWidth = width; ctx.strokeStyle = color;
  if(glow){ ctx.shadowColor = color; ctx.shadowBlur = 10; }
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.shadowBlur = 0;
}

/* ================== 포즈 오버레이 + 강조 ================== */
function drawPose(lm, pts, issues){
  for (const [a,b] of CONN) {
    const p = lm[a], q = lm[b];
    strokeLine(p.x*canvas.clientWidth, p.y*canvas.clientHeight,
               q.x*canvas.clientWidth, q.y*canvas.clientHeight, C_OKCONN, 3, false);
  }
  for (const p of lm) dot(p.x*canvas.clientWidth, p.y*canvas.clientHeight, 3, C_WHITE, false);

  const shoulderBad = (issues.shouldersErr > THRESH_SHOULDERS_ERR*1.2);
  const hipBad      = (issues.hipsErr      > THRESH_HIPS_ERR*1.2);
  const spineBad    = (issues.angVert      > THRESH_SPINE_ANGLE*1.2);

  if (shoulderBad){
    strokeLine(pts.LS.x, pts.LS.y, pts.RS.x, pts.RS.y, C_BAD, 6); 
    dot(pts.LS.x, pts.LS.y, 5, C_BAD); dot(pts.RS.x, pts.RS.y, 5, C_BAD);
  }
  if (hipBad){
    strokeLine(pts.LH.x, pts.LH.y, pts.RH.x, pts.RH.y, C_BAD, 6); 
    dot(pts.LH.x, pts.LH.y, 5, C_BAD); dot(pts.RH.x, pts.RH.y, 5, C_BAD);
  }
  if (spineBad){
    strokeLine(pts.midSh.x, pts.midSh.y, pts.midHp.x, pts.midHp.y, C_BAD, 6);
    dot(pts.midSh.x, pts.midSh.y, 6, C_BAD); dot(pts.midHp.x, pts.midHp.y, 6, C_BAD);
  }

  if (issues.leftArmBad){
    strokeLine(pts.LS.x, pts.LS.y, pts.LE.x, pts.LE.y, C_BAD, 6);
    strokeLine(pts.LE.x, pts.LE.y, pts.LW.x, pts.LW.y, C_BAD, 6);
    dot(pts.LE.x, pts.LE.y, 6, C_BAD);
  }
  if (issues.rightArmBad){
    strokeLine(pts.RS.x, pts.RS.y, pts.RE.x, pts.RE.y, C_BAD, 6);
    strokeLine(pts.RE.x, pts.RE.y, pts.RW.x, pts.RW.y, C_BAD, 6);
    dot(pts.RE.x, pts.RE.y, 6, C_BAD);
  }

  if (issues.leftLegBad){
    strokeLine(pts.LH.x, pts.LH.y, pts.LK.x, pts.LK.y, C_BAD, 6);
    strokeLine(pts.LK.x, pts.LK.y, pts.LA.x, pts.LA.y, C_BAD, 6);
    dot(pts.LK.x, pts.LK.y, 6, C_BAD);
  }
  if (issues.rightLegBad){
    strokeLine(pts.RH.x, pts.RH.y, pts.RK.x, pts.RK.y, C_BAD, 6);
    strokeLine(pts.RK.x, pts.RK.y, pts.RA.x, pts.RA.y, C_BAD, 6);
    dot(pts.RK.x, pts.RK.y, 6, C_BAD);
  }
}

/* ================== 루프 & 오류코드 방출 ================== */
function setErrorCodes(codes){
  errText.textContent = "ERR: ["+codes.join(",")+"]";
  errCodesEl.textContent = codes.join(",");
  console.log("POSE_ERR codes:", codes);
  window.dispatchEvent(new CustomEvent('poseErrorCodes', { detail: { codes } }));
}

function drawFrame(result){
  resizeCanvasToDisplaySize();
  ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
  drawGrid(); hintsUl.innerHTML = "";

  if (!result || !result.landmarks || !result.landmarks.length){
    setErrorCodes([]);
    scoreEl.textContent = "0.0";
    s_sh.textContent = s_hp.textContent = s_sp.textContent = s_el.textContent = "0";
    ctx.fillStyle = C_BAD; ctx.font = "16px system-ui, sans-serif"; 
    ctx.fillText("포즈가 감지되지 않습니다", 12, 24);
    return;
  }

  const lm = result.landmarks[0];
  const { total, comps, points, issues } = scoreAndFlags(lm);
  emaScore = ema(emaScore, total, 0.3);

  drawPose(lm, points, issues);

  scoreEl.textContent = (emaScore ?? total).toFixed(1);
  s_sh.textContent = comps.shoulders_level;
  s_hp.textContent = comps.hips_level;
  s_sp.textContent = comps.spine_vertical;
  s_el.textContent = comps.elbows_angle;

  function hint(t){ const li=document.createElement("li"); li.textContent=t; hintsUl.appendChild(li); }
  if (issues.leftArmBad)  hint("왼팔(팔꿈치 각도) 교정 필요");
  if (issues.rightArmBad) hint("오른팔(팔꿈치 각도) 교정 필요");
  if (issues.leftLegBad)  hint("왼쪽 무릎 각도 교정 필요");
  if (issues.rightLegBad) hint("오른쪽 무릎 각도 교정 필요");

  const codes = [];
  if (issues.leftArmBad)  codes.push(1);
  if (issues.rightArmBad) codes.push(2);
  if (issues.leftLegBad)  codes.push(3);
  if (issues.rightLegBad) codes.push(4);
  setErrorCodes(codes);
}

/* ================== 시작/중지 ================== */
async function initLandmarker(){
  statusEl.textContent = "모델 로딩 중...";
  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.13/wasm"
  );
  landmarker = await PoseLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task" },
    runningMode: "VIDEO",
    numPoses: 1
  });
  statusEl.textContent = "준비 완료";
}

async function startCamera(){
  const [w,h] = selRes.value.split("x").map(Number);
  const fps = Number(selFps.value);
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width:{ideal:w}, height:{ideal:h}, frameRate:{ideal:fps} },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    running = true; btnStart.disabled = true; btnStop.disabled = false;
    statusEl.textContent = "실행 중";
    loop();
  } catch(e){
    console.error(e);
    statusEl.textContent = "카메라 시작 실패";
    alert("카메라 권한/장치를 확인해 주세요.");
    btnStart.disabled = false; btnStop.disabled = true;
  }
}
function stopCamera(){
  running = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
  hintsUl.innerHTML = ""; setErrorCodes([]);
  scoreEl.textContent = "0.0";
  s_sh.textContent = s_hp.textContent = s_sp.textContent = s_el.textContent = "0";
  emaScore = null; statusEl.textContent = "중지됨";
  btnStart.disabled = false; btnStop.disabled  = true;
}
function loop(){
  if (!running || !landmarker) return;
  const t = performance.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const result = landmarker.detectForVideo(video, t);
    drawFrame(result);
  }
  rafId = requestAnimationFrame(loop);
}

/* ================== 바인딩 ================== */
btnStart.addEventListener("click", async () => {
  btnStart.disabled = true;
  if (!landmarker) await initLandmarker();
  await startCamera();
});
btnStop.addEventListener("click", stopCamera);
window.addEventListener("beforeunload", stopCamera);
</script>
</body>
</html>
    """
    return HTMLResponse(content=html_content)


@app.get("/")
async def root():
    return {"message": "FITAI Backend API", "version": "1.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)