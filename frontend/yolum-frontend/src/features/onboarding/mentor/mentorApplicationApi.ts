import axios from 'axios'
import { apiClient } from '@/services/api/client'
import type { MentorApplication, MentorApplicationPayload } from './onboardingData'

export const mentorApplicationApi = {
  async create(payload: MentorApplicationPayload): Promise<MentorApplication> {
    const { data } = await apiClient.post<MentorApplication>('/mentors/applications/', payload)
    return data
  },

  async getMine(): Promise<MentorApplication | null> {
    try {
      const { data } = await apiClient.get<MentorApplication>('/mentors/applications/me/')
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null
      throw error
    }
  },
}

interface ApiErrorBody {
  detail?: string
  nonFieldErrors?: string[]
  [field: string]: unknown
}

export function mentorApplicationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return 'Gözlənilməz xəta baş verdi. Yenidən cəhd edin.'

  if (error.code === 'ECONNABORTED') return 'Server gec cavab verir. Bir qədər sonra yenidən cəhd edin.'
  if (!error.response) return 'Serverə qoşulmaq mümkün olmadı. İnternet bağlantınızı yoxlayın.'

  const body = error.response.data
  if (typeof body?.detail === 'string') return body.detail
  if (Array.isArray(body?.nonFieldErrors) && typeof body.nonFieldErrors[0] === 'string') {
    return body.nonFieldErrors[0]
  }

  if (body && typeof body === 'object') {
    for (const value of Object.values(body)) {
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
      if (typeof value === 'string') return value
    }
  }

  if (error.response.status >= 500) return 'Serverdə xəta baş verdi. Bir qədər sonra yenidən cəhd edin.'
  return 'Məlumatları yoxlayıb yenidən cəhd edin.'
}
