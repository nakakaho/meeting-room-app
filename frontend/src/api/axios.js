import axios from 'axios';
import i18n from '../i18n'; // ✅ 追加

const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ 言語ヘッダー自動付与
    config.headers['Accept-Language'] = i18n.language === 'ja' ? 'ja' : 'en';

    return config;
  },
  (error) => Promise.reject(error)
);

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

    if (error.response?.status === 401) {
      if (originalRequest.url.includes('/login') || originalRequest.url.includes('/register')) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = localStorage.getItem('auth_token');

        const refreshResponse = await axios.post(
          `${BASE_URL}/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Accept-Language': i18n.language === 'ja' ? 'ja' : 'en', // ✅ 追加
            },
          }
        );

        const newToken = refreshResponse.data.token;

        if (!newToken) throw new Error('Token missing in refresh response');

        localStorage.setItem('auth_token', newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.clear();
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;