export const AUTH_ENDPOINTS = {
  register: '/api/v1/auth/register',
  login: '/api/v1/auth/login',
  logout: '/api/v1/auth/logout',
  logoutAll: '/api/v1/auth/logout-all',
  refresh: '/api/v1/auth/refresh',
  me: '/api/v1/auth/me',
  verifyEmail: '/api/v1/auth/verify-email',
  resendVerification: '/api/v1/auth/resend-verification',
  forgotPassword: '/api/v1/auth/forgot-password',
  resetPassword: '/api/v1/auth/reset-password',
  changePassword: '/api/v1/auth/change-password',
} as const

export const PRODUCT_ENDPOINTS = {
  list: '/api/v1/products',
  byId: (id: string) => `/api/v1/products/${id}`,
  progress: (id: string) => `/api/v1/products/${id}/progress`,
  myCourses: '/api/v1/products/my-courses',
  completeLesson: (lessonId: string) => `/api/v1/products/lessons/${lessonId}/complete`,
} as const

export const PAYMENT_ENDPOINTS = {
  create: '/api/v1/payments/create',
  history: '/api/v1/payments/history',
  renew: '/api/v1/payments/renew',
  success: '/api/v1/payments/success',
  fail: '/api/v1/payments/fail',
} as const

export const PROTECTED_CONTENT_ENDPOINTS = {
  videoToken: '/api/v1/protected-content/video/token',
  videoVerify: '/api/v1/protected-content/video/verify',
  videoPlayerConfig: '/api/v1/protected-content/video/player-config',
  videoStreamInfo: (videoId: string) =>
    `/api/v1/protected-content/video/stream-info/${videoId}`,
  hlsKey: (videoId: string) =>
    `/api/v1/protected-content/video/hls-key/${videoId}`,
  signedUrl: '/api/v1/protected-content/signed-url',
  verifySignedUrl: '/api/v1/protected-content/verify-signed-url',
  securityHeaders: '/api/v1/protected-content/security-headers',
  logAccess: '/api/v1/protected-content/log-access',
  reportSuspicious: '/api/v1/protected-content/report-suspicious-activity',
} as const
