import api from './axios';

// ==================== 認証 API ====================
export const authAPI = {
  // ログイン
  login: (email, password) => 
    api.post('/login', { email, password }),
  
  // 新規登録
  register: (name, email, password) => 
    api.post('/register', { name, email, password }),
  
  // パスワードリセットメール送信
  sendResetEmail: (email) => 
    api.post('/password-reset', { email }),
  
  // パスワードリセット
  resetPassword: (token, new_password) => 
    api.post('/password-update', { token, new_password }),
};

// ==================== ユーザー API ====================
export const userAPI = {
  // 自分の情報取得
  getMe: (id) => 
    api.get(`/users/${id}`),
  
  // 情報更新
  update: (id, data) => 
    api.put(`/users/${id}`, data),
  
  // 設定変更（通知・言語）
  updateSettings: (id, settings) => 
    api.put(`/users/${id}/settings`, settings),
  
  // パスワード変更
  changePassword: (id, current_password, new_password, confirm_password) => 
    api.post(`/users/${id}/password`, { current_password, new_password, confirm_password }),
  
  // アカウント削除
  delete: (id) => 
    api.delete(`/users/${id}`),
};

// ==================== 部屋 API ====================
export const roomAPI = {
  // 部屋一覧取得
  getAll: (branch_id) => 
    api.get('/rooms', { params: { branch_id } }),
  
  // 部屋追加（admin）
  create: (data) => 
    api.post('/rooms', data),
  
  // 部屋編集（admin）
  update: (id, data) => 
    api.put(`/rooms/${id}`, data),
  
  // 部屋削除（admin）
  delete: (id) => 
    api.delete(`/rooms/${id}`),
};

// ==================== 予約 API ====================
export const eventAPI = {
  // 予約一覧取得
  getAll: (branch_id, user_id) => 
    api.get('/events', { params: { branch_id, user_id } }),
  
  // 予約作成
  create: (data) => 
    api.post('/events', data),
  
  // 予約変更
  update: (id, data) => 
    api.put(`/events/${id}`, data),
  
  // 予約キャンセル
  delete: (id) => 
    api.delete(`/events/${id}`),
};

// ==================== 管理者 API ====================
export const adminAPI = {
  // ユーザー一覧取得
  getAllUsers: () => 
    api.get('/users/all'),
  
  // 権限変更
  changeRole: (id, role) => 
    api.patch(`/users/all/${id}`, { role }),
  
  // ユーザー削除
  deleteUser: (id) => 
    api.delete(`/users/all/${id}`),
};

// ==================== テスト用 ====================
export const testAPI = {
  test: () => api.get('/test'),
};