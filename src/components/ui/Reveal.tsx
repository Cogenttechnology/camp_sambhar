'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale'

/**
 * Fades + moves its children in when scrolled into view.
 * Direction controls the entrance; CSS handles prefers-reduced-motion.
 * Progressive enhancement: without JS the content is simply visible.
 */
export function Reveal({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  delay?: number
  direction?: Direction
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)

    // Safety net: never leave content hidden for more than a moment.
    const failsafe = setTimeout(() => setVisible(true), 1500)

    return () => {
      observer.disconnect()
      clearTimeout(failsafe)
    }
  }, [])

  return (
    <Tag
      ref={ref}
      data-dir={direction}
      className={cn('reveal', visible && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
