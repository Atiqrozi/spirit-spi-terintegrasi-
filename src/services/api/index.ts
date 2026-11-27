import { http } from './http'
import type { DashboardSummary, EntityRecord, FollowUpRecord, NotificationItem, NotificationPage, NotificationPreferences, PageResult, RecommendationRecord, ReviewRecord } from '@/types/api'

export const api = {
  login: async (email: string, password: string) => (await http.post('/auth/login', { email, password })).data,
  logout: async () => (await http.post('/auth/logout')).data,
  dashboard: async () => (await http.get<DashboardSummary>('/dashboard/summary')).data,

  documents: async (params?: Record<string, string | number>) => (await http.get<PageResult<EntityRecord>>('/documents', { params })).data,
  document: async (id: string) => (await http.get<EntityRecord>(`/documents/${id}`)).data,
  documentVersions: async (id: string) => (await http.get<EntityRecord[]>(`/documents/${id}/versions`)).data,
  documentProcessingStatus: async (id: string, versionId: string) => (await http.get<EntityRecord>(`/documents/${id}/versions/${versionId}/process-status`)).data,
  documentVersion: async (id: string, versionId: string) => (await http.get<EntityRecord>(`/documents/${id}/versions/${versionId}`)).data,
  documentAccess: async (fileId: string, disposition: 'inline' | 'attachment' = 'inline') => (await http.get<{ url: string; expiresAt: string; fileName: string; mimeType: string }>(`/files/${fileId}/access`, { params: { disposition } })).data,
  archiveDocument: async (id: string) => (await http.post(`/documents/${id}/archive`)).data,
  createDocument: async (data: { title: string; number?: string; category?: string; description?: string }) => (await http.post('/documents', data)).data as EntityRecord,
  uploadDocumentVersion: async (id: string, file: File, onProgress?: (value: number) => void) => {
    const body = new FormData(); body.append('file', file)
    return (await http.post(`/documents/${id}/versions`, body, { onUploadProgress: (e) => onProgress?.(e.total ? Math.round(e.loaded * 100 / e.total) : 0) })).data as EntityRecord
  },
  publishDocument: async (id: string) => (await http.post(`/documents/${id}/publish`)).data,
  reprocessDocument: async (id: string) => (await http.post(`/documents/${id}/reprocess`)).data,

  templates: async (params: Record<string, string | number | undefined> = {}) => (await http.get<PageResult<EntityRecord>>('/templates', { params })).data,
  templatePreview: async (id: string, versionId: string) => (await http.get<EntityRecord>(`/templates/${id}/versions/${versionId}/preview`)).data,
  createTemplate: async (data: { name: string; description?: string; fields?: Array<Record<string, unknown>> }) => (await http.post('/templates', data)).data as EntityRecord,
  createTemplateVersion: async (id: string, data: { name: string; description?: string; fields?: Array<Record<string, unknown>> }) => (await http.post(`/templates/${id}/versions`, data)).data as EntityRecord,
  publishTemplate: async (id: string) => (await http.post(`/templates/${id}/publish`)).data,
  tasks: async (params: Record<string, string | number | undefined> = {}) => (await http.get<PageResult<EntityRecord>>('/tasks', { params })).data,
  task: async (id: string) => (await http.get<EntityRecord>(`/tasks/${id}`)).data,
  taskHistory: async (id: string, page = 1) => (await http.get<PageResult<EntityRecord>>(`/tasks/${id}/history`, { params: { page, limit: 20 } })).data,
  taskAssignees: async (params: Record<string, string | number | undefined> = {}) => (await http.get<PageResult<EntityRecord>>('/users/assignees', { params })).data,
  units: async (params: Record<string, string | number | undefined> = {}) => (await http.get<PageResult<EntityRecord>>('/users/units', { params })).data,
  createTask: async (data: { title: string; description?: string; unitId?: string; auditee?: string; assigneeId?: string; priority?: string; startDate?: string; dueDate?: string; instructions?: string; referenceDocumentIds?: string[]; reminders?: { enabled: boolean; offsetMinutes: number[] }; recurrenceId?: string | null }) => (await http.post('/tasks', data)).data,
  updateTask: async (id: string, data: Record<string, unknown>) => (await http.patch(`/tasks/${id}`, data)).data,

  reports: async (params: Record<string, string | number | undefined> = {}) => (await http.get<PageResult<EntityRecord>>('/reports', { params })).data,
  createReport: async (data: { taskId: string; file: File }, onProgress?: (value: number) => void) => {
    const body = new FormData(); body.append('taskId', data.taskId); body.append('file', data.file)
    return (await http.post('/reports', body, { onUploadProgress: (event) => onProgress?.(event.total ? Math.round(event.loaded * 100 / event.total) : 0) })).data as EntityRecord
  },
  updateReport: async (id: string, data: Record<string, unknown>) => (await http.patch(`/reports/${id}`, data)).data as EntityRecord,
  reportHistory: async (id: string, page = 1) => (await http.get<PageResult<EntityRecord>>(`/reports/${id}/history`, { params: { page, limit: 20 } })).data,
  report: async (id: string) => (await http.get<EntityRecord>(`/reports/${id}`)).data,
  reportVersions: async (id: string) => (await http.get<EntityRecord[]>(`/reports/${id}/versions`)).data,
  uploadReportVersion: async (id: string, file: File, onProgress?: (value: number) => void) => {
    const body = new FormData(); body.append('file', file)
    return (await http.post(`/reports/${id}/versions`, body, { onUploadProgress: (e) => onProgress?.(e.total ? Math.round(e.loaded * 100 / e.total) : 0) })).data as EntityRecord
  },
  reprocessReportVersion: async (id: string, versionId: string) => (await http.post(`/reports/${id}/versions/${versionId}/reprocess`)).data as { accepted: boolean; reportId: string; reportVersionId: string; jobId: string },
  reportVersionProcessStatus: async (id: string, versionId: string) => (await http.get<EntityRecord>(`/reports/${id}/versions/${versionId}/process-status`)).data,
  reportVersionPages: async (id: string, versionId: string, page = 1) => (await http.get<PageResult<EntityRecord>>(`/reports/${id}/versions/${versionId}/pages`, { params: { page, limit: 50 } })).data,
  reportAttachments: async (id: string) => (await http.get<EntityRecord[]>(`/reports/${id}/attachments`)).data,
  uploadReportAttachment: async (id: string, file: File, description?: string) => { const body = new FormData(); body.append('file', file); if (description) body.append('description', description); return (await http.post(`/reports/${id}/attachments`, body)).data as EntityRecord },
  startReview: async (id: string) => (await http.post(`/reports/${id}/ai-review`)).data as { queued: boolean; jobId: string; reviewId: string; reportVersionId: string },
  reviews: async (id: string) => (await http.get<ReviewRecord[]>(`/reports/${id}/ai-review`)).data,
  review: async (id: string, reviewId: string) => (await http.get<ReviewRecord>(`/reports/${id}/ai-review/${reviewId}`)).data,
  promptReview: async (id: string, reviewId: string, prompt: string) => (await http.post(`/reports/${id}/ai-review/${reviewId}/prompt`, { prompt })).data as { reviewId: string; messages: Array<{ role: 'user' | 'assistant'; content: string; createdAt: string }> },
  retryReview: async (id: string, reviewId: string) => (await http.post(`/reports/${id}/ai-review/${reviewId}/retry`)).data,
  recommendations: async (id: string, reviewId: string, page = 1) => (await http.get<PageResult<RecommendationRecord>>(`/reports/${id}/ai-review/${reviewId}/recommendations`, { params: { page, limit: 100 } })).data,
  updateRecommendation: async (id: string, reviewId: string, recommendationId: string, data: Record<string, unknown>) => (await http.patch(`/reports/${id}/ai-review/${reviewId}/recommendations/${recommendationId}`, data)).data,
  decideRecommendation: async (id: string, reviewId: string, recommendationId: string, decision: 'approve' | 'reject', note = '') => (await http.post(`/reports/${id}/ai-review/${reviewId}/recommendations/${recommendationId}/${decision}`, { note })).data,
  regulationMapping: async (id: string, reviewId: string) => (await http.get<EntityRecord[]>(`/reports/${id}/ai-review/${reviewId}/regulation-mapping`)).data,
  followUps: async (id: string, page = 1) => (await http.get<PageResult<FollowUpRecord>>(`/reports/${id}/follow-ups`, { params: { page, limit: 100 } })).data,
  createFollowUp: async (id: string, recommendationId: string, assigneeId?: string, dueDate?: string) => (await http.post(`/reports/${id}/follow-ups`, { recommendationId, assigneeId, dueDate })).data as FollowUpRecord,
  startFollowUp: async (id: string, followUpId: string) => (await http.patch(`/reports/${id}/follow-ups/${followUpId}`, { status: 'IN_PROGRESS' })).data,
  submitFollowUpEvidence: async (id: string, followUpId: string, file: File, description: string) => { const body = new FormData(); body.append('file', file); body.append('description', description); return (await http.post(`/reports/${id}/follow-ups/${followUpId}/submit-evidence`, body)).data },
  verifyFollowUp: async (id: string, followUpId: string, decision: 'COMPLETED' | 'REVISION_REQUIRED' | 'REJECTED', note: string) => (await http.post(`/reports/${id}/follow-ups/${followUpId}/verify`, { decision, note })).data,
  closeReport: async (id: string, note: string) => (await http.post(`/reports/${id}/close`, { note })).data,

  memos: async (params: Record<string, string | number | undefined> = {}) => (await http.get<PageResult<EntityRecord>>('/memos', { params })).data,
  memo: async (id: string) => (await http.get<EntityRecord>(`/memos/${id}`)).data,
  createMemo: async (data: { memoNumber: string; recipient: string; cc?: string; fromUnit: string; subject: string; memoDate: string; reportId: string; reportReviewId: string }) => (await http.post<EntityRecord>('/memos', data)).data,
  updateMemoStatus: async (id: string, status: 'SENT_TO_SHEYLA' | 'SENT_TO_DIRECTOR') => (await http.patch<EntityRecord>(`/memos/${id}/status`, { status })).data,
  uploadMemoDisposition: async (id: string, file: File) => { const body = new FormData(); body.append('file', file); return (await http.post(`/memos/${id}/disposition`, body)).data as { memo: EntityRecord; reportVersionId: string; extractionStatus: string } },
  submitMemoDisposition: async (id: string, text: string) => (await http.post(`/memos/${id}/disposition-text`, { text })).data as { memo: EntityRecord; reportVersionId: string; extractionStatus: string; inputMethod: 'MANUAL_TEXT' },
  startMemoDispositionReview: async (id: string) => (await http.post(`/memos/${id}/disposition-review`)).data as { queued: boolean; jobId?: string; reviewId: string; reportVersionId?: string; status?: string },
  memoDispositionReview: async (id: string) => (await http.get<{ review: ReviewRecord | null; recommendations: RecommendationRecord[] }>(`/memos/${id}/disposition-review`)).data,
  createManualFollowUpFromMemo: async (id: string, data: { title: string; description: string; action?: string; priority?: string; assigneeId?: string; dueDate?: string }) => (await http.post<FollowUpRecord>(`/memos/${id}/follow-ups/manual`, data)).data,

  notifications: async (params: Record<string, string | number | undefined> = {}) => (await http.get<NotificationPage>('/notifications', { params })).data,
  unreadNotificationCount: async () => (await http.get<{ count: number }>('/notifications/unread-count')).data,
  notification: async (id: string) => (await http.get<NotificationItem>(`/notifications/${id}`)).data,
  markNotificationRead: async (id: string) => (await http.patch<NotificationItem>(`/notifications/${id}/read`)).data,
  markAllNotificationsRead: async () => (await http.patch<{ updatedCount: number; unreadCount: number }>('/notifications/read-all')).data,
  notificationPreferences: async () => (await http.get<NotificationPreferences>('/notifications/preferences')).data,
  updateNotificationPreferences: async (data: Partial<NotificationPreferences>) => (await http.patch<NotificationPreferences>('/notifications/preferences', data)).data,
  notificationLogs: async (params: Record<string, string | number | undefined> = {}) => (await http.get<PageResult<EntityRecord>>('/notifications/logs', { params })).data,
  users: async (params: Record<string, string | number | undefined> = {}) => (await http.get<PageResult<EntityRecord>>('/users', { params })).data,
  updateUser: async (id: string, data: { unit?: string }) => (await http.patch<EntityRecord>(`/users/${id}`, data)).data,
  currentUser: async () => (await http.get<EntityRecord>('/users/me')).data,
  updateCurrentUser: async (data: { name?: string }) => (await http.patch('/users/me', data)).data as EntityRecord,
  changePassword: async (data: { currentPassword: string; newPassword: string }) => (await http.post('/users/me/change-password', data)).data,
  organizationProfile: async () => (await http.get<EntityRecord>('/organization/profile')).data,
  updateOrganizationProfile: async (data: Record<string, unknown>) => (await http.patch('/organization/profile', data)).data,
  systemSettings: async () => (await http.get<EntityRecord>('/system/settings')).data,
  updateSystemSettings: async (data: Record<string, unknown>) => (await http.patch('/system/settings', data)).data,
  integrationStatus: async () => (await http.get<EntityRecord[]>('/admin/integrations')).data,
}
