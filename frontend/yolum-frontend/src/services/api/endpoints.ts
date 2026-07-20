import type { AuthUser, ChatMessage, Mentor, MentorCategory, Roadmap } from '@/types'
import { apiClient, ACCESS_TOKEN_KEY, AUTH_REQUEST_TIMEOUT_MS, REFRESH_TOKEN_KEY } from './client'
import { getSessionId } from '@/utils/session'
import {
  blogPosts,
  faqItems,
  games,
  mentorSessions,
  notifications,
  pricingPlans,
  reviews,
  transactions,
  weeklySessionActivity,
} from './mockData'

// ---------------------------------------------------------------------------
// What's actually wired to the Django backend vs. what's still mock data
// ---------------------------------------------------------------------------
// The backend implements: auth, a career assessment quiz + AI recommendation,
// a mentor marketplace, LMS roadmaps, a willingness-to-pay/mock-payment
// funnel, event analytics, AND the AIRA assistant.
//
// REAL (talk to the Django API):
//   authApi, careerApi, mentorHelpApi, paymentsApi, analyticsApi,
//   mentorsApi     -> /mentors/
//   lmsApi         -> /lms/my-roadmap/, /lms/lessons/.../toggle/
//   chatApi        -> GET/POST /aira/chat/        (Aira free chat + history)
//   airaApi        -> POST /aira/generate-roadmap/
//
// STILL MOCK (no matching backend models yet): pricingApi, faqApi, blogApi,
// gamesApi, notificationsApi, and mentorDashboardApi.

function wait<T>(data: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms))
}

// --- Auth (real) -----------------------------------------------------------

interface BackendUser {
  id: number
  email: string
  full_name: string
  phone_number: string
  telegram_username: string
  avatar_url: string
  status: string
  it_level: string
  date_joined: string
}

interface AuthResponse {
  user: BackendUser
  tokens: { access: string; refresh: string }
  claimed_assessments: number
}

function storeTokens(tokens: { access: string; refresh: string }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
}

/** Maps the backend's UserSerializer shape onto the frontend's AuthUser type. */
function toAuthUser(user: BackendUser): AuthUser {
  return {
    id: String(user.id),
    fullName: user.full_name,
    email: user.email,
    avatarUrl: user.avatar_url || undefined,
    // The backend has no mentor-account concept yet (Mentor is a static
    // profile, not a login) — every registered user is a 'student' here.
    role: 'student',
    isPremium: false,
    planId: 'starter',
  }
}

export interface RegisterPayload {
  email: string
  password: string
  password2: string
  full_name: string
  phone_number?: string
  telegram_username?: string
  status: 'school_student' | 'university_student' | 'graduate' | 'career_switcher'
  it_level: 'know_nothing' | 'tried_before' | 'know_basics' | 'chose_field_need_roadmap'
}

export interface GoogleAuthPayload {
  credential: string
  status?: RegisterPayload['status']
  it_level?: RegisterPayload['it_level']
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/login/',
      {
        email,
        password,
        session_id: getSessionId(),
      },
      { timeout: AUTH_REQUEST_TIMEOUT_MS }
    )
    storeTokens(data.tokens)
    return toAuthUser(data.user)
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/register/',
      {
        ...payload,
        session_id: getSessionId(),
      },
      { timeout: AUTH_REQUEST_TIMEOUT_MS }
    )
    storeTokens(data.tokens)
    return toAuthUser(data.user)
  },

  async google(payload: GoogleAuthPayload): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/google/',
      {
        ...payload,
        session_id: getSessionId(),
      },
      { timeout: AUTH_REQUEST_TIMEOUT_MS }
    )
    storeTokens(data.tokens)
    return toAuthUser(data.user)
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<BackendUser>('/auth/me/')
    return toAuthUser(data)
  },

  async logout(): Promise<void> {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
    try {
      if (refresh) await apiClient.post('/auth/logout/', { refresh })
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  },

  // Mock only — the backend has no password-reset/OTP endpoints yet.
  // Kept so the existing forgot-password UI keeps working; wire these up
  // once the backend adds a real "send code" / "verify code" flow.
  async requestOtp(_email: string) {
    await wait(null, 600)
    return { success: true }
  },
  async verifyOtp(code: string) {
    await wait(null, 600)
    if (code.length < 4) throw new Error('Kod düzgün deyil')
    return { success: true }
  },
}

// --- Career assessment quiz (real) -----------------------------------------
// Not yet wired into any page's UI — the current onboarding flow
// (src/features/onboarding) collects different, lighter-weight data than
// this quiz. Exposed here so a real "Test" page can be built against it.

export interface CareerQuestion {
  id: number
  text: string
  order: number
  choices: { id: number; text: string }[]
}

export const careerApi = {
  async questions(): Promise<CareerQuestion[]> {
    const { data } = await apiClient.get<CareerQuestion[]>('/questions/')
    return data
  },

  async submitAnswers(answers: Record<number, number>) {
    const { data } = await apiClient.post('/submit-answers/', {
      session_id: getSessionId(),
      answers,
    })
    return data as { session_id: string; assessment_id: number; result: Record<string, unknown> }
  },

  async assessment(sessionId: string) {
    const { data } = await apiClient.get(`/assessments/${sessionId}/`)
    return data
  },

  async myAssessments() {
    const { data } = await apiClient.get('/my-assessments/')
    return data
  },
}

// --- "Ask a mentor" request form (real) -------------------------------------
// This is the backend's actual mentor feature: a lightweight help-request
// form against 1-2 static mentor profiles — distinct from the marketplace
// browsing experience in mentorsApi below.

export interface MentorHelpRequestPayload {
  mentor_id?: number
  assessment_id?: number
  topic: string
  preferred_format: 'chat' | 'call'
  willingness_to_pay?: 'no' | '5' | '10' | '15' | '20' | 'custom'
  custom_amount?: number
  contact_info?: string
}

export const mentorHelpApi = {
  async listProfiles(): Promise<Mentor[]> {
    return getMentors()
  },
  async submitRequest(payload: MentorHelpRequestPayload) {
    const { data } = await apiClient.post('/mentors/requests/', payload)
    return data
  },
  async myRequests() {
    const { data } = await apiClient.get('/mentors/my-requests/')
    return data
  },
}

// --- Willingness-to-pay / mock payment funnel (real) ------------------------

export interface WillingnessToPayPayload {
  assessment_id?: number
  roadmap_plan: '30_days' | '60_days'
  selected_amount: '0' | '5' | '10' | '20' | '30' | '50' | 'custom'
  custom_amount?: number
}

export const paymentsApi = {
  async create(payload: WillingnessToPayPayload) {
    const { data } = await apiClient.post('/payments/willingness-to-pay/', {
      ...payload,
      session_id: getSessionId(),
    })
    return data
  },
  async mine() {
    const { data } = await apiClient.get('/payments/my-willingness-to-pay/')
    return data
  },
  async detail(publicId: string) {
    const { data } = await apiClient.get(`/payments/${publicId}/`)
    return data
  },
  async continueToPayment(publicId: string) {
    const { data } = await apiClient.post(`/payments/${publicId}/continue-to-payment/`)
    return data
  },
  async mockPayment(publicId: string, simulateFailure = false) {
    const { data } = await apiClient.post(`/payments/${publicId}/mock-payment/`, {
      simulate_failure: simulateFailure,
    })
    return data
  },
  async submitContact(
    publicId: string,
    contact: { contact_full_name?: string; contact_email?: string; contact_phone?: string }
  ) {
    const { data } = await apiClient.post(`/payments/${publicId}/contact/`, contact)
    return data
  },
}

// --- Analytics event tracking (real) ----------------------------------------

export type ClientTrackableEvent =
  | 'landing_page_viewed'
  | 'signup_started'
  | 'assessment_started'
  | 'roadmap_viewed'
  | 'mock_payment_page_viewed'
  | 'mentor_help_clicked'
  | 'mentor_page_viewed'

export const analyticsApi = {
  async track(eventName: ClientTrackableEvent, metadata?: Record<string, unknown>) {
    try {
      await apiClient.post('/analytics/track/', {
        event_name: eventName,
        session_id: getSessionId(),
        metadata: metadata ?? {},
      })
    } catch {
      // Analytics failures should never break the UI.
    }
  },
}

// --- Mentor marketplace (real) ---------------------------------------------

export async function getMentors(category?: MentorCategory): Promise<Mentor[]> {
  const params = category && category !== 'all' ? { category } : undefined
  const { data } = await apiClient.get<Mentor[]>('/mentors/', { params })
  return data
}

export async function getMentorById(id: string): Promise<Mentor> {
  const { data } = await apiClient.get<Mentor>(`/mentors/${id}/`)
  return data
}

export const mentorsApi = {
  list: getMentors,
  byId: getMentorById,
}

// ---------------------------------------------------------------------------
// Mock-backed APIs (no matching backend model yet — see note above)
// ---------------------------------------------------------------------------

export const pricingApi = {
  async list() {
    return wait(pricingPlans, 350)
  },
}

export const faqApi = {
  async list() {
    return wait(faqItems, 300)
  },
}

export const blogApi = {
  async list() {
    return wait(blogPosts, 450)
  },
  async byId(id: string) {
    const data = await wait(blogPosts, 350)
    return data.find((p) => p.id === id)
  },
}

export const gamesApi = {
  async list() {
    return wait(games, 400)
  },
}

export const notificationsApi = {
  async list() {
    return wait(notifications, 350)
  },
}

export const mentorDashboardApi = {
  async sessions() {
    return wait(mentorSessions, 450)
  },
  async reviews() {
    return wait(reviews, 450)
  },
  async transactions() {
    return wait(transactions, 400)
  },
  async weeklyActivity() {
    return wait(weeklySessionActivity, 350)
  },
}

// --- Aira AI assistant (real) -----------------------------------------------
// Backed by backend/aira using the backend-configured OpenAI model. Requires the user to be
// logged in (JWT) and OPENAI_API_KEY to be set in the backend's .env —
// see backend/aira/services.py. Unlike the mock APIs above, sendMessage and
// generateRoadmap talk to the real model; nothing here is scripted/fake.

interface BackendChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface ChatReplyResponse {
  reply: string
  message: BackendChatMessage
}

function toChatMessage(message: BackendChatMessage): ChatMessage {
  return { ...message, id: String(message.id) }
}

export const chatApi = {
  async history(): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<BackendChatMessage[]>('/aira/chat/')
    return data.map(toChatMessage)
  },

  async sendMessage(content: string, messages: ChatMessage[]): Promise<ChatMessage> {
    const history = messages.slice(-20).map((message) => ({
      role: message.role,
      content: message.content,
    }))

    const { data } = await apiClient.post<ChatReplyResponse>('/aira/chat/', {
      message: content,
      history,
    })
    return toChatMessage(data.message)
  },
}

export interface AiraRoadmapAnswers {
  founder: string
  idea: string
  differentiation: string
  target: string
  resources: string
}

interface BackendRoadmapPlan extends Omit<Roadmap, 'id'> {
  id: number
  recommended_field: string
}

function toRoadmap(plan: BackendRoadmapPlan): Roadmap {
  return { ...plan, id: String(plan.id) }
}

export const airaApi = {
  /** Generates and persists a brand-new personal roadmap from the 5 guided-chat answers. */
  async generateRoadmap(answers: AiraRoadmapAnswers): Promise<Roadmap> {
    const { data } = await apiClient.post<BackendRoadmapPlan>('/aira/generate-roadmap/', answers)
    return toRoadmap(data)
  },
}

// --- LMS roadmap and user progress (real) ----------------------------------

export async function getMyRoadmap(): Promise<Roadmap> {
  const { data } = await apiClient.get<Roadmap>('/lms/my-roadmap/')
  return data
}

export async function toggleLesson(lessonId: string): Promise<Roadmap> {
  const { data } = await apiClient.post<Roadmap>(`/lms/lessons/${lessonId}/toggle/`)
  return data
}

export const lmsApi = {
  myRoadmap: getMyRoadmap,
  toggleLesson,
}
