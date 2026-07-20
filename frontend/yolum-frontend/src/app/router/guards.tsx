import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'
import { PageLoader } from '@/components/shared/PageLoader'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function RoleRoute({ role }: { role: UserRole }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to={user.role === 'mentor' ? '/mentor/dashboard' : '/chat'} replace />
  }
  return <Outlet />
}

export function GuestOnlyRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) return <PageLoader />
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'mentor' ? '/mentor/dashboard' : '/chat'} replace />
  }
  return <Outlet />
}
