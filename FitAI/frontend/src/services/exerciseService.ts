const API_BASE_URL = "https://zbsnjtikatoqmnawrmi3bwtlie0rzljg.lambda-url.ap-northeast-2.on.aws";

export interface ExerciseData {
  exercise_id: string;
  exercise_name: string;
  exercise_info: string;
  exercise_type: "upper_body" | "lower_body" | "abs";
  exercise_code: string;
}

export interface PresetExercise {
  exercise_id: string;
  order: number;
  set: number;
  repeat: number;
}

export interface PresetData {
  user_id: string;
  preset_id: string;
  preset_name: string;
  preset_info?: string;
  preset_created: string;
  preset_updated: string;
  exercises: PresetExercise[];
}

// 모든 운동 가져오기
export const getAllExercises = async (): Promise<ExerciseData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/exercises`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ Lambda 응답:", data);
    
    // Lambda 응답 구조에 따라 조정
    return data.exercises || data.body?.exercises || data || [];
  } catch (error) {
    console.error("❌ 운동 목록 조회 실패:", error);
    throw error;
  }
};

// 특정 타입의 운동만 가져오기
export const getExercisesByType = async (
  type: "upper_body" | "lower_body" | "abs"
): Promise<ExerciseData[]> => {
  try {
    const allExercises = await getAllExercises();
    const filtered = allExercises.filter(
      (exercise) => exercise.exercise_type === type
    );
    
    console.log(`✅ ${type} 운동 ${filtered.length}개 발견`);
    return filtered;
  } catch (error) {
    console.error(`❌ ${type} 운동 조회 실패:`, error);
    throw error;
  }
};

// 특정 운동 상세 정보
export const getExerciseById = async (
  exerciseId: string
): Promise<ExerciseData | null> => {
  try {
    const allExercises = await getAllExercises();
    return allExercises.find((ex) => ex.exercise_id === exerciseId) || null;
  } catch (error) {
    console.error("❌ 운동 상세 조회 실패:", error);
    throw error;
  }
};

// 사용자 프리셋 가져오기 (Lambda에 API 있다면)
export const getUserPresets = async (userId: string): Promise<PresetData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/presets/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.presets || data || [];
  } catch (error) {
    console.error("❌ 프리셋 조회 실패:", error);
    throw error;
  }
};
