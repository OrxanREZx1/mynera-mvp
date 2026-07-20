import { useEffect } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { AppRouter } from '@/app/router'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { warmBackend } from '@/services/api/client'

function App() {
  useEffect(() => {
    void warmBackend()
  }, [])

  return (
    <AuthProvider>
      <TooltipProvider delayDuration={200}>
        <AppRouter />
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  )
}

export default App
