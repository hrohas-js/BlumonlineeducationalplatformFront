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
    meta: { requiresAuth: true },
  },
  {
    path: '/courses/:productId/lessons/:lessonId',
    name: 'course-lesson',
    component: CoursePage,
    meta: { requiresAuth: true },
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
router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated || !!authStore.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return { name: 'home-section', params: { section: 'profile' } }
  }
})
