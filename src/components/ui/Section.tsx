import { cn } from '../../lib/utils'

type SectionProps = {
  children: React.ReactNode
  className?: string
  /** Background tone. */
  tone?: 'ivory' | 'white' | 'night' | 'sand'
  id?: string
}

const tones: Record<NonNullable<SectionProps['tone']>, string> = {
  ivory: 'bg-blush text-charcoal',
  white: 'bg-white text-charcoal',
  night: 'bg-indigo-900 text-ivory',
  sand: 'bg-sand-400/25 text-charcoal',
}

export function Section({ children, className, tone = 'ivory', id }: SectionProps) {
  return (
    <section id={id} className={cn('py-[var(--spacing-section)]', tones[tone], className)}>
      {children}
    </section>
  )
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('container-page', className)}>{children}</div>
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  className,
}: {
  eyebrow?: string
  title: string
  intro?: string
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div className={cn(align === 'center' && 'mx-auto max-w-2xl text-center', 'max-w-2xl', className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 className="text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">{title}</h2>
      {intro ? <p className="mt-4 text-muted text-lg">{intro}</p> : null}
    </div>
  )
}
