import Link from 'next/link'
import { PayloadImage } from '../PayloadImage'
import { RichText } from '../RichText'
import { Reveal } from '../ui/Reveal'
import type { Page } from '../../payload-types'

type Block = NonNullable<Page['layout']>[number]

/** Renders the page-builder layout blocks composed in the CMS. */
export function RenderBlocks({ blocks }: { blocks?: Page['layout'] }) {
  if (!blocks || blocks.length === 0) return null
  return (
    <>
      {blocks.map((block, i) => (
        <BlockSwitch key={block.id ?? i} block={block} />
      ))}
    </>
  )
}

function BlockSwitch({ block }: { block: Block }) {
  switch (block.blockType) {
    case 'textBlock':
      return (
        <section className="bg-blush py-16">
          <div className="container-page">
            <Reveal className={block.align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
              {block.eyebrow ? <p className="eyebrow mb-3">{block.eyebrow}</p> : null}
              {block.heading ? (
                <h2 className="font-[family-name:var(--font-serif)] text-3xl">{block.heading}</h2>
              ) : null}
              <div className="prose-body mt-4">
                <RichText data={block.content as never} />
              </div>
            </Reveal>
          </div>
        </section>
      )

    case 'imageText':
      return (
        <section className="bg-blush py-16">
          <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal className={block.imageSide === 'right' ? 'lg:order-2' : ''}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <PayloadImage media={block.image as never} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </Reveal>
            <Reveal>
              {block.eyebrow ? <p className="eyebrow mb-3">{block.eyebrow}</p> : null}
              {block.heading ? (
                <h2 className="font-[family-name:var(--font-serif)] text-3xl">{block.heading}</h2>
              ) : null}
              <div className="prose-body mt-4">
                <RichText data={block.content as never} />
              </div>
            </Reveal>
          </div>
        </section>
      )

    case 'stats':
      return (
        <section className="bg-sand-400/25 py-16">
          <div className="container-page">
            {block.heading ? (
              <h2 className="mb-8 text-center font-[family-name:var(--font-serif)] text-3xl">{block.heading}</h2>
            ) : null}
            <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {block.stats?.map((s, i) => (
                <div key={i} className="text-center">
                  <dt className="font-[family-name:var(--font-serif)] text-4xl text-red-600">{s.value}</dt>
                  <dd className="mt-1 text-sm text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )

    case 'galleryBlock':
      return (
        <section className="bg-blush py-16">
          <div className="container-page">
            {block.heading ? (
              <h2 className="mb-6 font-[family-name:var(--font-serif)] text-3xl">{block.heading}</h2>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {block.images?.map((img, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <PayloadImage media={img.image as never} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'quote':
      return (
        <section className="bg-indigo-900 py-20 text-ivory">
          <div className="container-page max-w-3xl text-center">
            <p className="font-[family-name:var(--font-serif)] text-2xl leading-relaxed sm:text-3xl">
              “{block.quote}”
            </p>
            {block.attribution ? (
              <p className="mt-6 text-sm uppercase tracking-widest text-sand-400">{block.attribution}</p>
            ) : null}
          </div>
        </section>
      )

    case 'cta': {
      const tone =
        block.theme === 'night'
          ? 'bg-indigo-900 text-ivory'
          : block.theme === 'sand'
            ? 'bg-sand-400/40 text-charcoal'
            : 'bg-sage-500 text-ivory'
      return (
        <section className={`py-16 ${tone}`}>
          <div className="container-page flex flex-col items-center gap-5 text-center">
            <h2 className="max-w-2xl font-[family-name:var(--font-serif)] text-3xl">{block.heading}</h2>
            {block.subheading ? <p className="max-w-md opacity-90">{block.subheading}</p> : null}
            <Link
              href={block.buttonUrl || '/contact'}
              className="rounded-full bg-red-500 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              {block.buttonLabel || 'Enquire now'}
            </Link>
          </div>
        </section>
      )
    }

    default:
      return null
  }
}
