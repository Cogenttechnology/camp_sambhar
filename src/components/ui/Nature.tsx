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

/**
 * The large white flamingo watermark from the client's stationery.
 *
 * Purely decorative and deliberately quiet — it sits behind content at low
 * opacity and is hidden below `lg`, where it would crowd the text rather than
 * frame it. Place it on a section that is `relative overflow-hidden`.
 */
export function FlamingoWatermark({
  className,
  opacity = 0.5,
  flip = false,
}: {
  className?: string
  opacity?: number
  flip?: boolean
}) {
  return (
    <Image
      src="/illustrations/flamingo-solid.png"
      alt=""
      aria-hidden
      width={800}
      height={1200}
      className={cn(
        'pointer-events-none absolute select-none',
        flip && 'scale-x-[-1]',
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
 *
 * The PNGs carry real transparency (see scripts/knockout-illustrations.ts), so
 * `mix-blend-multiply` is only softening the ink into the surface behind it —
 * it is not what makes the background disappear. On a dark section pass
 * `blend="none"` to keep the strokes at full strength.
 */
export function ArtAccent({
  art,
  className,
  opacity = 0.7,
  float = true,
  flip = false,
  blend = 'multiply',
}: {
  art: Art
  className?: string
  opacity?: number
  float?: boolean
  flip?: boolean
  blend?: 'multiply' | 'none'
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
        'pointer-events-none absolute select-none',
        blend === 'multiply' && 'mix-blend-multiply',
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

/**
 * A drop cap for the opening paragraph of a long read. Sets the first letter in
 * the serif face and floats it into the text — an editorial cue that says
 * "essay", not "hotel page".
 */
export function DropCap({ children, className }: { children: string; className?: string }) {
  const [first, ...rest] = children
  return (
    <p className={cn('text-pretty', className)}>
      <span
        aria-hidden
        className="float-left mr-3 mt-1 font-[family-name:var(--font-serif)] text-6xl font-light leading-[0.78] text-red-600"
      >
        {first}
      </span>
      {rest.join('')}
    </p>
  )
}

/**
 * A quiet field-note label — a hairline, a diamond, and small tracked caps.
 * Use above a heading in place of a plain eyebrow.
 */
export function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] opacity-70',
        className,
      )}
    >
      <span aria-hidden className="h-px w-8 bg-current opacity-40" />
      <span aria-hidden className="h-1 w-1 rotate-45 bg-current opacity-60" />
      {children}
    </p>
  )
}

/**
 * A torn-paper edge between sections — softer and more tactile than the wave.
 * `fill` is the colour of the section *below* the tear.
 */
export function TornEdge({
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
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className={cn('block h-[28px] w-full sm:h-[40px]', flip && 'rotate-180')}
      >
        <path
          d="M0,24 L24,17 L52,27 L86,15 L118,25 L150,13 L186,26 L220,18 L256,29 L292,16 L330,27 L368,14 L404,25 L442,19 L478,30 L514,17 L552,26 L590,15 L628,27 L666,20 L704,29 L742,16 L780,25 L818,13 L856,26 L894,18 L932,28 L970,15 L1008,26 L1046,19 L1084,29 L1122,17 L1160,25 L1198,14 L1236,27 L1274,20 L1312,28 L1350,16 L1388,25 L1416,19 L1440,26 L1440,48 L0,48 Z"
          fill={fill}
        />
      </svg>
    </div>
  )
}
