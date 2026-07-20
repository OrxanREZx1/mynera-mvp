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
  detail?: string
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
    if (!error.response) {
      return 'Serverə qoşulmaq mümkün olmadı. Backend serverini başladıb yenidən cəhd et.'
    }

    const { code, detail } = error.response.data ?? {}
    if (code === 'google_not_configured') {
      return 'Google girişi hazırda konfiqurasiya edilməyib. Zəhmət olmasa administratora bildir.'
    }
    if (code === 'google_provider_unavailable') {
      return 'Google doğrulama xidməti müvəqqəti əlçatan deyil. Bir az sonra yenidən cəhd et.'
    }
    if (detail) return detail
  }

  return 'Google ilə daxil olmaq mümkün olmadı. Yenidən cəhd et.'
}
