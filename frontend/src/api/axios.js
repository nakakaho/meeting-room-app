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
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング + トークンリフレッシュ）
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401エラー（未認証）の場合
    if (error.response?.status === 401) {
      
      // ログインリクエストの場合はスキップ
      if (originalRequest.url.includes('/login') || originalRequest.url.includes('/register')) {
        return Promise.reject(error);
      }

      // 既にリフレッシュ試行済みの場合はログアウト
      if (originalRequest._retry) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // 既にリフレッシュ中の場合はキューに追加
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // トークンリフレッシュAPIを呼び出し
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        
        if (!token) {
          // トークンがない場合は即座にログイン画面へ
          isRefreshing = false;
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${BASE_URL}/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (refreshResponse.data.token) {
          const newToken = refreshResponse.data.token;
          localStorage.setItem('auth_token', newToken);
          localStorage.setItem('token', newToken);
          
          console.log('トークンをリフレッシュしました');
          
          // キューに溜まったリクエストを処理
          processQueue(null, newToken);
          
          // 元のリクエストを再実行
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          return api(originalRequest);
        } else {
          // トークンがレスポンスにない場合
          throw new Error('Token not found in refresh response');
        }
      } catch (refreshError) {
        // リフレッシュ失敗時
        console.error('トークンリフレッシュ失敗:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // リフレッシュエラーの場合のみログアウト
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          // ローカルストレージをクリア
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // ログインページにリダイレクト
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;