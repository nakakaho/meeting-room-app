import axios from 'axios';

// Laravel APIのベースURL
const BASE_URL = 'http://localhost/meeting-room-app/backend/public/api';

// Axiosインスタンスを作成
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Cookie送信を許可（Sanctum認証用）
});

// リクエストインターセプター（トークンを自動付与）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401エラー（未認証）の場合、ログイン画面へリダイレクト
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;