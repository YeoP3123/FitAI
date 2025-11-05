// ========== Imports ==========
import { getUserId } from '../utils/auth';

// ========== Constants ==========
const API_BASE_URL = 'https://zbsnjtikatoqmnawrmi3bwtlie0rzljg.lambda-url.ap-northeast-2.on.aws';

// ========== Helper Functions ==========
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const userId = await getUserId();
  return {
    'Content-Type': 'application/json',
    'X-User-Id': userId || '',
  };
};

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
export const getMyPresets = async () => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/presets/user/${userId}`, {
    headers: await getAuthHeaders(),
  });
  const result = await response.json();
  return result.data;
};

export const getPresets = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/presets/user/${userId}`);
  const result = await response.json();
  return result.data;
};

export const createPreset = async (presetData: {
  preset_name: string;
  preset_info?: string;
  exercises: Array<{
    exercise_id: string;
    order: number;
    set: number;
    repeat: number;
  }>;
}) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/presets`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      preset_id: `PRESET_${Date.now()}`,
      ...presetData,
    }),
  });
  const result = await response.json();
  return result.data;
};

export const updatePreset = async (presetId: string, presetData: any) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/presets/${presetId}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      ...presetData,
    }),
  });
  const result = await response.json();
  return result.data;
};

export const deletePreset = async (presetId: string) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/presets/${presetId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  const result = await response.json();
  return result.data;
};

// ========== Session API ==========
export const getMySessions = async () => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`, {
    headers: await getAuthHeaders(),
  });
  const result = await response.json();
  return result.data;
};

export const getSessions = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`);
  const result = await response.json();
  return result.data;
};

export const createSession = async (sessionData: {
  preset_id?: string;
  session_start: string;
  session_end: string;
  session_score?: number;
  session_note?: string;
  feedbacks?: Array<{
    exercise_id: string;
    lost_score: number;
    feedback_text: string;
  }>;
}) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      session_id: `SESSION_${Date.now()}`,
      ...sessionData,
    }),
  });
  const result = await response.json();
  return result.data;
};

// ========== Attendance API ==========
export const getMyAttendance = async (startDate?: string, endDate?: string) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  let url = `${API_BASE_URL}/attendance/user/${userId}`;
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }
  
  const response = await fetch(url, {
    headers: await getAuthHeaders(),
  });
  const result = await response.json();
  return result.data;
};

export const getAttendance = async (userId: string, startDate?: string, endDate?: string) => {
  let url = `${API_BASE_URL}/attendance/user/${userId}`;
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }
  const response = await fetch(url);
  const result = await response.json();
  return result.data;
};

export const checkAttendance = async (date?: string) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const attendanceDate = date || new Date().toISOString().split('T')[0];

  const response = await fetch(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      attendance_date: attendanceDate,
      attendance_is_checked: true,
      attendance_checked_time: new Date().toISOString(),
    }),
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

export const createPost = async (postData: {
  post_title: string;
  post_text: string;
  session_id?: string;
}) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      post_id: `POST_${Date.now()}`,
      post_like_count: 0,
      post_created: new Date().toISOString(),
      post_updated: new Date().toISOString(),
      ...postData,
    }),
  });
  const result = await response.json();
  return result.data;
};

export const updatePost = async (postId: string, postData: {
  post_title?: string;
  post_text?: string;
}) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      post_updated: new Date().toISOString(),
      ...postData,
    }),
  });
  const result = await response.json();
  return result.data;
};

export const deletePost = async (postId: string) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  const result = await response.json();
  return result.data;
};

export const togglePostLike = async (postId: string, isLiked: boolean) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      is_liked: isLiked,
      like_time: new Date().toISOString(),
    }),
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

export const createComment = async (commentData: {
  post_id: string;
  comment_text: string;
}) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      comment_id: `COMMENT_${Date.now()}`,
      comment_created: new Date().toISOString(),
      ...commentData,
    }),
  });
  const result = await response.json();
  return result.data;
};

export const updateComment = async (commentId: string, commentText: string) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      comment_text: commentText,
    }),
  });
  const result = await response.json();
  return result.data;
};

export const deleteComment = async (commentId: string) => {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다');

  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  const result = await response.json();
  return result.data;
};