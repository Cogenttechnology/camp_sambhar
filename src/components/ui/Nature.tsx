import Image from 'next/image'
import { cn } from '../../lib/utils'

/**
 * Shared "nature" design elements — paper texture, topographic pattern,
 * naturalist line-art accents and organic section dividers.
 * Used across every page to give the site a consistent, tactile feel.
 */

/** Warm paper grain overlay. Sits behind content, never intercepts clicks. */
export function PaperTexture({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[url('/textures/paper.png')] bg-[length:640px] bg-repeat mix-blend-multiply"
      style={{ opacity }}
    />
  )
}

/** Faint topographic contour lines — evokes the salt-lake shoreline map. */
export function TopoPattern({
  opacity = 0.06,
  className,
}: {
  opacity?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 bg-[url('/textures/topo.png')] bg-[length:900px] bg-repeat",
        className,
      )}
      style={{ opacity }}
    />
  )
}

type Art =
  | 'flamingo'
  | 'curlew'
  | 'grass'
  | 'salt-crystals'
  | 'constellation'
  | 'acacia-khejri'
  | 'camel'

const ART_SIZE: Record<Art, { w: number; h: number }> = {
  flamingo: { w: 300, h: 450 },
  curlew: { w: 420, h: 300 },
  grass: { w: 360, h: 360 },
  'salt-crystals': { w: 420, h: 280 },
  constellation: { w: 420, h: 300 },
  'acacia-khejri': { w: 440, h: 340 },
  camel: { w: 440, h: 340 },
}

/**
 * A decorative naturalist illustration. Purely ornamental — always aria-hidden.
 * `className` positions it (absolute) and sets its width.
 */
export function ArtAccent({
  art,
  className,
  opacity = 0.7,
  float = true,
  flip = false,
}: {
  art: Art
  className?: string
  opacity?: number
  float?: boolean
  flip?: boolean
}) {
  const { w, h } = ART_SIZE[art]
  return (
    <Image
      src={`/illustrations/${art}.png`}
      alt=""
      aria-hidden
      width={w}
      height={h}
      className={cn(
        'pointer-events-none absolute select-none mix-blend-multiply',
        float && 'float-slow',
        flip && 'scale-x-[-1]',
        className,
      )}
      style={{ opacity }}
    />
  )
}

/**
 * Organic wave divider between sections. `from`/`to` are the section colours
 * it bridges, so the transition reads as one continuous landscape.
 */
export function WaveDivider({
  className,
  fill = 'var(--color-ivory)',
  flip = false,
}: {
  className?: string
  fill?: string
  flip?: boolean
}) {
  return (
    <div aria-hidden className={cn('pointer-events-none relative w-full leading-[0]', className)}>
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className={cn('block h-[60px] w-full sm:h-[90px]', flip && 'rotate-180')}
      >
        <path
          d="M0,42 C180,86 320,4 520,26 C720,48 840,96 1040,74 C1200,56 1320,14 1440,32 L1440,90 L0,90 Z"
          fill={fill}
        />
      </svg>
    </div>
  )
}

/**
 * Hand-drawn botanical border band — desert grass and small birds.
 * Use between sections as a warmer alternative to a plain rule.
 */
export function OrnamentBand({
  className,
  opacity = 0.85,
}: {
  className?: string
  opacity?: number
}) {
  return (
    <div aria-hidden className={cn('pointer-events-none w-full overflow-hidden', className)}>
      <Image
        src="/illustrations/border-ornament.png"
        alt=""
        width={1536}
        height={200}
        className="mx-auto h-16 w-full max-w-5xl object-contain sm:h-20"
        style={{ opacity }}
      />
    </div>
  )
}

/** A small centred ornament to break up long text — three dots and a line. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('flex items-center justify-center gap-3 py-2', className)}>
      <span className="h-px w-14 bg-current opacity-25" />
      <span className="h-1.5 w-1.5 rotate-45 bg-current opacity-50" />
      <span className="h-1 w-1 rotate-45 bg-current opacity-30" />
      <span className="h-1.5 w-1.5 rotate-45 bg-current opacity-50" />
      <span className="h-px w-14 bg-current opacity-25" />
    </div>
  )
}
