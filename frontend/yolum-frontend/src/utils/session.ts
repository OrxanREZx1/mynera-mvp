const SESSION_KEY = 'yolum_session_id'
const DEMO_PROFILE_KEY = 'yolum_demo_profile'

export type DemoStatus = 'school_student' | 'university_student' | 'graduate' | 'career_switcher'
export type DemoItLevel = 'know_nothing' | 'tried_before' | 'know_basics' | 'chose_field_need_roadmap'

export interface DemoProfile {
  sessionId: string
  status: DemoStatus
  itLevel: DemoItLevel
}

/**
 * Stable anonymous session id, persisted in localStorage.
 *
 * The backend uses this to "claim" records created before the person had
 * an account (career.UserAssessment, payments.WillingnessToPay,
 * analytics.Event — see accounts/views.py `_claim_anonymous_records`).
 * Sending the same session_id on register/login lets those anonymous rows
 * get attached to the new user automatically.
 */
export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function saveDemoProfile(status: DemoStatus, itLevel: DemoItLevel): DemoProfile {
  const profile: DemoProfile = {
    sessionId: getSessionId(),
    status,
    itLevel,
  }
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile))
  return profile
}
