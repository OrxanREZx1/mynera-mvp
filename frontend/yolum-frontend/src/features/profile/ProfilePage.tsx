import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  CreditCard,
  Heart,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'

const navItems = [
  { label: 'Hesab məlumatları', to: '/profile/account', icon: Settings },
  { label: 'Sevimlilər', to: '/profile/favorites', icon: Heart },
  { label: 'Maraqlarım', to: '/profile/interests', icon: Sparkles },
  { label: 'Abonəlik', to: '/profile/subscription', icon: CreditCard },
  { label: 'Bildiriş ayarları', to: '/profile/notification-settings', icon: Bell },
  { label: 'Təhlükəsizlik', to: '/profile/security', icon: ShieldCheck },
  { label: 'Kömək və dəstək', to: '/profile/help', icon: UserRound },
]

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isIndex = location.pathname === '/profile'

  return (
    <div className="container max-w-5xl py-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className={cn('flex flex-col gap-6', !isIndex && 'hidden lg:flex')}>
          <div className="flex items-center gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-card">
            <Avatar className="size-14">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.fullName?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink-900">{user?.fullName}</p>
              <Badge variant={user?.isPremium ? 'default' : 'neutral'} className="mt-1">
                {user?.isPremium ? 'Premium üzv' : 'Abonə deyilsən'}
              </Badge>
            </div>
          </div>

          <nav className="flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white shadow-card">
            {navItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors',
                    index !== 0 && 'border-t border-ink-100',
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-700 hover:bg-ink-50'
                  )
                }
              >
                <item.icon className="size-4.5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="size-4 text-ink-300" />
              </NavLink>
            ))}
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 border-t border-ink-100 px-4 py-3.5 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50"
            >
              <LogOut className="size-4.5 shrink-0" />
              Hesabdan çıx
            </button>
          </nav>
        </div>

        <div className={cn(isIndex && 'hidden lg:block')}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
