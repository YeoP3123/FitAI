from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import base64
import cv2
import numpy as np
import mediapipe as mp
import math
import boto3
import json
import time

app = FastAPI()

# MediaPipe 초기화
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# ============= 왼팔 + 왼쪽 다리 + 오른쪽 다리 IoT 기능 추가 =============
# AWS IoT Core 클라이언트
iot_client = boto3.client('iot-data', region_name='ap-northeast-2')

# 왼팔 오류 관리 - 지속시간 기반
left_arm_error_start_time = None  # 오류 시작 시간
left_arm_error_sent_time = 0      # 마지막 알림 전송 시간
LEFT_ARM_DURATION_THRESHOLD = 3.0  # 3초간 지속되어야 알림
LEFT_ARM_COOLDOWN_SECONDS = 10.0   # 10초 쿨다운

# 왼쪽 다리 오류 관리 - 지속시간 기반
left_leg_error_start_time = None  # 오류 시작 시간
left_leg_error_sent_time = 0      # 마지막 알림 전송 시간
LEFT_LEG_DURATION_THRESHOLD = 3.0  # 3초간 지속되어야 알림
LEFT_LEG_COOLDOWN_SECONDS = 10.0   # 10초 쿨다운

# 오른쪽 다리 오류 관리 - 지속시간 기반
right_leg_error_start_time = None  # 오류 시작 시간
right_leg_error_sent_time = 0      # 마지막 알림 전송 시간
RIGHT_LEG_DURATION_THRESHOLD = 3.0  # 3초간 지속되어야 알림
RIGHT_LEG_COOLDOWN_SECONDS = 10.0   # 10초 쿨다운

# 오른팔 오류 관리 - 지속시간 기반
right_arm_error_start_time = None  # 오류 시작 시간
right_arm_error_sent_time = 0      # 마지막 알림 전송 시간
RIGHT_ARM_DURATION_THRESHOLD = 3.0  # 3초간 지속되어야 알림
RIGHT_ARM_COOLDOWN_SECONDS = 10.0   # 10초 쿨다운

def check_left_arm_error_duration(has_error):
    """왼팔 오류가 일정 시간 지속되는지 체크하고 알림 전송"""
    global left_arm_error_start_time, left_arm_error_sent_time
    
    current_time = time.time()
    
    if has_error:
        # 오류가 있는 상태
        if left_arm_error_start_time is None:
            # 오류 시작
            left_arm_error_start_time = current_time
            print(f"⚠️ 왼팔 오류 감지 시작 - {LEFT_ARM_DURATION_THRESHOLD}초 대기 중...")
            return False
        else:
            # 오류가 계속 지속 중
            error_duration = current_time - left_arm_error_start_time
            
            if error_duration >= LEFT_ARM_DURATION_THRESHOLD:
                # 임계 시간 이상 지속됨 - 쿨다운 체크
                if current_time - left_arm_error_sent_time >= LEFT_ARM_COOLDOWN_SECONDS:
                    # 알림 전송
                    success = send_left_arm_alert()
                    if success:
                        left_arm_error_sent_time = current_time
                        print(f"🚨 왼팔 오류 {error_duration:.1f}초 지속 - 알림 전송!")
                        return True
                else:
                    cooldown_remaining = LEFT_ARM_COOLDOWN_SECONDS - (current_time - left_arm_error_sent_time)
                    print(f"🔄 왼팔 오류 지속 중 - 쿨다운 {cooldown_remaining:.1f}초 남음")
                    return False
            else:
                # 아직 임계 시간 미달
                remaining_time = LEFT_ARM_DURATION_THRESHOLD - error_duration
                print(f"⏳ 왼팔 오류 지속 중 - {remaining_time:.1f}초 후 알림 예정")
                return False
    else:
        # 오류가 없는 상태 - 리셋
        if left_arm_error_start_time is not None:
            error_duration = current_time - left_arm_error_start_time
            print(f"✅ 왼팔 오류 해결됨 (지속시간: {error_duration:.1f}초)")
            left_arm_error_start_time = None
        return False

def check_left_leg_error_duration(has_error):
    """왼쪽 다리 오류가 일정 시간 지속되는지 체크하고 알림 전송"""
    global left_leg_error_start_time, left_leg_error_sent_time
    
    current_time = time.time()
    
    if has_error:
        # 오류가 있는 상태
        if left_leg_error_start_time is None:
            # 오류 시작
            left_leg_error_start_time = current_time
            print(f"⚠️ 왼쪽 다리 오류 감지 시작 - {LEFT_LEG_DURATION_THRESHOLD}초 대기 중...")
            return False
        else:
            # 오류가 계속 지속 중
            error_duration = current_time - left_leg_error_start_time
            
            if error_duration >= LEFT_LEG_DURATION_THRESHOLD:
                # 임계 시간 이상 지속됨 - 쿨다운 체크
                if current_time - left_leg_error_sent_time >= LEFT_LEG_COOLDOWN_SECONDS:
                    # 알림 전송
                    success = send_left_leg_alert()
                    if success:
                        left_leg_error_sent_time = current_time
                        print(f"🚨 왼쪽 다리 오류 {error_duration:.1f}초 지속 - 알림 전송!")
                        return True
                else:
                    cooldown_remaining = LEFT_LEG_COOLDOWN_SECONDS - (current_time - left_leg_error_sent_time)
                    print(f"🔄 왼쪽 다리 오류 지속 중 - 쿨다운 {cooldown_remaining:.1f}초 남음")
                    return False
            else:
                # 아직 임계 시간 미달
                remaining_time = LEFT_LEG_DURATION_THRESHOLD - error_duration
                print(f"⏳ 왼쪽 다리 오류 지속 중 - {remaining_time:.1f}초 후 알림 예정")
                return False
    else:
        # 오류가 없는 상태 - 리셋
        if left_leg_error_start_time is not None:
            error_duration = current_time - left_leg_error_start_time
            print(f"✅ 왼쪽 다리 오류 해결됨 (지속시간: {error_duration:.1f}초)")
            left_leg_error_start_time = None
        return False

def check_right_leg_error_duration(has_error):
    """오른쪽 다리 오류가 일정 시간 지속되는지 체크하고 알림 전송"""
    global right_leg_error_start_time, right_leg_error_sent_time
    
    current_time = time.time()
    
    if has_error:
        # 오류가 있는 상태
        if right_leg_error_start_time is None:
            # 오류 시작
            right_leg_error_start_time = current_time
            print(f"⚠️ 오른쪽 다리 오류 감지 시작 - {RIGHT_LEG_DURATION_THRESHOLD}초 대기 중...")
            return False
        else:
            # 오류가 계속 지속 중
            error_duration = current_time - right_leg_error_start_time
            
            if error_duration >= RIGHT_LEG_DURATION_THRESHOLD:
                # 임계 시간 이상 지속됨 - 쿨다운 체크
                if current_time - right_leg_error_sent_time >= RIGHT_LEG_COOLDOWN_SECONDS:
                    # 알림 전송
                    success = send_right_leg_alert()
                    if success:
                        right_leg_error_sent_time = current_time
                        print(f"🚨 오른쪽 다리 오류 {error_duration:.1f}초 지속 - 알림 전송!")
                        return True
                else:
                    cooldown_remaining = RIGHT_LEG_COOLDOWN_SECONDS - (current_time - right_leg_error_sent_time)
                    print(f"🔄 오른쪽 다리 오류 지속 중 - 쿨다운 {cooldown_remaining:.1f}초 남음")
                    return False
            else:
                # 아직 임계 시간 미달
                remaining_time = RIGHT_LEG_DURATION_THRESHOLD - error_duration
                print(f"⏳ 오른쪽 다리 오류 지속 중 - {remaining_time:.1f}초 후 알림 예정")
                return False
    else:
        # 오류가 없는 상태 - 리셋
        if right_leg_error_start_time is not None:
            error_duration = current_time - right_leg_error_start_time
            print(f"✅ 오른쪽 다리 오류 해결됨 (지속시간: {error_duration:.1f}초)")
            right_leg_error_start_time = None
        return False

def check_right_arm_error_duration(has_error):
    """오른팔 오류가 일정 시간 지속되는지 체크하고 알림 전송"""
    global right_arm_error_start_time, right_arm_error_sent_time
    
    current_time = time.time()
    
    if has_error:
        # 오류가 있는 상태
        if right_arm_error_start_time is None:
            # 오류 시작
            right_arm_error_start_time = current_time
            print(f"⚠️ 오른팔 오류 감지 시작 - {RIGHT_ARM_DURATION_THRESHOLD}초 대기 중...")
            return False
        else:
            # 오류가 계속 지속 중
            error_duration = current_time - right_arm_error_start_time
            
            if error_duration >= RIGHT_ARM_DURATION_THRESHOLD:
                # 임계 시간 이상 지속됨 - 쿨다운 체크
                if current_time - right_arm_error_sent_time >= RIGHT_ARM_COOLDOWN_SECONDS:
                    # 알림 전송
                    success = send_right_arm_alert()
                    if success:
                        right_arm_error_sent_time = current_time
                        print(f"🚨 오른팔 오류 {error_duration:.1f}초 지속 - 알림 전송!")
                        return True
                else:
                    cooldown_remaining = RIGHT_ARM_COOLDOWN_SECONDS - (current_time - right_arm_error_sent_time)
                    print(f"🔄 오른팔 오류 지속 중 - 쿨다운 {cooldown_remaining:.1f}초 남음")
                    return False
            else:
                # 아직 임계 시간 미달
                remaining_time = RIGHT_ARM_DURATION_THRESHOLD - error_duration
                print(f"⏳ 오른팔 오류 지속 중 - {remaining_time:.1f}초 후 알림 예정")
                return False
    else:
        # 오류가 없는 상태 - 리셋
        if right_arm_error_start_time is not None:
            error_duration = current_time - right_arm_error_start_time
            print(f"✅ 오른팔 오류 해결됨 (지속시간: {error_duration:.1f}초)")
            right_arm_error_start_time = None
        return False

def send_left_arm_alert():
    """왼팔 오류 시 ESP32로 알림 전송"""
    try:
        message = {
            "action": "left_arm_error",
            "timestamp": time.time(),
            "message": "왼팔 자세 교정 필요"
        }
        
        response = iot_client.publish(
            topic='esp32/buzzer/control',
            qos=1,
            payload=json.dumps(message)
        )
        
        print("✅ 왼팔 교정 알림 전송 완료")
        return True
        
    except Exception as e:
        print(f"❌ 왼팔 ESP32 알림 전송 실패: {e}")
        return False

def send_left_leg_alert():
    """왼쪽 다리 오류 시 ESP32로 알림 전송"""
    try:
        message = {
            "action": "left_leg_error",
            "timestamp": time.time(),
            "message": "왼쪽 다리 자세 교정 필요"
        }
        
        response = iot_client.publish(
            topic='esp32/left_leg/buzzer/control',
            qos=1,
            payload=json.dumps(message)
        )
        
        print("✅ 왼쪽 다리 교정 알림 전송 완료")
        return True
        
    except Exception as e:
        print(f"❌ 왼쪽 다리 ESP32 알림 전송 실패: {e}")
        return False

def send_right_leg_alert():
    """오른쪽 다리 오류 시 ESP32로 알림 전송"""
    try:
        message = {
            "action": "right_leg_error",
            "timestamp": time.time(),
            "message": "오른쪽 다리 자세 교정 필요"
        }
        
        response = iot_client.publish(
            topic='esp32/right_leg/buzzer/control',
            qos=1,
            payload=json.dumps(message)
        )
        
        print("✅ 오른쪽 다리 교정 알림 전송 완료")
        return True
        
    except Exception as e:
        print(f"❌ 오른쪽 다리 ESP32 알림 전송 실패: {e}")
        return False

def send_right_arm_alert():
    """오른팔 오류 시 ESP32로 알림 전송"""
    try:
        message = {
            "action": "right_arm_error",
            "timestamp": time.time(),
            "message": "오른팔 자세 교정 필요"
        }
        
        response = iot_client.publish(
            topic='esp32/right_arm/buzzer/control',
            qos=1,
            payload=json.dumps(message)
        )
        
        print("✅ 오른팔 교정 알림 전송 완료")
        return True
        
    except Exception as e:
        print(f"❌ 오른팔 ESP32 알림 전송 실패: {e}")
        return False
# ============= 왼팔 + 왼쪽 다리 + 오른쪽 다리 + 오른팔 IoT 기능 추가 끝 =============

class PoseAnalysisRequest(BaseModel):
    image: str
    exercise_code: str = "standing"

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== 운동 코드 매핑 ==================
EXERCISE_CODE_MAPPING = {
    "001": "squat",      # 스쿼트
    "002": "lunge",      # 런지
    "003": "pushup",     # 푸시업
    "004": "plank",      # 플랭크
    "005": "standing",   # 체어 딥스 (기본 자세)
    "006": "standing",   # 마운틴 클라이머 (기본 자세)
}

# ================== 유틸리티 함수 ==================
def _len3(a, b):
    """3D 거리 계산"""
    dx, dy = a[0]-b[0], a[1]-b[1]
    dz = (a[2]-b[2]) if len(a)>2 else 0.0
    return math.sqrt(dx*dx + dy*dy + dz*dz)

def _angle_deg_3d(a, b, c):
    """3D 공간에서 세 점으로 이루어진 각도 계산 (b가 꼭짓점)"""
    bax, bay = a[0]-b[0], a[1]-b[1]
    baz = (a[2]-b[2]) if len(a)>2 else 0.0
    bcx, bcy = c[0]-b[0], c[1]-b[1]
    bcz = (c[2]-b[2]) if len(c)>2 else 0.0
    
    na = math.sqrt(bax*bax + bay*bay + baz*baz)
    nb = math.sqrt(bcx*bcx + bcy*bcy + bcz*bcz)
    
    if na == 0 or nb == 0:
        return None
    
    cosang = max(-1.0, min(1.0, (bax*bcx + bay*bcy + baz*bcz)/(na*nb)))
    return math.degrees(math.acos(cosang))

def _sigmoid_score(x, center, width, max_score):
    """시그모이드 기반 점수 계산"""
    s = 1.0 / (1.0 + math.exp((abs(x - center))/max(width, 1e-6)))
    return max_score * s

def _huber_like(err, delta):
    """Huber-like 손실 함수 - 더 가파른 감소"""
    aerr = abs(err)
    if aerr <= delta:
        return 1.0 - (aerr / delta)
    return max(0.0, 0.3 * (delta / aerr))

def _safe_get_xyz(lms, idx):
    """랜드마크에서 안전하게 x, y, z, visibility 추출"""
    lm = lms[idx]
    return (lm['x'], lm['y'], lm.get('z', 0.0), lm.get('visibility', 1.0))

def _component_vis_ok(vlist, thr=0.5, frac=0.6):
    """컴포넌트의 가시성이 충분한지 체크"""
    vs = [v for v in vlist if v is not None]
    if not vs:
        return False
    good = sum(1 for v in vs if v >= thr)
    return (good / len(vs)) >= frac

# ================== 운동별 파라미터 ==================
EXERCISE_PARAMS = {
    "standing": {
        "target_elbow_deg": 160,
        "width_elbow_sigm": 25,
        "min_elbow_score": 6,
        "target_knee_deg": 175,
        "allow_knee_deviation": 20
    },
    "plank": {
        "target_elbow_deg": 170,
        "width_elbow_sigm": 25,
        "min_elbow_score": 7,
        "target_knee_deg": 175,
        "allow_knee_deviation": 20
    },
    "pushup": {
        "target_elbow_deg": 100,
        "width_elbow_sigm": 30,
        "min_elbow_score": 7,
        "target_knee_deg": 175,
        "allow_knee_deviation": 25
    },
    "squat": {
        "target_elbow_deg": 160,
        "width_elbow_sigm": 35,
        "min_elbow_score": 0,
        "target_knee_deg": 100,
        "allow_knee_deviation": 25
    },
    "lunge": {
        "target_elbow_deg": 160,
        "width_elbow_sigm": 35,
        "min_elbow_score": 3,
        "target_knee_deg": 100,
        "allow_knee_deviation": 30
    },
}

# ================== 반복(Rep) 카운터 ==================
class RepCounter:
    """
    스쿼트/런지 등 '위→아래→위' 패턴 운동의 반복 수를 세기 위한 상태 머신
    - knee_angle: 왼쪽 무릎 각도 기준 (도 단위)
    - 노이즈로 인한 오검출을 줄이기 위해
      ▷ 각도 변화 방향(내려감/올라감)
      ▷ 최소 움직임 각도
      ▷ down 상태 유지 프레임 수
      를 추가로 확인한다.
    """
    def __init__(
        self,
        top_thr: float,
        bottom_thr: float,
        name: str = "unknown",
        min_depth_bonus: float = 5.0,   # bottom_thr보다 최소 이만큼 더 내려가야 깊이 OK
        min_down_frames: int = 3,       # down 상태 최소 유지 프레임 수
        min_motion_deg: float = 10.0    # 한 번에 이 정도 이상 각도 차이가 있어야 "움직였다"로 인정
    ):
        self.name = name
        self.top_thr = top_thr
        self.bottom_thr = bottom_thr

        self.state = "top"   # "top" 또는 "down"
        self.total_reps = 0
        self.correct_reps = 0
        self.wrong_reps = 0

        self.current_rep_has_error = False
        self.current_rep_min_angle = 999.0

        # 노이즈 필터링용
        self.last_knee_angle = None
        self.down_frames = 0
        self.min_depth_bonus = min_depth_bonus
        self.min_down_frames = min_down_frames
        self.min_motion_deg = min_motion_deg

    def update(self, knee_angle: float, analysis: dict):
        """
        매 프레임마다 호출해서 상태 업데이트
        - knee_angle: 현재 프레임의 왼쪽 무릎 각도
        - analysis: score_pose_components의 결과(dict)
        """
        if knee_angle is None:
            return

        # 말도 안 되는 각도 값(인식 오류)은 무시
        if knee_angle < 60.0 or knee_angle > 200.0:
            return

        # last_knee_angle 초기화
        if self.last_knee_angle is None:
            self.last_knee_angle = knee_angle
            return

        prev_angle = self.last_knee_angle
        self.last_knee_angle = knee_angle

        # 각도 변화 방향
        moving_down = knee_angle < prev_angle
        moving_up = knee_angle > prev_angle
        motion_size = abs(knee_angle - prev_angle)

        # 이번 프레임에 오류가 있으면 플래그
        if analysis.get("errorCodes"):
            self.current_rep_has_error = True

        if self.state == "top":
            # top 상태에서는 down 관련 값 리셋
            self.current_rep_min_angle = 999.0
            self.down_frames = 0

            # "진짜 내려가기 시작" 조건
            if (moving_down and
                motion_size >= self.min_motion_deg and
                knee_angle < self.bottom_thr):

                self.state = "down"
                self.current_rep_has_error = bool(analysis.get("errorCodes"))
                self.current_rep_min_angle = knee_angle
                self.down_frames = 1

        elif self.state == "down":
            # 내려가는 구간에서 최소 각도 갱신
            self.current_rep_min_angle = min(self.current_rep_min_angle, knee_angle)

            # 충분히 내려간 상태가 유지되는 프레임 카운트
            if knee_angle < self.bottom_thr:
                self.down_frames += 1

            # "다시 올라와서 1회 완료" 조건
            if (moving_up and
                motion_size >= self.min_motion_deg and
                knee_angle > self.top_thr and
                self.down_frames >= self.min_down_frames):

                self.state = "top"
                self.total_reps += 1

                # 깊이 체크: bottom_thr보다 min_depth_bonus만큼 더 내려갔는지
                depth_ok = (self.current_rep_min_angle <
                            (self.bottom_thr - self.min_depth_bonus))

                # 점수 기준
                score_ok = (analysis.get("score", 0) >= 70.0)

                if (not self.current_rep_has_error) and depth_ok and score_ok:
                    self.correct_reps += 1
                else:
                    self.wrong_reps += 1

                # 다음 반복 준비
                self.current_rep_has_error = False
                self.current_rep_min_angle = 999.0
                self.down_frames = 0

    def as_dict(self):
        return {
            "name": self.name,
            "total": self.total_reps,
            "correct": self.correct_reps,
            "wrong": self.wrong_reps,
        }

# 스쿼트 / 런지 반복 카운터 (왼쪽 무릎 각도 기준)
SQUAT_COUNTER = RepCounter(top_thr=150.0, bottom_thr=110.0, name="squat")
LUNGE_COUNTER = RepCounter(top_thr=150.0, bottom_thr=110.0, name="lunge")

def _compute_left_knee_angle_from_landmarks(lms: list):
    """landmarks 리스트(dict들)에서 왼쪽 무릎 각도 계산"""
    PL = mp_pose.PoseLandmark
    try:
        lh = lms[PL.LEFT_HIP.value]
        lk = lms[PL.LEFT_KNEE.value]
        la = lms[PL.LEFT_ANKLE.value]

        a = (lh["x"], lh["y"], lh.get("z", 0.0))
        b = (lk["x"], lk["y"], lk.get("z", 0.0))
        c = (la["x"], la["y"], la.get("z", 0.0))

        return _angle_deg_3d(a, b, c)
    except Exception:
        return None

def update_rep_for_exercise(exercise_code_str: str, landmarks: list, analysis: dict):
    """
    스쿼트/런지일 때만 반복 카운터 업데이트
    - exercise_code_str: "squat", "lunge" 등 (이미 매핑된 문자열 기준)
    """
    knee_angle = _compute_left_knee_angle_from_landmarks(landmarks)
    if knee_angle is None:
        return None

    if exercise_code_str == "squat":
        SQUAT_COUNTER.update(knee_angle, analysis)
        return SQUAT_COUNTER.as_dict()
    elif exercise_code_str == "lunge":
        LUNGE_COUNTER.update(knee_angle, analysis)
        return LUNGE_COUNTER.as_dict()
    else:
        return None

def score_pose_components(lms, exercise_code="standing"):
    """포즈 분석 함수 - 팀원 수정사항 반영"""
    PL = mp_pose.PoseLandmark
    
    def G(i):
        return _safe_get_xyz(lms, i)
    
    ls = G(PL.LEFT_SHOULDER.value)
    rs = G(PL.RIGHT_SHOULDER.value)
    lh = G(PL.LEFT_HIP.value)
    rh = G(PL.RIGHT_HIP.value)
    le = G(PL.LEFT_ELBOW.value)
    re = G(PL.RIGHT_ELBOW.value)
    lw = G(PL.LEFT_WRIST.value)
    rw = G(PL.RIGHT_WRIST.value)
    lk = G(PL.LEFT_KNEE.value)
    rk = G(PL.RIGHT_KNEE.value)
    la = G(PL.LEFT_ANKLE.value)
    ra = G(PL.RIGHT_ANKLE.value)
    
    mid_sh = ((ls[0]+rs[0])/2, (ls[1]+rs[1])/2, (ls[2]+rs[2])/2)
    mid_hp = ((lh[0]+rh[0])/2, (lh[1]+rh[1])/2, (lh[2]+rh[2])/2)
    
    shoulder_w = _len3(ls, rs)
    torso_len = _len3(mid_sh, mid_hp)
    scale = max(1e-6, 0.5*(shoulder_w + torso_len))
    
    dx = rs[0]-ls[0]
    dz = rs[2]-ls[2]
    yaw_deg = abs(math.degrees(math.atan2(abs(dz), abs(dx)+1e-6)))
    
    exercise_lower = exercise_code.lower()
    requires_standing_check = exercise_lower in ["squat", "lunge"]
    
    params = EXERCISE_PARAMS.get(exercise_lower, EXERCISE_PARAMS["standing"])
    target_elbow_deg = params["target_elbow_deg"]
    width_elbow_sigm = params["width_elbow_sigm"]
    min_elbow_score = params["min_elbow_score"]
    target_knee_deg = params["target_knee_deg"]
    allow_knee_deviation = params["allow_knee_deviation"]
    
    if requires_standing_check:
        used_params = f"standing+{exercise_lower}"
    else:
        used_params = exercise_lower
    
    shoulders_err = abs(ls[1]-rs[1]) / scale
    
    def level_score(err, base_delta):
        delta = base_delta*(1.0 + 0.015*yaw_deg)
        return 25.0 * _huber_like(err, delta)
    
    sh_score = level_score(shoulders_err, 0.05)
    hips_err = abs(lh[1]-rh[1]) / scale
    hip_score = level_score(hips_err, 0.07) * (20.0/25.0)
    
    v = (mid_sh[0]-mid_hp[0], mid_sh[1]-mid_hp[1])
    nv = math.hypot(v[0], v[1])
    ang_vert = 90.0 if nv == 0 else abs(math.degrees(math.atan2(abs(v[0]), abs(v[1]))))
    spine_score = 25.0 * _huber_like(ang_vert, 20.0*(1.0 + 0.008*yaw_deg))
    
    L_ang = _angle_deg_3d((ls[0],ls[1],ls[2]), (le[0],le[1],le[2]), (lw[0],lw[1],lw[2]))
    R_ang = _angle_deg_3d((rs[0],rs[1],rs[2]), (re[0],re[1],re[2]), (rw[0],rw[1],rw[2]))
    
    def elbow_s(a, target=160.0, base_w=25.0):
        if a is None:
            return 0.0
        return _sigmoid_score(a, center=target, width=base_w*(1.0+0.008*yaw_deg), max_score=15.0)
    
    L_el = elbow_s(L_ang, target_elbow_deg, width_elbow_sigm)
    R_el = elbow_s(R_ang, target_elbow_deg, width_elbow_sigm)
    elbow_score = L_el + R_el
    
    L_knee = _angle_deg_3d((lh[0],lh[1],lh[2]), (lk[0],lk[1],lk[2]), (la[0],la[1],la[2]))
    R_knee = _angle_deg_3d((rh[0],rh[1],rh[2]), (rk[0],rk[1],rk[2]), (ra[0],ra[1],ra[2]))
    
    L_knee_bad = (L_knee is not None) and (abs(L_knee - target_knee_deg) > allow_knee_deviation)
    R_knee_bad = (R_knee is not None) and (abs(R_knee - target_knee_deg) > allow_knee_deviation)
    
    def gate(score, ok):
        return score if ok else score*0.15
    
    sh_ok = _component_vis_ok([ls[3], rs[3]], thr=0.55, frac=0.65)
    hp_ok = _component_vis_ok([lh[3], rh[3]], thr=0.55, frac=0.65)
    sp_ok = _component_vis_ok([ls[3], rs[3], lh[3], rh[3]], thr=0.55, frac=0.65)
    el_ok = _component_vis_ok([ls[3], le[3], lw[3], rs[3], re[3], rw[3]], thr=0.50, frac=0.55)
    
    sh_score = gate(sh_score, sh_ok)
    hip_score = gate(hip_score, hp_ok)
    spine_score = gate(spine_score, sp_ok)
    elbow_score = gate(elbow_score, el_ok)
    
    vis_avg = float(np.clip(np.mean([ls[3], rs[3], lh[3], rh[3], le[3], re[3], lw[3], rw[3]]), 0.0, 1.0))
    visibility_weight = float(np.clip(0.6 + 0.35*vis_avg, 0.6, 0.95))
    
    total = (sh_score + hip_score + spine_score + elbow_score) * visibility_weight
    total = max(0.0, min(100.0, total))
    
    left_arm_bad = False
    right_arm_bad = False
    left_leg_bad = False
    right_leg_bad = False
    
    if min_elbow_score > 0:
        if L_el < min_elbow_score:
            left_arm_bad = True
        if R_el < min_elbow_score:
            right_arm_bad = True
    
    left_leg_bad = L_knee_bad
    right_leg_bad = R_knee_bad
    
    error_codes = []
    if left_arm_bad:
        error_codes.append(1)
    if right_arm_bad:
        error_codes.append(2)
    if left_leg_bad:
        error_codes.append(3)
    if right_leg_bad:
        error_codes.append(4)
    
    hints = []
    if left_arm_bad:
        hints.append("왼팔(팔꿈치 각도) 교정 필요")
    if right_arm_bad:
        hints.append("오른팔(팔꿈치 각도) 교정 필요")
    if left_leg_bad:
        hints.append("왼쪽 무릎 각도 교정 필요")
    if right_leg_bad:
        hints.append("오른쪽 무릎 각도 교정 필요")
    
    THRESH_SHOULDERS_ERR = 0.05
    THRESH_HIPS_ERR = 0.07
    THRESH_SPINE_ANGLE = 20.0
    
    if shoulders_err > THRESH_SHOULDERS_ERR * 1.2:
        hints.append("어깨를 수평으로 유지하세요")
    if hips_err > THRESH_HIPS_ERR * 1.2:
        hints.append("골반을 수평으로 유지하세요")
    if ang_vert > THRESH_SPINE_ANGLE * 1.2:
        hints.append("상체를 똑바로 세우세요")
    
    comps = {
        "shoulders_level": round(sh_score, 2),
        "hips_level": round(hip_score, 2),
        "spine_vertical": round(spine_score, 2),
        "elbows_angle": round(elbow_score, 2),
    }
    
    return {
        "score": round(total, 1),
        "components": comps,
        "visibility_weight": round(visibility_weight, 3),
        "errorCodes": error_codes,
        "hints": hints,
        "exercise_code": used_params,
        "left_arm_bad": left_arm_bad,   # 왼팔 오류 상태 추가
        "left_leg_bad": left_leg_bad,   # 왼쪽 다리 오류 상태 추가
        "right_leg_bad": right_leg_bad, # 오른쪽 다리 오류 상태 추가
        "right_arm_bad": right_arm_bad  # 오른팔 오류 상태 추가
    }

@app.post("/api/analyze-pose")
async def analyze_pose(request: PoseAnalysisRequest):
    try:
        # 팀원 수정사항: exercise_code 변환 로직 개선
        exercise_code = EXERCISE_CODE_MAPPING.get(request.exercise_code, request.exercise_code.lower())
        print(f"🔍 받은 exercise_code: '{request.exercise_code}' → 변환: '{exercise_code}'")
        
        image_data = base64.b64decode(request.image.split(',')[1] if ',' in request.image else request.image)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        
        if not results.pose_landmarks:
            return JSONResponse(content={"success": False, "message": "No pose detected"})
        
        landmarks = []
        for landmark in results.pose_landmarks.landmark:
            landmarks.append({
                "x": landmark.x,
                "y": landmark.y,
                "z": landmark.z,
                "visibility": landmark.visibility
            })
        
        required_landmarks = [0, 11, 12, 23, 24]
        min_visibility = 0.5
        
        missing_parts = []
        for idx in required_landmarks:
            if landmarks[idx]['visibility'] < min_visibility:
                missing_parts.append(idx)
        
        if missing_parts:
            part_names = {
                0: "얼굴",
                11: "왼쪽 어깨",
                12: "오른쪽 어깨",
                23: "왼쪽 골반",
                24: "오른쪽 골반"
            }
            missing_names = [part_names.get(idx, f"부위{idx}") for idx in missing_parts]
            
            return JSONResponse(content={
                "success": True,
                "landmarks": landmarks,
                "analysis": {
                    "score": 0,
                    "components": {
                        "shoulders_level": 0,
                        "hips_level": 0,
                        "spine_vertical": 0,
                        "elbows_angle": 0
                    },
                    "visibility_weight": 0,
                    "errorCodes": [],
                    "hints": [
                        f"카메라에서 {', '.join(missing_names)}이(가) 보이지 않습니다",
                        "전신이 보이도록 카메라 위치를 조정해주세요"
                    ]
                },
                "rep": None
            })
        
        analysis = score_pose_components(landmarks, exercise_code)
        print(f"✅ 사용한 파라미터: '{analysis['exercise_code']}'")
        
        # ============= IoT 신호 전송 처리 =============
        # 왼팔 오류 지속시간 체크 (지속시간 기반)
        left_arm_has_error = analysis.get("left_arm_bad", False)
        check_left_arm_error_duration(left_arm_has_error)
        
        # 오른팔 오류 지속시간 체크 (지속시간 기반)
        right_arm_has_error = analysis.get("right_arm_bad", False)
        check_right_arm_error_duration(right_arm_has_error)
            
        # 왼쪽 다리 오류 지속시간 체크 (지속시간 기반)
        left_leg_has_error = analysis.get("left_leg_bad", False)
        check_left_leg_error_duration(left_leg_has_error)
        
        # 오른쪽 다리 오류 지속시간 체크 (지속시간 기반)
        right_leg_has_error = analysis.get("right_leg_bad", False)
        check_right_leg_error_duration(right_leg_has_error)
        # ============= IoT 처리 끝 =============

        # ============= 스쿼트 / 런지 반복 수 업데이트 =============
        rep_info = update_rep_for_exercise(exercise_code, landmarks, analysis)
        if rep_info:
            print(
                f"🔁 운동 반복 정보({rep_info['name']}): "
                f"총 {rep_info['total']}회 / 정확 {rep_info['correct']}회 / 틀린 {rep_info['wrong']}회"
            )
        # ============= 반복 수 처리 끝 =============
        
        return JSONResponse(content={
            "success": True,
            "landmarks": landmarks,
            "analysis": analysis,
            "rep": rep_info
        })
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        return JSONResponse(content={
            "success": False,
            "message": str(e)
        }, status_code=500)

# ============= IoT API 엔드포인트 추가 =============
@app.post("/api/left-arm-alert")
async def api_left_arm_alert():
    """왼팔 교정 알림 ESP32 전송"""
    try:
        success = send_left_arm_alert()

        if success:
            return JSONResponse(content={
                "success": True,
                "message": "왼팔 교정 알림 전송 완료"
            })
        else:
            return JSONResponse(content={
                "success": False,
                "error": "전송 실패"
            })

    except Exception as e:
        return JSONResponse(content={
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.post("/api/left-leg-alert")
async def api_left_leg_alert():
    """왼쪽 다리 교정 알림 ESP32 전송"""
    try:
        success = send_left_leg_alert()

        if success:
            return JSONResponse(content={
                "success": True,
                "message": "왼쪽 다리 교정 알림 전송 완료"
            })
        else:
            return JSONResponse(content={
                "success": False,
                "error": "전송 실패"
            })

    except Exception as e:
        return JSONResponse(content={
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.post("/api/right-leg-alert")
async def api_right_leg_alert():
    """오른쪽 다리 교정 알림 ESP32 전송"""
    try:
        success = send_right_leg_alert()
        
        if success:
            return JSONResponse(content={
                "success": True,
                "message": "오른쪽 다리 교정 알림 전송 완료"
            })
        else:
            return JSONResponse(content={
                "success": False,
                "error": "전송 실패"
            })
            
    except Exception as e:
        return JSONResponse(content={
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.post("/api/right-arm-alert")
async def api_right_arm_alert():
    """오른팔 교정 알림 ESP32 전송"""
    try:
        success = send_right_arm_alert()
        
        if success:
            return JSONResponse(content={
                "success": True,
                "message": "오른팔 교정 알림 전송 완료"
            })
        else:
            return JSONResponse(content={
                "success": False,
                "error": "전송 실패"
            })
            
    except Exception as e:
        return JSONResponse(content={
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.get("/")
async def root():
    return {"message": "FITAI Backend API with IoT", "version": "11.0 - Complete 4-Part System + Enhanced Reps Filter + Duration-based IoT"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "iot_enabled": True,
        "devices": ["left_arm", "right_arm", "left_leg", "right_leg"],
        "counters": {
            "squat": SQUAT_COUNTER.as_dict(),
            "lunge": LUNGE_COUNTER.as_dict(),
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)