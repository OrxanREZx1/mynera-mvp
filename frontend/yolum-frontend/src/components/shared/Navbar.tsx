import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { marketingNavLinks } from '@/constants/nav'
import { cn } from '@/utils/cn'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-transparent bg-white/80 backdrop-blur-md transition-shadow',
        scrolled && 'border-ink-100 shadow-sm'
      )}
    >
      <div className="container flex h-16 items-center justify-between sm:h-[76px]">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {marketingNavLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-ink-600 transition-colors hover:text-ink-900">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/mentor/signup" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Mentor kimi qoşul
          </Link>
          <Button asChild variant="outline">
            <Link to="/login">Daxil ol</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 lg:hidden"
          aria-label="Menyu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-8 sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>
              <Logo to={null} />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1">
            {marketingNavLinks.map((link) => (
              <SheetClose asChild key={link.href}>
                <a
                  href={link.href}
                  className="rounded-md px-3 py-3 text-base font-medium text-ink-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                >
                  {link.label}
                </a>
              </SheetClose>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            <SheetClose asChild>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Daxil ol</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Link to="/mentor/signup" className="text-center text-sm font-medium text-primary-600">
                Mentor kimi qoşul
              </Link>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
