import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { AppSidebar } from '@/components/shared/AppSidebar'
import { Logo } from '@/components/shared/Logo'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { guestAppNavLinks, studentAppNavLinks, type NavLink } from '@/constants/nav'
import { useAuth } from '@/context/AuthContext'

interface AppLayoutProps {
  links?: NavLink[]
}

export function AppLayout({ links }: AppLayoutProps) {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigationLinks = links ?? (isAuthenticated ? studentAppNavLinks : guestAppNavLinks)

  return (
    <div className="flex min-h-screen bg-ink-50/40">
      <aside className="hidden w-[260px] shrink-0 border-r border-ink-100 bg-white lg:block">
        <div className="sticky top-0 h-screen">
          <AppSidebar links={navigationLinks} />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex size-9 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100"
            aria-label="Menyu"
          >
            <Menu className="size-5" />
          </button>
          <Logo />
          <div className="size-9" />
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0 sm:max-w-xs" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Menyu</SheetTitle>
          </SheetHeader>
          <AppSidebar links={navigationLinks} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
