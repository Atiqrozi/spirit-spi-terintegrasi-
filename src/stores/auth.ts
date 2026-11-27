import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { configureSessionTransport } from '@/services/api/http'
import type { Role, SessionUser } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const savedSession = readSession()
  const accessToken = ref<string | null>(savedSession?.accessToken ?? null)
  const refreshToken = ref<string | null>(savedSession?.refreshToken ?? null)
  const user = ref<SessionUser | null>(savedSession?.user ?? null)
  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))
  const role = computed(() => user.value?.role ?? null)

  function setTokens(access: string, refresh?: string) {
    accessToken.value = access
    if (refresh) refreshToken.value = refresh
    persistSession()
  }
  function persistSession() {
    if (!accessToken.value || !refreshToken.value || !user.value) return
    window.sessionStorage.setItem('spi.auth.session', JSON.stringify({ accessToken: accessToken.value, refreshToken: refreshToken.value, user: user.value }))
  }
  function clearSession() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    window.sessionStorage.removeItem('spi.auth.session')
  }

  configureSessionTransport({
    getAccessToken: () => accessToken.value,
    getRefreshToken: () => refreshToken.value,
    setTokens,
    clearSession,
  })

  async function login(email: string, password: string) {
    const response = await api.login(email, password)
    setTokens(response.accessToken, response.refreshToken)
    user.value = response.user
    persistSession()
    return response.user as SessionUser
  }
  async function logout() {
    try { if (accessToken.value) await api.logout() } finally { clearSession() }
  }
  function hasRole(roles?: Role[]) { return !roles?.length || (!!role.value && roles.includes(role.value)) }

  return { accessToken, refreshToken, user, role, isAuthenticated, login, logout, clearSession, hasRole }
})

function readSession(): { accessToken: string; refreshToken: string; user: SessionUser } | null {
  try {
    const raw = window.sessionStorage.getItem('spi.auth.session')
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<{ accessToken: string; refreshToken: string; user: SessionUser }>
    if (!saved.accessToken || !saved.refreshToken || !saved.user?.id || !saved.user?.role) {
      window.sessionStorage.removeItem('spi.auth.session')
      return null
    }
    return saved as { accessToken: string; refreshToken: string; user: SessionUser }
  } catch {
    window.sessionStorage.removeItem('spi.auth.session')
    return null
  }
}
