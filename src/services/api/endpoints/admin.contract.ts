export const ADMIN_ENDPOINTS = {
  products: '/api/v1/admin/products',
  productById: (id: string) => `/api/v1/admin/products/${id}`,
  productImage: (id: string) => `/api/v1/admin/products/${id}/image`,
  productStudents: (id: string) => `/api/v1/admin/products/${id}/students`,
  productStudentsExport: (id: string) => `/api/v1/admin/products/${id}/students/export`,
  productModules: (courseId: string) => `/api/v1/admin/products/${courseId}/modules`,
  productModulesReorder: (courseId: string) =>
    `/api/v1/admin/products/${courseId}/modules/reorder`,
  moduleById: (id: string) => `/api/v1/admin/products/modules/${id}`,
  moduleCopy: (id: string) => `/api/v1/admin/products/modules/${id}/copy`,
  moduleLessons: (moduleId: string) => `/api/v1/admin/products/modules/${moduleId}/lessons`,
  moduleLessonsReorder: (moduleId: string) =>
    `/api/v1/admin/products/modules/${moduleId}/lessons/reorder`,
  lessonById: (id: string) => `/api/v1/admin/products/lessons/${id}`,
  lessonCopy: (id: string) => `/api/v1/admin/products/lessons/${id}/copy`,
  lessonVideo: (id: string) => `/api/v1/admin/products/lessons/${id}/video`,
  lessonFiles: (id: string) => `/api/v1/admin/products/lessons/${id}/files`,
  fileById: (id: string) => `/api/v1/admin/products/files/${id}`,
  userAccess: (userId: string) => `/api/v1/admin/products/users/${userId}/access`,
  userProductGrant: (userId: string, productId: string) =>
    `/api/v1/admin/products/users/${userId}/products/${productId}/grant-access`,
  userProductDeadline: (userId: string, productId: string) =>
    `/api/v1/admin/products/users/${userId}/products/${productId}/deadline`,
  userProductAccess: (userId: string, productId: string) =>
    `/api/v1/admin/products/users/${userId}/products/${productId}`,
  payments: '/api/v1/admin/payments',
  paymentsSuccessful: '/api/v1/admin/payments/successful',
  paymentsPending: '/api/v1/admin/payments/pending',
  paymentsByUserEmail: (email: string) => `/api/v1/admin/payments/user/${encodeURIComponent(email)}`,
  /** TODO: подключить после согласования контракта API */
  notifications: '/api/v1/admin/notifications',
  notificationById: (id: string) => `/api/v1/admin/notifications/${id}`,
  notificationRecipients: '/api/v1/admin/notifications/recipients',
  notificationSend: '/api/v1/admin/notifications/send',
  notificationTemplates: '/api/v1/admin/notifications/templates',
} as const
