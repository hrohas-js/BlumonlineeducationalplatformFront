export const ADMIN_ENDPOINTS = {
  products: '/api/v1/admin/products',
  productById: (id: string) => `/api/v1/admin/products/${id}`,
  productArchive: (id: string) => `/api/v1/admin/products/${id}/archive`,
  productUnarchive: (id: string) => `/api/v1/admin/products/${id}/unarchive`,
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
  lessonVideosUploadUrl: (id: string) =>
    `/api/v1/admin/products/lessons/${id}/videos/upload-url`,
  lessonVideosConfirm: (id: string) => `/api/v1/admin/products/lessons/${id}/videos/confirm`,
  lessonVideoById: (lessonId: string, videoId: string) =>
    `/api/v1/admin/products/lessons/${lessonId}/videos/${videoId}`,
  lessonVideosReorder: (id: string) => `/api/v1/admin/products/lessons/${id}/videos/reorder`,
  lessonFiles: (id: string) => `/api/v1/admin/products/lessons/${id}/files`,
  fileById: (id: string) => `/api/v1/admin/products/files/${id}`,
  userAccess: (userId: string) => `/api/v1/admin/products/users/${userId}/access`,
  userProductGrant: (userId: string, productId: string) =>
    `/api/v1/admin/products/users/${userId}/products/${productId}/grant-access`,
  userProductDeadline: (userId: string, productId: string) =>
    `/api/v1/admin/products/users/${userId}/products/${productId}/deadline`,
  userProductAccess: (userId: string, productId: string) =>
    `/api/v1/admin/products/users/${userId}/products/${productId}`,
  userProductAccessUpdate: (userId: string, productId: string) =>
    `/api/v1/admin/products/users/${userId}/products/${productId}/access`,
  studentProducts: (userId: string) => `/api/v1/admin/students/${userId}/products`,
  studentsBulk: '/api/v1/admin/students/bulk',
  studentsBulkExcel: '/api/v1/admin/students/bulk/excel',
  payments: '/api/v1/admin/payments',
  paymentsSuccessful: '/api/v1/admin/payments/successful',
  paymentsPending: '/api/v1/admin/payments/pending',
  paymentsByUserEmail: (email: string) => `/api/v1/admin/payments/user/${encodeURIComponent(email)}`,
  broadcastTemplates: '/api/v1/admin/broadcast-templates',
  broadcastTemplateById: (id: string) => `/api/v1/admin/broadcast-templates/${id}`,
  broadcasts: '/api/v1/admin/broadcasts',
  broadcastById: (id: string) => `/api/v1/admin/broadcasts/${id}`,
  broadcastStart: (id: string) => `/api/v1/admin/broadcasts/${id}/start`,
  broadcastStop: (id: string) => `/api/v1/admin/broadcasts/${id}/stop`,
  glossary: '/api/v1/admin/glossary',
} as const
