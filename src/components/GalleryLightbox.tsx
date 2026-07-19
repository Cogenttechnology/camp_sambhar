'use client'

import { useState, useCallback, useEffect } from 'react'
import { PayloadImage } from './PayloadImage'
import type { Media } from '../payload-types'

type Photo = { image: Media | number; caption?: string | null }

/** Masonry-ish gallery grid with a click-to-open lightbox. */
export function GalleryLightbox({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null)

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(
    () => setIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  )
  const next = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  )

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, close, prev, next])

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {photos.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className="group block w-full overflow-hidden rounded-xl"
            aria-label={`Open image ${i + 1}`}
          >
            <div className="relative">
              <PayloadImage
                media={p.image as never}
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                className="w-full transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-5 top-5 text-ivory/80 hover:text-white"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Previous"
            className="absolute left-4 text-ivory/70 hover:text-white"
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <figure className="max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <PayloadImage media={photos[index].image as never} sizes="90vw" className="max-h-[80vh] w-auto rounded-lg object-contain" />
            {photos[index].caption ? (
              <figcaption className="mt-3 text-center text-sm text-ivory/70">{photos[index].caption}</figcaption>
            ) : null}
          </figure>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Next"
            className="absolute right-4 text-ivory/70 hover:text-white"
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
