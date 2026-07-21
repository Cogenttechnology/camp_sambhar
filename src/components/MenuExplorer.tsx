'use client'

import { useMemo, useState } from 'react'
import { cn } from '../lib/utils'

export type MenuEntry = {
  id: number
  name: string
  price?: string | null
  description?: string | null
  veg: boolean
  signature: boolean
  category: string
}

/**
 * The full SaltBox menu, made browsable: filter by veg/non-veg, jump to a
 * course, or search. Keeps ~200 dishes readable instead of one endless list.
 */
export function MenuExplorer({
  categories,
  items,
}: {
  categories: string[]
  items: MenuEntry[]
}) {
  const [diet, setDiet] = useState<'all' | 'veg' | 'nonveg'>('all')
  const [active, setActive] = useState<string>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      if (diet === 'veg' && !i.veg) return false
      if (diet === 'nonveg' && i.veg) return false
      if (active !== 'All' && i.category !== active) return false
      if (q && !i.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, diet, active, query])

  const grouped = useMemo(() => {
    const map = new Map<string, MenuEntry[]>()
    for (const item of filtered) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return [...map.entries()]
  }, [filtered])

  const visibleCategories = useMemo(() => {
    const present = new Set(
      items
        .filter((i) => (diet === 'all' ? true : diet === 'veg' ? i.veg : !i.veg))
        .map((i) => i.category),
    )
    return categories.filter((c) => present.has(c))
  }, [categories, items, diet])

  return (
    <div>
      {/* Controls */}
      <div className="sticky top-[72px] z-30 -mx-4 mb-10 bg-blush/95 px-4 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          {/* Diet toggle */}
          <div className="inline-flex rounded-full border border-sand-400/60 p-1">
            {([
              ['all', 'All'],
              ['veg', 'Veg'],
              ['nonveg', 'Non-veg'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDiet(value)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  diet === value ? 'bg-red-500 text-white' : 'text-charcoal hover:bg-sand-300/40',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <label className="relative ml-auto w-full max-w-xs">
            <span className="sr-only">Search the menu</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes…"
              className="w-full rounded-full border border-sand-400/60 bg-white px-5 py-2.5 text-sm text-charcoal placeholder:text-muted focus:border-red-500 focus:outline-none"
            />
          </label>
        </div>

        {/* Category chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {['All', ...visibleCategories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors',
                active === cat
                  ? 'bg-charcoal text-ivory'
                  : 'bg-white text-charcoal hover:bg-sand-300/40',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {grouped.length === 0 ? (
        <p className="py-16 text-center text-muted">
          No dishes match that search. Try another name or clear the filters.
        </p>
      ) : (
        <div className="space-y-14">
          {grouped.map(([category, list]) => (
            <section key={category}>
              <h3 className="font-[family-name:var(--font-serif)] text-2xl text-red-600">
                {category}
              </h3>
              <div className="mt-5 grid gap-x-12 gap-y-1 md:grid-cols-2">
                {list.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-baseline gap-3 border-b border-sand-400/25 py-3"
                  >
                    <span
                      aria-label={item.veg ? 'Vegetarian' : 'Non-vegetarian'}
                      title={item.veg ? 'Vegetarian' : 'Non-vegetarian'}
                      className={cn(
                        'mt-1 inline-block h-3 w-3 flex-shrink-0 border',
                        item.veg ? 'border-green-700' : 'border-red-700',
                      )}
                    >
                      <span
                        className={cn(
                          'mx-auto mt-[3px] block h-1.5 w-1.5 rounded-full',
                          item.veg ? 'bg-green-700' : 'bg-red-700',
                        )}
                      />
                    </span>
                    <span className="flex-1 text-charcoal">
                      {item.name}
                      {item.signature && (
                        <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wider text-red-500">
                          Signature
                        </span>
                      )}
                      {item.description ? (
                        <span className="mt-0.5 block text-sm text-muted">{item.description}</span>
                      ) : null}
                    </span>
                    <span className="flex-shrink-0 font-medium text-charcoal">{item.price}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-12 text-sm text-muted">
        Showing {filtered.length} of {items.length} dishes. Prices in INR and subject to change;
        taxes as applicable.
      </p>
    </div>
  )
}
