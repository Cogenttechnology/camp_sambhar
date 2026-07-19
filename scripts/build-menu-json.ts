/** Turn the extracted SaltBox menu text into structured JSON for seeding. */
import fs from 'fs'
import path from 'path'

const SRC = path.resolve(process.cwd(), 'content-extracted/MENU-clean.txt')
const OUT = path.resolve(process.cwd(), 'src/seed/data/menu.json')

type Item = { name: string; price: number; category: string; veg: boolean }

const lines = fs.readFileSync(SRC, 'utf8').split('\n')
const items: Item[] = []
let category = ''
let veg = true

const SKIP = /^(SALT BOX|RESTAURANT MENU|S\.NO\.|### )/i

for (const raw of lines) {
  const line = raw.trim()
  if (!line || SKIP.test(line)) continue

  if (/^VEG MENU$/i.test(line)) { veg = true; continue }
  if (/^NON-?\s*VEG MENU$/i.test(line)) { veg = false; category = ''; continue }

  const cells = line.split('|').map((c) => c.trim()).filter(Boolean)
  if (cells.length < 2) continue

  // Rows look like:  "5 | APPETIZER AND SNACKS | Veg. Pakoda | 180.0"  (category changes)
  //             or:  "6 | Pyaz Pakoda | 150.0"                        (same category)
  const price = Number(cells[cells.length - 1])
  if (!Number.isFinite(price)) continue

  if (cells.length >= 4) {
    category = cells[1]
    items.push({ name: cells[2], price, category, veg })
  } else if (cells.length === 3) {
    // could be "no | name | price" OR a THALIS row "177 | SPECIAL THALI | 499"
    items.push({ name: cells[1], price, category: category || 'Specials', veg })
  }
}

// Tidy category names: Title Case, fix spacing
const tidy = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAnd\b/g, 'and')

const cleaned = items.map((i) => ({ ...i, category: tidy(i.category), name: i.name.replace(/\s+/g, ' ').trim() }))

const categories = [...new Set(cleaned.map((i) => i.category))]
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify({ categories, items: cleaned }, null, 2), 'utf8')

console.log(`items: ${cleaned.length}  (veg ${cleaned.filter((i) => i.veg).length} / non-veg ${cleaned.filter((i) => !i.veg).length})`)
console.log(`categories (${categories.length}):`, categories.join(', '))
console.log('→', OUT)
