import { AuthProvider } from '@/context/AuthContext'
import { AppRouter } from '@/app/router'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

function App() {
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
