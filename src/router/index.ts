import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Role } from '@/types/roles'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

declare module 'vue-router' {
  interface RouteMeta { requiresAuth?: boolean; roles?: Role[]; title?: string }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: AuthLayout, children: [{ path: '', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { title: 'Masuk' } }] },
    { path: '/403', component: DashboardLayout, children: [{ path: '', name: 'forbidden', component: () => import('@/views/errors/ForbiddenView.vue'), meta: { requiresAuth: true, title: 'Akses ditolak' } }] },
    {
      path: '/app', component: DashboardLayout, redirect: '/app/dashboard',
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/dashboard/DashboardView.vue'), meta: { requiresAuth: true, title: 'Dashboard' } },
        { path: 'ocr', name: 'ocr', component: () => import('@/views/ocr/OcrView.vue'), meta: { requiresAuth: true, title: 'OCR Dokumen' } },
        { path: 'documents', name: 'documents', component: () => import('@/views/documents/DocumentsView.vue'), meta: { requiresAuth: true, title: 'Manajemen Dokumen' } },
        { path: 'templates', name: 'templates', component: () => import('@/views/templates/TemplatesView.vue'), meta: { requiresAuth: true, title: 'Template Laporan' } },
        { path: 'tasks', name: 'tasks', component: () => import('@/views/tasks/TasksView.vue'), meta: { requiresAuth: true, title: 'Penugasan SPI' } },
        { path: 'reports', name: 'reports', component: () => import('@/views/reports/ReportsView.vue'), meta: { requiresAuth: true, title: 'Laporan & Evaluasi' } },
        { path: 'reports/:id', name: 'report-detail', component: () => import('@/views/reports/ReportDetailView.vue'), meta: { requiresAuth: true, title: 'Detail Laporan' } },
        { path: 'memos', name: 'memos', component: () => import('@/views/memos/MemosView.vue'), meta: { requiresAuth: true, title: 'Memo & Tindak Lanjut' } },
        { path: 'notifications', name: 'notifications', component: () => import('@/views/notifications/NotificationsView.vue'), meta: { requiresAuth: true, title: 'Notifikasi' } },
        { path: 'settings', name: 'settings', component: () => import('@/views/settings/SettingsView.vue'), meta: { requiresAuth: true, title: 'Pengaturan' } },
        { path: 'guide', name: 'guide', component: () => import('@/views/guide/GuideView.vue'), meta: { requiresAuth: true, title: 'Panduan' } },
      ],
    },
    { path: '/', redirect: '/app/dashboard' },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/errors/NotFoundView.vue'), meta: { title: 'Halaman tidak ditemukan' } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.roles && !auth.hasRole(to.meta.roles)) return { name: 'forbidden' }
  if (to.name === 'login' && auth.isAuthenticated) return { name: 'dashboard' }
})
router.afterEach((to) => { document.title = `${String(to.meta.title || 'SPI')} — RS Korpri Pura Raharja` })
export default router
