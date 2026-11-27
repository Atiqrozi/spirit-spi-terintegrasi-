export type Role = 'ADMIN_SPI' | 'ANGGOTA_SPI' | 'PIMPINAN_SPI'
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NOT_ASSESSABLE'
export type RecommendationType = 'REPORT_IMPROVEMENT' | 'INSPECTION_IMPROVEMENT'

export interface SessionUser { id: string; name: string; email: string; role: Role }
export interface LoginResponse { accessToken: string; refreshToken: string; user: SessionUser }
export interface EntityRecord {
  _id: string
  id?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  status?: string
  version?: number
  data?: Record<string, any>
  [key: string]: any
}
export interface DashboardSummary {
  reports: Array<{ _id: string; count: number }>
  tasks: Array<{ _id: string; count: number }>
  referenceDocuments: number
  metrics?: { reportTotal?: number; taskTotal?: number; tasksDueSoon?: number; tasksOverdue?: number; followUpsOpen?: number; referenceDocumentsActive?: number; referenceDocumentsProcessing?: number }
  recentActivity?: DashboardActivity[]
  upcomingDeadlines?: DashboardDeadline[]
  notifications?: NotificationItem[]
}
export interface PageResult<T> { items: T[]; page: number; limit: number; total: number }
export interface NotificationItem {
  _id: string
  category: string
  priority: 'NORMAL' | 'IMPORTANT'
  title: string
  message: string
  resource?: { type: string; id: string; route: string }
  readAt: string | null
  createdAt: string
}
export interface NotificationPage extends PageResult<NotificationItem> { unreadCount: number }
export type NotificationChannel = 'IN_APP' | 'EMAIL'
export interface NotificationPreferences {
  userId: string
  timezone: string
  categories: Record<string, Partial<Record<NotificationChannel, boolean>>>
  updatedAt?: string
}
export interface DashboardActivity { id: string; type: string; title: string; resource?: { type: string; id: string; route: string }; occurredAt: string }
export interface DashboardDeadline { taskId: string; title: string; dueAt: string; status: string; resourceRoute: string }
export interface ApiErrorBody { statusCode?: number; message?: string | string[]; error?: string }

export interface ReviewRecord extends EntityRecord {
  reportId: string
  reportVersionId: string
  data?: {
    summary?: string
    status?: string
    model?: string
    completedAt?: string
    limitations?: string[]
    regulationAssessments?: Array<Record<string, any>>
    promptHistory?: Array<{ role: 'user' | 'assistant'; content: string; actorId?: string; createdAt: string }>
    [key: string]: any
  }
  findings?: FindingRecord[]
  sources?: SourceRecord[]
  recommendations?: RecommendationRecord[]
}
export interface FindingRecord extends EntityRecord {
  title: string
  description: string
  priority: string
  complianceStatus: ComplianceStatus
  suggestion?: string
  reasoning?: string
  confidence?: number | null
  reportEvidence?: Array<{ pageNumber: number; quote: string }>
  sourceChunkIds?: string[]
  humanReview?: { complianceStatus?: ComplianceStatus; note?: string; reviewerId?: string }
}
export interface SourceRecord extends EntityRecord {
  findingId?: string
  chunkId: string
  documentId: string
  documentVersionId: string
  pageStart: number
  pageEnd: number
  section?: string
  text: string
}
export interface RecommendationRecord extends EntityRecord {
  reportId: string
  reviewId: string
  reportVersionId: string
  type: RecommendationType
  title: string
  description: string
  rationale?: string
  action?: string
  priority: string
  status: 'PENDING_REVIEW' | 'NEEDS_VERIFICATION' | 'APPROVED' | 'REJECTED'
  verificationStatus: 'SUPPORTED' | 'NEEDS_VERIFICATION'
  sourceChunkIds?: string[]
  reportEvidence?: Array<{ pageNumber: number; quote: string }>
}
export interface FollowUpRecord extends EntityRecord {
  reportId: string
  recommendationId: string
  taskId: string
  status: string
  assigneeId?: string
  dueDate?: string
  evidence?: Array<EntityRecord>
  task?: EntityRecord
}

