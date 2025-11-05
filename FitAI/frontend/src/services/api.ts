// Lambda Function URL (본인의 URL로 변경!)
const API_BASE_URL = 'https://zbsnjtikatoqmnawrmi3bwtlie0rzljg.lambda-url.ap-northeast-2.on.aws';

// ========== Exercise API ==========
export const getExercises = async () => {
  const response = await fetch(`${API_BASE_URL}/exercises`);
  const result = await response.json();
  return result.data;
};

export const getExerciseById = async (exerciseId: string) => {
  const response = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`);
  const result = await response.json();
  return result.data;
};

// ========== Preset API ==========
export const getPresets = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/presets/user/${userId}`);
  const result = await response.json();
  return result.data;
};

export const createPreset = async (presetData: any) => {
  const response = await fetch(`${API_BASE_URL}/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(presetData),
  });
  const result = await response.json();
  return result.data;
};

// ========== Session API ==========
export const getSessions = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`);
  const result = await response.json();
  return result.data;
};

export const createSession = async (sessionData: any) => {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  });
  const result = await response.json();
  return result.data;
};

// ========== Attendance API ==========
export const getAttendance = async (userId: string, startDate?: string, endDate?: string) => {
  let url = `${API_BASE_URL}/attendance/user/${userId}`;
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }
  const response = await fetch(url);
  const result = await response.json();
  return result.data;
};

export const checkAttendance = async (userId: string, date: string) => {
  const response = await fetch(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, attendance_date: date }),
  });
  const result = await response.json();
  return result.data;
};

// ========== Post API ==========
export const getPosts = async (limit: number = 20) => {
  const response = await fetch(`${API_BASE_URL}/posts?limit=${limit}`);
  const result = await response.json();
  return result.data;
};

export const getPostById = async (postId: string) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
  const result = await response.json();
  return result.data;
};

export const createPost = async (postData: any) => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  const result = await response.json();
  return result.data;
};

export const togglePostLike = async (postId: string, userId: string, isLiked: boolean) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, is_liked: isLiked }),
  });
  const result = await response.json();
  return result;
};

// ========== Comment API ==========
export const getComments = async (postId: string) => {
  const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
  const result = await response.json();
  return result.data;
};

export const createComment = async (commentData: any) => {
  const response = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData),
  });
  const result = await response.json();
  return result.data;
};