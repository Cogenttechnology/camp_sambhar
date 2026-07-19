import Link from 'next/link'
import type { SiteSetting } from '../../payload-types'

const EXPLORE = [
  { label: 'Stay', href: '/stay' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Saltbox Café', href: '/cafe' },
  { label: 'Gallery', href: '/gallery' },
]

const ABOUT = [
  { label: 'About Us', href: '/about' },
  { label: 'About Sambhar Lake', href: '/about/sambhar-lake' },
  { label: 'Birds of Sambhar', href: '/birds' },
  { label: 'Sustainability & CSR', href: '/about/sustainability' },
  { label: 'Journal', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const LEGAL = [
  { label: 'Cancellation Policy', href: '/about/cancellation-policy' },
  { label: 'Dog & Pet Policy', href: '/about/pet-policy' },
  { label: 'Do’s and Don’ts', href: '/about/dos-and-donts' },
]

export function Footer({ settings }: { settings: SiteSetting }) {
  const year = 2026
  const socials = settings.socials ?? []

  return (
    <footer className="bg-indigo-900 text-ivory">
      <div className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-[family-name:var(--font-logo)] text-lg font-extrabold tracking-[0.18em] text-ivory">
              {settings.siteName?.toUpperCase() ?? 'CAMP SAMBHAR'}
            </p>
            <p className="mt-4 max-w-xs text-sm text-ivory/70">
              {settings.tagline ?? 'A nature escape on the salt lake.'}
            </p>
          </div>

          <nav aria-label="Explore">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-sand-400">Explore</h3>
            <ul className="mt-4 space-y-2">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ivory/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="About">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-sand-400">Discover</h3>
            <ul className="mt-4 space-y-2">
              {ABOUT.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ivory/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-sand-400">Reach us</h3>
            <ul className="mt-4 space-y-2 text-sm text-ivory/80">
              {settings.address ? <li className="whitespace-pre-line">{settings.address}</li> : null}
              {settings.phone ? (
                <li>
                  <a href={`tel:${settings.phone}`} className="hover:text-white">
                    {settings.phone}
                  </a>
                </li>
              ) : null}
              {settings.email ? (
                <li>
                  <a href={`mailto:${settings.email}`} className="hover:text-white">
                    {settings.email}
                  </a>
                </li>
              ) : null}
            </ul>
            {socials.length > 0 && (
              <ul className="mt-4 flex gap-4">
                {socials.map((s) => (
                  <li key={s.id ?? s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ivory/80 hover:text-white"
                    >
                      {s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-14 border-t border-ivory/15 pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ivory/60">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 text-xs text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} {settings.siteName ?? 'Camp Sambhar Resort'}. All rights reserved.</p>
            <p>Sambhar Lake, Rajasthan · India</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
