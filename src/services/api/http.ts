import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorBody } from '@/types/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
export const http = axios.create({ baseURL: API_BASE_URL, timeout: 30_000 })

type SessionTransport = {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  setTokens: (accessToken: string, refreshToken?: string) => void
  clearSession: () => void
}
let session: SessionTransport | null = null
let refreshPromise: Promise<string> | null = null
export function configureSessionTransport(transport: SessionTransport) { session = transport }

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = session?.getAccessToken()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

http.interceptors.response.use((response) => response, async (error: AxiosError<ApiErrorBody>) => {
  const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean }
  const refreshToken = session?.getRefreshToken()
  if (error.response?.status !== 401 || !original || original._retried || !refreshToken || original.url?.includes('/auth/')) {
    return Promise.reject(error)
  }
  original._retried = true
  try {
    refreshPromise ||= axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, { timeout: 15_000 })
      .then(({ data }) => {
        session?.setTokens(data.accessToken, data.refreshToken)
        return data.accessToken as string
      })
      .finally(() => { refreshPromise = null })
    const token = await refreshPromise
    original.headers.Authorization = `Bearer ${token}`
    return http(original)
  } catch (refreshError) {
    session?.clearSession()
    if (window.location.pathname !== '/login') window.location.assign('/login?expired=1')
    return Promise.reject(refreshError)
  }
})

export function getApiErrorMessage(error: unknown, fallback = 'Terjadi kendala. Silakan coba lagi.') {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
    if (!error.response) return 'Tidak dapat terhubung ke server. Periksa koneksi dan alamat API.'
  }
  return fallback
}
