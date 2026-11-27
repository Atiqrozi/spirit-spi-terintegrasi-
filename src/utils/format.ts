import type { EntityRecord } from '@/types/api'

export const titleOf = (row: EntityRecord, fallback = 'Tanpa judul') => String(row.data?.title || row.data?.name || row.title || fallback)
export const unitOf = (row: EntityRecord) => String(row.data?.unit || row.unit || '—')
export const typeOf = (row: EntityRecord) => String(row.data?.type || row.data?.category || row.type || '—')
export const statusOf = (row: EntityRecord) => String(row.data?.status || row.status || 'UNKNOWN')
export function formatDate(value?: string | Date) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(date)
}
export function formatDateTime(value?: string | Date) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(date)
}
export const countStatuses = (rows?: Array<{ _id?: string; count?: number }>) => (rows || []).reduce<Record<string, number>>((map, row) => { map[String(row._id || '').toUpperCase()] = Number(row.count || 0); return map }, {})
