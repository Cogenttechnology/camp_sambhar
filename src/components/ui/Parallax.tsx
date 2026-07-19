'use client'

import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * Subtle vertical parallax: moves its child up to `strength` px as the section
 * scrolls through the viewport. rAF-throttled and respects reduced motion.
 * Wrap an absolutely-positioned image; the child gets the `.parallax` transform.
 */
export function Parallax({
  children,
  className,
  strength = 80,
}: {
  children: React.ReactNode
  className?: string
  strength?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // progress: -1 (below viewport) → 1 (above viewport), 0 when centered
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh
      const y = Math.max(-1, Math.min(1, progress)) * strength
      el.style.setProperty('--parallax-y', `${y.toFixed(1)}px`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [strength])

  return (
    <div ref={ref} className={cn('parallax', className)}>
      {children}
    </div>
  )
}
