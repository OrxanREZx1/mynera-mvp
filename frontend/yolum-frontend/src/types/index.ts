// Core domain types shared across the app.
// The backend is not wired up yet — see services/api for the mock data layer
// that implements these same shapes so swapping in real endpoints later is a
// drop-in replacement.

export type UserRole = 'student' | 'mentor'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  avatarUrl?: string
  role: UserRole
  field?: string
  location?: string
  isPremium: boolean
  planId: PlanId
}

export type PlanId = 'starter' | 'standard' | 'premium'

export interface PricingPlan {
  id: PlanId
  name: string
  priceMonthly: number
  description: string
  ctaLabel: string
  highlighted?: boolean
  features: { label: string; description: string }[]
}

export interface Mentor {
  id: string
  fullName: string
  title: string
  company?: string
  avatarUrl: string
  coverUrl?: string
  country: string
  countryFlag: string
  rating: number
  reviewCount: number
  price: number
  priceUnit: string
  tags: string[]
  category: MentorCategory
  bio?: string
  skills?: string[]
  stats?: { sessions: number; years: number; students: number; satisfaction: number }
  discountPrice?: number
  isFree?: boolean
  isFavorite?: boolean
}

export type MentorCategory =
  | 'all'
  | 'ai-ml'
  | 'ux-ui'
  | 'graphic-design'
  | 'backend'
  | 'frontend'
  | 'data'
  | 'security'

export type SessionType = 'short' | 'standard' | 'long'

export interface MentorSession {
  id: string
  studentName: string
  studentTitle: string
  studentAvatarUrl: string
  topic: string
  date: string
  timeRange: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  meetingLink?: string
}

export interface Review {
  id: string
  authorName: string
  authorTitle: string
  authorAvatarUrl: string
  topic: string
  rating: number
  date: string
  comment?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  pending?: boolean
}

export interface RoadmapLesson {
  id: string
  title: string
  completed: boolean
  locked: boolean
}

export interface RoadmapModule {
  id: string
  index: number
  title: string
  duration: string
  lessons: RoadmapLesson[]
}

export interface Roadmap {
  id: string
  title: string
  /** Recommended backend field slug; may be blank for curated roadmaps. */
  recommended_field?: string
  progressPercent: number
  completedStages: number
  totalStages: number
  modules: RoadmapModule[]
  // Daily-activity gamification stats. There is no real backend tracking
  // for these yet (no lesson-time or login-streak model) — they are
  // undefined until the backend has real lesson-time and streak tracking.
  // UI must treat missing values as "no data", never fabricate a number.
  dailyGoalPercent?: number
  streakDays?: number
  learningMinutesToday?: number
  topicsCompletedToday?: number
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  authorName: string
  authorTitle: string
  authorAvatarUrl: string
  coverUrl: string
  date: string
  likes: number
  views: string
  kind: 'blog' | 'podcast'
  category: string
}

export interface Game {
  id: string
  title: string
  category: string
  description: string
  imageUrl: string
  tags: string[]
  href: string
}

export interface Notification {
  id: string
  icon: string
  title: string
  description: string
  date: string
  time: string
  read: boolean
}

export interface FaqItem {
  question: string
  answer: string
}

export interface Transaction {
  id: string
  studentName: string
  studentTitle: string
  studentAvatarUrl: string
  sessionTitle: string
  date: string
  amount: number
}

export type ToastVariant = 'default' | 'success' | 'destructive'
