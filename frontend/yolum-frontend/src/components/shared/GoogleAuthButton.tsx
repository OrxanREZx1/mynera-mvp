import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { GoogleAuthUiError } from '@/utils/authErrors'
import { useDelayedFlag } from '@/hooks/useDelayedFlag'

const GOOGLE_SCRIPT_ID = 'google-identity-services'
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

let sdkPromise: Promise<GoogleAccountsId> | null = null
let configuredClientId: string | null = null
let activeCredentialHandler: ((credential: string) => void) | null = null
let missingConfigLogged = false

function notConfiguredError() {
  return new GoogleAuthUiError('google_not_configured', 'Google OAuth Client ID is missing from the frontend.')
}

function sdkUnavailableError(message: string) {
  return new GoogleAuthUiError('google_sdk_unavailable', message)
}

function loadGoogleSdk(): Promise<GoogleAccountsId> {
  if (window.google?.accounts.id) return Promise.resolve(window.google.accounts.id)
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    let script = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = GOOGLE_SCRIPT_ID
      script.src = GOOGLE_SCRIPT_URL
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const handleLoad = () => {
      cleanup()
      if (window.google?.accounts.id) resolve(window.google.accounts.id)
      else reject(sdkUnavailableError('Google Identity Services did not initialize.'))
    }
    const handleError = () => {
      cleanup()
      script?.remove()
      reject(sdkUnavailableError('Google Identity Services could not be loaded.'))
    }
    const timeoutId = window.setTimeout(() => {
      cleanup()
      script?.remove()
      reject(sdkUnavailableError('Google Identity Services timed out while loading.'))
    }, 10_000)
    const cleanup = () => {
      window.clearTimeout(timeoutId)
      script?.removeEventListener('load', handleLoad)
      script?.removeEventListener('error', handleError)
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })
  }).catch((error) => {
    sdkPromise = null
    throw error
  })

  return sdkPromise
}

function initializeGoogleSdk(sdk: GoogleAccountsId, clientId: string) {
  if (configuredClientId && configuredClientId !== clientId) {
    throw sdkUnavailableError('Google OAuth Client ID changed after initialization.')
  }
  if (configuredClientId) return

  sdk.initialize({
    client_id: clientId,
    ux_mode: 'popup',
    auto_select: false,
    callback: (response) => activeCredentialHandler?.(response.credential),
  })
  configuredClientId = clientId
}

interface GoogleAuthButtonProps {
  mode: 'signin' | 'signup'
  onCredential: (credential: string) => Promise<void>
  onError: (error: unknown) => void
}

type SetupStatus = 'loading' | 'ready' | 'unavailable'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.64-2.36l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  )
}

export function GoogleAuthButton({ mode, onCredential, onError }: GoogleAuthButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onCredentialRef = useRef(onCredential)
  const onErrorRef = useRef(onError)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const showServerPreparing = useDelayedFlag(isSubmitting)
  const [status, setStatus] = useState<SetupStatus>(GOOGLE_CLIENT_ID ? 'loading' : 'unavailable')
  const setupErrorRef = useRef<GoogleAuthUiError | null>(GOOGLE_CLIENT_ID ? null : notConfiguredError())

  useEffect(() => {
    onCredentialRef.current = onCredential
    onErrorRef.current = onError
  }, [onCredential, onError])

  useEffect(() => {
    let mounted = true

    if (!GOOGLE_CLIENT_ID) {
      if (import.meta.env.DEV && !missingConfigLogged) {
        console.warn(setupErrorRef.current?.message)
        missingConfigLogged = true
      }
      return
    }

    loadGoogleSdk()
      .then((sdk) => {
        if (!mounted || !containerRef.current || !wrapperRef.current) return
        initializeGoogleSdk(sdk, GOOGLE_CLIENT_ID)

        activeCredentialHandler = (credential) => {
          if (!mounted) return
          setIsSubmitting(true)
          void onCredentialRef
            .current(credential)
            .catch((error) => onErrorRef.current(error))
            .finally(() => {
              if (mounted) setIsSubmitting(false)
            })
        }

        const width = Math.min(400, Math.max(240, wrapperRef.current.clientWidth))
        containerRef.current.replaceChildren()
        sdk.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
          width,
        })
        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (!mounted) return
        const setupError =
          error instanceof GoogleAuthUiError
            ? error
            : sdkUnavailableError('Google Identity Services could not be initialized.')
        setupErrorRef.current = setupError
        setStatus('unavailable')
        if (import.meta.env.DEV) console.error(setupError)
      })

    return () => {
      mounted = false
      activeCredentialHandler = null
    }
  }, [mode])

  const handleUnavailableClick = () => {
    onErrorRef.current(setupErrorRef.current ?? notConfiguredError())
  }

  return (
    <div ref={wrapperRef} className="w-full">
      <div
        ref={containerRef}
        aria-busy={isSubmitting}
        className={
          status === 'ready'
            ? isSubmitting
              ? 'pointer-events-none flex justify-center opacity-60'
              : 'flex justify-center'
            : 'hidden'
        }
      />
      {status !== 'ready' && (
        <Button
          type="button"
          variant="outline"
          className="mx-auto h-10 w-full max-w-[400px] border-[#dadce0] bg-white text-sm font-medium text-ink-700 hover:bg-ink-50"
          loading={status === 'loading'}
          onClick={handleUnavailableClick}
        >
          {status !== 'loading' && <GoogleMark />}
          {status === 'loading' ? 'Google hazırlanır...' : 'Google ilə davam et'}
        </Button>
      )}
      {isSubmitting && (
        <p role="status" className="mt-2 text-center text-xs text-ink-500">
          {showServerPreparing ? 'Server hazırlanır, ilk giriş bir qədər çəkə bilər...' : 'Google hesabı yoxlanılır...'}
        </p>
      )}
    </div>
  )
}
