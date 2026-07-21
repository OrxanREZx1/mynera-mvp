export type MentorApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected'

export interface MentorApplicationFormData {
  avatar: string
  fullName: string
  email: string
  professionalField: string
  seniority: string
  experienceYears: number
  skills: string[]
  linkedin: string
  country: string
  motivation: string
  targetMenteeTypes: string[]
  offeredServices: string[]
  sessionTypes: string[]
  paymentPreference: string
}

export interface MentorApplicationPayload {
  avatar: string
  professionalField: string
  seniority: string
  experienceYears: number
  skills: string[]
  linkedin: string
  country: string
  motivation: string
  targetMenteeTypes: string[]
  offeredServices: string[]
  sessionTypes: string[]
  paymentPreference: string
}

export interface MentorApplication extends MentorApplicationPayload {
  id: string
  fullName: string
  email: string
  status: MentorApplicationStatus
  submittedAt: string
  updatedAt: string
}

export const emptyMentorApplicationData: MentorApplicationFormData = {
  avatar: '',
  fullName: '',
  email: '',
  professionalField: '',
  seniority: '',
  experienceYears: 0,
  skills: [],
  linkedin: '',
  country: 'Azərbaycan',
  motivation: '',
  targetMenteeTypes: [],
  offeredServices: [],
  sessionTypes: [],
  paymentPreference: '',
}

export function toApplicationPayload(data: MentorApplicationFormData): MentorApplicationPayload {
  return {
    avatar: data.avatar.trim(),
    professionalField: data.professionalField.trim(),
    seniority: data.seniority,
    experienceYears: data.experienceYears,
    skills: data.skills,
    linkedin: data.linkedin.trim(),
    country: data.country,
    motivation: data.motivation.trim(),
    targetMenteeTypes: data.targetMenteeTypes,
    offeredServices: data.offeredServices,
    sessionTypes: data.sessionTypes,
    paymentPreference: data.paymentPreference,
  }
}

export const seniorityOptions = [
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Principal' },
]

export const countryOptions = ['Azərbaycan', 'Türkiyə', 'Gürcüstan', 'Almaniya', 'Birləşmiş Krallıq', 'Digər']

export const targetMenteeOptions = [
  { value: 'beginners', label: 'Yeni başlayanlar' },
  { value: 'students', label: 'Tələbələr' },
  { value: 'career-switchers', label: 'Sahə dəyişənlər' },
  { value: 'professionals', label: 'İnkişaf etmək istəyən mütəxəssislər' },
]

export const offeredServiceOptions = [
  { value: 'career-guidance', label: 'Karyera yönləndirməsi' },
  { value: 'cv-review', label: 'CV yoxlanışı' },
  { value: 'portfolio-review', label: 'Portfolio yoxlanışı' },
  { value: 'interview-prep', label: 'Müsahibə hazırlığı' },
  { value: 'technical-mentoring', label: 'Texniki mentorluq' },
  { value: 'project-support', label: 'Layihə dəstəyi' },
]

export const sessionTypeOptions = [
  { value: 'one-to-one', label: 'Fərdi 1:1 sessiya' },
  { value: 'group', label: 'Qrup sessiyası' },
  { value: 'async', label: 'Asinxron yazılı dəstək' },
  { value: 'long-term', label: 'Uzunmüddətli mentorluq' },
]

export const paymentPreferenceOptions = [
  { value: 'free', label: 'Ödənişsiz mentorluq' },
  { value: 'paid', label: 'Ödənişli mentorluq' },
  { value: 'both', label: 'Hər iki format' },
]
