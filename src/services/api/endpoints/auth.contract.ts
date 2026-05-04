export const AUTH_ENDPOINTS = {
  register: '/api/v1/auth/register',
  login: '/api/v1/auth/login',
  loginByPhone: '/api/v1/auth/login-by-phone',
  logout: '/api/v1/auth/logout',
  refresh: '/api/v1/auth/refresh',
  me: '/api/v1/auth/me',
  verifyEmail: '/api/v1/auth/verify-email',
} as const
