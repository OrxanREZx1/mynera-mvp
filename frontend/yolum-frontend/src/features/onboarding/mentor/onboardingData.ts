export interface MentorOnboardingData {
  fullName: string
  email: string
  password: string
  avatarUrl: string
  agree: boolean
  field: string
  position: string
  experience: string
  workplace: string
  skills: string
  country: string
  linkedin: string
  github: string
  motivation: string
  helpTypes: string[]
  offerings: string[]
  sessionTypes: string[]
  paymentTypes: string[]
  introVideoDescription: string
}

export const emptyMentorOnboardingData: MentorOnboardingData = {
  fullName: '',
  email: '',
  password: '',
  avatarUrl: '',
  agree: false,
  field: '',
  position: '',
  experience: '',
  workplace: '',
  skills: '',
  country: '',
  linkedin: '',
  github: '',
  motivation: '',
  helpTypes: [],
  offerings: [],
  sessionTypes: [],
  paymentTypes: [],
  introVideoDescription: '',
}

export const positionOptions = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'UX/UI Designer',
  'Graphic Designer',
  'Data Analyst',
  'AI/ML Engineer',
  'DevOps Engineer',
  'Product Manager',
  'QA Engineer',
  'Digər',
]

export const countryOptions = ['Azərbaycan', 'Türkiyə', 'Gürcüstan', 'Rusiya', 'Almaniya', 'Digər']

export const helpTypeOptions = [
  { value: 'beginners', label: 'Yeni başlayanlar' },
  { value: 'switchers', label: 'Sahə dəyişənlər' },
]

export const offeringOptions = [
  { value: 'career-guidance', label: 'Karyera yönləndirmə' },
  { value: 'cv-review', label: 'CV yoxlanışı' },
  { value: 'portfolio-review', label: 'Portfolio yoxlanışı' },
  { value: 'interview-prep', label: 'Müsahibə hazırlığı' },
  { value: 'technical-mentoring', label: 'Texniki mentorluq' },
  { value: 'project-support', label: 'Layihə üzrə dəstək' },
  { value: 'freelance-advice', label: 'Freelance məsləhətləri' },
]

export const sessionTypeOptions = [
  { value: 'short', label: 'Qısa görüş (10–30 dəqiqə)' },
  { value: 'standard', label: 'Standart görüş (30 dəqiqə – 2 saat)' },
  { value: 'long', label: 'Uzunmüddətli mentorluq (1–3 həftə)' },
]

export const paymentTypeOptions = [
  { value: 'free', label: 'Ödənişsiz' },
  { value: 'paid', label: 'Ödənişli' },
]
