import { PayloadImage } from '../PayloadImage'
import { Reveal } from '../ui/Reveal'
import { Parallax } from '../ui/Parallax'
import { ArtAccent, PaperTexture, TopoPattern } from '../ui/Nature'
import type { Media } from '../../payload-types'

type Art = 'flamingo' | 'curlew' | 'grass' | 'salt-crystals' | 'constellation' | 'acacia-khejri' | 'camel'

/**
 * Hero for interior pages. With an image it renders full-bleed and parallaxed;
 * without one it falls back to a warm textured band with naturalist line-art,
 * so text-only pages still feel part of the landscape.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  art = 'grass',
}: {
  eyebrow?: string
  title: string
  intro?: string | null
  image?: Media | number | null
  art?: Art
}) {
  const hasImage = image && typeof image !== 'number'

  if (hasImage) {
    return (
      <section className="relative min-h-[58vh] overflow-hidden">
        <Parallax className="absolute inset-0" strength={55}>
          <PayloadImage media={image} fill priority sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/25" />
        <div className="container-page relative flex min-h-[58vh] flex-col justify-end pb-14 pt-32 text-ivory">
          <Reveal>
            {eyebrow ? (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-sand-400">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="max-w-3xl font-[family-name:var(--font-serif)] text-[length:var(--text-hero)] font-medium leading-[var(--text-hero--line-height)]">
              {title}
            </h1>
            {intro ? <p className="mt-5 max-w-xl text-lg text-ivory/85">{intro}</p> : null}
          </Reveal>
        </div>
      </section>
    )
  }

  // Text-only fallback — warm ivory band with texture and a line-art accent.
  return (
    <section className="relative overflow-hidden bg-blush pb-14 pt-36">
      <PaperTexture opacity={0.45} />
      <TopoPattern opacity={0.07} />
      <ArtAccent art={art} className="-right-8 -top-4 hidden w-64 lg:block" opacity={0.4} />
      <ArtAccent art="grass" className="-left-10 bottom-0 hidden w-40 lg:block" opacity={0.3} />
      <div className="container-page relative">
        <Reveal>
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h1 className="max-w-3xl font-[family-name:var(--font-serif)] text-[length:var(--text-hero)] font-medium leading-[var(--text-hero--line-height)]">
            {title}
          </h1>
          {intro ? <p className="mt-5 max-w-xl text-lg text-muted">{intro}</p> : null}
        </Reveal>
      </div>
    </section>
  )
}
