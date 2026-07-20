import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { marketingNavLinks } from '@/constants/nav'

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="container grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="text-sm text-ink-500">AI ilə bilikdən karyeraya doğru</p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-ink-800">Sürətli keçidlər</h3>
          <ul className="flex flex-col gap-3 text-sm text-ink-600">
            {marketingNavLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-primary-600">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/mentors" className="transition-colors hover:text-primary-600">
                Mentorlar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-ink-800">AI alətlər</h3>
          <ul className="flex flex-col gap-3 text-sm text-ink-600">
            <li>
              <Link to="/chat" className="transition-colors hover:text-primary-600">
                Aira ilə söhbət
              </Link>
            </li>
            <li>
              <Link to="/roadmap" className="transition-colors hover:text-primary-600">
                Yol Xəritəsi
              </Link>
            </li>
            <li>
              <Link to="/games" className="transition-colors hover:text-primary-600">
                Öyrənmə oyunları
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-ink-800">Bizimlə əlaqə</h3>
          <ul className="flex flex-col gap-3 text-sm text-ink-600">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-ink-400" />
              <a href="mailto:myneraeducation@gmail.com" className="transition-colors hover:text-primary-600">
                myneraeducation@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-ink-400" />
              <span>+994 50 886 57 10</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" />
              <span>Xırdalan, Bakı Mühəndislik Universiteti</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-100">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-500 sm:flex-row">
          <p>Müəllif Hüququ © {new Date().getFullYear()} Yolum IT. Bütün Hüquqlar Qorunur.</p>
          <div className="flex gap-4">
            <Link to="/profile/security" className="hover:text-primary-600">
              Məxfilik Siyasəti
            </Link>
            <Link to="/profile/security" className="hover:text-primary-600">
              Şərtlər və Qaydalar
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
