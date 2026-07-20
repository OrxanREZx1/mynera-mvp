export interface UserOnboardingData {
  status: string
  intent: string
  motivation: string
  level: string
  timeCommitment: string
  fields: string[]
}

export const emptyUserOnboardingData: UserOnboardingData = {
  status: '',
  intent: '',
  motivation: '',
  level: '',
  timeCommitment: '',
  fields: [],
}

// Values match accounts.models.User.Status on the backend exactly, so no
// mapping is needed when calling authApi.register.
export const statusOptions = [
  { value: 'school_student', emoji: '🎒', label: 'Məktəbli' },
  { value: 'university_student', emoji: '🎓', label: 'Tələbə' },
  { value: 'graduate', emoji: '📜', label: 'Məzun' },
  { value: 'career_switcher', emoji: '🔄', label: 'Sahə dəyişirəm' },
]

export const intentOptions = [
  { value: 'explore', emoji: '🔍', label: 'AI ilə IT sahələrini araşdırmaq' },
  { value: 'plan', emoji: '🎯', label: 'Şəxsi karyera planı əldə etmək' },
]

export const motivationOptions = [
  { value: 'start', emoji: '🚀', label: 'Karyeraya başlamaq' },
  { value: 'switch', emoji: '🔄', label: 'Sahə dəyişmək' },
  { value: 'freelance', emoji: '💰', label: 'Freelance' },
  { value: 'curious', emoji: '🤔', label: 'Sadəcə maraq' },
]

// Values match accounts.models.User.ITLevel on the backend exactly, so no
// mapping is needed when calling authApi.register.
export const levelOptions = [
  { value: 'know_nothing', emoji: '🌱', label: 'Təcrübəm yoxdur' },
  { value: 'tried_before', emoji: '🔁', label: 'Öyrənməyə cəhd etmişəm' },
  { value: 'know_basics', emoji: '🔥', label: 'Əsas biliklərim var' },
  { value: 'chose_field_need_roadmap', emoji: '⚡', label: 'Sahəni seçmişəm, roadmap lazımdır' },
]

export const timeOptions = [
  { value: '1-3', emoji: '⏳', label: '1–3 saat' },
  { value: '4-7', emoji: '🕒', label: '4–7 saat' },
  { value: '8+', emoji: '🚀', label: '8+ saat' },
]

export const fieldOptions = [
  { value: 'math-logic', emoji: '🧮', label: 'Math & Logic' },
  { value: 'problem-solving', emoji: '🧩', label: 'Problem Solving' },
  { value: 'design', emoji: '🎨', label: 'Design & Creativity' },
  { value: 'coding', emoji: '💻', label: 'Coding & Building' },
  { value: 'security', emoji: '🔐', label: 'Security & Privacy' },
  { value: 'data', emoji: '📊', label: 'Data & Analysis' },
  { value: 'mobile', emoji: '📱', label: 'Mobile Apps' },
  { value: 'cloud', emoji: '☁️', label: 'Cloud & Infrastructure' },
  { value: 'ethical-hacking', emoji: '🕵️', label: 'Ethical Hacking' },
  { value: 'systems', emoji: '⚙️', label: 'Systems & Architecture' },
]
