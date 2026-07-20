import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Settings } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { NavLink } from '@/constants/nav'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'

interface AppSidebarProps {
  links: NavLink[]
  onNavigate?: () => void
}

export function AppSidebar({ links, onNavigate }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between px-1">
        <Logo />
        <RouterNavLink
          to="/notifications"
          onClick={onNavigate}
          className="relative flex size-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
          aria-label="Bildirişlər"
        >
          <Bell className="size-4.5" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger-500" />
        </RouterNavLink>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <RouterNavLink
              key={link.href}
              to={link.href}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                )
              }
            >
              {Icon && <Icon className="size-4.5 shrink-0" />}
              {link.label}
            </RouterNavLink>
          )
        })}
      </nav>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-ink-100"
            >
              <Avatar className="size-9">
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink-800">{user.fullName}</span>
                <span className="block truncate text-xs text-ink-500">{user.email}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <Settings className="size-4" />
              Profil ayarları
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-danger-600 focus:bg-danger-50 focus:text-danger-700"
            >
              <LogOut className="size-4" />
              Hesabdan çıx
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
