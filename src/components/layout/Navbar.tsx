'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '../../lib/utils'

const NAV_LINKS = [
  { label: 'Stay', href: '/stay' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Birds', href: '/birds' },
  { label: 'SaltBox', href: '/cafe' },
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Journal', href: '/blog' },
]

export function Navbar({ siteName = 'CAMP SAMBHAR' }: { siteName?: string }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-300',
        scrolled
          ? 'bg-ivory/95 backdrop-blur border-b border-sand-400/40'
          : 'bg-transparent',
      )}
    >
      <nav className="container-page flex items-center justify-between py-4">
        <Link href="/" className="flex items-center" aria-label={siteName}>
          <Image
            src="/logo.png"
            alt={siteName}
            width={130}
            height={130}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'text-sm font-medium tracking-wide text-charcoal transition-colors hover:text-red-500',
                  pathname.startsWith(link.href) && 'text-red-500',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link
            href="/stay#book"
            className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            Book your stay
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden text-charcoal"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-6 w-6">
            {open ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            )}
          </span>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-ivory border-t border-sand-400/40">
          <ul className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-3 text-base font-medium text-charcoal hover:text-red-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/stay#book"
                className="block rounded-full bg-red-500 px-6 py-3 text-center text-sm font-medium text-white"
              >
                Book your stay
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
