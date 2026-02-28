'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Αρχική' },
  { href: '/ministers', label: 'Υπουργοί' },
  { href: '/governments', label: 'Κυβερνήσεις' },
  { href: '/parties', label: 'Κόμματα' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-[#003087] text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-white/10 text-lg font-bold tracking-tight group-hover:bg-white/20 transition">
              ΕΚ
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-semibold">Ελληνικό Κυβερνητικό</div>
              <div className="text-xs text-blue-200">Αρχείο & Διαφάνεια</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
