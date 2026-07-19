import sharp from 'sharp'

/** Brand palette for generated placeholders. */
const PALETTE = {
  ivory: '#F3EBDD',
  red: '#A92B2E',
  terracotta: '#7D211D',
  sand: '#CBB18B',
  sage: '#7A7B60',
  indigo: '#17253A',
  charcoal: '#2A2723',
}

type Theme = keyof typeof PALETTE

const combos: Record<string, [string, string, string]> = {
  landscape: [PALETTE.sand, PALETTE.ivory, PALETTE.sage],
  astronomy: [PALETTE.indigo, PALETTE.charcoal, PALETTE.sand],
  wildlife: [PALETTE.terracotta, PALETTE.red, PALETTE.sand],
  camp: [PALETTE.sage, PALETTE.ivory, PALETTE.sand],
  dining: [PALETTE.terracotta, PALETTE.ivory, PALETTE.sand],
  people: [PALETTE.charcoal, PALETTE.sand, PALETTE.ivory],
  default: [PALETTE.sage, PALETTE.sand, PALETTE.ivory],
}

/**
 * Generate a tasteful branded gradient placeholder JPEG as a Buffer.
 * Used only for seeding — real photos are uploaded via the admin panel.
 */
export async function placeholderImage(
  label: string,
  variant: keyof typeof combos = 'default',
  width = 1600,
  height = 1067,
): Promise<Buffer> {
  const [c1, c2, c3] = combos[variant] ?? combos.default
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="55%" stop-color="${c2}"/>
          <stop offset="100%" stop-color="${c3}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, serif" font-size="${Math.round(width / 26)}"
        fill="${PALETTE.ivory}" opacity="0.82" letter-spacing="2">${label}</text>
      <text x="50%" y="${height - 40}" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${Math.round(width / 70)}"
        fill="${PALETTE.ivory}" opacity="0.5" letter-spacing="6">CAMP SAMBHAR · SAMBHAR LAKE</text>
    </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer()
}

export { PALETTE, type Theme }
