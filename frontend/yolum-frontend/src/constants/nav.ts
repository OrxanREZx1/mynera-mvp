import type { LucideIcon } from 'lucide-react'
import {
  BookOpenText,
  Gamepad2,
  Home,
  LayoutDashboard,
  MessageSquare,
  Map,
  Star,
  Users,
  Wallet,
  Bell,
  User,
  HelpCircle,
} from 'lucide-react'

export interface NavLink {
  label: string
  href: string
  icon?: LucideIcon
}

export const marketingNavLinks: NavLink[] = [
  { label: 'Necə işləyir', href: '/#how-it-works' },
  { label: 'Xüsusiyyətlər', href: '/#features' },
  { label: 'Qiymət', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
]

export const studentAppNavLinks: NavLink[] = [
  { label: 'Aira ilə söhbət', href: '/chat', icon: MessageSquare },
  { label: 'Yol Xəritəsi', href: '/roadmap', icon: Map },
  { label: 'Mentorlar', href: '/mentors', icon: Users },
  { label: 'Oyunlar', href: '/games', icon: Gamepad2 },
  { label: 'Bloq və Podcast', href: '/blog', icon: BookOpenText },
]

export const guestAppNavLinks: NavLink[] = [
  { label: 'Aira ilə söhbət', href: '/demo', icon: MessageSquare },
  { label: 'Yol Xəritəsi', href: '/demo/roadmap', icon: Map },
  { label: 'Mentorlar', href: '/mentors', icon: Users },
]

export const studentMobileMenuLinks: NavLink[] = [
  { label: 'Yol Xəritəsi', href: '/roadmap', icon: Map },
  { label: 'Bildirişlər', href: '/notifications', icon: Bell },
  { label: 'Oyunlar', href: '/games', icon: Gamepad2 },
  { label: 'Podcast və Bloqlar', href: '/blog', icon: BookOpenText },
  { label: 'Profil', href: '/profile', icon: User },
  { label: 'FAQ', href: '/profile/help', icon: HelpCircle },
]

export const mentorAppNavLinks: NavLink[] = [
  { label: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
  { label: 'Seanslar', href: '/mentor/sessions', icon: Home },
  { label: 'Mesajlar', href: '/mentor/messages', icon: MessageSquare },
  { label: 'Rəylər', href: '/mentor/reviews', icon: Star },
  { label: 'Qazanc', href: '/mentor/earnings', icon: Wallet },
]

export const mentorCategories: { id: string; label: string }[] = [
  { id: 'all', label: 'Hamısı' },
  { id: 'ai-ml', label: 'AI & ML' },
  { id: 'ux-ui', label: 'UX/UI' },
  { id: 'graphic-design', label: 'Graphic Design' },
  { id: 'backend', label: 'Backend' },
  { id: 'data', label: 'Data' },
]
