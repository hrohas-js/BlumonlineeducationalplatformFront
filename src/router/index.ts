/**
 * Vue Router — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §7):
 * В mirror-frontend маршрутизация была файловой (Nuxt pages/).
 * В plain Vue 3 используем явный createRouter() с createWebHistory().
 *
 * Секции личного кабинета: `/:section` с параметром из PROFILE_SECTIONS.
 * Корень `/` редиректит на `/profile`.
 *
 * Route Guard: beforeEach проверяет авторизацию для защищённых маршрутов.
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { HOME_SECTION_PATH_RE } from '@/components/home/profile-menu.types'
import { useAuthStore } from '@/stores/auth'

const HomePage = () => import('@/pages/HomePage.vue')
const LoginPage = () => import('@/pages/LoginPage.vue')
const NotFoundPage = () => import('@/pages/NotFoundPage.vue')
const ContentStubPage = () => import('@/pages/ContentStubPage.vue')
const AboutDoctorPage = () => import('@/pages/AboutDoctorPage.vue')
const VerifyEmailPage = () => import('@/pages/VerifyEmailPage.vue')
const ForgotPasswordPage = () => import('@/pages/ForgotPasswordPage.vue')
const ResetPasswordPage = () => import('@/pages/ResetPasswordPage.vue')
const CoursePage = () => import('@/pages/CoursePage.vue')
const PaymentSuccessPage = () => import('@/pages/PaymentSuccessPage.vue')
const PaymentFailPage = () => import('@/pages/PaymentFailPage.vue')
const PaymentHistoryPage = () => import('@/pages/PaymentHistoryPage.vue')
const AdminPage = () => import('@/pages/AdminPage.vue')
const AdminMaterialsStudentsPage = () => import('@/pages/AdminMaterialsStudentsPage.vue')
const AdminStudentFolderLessonsAccessPage = () => import('@/pages/AdminStudentFolderLessonsAccessPage.vue')
const AdminStudentProductTopicsPage = () => import('@/pages/AdminStudentProductTopicsPage.vue')
const AdminStudentProfilePage = () => import('@/pages/AdminStudentProfilePage.vue')
const AdminMaterialProductEditPage = () => import('@/pages/AdminMaterialProductEditPage.vue')
const AdminMaterialProductCreatePage = () => import('@/pages/AdminMaterialProductCreatePage.vue')
const AdminMaterialProductTopicEditPage = () => import('@/pages/AdminMaterialProductTopicEditPage.vue')
const AdminMaterialProductTopicNotificationsPage = () =>
  import('@/pages/AdminMaterialProductTopicNotificationsPage.vue')
const AdminPaymentsPage = () => import('@/pages/AdminPaymentsPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresGuest: true },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/courses/:productId',
    name: 'course',
    component: CoursePage,
    meta: { requiresAuth: true, requiresVerifiedEmail: true },
  },
  {
    path: '/courses/:productId/lessons/:lessonId',
    name: 'course-lesson',
    component: CoursePage,
    meta: { requiresAuth: true, requiresVerifiedEmail: true },
  },
  {
    path: '/payment/success',
    name: 'payment-success',
    component: PaymentSuccessPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/payment/fail',
    name: 'payment-fail',
    component: PaymentFailPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/payment-history',
    name: 'payment-history',
    component: PaymentHistoryPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/training-programs',
    name: 'training-programs',
    component: ContentStubPage,
    meta: { requiresAuth: false, stubTitle: 'Программы обучения' },
  },
  {
    path: '/training-archive',
    name: 'training-archive',
    component: ContentStubPage,
    meta: { requiresAuth: false, stubTitle: 'Архив обучения' },
  },
  {
    path: '/articles',
    name: 'articles',
    component: ContentStubPage,
    meta: { requiresAuth: false, stubTitle: 'Полезные статьи' },
  },
  {
    path: '/about-doctor',
    name: 'about-doctor',
    component: AboutDoctorPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/support',
    name: 'support',
    component: ContentStubPage,
    meta: { requiresAuth: false, stubTitle: 'Тех. поддержка' },
  },
  {
    path: '/',
    redirect: '/profile',
  },
  {
    path: '/admin/materials/:sectionId/students/:studentId/folder/:materialSectionKey/lessons-access/:sourceProductId',
    name: 'admin-student-folder-lessons-access',
    component: AdminStudentFolderLessonsAccessPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/materials/:sectionId/students/:studentId/product/:materialSectionKey/:productId/topics',
    name: 'admin-student-product-topics',
    component: AdminStudentProductTopicsPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/materials/:sectionId/students/:studentId',
    name: 'admin-materials-student-profile',
    component: AdminStudentProfilePage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/materials/:sectionId/students',
    name: 'admin-materials-students',
    component: AdminMaterialsStudentsPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/materials/:sectionId/product/create',
    name: 'admin-material-product-create',
    component: AdminMaterialProductCreatePage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/materials/:sectionId/product/:productId/edit/topic/:topicId/notifications',
    name: 'admin-material-product-topic-notifications',
    component: AdminMaterialProductTopicNotificationsPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/materials/:sectionId/product/:productId/edit/topic/:topicId',
    name: 'admin-material-product-topic-edit',
    component: AdminMaterialProductTopicEditPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/materials/:sectionId/product/:productId/edit',
    name: 'admin-material-product-edit',
    component: AdminMaterialProductEditPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/payments',
    name: 'admin-payments',
    component: AdminPaymentsPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: `/:section(${HOME_SECTION_PATH_RE})`,
    name: 'home-section',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

// ===== ROUTE GUARD =====
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const hasToken = !!authStore.token

  if (hasToken && !authStore.user) {
    await authStore.fetchUser()
  }

  const isAuthenticated = authStore.isAuthenticated || hasToken

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return { name: 'home-section', params: { section: 'profile' } }
  }

  if (to.meta.requiresAdmin) {
    if (!authStore.isAdmin) {
      return { name: 'home-section', params: { section: 'profile' } }
    }
  }

  if (to.meta.requiresVerifiedEmail && authStore.user && !authStore.user.email_verified) {
    return { name: 'verify-email', query: { redirect: to.fullPath } }
  }

  const learningSections = ['learning', 'renewal'] as const
  if (
    to.name === 'home-section' &&
    typeof to.params.section === 'string' &&
    (learningSections as readonly string[]).includes(to.params.section) &&
    authStore.user &&
    !authStore.user.email_verified
  ) {
    return { name: 'verify-email' }
  }
})
