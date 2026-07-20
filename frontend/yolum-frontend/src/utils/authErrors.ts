import axios from 'axios'

export type GoogleAuthUiErrorCode = 'google_not_configured' | 'google_sdk_unavailable'

export class GoogleAuthUiError extends Error {
  readonly code: GoogleAuthUiErrorCode

  constructor(code: GoogleAuthUiErrorCode, message: string) {
    super(message)
    this.name = 'GoogleAuthUiError'
    this.code = code
  }
}

interface CodedError {
  code?: string
}

interface BackendErrorBody {
  code?: string
  detail?: unknown
  [key: string]: unknown
}

type AuthAction = 'login' | 'register'

function flattenErrorMessages(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(flattenErrorMessages)
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => key !== 'code')
      .flatMap(([, nested]) => flattenErrorMessages(nested))
  }
  return []
}

function isTimeoutError(error: { code?: string; message?: string }): boolean {
  return error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout') === true
}

export function authRequestErrorMessage(error: unknown, action: AuthAction): string {
  const fallback =
    action === 'register' ? 'Qeydiyyatı tamamlamaq mümkün olmadı. Yenidən cəhd et.' : 'E-poçt və ya şifrə yanlışdır.'

  if (!axios.isAxiosError<BackendErrorBody>(error)) return fallback

  if (isTimeoutError(error)) {
    return 'Serverin oyanması gözləniləndən uzun çəkdi. Bir neçə saniyə sonra yenidən cəhd et.'
  }
  if (!error.response) {
    return 'Serverə qoşulmaq mümkün olmadı. İnternet bağlantısını yoxlayıb yenidən cəhd et.'
  }
  if (error.response.status === 429) {
    return 'Çox sayda cəhd edildi. Bir az gözləyib yenidən cəhd et.'
  }
  if (error.response.status >= 500) {
    return 'Serverdə müvəqqəti problem yarandı. Bir az sonra yenidən cəhd et.'
  }

  const messages = flattenErrorMessages(error.response.data)
  return messages.length > 0 ? messages.join(' ') : fallback
}

export function googleAuthErrorMessage(error: unknown): string {
  const localCode = (error as CodedError | undefined)?.code
  if (localCode === 'google_not_configured') {
    return 'Google girişi hazırda konfiqurasiya edilməyib. Zəhmət olmasa administratora bildir.'
  }
  if (localCode === 'google_sdk_unavailable') {
    return 'Google giriş xidməti açılmadı. İnternet bağlantısını yoxlayıb yenidən cəhd et.'
  }

  if (axios.isAxiosError<BackendErrorBody>(error)) {
    if (isTimeoutError(error)) {
      return 'Serverin oyanması gözləniləndən uzun çəkdi. Bir neçə saniyə sonra yenidən cəhd et.'
    }
    if (!error.response) {
      return 'Serverə qoşulmaq mümkün olmadı. İnternet bağlantısını yoxlayıb yenidən cəhd et.'
    }

    const { code, detail } = error.response.data ?? {}
    if (code === 'google_not_configured') {
      return 'Google girişi hazırda konfiqurasiya edilməyib. Zəhmət olmasa administratora bildir.'
    }
    if (code === 'google_provider_unavailable') {
      return 'Google doğrulama xidməti müvəqqəti əlçatan deyil. Bir az sonra yenidən cəhd et.'
    }
    if (typeof detail === 'string') return detail
  }

  return 'Google ilə daxil olmaq mümkün olmadı. Yenidən cəhd et.'
}
